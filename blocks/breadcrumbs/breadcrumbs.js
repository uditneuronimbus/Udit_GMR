import { getMetadata } from '../../scripts/aem.js';
import { fetchPlaceholders } from '../../scripts/placeholders.js';
import { loadFragment } from '../fragment/fragment.js';

/* -----------------------------------------
   Helpers
------------------------------------------ */

function normalizeUrl(url) {
  try {
    const u = new URL(url, window.location.origin);
    return u.pathname.replace(/\/$/, '');
  } catch {
    return url.replace(/\/$/, '');
  }
}

function getItemText(li) {
  const a = li.querySelector(':scope > a');
  return a ? a.textContent.trim() : li.textContent.trim();
}

function findPath(ul, currentPath, trail = []) {
  for (const li of ul.children) {
    const link = li.querySelector(':scope > a');
    const nextTrail = [...trail, li];

    if (link && normalizeUrl(link.href) === currentPath) {
      return nextTrail;
    }

    const childUl = li.querySelector(':scope > ul');
    if (childUl) {
      const found = findPath(childUl, currentPath, nextTrail);
      if (found) return found;
    }
  }
  return null;
}

/* -----------------------------------------
   Breadcrumb Builder
------------------------------------------ */

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
    crumbs.push({
      title: getMetadata('og:title') || document.title,
      url: window.location.href,
    });
  }

  const placeholders = await fetchPlaceholders();
  const homeLabel = placeholders.breadcrumbsHomeLabel || 'Home';

  const lang = window.location.pathname.split('/')[1];
  const homeUrl = lang ? `/${lang}` : '/';

  crumbs.unshift({ title: homeLabel, url: homeUrl });

  crumbs[crumbs.length - 1].url = null;
  crumbs[crumbs.length - 1]['aria-current'] = 'page';

  return crumbs;
}

/* -----------------------------------------
   Block Entry
------------------------------------------ */

export default async function decorate(block) {
  // Hide on language root or homepage
  if (
    window.location.pathname === '/' ||
    window.location.pathname.match(/^\/[a-z]{2}$/)
  ) {
    block.remove();
    return;
  }

  // 🔑 LANGUAGE-AWARE NAV PATH
  const lang = window.location.pathname.split('/')[1];
  const navPath = lang ? `/${lang}/nav` : '/nav';

  const navFragment = await loadFragment(navPath);
  if (!navFragment) {
    console.warn('Breadcrumbs: nav fragment not found:', navPath);
    block.remove();
    return;
  }

  const crumbs = await buildBreadcrumbs(navFragment);
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
