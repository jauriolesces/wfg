/* eslint-disable */
/* global WebImporter */

/**
 * World Financial Group sections transformer.
 *
 * beforeTransform: insert <hr> section breaks (reverse order, while the original
 *   section elements still exist). Styled sections get a temporary marker on their <hr>;
 *   a styled first section gets a temporary marked <hr> that is removed later.
 * afterTransform: insert Section Metadata after each marker, then clean markers up.
 */
const MARKER = 'data-excat-section-id';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const el = root.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector; try next
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const template = payload && payload.template;
  const sections = template && template.sections;
  if (!sections || sections.length < 2) return;
  const doc = element.ownerDocument || document;

  if (hookName === 'beforeTransform') {
    // Resolve all elements first so inserted <hr>s cannot affect selector matching.
    const resolved = sections.map((section) => findSectionElement(element, section));
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = resolved[i];
      if (!el || !el.parentNode) continue;
      if (i === 0 && !section.style) continue;
      const hr = doc.createElement('hr');
      if (section.style) hr.setAttribute(MARKER, section.id);
      el.parentNode.insertBefore(hr, el);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;
      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      const metadata = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
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
