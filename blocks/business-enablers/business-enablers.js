import { moveInstrumentation } from "../../scripts/scripts.js";

/**
 * Business Enablers Decorator
 * Maps authored items to specific component designs.
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Metadata: Title, Description, Tab1Label, Tab2Label, Tab3Label
  const [titleRow, descriptionRow, t1Row, t2Row, t3Row, ...itemRows] = rows;

  const titleText = titleRow?.textContent?.trim() || "";
  const descriptionHTML = descriptionRow?.children[0]?.innerHTML || descriptionRow?.innerHTML || "";
  const tabBtnLabels = [
    t1Row?.textContent?.trim() || "Tab 1",
    t2Row?.textContent?.trim() || "Tab 2",
    t3Row?.textContent?.trim() || "Tab 3",
  ];

  block.innerHTML = "";

  const container = document.createElement("div");
  container.className = "business-enablers-container container";

  // 1. Intro Section
  const intro = document.createElement("div");
  intro.className = "business-enablers-intro text-center mb-5";

  if (titleRow) {
    const h2 = document.createElement("h2");
    h2.className = "business-enablers-title";
    h2.textContent = titleText;
    moveInstrumentation(titleRow, h2);
    intro.append(h2);
  }

  if (descriptionRow) {
    const desc = document.createElement("div");
    desc.className = "business-enablers-description";
    desc.innerHTML = descriptionHTML;
    moveInstrumentation(descriptionRow, desc);
    intro.append(desc);
  }
  container.append(intro);

  // 2. Tabs Navigation
  const tabsNav = document.createElement("div");
  tabsNav.className = "business-enablers-nav d-flex justify-content-center mb-5 gap-3 tab-buttons-wrap";

  tabBtnLabels.forEach((label, i) => {
    const btn = document.createElement("button");
    btn.className = `btn business-enablers-btn ${i === 0 ? "active" : ""}`;
    btn.textContent = label;
    btn.dataset.tabId = i;

    const labelMetadataRow = [t1Row, t2Row, t3Row][i];
    if (labelMetadataRow) moveInstrumentation(labelMetadataRow, btn);

    tabsNav.append(btn);
  });
  container.append(tabsNav);

  // 3. Panels
  const panelsContainer = document.createElement("div");
  panelsContainer.className = "business-enablers-panels";

  // Parse items
  const itemsData = itemRows.map(row => {
    const cells = [...row.children];
    return {
      type: cells[0]?.textContent?.trim() || "capabilities",
      title: cells[1]?.textContent?.trim() || "",
      contentHTML: cells[2]?.children[0]?.innerHTML || cells[2]?.innerHTML || "",
      desktopPic: cells[3]?.querySelector("picture"),
      mobilePic: cells[4]?.querySelector("picture"),
      imageAlt: cells[5]?.textContent?.trim() || "",
      btnLabel: cells[6]?.textContent?.trim() || "",
      btnLink: cells[7]?.textContent?.trim() || "#",
      originalRow: row
    };
  });

  [0, 1, 2].forEach(index => {
    const data = itemsData[index];
    const panel = document.createElement("div");
    panel.className = `business-enablers-panel ${index === 0 ? "active" : ""}`;
    panel.id = `enabler-panel-${index}`;

    if (data) {
      renderMappedComponent(panel, data);
      moveInstrumentation(data.originalRow, panel);
    } else {
      panel.innerHTML = `<p class="text-center text-muted">Please author content for Tab ${index + 1}</p>`;
    }

    panelsContainer.append(panel);
  });

  container.append(panelsContainer);
  block.append(container);

  // 4. Tab Mechanics
  const btns = tabsNav.querySelectorAll(".business-enablers-btn");
  const panels = panelsContainer.querySelectorAll(".business-enablers-panel");

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.tabId;
      btns.forEach((b) => b.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPanel = panelsContainer.querySelector(`#enabler-panel-${targetId}`);
      if (targetPanel) targetPanel.classList.add("active");
    });
  });

  /**
   * Helper to render based on user type
   */
  function renderMappedComponent(targetEl, data) {
    const { type, title, contentHTML, desktopPic, mobilePic, imageAlt, btnLabel, btnLink } = data;
    const finalAlt = imageAlt || title || "Banner Image";

    if (type === "image-title-desc-button") {
      // Structure of 'image-title-desc-button'
      targetEl.innerHTML = `
        <section class="flat-banner position-relative">
          <div class="flat-bg-wrap"></div>
          <div class="flat-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-end">
            <div class="container">
              <div class="row">
                <div class="col-md-8 mx-auto text-center text-white">
                  <h2 class="flat-title mb-4">${title}</h2>
                  <div class="flat-desc mb-4">${contentHTML}</div>
                  ${btnLabel ? `<a class="btn btn-primary" href="${btnLink}">${btnLabel}</a>` : ""}
                </div>
              </div>
            </div>
          </div>
        </section>
      `;
      const bgWrap = targetEl.querySelector(".flat-bg-wrap");
      if (desktopPic) {
        const d = desktopPic.cloneNode(true);
        const img = d.querySelector("img");
        if (img) {
          img.className = "flat-bg";
          img.alt = finalAlt;
        }
        if (mobilePic) {
          const mSource = mobilePic.querySelector("source")?.cloneNode(true);
          if (mSource) d.prepend(mSource);
        }
        bgWrap.append(d);
      }
    } else if (type === "overlay-banner") {
      // Structure of 'overlay-banner'
      targetEl.innerHTML = `
        <div class="banner-overlay">
          <div class="banner-overlay-img-wrap"></div>
          <div class="banner-overlay-text">
            <div class="row">
              <div class="col-lg-7 col-md-8">
                <h2 class="sec-title mb-4">${title}</h2>
                <div class="sec-desc mb-4">${contentHTML}</div>
                ${btnLabel ? `<a class="btn btn-primary btn-lg" href="${btnLink}">${btnLabel}</a>` : ""}
              </div>
            </div>
          </div>
        </div>
      `;
      const imgWrap = targetEl.querySelector(".banner-overlay-img-wrap");
      if (desktopPic) {
        const d = desktopPic.cloneNode(true);
        const img = d.querySelector("img");
        if (img) {
          img.className = "banner-overlay-img";
          img.alt = finalAlt;
        }
        if (mobilePic) {
          const m = mobilePic.cloneNode(true);
          const mImg = m.querySelector("img");
          if (mImg) {
            mImg.className = "banner-overlay-img mobile-only";
            mImg.alt = finalAlt;
          }
          d.classList.add("desktop-only");
          imgWrap.append(m);
        }
        imgWrap.append(d);
      }
    } else {
      // Fallback: Our Capabilities
      targetEl.innerHTML = `
        <div class="our-capabilities-container">
          <div class="row align-items-center">
            <div class="col-lg-6 our-capabilities-content">
              <h2 class="our-capabilities-title">${title}</h2>
              <div class="our-capabilities-description">${contentHTML}</div>
              ${btnLabel ? `<a class="btn btn-primary our-capabilities-cta" href="${btnLink}">${btnLabel}</a>` : ""}
            </div>
            <div class="col-lg-6 our-capabilities-image-wrap">
              <div class="our-capabilities-pic-target"></div>
            </div>
          </div>
        </div>
      `;
      const picTarget = targetEl.querySelector(".our-capabilities-pic-target");
      if (desktopPic) {
        const d = desktopPic.cloneNode(true);
        if (d.querySelector("img")) d.querySelector("img").alt = finalAlt;
        d.classList.add("d-none", "d-md-block");
        picTarget.append(d);
      }
      if (mobilePic) {
        const m = mobilePic.cloneNode(true);
        if (m.querySelector("img")) m.querySelector("img").alt = finalAlt;
        m.classList.add("d-block", "d-md-none");
        picTarget.append(m);
      }
    }
  }
}
