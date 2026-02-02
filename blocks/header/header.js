import { getMetadata } from "../../scripts/aem.js";
import { loadFragment } from "../fragment/fragment.js";

const isDesktop = window.matchMedia("(min-width: 900px)");

// --- Helper Functions --- (unchanged)
function closeOnEscape(e) {
  if (e.code !== "Escape") return;
  const nav = document.getElementById("nav");
  if (!nav) return;
  const navSections = nav.querySelector(".nav-sections");
  if (!navSections) return;
  const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
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
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
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
  sections.querySelectorAll(":scope .default-content-wrapper > ul > li")
    .forEach((section) => section.setAttribute("aria-expanded", value));
}
function toggleMenu(nav, navSections, forceExpanded = null) {
  if (!nav || !navSections) return;
  const currentlyExpanded = nav.getAttribute("aria-expanded") === "true";
  const willBeExpanded = forceExpanded !== null ? !!forceExpanded : !currentlyExpanded;
  const button = nav.querySelector(".nav-hamburger button");
  document.body.style.overflowY = willBeExpanded && !isDesktop.matches ? "hidden" : "";
  nav.setAttribute("aria-expanded", willBeExpanded ? "true" : "false");
  toggleAllNavSections(navSections, willBeExpanded && !isDesktop.matches);
  if (button) {
    button.setAttribute("aria-label", willBeExpanded ? "Close navigation" : "Open navigation");
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

// --- Main Decorate Function ---
export default async function decorate(block) {
  try {
    const imageMap = new Map();
    const navMeta = getMetadata("nav");
    const navPathMain = navMeta ? new URL(navMeta, window.location).pathname : "/en/nav";
    const isAero = window.location.pathname.startsWith("/aero-gmr/");
    const navPath = isAero ? "/aero-gmr/nav" : navPathMain;

    const fragment = await loadFragment(navPath);
    block.textContent = "";

    const nav = document.createElement("nav");
    nav.id = "nav";
    nav.setAttribute("aria-expanded", "false");

    if (fragment) {
      while (fragment.firstElementChild) {
        nav.append(fragment.firstElementChild);
      }
    }

    const classes = ["brand", "sections", "tools"];
    classes.forEach((c, i) => {
      const section = nav.children[i];
      if (section) section.classList.add(`nav-${c}`);
    });

    const navBrand = nav.querySelector(".nav-brand");
    const navSections = nav.querySelector(".nav-sections");

    if (navBrand) {
      const brandLink = navBrand.querySelector(".button");
      if (brandLink) {
        brandLink.className = "";
        const btnContainer = brandLink.closest(".button-container");
        if (btnContainer) btnContainer.className = "";
      }

      const logoPictures = navBrand.querySelectorAll("picture");
      logoPictures.forEach((picture) => {
        const logoLink = document.createElement("a");
        logoLink.href = "/en/";
        logoLink.setAttribute("aria-label", "GMR Home");
        logoLink.className = "navbar-logo";
        picture.parentNode.insertBefore(logoLink, picture);
        logoLink.appendChild(picture);

        let current = logoLink.parentElement;
        while (current && current !== navBrand) {
          if ((current.tagName === "P" || current.tagName === "DIV") &&
              current.children.length <= 1 && !current.textContent.trim()) {
            const next = current.parentNode;
            next.insertBefore(logoLink, current);
            current.remove();
            current = next;
          } else break;
        }
      });

      navBrand.querySelectorAll("p").forEach((p) => {
        const text = p.textContent.trim();
        if (text.startsWith("http") || text.startsWith("/") || text === "#" || text.includes("gmrcorp")) {
          p.remove();
        }
      });

      const menuImgWrapper = navBrand.querySelector(":scope > div > div");
      if (menuImgWrapper) {
        [...menuImgWrapper.children].forEach((div) => {
          if (div.children.length >= 2) {
            const labelEl = div.children[1]?.querySelector("p");
            const imgEl = div.children[0]?.querySelector("img");
            if (!labelEl || !imgEl) return;
            const key = labelEl.textContent.trim().toLowerCase().replace(/\u00A0/g, " ").replace(/\s+/g, "-");
            imageMap.set(key, imgEl.src);
          }
        });
        menuImgWrapper.remove();
      }

      const mainUl = navBrand.querySelector(":scope > div > ul");
      if (mainUl) {
        [...mainUl.children].forEach((li) => {
          if (li.tagName !== "LI") return;
          const innerList = li.querySelector("ul");
          if (!innerList) return;

          const mainLinkEl = li.querySelector("a");
          let menuTitleText = mainLinkEl ? mainLinkEl.textContent.trim() : "";
          const customTitleEl = li.querySelector("h4");
          if (customTitleEl) menuTitleText = customTitleEl.textContent.trim();
          if (!menuTitleText && li.firstChild) menuTitleText = li.firstChild.textContent.trim();

          const mainLabelKey = menuTitleText.toLowerCase().replace(/\u00A0/g, " ").replace(/\s+/g, "-");
          const mainImgSrc = imageMap.get(mainLabelKey);

          li.classList.add("has-mega");

          // Desktop mega wrapper
          const mega = document.createElement("div");
          mega.className = "mega-wrapper";

          const colLeft = document.createElement("div");
          colLeft.className = "mega-col mega-left";
          const sectionTitle = document.createElement("h4");
          sectionTitle.textContent = menuTitleText;
          colLeft.append(sectionTitle);
          const horizontalContainer = document.createElement("div");
          horizontalContainer.className = "main-category-list";
          colLeft.append(horizontalContainer);

          const colMid = document.createElement("div");
          colMid.className = "mega-col mega-mid";
          colMid.style.display = 'none';

          const colRightList = document.createElement("div");
          colRightList.className = "mega-col mega-list-container";
          colRightList.style.display = 'none';

          const colDetails = document.createElement("div");
          colDetails.className = "mega-details-panel";

          const bgImg = document.createElement("img");
          bgImg.className = "mega-bg-image";
          bgImg.src = "";
          colDetails.append(bgImg);

          const nestedListContainer = document.createElement("div");
          nestedListContainer.className = "nested-list-container";
          colDetails.append(nestedListContainer);

          const updateDetailsPanel = (primaryKey, parentKey1 = null, parentKey2 = null, subListNode = null) => {
            let imgSrc = imageMap.get(primaryKey);
            if (!imgSrc && parentKey1) imgSrc = imageMap.get(parentKey1);
            if (!imgSrc && parentKey2) imgSrc = imageMap.get(parentKey2);
            if (!imgSrc) imgSrc = mainImgSrc;

            if (imgSrc) {
              bgImg.src = imgSrc;
              bgImg.style.display = 'block';
            } else {
              bgImg.style.display = 'none';
            }

            nestedListContainer.innerHTML = "";
            if (subListNode) nestedListContainer.append(subListNode);
          };

          updateDetailsPanel(mainLabelKey);

          mega.append(colLeft, colMid, colRightList, colDetails);

          // Mobile accordion
          innerList.className = "mobile-menu-container";

          const addMobileToggles = (parentList) => {
            [...parentList.children].forEach(childLi => {
              const subUl = childLi.querySelector("ul");
              if (subUl) {
                childLi.classList.add("has-children");

                if (!childLi.querySelector('.mobile-toggle-btn')) {
                  const arrow = document.createElement("span");
                  arrow.className = "mobile-toggle-btn";
                  arrow.innerHTML = "›";

                  const link = childLi.querySelector("a");
                  if (link) link.after(arrow);
                  else childLi.prepend(arrow);

                  arrow.addEventListener("click", (e) => {
                    if (window.innerWidth < 900) {
                      e.preventDefault();
                      e.stopPropagation();
                      childLi.classList.toggle("expanded");
                    }
                  });
                }

                addMobileToggles(subUl);
              }
            });
          };
          addMobileToggles(innerList);

          // Top-level toggle arrow
          const mainToggleBtn = document.createElement("span");
          mainToggleBtn.className = "mobile-toggle-btn";
          mainToggleBtn.innerHTML = "›";

          if (mainLinkEl) mainLinkEl.after(mainToggleBtn);
          else li.prepend(mainToggleBtn);

          mainToggleBtn.addEventListener("click", (e) => {
            if (window.innerWidth < 900) {
              e.preventDefault();
              e.stopPropagation();
              li.classList.toggle("expanded");
            }
          });

          // Back button for sub-menus
          const backBtn = document.createElement("div");
          backBtn.className = "mobile-back";
          backBtn.innerHTML = menuTitleText || "Back";
          backBtn.addEventListener("click", () => {
            li.classList.remove("expanded");
          });
          innerList.prepend(backBtn);

          // Attach desktop & mobile
          li.innerHTML = "";
          if (mainLinkEl) li.append(mainLinkEl);
          li.append(mainToggleBtn);
          li.append(mega);        // Desktop
          li.append(innerList);   // Mobile

          // Desktop hover events (unchanged)
          [...innerList.children].forEach((level1Li) => {
            const l1LinkEl = level1Li.querySelector("a");
            const l1Text = l1LinkEl ? l1LinkEl.textContent.trim() : level1Li.firstChild.textContent.trim();
            const l1Href = l1LinkEl ? l1LinkEl.href : "#";
            const l1Key = l1Text.toLowerCase().replace(/\u00A0/g, " ").replace(/\s+/g, "-");

            const itemContainer = document.createElement("div");
            itemContainer.className = "cat-item";
            const l1A = document.createElement("a");
            l1A.href = l1Href;
            l1A.innerHTML = `${l1Text} <span class="arrow">></span>`;
            itemContainer.append(l1A);
            horizontalContainer.append(itemContainer);

            itemContainer.addEventListener("mouseenter", () => {
              horizontalContainer.querySelectorAll(".cat-item").forEach(el => el.classList.remove("active"));
              itemContainer.classList.add("active");

              colMid.innerHTML = "";
              colMid.style.display = 'none';
              colRightList.innerHTML = "";
              colRightList.style.display = 'none';

              updateDetailsPanel(l1Key);

              const level2Ul = level1Li.querySelector("ul");
              if (level2Ul) {
                colMid.style.display = 'flex';
                const l2Ul = document.createElement("ul");
                l2Ul.className = "vertical-nav-list";
                colMid.append(l2Ul);

                [...level2Ul.children].forEach((level2Li) => {
                  // ... your original level 2/3/4 hover logic (keep it unchanged)
                });
              }
            });
          });
        });
      }
    }

    const hamburger = document.createElement("div");
    hamburger.classList.add("nav-hamburger");
    hamburger.innerHTML = `<button type="button"><span class="nav-hamburger-icon"></span></button>`;
    hamburger.addEventListener("click", () => toggleMenu(nav, navSections));
    nav.prepend(hamburger);

    toggleMenu(nav, navSections, isDesktop.matches);
    isDesktop.addEventListener("change", () => toggleMenu(nav, navSections, isDesktop.matches));

    const navWrapper = document.createElement("header");
    navWrapper.className = "primary-header header-wrapper";
    const container = document.createElement("div");
    container.className = "container position-relative";

    while (nav.firstChild) container.append(nav.firstChild);
    nav.append(container);
    navWrapper.append(nav);

    function handleHeaderAffix() {
      if (window.scrollY > 10) navWrapper.classList.add("affix");
      else navWrapper.classList.remove("affix");
    }
    handleHeaderAffix();
    window.addEventListener("scroll", handleHeaderAffix, { passive: true });

    block.append(navWrapper);
  } catch (e) {
    console.error("Navigation Decorate Failed:", e);
  }
}
