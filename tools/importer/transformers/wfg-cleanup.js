/* eslint-disable */
/* global WebImporter */

/**
 * World Financial Group (Drupal) cleanup transformer.
 *
 * beforeTransform: remove chrome/blockers that could interfere with block matching.
 *   NOTE: empty .layout spacer divs are NOT removed here, because section selectors use
 *   `.node__content > div.layout:nth-of-type(N)` and removing a div.layout would shift indexes.
 * afterTransform: remove empty spacer layouts and remaining non-authorable leftovers.
 */
function removeAll(root, selectors) {
  selectors.forEach((sel) => {
    root.querySelectorAll(sel).forEach((el) => el.remove());
  });
}

export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    // Trustpilot TrustBox is a cross-origin iframe widget; replace it with an authorable rating link
    // (text as rendered by the widget at migration time)
    element.querySelectorAll('.trustpilot-widget').forEach((widget) => {
      const doc = widget.ownerDocument;
      const p = doc.createElement('p');
      const a = doc.createElement('a');
      a.href = 'https://www.trustpilot.com/review/worldfinancialgroup.com';
      a.textContent = 'Excellent. 4.7 out of 5 based on 265 reviews on Trustpilot';
      p.append(a);
      widget.replaceWith(p);
    });

    removeAll(element, [
      // Skip link
      '#skip-to-content',
      '.skip-to-content-link',
      // Foundation tooltip copies appended to <body> (hidden card disclosure text)
      'div.tooltip[role="tooltip"]',
      // Global header / footer / navigation
      'div.layout-container > header',
      'div.layout-container > footer',
      'header[role="banner"]',
      'footer[role="contentinfo"]',
      'nav',
      '.region-breadcrumb',
      '.breadcrumb',
      'a.skip-link',
      // Cookie banner (OneTrust)
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '#onetrust-pc-sdk',
      '.onetrust-pc-dark-filter',
      // AddToAny share widget
      '#addtoany',
      '.a2a_kit',
      '.addtoany_list',
      // Imperva / Incapsula / hCaptcha artifacts
      'iframe#main-iframe',
      'iframe[src*="_Incapsula_Resource"]',
      'iframe[src*="hcaptcha"]',
      '[id^="incapsula"]',
      '.h-captcha',
      // Drupal layout-builder scheduling overlay (empty <p>)
      '.scheduling-overlay',
      // Card tooltip disclosures: hidden tooltip text + empty icon trigger (not visible content)
      '.disclosure-wrapper.atom--sq-tooltip',
      '.tooltip-admin-hidden',
      // Non-content
      'script',
      'style',
      'noscript',
      'link',
    ]);
  }

  if (hookName === 'afterTransform') {
    // Empty / hidden spacer layouts (e.g. trailing empty .onecol-layout, .onecol-layout.hidden)
    element.querySelectorAll('div.layout.onecol-layout.hidden').forEach((el) => el.remove());
    element.querySelectorAll('div.layout').forEach((el) => {
      if (!el.textContent.trim() && !el.querySelector('img, picture, video, iframe, table, hr')) {
        el.remove();
      }
    });

    removeAll(element, ['iframe', 'source']);

    // Strip tracking / framework attributes
    element.querySelectorAll('*').forEach((el) => {
      ['data-once', 'data-drupal-selector', 'data-history-node-id', 'onclick', 'aria-describedby', 'fetchpriority'].forEach((attr) => {
        if (el.hasAttribute(attr)) el.removeAttribute(attr);
      });
    });
  }
}
