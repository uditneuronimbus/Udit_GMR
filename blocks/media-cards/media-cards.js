export default function decorate(block) {
  console.log("Decorating Media Cards (tabs + dynamic grid)");

  const rows = [...block.children];
  if (!rows.length) return;

  /* ================================
     DETECT GRID TYPE FROM PARENT SECTION
  ================================ */
  const section = block.closest(".section");

  let colClass = "col-md-6"; // default fallback

  if (section?.classList.contains("sec-grid-3")) {
    colClass = "col-lg-4 col-md-6";
  }

  if (section?.classList.contains("sec-grid-4")) {
    colClass = "col-xl-3 col-lg-4 col-md-6";
  }

  /* ================================
     HEADER
  ================================ */
  const title = rows[0]?.textContent?.trim() || "";
  const description = rows[1]?.textContent?.trim() || "";

  /* ================================
     CARD ROWS
  ================================ */
  const itemRows = rows.slice(2).filter((row) => row.textContent?.trim());
  if (!itemRows.length) return;

  /* ================================
     HELPERS
  ================================ */
  const getText = (cell) =>
    cell?.innerText?.trim() || cell?.textContent?.trim() || "";

  const formatLabel = (val) =>
    val
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim();

  /* ================================
     BUILD TABS DATA
  ================================ */
  const tabsMap = {};
  const tabsMeta = {};

  itemRows.forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    const tabValue = getText(cells[0]) || "none";

    if (!tabsMap[tabValue]) {
      tabsMap[tabValue] = [];
      tabsMeta[tabValue] = formatLabel(tabValue);
    }

    const img = cells[1]?.querySelector("img");

    tabsMap[tabValue].push({
      image: img?.src || "",
      imageAlt: img?.alt || "",
      title: getText(cells[2]) || getText(cells[3]),
      description: getText(cells[4]),
      ctaLabel1: getText(cells[5]),
      link1: cells[6]?.querySelector("a")?.href || "",
      ctaLabel2: getText(cells[7]),
      link2: cells[8]?.querySelector("a")?.href || "",
    });
  });

  const tabValues = Object.keys(tabsMap);
  if (!tabValues.length) return;

  const hasOnlyNoneTab = tabValues.length === 1 && tabValues[0] === "none";

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

        ${
          !hasOnlyNoneTab
            ? `
        <div class="overview-tabs">
          ${tabValues
            .map(
              (value, i) => `
            <button class="overview-tab-btn ${
              i === 0 ? "active" : ""
            }" data-filter="${value}">
              ${tabsMeta[value]}
            </button>
          `
            )
            .join("")}
        </div>`
            : ""
        }

      </div>

      <div class="overview-cards row"></div>

    </div>
  `;

  block.after(runtime);

  const cardList = runtime.querySelector(".overview-cards");
  const tabButtons = runtime.querySelectorAll(".overview-tab-btn");

  /* ================================
     RENDER CARDS
  ================================ */
  function renderCards(type) {
    cardList.innerHTML = "";

    if (!tabsMap[type] || !tabsMap[type].length) return;

    tabsMap[type].forEach((card) => {
      const div = document.createElement("div");

      // dynamic column class here
      div.className = `overview-card ${colClass} mt-4`;

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
                ? `<a href="${card.link1}" class="btn-link download">
                    ${card.ctaLabel1 || "DOWNLOAD"}
                  </a>`
                : ""
            }

            ${
              card.link2
                ? `<a href="${card.link2}" class="btn-link download">
                    ${card.ctaLabel2 || "DOWNLOAD"}
                  </a>`
                : ""
            }

          </div>
        </div>
      `;

      cardList.appendChild(div);
    });
  }

  /* ================================
     TAB CLICK
  ================================ */
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderCards(btn.dataset.filter);
    });
  });

  /* ================================
     INITIAL LOAD
  ================================ */
  renderCards(tabValues[0]);
}
