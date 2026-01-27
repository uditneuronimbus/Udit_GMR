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
          if ((current.tagName === "P" || current.tagName === "DIV") &&
              current.children.length <= 1 && !current.textContent.trim()) {
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
        if (text.startsWith("http") || text.startsWith("/") || text === "#" || text.includes("gmrcorp")) {
          p.remove();
        }
      });

      const menuImgWrapper = navBrand.querySelector(":scope > div > div");
      if (menuImgWrapper) {
        [...menuImgWrapper.children].forEach((div) => {
          if(div.children.length >= 2) {
            const first = div.children[0];
            const second = div.children[1];
            const labelEl = second?.querySelector("p");
            const imgEl = first?.querySelector("img");
            if (!labelEl || !imgEl) return;
            const key = labelEl.textContent.trim().toLowerCase().replace(/\u00A0/g, " ").replace(/\s+/g, "-");
            imageMap.set(key, imgEl.src);
          }
        });
        menuImgWrapper.remove();
      }

      // --- MEGA MENU BUILDER ---
      const mainUl = navBrand.querySelector(":scope > div > ul");
      if (mainUl) {
        [...mainUl.children].forEach((li) => {
          if (li.tagName !== "LI") return;
          const innerList = li.querySelector("ul");
          if (!innerList) return;

          const mainLinkEl = li.querySelector("a");
          let menuTitleText = mainLinkEl ? mainLinkEl.textContent.trim() : "";
          const customTitleEl = li.querySelector("h4");
          let descriptionText = "";
          const allPs = li.querySelectorAll(":scope > p");
          allPs.forEach((p) => {
            if (!p.contains(mainLinkEl) && p.textContent.trim().length > 10) {
              descriptionText = p.textContent.trim();
            }
          });

          if (customTitleEl) menuTitleText = customTitleEl.textContent.trim();
          if (!menuTitleText && li.firstChild) menuTitleText = li.firstChild.textContent.trim();

          const mainLabelKey = menuTitleText.toLowerCase().replace(/\u00A0/g, " ").replace(/\s+/g, "-");
          const mainImgSrc = imageMap.get(mainLabelKey);

          li.classList.add("has-mega");

          const mega = document.createElement("div");
          mega.className = "mega-wrapper";

          // --- COLUMNS ---
          const colLeft = document.createElement("div");
          colLeft.className = "mega-col mega-left";
          const sectionTitle = document.createElement("h4");
          sectionTitle.textContent = menuTitleText;
          colLeft.append(sectionTitle);
          if (descriptionText) {
            const descP = document.createElement("p");
            descP.className = "mega-description";
            descP.textContent = descriptionText;
            colLeft.append(descP);
          }
          const horizontalContainer = document.createElement("div");
          horizontalContainer.className = "main-category-list";
          colLeft.append(horizontalContainer);

          const colMid = document.createElement("div");
          colMid.className = "mega-col mega-mid";

          const colRightList = document.createElement("div");
          colRightList.className = "mega-col mega-list-container";

          const colDetails = document.createElement("div");
          colDetails.className = "mega-col mega-details-panel";

          // --- UPDATED RENDER FUNCTION ---
          // Can accept an optional subList to display alongside the image
          const updateDetailsPanel = (primaryKey, parentKey1, parentKey2, subListNode = null) => {
             colDetails.innerHTML = "";

             // 1. If there's a sub-list (Level 4), append it first
             if (subListNode) {
                 colDetails.append(subListNode);
             }

             // 2. Resolve Image Logic (Priority: Primary -> Parent1 -> Parent2 -> Main)
             let imgSrc = imageMap.get(primaryKey);
             if (!imgSrc && parentKey1) imgSrc = imageMap.get(parentKey1);
             if (!imgSrc && parentKey2) imgSrc = imageMap.get(parentKey2);
             if (!imgSrc) imgSrc = mainImgSrc;

             // 3. Append Image (It will sit below the list due to Flex column)
             if (imgSrc) {
                 const img = document.createElement("img");
                 img.className = "mega-right-image";
                 img.src = imgSrc;
                 colDetails.append(img);
             }
          };

          mega.append(colLeft, colMid, colRightList, colDetails);

          li.innerHTML = "";
          if (mainLinkEl) li.append(mainLinkEl);
          li.append(mega);

          let firstItem = null;

          // Level 1 Loop
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

            // Level 1 Hover
            itemContainer.addEventListener("mouseenter", () => {
              horizontalContainer.querySelectorAll(".cat-item").forEach(el => el.classList.remove("active"));
              itemContainer.classList.add("active");

              colMid.innerHTML = "";
              colRightList.innerHTML = "";
              updateDetailsPanel(l1Key);

              const level2Ul = level1Li.querySelector("ul");
              if (level2Ul) {
                const l2Ul = document.createElement("ul");
                l2Ul.className = "vertical-nav-list";
                colMid.append(l2Ul);

                let firstL2 = null;

                // Level 2 Loop
                [...level2Ul.children].forEach((level2Li) => {
                  const l2LinkEl = level2Li.querySelector("a");
                  const l2Text = l2LinkEl ? l2LinkEl.textContent.trim() : level2Li.textContent.trim();
                  const l2Href = l2LinkEl ? l2LinkEl.href : "#";
                  const l2Key = l2Text.toLowerCase().replace(/\u00A0/g, " ").replace(/\s+/g, "-");

                  const l2Li = document.createElement("li");
                  const l2A = document.createElement("a");
                  l2A.href = l2Href;
                  l2A.textContent = l2Text;
                  l2Li.append(l2A);
                  l2Ul.append(l2Li);

                  // Level 2 Hover
                  l2Li.addEventListener("mouseenter", () => {
                    l2Ul.querySelectorAll("li").forEach(el => el.classList.remove("active"));
                    l2Li.classList.add("active");

                    colRightList.innerHTML = "";
                    updateDetailsPanel(l2Key, l1Key);

                    const level3Ul = level2Li.querySelector("ul");
                    if (level3Ul) {
                      const l3Ul = document.createElement("ul");
                      l3Ul.className = "vertical-nav-list";
                      colRightList.append(l3Ul);

                      // Level 3 Loop
                      [...level3Ul.children].forEach((level3Li) => {
                         const l3LinkEl = level3Li.querySelector("a");
                         const l3Text = l3LinkEl ? l3LinkEl.textContent.trim() : level3Li.firstChild.textContent.trim();
                         const l3Href = l3LinkEl ? l3LinkEl.href : "#";
                         const l3Key = l3Text.toLowerCase().replace(/\u00A0/g, " ").replace(/\s+/g, "-");

                         const l3Li = document.createElement("li");
                         const l3A = document.createElement("a");
                         l3A.href = l3Href;

                         const level4Ul = level3Li.querySelector("ul");
                         if(level4Ul) {
                             l3A.innerHTML = `${l3Text} <span class="right-arrow">›</span>`;
                             l3A.classList.add("has-children");
                         } else {
                             l3A.textContent = l3Text;
                         }

                         l3Li.append(l3A);
                         l3Ul.append(l3Li);

                         // Level 3 Hover (UPDATED)
                         l3Li.addEventListener("mouseenter", () => {
                            l3Ul.querySelectorAll("li").forEach(el => el.classList.remove("active"));
                            l3Li.classList.add("active");

                            let l4List = null;
                            if(level4Ul) {
                                l4List = level4Ul.cloneNode(true);
                                l4List.className = "vertical-nav-list nested-list";
                            }

                            // Pass both the list AND the keys to resolve image
                            updateDetailsPanel(l3Key, l2Key, l1Key, l4List);
                         });
                      });
                    }
                  });

                  if (!firstL2) firstL2 = l2Li;
                });
                if (firstL2) firstL2.dispatchEvent(new MouseEvent("mouseenter"));
              }
            });
            if (!firstItem) firstItem = itemContainer;
          });
          if (firstItem) firstItem.dispatchEvent(new MouseEvent("mouseenter"));
        });
      }
    }

    const navSections = nav.querySelector(".nav-sections");
    if (navSections) {
      navSections.querySelectorAll(":scope .default-content-wrapper > ul > li")
        .forEach((navSection) => {
          if (navSection.querySelector("ul")) navSection.classList.add("nav-drop");
          navSection.addEventListener("click", () => {
            if (isDesktop.matches) {
              const expanded = navSection.getAttribute("aria-expanded") === "true";
              toggleAllNavSections(navSections);
              navSection.setAttribute("aria-expanded", expanded ? "false" : "true");
            }
          });
        });
    }

    const hamburger = document.createElement("div");
    hamburger.classList.add("nav-hamburger");
    hamburger.innerHTML = `<button type="button"><span class="nav-hamburger-icon"></span></button>`;
    hamburger.addEventListener("click", () => toggleMenu(nav, navSections));
    nav.prepend(hamburger);

    toggleMenu(nav, navSections, isDesktop.matches);
    isDesktop.addEventListener("change", () => toggleMenu(nav, navSections, isDesktop.matches));

    const navWrapper = document.createElement("div");
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
  } catch(e) {
      console.error("Navigation Decorate Failed:", e);
  }
}
