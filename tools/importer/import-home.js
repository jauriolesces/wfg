/* eslint-disable */
/* global WebImporter */

import heroSplitParser from './parsers/hero-split.js';
import columnsImageTextParser from './parsers/columns-image-text.js';
import cardsIconParser from './parsers/cards-icon.js';
import cardsLogoParser from './parsers/cards-logo.js';
import wfgCleanupTransformer from './transformers/wfg-cleanup.js';
import wfgSectionsTransformer from './transformers/wfg-sections.js';

const PAGE_TEMPLATE = {
  "name": "home",
  "urls": [
    "https://www.worldfinancialgroup.com/"
  ],
  "representativeUrl": "https://www.worldfinancialgroup.com/",
  "description": "WFG homepage: hero, image-text columns, solution icon cards, partner logo grids",
  "blocks": [
    {
      "name": "hero-split",
      "instances": [
        "#s-banner .organism--hero",
        ".organism--hero"
      ]
    },
    {
      "name": "columns-image-text",
      "instances": [
        ".organism--sq-image-text"
      ]
    },
    {
      "name": "cards-icon",
      "instances": [
        ".layout.threecol-layout"
      ]
    },
    {
      "name": "cards-logo",
      "instances": [
        ".layout.flexcol-layout"
      ]
    }
  ],
  "urlPattern": "/",
  "sections": [
    {
      "id": "rc1",
      "name": "Trustpilot rating bar",
      "selector": [
        ".region-highlighted"
      ],
      "style": "warm-grey, centered",
      "blocks": [],
      "defaultContent": [
        ".region-highlighted p"
      ]
    },
    {
      "id": "rc2",
      "name": "Hero - Forward with financial stability",
      "selector": [
        "#s-banner"
      ],
      "style": "sky-blue",
      "blocks": [
        "hero-split"
      ],
      "defaultContent": []
    },
    {
      "id": "rc3",
      "name": "Pursue financial security",
      "selector": [
        ".node__content > div.layout:nth-of-type(2)"
      ],
      "style": null,
      "blocks": [
        "columns-image-text"
      ],
      "defaultContent": []
    },
    {
      "id": "rc4",
      "name": "Solution cards",
      "selector": [
        ".node__content > div.layout.threecol-layout",
        ".node__content > div.layout:nth-of-type(3)"
      ],
      "style": null,
      "blocks": [
        "cards-icon"
      ],
      "defaultContent": []
    },
    {
      "id": "rc5",
      "name": "Strategies for every season in life",
      "selector": [
        ".node__content > div.layout:nth-of-type(4)"
      ],
      "style": null,
      "blocks": [
        "columns-image-text"
      ],
      "defaultContent": []
    },
    {
      "id": "rc6",
      "name": "United States heading",
      "selector": [
        ".node__content > div.layout:nth-of-type(5)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "h2#united-states"
      ]
    },
    {
      "id": "rc7",
      "name": "United States partner logos",
      "selector": [
        ".node__content > div.layout:nth-of-type(6)"
      ],
      "style": null,
      "blocks": [
        "cards-logo"
      ],
      "defaultContent": []
    },
    {
      "id": "rc8",
      "name": "Canada heading",
      "selector": [
        ".node__content > div.layout:nth-of-type(8)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "h2#canada"
      ]
    },
    {
      "id": "rc9",
      "name": "Canada partner logos",
      "selector": [
        ".node__content > div.layout:nth-of-type(9)"
      ],
      "style": null,
      "blocks": [
        "cards-logo"
      ],
      "defaultContent": []
    },
    {
      "id": "rc10",
      "name": "Partner locations footnote",
      "selector": [
        ".node__content > div.layout:nth-of-type(10)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".organism--sq-text .description"
      ]
    },
    {
      "id": "rc11",
      "name": "Build a business with WFG",
      "selector": [
        ".node__content > div.layout:nth-of-type(11)"
      ],
      "style": "green",
      "blocks": [
        "columns-image-text"
      ],
      "defaultContent": []
    },
    {
      "id": "rc12",
      "name": "Start your journey to independence",
      "selector": [
        ".node__content > div.layout:nth-of-type(12)"
      ],
      "style": null,
      "blocks": [
        "columns-image-text"
      ],
      "defaultContent": []
    }
  ]
};

const parsers = {
  'hero-split': heroSplitParser,
  'columns-image-text': columnsImageTextParser,
  'cards-icon': cardsIconParser,
  'cards-logo': cardsLogoParser,
};

const transformers = [wfgCleanupTransformer, wfgSectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
