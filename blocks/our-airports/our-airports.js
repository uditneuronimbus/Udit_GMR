export default function decorate(block) {
  console.log("Decorating Our Airports block");

  const rows = [...block.children];
  if (rows.length < 2) return;

  /* ================================
     1️⃣ Read authored content
     ================================ */
  const configRow = rows[0];
  const configCells = [...configRow.children];

  const title = configCells[0]?.textContent?.trim();
  const descriptionHead = configCells[1]?.innerHTML?.trim() || ""; // New: description after heading
  
  // Dynamic categories - all remaining config cells after title and description are category buttons
  const categoryLabels = [];
  const categoryFilters = [];
  
  // Start from cell 2 (after title and description)
  for (let i = 2; i < configCells.length; i++) {
    const categoryName = configCells[i]?.textContent?.trim();
    if (categoryName) {
      categoryLabels.push(categoryName);
      // Create filter key from category name (lowercase, hyphenated)
      const filterKey = categoryName.toLowerCase().replace(/\s+/g, '-');
      categoryFilters.push(filterKey);
    }
  }

  const itemRows = rows.slice(1);

  /* ================================
     2️⃣ Hide authored rows (AEM SAFE)
     ================================ */
  rows.forEach((row) => (row.style.display = "none"));

  /* ================================
     3️⃣ Runtime wrapper
     ================================ */
  const runtime = document.createElement("section");
  runtime.className = "airport-overview-runtime";

  // Generate dynamic tab buttons
  let tabButtonsHTML = '';
  if (categoryLabels.length > 0) {
    tabButtonsHTML = '<div class="airport-tabs">';
    categoryLabels.forEach((label, index) => {
      const filter = categoryFilters[index];
      const activeClass = index === 0 ? 'active' : '';
      tabButtonsHTML += `
        <button class="tab-btn ${activeClass}" data-filter="${filter}">
          ${label}
        </button>
      `;
    });
    tabButtonsHTML += '</div>';
  }

  runtime.innerHTML = `
    <div class="container">
      <div class="airport-overview-header text-center mb-5">
        ${title ? `<h2 class="sec-title">${title}</h2>` : ""}
        ${descriptionHead ? `<div class="description-head">${descriptionHead}</div>` : ""}
        ${tabButtonsHTML}
      </div>

      <div class="airport-cards row"></div>

      <div class="load-more-wrap text-center">
        <button class="load-more-btn btn btn-primary">Load More</button>
      </div>
    </div>
  `;

  block.after(runtime);

  const cardList = runtime.querySelector(".airport-cards");
  const tabButtons = runtime.querySelectorAll(".tab-btn");
  const loadMoreBtn = runtime.querySelector(".load-more-btn");

  /* ================================
     4️⃣ Build cards (DYNAMIC CATEGORIES)
     ================================ */
  // Create a map of all unique categories from items
  const allCategories = new Set();
  
  itemRows.forEach((row) => {
    if (!row.textContent?.trim()) return;

    const cells = [...row.children];
    const networkType = cells[0]?.textContent?.trim();
    if (!networkType) return;

    // Get the category from the options
    const categoryMatch = networkType.match(/^(\w+)/);
    if (!categoryMatch) return;
    
    const category = categoryMatch[1].toLowerCase();
    allCategories.add(category);

    /* Image */
    let imageUrl = "";
    const img = cells[1]?.querySelector("img");
    if (img) imageUrl = img.src;

    const badge = cells[2]?.textContent?.trim();
    const name = cells[3]?.textContent?.trim();
    if (!name) return;

    const desc = cells[4]?.textContent?.trim();
    const ctaLabel = cells[5]?.textContent?.trim() || "READ MORE";

    let linkUrl = "";
    const link = cells[6]?.querySelector("a");
    if (link) linkUrl = link.href;

    /* LI wrapper for filtering */
    const li = document.createElement("div");
    li.className = "airport-card col-md-6 mt-4";
    li.dataset.category = category;

    li.innerHTML = `
      <div class="card card-ui-one">
        ${
          imageUrl
            ? `
          <div class="card-img">
            ${badge ? `<span class="badge">${badge}</span>` : ""}
            <img src="${imageUrl}" alt="${name}" loading="lazy" />
          </div>
        `
            : ""
        }

        <div class="card-body">
          <h3 class="card-title">${name}</h3>
          ${desc ? `<p class="card-desc">${desc}</p>` : ""}
          ${
            linkUrl
              ? `
            <div class="card-cta">
              <a href="${linkUrl}" class="btn-link">${ctaLabel}</a>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `;

    cardList.appendChild(li);
  });

  /* ================================
     5️⃣ Load More (Mobile Only)
     ================================ */
  const MOBILE_LIMIT = 3;
  let visibleCount = MOBILE_LIMIT;

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function applyLoadMore(filterCategory, reset = false) {
    const cards = [...cardList.querySelectorAll(".airport-card")].filter(
      (card) => card.dataset.category === filterCategory
    );

    if (!isMobile()) {
      cards.forEach((c) => (c.style.display = "block"));
      loadMoreBtn.style.display = "none";
      return;
    }

    if (reset) visibleCount = MOBILE_LIMIT;

    cards.forEach((card, index) => {
      card.style.display = index < visibleCount ? "block" : "none";
    });

    loadMoreBtn.style.display =
      visibleCount < cards.length ? "inline-block" : "none";
  }

  loadMoreBtn.addEventListener("click", () => {
    visibleCount += MOBILE_LIMIT;
    const active = runtime.querySelector(".tab-btn.active").dataset.filter;
    applyLoadMore(active);
  });

  /* ================================
     6️⃣ Tab filtering
     ================================ */
  function filterCards(filterCategory) {
    const cards = cardList.querySelectorAll(".airport-card");
    cards.forEach((card) => {
      // Show cards that match the filter category
      // If no filterCategory is provided, show all cards
      const shouldShow = !filterCategory || card.dataset.category === filterCategory;
      card.style.display = shouldShow ? "block" : "none";
    });
    
    // If we have categories from config, filter by them
    if (categoryFilters.length > 0) {
      applyLoadMore(filterCategory, true);
    } else {
      // Fallback to original behavior if no categories defined
      applyLoadMore('', true);
    }
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filterCards(btn.dataset.filter);
    });
  });

  /* ================================
     7️⃣ Init
     ================================ */
  // Set initial active filter based on available categories
  let initialFilter = '';
  if (categoryFilters.length > 0) {
    initialFilter = categoryFilters[0];
  } else if (allCategories.size > 0) {
    // If no categories in config, use first category from items
    initialFilter = [...allCategories][0];
  }
  
  filterCards(initialFilter);

  window.addEventListener("resize", () => {
    const active = runtime.querySelector(".tab-btn.active");
    if (active) {
      applyLoadMore(active.dataset.filter, true);
    }
  });

  console.log("Our Airports block initialized with dynamic categories:", categoryLabels);
}