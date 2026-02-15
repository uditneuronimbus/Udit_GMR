export default function decorate(block) {
  console.log("Decorating Media Cards");

  const rows = [...block.children];

  // need at least title + one card
  if (!rows.length) return;

  /* ================================
     HEADER
  ================================ */
  const title = rows[0]?.textContent?.trim() || "";
  const description = rows[1]?.textContent?.trim() || "";

  /* ================================
     CARD ROWS
     everything after first 2 rows
  ================================ */
  const itemRows = rows.slice(2).filter((row) => row.textContent?.trim());

  if (!itemRows.length) return;

  /* ================================
     HELPER → GET TEXT
  ================================ */
  const getText = (cell) =>
    cell?.innerText?.trim() || cell?.textContent?.trim() || "";

  /* ================================
     BUILD DATA FROM AEM HTML
     (based on your actual structure)
  ================================ */
  const cardsData = [];

  itemRows.forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    const img = cells[1]?.querySelector("img");

    cardsData.push({
      image: img?.src || "",
      imageAlt: img?.alt || "",

      // AEM structure you shared
      title: getText(cells[2]) || getText(cells[3]),
      description: getText(cells[4]),

      // CTA 1
      ctaLabel1: getText(cells[5]),
      link1: cells[6]?.querySelector("a")?.href || "",

      // CTA 2 (optional)
      ctaLabel2: getText(cells[7]),
      link2: cells[8]?.querySelector("a")?.href || "",
    });
  });

  if (!cardsData.length) return;

  /* ================================
     HIDE AUTHORED HTML
  ================================ */
  rows.forEach((row) => (row.style.display = "none"));

  /* ================================
     RUNTIME MARKUP
  ================================ */
  const runtime = document.createElement("section");
  runtime.className = "overview-runtime";

  runtime.innerHTML = `
    <div class="container">

      <div class="overview-header">
        <div class="overview-header-content">
          ${title ? `<h2 class="sec-title">${title}</h2>` : ""}
          ${description ? `<p class="sec-desc">${description}</p>` : ""}
        </div>
      </div>

      <div class="overview-cards row"></div>

    </div>
  `;

  block.after(runtime);

  const cardList = runtime.querySelector(".overview-cards");

  /* ================================
     RENDER CARDS (SHOW ALL)
  ================================ */
  cardsData.forEach((card) => {
    const div = document.createElement("div");
    div.className = "overview-card col-md-6 mt-4";

    div.innerHTML = `
      <div class="card card-ui h-100 p-4">

        ${
          card.image
            ? `
        <div class="card-img">
          <img src="${card.image}" alt="${card.imageAlt}" loading="lazy">
        </div>`
            : ""
        }

        <div class="card-body">

          ${card.title ? `<h5 class="card-title">${card.title}</h5>` : ""}
          ${
            card.description
              ? `<p class="card-text">${card.description}</p>`
              : ""
          }

          ${
            card.link1
              ? `<a href="${card.link1}" class="btn-link">
                  ${card.ctaLabel1 || "READ MORE"}
                </a>`
              : ""
          }

          ${
            card.link2
              ? `<a href="${card.link2}" class="btn-link">
                  ${card.ctaLabel2 || "READ MORE"}
                </a>`
              : ""
          }

        </div>
      </div>
    `;

    cardList.appendChild(div);
  });
}
