/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-logo variant. Base: cards.
 * Source: https://www.worldfinancialgroup.com/
 * Selector: .layout.flexcol-layout
 * Model: container (cards-logo) with cards-logo-card items: image (reference), text (richtext).
 * Output: one row per .organism--media logo -> [logo image, empty text cell].
 * Source logos carry no text, so the text cell stays empty (no field hint).
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.organism--media'));
  const cells = [];

  items.forEach((item) => {
    const img = item.querySelector('img');
    if (!img) return;

    const imageFrag = document.createDocumentFragment();
    imageFrag.appendChild(document.createComment(' field:image '));
    imageFrag.appendChild(img.closest('picture') || img);

    cells.push([imageFrag, '']);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-logo', cells });
  element.replaceWith(block);
}
