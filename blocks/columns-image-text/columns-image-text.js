import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Optimize same-origin, non-SVG images only; external or SVG images keep the authored picture.
 * @param {Element} scope
 */
function optimizeImages(scope) {
  scope.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });
}

/**
 * A cell is the media cell when it holds only a picture, or nothing at all
 * (an empty cell renders as a decorative CSS shape).
 * @param {Element} cell
 */
function isMediaCell(cell) {
  return cell.textContent.trim() === '';
}

/**
 * columns-image-text: one row of two cells, a 1/3 media cell and a 2/3 copy cell.
 * Cell order follows authoring (media left or media right); an empty media cell is a CSS shape.
 * @param {Element} block
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-image-text-row');
    const cells = [...row.children];
    let mediaIndex = -1;
    cells.forEach((cell, i) => {
      if (mediaIndex === -1 && isMediaCell(cell)) {
        mediaIndex = i;
        cell.classList.add('columns-image-text-media');
        if (!cell.querySelector('picture, img')) {
          cell.classList.add('columns-image-text-shape');
          cell.setAttribute('aria-hidden', 'true');
        }
      } else {
        cell.classList.add('columns-image-text-content');
      }
    });
    if (mediaIndex === 0) row.classList.add('columns-image-text-media-left');
    else if (mediaIndex > 0) row.classList.add('columns-image-text-media-right');
  });

  // keep instrumentation intact on rows/cells; only swap images
  block.querySelectorAll('.columns-image-text-media picture').forEach((pic) => {
    const parent = pic.parentElement;
    if (parent && parent.tagName === 'P' && parent.children.length === 1) {
      moveInstrumentation(parent, pic);
      parent.replaceWith(pic);
    }
  });

  optimizeImages(block);
}
