import { getMetadata } from "../../scripts/aem.js";
import { loadFragment } from "../fragment/fragment.js";

const isDesktop = window.matchMedia("(min-width: 900px)");

// --- Helper Functions ---
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

  document.body.style.overflowY =
    willBeExpanded && !isDesktop.matches ? "hidden" : "";
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

// Add mobile backdrop functionality
function addMobileBackdrop(nav) {
  const backdrop = document.createElement('div');
  backdrop.className = 'mobile-menu-backdrop';
  nav.appendChild(backdrop);

  backdrop.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const navSections = nav.querySelector('.nav-sections');
    if (navSections) {
      toggleMenu(nav, navSections, false);
    }
  });
}

// Collapse all mobile menus
function collapseAllMobileMenus(nav) {
  const expandedItems = nav.querySelectorAll('.mobile-root-item.expanded, .mobile-menu-container li.expanded');
  expandedItems.forEach(item => {
    item.classList.remove('expanded');
  });

  const mobileContainers = nav.querySelectorAll('.mobile-menu-container.show');
  mobileContainers.forEach(container => {
    container.classList.remove('show');
  });
}

// --- Main Decorate Function ---

export default async function decorate(block) {
  try {
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

    // MOBILE ROOT LIST (top-level list like screenshot 3)
    const mobileRootList = document.createElement("ul");
    mobileRootList.className = "mobile-root-list";

    // Add language selector to mobile menu (like "ENG ▼" from screenshot)
    const languageSelector = document.createElement('div');
    languageSelector.className = 'mobile-language-selector';
    languageSelector.innerHTML = `
      <select aria-label="Select language">
        <option value="en">ENG</option>
        <option value="es">ESP</option>
        <option value="fr">FRA</option>
        <option value="de">DEU</option>
      </select>
    `;

    if (navBrand) {
      // Add language selector first
      navBrand.append(languageSelector);
      // Then add the mobile root list
      navBrand.append(mobileRootList);
    }

    // Add mobile backdrop
    addMobileBackdrop(nav);

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
        if (picture.parentNode) {
          picture.parentNode.insertBefore(logoLink, picture);
          logoLink.appendChild(picture);
        }
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

      const menuImgWrapper = navBrand.querySelector(":scope > div > div");
      if (menuImgWrapper) {
        [...menuImgWrapper.children].forEach((div) => {
          if (div.children.length >= 2) {
            const first = div.children[0];
            const second = div.children[1];
            const labelEl = second?.querySelector("p");
            const imgEl = first?.querySelector("img");
            if (!labelEl || !imgEl) return;
            const key = labelEl.textContent
              .trim()
              .toLowerCase()
              .replace(/\u00A0/g, " ")
              .replace(/\s+/g, "-");
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
          if (!menuTitleText && li.firstChild)
            menuTitleText = li.firstChild.textContent.trim();

          const mainLabelKey = menuTitleText
            .toLowerCase()
            .replace(/\u00A0/g, " ")
            .replace(/\s+/g, "-");
          const mainImgSrc = imageMap.get(mainLabelKey);

          li.classList.add("has-mega");

          // 1. DESKTOP MEGA WRAPPER
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
          colMid.style.display = "none";

          const colRightList = document.createElement("div");
          colRightList.className = "mega-col mega-list-container";
          colRightList.style.display = "none";

          const colDetails = document.createElement("div");
          colDetails.className = "mega-details-panel";

          const bgImg = document.createElement("img");
          bgImg.className = "mega-bg-image";
          bgImg.src = "";
          bgImg.alt = "";
          colDetails.append(bgImg);

          const nestedListContainer = document.createElement("div");
          nestedListContainer.className = "nested-list-container";
          colDetails.append(nestedListContainer);

          const updateDetailsPanel = (
            primaryKey,
            parentKey1,
            parentKey2,
            subListNode = null,
          ) => {
            let imgSrc = imageMap.get(primaryKey);
            if (!imgSrc && parentKey1) imgSrc = imageMap.get(parentKey1);
            if (!imgSrc && parentKey2) imgSrc = imageMap.get(parentKey2);
            if (!imgSrc) imgSrc = mainImgSrc;

            if (imgSrc) {
              bgImg.src = imgSrc;
              bgImg.style.display = "block";
            } else {
              bgImg.style.display = "none";
            }

            nestedListContainer.innerHTML = "";
            if (subListNode) {
              nestedListContainer.append(subListNode);
            }
          };
          updateDetailsPanel(mainLabelKey);

          mega.append(colLeft, colMid, colRightList, colDetails);

          // 2. MOBILE MENU LOGIC
          innerList.className = "mobile-menu-container";

          const addMobileToggles = (parentList) => {
            [...parentList.children].forEach((childLi) => {
              const subUl = childLi.querySelector(":scope > ul");
              if (subUl) {
                childLi.classList.add("has-children");
                if (!childLi.querySelector(".mobile-toggle-btn")) {
                  const arrow = document.createElement("span");
                  arrow.className = "mobile-toggle-btn";
                  arrow.innerHTML = "›";
                  arrow.setAttribute("aria-label", "Toggle submenu");

                  const link = childLi.querySelector(":scope > a");
                  if (link) {
                    link.after(arrow);
                  } else {
                    childLi.prepend(arrow);
                  }

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

          // 3. BUILD MOBILE ROOT ITEM (top level – About us, Businesses…)
          const mobileRootLi = document.createElement("li");
          mobileRootLi.className = "mobile-root-item";

          const mobileRootLink = document.createElement("a");
          mobileRootLink.textContent = menuTitleText;
          mobileRootLink.href = mainLinkEl ? mainLinkEl.href : "#";
          mobileRootLink.setAttribute("role", "menuitem");
          mobileRootLi.append(mobileRootLink);

          // Only add toggle arrow if there are submenus
          if (innerList.children.length > 0) {
            const mobileRootArrow = document.createElement("span");
            mobileRootArrow.className = "mobile-root-toggle";
            mobileRootArrow.innerHTML = "›";
            mobileRootArrow.setAttribute("aria-label", "Toggle menu");
            mobileRootLi.append(mobileRootArrow);

            mobileRootArrow.addEventListener("click", (e) => {
              if (window.innerWidth < 900) {
                e.preventDefault();
                e.stopPropagation();
                mobileRootLi.classList.toggle("expanded");
              }
            });

            // Link click handler for items with children
            mobileRootLink.addEventListener("click", (e) => {
              if (window.innerWidth < 900) {
                e.preventDefault();
                e.stopPropagation();
                mobileRootLi.classList.toggle("expanded");
              }
            });
          } else {
            // Link click handler for items without children
            mobileRootLink.addEventListener("click", (e) => {
              if (window.innerWidth < 900) {
                // Close menu when clicking on a leaf item
                const navSections = nav.querySelector('.nav-sections');
                if (navSections) {
                  toggleMenu(nav, navSections, false);
                  collapseAllMobileMenus(nav);
                }
              }
            });
          }

          // attach the inner mobile container under this item
          mobileRootLi.append(innerList);
          mobileRootList.append(mobileRootLi);

          // 4. ATTACH DESKTOP STRUCTURE TO ORIGINAL LI
          li.innerHTML = "";
          if (mainLinkEl) li.append(mainLinkEl);
          li.append(mega); // desktop only

          // 5. DESKTOP EVENTS
          [...innerList.children].forEach((level1Li) => {
            const l1LinkEl = level1Li.querySelector("a");
            const l1Text = l1LinkEl
              ? l1LinkEl.textContent.trim()
              : level1Li.firstChild.textContent.trim();
            const l1Href = l1LinkEl ? l1LinkEl.href : "#";
            const l1Key = l1Text
              .toLowerCase()
              .replace(/\u00A0/g, " ")
              .replace(/\s+/g, "-");

            const itemContainer = document.createElement("div");
            itemContainer.className = "cat-item";
            const l1A = document.createElement("a");
            l1A.href = l1Href;
            l1A.innerHTML = `${l1Text} <span class="arrow">></span>`;
            itemContainer.append(l1A);
            horizontalContainer.append(itemContainer);

            itemContainer.addEventListener("mouseenter", () => {
              horizontalContainer
                .querySelectorAll(".cat-item")

