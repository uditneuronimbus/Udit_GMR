import { getMetadata } from "../../scripts/aem.js";
import { loadFragment } from "../fragment/fragment.js";

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

  document.body.style.overflowY =
    // willBeExpanded || isDesktop.matches ? "" : "hidden";
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

        let descriptionText = "";
        const allPs = li.querySelectorAll(":scope > p");
        allPs.forEach((p) => {
          if (!p.contains(mainLinkEl) && p.textContent.trim().length > 10) {
            descriptionText = p.textContent.trim();
          }
        });

        if (customTitleEl) menuTitleText = customTitleEl.textContent.trim();
        if (!menuTitleText && li.firstChild)
          menuTitleText = li.firstChild.textContent.trim();

        const mainLabelKey = menuTitleText
          .toLowerCase()
          .replace(/\u00A0/g, " ")
          .replace(/\s+/g, "-");
        const mainImgSrc = imageMap.get(mainLabelKey);

        li.classList.add("has-mega");

        // MEGA WRAPPER
        const mega = document.createElement("div");
        mega.className = "mega-wrapper";

        // LEFT COL
        const colLeft = document.createElement("div");
        colLeft.className = "mega-left";
        const sectionTitle = document.createElement("h4");
        sectionTitle.textContent = menuTitleText;
        colLeft.append(sectionTitle);

        // MID COL
        const colMid = document.createElement("div");
        colMid.className = "mega-mid";

        // RIGHT COL
        const colRight = document.createElement("div");
        colRight.className = "mega-right";
        const rightImg = document.createElement("img");
        rightImg.className = "mega-dynamic-image";
        colRight.append(rightImg);

        if (mainImgSrc) rightImg.src = mainImgSrc;

        const hasNestedSubmenus = [...innerList.children].some((child) =>
          child.querySelector("ul"),
        );

        if (!hasNestedSubmenus) {
          // SIMPLE LAYOUT
          if (descriptionText) {
            const descP = document.createElement("p");
            descP.className = "mega-description";
            descP.textContent = descriptionText;
            colLeft.append(descP);
          }

          const simpleUl = document.createElement("ul");
          simpleUl.className = "mega-simple-list";

          [...innerList.children].forEach((item) => {
            const link = item.querySelector("a");
            const text = link
              ? link.textContent.trim()
              : item.textContent.trim();
            const href = link ? link.href : "#";
            const key = text
              .toLowerCase()
              .replace(/\u00A0/g, " ")
              .replace(/\s+/g, "-");

            const liEl = document.createElement("li");
            const aEl = document.createElement("a");
            aEl.textContent = text;
            aEl.href = href;

            liEl.addEventListener("mouseenter", () => {
              const specificImg = imageMap.get(key);
              if (specificImg) {
                rightImg.src = specificImg;
              }
            });

            liEl.append(aEl);
            simpleUl.append(liEl);
          });
          colMid.append(simpleUl);
        } else {
          // COMPLEX LAYOUT
          const leftContainer = document.createElement("div");
          leftContainer.className = "left-accordion-container";
          colLeft.append(leftContainer);

          const midTitleL1 = document.createElement("a");
          midTitleL1.className = "mid-title-l1";
          const midTitleL2 = document.createElement("a");
          midTitleL2.className = "mid-title-l2";
          const midContent = document.createElement("div");
          midContent.className = "mid-panel-content";

          colMid.append(midTitleL1, midTitleL2, midContent);

          const updateSelection = (
            titleL1,
            hrefL1,
            titleL2,
            hrefL2,
            contentClone,
            imgKey,
          ) => {
            midTitleL1.textContent = titleL1;
            midTitleL1.href = hrefL1 || "#";
            midTitleL2.textContent = titleL2;
            midTitleL2.href = hrefL2 || "#";
            midContent.innerHTML = "";
            if (contentClone) midContent.append(contentClone);

            const specificImg = imageMap.get(imgKey);
            if (specificImg) {
              rightImg.src = specificImg;
            }
          };

          let firstL1Item = null;
          let firstL2Item = null;

          [...innerList.children].forEach((level1Li, l1Index) => {
            const l1LinkEl = level1Li.querySelector("a");
            const l1Text = l1LinkEl
              ? l1LinkEl.textContent.trim()
              : level1Li.firstChild.textContent.trim();
            const l1Href = l1LinkEl ? l1LinkEl.href : "#";

            const accItem = document.createElement("div");
            accItem.className = "acc-item";
            const accHeader = document.createElement("div");
            accHeader.className = "acc-header";
            accHeader.innerHTML = `<span>${l1Text}</span><span class="acc-toggle"></span>`;
            const accBody = document.createElement("div");
            accBody.className = "acc-body";

            accHeader.addEventListener("click", () => {
              const isOpen = accItem.classList.contains("open");
              leftContainer
                .querySelectorAll(".acc-item")
                .forEach((item) => item.classList.remove("open"));
              if (!isOpen) accItem.classList.add("open");
            });

            accItem.append(accHeader, accBody);
            leftContainer.append(accItem);

            const level2Ul = level1Li.querySelector("ul");
            if (level2Ul) {
              [...level2Ul.children].forEach((level2Li, l2Index) => {
                const l2LinkEl = level2Li.querySelector("a");
                const clone = level2Li.cloneNode(true);
                if (clone.querySelector("ul"))
                  clone.querySelector("ul").remove();
                const l2Text = clone.textContent.trim();
                const l2Href = l2LinkEl ? l2LinkEl.href : "#";
                const l2Key = l2Text
                  .toLowerCase()
                  .replace(/\u00A0/g, " ")
                  .replace(/\s+/g, "-");

                const subItem = document.createElement("div");
                subItem.className = "sub-link";
                subItem.textContent = l2Text;

                const triggerUpdate = () => {
                  leftContainer
                    .querySelectorAll(".sub-link")
                    .forEach((el) => el.classList.remove("active"));
                  subItem.classList.add("active");
                  const level3Ul = level2Li.querySelector("ul");
                  const l3Clone = level3Ul ? level3Ul.cloneNode(true) : null;
                  updateSelection(
                    l1Text,
                    l1Href,
                    l2Text,
                    l2Href,
                    l3Clone,
                    l2Key,
                  );
                };

                subItem.addEventListener("mouseenter", triggerUpdate);
                subItem.addEventListener("click", triggerUpdate);

                if (l1Index === 0 && l2Index === 0) {
                  firstL2Item = subItem;
                  firstL1Item = accItem;
                }
                accBody.append(subItem);
              });
            }
          });

          if (firstL1Item) firstL1Item.classList.add("open");
          if (firstL2Item) firstL2Item.dispatchEvent(new Event("click"));
        }

        mega.append(colLeft, colMid, colRight);
        li.innerHTML = "";
        if (mainLinkEl) li.append(mainLinkEl);
        li.append(mega);
      });
    }
  }

  const navSections = nav.querySelector(".nav-sections");
  if (navSections) {
    navSections
      .querySelectorAll(":scope .default-content-wrapper > ul > li")
      .forEach((navSection) => {
        if (navSection.querySelector("ul"))
          navSection.classList.add("nav-drop");
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
  hamburger.innerHTML = `<button type="button"><span class="nav-hamburger-icon"></span></button>`;
  hamburger.addEventListener("click", () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);

  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener("change", () =>
    toggleMenu(nav, navSections, isDesktop.matches),
  );

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

  block.innerHTML = "";
  block.append(navWrapper);
}
