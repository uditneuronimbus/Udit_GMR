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
          attr.startsWith("data-aue-") || attr.startsWith("data-richtext-")
      )
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
  if (window.location.pathname === '/' || window.location.pathname === '/404') {
    return;
  }

  // 2. Prevent Duplicates
  if (main.querySelector('.breadcrumbs')) {
    return;
  }

  // 3. Create the Block Wrapper & Block
  const wrapper = document.createElement('div');
  wrapper.classList.add('breadcrumbs-wrapper');

  const block = document.createElement('div');
  block.classList.add('breadcrumbs', 'block');
  block.dataset.blockName = 'breadcrumbs';
  block.dataset.blockStatus = 'loading';

  wrapper.append(block);

  // 4. INJECT INTO FIRST SECTION
  const firstSection = main.querySelector('.section');

  if (firstSection) {
    // Inject at the top of the existing first section
    firstSection.prepend(wrapper);
  } else {
    // Fallback: If page is empty, create a new section
    const section = document.createElement('div');
    section.classList.add('section', 'breadcrumbs-container');
    section.append(wrapper);
    main.prepend(section);
  }

  // 5. MANUALLY LOAD THE BLOCK LOGIC
  try {
    const cssLoaded = loadCSS(`${window.hlx.codeBasePath}/blocks/breadcrumbs/breadcrumbs.css`);
    const modLoaded = import(`${window.hlx.codeBasePath}/blocks/breadcrumbs/breadcrumbs.js`);

    const [_, mod] = await Promise.all([cssLoaded, modLoaded]);

    if (mod.default) {
      await mod.default(block);
    }
    block.dataset.blockStatus = 'loaded';
  } catch (error) {
    console.error("Failed to load breadcrumbs:", error);
    block.dataset.blockStatus = 'failed';
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
  document.documentElement.lang = "en";
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

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  // loadHeader(doc.querySelector("header")); // MOVED TO EAGER
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
      '[data-block-status="loaded"],[data-section-status="loaded"]'
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
          m.target.dataset?.blockStatus === "loaded"
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

const getAndApplyTargetPropositions = async () => {
  if (!window.alloy) {
    console.warn("window.alloy not available");
    return;
  }

  try {
    const isReturning =
      window.isReturningUser || localStorage.getItem("returning-user");

    const response = await window.alloy("sendEvent", {
      renderDecisions: false,
      decisionScopes: ["__view__"],
      xdm: {
        eventType: "web.webpagedetails.pageViews",
        profile: {
          isReturningUser: !!isReturning,
        },
      },
    });

    const { propositions } = response;

    onDecoratedElement(async () => {
      await window.alloy("applyPropositions", { propositions });

      setTimeout(() => {
        window.alloy("sendEvent", {
          xdm: {
            eventType: "decisioning.propositionDisplay",
            profile: { isReturningUser: !!isReturning, },
            _experience: { decisioning: { propositions } },
          },
        });
      }, 1000);
    });
  } catch (error) {
    console.error("Target error:", error);
  }
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
  // Move loadHeader to loadEager to start loading it immediately
  loadHeader(document.querySelector("header"));
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
