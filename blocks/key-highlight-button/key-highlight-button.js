export default function decorate(block) {
  const children = [...block.children];

  const titleRow  = children[0];
  const descRow   = children[1];
  const buttonRow = children[2];

  const items = children.filter(
    (row, index) => index >= 3 && row.querySelector("img")
  );

  block.classList.add("key-highlights");

  /* ---------- Section ---------- */
  const section = document.createElement("div");
  section.className = "sec-key spacer";

  const wrapper = document.createElement("div");
  wrapper.className = "key-highlights-wrapper container";

  /* ---------- Header ---------- */
  const headerRow = document.createElement("div");
  headerRow.className = "row align-items-center mb-5";

  const headerLeft = document.createElement("div");
  headerLeft.className = "col-md-9";

  headerLeft.innerHTML = `
    ${titleRow ? `<h2 class="sec-title">${titleRow.textContent.trim()}</h2>` : ""}
    ${descRow ? `<div class="sec-desc">${descRow.innerHTML}</div>` : ""}
  `;

  const headerRight = document.createElement("div");
  headerRight.className = "col-md-3 text-md-end";

  /* ---------- BUTTON FIX ---------- */
  if (buttonRow) {
    // Franklin rows usually have columns (divs). 
    // We map all divs inside the row to get their text content.
    const cols = [...buttonRow.children];
    
    // Most common Franklin structure: Col 1 = Label, Col 2 = URL
    const label = cols[0]?.textContent?.trim();
    const url = cols[1]?.textContent?.trim() || cols[1]?.querySelector('a')?.href;

    if (label && url) {
      headerRight.innerHTML = `
        <a href="${url}" class="btn btn-primary">
          ${label}
        </a>
      `;
    } else if (label) {
      // Fallback if only label exists (e.g., if it's already a link)
      const link = buttonRow.querySelector('a');
      headerRight.innerHTML = `
        <a href="${link ? link.href : '#'}" class="btn btn-primary">
          ${label}
        </a>
      `;
    }
  }


  headerRow.append(headerLeft, headerRight);
  wrapper.append(headerRow);

  /* ---------- Cards Grid ---------- */
  /* ---------- Cards Grid ---------- */
  const grid = document.createElement("div");
  grid.className = "row g-4";

  items.forEach((item) => {
    // Extract all columns from the row
    // Col 0: Image, Col 1: Title, Col 2: Description, Col 3: Button Label, Col 4: Button URL
    const cols = [...item.children];
    
    const imgEl    = cols[0];
    const titleEl  = cols[1];
    const descEl   = cols[2]; // Added to capture description if needed
    const btnLabel = cols[4]?.textContent?.trim(); // Index 4 based on your JSON model fields
    const btnUrl   = cols[5]?.textContent?.trim() || cols[5]?.querySelector('a')?.href;

    const col = document.createElement("div");
    col.className = "key-col col-md-6 col-lg-4";

    col.innerHTML = `
      <div class="career-card position-relative">
        <div class="career-card-img">
          ${imgEl?.innerHTML || ""}
        </div>
        <div class="career-card-overlay position-absolute bottom-0 start-0 p-3 text-white">
          <h3 class="mb-1">${titleEl?.textContent.trim() || ""}</h3>
          ${btnLabel && btnUrl ? `
            <div class="mt-2">
              <a href="${btnUrl}" class="btn btn-sm btn-light text-primary">
                ${btnLabel}
              </a>
            </div>
          ` : ""}
        </div>
      </div>
    `;

    grid.append(col);
  });

  wrapper.append(grid);

  /* ---------- Replace Block ---------- */
  block.innerHTML = "";
  section.append(wrapper);
  block.append(section);
}





