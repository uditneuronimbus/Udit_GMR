import { getMetadata } from '../../scripts/aem.js';
import { fetchPlaceholders } from '../../scripts/placeholders.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Get readable text from nav <li>
 */
function getItemText(li) {
  const a = li.querySelector(':scope > a');
  if (a) return a.textContent.trim();
  return li.textContent.trim();
}

/**
 * Find breadcrumb path in raw nav UL
 */
function findPath(ul, currentUrl, trail = []) {
  for (const li of ul.children) {
    const link = li.querySelector(':scope > a');
    const nextTrail = [...trail, li];

    if (link && link.href === currentUrl) {
      return nextTrail;
    }

    const childUl = li.querySelector(':scope > ul');
    if (childUl) {
      const result = findPath(childUl, currentUrl, nextTrail);
      if (result) return result;
    }
  }
  return null;
}

/**
 * Build breadcrumb data from nav fragment
 */
async function buildBreadcrumbs(navRoot, currentUrl) {
  const crumbs = [];

  const rootUl = navRoot.querySelector('ul');
  if (!rootUl) return crumbs;

  const path = findPath(rootUl, currentUrl);

  if (path) {
    path.forEach((li) => {
      const a = li.querySelector(':scope > a');
      crumbs.push({
        title: getItemText(li),
        url: a ? a.href : null,
      });
    });
  } else {
    crumbs.push({
      title: getMetadata('og:title') || document.title,
      url: currentUrl,
    });
  }

  const placeholders = await fetchPlaceholders();
  crumbs.unshift({
    title: placeholders.breadcrumbsHomeLabel || 'Home',
    url: '/',
  });

  crumbs[crumbs.length - 1].url = null;
  crumbs[crumbs.length - 1]['aria-current'] = 'page';

  return crumbs;
}

export default async function decorate(block) {
  // Hide on homepage
  if (window.location.pathname === '/' || window.location.pathname === '') {
    block.remove();
    return;
  }

  // Load RAW nav fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta
    ? new URL(navMeta, window.location).pathname
    : '/nav';

  const navFragment = await loadFragment(navPath);
  if (!navFragment) {
    block.remove();
    return;
  }

  const crumbs = await buildBreadcrumbs(
    navFragment,
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
      li.setAttribute('aria-current', 'page');
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
