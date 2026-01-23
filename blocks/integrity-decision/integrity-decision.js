export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 3) return;

  /* ================================
     1️⃣ Read authored content
     ================================ */
  const sectionTitle = rows[0].textContent.trim();
  const sectionDesc = rows[1].innerHTML;
  const cardRows = rows.slice(2);

  /* Hide authored rows (UE safe) */
  rows.forEach((row) => (row.style.display = "none"));

  /* ================================
     2️⃣ Build section
     ================================ */
  const section = document.createElement("section");
  section.className = "sec-integrity spacer";

  section.innerHTML = `
    <div class="container">
      <div class="row">
        <div class="col-md-8 mx-auto text-center mb-5">
          <h2 class="sec-title">${sectionTitle}</h2>
          <div class="sec-desc">${sectionDesc}</div>
        </div>
      </div>

      <div class="integrity-cards"></div>
    </div>
  `;

  block.append(section);

  const cardsWrapper = section.querySelector(".integrity-cards");

  /* ================================
     3️⃣ Build cards (same as sample)
     ================================ */
  cardRows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 3) return;

    const img = cells[0].querySelector("img");
    const title = cells[1].textContent.trim();
    const desc = cells[2].innerHTML;

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
