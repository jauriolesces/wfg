/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-split variant. Base: hero.
 * Source: https://www.worldfinancialgroup.com/
 * Selector: #s-banner .organism--hero, .organism--hero
 * Model (hero-split): image (reference) + imageAlt (collapsed) / text (richtext).
 * Output: 1 column, row 1 = image, row 2 = heading + description + CTA.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 1: image
  const img = element.querySelector('.organism--hero--media img, .cell.media img');
  const imageFrag = document.createDocumentFragment();
  if (img) {
    imageFrag.appendChild(document.createComment(' field:image '));
    const picture = img.closest('picture');
    imageFrag.appendChild(picture || img);
  }
  cells.push([imageFrag]);

  // Row 2: text (heading, description, CTA links)
  const copy = element.querySelector('.organism--hero--content-wrapper .molecule--sq-copy')
    || element.querySelector('.cell.copy')
    || element;
  const textFrag = document.createDocumentFragment();
  const heading = copy.querySelector('h1, h2, h3');
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
  cells.push([textFrag]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-split', cells });
  element.replaceWith(block);
}
