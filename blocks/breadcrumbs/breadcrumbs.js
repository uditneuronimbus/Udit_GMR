import { getMetadata } from '../../scripts/aem.js';

/* =========================================================
   HELPER: String Formatting (URL to Title)
   ========================================================= */
function formatSegment(segment) {
  // Converts "delhi-airport" -> "Delhi Airport"
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/* =========================================================
   HELPER: Normalize URL (Fixes AEM .html/slash issues)
   ========================================================= */
function normalizePath(url) {
  try {
    const path = new URL(url, window.location.origin).pathname;
    return path.replace(/\.html$/, '').replace(/\/$/, '');
  } catch (e) {
    return url;
  }
}

/* =========================================================
   CORE: Wait for Nav Block to Load
   ========================================================= */
function waitForNav(timeout = 3000) {
  const start = Date.now();
  return new Promise((resolve) => {
    const timer = setInterval(() => {
      const nav = document.querySelector('.nav-sections') || document.querySelector('nav[aria-expanded]');
      if (nav) {
        clearInterval(timer);
        resolve(nav);
      }
      if (Date.now() - start > timeout) {
        clearInterval(timer);
        resolve(null);
      }
    }, 100);
  });
}

/* =========================================================
   STRATEGY 1: Build from Navigation Menu (Primary)
   ========================================================= */
async function buildFromNav(nav, currentUrl) {
  const crumbs = [];
  const normalizedCurrent = normalizePath(currentUrl);

  if (!nav) return crumbs;

  const navLinks = Array.from(nav.querySelectorAll('a'));
  const activeLink = navLinks.find((a) => normalizePath(a.href) === normalizedCurrent);

  if (activeLink) {
    let li = activeLink.closest('li');
    while (li) {
      const link = li.querySelector(':scope > a');
      const text = link ? link.textContent.trim() : (li.firstChild?.textContent?.trim() || '');

      if (text) {
        crumbs.unshift({ title: text, url: link ? link.href : null });
      }
      li = li.closest('ul')?.closest('li');
    }
  }
  return crumbs;
}

/* =========================================================
   STRATEGY 2: Build from URL Structure (Backup)
   ========================================================= */
function buildFromUrl(currentUrl) {
  const crumbs = [];
  const path = new URL(currentUrl).pathname;
  const segments = path.replace('.html', '').split('/').filter(Boolean);

  // CONFIG: Folder names to HIDE from the visual trail
  const HIDDEN_SEGMENTS = ['en', 'hi', 'content'];

  let accumPath = '';

  segments.forEach((segment, index) => {
    accumPath += `/${segment}`;

    // Skip visual display if it's a hidden segment
    if (HIDDEN_SEGMENTS.includes(segment.toLowerCase())) {
      return;
    }

    const isLast = index === segments.length - 1;

    crumbs.push({
      // THIS uses the URL slug (delhi-airport -> Delhi Airport)
      title: formatSegment(segment),
      url: isLast ? null : accumPath,
    });
  });

  /* REMOVED: The code block that fetched 'og:title' / document.title
     This ensures it stays as "Delhi Airport" instead of "Delhi Airport, India"
  */

  return crumbs;
}

/* =========================================================
   MAIN DECORATE FUNCTION
   ========================================================= */
export default async function decorate(block) {
  block.textContent = '';

  // Hide on Homepage
  if (window.location.pathname === '/' || window.location.pathname === '') {
    return;
  }

  const nav = await waitForNav();
  const currentUrl = window.location.href;
  const homeUrl = `${window.location.origin}/`;

  // 1. Try Menu
  let crumbs = await buildFromNav(nav, currentUrl);

  // 2. URL Fallback (If menu fails)
  if (crumbs.length < 2) {
    crumbs = buildFromUrl(currentUrl);
  }

  // 3. Always prepend Home
  crumbs.unshift({ title: 'Home', url: homeUrl });

  // 4. Mark last item as current
  if (crumbs.length > 0) {
    const last = crumbs[crumbs.length - 1];
    last.url = null;
    last['aria-current'] = 'page';
  }

  // 5. Render
  const navEl = document.createElement('nav');
  navEl.setAttribute('aria-label', 'Breadcrumb');

  const ol = document.createElement('ol');
  crumbs.forEach((item) => {
    const li = document.createElement('li');
    if (item['aria-current']) li.setAttribute('aria-current', 'page');

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
  block.appendChild(navEl);
}
