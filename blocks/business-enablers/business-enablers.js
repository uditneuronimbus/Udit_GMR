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

  // Global Metadata (First 5 rows)
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

  // 3. Panels Container
  const panelsContainer = document.createElement("div");
  panelsContainer.className = "business-enablers-panels";

  // Parse items with the new 17-cell structure
  const itemsData = [0, 1, 2].map(index => {
    const row = itemRows[index];
    if (!row) return null;
    const cells = [...row.children];

    return {
      type: cells[0]?.textContent?.trim() || "",
      // Target specific fields
      cgSubtitle: cells[1],
      cgIntro: cells[2],
      cgImage: cells[3],
      cgAlt: cells[4],
      abcTitle: cells[5],
      abcDesc: cells[6],
      abcCardTitle: cells[7],
      abcCardImage: cells[8],
      abcCardAlt: cells[9],
      originalRow: row
    };
  });

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
  function createRow(...contentNodes) {
    const row = document.createElement("div");
    contentNodes.forEach(node => {
      const cell = document.createElement("div");
      if (node && node.cloneNode) {
        if (node.children.length === 0 && node.textContent.trim()) {
          const p = document.createElement("p");
          p.textContent = node.textContent.trim();
          cell.append(p);
        } else {
          cell.append(node.cloneNode(true));
        }
      } else {
        const p = document.createElement("p");
        p.innerHTML = "&nbsp;";
        cell.append(p);
      }
      row.append(cell);
    });
    return row;
  }

  /**
   * Helper to execute actual decorators
   */
  async function executeMappedDecorator(targetEl, data) {
    const { type, cgSubtitle, cgIntro, cgImage, cgAlt, abcTitle, abcDesc, abcCardTitle, abcCardImage, abcCardAlt } = data;

    const fakeBlock = document.createElement("div");
    fakeBlock.className = type;

    if (type === "corporate-governance") {
      // corporate-governance.js: Intro, Subtitle, DesktopImg, Alt
      fakeBlock.append(
        createRow(cgIntro),
        createRow(cgSubtitle),
        createRow(cgImage),
        createRow(cgAlt)
      );
      cgDecorator(fakeBlock);
    } else if (type === "all-business-cards") {
      // all-business-cards.js: SectionHeading, CardDescription, CardRows...
      // CardRow: [Image, Alt, Title, Description]
      const cardRow = createRow(abcCardImage, abcCardAlt, abcCardTitle, abcDesc);

      fakeBlock.append(
        createRow(abcTitle),
        createRow(abcDesc),
        cardRow
      );
      await abcDecorator(fakeBlock);
    }

    targetEl.append(fakeBlock);
  }
}
