import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * cards-icon: padded tiles, each with a small line icon, heading, description and a
 * bottom-pinned link. Authored rows: one row per card, [icon image] [text].
 * @param {Element} block
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      const onlyPicture = div.querySelector('picture') && div.textContent.trim() === '';
      if (onlyPicture) {
        div.className = 'cards-icon-card-icon';
      } else if (div.textContent.trim() === '' && !div.querySelector('a, picture')) {
        div.remove();
      } else {
        div.className = 'cards-icon-card-body';
      }
    });
    // pin the last link-only paragraph to the bottom of the tile
    const body = li.querySelector('.cards-icon-card-body');
    if (body) {
      const linkParas = [...body.querySelectorAll(':scope > p')]
        .filter((p) => p.querySelector('a') && p.textContent.trim() === p.querySelector('a').textContent.trim());
      const cta = linkParas[linkParas.length - 1];
      if (cta) cta.classList.add('cards-icon-card-cta');
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '200' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });

  block.textContent = '';
  block.append(ul);
}
