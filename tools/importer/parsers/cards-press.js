/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-press variant. Base: cards.
 * Source: https://www.worldfinancialgroup.com/wfg-press
 * Selector: .layout.flexcol-layout
 * Model: container (cards-press) with cards-press-card items: image (reference), imageAlt (collapsed), text (richtext).
 * Output: one row per .organism--sq-card -> [4:3 photo, h3 headline + teaser + "Read the press release" link].
 */
export default function parse(element, { document }) {
  const cards = Array.from(element.querySelectorAll('.organism--sq-card'));
  const cells = [];

  cards.forEach((card) => {
    // Column 1: press photo (4:3)
    const imageFrag = document.createDocumentFragment();
    const img = card.querySelector('.image-container img') || card.querySelector('picture img, img');
    if (img) {
      imageFrag.appendChild(document.createComment(' field:image '));
      imageFrag.appendChild(img.closest('picture') || img);
    }

    // Column 2: headline, teaser, CTA
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-press', cells });
  element.replaceWith(block);
}
