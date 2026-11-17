/* eslint-disable */
/* global WebImporter */

import heroSplitParser from './parsers/hero-split.js';
import cardsPressParser from './parsers/cards-press.js';
import wfgCleanupTransformer from './transformers/wfg-cleanup.js';
import wfgSectionsTransformer from './transformers/wfg-sections.js';

const PAGE_TEMPLATE = {
  "name": "press",
  "urls": [
    "https://www.worldfinancialgroup.com/wfg-press"
  ],
  "representativeUrl": "https://www.worldfinancialgroup.com/wfg-press",
  "description": "WFG press / news listing page",
  "blocks": [
    {
      "name": "hero-split",
      "instances": [
        "#s-banner .organism--hero",
        ".organism--hero"
      ]
    },
    {
      "name": "cards-press",
      "instances": [
        ".layout.flexcol-layout"
      ]
    }
  ],
  "urlPattern": "/wfg-press",
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
      "name": "Hero - Newsroom",
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
      "name": "Media relations contact",
      "selector": [
        ".node__content > div.layout:nth-of-type(2)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".organism--sq-text .description"
      ]
    },
    {
      "id": "rc4",
      "name": "Press release cards",
      "selector": [
        ".node__content > div.layout.flexcol-layout",
        ".node__content > div.layout:nth-of-type(3)"
      ],
      "style": null,
      "blocks": [
        "cards-press"
      ],
      "defaultContent": []
    },
    {
      "id": "rc5",
      "name": "View all press releases",
      "selector": [
        ".node__content > div.layout:nth-of-type(4)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "h2#view-all-press-releases",
        ".organism--sq-text .links"
      ]
    }
  ]
};

const parsers = {
  'hero-split': heroSplitParser,
  'cards-press': cardsPressParser,
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
