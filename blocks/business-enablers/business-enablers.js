import { moveInstrumentation } from "../../scripts/scripts.js";
import { loadCSS } from "../../scripts/aem.js";
import cgDecorator from "../corporate-governance/corporate-governance.js";
import abcDecorator from "../all-business-cards/all-business-cards.js";

/**
 * Business Enablers Decorator
 * Executes actual decorators of other components inside tab panels.
 */
export default async function decorate(block) {
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
      type: cells[0]?.textContent?.trim() || "corporate-governance",
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

  // Pre-load CSS for mapped components
  loadCSS("/blocks/corporate-governance/corporate-governance.css");
  loadCSS("/blocks/all-business-cards/all-business-cards.css");

  [0, 1, 2].forEach(index => {
    const data = itemsData[index];
    const panel = document.createElement("div");
    panel.className = `business-enablers-panel ${index === 0 ? "active" : ""}`;
    panel.id = `enabler-panel-${index}`;

    if (data && data.type !== "Select an option...") {
      executeMappedDecorator(panel, data);
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
   * Helper to execute actual decorators
   */
  function executeMappedDecorator(targetEl, data) {
    const { type, title, description, desktopImage, imageAlt } = data;

    // Create a "Fake Block" that looks like what the target expects
    const fakeBlock = document.createElement("div");
    fakeBlock.className = type;

    if (type === "corporate-governance") {
      // corporate-governance expects: 
      // 1. Intro paragraphs (richtext)
      // 2. Section subtitle (text)
      // 3. Desktop image (reference)
      // 4. Alt text (text)
      // Followed by section items if any, but we map fields to the header part

      fakeBlock.append(
        description.cloneNode(true),
        title.cloneNode(true),
        desktopImage.cloneNode(true),
        imageAlt.cloneNode(true)
      );
      cgDecorator(fakeBlock);
    } else if (type === "all-business-cards") {
      // all-business-cards expects:
      // 1. Section Heading (text)
      // 2. Card Description (richtext)
      // 3... Card Items: [Image, Alt, Title, Description]

      const cardRow = document.createElement("div");
      cardRow.append(
        desktopImage.cloneNode(true),
        imageAlt.cloneNode(true),
        title.cloneNode(true),
        description.cloneNode(true)
      );

      fakeBlock.append(
        title.cloneNode(true),
        description.cloneNode(true),
        cardRow
      );
      abcDecorator(fakeBlock);
    }

    targetEl.append(fakeBlock);
  }
}
