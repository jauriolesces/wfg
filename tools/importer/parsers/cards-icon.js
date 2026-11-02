/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-icon variant. Base: cards.
 * Source: https://www.worldfinancialgroup.com/
 * Selector: .layout.threecol-layout
 * Model: container (cards-icon) with cards-icon-card items: image (reference), text (richtext).
 * Output: one row per .organism--sq-card -> [icon image, heading + description + CTA].
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('.organism--sq-card'));
  const cells = [];

  cards.forEach((card) => {
    // Column 1: icon image
    const imageFrag = document.createDocumentFragment();
    const img = card.querySelector('.organism--card--media img, .image-container img');
    if (img) {
      imageFrag.appendChild(document.createComment(' field:image '));
      imageFrag.appendChild(img.closest('picture') || img);
    }

    // Column 2: heading, description, CTA
    const textFrag = document.createDocumentFragment();
    const copy = card.querySelector('.organism--card--copy') || card;
    const heading = copy.querySelector('h1, h2, h3, h4, h5, h6');
    const description = copy.querySelector(':scope > .description');
    const links = Array.from(copy.querySelectorAll(':scope > .links a'));

    if (heading || description || links.length) {
      textFrag.appendChild(document.createComment(' field:text '));
      if (heading) textFrag.appendChild(heading);
      if (description) {
        const paras = Array.from(description.querySelectorAll('p'));
        if (paras.length) {
          paras.forEach((p) => textFrag.appendChild(p));
        } else if (description.textContent.trim()) {
          const p = document.createElement('p');
          p.textContent = description.textContent.trim();
          textFrag.appendChild(p);
        }
      }
      links.forEach((a) => {
        const p = document.createElement('p');
        p.appendChild(a);
        textFrag.appendChild(p);
      });
    }

    cells.push([imageFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-icon', cells });
  element.replaceWith(block);
}
