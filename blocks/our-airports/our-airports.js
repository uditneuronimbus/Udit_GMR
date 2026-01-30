export default function decorate(block) {
  console.log("Decorating Our Airports block");

  const rows = [...block.children];
  if (rows.length < 5) return;

  /* ================================
     1️⃣ Read header rows (REAL STRUCTURE)
     ================================ */
  const title =
    rows[0]?.textContent?.trim() || "";

  const description =
    rows[1]?.innerHTML?.trim() ||
    rows[1]?.textContent?.trim();

  /* ================================
     2️⃣ Find first CARD row dynamically
     ================================ */
  const itemRows = rows.slice(2).filter((row) =>
    row.textContent?.trim()
  );

  /* ================================
     3️⃣ Build tab → cards map
     ================================ */
  const tabsMap = {};

  itemRows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 7) return;

    const tabKey = cells[0]?.textContent?.trim();
    if (!tabKey) return;

    if (!tabsMap[tabKey]) {
      tabsMap[tabKey] = [];
    }

    const img = cells[1]?.querySelector("img");

    tabsMap[tabKey].push({
      image: img ? img.src : "",
      badge: cells[2]?.textContent?.trim(),
      name: cells[3]?.textContent?.trim(),
      desc: cells[4]?.textContent?.trim(),
      ctaLabel: cells[5]?.textContent?.trim() || "READ MORE",
      link: cells[6]?.querySelector("a")?.href || "",
    });
  });

  const tabKeys = Object.keys(tabsMap);
  if (!tabKeys.length) return;

  /* ================================
     4️⃣ Hide authored HTML (EDS SAFE)
     ================================ */
  rows.forEach((row) => (row.style.display = "none"));

  /* ================================
     5️⃣ Runtime HTML (SAME STYLING)
     ================================ */
  const runtime = document.createElement("section");
  runtime.className = "airport-overview-runtime";

  runtime.innerHTML = `
    <div class="container">
      <div class="airport-overview-header text-center mb-5">
        ${title ? `<h2 class="sec-title">${title}</h2>` : ""}
        ${description ? `<div class="sec-desc">${description}</div>` : ""}

        <div class="airport-tabs">
          ${tabKeys
            .map(
              (key, i) => `
              <button
                class="tab-btn ${i === 0 ? "active" : ""}"
                data-filter="${key}">
                ${key}
              </button>
            `
            )
            .join("")}
        </div>
      </div>

      <div class="airport-cards row"></div>
    </div>
  `;

  block.after(runtime);

  const cardList = runtime.querySelector(".airport-cards");
  const tabButtons = runtime.querySelectorAll(".tab-btn");

  /* ================================
     6️⃣ Render cards (UNCHANGED UI)
     ================================ */
  function renderCards(type) {
    cardList.innerHTML = "";

    tabsMap[type].forEach((card) => {
      const div = document.createElement("div");
      div.className = "airport-card col-md-6 mt-4";

      div.innerHTML = `
        <div class="card card-ui-one">
          ${
            card.image
              ? `
            <div class="card-img">
              ${card.badge ? `<span class="badge">${card.badge}</span>` : ""}
              <img src="${card.image}" alt="${card.name}" loading="lazy" />
            </div>`
              : ""
          }

          <div class="card-body">
            <h3 class="card-title">${card.name}</h3>
            ${card.desc ? `<p class="card-desc">${card.desc}</p>` : ""}
            ${
              card.link
                ? `
              <div class="card-cta">
                <a href="${card.link}" class="btn-link">${card.ctaLabel}</a>
              </div>`
                : ""
            }
          </div>
        </div>
      `;

      cardList.appendChild(div);
    });
  }

  /* ================================
     7️⃣ Tab handling
     ================================ */
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderCards(btn.dataset.filter);
    });
  });

  /* ================================
     8️⃣ Init
     ================================ */
  renderCards(tabKeys[0]);

  console.log("Our Airports block initialized");
}