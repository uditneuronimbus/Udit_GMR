const MAX_HISTORY = 5;
const STORAGE_KEY  = "gmr_visited_pages";
const PROFILE_ATTR = "lastVisitedPages";

function getAlloy() {
  return new Promise((resolve, reject) => {
    if (typeof window.alloy === "function") {
      resolve(window.alloy);
      return;
    }
    let tries = 0;
    const interval = setInterval(() => {
      tries += 1;
      if (typeof window.alloy === "function") {
        clearInterval(interval);
        resolve(window.alloy);
      } else if (tries > 50) { // 50 x 100ms = 5 seconds max wait
        clearInterval(interval);
        reject(new Error("[Target] alloy.js did not load after 5 seconds. Check your Adobe Launch configuration."));
      }
    }, 100);
  });
}

function readVisitedPages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeVisitedPages(pages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
  } catch { /* silently skip */ }
}

function getCurrentPageLabel() {
  const title = document.title?.trim();
  if (title) return title;
  const parts = window.location.pathname.replace(/^\/|\/$/g, "").split("/");
  const last  = parts[parts.length - 1] || "Home";
  return last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function trackPageVisit() {
  const currentPage = {
    label: getCurrentPageLabel(),
    url:   window.location.pathname,
  };

  // Update localStorage mirror
  const history = readVisitedPages().filter((p) => p.url !== currentPage.url);
  history.unshift(currentPage);
  const trimmed = history.slice(0, MAX_HISTORY);
  writeVisitedPages(trimmed);

  // Format: "Label::url|Label::url|..."
  const profileValue = trimmed.map((p) => `${p.label}::${p.url}`).join("|");

  // Wait for alloy to be ready (it loads via Adobe Launch)
  let alloy;
  try {
    alloy = await getAlloy();
  } catch (err) {
    console.warn(err.message);
    return;
  }

  // Send profile attribute to Target
  alloy("sendEvent", {
    xdm: {
      eventType: "web.webpagedetails.pageViews",
      web: {
        webPageDetails: {
          URL:  window.location.href,
          name: currentPage.label,
        },
      },
    },
    data: {
      __adobe: {
        target: {
          [`profile.${PROFILE_ATTR}`]: profileValue,
        },
      },
    },
  }).catch((err) => {
    console.warn("[Target] trackPageVisit sendEvent failed:", err);
  });
}

/**
 * Fetches a JSON offer from Adobe Target for the given decision scope.
 * Returns parsed JSON content, or null if no offer found.
 *
 * @param {string} scope - The mbox / decision scope name configured in Target
 * @returns {Promise<any|null>}
 */
export async function getTargetOffer(scope) {
  let alloy;
  try {
    alloy = await getAlloy();
  } catch (err) {
    console.warn(err.message);
    return null;
  }

  let response;
  try {
    response = await alloy("sendEvent", {
      decisionScopes: [scope],
      xdm: {
        eventType: "decisioning.propositionFetch",
      },
    });
  } catch (err) {
    console.warn(`[Target] sendEvent for scope "${scope}" failed:`, err);
    return null;
  }

  // Walk propositions to find our scope
  const propositions = response?.propositions ?? [];
  for (const prop of propositions) {
    if (prop.scope !== scope) continue;
    for (const item of prop.items ?? []) {
      const content = item?.data?.content;
      if (!content) continue;
      try {
        return typeof content === "string" ? JSON.parse(content) : content;
      } catch {
        console.warn("[Target] Could not parse offer content:", content);
      }
    }
  }

  return null; // No offer — widget will not render
}