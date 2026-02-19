import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
} from "./aem.js";
import { buildVisitHistory, getCachedVisitedPages } from "./target.js";

// --- EARLY LANGUAGE REDIRECT & BHASHINI JUMPSTART (Anti-Flash) ---
(function handleLanguageInitialization() {
  // 1. AGGRESSIVE HIDE: Prevent ANY flash of content
  // We use opacity 0 and pointer-events none to make it invisible but still allow layout
  const style = document.createElement("style");
  style.id = "anti-flash-style";
  style.innerHTML =
    "body { opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; transition: none !important; }";
  document.head.appendChild(style);

  const savedLang = localStorage.getItem("selected-language");
  const path = window.location.pathname;
  const segments = path.split("/");

  // Find current language in URL
  // Support both 2-char codes (en, ja) and hyphenated codes (zh-sg, zh-cn)
  let langIndex = -1;
  let detectedLang = "en"; // Default
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (/^[a-z]{2}(-[a-z]{2})?$/.test(segment)) {
      langIndex = i;
      detectedLang = segment;
      break;
    }
  }

  // 2. REDIRECT CHECK: If saved preference differs from URL
  // Use location.replace() for instant redirect without adding to history
  if (savedLang && savedLang !== detectedLang) {
    let newPath;
    if (langIndex !== -1) {
      segments[langIndex] = savedLang;
      newPath = segments.join("/");
    } else {
      newPath = "/" + savedLang + (path === "/" ? "" : path);
    }

    const finalUrl =
      window.location.origin +
      newPath.replace(/\/+/g, "/") +
      window.location.search +
      window.location.hash;
    if (finalUrl !== window.location.href) {
      // Use replace() instead of href for instant redirect without browser history entry
      window.location.replace(finalUrl);
      return; // Stop execution, browser will redirect
    }
  }

  // 3. BHASHINI JUMPSTART: If we are on a non-English path
  if (detectedLang !== "en" || (savedLang && savedLang !== "en")) {
    const activeLang = detectedLang !== "en" ? detectedLang : savedLang;
    document.documentElement.lang = activeLang;

    if (!document.getElementById("bhashini-script")) {
      const script = document.createElement("script");
      script.id = "bhashini-script";
      script.src =
        "https://translation-plugin.bhashini.co.in/v3/website_translation_utility.js";
      script.defer = true;
      document.head.appendChild(script);
    }
  }

  // Reveal function to be called when ready (usually by header.js)
  window.revealPage = () => {
    const af = document.getElementById("anti-flash-style");
    if (af) {
      af.remove();
      console.log("Anti-flash guard removed (revealPage called)");
    }
  };

  // Failsafe reveal: If everything else fails, show the page after 2 seconds
  setTimeout(() => {
    if (document.getElementById("anti-flash-style")) {
      console.warn(
        "Failsafe reveal triggered - revealPage was not called in time.",
      );
      window.revealPage();
    }
  }, 2000);
})();

/* ===============================
   METADATA HELPER
   =============================== */
const getMetadata = (name) => {
  const meta = document.querySelector(`meta[name="${name}"]`);
  return meta ? meta.content : null;
};

/* ===============================
   PAGE SLUG → BODY CLASS
   =============================== */
function addPageSlugClass() {
  const path = window.location.pathname
    .replace(/\/$/, "")
    .split("/")
    .filter(Boolean);

  const slug = path.length ? path[path.length - 1] : "home";
  document.body.classList.add(`page-${slug.toLowerCase()}`);

  // ⭐ Language-only homepage check
  // Matches /en/, /jp/, /eu/, /fr/, /de/, etc.
  const langOnlyHome =
    path.length === 1 &&
    (/^[a-zA-Z]{2,3}$/.test(path[0]) || ["zh-sg", "zh-cn"].includes(path[0]));

  if (langOnlyHome) {
    document.body.classList.add("page-home");
  }
}

/* ===============================
   ATTRIBUTE HELPERS
   =============================== */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter(
        (attr) =>
          attr.startsWith("data-aue-") || attr.startsWith("data-richtext-"),
      ),
  );
}

/* ===============================
   LOAD FONTS
   =============================== */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes("localhost")) {
      sessionStorage.setItem("fonts-loaded", "true");
    }
  } catch (e) {
    // ignore
  }
}

/* ===============================
   AUTO BLOCKS (BREADCRUMBS)
   =============================== */
/**
 * Manual Build + Manual Load for Breadcrumbs
 * Injects INTO the First Section (Hero) to avoid layout shift
 */
async function buildBreadcrumbs(main) {
  // 1. Skip on Homepage or 404
  if (window.location.pathname === "/" || window.location.pathname === "/404") {
    return;
  }

  // 2. Prevent Duplicates
  if (main.querySelector(".breadcrumbs")) {
    return;
  }

  // 3. Create the Block Wrapper & Block
  const wrapper = document.createElement("div");
  wrapper.classList.add("breadcrumbs-wrapper");

  const block = document.createElement("div");
  block.classList.add("breadcrumbs", "block");
  block.dataset.blockName = "breadcrumbs";
  block.dataset.blockStatus = "loading";

  wrapper.append(block);

  // 4. INJECT INTO FIRST SECTION
  const firstSection = main.querySelector(".section");

  if (firstSection) {
    // Inject at the top of the existing first section
    firstSection.prepend(wrapper);
  } else {
    // Fallback: If page is empty, create a new section
    const section = document.createElement("div");
    section.classList.add("section", "breadcrumbs-container");
    section.append(wrapper);
    main.prepend(section);
  }

  // 5. MANUALLY LOAD THE BLOCK LOGIC
  try {
    const cssLoaded = loadCSS(
      `${window.hlx.codeBasePath}/blocks/breadcrumbs/breadcrumbs.css`,
    );
    const modLoaded = import(
      `${window.hlx.codeBasePath}/blocks/breadcrumbs/breadcrumbs.js`
    );

    const [_, mod] = await Promise.all([cssLoaded, modLoaded]);

    if (mod.default) {
      await mod.default(block);
    }
    block.dataset.blockStatus = "loaded";
  } catch (error) {
    console.error("Failed to load breadcrumbs:", error);
    block.dataset.blockStatus = "failed";
  }
}

/* ===============================
   BUILD AUTO BLOCKS
   =============================== */
function buildAutoBlocks(main) {
  try {
    // Breadcrumbs are NOT called here to avoid deadlock.
    // They are called in loadLazy below.
  } catch (error) {
    console.error("Auto Blocking failed", error);
  }
}

/* ===============================
   DECORATE MAIN
   =============================== */
export function decorateMain(main) {
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/* ===============================
   LOAD EAGER
   =============================== */
async function loadEager(doc) {
  // Dynamically set lang attribute based on URL path instead of hardcoding "en"
  // Support both 2-char codes (en, ja) and hyphenated codes (zh-sg, zh-cn)
  const pathParts = window.location.pathname.split("/");
  let currentLang = "en";
  for (const part of pathParts) {
    if (/^[a-z]{2}(-[a-z]{2})?$/.test(part)) {
      currentLang = part;
      break;
    }
  }
  document.documentElement.lang = currentLang;

  decorateTemplateAndTheme();

  const main = doc.querySelector("main");
  if (main) {
    decorateMain(main);
    addPageSlugClass();
    document.body.classList.add("appear");

    // Adobe Target wait
    if (getMetadata("target") === "true") {
      await new Promise((resolve) => {
        if (window.alloy) return resolve();
        const checkAlloy = () => {
          if (window.alloy) resolve();
          else setTimeout(checkAlloy, 50);
        };
        checkAlloy();
      });
    }

    await loadSection(main.querySelector(".section"), waitForFirstImage);
  }

  try {
    if (window.innerWidth >= 900 || sessionStorage.getItem("fonts-loaded")) {
      loadFonts();
    }
  } catch (e) {
    // ignore
  }
}

/* ===============================
   LOAD LAZY
   =============================== */
async function loadLazy(doc) {
  const main = doc.querySelector("main");
  await loadSections(main);
  buildVisitHistory();

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector("header"));
  loadFooter(doc.querySelector("footer"));

  /* ✅ Manual Load Call for Breadcrumbs */
  buildBreadcrumbs(main);

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/* ===============================
   LOAD DELAYED
   =============================== */
function loadDelayed() {
  import("./delayed.js");
}

/* ===============================
   ADOBE TARGET
   =============================== */
const onDecoratedElement = (fn) => {
  if (
    document.querySelector(
      '[data-block-status="loaded"],[data-section-status="loaded"]',
    )
  ) {
    fn();
    return;
  }

  const observer = new MutationObserver((mutations) => {
    if (
      mutations.some(
        (m) =>
          m.target.tagName === "BODY" ||
          m.target.dataset?.sectionStatus === "loaded" ||
          m.target.dataset?.blockStatus === "loaded",
      )
    ) {
      fn();
      observer.disconnect();
    }
  });

  observer.observe(document.querySelector("main"), {
    subtree: true,
    attributes: true,
    attributeFilter: ["data-block-status", "data-section-status"],
  });
  observer.observe(document.body, { childList: true });
};


/* ===============================
   RETURNING USER FLAG
   =============================== */
const KEY = "returning-user";
if (!localStorage.getItem(KEY)) {
  localStorage.setItem(KEY, "true");
} else {
  window.isReturningUser = true;
}

/* ===============================
   LOAD PAGE
   =============================== */
async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
