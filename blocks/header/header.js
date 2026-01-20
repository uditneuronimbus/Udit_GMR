import { getMetadata } from "../../scripts/aem.js";
import { loadFragment } from "../fragment/fragment.js";

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia("(min-width: 900px)");

function closeOnEscape(e) {
  if (e.code !== "Escape") return;
  const nav = document.getElementById("nav");
  if (!nav) return;
  const navSections = nav.querySelector(".nav-sections");
  if (!navSections) return;
  const navSectionExpanded = navSections.querySelector(
    '[aria-expanded="true"]',
  );
  if (navSectionExpanded && isDesktop.matches) {
    toggleAllNavSections(navSections);
    navSectionExpanded.focus();
  } else if (!isDesktop.matches) {
    toggleMenu(nav, navSections);
    const btn = nav.querySelector("button");
    if (btn) btn.focus();
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav) return;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector(".nav-sections");
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector(
      '[aria-expanded="true"]',
    );
    if (navSectionExpanded && isDesktop.matches) {
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  if (!focused) return;
  const isNavDrop = focused.classList.contains("nav-drop");
  if (!isNavDrop) return;
  if (e.code === "Enter" || e.code === "Space") {
    e.preventDefault();
    const navSections = focused.closest(".nav-sections");
    if (!navSections) return;
    const dropExpanded = focused.getAttribute("aria-expanded") === "true";
    toggleAllNavSections(navSections);
    focused.setAttribute("aria-expanded", dropExpanded ? "false" : "true");
  }
}

function focusNavSection() {
  document.activeElement?.addEventListener("keydown", openOnKeydown);
}

function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  const value = expanded ? "true" : "false";
  sections
    .querySelectorAll(":scope .default-content-wrapper > ul > li")
    .forEach((section) => section.setAttribute("aria-expanded", value));
}

function toggleMenu(nav, navSections, forceExpanded = null) {
  if (!nav || !navSections) return;
  const currentlyExpanded = nav.getAttribute("aria-expanded") === "true";
  const willBeExpanded =
    forceExpanded !== null ? !!forceExpanded : !currentlyExpanded;
  const button = nav.querySelector(".nav-hamburger button");

  // lock scroll on mobile when menu open
  document.body.style.overflowY =
    willBeExpanded || isDesktop.matches ? "" : "hidden1";

  nav.setAttribute("aria-expanded", willBeExpanded ? "true" : "false");
  toggleAllNavSections(navSections, willBeExpanded && !isDesktop.matches);

  if (button) {
    button.setAttribute(
      "aria-label",
      willBeExpanded ? "Close navigation" : "Open navigation",
    );
  }

  const navDrops = navSections.querySelectorAll(".nav-drop");
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute("tabindex")) {
        drop.setAttribute("tabindex", 0);
        drop.addEventListener("focus", focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute("tabindex");
      drop.removeEventListener("focus", focusNavSection);
    });
  }

  if (willBeExpanded || isDesktop.matches) {
    window.addEventListener("keydown", closeOnEscape);
    nav.addEventListener("focusout", closeOnFocusLost);
  } else {
    window.removeEventListener("keydown", closeOnEscape);
    nav.removeEventListener("focusout", closeOnFocusLost);
  }
}

export default async function decorate(block) {
  const imageMap = new Map();

  const navMeta = getMetadata("nav");
  const navPathMain = navMeta
    ? new URL(navMeta, window.location).pathname
    : "/en/nav";
  const isAero = window.location.pathname.startsWith("/aero-gmr/");
  const navPath = isAero ? "/aero-gmr/nav" : navPathMain;
  const fragment = await loadFragment(navPath);

  block.textContent = "";
  const nav = document.createElement("nav");
  nav.id = "nav";
  nav.setAttribute("aria-expanded", "false");

  while (fragment.firstElementChild) {
    nav.append(fragment.firstElementChild);
  }

  const classes = ["brand", "sections", "tools"];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector(".nav-brand");
  if (navBrand) {
    const brandLink = navBrand.querySelector(".button");
    if (brandLink) {
      brandLink.className = "";
      const btnContainer = brandLink.closest(".button-container");
      if (btnContainer) btnContainer.className = "";
    }

    // ────────────────────────────────────────────────────────────────
    // Bind ALL logos (<picture> elements) to /en/
    // Works for both the old and the new logo you uploaded
    // ────────────────────────────────────────────────────────────────
    const logoPictures = navBrand.querySelectorAll("picture");

    logoPictures.forEach((picture) => {
      const logoLink = document.createElement("a");
      logoLink.href = "/en/";
      logoLink.setAttribute("aria-label", "GMR Home");
      logoLink.className = "navbar-logo";

      picture.parentNode.insertBefore(logoLink, picture);
      logoLink.appendChild(picture);

      // Clean up empty wrapper (common in AEM)
      let current = logoLink.parentElement;
      while (current && current !== navBrand) {
        if (
          (current.tagName === "P" || current.tagName === "DIV") &&
          current.children.length <= 1 &&
          !current.textContent.trim()
        ) {
          const next = current.parentNode;
          next.insertBefore(logoLink, current);
          current.remove();
          current = next;
        } else {
          break;
        }
      }
    });

    // Remove any leftover plain-text URL paragraphs
    navBrand.querySelectorAll("p").forEach((p) => {
      const text = p.textContent.trim();
      if (
        text.startsWith("http") ||
        text.startsWith("/") ||
        text === "#" ||
        text.includes("gmrcorp")
      ) {
        p.remove();
      }
    });
    // ────────────────────────────────────────────────────────────────

    // Build imageMap from header-image block
    const menuImgWrapper = navBrand.querySelector(":scope > div > div");
    if (menuImgWrapper) {
      [...menuImgWrapper.children].forEach((div) => {
        const first = div.children[0];
        const second = div.children[1];

        const labelEl = second?.querySelector("p");
        const imgEl = first?.querySelector("img");

        if (!labelEl || !imgEl) return;

        const key = labelEl.textContent
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-");
        imageMap.set(key, imgEl.src);
      });
    }

    const mainUl = navBrand.querySelector(":scope > div > ul");
    if (mainUl) {
      [...mainUl.children].forEach((li) => {
        if (li.tagName !== "LI") return;

        const ps = li.querySelectorAll(":scope > p");
        const titleEl = li.querySelector(":scope > h4");
        const descP = ps.length > 1 ? ps[1] : null;
        const innerList = li.querySelector(":scope > ul");

        const mainLabelEl = li.querySelector(
          ":scope > p, :scope > a, :scope > span, :scope > h4",
        );
        const mainKey = mainLabelEl
          ? mainLabelEl.textContent.trim().toLowerCase().replace(/\s+/g, "-")
          : null;

        const hasMega = titleEl || descP || innerList;
        if (!hasMega || !innerList) return;

        li.classList.add("has-mega");

        const mega = document.createElement("div");
        mega.className = "mega-wrapper";

        const colLeft = document.createElement("div");
        colLeft.className = "mega-left";

        if (titleEl) colLeft.append(titleEl);
        if (descP) colLeft.append(descP);

        const colMid = document.createElement("div");
        colMid.className = "mega-mid";

        const colRight = document.createElement("div");
        colRight.className = "mega-right";

        if (innerList && descP) {
          colMid.append(innerList);

          if (mainKey) {
            const imgUrl = imageMap.get(mainKey);
            if (imgUrl) {
              const img = document.createElement("img");
              img.src = imgUrl;
              colRight.append(img);
            }
          }
        } else {
          colLeft.append(innerList);

          let counter = 0;

          [...innerList.children].forEach((level1) => {
            const level2Ul = level1.querySelector(":scope > ul");
            if (!level2Ul) return;

            level2Ul
              .querySelectorAll(":scope > li > ul")
              .forEach((level3Ul) => {
                counter++;
                const id = `thirdMenu-${counter}`;

                const level2Li = level3Ul.closest("li");

                const el2 = level2Li.querySelector(
                  ":scope > p, :scope > a, :scope > span",
                );
                let level2Text = "";

                if (el2) {
                  const link2 = el2.querySelector("a");
                  level2Text = link2 ? link2.outerHTML : el2.textContent.trim();
                }

                const el = level1.querySelector(
                  ":scope > p, :scope > a, :scope > span",
                );
                let level1Text = "";

                if (el) {
                  const link = el.querySelector("a");
                  level1Text = link ? link.outerHTML : el.textContent.trim();
                }

                const thirdMenu = document.createElement("div");
                thirdMenu.classList.add("thirdMenu");
                thirdMenu.id = id;

                const headingWrapper = document.createElement("div");
                headingWrapper.classList.add("thirdMenu-headings");

                if (level1Text) {
                  const l1 = document.createElement("div");
                  l1.classList.add("thirdMenu-level1");
                  l1.innerHTML = level1Text;
                  headingWrapper.append(l1);
                }

                if (level2Text) {
                  const l2 = document.createElement("div");
                  l2.classList.add("thirdMenu-level2");
                  l2.innerHTML = level2Text;
                  headingWrapper.append(l2);
                }

                thirdMenu.append(headingWrapper);
                thirdMenu.append(level3Ul.cloneNode(true));
                colMid.append(thirdMenu);

                if (level2Li) {
                  level2Li.dataset.target = id;
                }
              });
          });

          colMid.querySelectorAll(".thirdMenu").forEach((div) => {
            div.style.display = "none";
          });

          if (mainKey) {
            const defaultImg = imageMap.get(mainKey);
            if (defaultImg) {
              const img = document.createElement("img");
              img.src = defaultImg;
              colRight.append(img);
            }
          }

          innerList.querySelectorAll("li").forEach((levelLi) => {
            levelLi.addEventListener("mouseenter", () => {
              const target = levelLi.dataset.target;

              colMid.querySelectorAll(".thirdMenu").forEach((div) => {
                div.style.display = "none";
              });

              if (target) {
                const panel = document.getElementById(target);
                if (panel) panel.style.display = "block";
              }

              const labelEl = levelLi.querySelector(
                ":scope > p, :scope > a, :scope > span",
              );

              let imgUrl = null;

              if (labelEl) {
                const key = labelEl.textContent
                  .trim()
                  .toLowerCase()
                  .replace(/\s+/g, "-");
                imgUrl = imageMap.get(key) || null;
              }

              if (!imgUrl && mainKey) {
                imgUrl = imageMap.get(mainKey) || null;
              }

              colRight.innerHTML = "";

              if (imgUrl) {
                const img = document.createElement("img");
                img.src = imgUrl;
                colRight.append(img);
              }
            });
          });
        }

        mega.append(colLeft, colMid, colRight);
        li.append(mega);
      });
    }
  }

  const navSections = nav.querySelector(".nav-sections");
  if (navSections) {
    navSections
      .querySelectorAll(":scope .default-content-wrapper > ul > li")
      .forEach((navSection) => {
        if (navSection.querySelector("ul")) {
          navSection.classList.add("nav-drop");
        }
        navSection.addEventListener("click", () => {
          if (isDesktop.matches) {
            const expanded =
              navSection.getAttribute("aria-expanded") === "true";
            toggleAllNavSections(navSections);
            navSection.setAttribute(
              "aria-expanded",
              expanded ? "false" : "true",
            );
          }
        });
      });
  }

  const hamburger = document.createElement("div");
  hamburger.classList.add("nav-hamburger");
  hamburger.innerHTML = `
    <button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener("click", () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute("aria-expanded", "false");

  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener("change", () =>
    toggleMenu(nav, navSections, isDesktop.matches),
  );

  const navWrapper = document.createElement("div");
  navWrapper.className = "primary-header header-wrapper";

  const container = document.createElement("div");
  container.className = "container position-relative";

  while (nav.firstChild) {
    container.append(nav.firstChild);
  }

  nav.append(container);
  navWrapper.append(nav);

  function handleHeaderAffix() {
    if (window.scrollY > 10) {
      navWrapper.classList.add("affix");
    } else {
      navWrapper.classList.remove("affix");
    }
  }

  handleHeaderAffix();
  window.addEventListener("scroll", handleHeaderAffix, { passive: true });

  block.innerHTML = "";
  block.append(navWrapper);
}
