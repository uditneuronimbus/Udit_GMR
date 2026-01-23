export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  /* ================================
     1️⃣ Read authored content
     ================================ */
  const headerRow = rows.shift();
  const headerCells = [...headerRow.children];

  const sectionTitle = headerCells[0]?.textContent?.trim() || "";
  const sectionDesc = headerCells[1]?.innerHTML || "";

  const itemRows = rows;

  /* Hide authored content (UE safe) */
  [...block.children].forEach((row) => {
    row.style.display = "none";
  });

  /* ================================
     2️⃣ Build section
     ================================ */
  const section = document.createElement("section");
  section.className = "sec-integrity spacer";

  section.innerHTML = `
    <div class="container">
      <div class="sec-head text-center mb-5">
        <h2 class="sec-title">${sectionTitle}</h2>
        <div class="sec-desc">${sectionDesc}</div>
      </div>

      <div class="integrity-cards"></div>
    </div>
  `;

  block.after(section);

  const cardsWrapper = section.querySelector(".integrity-cards");

  /* ================================
     3️⃣ Build cards
     ================================ */
  itemRows.forEach((row) => {
    const cells = [...row.children];

    const img = cells[0]?.querySelector("img");
    const title = cells[1]?.textContent?.trim() || "";
    const desc = cells[2]?.innerHTML || "";

    const card = document.createElement("div");
    card.className = "integrity-card";

    card.innerHTML = `
      <div class="card-ui">
        ${
          img
            ? `<div class="card-icon">
                <img src="${img.src}" alt="${img.alt || ""}">
              </div>`
            : ""
        }
        <h3 class="card-title">${title}</h3>
        <div class="card-desc">${desc}</div>
      </div>
    `;

    cardsWrapper.append(card);
  });
}
