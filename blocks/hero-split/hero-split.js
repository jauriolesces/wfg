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
    const optimized = createOptimizedPicture(img.src, img.alt, true, [{ width: '1200' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });
}

/**
 * hero-split: solid band with copy on one half and a shaped (hexagon) photo on the other.
 * Authored rows: [image] and [text: heading, paragraph(s), CTA link]. Row order is not assumed:
 * the cell holding a picture becomes the media pane, the rest becomes the content pane.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const media = document.createElement('div');
  media.className = 'hero-split-media';
  const content = document.createElement('div');
  content.className = 'hero-split-content';

  rows.forEach((row) => {
    const cells = [...row.children];
    cells.forEach((cell) => {
      const pic = cell.querySelector('picture');
      const onlyPicture = pic && cell.textContent.trim() === '';
      if (onlyPicture && !media.querySelector('picture')) {
        moveInstrumentation(cell, media);
        media.append(...cell.childNodes);
      } else if (cell.textContent.trim() !== '' || cell.querySelector('picture, a')) {
        moveInstrumentation(cell, content);
        content.append(...cell.childNodes);
      }
    });
  });

  block.textContent = '';
  block.append(content);
  if (media.querySelector('picture')) {
    block.append(media);
  } else {
    block.classList.add('hero-split-no-media');
  }

  optimizeImages(block);
}
