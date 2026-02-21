import { moveInstrumentation } from "../../scripts/scripts.js";

/**
 * Business Enablers Decorator
 * Simplified version with only Title, Description and Tab Labels.
 */
export default async function decorate(block) {
  const rows = [...block.children];

  // Metadata (Title, Description, Tab1, Tab2, Tab3)
  const [titleRow, descriptionRow, t1Row, t2Row, t3Row] = rows;

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

  block.append(container);

  // 4. Tab Mechanics
  const btns = tabsNav.querySelectorAll(".business-enablers-btn");

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      btns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      // Panel logic removed as items were deleted
    });
  });
}
