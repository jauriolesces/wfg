import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * cards-press: borderless press-release cards. Authored rows: one row per card,
 * [image] [text: heading, teaser, link]. The last link-only paragraph is pinned
 * to the bottom of the card.
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
        div.className = 'cards-press-card-image';
      } else if (div.textContent.trim() === '' && !div.querySelector('a, picture')) {
        div.remove();
      } else {
        div.className = 'cards-press-card-body';
      }
    });
    const body = li.querySelector('.cards-press-card-body');
    if (body) {
      const linkParas = [...body.querySelectorAll(':scope > p')]
        .filter((p) => {
          const a = p.querySelector('a');
          return a && p.textContent.trim() === a.textContent.trim();
        });
      const cta = linkParas[linkParas.length - 1];
      if (cta) cta.classList.add('cards-press-card-cta');
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });

  block.textContent = '';
  block.append(ul);
}
