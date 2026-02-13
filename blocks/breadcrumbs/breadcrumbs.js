import { getMetadata } from "../../scripts/aem.js";

/* =========================================================
   HELPER: String Formatting (URL to Title)
   ========================================================= */
function formatSegment(segment) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/* =========================================================
   HELPER: Normalize URL (Fixes AEM .html/slash issues)
   ========================================================= */
function normalizePath(url) {
  try {
    const path = new URL(url, window.location.origin).pathname;
    return path.replace(/\.html$/, "").replace(/\/$/, "");
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
      const nav =
        document.querySelector(".nav-sections") ||
        document.querySelector("nav[aria-expanded]");
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

  const navLinks = Array.from(nav.querySelectorAll("a"));
  const activeLink = navLinks.find(
    (a) => normalizePath(a.href) === normalizedCurrent,
  );

  if (activeLink) {
    let li = activeLink.closest("li");
    while (li) {
      const link = li.querySelector(":scope > a");
      const text =
        link?.textContent?.trim() || li.firstChild?.textContent?.trim();

      if (text) {
        crumbs.unshift({
          title: text,
          url: link ? link.href : null,
        });
      }
      li = li.closest("ul")?.closest("li");
    }
  }
  return crumbs;
}

/* =========================================================
   STRATEGY 2: Build from URL Structure (Backup)
   ========================================================= */
function buildFromUrl(currentUrl) {
  const crumbs = [];
  const path = new URL(currentUrl).pathname.replace(/\/$/, "");
  const segments = path.replace(".html", "").split("/").filter(Boolean);

  // Hide language codes and system segments from breadcrumbs
  // Support both 2-char codes (en, hi) and hyphenated codes (zh-cn, zh-sg)
  const HIDDEN_SEGMENTS = ["en", "hi", "ja", "id", "fr", "es", "el", "zh-cn", "zh-sg", "content"];
  let accumPath = "";

  segments.forEach((segment, index) => {
    accumPath += `/${segment}`;

    if (HIDDEN_SEGMENTS.includes(segment.toLowerCase())) {
      return;
    }

    const isLast = index === segments.length - 1;

    crumbs.push({
      title: formatSegment(segment),
      url: isLast ? null : accumPath,
    });
  });

  return crumbs;
}

/* =========================================================
   MAIN DECORATE FUNCTION
   ========================================================= */
export default async function decorate(block) {
  /* -----------------------------------------
     1. HOME PAGE CHECK (FIXED)
     ----------------------------------------- */
  const path = window.location.pathname.replace(/\/$/, "");

  // Check if current page is homepage
  // Support both 2-char codes (/en, /hi) and hyphenated codes (/zh-cn, /zh-sg)
  const isHome = path === "" || path === "/" || /^\/[a-z]{2}(-[a-z]{2})?$/.test(path);

  if (isHome) {
    block.innerHTML = "";
    return;
  }

  const nav = await waitForNav();
  const currentUrl = window.location.href;
  const homeUrl = `${window.location.origin}/`;

  /* -----------------------------------------
     2. BUILD CRUMBS
     ----------------------------------------- */
  let crumbs = await buildFromNav(nav, currentUrl);

  if (crumbs.length < 2) {
    crumbs = buildFromUrl(currentUrl);
  }

  crumbs.unshift({ title: "Home", url: homeUrl });

  if (crumbs.length > 0) {
    crumbs[crumbs.length - 1].url = null;
    crumbs[crumbs.length - 1]["aria-current"] = "page";
  }

  /* -----------------------------------------
     3. UE-SAFE RENDERING (IMPORTANT FIX)
     ----------------------------------------- */
  let html =
    '<nav class="breadcrumbs container" aria-label="Breadcrumb"><ol class="breadcrumb">';

  crumbs.forEach((item) => {
    if (item.url) {
      html += `<li class="breadcrumb-item"><a href="${item.url}">${item.title}</a></li>`;
    } else {
      html += `<li class="breadcrumb-item" aria-current="page">${item.title}</li>`;
    }
  });

  html += "</ol></nav>";

  block.innerHTML = html;
}
