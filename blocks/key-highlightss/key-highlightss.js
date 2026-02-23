export default function decorate(block) {
  const [titleEl, descEl, ...items] = [...block.children];
  block.classList.add("key-highlights");

  const section = document.createElement("div");
  section.className = "sec-key spacer";
  const wrapper = document.createElement("div");
  wrapper.className = "key-highlights-wrapper container";

  // Header (unchanged)
  const headerRow = document.createElement("div");
  headerRow.className = "row";
  const header = document.createElement("div");
  header.className = "col-md-7 text-center mx-auto mb-5";

  const sectionTitle = titleEl ? titleEl.textContent.trim() : "";
  const sectionDesc = descEl ? descEl.innerHTML.trim() : "";

  if (sectionTitle || sectionDesc) {
    header.innerHTML = `
      ${sectionTitle ? `<h2 class="sec-title">${sectionTitle}</h2>` : ""}
      ${sectionDesc ? `<div class="sec-desc">${sectionDesc}</div>` : ""}
    `;
  }

  headerRow.append(header);
  wrapper.append(headerRow);

  // Grid
  const grid = document.createElement("div");
  grid.className = "key-row row g-4 justify-content-center";

  items.forEach((item) => {
    if (!item || !item.children.length) return;

    // Order: image cell, alt-text cell, title cell, description cell, link text cell, link url cell
    const [imgCell, altCell, titleCell, descCell, labelCell, urlCell] = [...item.children];

    const authoredAlt = altCell?.textContent?.trim() || "";
    const cardTitle = titleCell?.textContent?.trim() || "";
    const cardDesc = descCell ? descCell.innerHTML.trim() : "";
    const btnLabel = labelCell?.textContent?.trim() || "";
    const btnUrl = urlCell?.textContent?.trim() || "";

    // Fallback logic: alt = authoredAlt if exists, else cardTitle, else ""
    const finalAlt = authoredAlt || cardTitle || "";

    item.className = "key-col col-md-6 col-lg-4 mt-4";

    let imgHtml = imgCell?.innerHTML?.trim() || "";

    if (imgHtml && finalAlt) {
      // Parse the rendered picture/img structure
      const temp = document.createElement("div");
      temp.innerHTML = imgHtml;

      const img = temp.querySelector("img");
      if (img) {
        // Set / override alt reliably using DOM
        img.setAttribute("alt", finalAlt);
        imgHtml = temp.innerHTML;
      }
    } else if (imgHtml) {
      // No alt & no title → ensure at least empty alt for accessibility
      const temp = document.createElement("div");
      temp.innerHTML = imgHtml;
      const img = temp.querySelector("img");
      if (img && !img.hasAttribute("alt")) {
        img.setAttribute("alt", "");
        imgHtml = temp.innerHTML;
      }
    }

    item.innerHTML = `
    <div class="card card-ui-three h-100">
      ${imgHtml ? `<div class="card-img">${imgHtml}</div>` : ""}
      <div class="card-body d-flex flex-column">
        ${cardTitle ? `<h3>${cardTitle}</h3>` : ""}
        ${cardDesc || ""}
        ${(btnLabel && btnUrl) ? `
          <div class="mt-auto pt-3">
            <a href="${btnUrl}" class="btn btn-outline-primary btn-sm">${btnLabel}</a>
          </div>
        ` : ""}
      </div>
    </div>`;
  });

  grid.append(...items);
  wrapper.append(grid);

  block.innerHTML = "";
  section.append(wrapper);
  block.append(section);
}