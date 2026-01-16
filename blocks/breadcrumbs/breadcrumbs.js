import { fetchPlaceholders } from '../../scripts/placeholders.js';

/**
 * Convert URL segment to readable title
 * example: "delhi-airport" → "Delhi Airport"
 */
function formatSegment(segment) {
  return decodeURIComponent(segment)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Build breadcrumbs purely from URL
 * Works with UE + component-based nav
 */
async function buildBreadcrumbsFromUrl() {
  const crumbs = [];

  const placeholders = await fetchPlaceholders();
  const homeLabel = placeholders.breadcrumbsHomeLabel || 'Home';

  const pathParts = window.location.pathname
    .replace(/\/$/, '')
    .split('/')
    .filter(Boolean);

  // Handle language root (/en, /fr, etc.)
  let index = 0;
  let currentPath = '';

  if (pathParts[0] && pathParts[0].length === 2) {
    currentPath = `/${pathParts[0]}`;
    crumbs.push({
      title: homeLabel,
      url: currentPath,
    });
    index = 1;
  } else {
    crumbs.push({
      title: homeLabel,
      url: '/',
    });
  }

  for (; index < pathParts.length; index += 1) {
    currentPath += `/${pathParts[index]}`;

    crumbs.push({
      title: formatSegment(pathParts[index]),
      url: currentPath,
    });
  }

  // Mark last item as current page
  crumbs[crumbs.length - 1].url = null;
  crumbs[crumbs.length - 1]['aria-current'] = 'page';

  return crumbs;
}

/**
 * Breadcrumbs block entry
 */
export default async function decorate(block) {
  // Hide breadcrumbs on homepage and language root
  if (
    window.location.pathname === '/' ||
    window.location.pathname.match(/^\/[a-z]{2}$/)
  ) {
    block.remove();
    return;
  }

  const crumbs = await buildBreadcrumbsFromUrl();
  if (!crumbs.length) {
    block.remove();
    return;
  }

  const nav = document.createElement('nav');
  nav.className = 'breadcrumbs';
  nav.setAttribute('aria-label', 'Breadcrumb');

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

  nav.appendChild(ol);
  block.replaceChildren(nav);
}
