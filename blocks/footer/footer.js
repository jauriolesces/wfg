/**
 * Candidate paths for a site fragment (nav/footer), most specific first.
 * On AEM author pages (/content/<site>/...) the fragment is looked up from the current
 * page's folder up to the site root; then /content (local preview) and the site root (EDS).
 * @param {string} name fragment page name
 * @returns {string[]} paths without extension
 */
function fragmentPaths(name) {
  const paths = [];
  const segments = window.location.pathname.split('/').slice(0, -1);
  if (segments[1] === 'content' && segments.length > 2) {
    for (let i = segments.length; i >= 3; i -= 1) paths.push(`${segments.slice(0, i).join('/')}/${name}`);
  }
  paths.push(`/content/${name}`, `/${name}`);
  return paths;
}

/**
 * Fetches the footer fragment from the first candidate path that exists.
 * @returns {Promise<{html: string, base: string}|null>} footer fragment HTML and its URL
 */
async function fetchFooterHtml() {
  // eslint-disable-next-line no-restricted-syntax
  for (const path of fragmentPaths('footer')) {
    // eslint-disable-next-line no-await-in-loop
    const resp = await fetch(`${path}.plain.html`);
    // eslint-disable-next-line no-await-in-loop
    if (resp.ok) return { html: await resp.text(), base: resp.url };
  }
  return null;
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
 * Joins each image paragraph with the link paragraph that follows it
 * (authored as separate image + link components): the image becomes the link content
 * and the link text becomes its accessible label.
 * @param {Element} section fragment section
 */
function linkImages(section) {
  [...section.children].forEach((el) => {
    const pic = el.querySelector('picture, img');
    const next = el.nextElementSibling;
    const link = next && next.querySelector(':scope > a');
    if (!pic || el.querySelector('a') || !link || next.textContent.trim() !== link.textContent.trim()) return;
    link.setAttribute('aria-label', link.textContent.trim());
    link.replaceChildren(pic);
    el.remove();
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
    linkImages(section);
    const type = sectionType(section);
    section.className = `footer-section ${type}`;
    if (type === 'footer-links') {
      section.querySelectorAll(':scope > ul').forEach((ul, i) => {
        ul.className = i === 0 ? 'footer-links-primary' : 'footer-links-secondary';
      });
    }
    if (type === 'footer-social') {
      const list = document.createElement('ul');
      section.querySelectorAll('a').forEach((a) => {
        const img = a.querySelector('img');
        if (img && !a.hasAttribute('aria-label')) a.setAttribute('aria-label', img.alt);
        const li = document.createElement('li');
        li.append(a);
        list.append(li);
      });
      section.replaceChildren(list);
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
