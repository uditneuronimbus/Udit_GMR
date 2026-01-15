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

// Initialize accessibility state
let accessibilitySettings = {
  fontSize: 'normal',
  highContrast: false
};

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
/**
 * Adds page slug as body class
 * "/"                     → page-home
 * "/about-us"             → page-about-us
 * "/services/web-design"  → page-web-design
 */
function addPageSlugClass() {
  const path = window.location.pathname
    .replace(/\/$/, "") // remove trailing slash
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
   AUTO BLOCKS
   =============================== */
function buildAutoBlocks() {
  try {
    // no-op
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

    /* ✅ ADD BODY CLASSES EARLY */
    addPageSlugClass();
    document.body.classList.add("appear");

    // Adobe Target wait (if enabled)
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

  loadHeader(doc.querySelector("header"));
  loadFooter(doc.querySelector("footer"));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/* ===============================
   LOAD DELAYED (Bhashini Removed)
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
    console.log("Fetching Target propositions...");
    const isReturning =
      window.isReturningUser || localStorage.getItem("returning-user");

    const response = await window.alloy("sendEvent", {
      renderDecisions: true,
      // decisionScopes: ["target-global-mbox"],
      data: {
        accessibility_fontSize: accessibilitySettings.fontSize,           
        accessibility_highContrast: String(accessibilitySettings.highContrast)  
      }
    });

    console.log("🎯 Target Response:", response);

    const { propositions } = response;
    console.log(`📦 Propositions received: ${propositions?.length || 0}`);
    console.log("______________________________", propositions);
    
     if (propositions && propositions.length > 0) {
      console.log("✅ Target content will be auto-applied (renderDecisions: true)");
      

    setTimeout(() => {
        window.alloy("sendEvent", {
          xdm: {
            eventType: "decisioning.propositionDisplay",
            _experience: { 
              decisioning: { 
                propositions: propositions.map(p => ({
                  id: p.id,
                  scope: p.scope,
                  scopeDetails: p.scopeDetails
                }))
              } 
            }
          }
        });
        console.log("📊 Display events sent");
      }, 1000);
    } else {
      console.warn("⚠️ No propositions received - check activity status and audience matching");
    }

    // onDecoratedElement(async () => {
    //   // await window.alloy("applyPropositions", { propositions });
    //   console.log("Target Applied!");
      
    //   setTimeout(() => {
    //     window.alloy("sendEvent", {
    //       xdm: {
    //         eventType: "decisioning.propositionDisplay",
    //         profile: { isReturningUser: !!isReturning },
    //         _experience: { decisioning: { propositions } },
    //       },
    //     });
    //     console.log("Display Events Sent");
        
    //   }, 1000);
    // });
  } catch (error) {
    console.error("Target error:", error);
  }
};
if (getMetadata('target') === 'true' || getMetadata('personalization')) {

  getAndApplyTargetPropositions();

}

// ===== ACCESSIBILITY SETTINGS =====


// Toggle font size
document.getElementById('toggle-font-size')?.addEventListener('click', () => {
  accessibilitySettings.fontSize = accessibilitySettings.fontSize === 'normal' ? 'large' : 'normal';
  applyAccessibilitySettings();
  sendAccessibilityToTarget();
});

// Toggle high contrast
document.getElementById('toggle-high-contrast')?.addEventListener('click', () => {
  accessibilitySettings.highContrast = !accessibilitySettings.highContrast;
  applyAccessibilitySettings();
  sendAccessibilityToTarget();
});

// Apply settings to page
function applyAccessibilitySettings() {
  // Apply font size
  if (accessibilitySettings.fontSize === 'large') {
    document.body.style.fontSize = '120%';
  } else {
    document.body.style.fontSize = '100%';
  }
  
  // Apply high contrast
  if (accessibilitySettings.highContrast) {
    document.body.classList.add('high-contrast');
  } else {
    document.body.classList.remove('high-contrast');
  }
}

// Send settings to Adobe Target
function sendAccessibilityToTarget() {
  if (!window.alloy) {
    console.warn('Alloy not loaded');
    return;
  }
  
  console.log('📤 Sending accessibility settings to Target:', accessibilitySettings);
  
  window.alloy('sendEvent', {
    renderDecisions: true,
    decisionScopes: ['target-global-mbox'],
    data: {
      accessibility_fontSize: accessibilitySettings.fontSize,           // ✅ Matches profile script
      accessibility_highContrast: String(accessibilitySettings.highContrast)  // ✅ Matches profile script
    }
  }).then(response => {
    console.log('✅ Settings sent to Target:', response);
  }).catch(error => {
    console.error('❌ Error sending to Target:', error);
  });
}
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
