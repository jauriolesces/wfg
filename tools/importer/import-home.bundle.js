/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-split.js
  function parse(element, { document: document2 }) {
    const cells = [];
    const img = element.querySelector(".organism--hero--media img, .cell.media img");
    const imageFrag = document2.createDocumentFragment();
    if (img) {
      imageFrag.appendChild(document2.createComment(" field:image "));
      const picture = img.closest("picture");
      imageFrag.appendChild(picture || img);
    }
    cells.push([imageFrag]);
    const copy = element.querySelector(".organism--hero--content-wrapper .molecule--sq-copy") || element.querySelector(".cell.copy") || element;
    const textFrag = document2.createDocumentFragment();
    const heading = copy.querySelector("h1, h2, h3");
    const description = copy.querySelector(":scope > .description");
    const links = Array.from(copy.querySelectorAll(":scope > .links a"));
    if (heading || description || links.length) {
      textFrag.appendChild(document2.createComment(" field:text "));
      if (heading) textFrag.appendChild(heading);
      if (description) {
        const paras = Array.from(description.querySelectorAll("p"));
        if (paras.length) {
          paras.forEach((p) => textFrag.appendChild(p));
        } else if (description.textContent.trim()) {
          const p = document2.createElement("p");
          p.textContent = description.textContent.trim();
          textFrag.appendChild(p);
        }
      }
      links.forEach((a) => {
        const p = document2.createElement("p");
        p.appendChild(a);
        textFrag.appendChild(p);
      });
    }
    cells.push([textFrag]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-split", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-image-text.js
  function buildMediaCell(cell, document2) {
    const img = cell.querySelector("img");
    if (!img) return "";
    const picture = img.closest("picture");
    return picture || img;
  }
  function buildCopyCell(cell, document2) {
    const copy = cell.querySelector(".molecule--sq-copy") || cell;
    const content = [];
    const heading = copy.querySelector("h1, h2, h3, h4, h5, h6");
    if (heading) content.push(heading);
    const description = copy.querySelector(":scope > .description");
    if (description) {
      const blocks = Array.from(description.querySelectorAll("p, ul, ol")).filter((el) => !el.parentElement.closest("ul, ol"));
      if (blocks.length) {
        content.push(...blocks);
      } else if (description.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = description.textContent.trim();
        content.push(p);
      }
    }
    copy.querySelectorAll(":scope > .links a").forEach((a) => {
      const p = document2.createElement("p");
      p.appendChild(a);
      content.push(p);
    });
    return content.length ? content : "";
  }
  function parse2(element, { document: document2 }) {
    const sourceCells = Array.from(element.querySelectorAll(":scope > .cell"));
    const row = sourceCells.map((cell) => {
      if (cell.classList.contains("media")) return buildMediaCell(cell, document2);
      return buildCopyCell(cell, document2);
    });
    while (row.length < 2) row.push("");
    const cells = [row.slice(0, 2)];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-image-text", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-icon.js
  function parse3(element, { document: document2 }) {
    const cards = Array.from(element.querySelectorAll(".organism--sq-card"));
    const cells = [];
    cards.forEach((card) => {
      const imageFrag = document2.createDocumentFragment();
      const img = card.querySelector(".organism--card--media img, .image-container img");
      if (img) {
        imageFrag.appendChild(document2.createComment(" field:image "));
        imageFrag.appendChild(img.closest("picture") || img);
      }
      const textFrag = document2.createDocumentFragment();
      const copy = card.querySelector(".organism--card--copy") || card;
      const heading = copy.querySelector("h1, h2, h3, h4, h5, h6");
      const description = copy.querySelector(":scope > .description");
      const links = Array.from(copy.querySelectorAll(":scope > .links a"));
      if (heading || description || links.length) {
        textFrag.appendChild(document2.createComment(" field:text "));
        if (heading) textFrag.appendChild(heading);
        if (description) {
          const paras = Array.from(description.querySelectorAll("p"));
          if (paras.length) {
            paras.forEach((p) => textFrag.appendChild(p));
          } else if (description.textContent.trim()) {
            const p = document2.createElement("p");
            p.textContent = description.textContent.trim();
            textFrag.appendChild(p);
          }
        }
        links.forEach((a) => {
          const p = document2.createElement("p");
          p.appendChild(a);
          textFrag.appendChild(p);
        });
      }
      cells.push([imageFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-icon", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-logo.js
  function parse4(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(".organism--media"));
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector("img");
      if (!img) return;
      const imageFrag = document2.createDocumentFragment();
      imageFrag.appendChild(document2.createComment(" field:image "));
      imageFrag.appendChild(img.closest("picture") || img);
      cells.push([imageFrag, ""]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-logo", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wfg-cleanup.js
  function removeAll(root, selectors) {
    selectors.forEach((sel) => {
      root.querySelectorAll(sel).forEach((el) => el.remove());
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      element.querySelectorAll(".trustpilot-widget").forEach((widget) => {
        const doc = widget.ownerDocument;
        const p = doc.createElement("p");
        const a = doc.createElement("a");
        a.href = "https://www.trustpilot.com/review/worldfinancialgroup.com";
        a.textContent = "Excellent. 4.7 out of 5 based on 265 reviews on Trustpilot";
        p.append(a);
        widget.replaceWith(p);
      });
      removeAll(element, [
        // Skip link
        "#skip-to-content",
        ".skip-to-content-link",
        // Foundation tooltip copies appended to <body> (hidden card disclosure text)
        'div.tooltip[role="tooltip"]',
        // Global header / footer / navigation
        "div.layout-container > header",
        "div.layout-container > footer",
        'header[role="banner"]',
        'footer[role="contentinfo"]',
        "nav",
        ".region-breadcrumb",
        ".breadcrumb",
        "a.skip-link",
        // Cookie banner (OneTrust)
        "#onetrust-consent-sdk",
        "#onetrust-banner-sdk",
        "#onetrust-pc-sdk",
        ".onetrust-pc-dark-filter",
        // AddToAny share widget
        "#addtoany",
        ".a2a_kit",
        ".addtoany_list",
        // Imperva / Incapsula / hCaptcha artifacts
        "iframe#main-iframe",
        'iframe[src*="_Incapsula_Resource"]',
        'iframe[src*="hcaptcha"]',
        '[id^="incapsula"]',
        ".h-captcha",
        // Drupal layout-builder scheduling overlay (empty <p>)
        ".scheduling-overlay",
        // Card tooltip disclosures: hidden tooltip text + empty icon trigger (not visible content)
        ".disclosure-wrapper.atom--sq-tooltip",
        ".tooltip-admin-hidden",
        // Non-content
        "script",
        "style",
        "noscript",
        "link"
      ]);
    }
    if (hookName === "afterTransform") {
      element.querySelectorAll("div.layout.onecol-layout.hidden").forEach((el) => el.remove());
      element.querySelectorAll("div.layout").forEach((el) => {
        if (!el.textContent.trim() && !el.querySelector("img, picture, video, iframe, table, hr")) {
          el.remove();
        }
      });
      removeAll(element, ["iframe", "source"]);
      element.querySelectorAll("*").forEach((el) => {
        ["data-once", "data-drupal-selector", "data-history-node-id", "onclick", "aria-describedby", "fetchpriority"].forEach((attr) => {
          if (el.hasAttribute(attr)) el.removeAttribute(attr);
        });
      });
    }
  }

  // tools/importer/transformers/wfg-sections.js
  var MARKER = "data-excat-section-id";
  function findSectionElement(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const template = payload && payload.template;
    const sections = template && template.sections;
    if (!sections || sections.length < 2) return;
    const doc = element.ownerDocument || document;
    if (hookName === "beforeTransform") {
      const resolved = sections.map((section) => findSectionElement(element, section));
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = resolved[i];
        if (!el || !el.parentNode) continue;
        if (i === 0 && !section.style) continue;
        const hr = doc.createElement("hr");
        if (section.style) hr.setAttribute(MARKER, section.id);
        el.parentNode.insertBefore(hr, el);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        const metadata = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        if (marker) {
          marker.after(metadata);
          if (i === 0) {
            marker.remove();
          } else {
            marker.removeAttribute(MARKER);
          }
        } else {
          const el = findSectionElement(element, section);
          if (el) el.after(metadata);
        }
      }
    }
  }

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
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
  var parsers = {
    "hero-split": parse,
    "columns-image-text": parse2,
    "cards-icon": parse3,
    "cards-logo": parse4
  };
  var transformers = [transform, transform2];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        document2.querySelectorAll(selector).forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document: document2, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document2.createElement("hr"));
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
