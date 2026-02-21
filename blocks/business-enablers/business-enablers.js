import { moveInstrumentation } from "../../scripts/scripts.js";
import { loadCSS } from "../../scripts/aem.js";

/**
 * Business Enablers Decorator
 * Executes actual decorators of other components inside tab panels.
 */
export default async function decorate(block) {
  const rows = [...block.children];

  // Robustly identify metadata vs items
  // Total of 5 metadata fields: title, description, tab1Label, tab2Label, tab3Label
  // But Franklin might not render all if empty. We'll take the first 5 rows as metadata.
  const metadataRowCount = 5;
  const metadataRows = rows.slice(0, metadataRowCount);
  const itemRows = rows.slice(metadataRowCount);

  const [titleRow, descriptionRow, t1Row, t2Row, t3Row] = metadataRows;

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

  if (titleText && titleText !== "Select an option...") {
    const h2 = document.createElement("h2");
    h2.className = "business-enablers-title";
    h2.textContent = titleText;
    moveInstrumentation(titleRow, h2);
    intro.append(h2);
  }

  if (descriptionHTML && descriptionHTML !== "<div></div>") {
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

  // Pre-fetch decorators dynamically to be safe
  let cgDecorator, abcDecorator;
  try {
    const [cgMod, abcMod] = await Promise.all([
      import("../corporate-governance/corporate-governance.js"),
      import("../all-business-cards/all-business-cards.js")
    ]);
    cgDecorator = cgMod.default;
    abcDecorator = abcMod.default;
  } catch (e) {
    console.error("Failed to load component decorators", e);
  }

  // Parse items
  const itemsData = itemRows.map(row => {
    const cells = [...row.children];
    return {
      type: cells[0]?.textContent?.trim() || "",
      title: cells[1],
      description: cells[2],
      desktopImage: cells[3],
      mobileImage: cells[4],
      imageAlt: cells[5],
      buttonLabel: cells[6],
      buttonLink: cells[7],
      originalRow: row
    };
  });

  // Pre-load CSS
  loadCSS("/blocks/corporate-governance/corporate-governance.css");
  loadCSS("/blocks/all-business-cards/all-business-cards.css");

  [0, 1, 2].forEach(index => {
    const data = itemsData[index];
    const panel = document.createElement("div");
    panel.className = `business-enablers-panel ${index === 0 ? "active" : ""}`;
    panel.id = `enabler-panel-${index}`;

    if (data && data.type && data.type !== "Select an option...") {
      executeMappedDecorator(panel, data, cgDecorator, abcDecorator);
      moveInstrumentation(data.originalRow, panel);
    } else {
      panel.innerHTML = `<div class="placeholder-content">Please author a <b>Business Enablers Item</b> for Tab ${index + 1} and select a <b>Component Type</b>.</div>`;
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
   * Helper to execute actual decorators with safety checks
   */
  async function executeMappedDecorator(targetEl, data, cgDec, abcDec) {
    const { type, title, description, desktopImage, mobileImage, imageAlt, buttonLabel, buttonLink } = data;

    const fakeBlock = document.createElement("div");
    fakeBlock.className = type;

    // Helper to safely clone nodes
    const getSafe = (node) => (node && node.cloneNode) ? node.cloneNode(true) : document.createElement("div");

    if (type === "corporate-governance") {
      if (!cgDec) return;
      // Expects: Intro, Subtitle, DesktopImg, Alt
      fakeBlock.append(
        getSafe(description),
        getSafe(title),
        getSafe(desktopImage),
        getSafe(imageAlt)
      );
      cgDec(fakeBlock);
    } else if (type === "all-business-cards") {
      if (!abcDec) return;
      // Expects: SectionTitle, SectionDesc, CardRows...
      const cardRow = document.createElement("div");
      cardRow.append(
        getSafe(desktopImage),
        getSafe(imageAlt),
        getSafe(title),
        getSafe(description),
        document.createElement("div"), // extra cells just in case
        document.createElement("div")
      );

      fakeBlock.append(
        getSafe(title),
        getSafe(description),
        cardRow
      );
      await abcDec(fakeBlock);
    }

    targetEl.append(fakeBlock);
  }
}
