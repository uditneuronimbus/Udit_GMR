import { moveInstrumentation } from "../../scripts/scripts.js";
import { loadCSS } from "../../scripts/aem.js";
import cgDecorator from "../corporate-governance/corporate-governance.js";
import abcDecorator from "../all-business-cards/all-business-cards.js";

/**
 * Business Enablers Decorator
 * Maps authored content into existing component decorators.
 */
export default async function decorate(block) {
  const rows = [...block.children];

  // 1. Identification: First 5 rows are "Global" metadata for the whole block
  const [titleRow, descriptionRow, t1Row, t2Row, t3Row, ...itemRows] = rows;

  const titleText = titleRow?.textContent?.trim() || "";
  const descriptionHTML = descriptionRow?.children[0]?.innerHTML || descriptionRow?.innerHTML || "";
  const tabBtnLabels = [
    t1Row?.textContent?.trim() || "Tab 1",
    t2Row?.textContent?.trim() || "Tab 2",
    t3Row?.textContent?.trim() || "Tab 3",
  ];

  // Clear immediately to prevent raw display
  block.innerHTML = "";

  const container = document.createElement("div");
  container.className = "business-enablers-container container";

  // 1. Intro Section (Top of the whole Business Enablers block)
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

  // Parse items
  const itemsData = [0, 1, 2].map(index => {
    const row = itemRows[index];
    if (!row) return null;
    const cells = [...row.children];
    return {
      type: cells[0]?.textContent?.trim() || "",
      tabTitle: cells[1],
      tabDescription: cells[2],
      desktopImage: cells[3],
      mobileImage: cells[4],
      imageAlt: cells[5],
      buttonLabel: cells[6],
      buttonLink: cells[7],
      originalRow: row
    };
  });

  // Load CSS for targets
  loadCSS("/blocks/corporate-governance/corporate-governance.css");
  loadCSS("/blocks/all-business-cards/all-business-cards.css");

  itemsData.forEach((data, index) => {
    const panel = document.createElement("div");
    panel.className = `business-enablers-panel ${index === 0 ? "active" : ""}`;
    panel.id = `enabler-panel-${index}`;

    if (data && data.type && data.type !== "Select an option...") {
      executeMappedDecorator(panel, data);
      moveInstrumentation(data.originalRow, panel);
    } else {
      panel.innerHTML = `<div class="placeholder-content">Please author <b>"Business Enablers Item"</b> ${index + 1} and select a <b>"Component Type"</b>.</div>`;
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
   * Helper to create a standard Franklin row-cell structure
   */
  function createRow(contentNode) {
    const row = document.createElement("div");
    const cell = document.createElement("div");
    if (contentNode && contentNode.cloneNode) {
      // Re-wrap in 'p' if it's plain text, as Franklin decorators often expect 'p'
      if (contentNode.children.length === 0 && contentNode.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = contentNode.textContent.trim();
        cell.append(p);
      } else {
        cell.append(contentNode.cloneNode(true));
      }
    } else {
      // Empty cell but must exist
      const p = document.createElement("p");
      p.innerHTML = "&nbsp;";
      cell.append(p);
    }
    row.append(cell);
    return row;
  }

  /**
   * Helper to execute actual decorators
   */
  async function executeMappedDecorator(targetEl, data) {
    const { type, tabTitle, tabDescription, desktopImage, imageAlt } = data;

    const fakeBlock = document.createElement("div");
    fakeBlock.className = type;

    if (type === "corporate-governance") {
      // corporate-governance.js expects:
      // Row 1: Introparagraphs (richtext)
      // Row 2: Section subtitle (text)
      // Row 3: Desktop image (reference)
      // Row 4: Alt text (text)
      fakeBlock.append(
        createRow(tabDescription),
        createRow(tabTitle),
        createRow(desktopImage),
        createRow(imageAlt)
      );
      cgDecorator(fakeBlock);
    } else if (type === "all-business-cards") {
      // all-business-cards.js expects:
      // Row 1: Section Heading (text)
      // Row 2: Card Description (richtext)
      // Row 3... Card Rows: [Image, Alt, Title, Description]
      const cardRow = document.createElement("div");
      // Multi-cell row
      [desktopImage, imageAlt, tabTitle, tabDescription].forEach(node => {
        const cell = document.createElement("div");
        if (node) cell.append(node.cloneNode(true));
        cardRow.append(cell);
      });

      fakeBlock.append(
        createRow(tabTitle),
        createRow(tabDescription),
        cardRow
      );
      await abcDecorator(fakeBlock);
    }

    targetEl.append(fakeBlock);
  }
}
