// media query match that indicates desktop width
const isDesktop = window.matchMedia('(width >= 900px)');

/**
 * Fetches the nav fragment: /content first (local preview), then site root (DA/EDS).
 * @returns {Promise<{html: string, base: string}|null>} nav fragment HTML and its URL
 */
async function fetchNavHtml() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
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

function closeAllDropdowns(nav, except) {
  nav.querySelectorAll('.nav-drop-trigger[aria-expanded="true"]').forEach((trigger) => {
    if (trigger !== except) trigger.setAttribute('aria-expanded', 'false');
  });
}

function closeSearch(nav) {
  const toggle = nav.querySelector('.nav-search-toggle');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
  const tools = nav.querySelector('.nav-tools');
  if (tools) tools.classList.remove('search-open');
}

function updateOverlay(nav) {
  const open = !!nav.querySelector('.nav-drop-trigger[aria-expanded="true"]');
  nav.classList.toggle('overlay-visible', open && isDesktop.matches);
}

function closeEverything(nav) {
  closeAllDropdowns(nav);
  closeSearch(nav);
  updateOverlay(nav);
}

/**
 * Toggles the mobile menu.
 * @param {Element} nav nav element
 * @param {boolean} [force] force expanded state
 */
function toggleMenu(nav, force) {
  const expanded = force !== undefined ? !force : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  document.body.style.overflowY = (!expanded && !isDesktop.matches) ? 'hidden' : '';
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

/**
 * Builds the utility row (languages + call-to-action buttons).
 * @param {Element} section fragment section
 */
function buildUtility(section) {
  const utility = document.createElement('div');
  utility.className = 'nav-utility';
  const [langList, ctaList] = section.querySelectorAll(':scope > ul');
  if (langList) {
    const langs = document.createElement('div');
    langs.className = 'nav-languages';
    langList.querySelectorAll('a').forEach((a, i) => {
      const path = new URL(a.href, window.location.href).pathname;
      if (path === window.location.pathname || (i === 0 && !langList.querySelector('[aria-current]'))) {
        a.setAttribute('aria-current', 'page');
      }
    });
    langs.append(langList);
    utility.append(langs);
  }
  if (ctaList) {
    const ctas = document.createElement('div');
    ctas.className = 'nav-ctas';
    ctaList.querySelectorAll('a').forEach((a) => {
      const wrapper = a.parentElement;
      a.classList.add('button', wrapper.tagName === 'STRONG' ? 'primary' : 'secondary');
      if (wrapper.tagName === 'STRONG' || wrapper.tagName === 'EM') wrapper.replaceWith(a);
    });
    ctas.append(ctaList);
    utility.append(ctas);
  }
  return utility;
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
 * Builds the brand (logo) area.
 * @param {Element} section fragment section
 */
function buildBrand(section) {
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  linkImages(section);
  const link = section.querySelector('a');
  if (link) brand.append(link);
  else brand.append(...section.childNodes);
  return brand;
}

/**
 * Builds the main navigation with click-toggled dropdowns.
 * @param {Element} section fragment section
 * @param {Element} nav nav element
 */
function buildSections(section, nav) {
  const sections = document.createElement('div');
  sections.className = 'nav-sections';
  const list = section.querySelector(':scope > ul');
  if (!list) return sections;
  list.querySelectorAll(':scope > li').forEach((li, i) => {
    const sub = li.querySelector(':scope > ul');
    if (!sub) return;
    li.classList.add('nav-drop');
    const label = [...li.childNodes]
      .filter((n) => n !== sub)
      .map((n) => n.textContent).join(' ').trim();
    [...li.childNodes].forEach((n) => { if (n !== sub) n.remove(); });
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'nav-drop-trigger';
    trigger.textContent = label;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', `nav-drop-${i}`);
    sub.id = `nav-drop-${i}`;
    sub.querySelectorAll('a').forEach((a) => a.classList.add('nav-drop-link'));
    const count = sub.querySelectorAll(':scope > li').length;
    sub.style.setProperty('--nav-drop-rows', count > 4 ? Math.ceil(count / 2) : count);
    li.prepend(trigger);
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      closeAllDropdowns(nav, trigger);
      closeSearch(nav);
      trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      updateOverlay(nav);
    });
  });
  sections.append(list);
  return sections;
}

/**
 * Builds the search toggle and its dropdown search form.
 * @param {Element} section fragment section
 * @param {Element} nav nav element
 */
function buildTools(section, nav) {
  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  const link = section.querySelector('a');
  if (!link) return tools;
  const label = link.textContent.trim();

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'nav-search-toggle';
  toggle.setAttribute('aria-label', label);
  toggle.setAttribute('aria-expanded', 'false');

  const panel = document.createElement('div');
  panel.className = 'nav-search-panel';
  const form = document.createElement('form');
  form.action = new URL(link.href, window.location.href).pathname;
  form.method = 'get';
  form.setAttribute('role', 'search');
  const field = document.createElement('div');
  field.className = 'nav-search-field';
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'nav-search-submit';
  submit.setAttribute('aria-label', label);
  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'keyword';
  input.placeholder = label;
  input.setAttribute('aria-label', label);
  input.maxLength = 128;
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'nav-search-close';
  close.setAttribute('aria-label', 'Close search bar');
  field.append(submit, input, close);
  form.append(field);
  panel.append(form);

  panel.id = 'nav-search-panel';
  toggle.setAttribute('aria-controls', panel.id);
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    closeAllDropdowns(nav);
    updateOverlay(nav);
    toggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    tools.classList.toggle('search-open', !expanded);
    if (!expanded) input.focus();
  });
  close.addEventListener('click', () => {
    closeSearch(nav);
    toggle.focus();
  });

  tools.append(panel, toggle);
  return tools;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navFragment = await fetchNavHtml();
  if (!navFragment) return;
  const fragment = document.createElement('div');
  fragment.innerHTML = navFragment.html;
  resolveImages(fragment, navFragment.base);

  const [utilitySection, brandSection, navSection, toolsSection] = fragment.querySelectorAll(':scope > div');

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');

  const main = document.createElement('div');
  main.className = 'nav-main';

  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.querySelector('button').addEventListener('click', () => toggleMenu(nav));

  if (brandSection) main.append(buildBrand(brandSection));
  if (navSection) main.append(buildSections(navSection, nav));
  if (toolsSection) main.append(buildTools(toolsSection, nav));
  main.append(hamburger);

  if (utilitySection) nav.append(buildUtility(utilitySection));
  nav.append(main);

  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.addEventListener('click', () => closeEverything(nav));
  nav.append(overlay);

  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeEverything(nav);
  });
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    if (nav.querySelector('.nav-drop-trigger[aria-expanded="true"], .nav-search-toggle[aria-expanded="true"]')) {
      closeEverything(nav);
    } else if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
    }
  });

  isDesktop.addEventListener('change', () => {
    closeEverything(nav);
    toggleMenu(nav, false);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
