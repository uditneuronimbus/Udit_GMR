import { getMetadata } from '../../scripts/aem.js';
import { fetchPlaceholders } from '../../scripts/placeholders.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Extract visible label from nav item
 */
function getDirectTextContent(li) {
  const link = li.querySelector(':scope > a');
  if (link) return link.textContent.trim();

  const button = li.querySelector(':scope > button');
  if (button) return button.textContent.trim();

  return Array.from(li.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ')
    .trim();
}

/**
 * Build breadcrumb data from nav fragment
 */
async function buildBreadcrumbsFromNav(nav, currentUrl) {
  const crumbs = [];

  const homeUrl =
    nav.querySelector('a[href="/"]')?.href ||
    `${window.location.origin}/`;

  let activeLink = Array.from(nav.querySelectorAll('a'))
    .find((a) => a.href === currentUrl);

  if (activeLink) {
    let li = activeLink.closest('li');

    while (li) {
      const link = li.querySelector(':scope > a');
      crumbs.unshift({
        title: getDirectTextContent(li),
        url: link ? link.href : null,
      });
      li = li.closest('ul')?.closest('li');
    }
  } else if (currentUrl !== homeUrl) {
    crumbs.unshift({
      title: getMetadata('og:title') || document.title,
      url: currentUrl,
    });
  }

  const placeholders = await fetchPlaceholders();
  const homeLabel = placeholders.breadcrumbsHomeLabel || 'Home';

  crumbs.unshift({ title: homeLabel, url: homeUrl });

  // current page
  crumbs[crumbs.length - 1].url = null;
  crumbs[crumbs.length - 1]['aria-current'] = 'page';

  return crumbs;
}

export default async function decorate(block) {
  // hide on homepage
  if (window.location.pathname === '/' || window.location.pathname === '') {
    block.remove();
    return;
  }

  // load nav fragment directly (EDS best practice)
  const navMeta = getMetadata('nav');
  const navPath = navMeta
    ? new URL(navMeta, window.location).pathname
    : '/nav';

  const navFragment = await loadFragment(navPath);
  if (!navFragment) {
    block.remove();
    return;
  }

  const navSections = navFragment.querySelector('.nav-sections');
  if (!navSections) {
    block.remove();
    return;
  }

  const crumbs = await buildBreadcrumbsFromNav(
    navSections,
    window.location.href
  );

  if (!crumbs.length) {
    block.remove();
    return;
  }

  const navEl = document.createElement('nav');
  navEl.className = 'breadcrumbs';
  navEl.setAttribute('aria-label', 'Breadcrumb');

  const ol = document.createElement('ol');

  crumbs.forEach((item) => {
    const li = document.createElement('li');

    if (item['aria-current']) {
      li.setAttribute('aria-current', item['aria-current']);
    }

    if (item.url) {
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.title;
      li.appendChild(a);
    } else {
      li.textContent = item.title;
    }

    ol.appendChild(li);
  });

  navEl.appendChild(ol);
  block.replaceChildren(navEl);
}
