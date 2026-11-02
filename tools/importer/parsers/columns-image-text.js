/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-image-text variant. Base: columns.
 * Source: https://www.worldfinancialgroup.com/
 * Selector: .organism--sq-image-text
 * Model: columns (xwalk Columns block -> no field hints).
 * Output: 1 row x 2 columns, preserving source cell order (image-left or image-right).
 * A media cell with no <img> (CSS-only hexagon shape) is left empty.
 */
function buildMediaCell(cell, document) {
  const img = cell.querySelector('img');
  if (!img) return '';
  const picture = img.closest('picture');
  return picture || img;
}

function buildCopyCell(cell, document) {
  const copy = cell.querySelector('.molecule--sq-copy') || cell;
  const content = [];

  const heading = copy.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) content.push(heading);

  const description = copy.querySelector(':scope > .description');
  if (description) {
    const blocks = Array.from(description.querySelectorAll('p, ul, ol'))
      .filter((el) => !el.parentElement.closest('ul, ol'));
    if (blocks.length) {
      content.push(...blocks);
    } else if (description.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      content.push(p);
    }
  }

  copy.querySelectorAll(':scope > .links a').forEach((a) => {
    const p = document.createElement('p');
    p.appendChild(a);
    content.push(p);
  });

  return content.length ? content : '';
}

export default function parse(element, { document }) {
  const sourceCells = Array.from(element.querySelectorAll(':scope > .cell'));

  const row = sourceCells.map((cell) => {
    if (cell.classList.contains('media')) return buildMediaCell(cell, document);
    return buildCopyCell(cell, document);
  });

  // Always emit exactly two columns.
  while (row.length < 2) row.push('');

  const cells = [row.slice(0, 2)];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-image-text', cells });
  element.replaceWith(block);
}
