import { getMetadata } from '../../scripts/aem.js';
import { fetchPlaceholders } from '../../scripts/placeholders.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Normalize URLs for reliable comparison
 * - removes domain
 * - removes trailing slash
 */
function normalizeUrl(url) {
  try {
    const u = new URL(url, window.location.origin);
    return u.pathname.replace(/\/$/, '');
  } catch (e) {
    return url.replace(/\/$/, '');
  }
}

/**
 * Get visible label text from nav <li>
 */
function getItemText(li) {
  const link = li.querySelector(':scope > a');
  if (link) return link.textContent.trim();
  return li.textContent.trim();
}

/**
 * Recursively find breadcrumb path in raw nav <ul>
 */
function findPath(ul, currentPath, trail = []) {
  for (const li of ul.children) {
    const link = li.querySelector(':scope > a');
    const nextTrail = [...trail, li];

    if (link && normalizeUrl(link.href) === currentPath) {
      return nextTrail;
    }

    const childUl = li.querySelector(':scope > ul');
    if (childUl) {
      const result = findPath(childUl, currentPath, nextTrail);
      if (result) return result;
    }
  }
  return null;
}

/**
 * Build breadcrumb data from raw nav fragment
 */
async function buildBreadcrumbs(navFragment) {
  const crumbs = [];
  const rootUl = navFragment.querySelector('ul');
  if (!rootUl) return crumbs;

  const currentPath = normalizeUrl(window.location.href);
  const path = findPath(rootUl, currentPath);

  if (path) {
    path.forEach((li) => {
      const link = li.querySelector(':scope > a');
      crumbs.push({
        title: getItemText(li),
        url: link ? link.href : null,
      });
    });
  } else {
    // fallback if page not in nav
    crumbs.push({
      title: getMetadata('og:title') || document.title,
      url: window.location.href,
    });
  }

  const placeholders = await fetchPlaceholders();
  const homeLabel = placeholders.breadcrumbsHomeLabel || 'Home';

  // detect language root (/en, /fr, etc.)
  const langRoot = window.location.pathname.split('/')[1];
  const homeUrl = langRoot ? `/${langRoot}` : '/';

  crumbs.unshift({
    title: homeLabel,
    url: homeUrl,
  });

  // last crumb = current page
  crumbs[crumbs.length - 1].url = null;
  crumbs[crumbs.length - 1]['aria-current'] = 'page';

  return crumbs;
}

/**
 * Breadcrumbs block entry point
 */
export default async function decorate(block) {
  // Hide on homepage
  if (
    window.location.pathname === '/' ||
    window.location.pathname.match(/^\/[a-z]{2}$/)
  ) {
    block.remove();
    return;
  }

  // Load raw nav fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta
    ? new URL(navMeta, window.location).pathname
    : '/nav';

  const navFragment = await loadFragment(navPath);
  if (!navFragment) {
    block.remove();
    return;
  }

  const crumbs = await buildBreadcrumbs(navFragment);
  if (!crumbs.length) {
    block.remove();
    return;
  }

  // Render DOM
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
