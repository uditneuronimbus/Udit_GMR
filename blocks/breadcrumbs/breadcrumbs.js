import { getMetadata } from '../../scripts/aem.js';
import { fetchPlaceholders } from '../../scripts/placeholders.js';

/**
 * Wait until nav is available (EDS-safe)
 */
function waitForNav(timeout = 4000) {
  const start = Date.now();

  return new Promise((resolve) => {
    const timer = setInterval(() => {
      const nav = document.querySelector('.nav-sections');
      if (nav) {
        clearInterval(timer);
        resolve(nav);
      }

      if (Date.now() - start > timeout) {
        clearInterval(timer);
        resolve(null);
      }
    }, 50);
  });
}

/**
 * Extract visible text from nav item
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
 * Build breadcrumbs from nav tree
 */
async function buildBreadcrumbsFromNav(nav, currentUrl) {
  const crumbs = [];

  const homeUrl =
    document.querySelector('.nav-brand a[href]')?.href ||
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

  crumbs.unshift({
    title: homeLabel,
    url: homeUrl,
  });

  // last item = current page
  if (crumbs.length) {
    crumbs[crumbs.length - 1].url = null;
    crumbs[crumbs.length - 1]['aria-current'] = 'page';
  }

  return crumbs;
}

/**
 * Breadcrumbs block entry
 */
export default async function decorate(block) {
  // Hide on homepage
  if (window.location.pathname === '/' || window.location.pathname === '') {
    block.remove();
    return;
  }

  const nav = await waitForNav();
  if (!nav) {
    console.warn('Breadcrumbs: nav not found');
    block.remove();
    return;
  }

  const crumbs = await buildBreadcrumbsFromNav(nav, window.location.href);
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
