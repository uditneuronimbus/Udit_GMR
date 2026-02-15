export default function decorate(block) {
  console.log("Decorating Overview block");

  const rows = [...block.children];
  if (rows.length < 5) return;

  /* ================================
     HEADER
  ================================ */
  const title = rows[0]?.textContent?.trim() || "";
  const description = rows[1]?.textContent?.trim() || "";

  const itemRows = rows.slice(2).filter((row) => row.textContent?.trim());

  /* ================================
     HELPERS
  ================================ */
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
    if (cells.length < 7) return;

    const value = cells[0]?.textContent?.trim();
    if (!value) return;

    if (!tabsMap[value]) {
      tabsMap[value] = [];
      tabsMeta[value] = formatLabel(value);
    }

    const img = cells[1]?.querySelector("img");

    const getText = (cell) =>
      cell?.innerText?.trim() || cell?.textContent?.trim() || "";

    tabsMap[value].push({
      image: img?.src || "",
      imageAlt: img?.alt || "",
      badge: getText(cells[2]),
      name: getText(cells[3]),
      desc: getText(cells[4]),

      // CTA 1
      ctaLabel1: getText(cells[5]),
      link1: cells[6]?.querySelector("a")?.href || "",

      // CTA 2 (optional)
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

      <div class="overview-load-more">
        <button class="btn btn-primary load-more-btn">Load More</button>
      </div>
    </div>
  `;

  block.after(runtime);

  const cardList = runtime.querySelector(".overview-cards");
  const tabButtons = runtime.querySelectorAll(".overview-tab-btn");
  const loadMoreBtn = runtime.querySelector(".load-more-btn");

  /* ================================
     RENDER CARDS
  ================================ */
  function renderCards(type) {
    cardList.innerHTML = "";

    tabsMap[type]?.forEach((card) => {
      const div = document.createElement("div");
      div.className = "overview-card col-md-6 mt-4";

      div.innerHTML = `
        <div class="card card-ui h-100 p-4">

          ${
            card.image
              ? `
          <div class="card-img">
            ${
              card.badge
                ? `<span class="card-badge">${card.badge}</span>`
                : ""
            }
            <img src="${card.image}" alt="${
        card.imageAlt
      }" loading="lazy"/>
          </div>`
              : ""
          }

          <div class="card-body">

            ${card.name ? `<h5 class="card-title">${card.name}</h5>` : ""}

            ${card.desc ? `<p class="card-text">${card.desc}</p>` : ""}

            ${
              card.link1
                ? `<a href="${card.link1}" class="btn-link">${card.ctaLabel1 || "READ MORE"}</a>`
                : ""
            }

            ${
              card.link2
                ? `<a href="${card.link2}" class="btn-link">${card.ctaLabel2 || "READ MORE"}</a>`
                : ""
            }

          </div>
        </div>
      `;

      cardList.appendChild(div);
    });
  }

  /* ================================
     LOAD MORE
  ================================ */
  const MOBILE_LIMIT = 3;
  let visibleCount = MOBILE_LIMIT;

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function applyLoadMore(type, reset = false) {
    const cards = [...cardList.querySelectorAll(".overview-card")];

    if (!isMobile()) {
      cards.forEach((c) => (c.style.display = "block"));
      loadMoreBtn.style.display = "none";
      return;
    }

    if (reset) visibleCount = MOBILE_LIMIT;

    cards.forEach((card, i) => {
      card.style.display = i < visibleCount ? "block" : "none";
    });

    loadMoreBtn.style.display =
      visibleCount < cards.length ? "inline-block" : "none";
  }

  loadMoreBtn.addEventListener("click", () => {
    visibleCount += MOBILE_LIMIT;
    const active =
      runtime.querySelector(".overview-tab-btn.active")?.dataset.filter;
    if (active) applyLoadMore(active);
  });

  /* ================================
     TAB LOGIC
  ================================ */
  function activateTab(type) {
    renderCards(type);
    applyLoadMore(type, true);
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activateTab(btn.dataset.filter);
    });
  });

  activateTab(tabValues[0]);

  window.addEventListener("resize", () => {
    const active =
      runtime.querySelector(".overview-tab-btn.active")?.dataset.filter;
    if (active) applyLoadMore(active, true);
  });
}
