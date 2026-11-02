/**
 * Fetches the footer fragment: /content first (local preview), then site root (DA/EDS).
 * @returns {Promise<{html: string, base: string}|null>} footer fragment HTML and its URL
 */
async function fetchFooterHtml() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: resp.url };
}

/**
 * Resolves image paths in the fragment relative to where the fragment was served.
 * @param {Element} root fragment root
 * @param {string} base base URL of the fragment
 */
function resolveImages(root, base) {
  root.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!/^(https?:|data:|\/)/.test(src)) img.src = new URL(src, base).href;
  });
}

/**
 * Opens external links and documents in a new tab, as on the source site.
 * @param {Element} root footer root
 */
function decorateLinkTargets(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    const url = new URL(a.getAttribute('href'), window.location.href);
    const external = url.hostname !== window.location.hostname;
    if (external || /\.pdf$/i.test(url.pathname)) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
  });
}

/**
 * Classifies a fragment section by its content.
 * @param {Element} section fragment section
 * @returns {string} section class name
 */
function sectionType(section) {
  const links = section.querySelectorAll('a');
  const images = section.querySelectorAll('img');
  if (images.length > 1 && images.length === links.length) return 'footer-social';
  if (images.length === 1 && links.length === 1) return 'footer-brand';
  if (section.querySelector(':scope > ul')) return 'footer-links';
  return links.length ? 'footer-legal' : 'footer-text';
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerFragment = await fetchFooterHtml();
  if (!footerFragment) return;
  const fragment = document.createElement('div');
  fragment.innerHTML = footerFragment.html;
  resolveImages(fragment, footerFragment.base);

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-inner';

  let row;
  [...fragment.querySelectorAll(':scope > div')].forEach((section) => {
    const type = sectionType(section);
    section.className = `footer-section ${type}`;
    if (type === 'footer-links') {
      section.querySelectorAll(':scope > ul').forEach((ul, i) => {
        ul.className = i === 0 ? 'footer-links-primary' : 'footer-links-secondary';
      });
    }
    if (type === 'footer-social') {
      section.querySelectorAll('a').forEach((a) => {
        const img = a.querySelector('img');
        if (img) a.setAttribute('aria-label', img.alt);
      });
    }
    // brand logo and social icons share one row
    if (type === 'footer-brand' || type === 'footer-social') {
      if (!row) {
        row = document.createElement('div');
        row.className = 'footer-row';
        footer.append(row);
      }
      row.append(section);
    } else {
      footer.append(section);
    }
  });

  // the last plain-text section is the page tracking number
  const textSections = footer.querySelectorAll(':scope > .footer-text');
  if (textSections.length > 1) textSections[textSections.length - 1].classList.add('footer-tracking');

  decorateLinkTargets(footer);
  block.append(footer);
}
