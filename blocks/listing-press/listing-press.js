import { getSharedData } from '../../scripts/shared-filter.js';
import { getApiHost } from "../../scripts/api.js";
import { slugToTitle } from '../../scripts/common.js';
import { formatDate } from '../../scripts/common.js';

export default async function decorate(block) {

  /* ================= Get Shared Filter Data ================= */
  const data = getSharedData('pressFilters') || {};

  const dynamicYears = data.years || [];
  const dynamicMonths = data.months || [];
  const dynamicTags = data.tags || [];
  const dynamicSubCats = data.subCategories || [];

  const defaultYear = "All";
  const limit = 10;
  
  /* ================= State Management ================= */
  let state = {
    year: "",
    month: "",
    subCategory: "",
    tag: "",
    sort: "desc",
    page: 1,
    offset: 0,
    limit: limit,
    totalCount: 0
  };

  // ❌ REMOVE THIS - Don't fetch count on initial load
  // state.totalCount = await fetchApiCount("press-release", "", "", "", "", "desc");

  /* ================= Render HTML ================= */
  block.innerHTML = `
  <div class="filter-layout">

    <!-- LEFT : FILTER -->
    <aside class="filter-card">
      <h3 class="filter-title">Filter By</h3>

      <!-- Year -->
      <div class="filter-group">
        <button class="filter-toggle active" data-target="year-list">
          <span>Year - <b class="selected-year">${defaultYear}</b></span>
          <span class="chevron">⌄</span>
        </button>
        <div class="filter-list" id="year-list">
          <label><input type="radio" name="year" value="" checked> All Years</label>
          ${dynamicYears.map(y =>
            `<label><input type="radio" name="year" value="${y}"> ${y}</label>`
          ).join("")}
        </div>
      </div>

      <!-- Month -->
      <div class="filter-group">
        <button class="filter-toggle" data-target="month-list">
          <span>Month</span>
          <span class="chevron">⌄</span>
        </button>
        <div class="filter-list hidden" id="month-list">
          <label><input type="radio" name="month" value="" checked> All Months</label>
          ${dynamicMonths.map(m =>
            `<label><input type="radio" name="month" value="${m}"> ${m}</label>`
          ).join("")}
        </div>
      </div>

      <!-- Category -->
      <div class="filter-group">
        <button class="filter-toggle" data-target="subcat-list">
          <span>Business Category</span>
          <span class="chevron">⌄</span>
        </button>
        <div class="filter-list hidden" id="subcat-list">
          <label><input type="radio" name="subcat" value="" checked> All Categories</label>
          ${dynamicSubCats.map(s =>
            `<label><input type="radio" name="subcat" value="${s}"> ${s}</label>`
          ).join("")}
        </div>
      </div>

      <!-- Tags -->
      <div class="filter-group">
        <button class="filter-toggle" data-target="tag-list">
          <span>Tags</span>
          <span class="chevron">⌄</span>
        </button>
        <div class="filter-list hidden" id="tag-list">
          <label><input type="radio" name="tag" value="" checked> All Tags</label>
          ${dynamicTags.map(t =>
            `<label><input type="radio" name="tag" value="${t}"> ${t}</label>`
          ).join("")}
        </div>
      </div>
    </aside>

    <!-- RIGHT : HEADER -->
    <section class="filter-right">
      <div class="filter-header">
        <div>
          <h2 class="filter-main-title">
            All Releases - <span class="selected-summary">All Years</span>
          </h2>
          <p class="filter-count">
            Displaying <span class="count-text">Loading...</span>
          </p>
        </div>

        <div class="sort">
          <button class="sort-btn" id="sortToggle">
            Sort by <span class="chevron">⌄</span>
          </button>

          <div class="sort-menu hidden" id="sortMenu">
            <label>
              <input type="radio" name="sort" value="desc" checked />
              Newest First
            </label>
            <label>
              <input type="radio" name="sort" value="asc" />
              Oldest First
            </label>
          </div>
        </div>
      </div>

      <!-- RESULTS AREA -->
      <div class="filter-results">
        <div class="loading">Loading...</div>
      </div>
      <div class="pagination"></div>
    </section>

  </div>
`;

  /* ================= DOM References ================= */
  const summaryText = block.querySelector(".selected-summary");
  const selectedYearText = block.querySelector('.selected-year');
  const countText = block.querySelector('.count-text');
  const resultsContainer = block.querySelector(".filter-results");
  const paginationContainer = block.querySelector(".pagination");
  const sortToggle = block.querySelector("#sortToggle");
  const sortMenu = block.querySelector("#sortMenu");

  /* ================= Helper Functions ================= */

  function updateHeader() {
    const parts = [];
    if (state.year) parts.push(state.year);
    if (state.month) parts.push(state.month);
    if (state.subCategory) parts.push(slugToTitle(state.subCategory));
    if (state.tag) parts.push(state.tag);
    summaryText.textContent = parts.length ? parts.join(" • ") : "All Years";
  }

  function updateCountDisplay() {
    if (state.totalCount === 0) {
      countText.textContent = `0 results`;
      return;
    }
    const start = (state.page - 1) * state.limit + 1;
    const end = Math.min(state.page * state.limit, state.totalCount);
    countText.textContent = `${start} - ${end} of ${state.totalCount}`;
  }

  function createCardHTML(item) {
    const title = item?.title || "Untitled";
    const subCategory = item?.subCategory || "";
    const updatedDate = item?.lastUpdated || "";
    const link = item?.slugUrl || "#";
    const publishDateRaw = item.publishDate?.iso || item.publishDate?.value || item.publishDate || "";
    const publishDateFormatted = formatDate(publishDateRaw);

    return `
      <article class="press-card">
        <div class="press-card-image">
          <img
            src="${item.cardImage?._publishUrl || ""}"
            alt="${item.title || ""}"
            loading="lazy"
          />
        </div>

        <div class="press-card-body">
          <h3 class="press-card-title">${title}</h3>

          <div class="press-card-meta">
            ${subCategory ? `<span class="badge">${slugToTitle(subCategory)}</span>` : ""}
            ${publishDateFormatted ? `<span class="date">${publishDateFormatted}</span>` : ""}
          </div>

          <div class="press-card-footer">
            <a href="news-update?post=${link}" class="read-more">READ MORE →</a>
            ${updatedDate ? `<span class="updated">Last Updated : ${updatedDate}</span>` : ""}
          </div>
        </div>
      </article>
    `;
  }

  /* ================= Render Functions ================= */
  
  async function renderCards() {
    try {
      // Show loading state
      resultsContainer.innerHTML = '<div class="loading">Loading...</div>';
      countText.textContent = 'Loading...';

      // ✅ First fetch the count with CURRENT state filters
      console.log('Fetching count with filters:', {
        year: state.year,
        month: state.month,
        subCategory: state.subCategory,
        tag: state.tag,
        sort: state.sort
      });

      state.totalCount = await fetchApiCount(
        "press-release",
        state.subCategory,
        state.year,
        state.month,
        state.tag,
        state.sort
      );

      console.log('Total count returned:', state.totalCount);

      // Calculate offset based on current page
      state.offset = (state.page - 1) * state.limit;

      // ✅ Then fetch the paginated data with SAME filters
      const items = await fetchApiData(
        state.limit,
        state.offset,
        "press-release",
        state.subCategory,
        state.year,
        state.month,
        state.tag,
        state.sort
      );

      console.log('Items returned:', items.length);

      // Render cards
      if (items.length === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No results found</div>';
      } else {
        resultsContainer.innerHTML = items.map(createCardHTML).join("");
      }

      // Update count display and pagination
      updateCountDisplay();
      renderPagination();

      // Scroll to top of results
      resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (error) {
      console.error("Error fetching API data:", error);
      resultsContainer.innerHTML = '<div class="error">Error loading data. Please try again.</div>';
      countText.textContent = 'Error';
    }
  }

  function renderPagination() {
    const totalPages = Math.ceil(state.totalCount / state.limit);

    if (totalPages <= 1) {
      paginationContainer.innerHTML = "";
      return;
    }

    let html = "";

    // Previous button
    html += `
      <button class="page-btn ${state.page === 1 ? "disabled" : ""}" data-page="${state.page - 1}">
        ←
      </button>
    `;

    // Page numbers with smart ellipsis
    const maxVisible = 7;
    let startPage = Math.max(1, state.page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // First page
    if (startPage > 1) {
      html += `<button class="page-btn" data-page="1">1</button>`;
      if (startPage > 2) {
        html += `<span class="page-ellipsis">...</span>`;
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      html += `
        <button class="page-btn ${i === state.page ? "active" : ""}" data-page="${i}">
          ${i}
        </button>
      `;
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        html += `<span class="page-ellipsis">...</span>`;
      }
      html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
    }

    // Next button
    html += `
      <button class="page-btn ${state.page === totalPages ? "disabled" : ""}" data-page="${state.page + 1}">
        →
      </button>
    `;

    paginationContainer.innerHTML = html;
  }

  /* ================= Event Listeners ================= */

  // Filter toggle buttons
  block.querySelectorAll('.filter-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = block.querySelector(`#${btn.dataset.target}`);
      btn.classList.toggle('active');
      target.classList.toggle('hidden');
    });
  });

  // Year filter
  block.querySelectorAll('input[name="year"]').forEach(r => {
    r.addEventListener("change", () => {
      state.year = r.value;
      state.page = 1; // Reset to first page
      selectedYearText.textContent = r.value || "All";
      updateHeader();
      renderCards();
    });
  });

  // Month filter
  block.querySelectorAll('input[name="month"]').forEach(r => {
    r.addEventListener("change", () => {
      state.month = r.value;
      state.page = 1;
      updateHeader();
      renderCards();
    });
  });

  // Category filter
  block.querySelectorAll('input[name="subcat"]').forEach(r => {
    r.addEventListener("change", () => {
      state.subCategory = r.value;
      state.page = 1;
      updateHeader();
      renderCards();
    });
  });

  // Tag filter
  block.querySelectorAll('input[name="tag"]').forEach(r => {
    r.addEventListener("change", () => {
      state.tag = r.value;
      state.page = 1;
      updateHeader();
      renderCards();
    });
  });

  // Sort toggle
  sortToggle.addEventListener("click", () => {
    sortMenu.classList.toggle("hidden");
  });

  // Sort options
  block.querySelectorAll('input[name="sort"]').forEach(radio => {
    radio.addEventListener("change", () => {
      state.sort = radio.value;
      state.page = 1;
      renderCards();
      sortMenu.classList.add("hidden");
    });
  });

  // Close sort menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!sortToggle.contains(e.target) && !sortMenu.contains(e.target)) {
      sortMenu.classList.add("hidden");
    }
  });

  // Pagination clicks
  paginationContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".page-btn");
    if (!btn || btn.classList.contains("disabled")) return;

    state.page = parseInt(btn.dataset.page, 10);
    renderCards();
  });

  /* ================= Initial Render ================= */
  renderCards();
}


/* ================= API Functions ================= */

async function fetchApiData(limit = 10, offset = 0, category = "press-release", subCategory = "", publishyear = "", publishmonth = "", tag = "", orderby = "desc") {
  const apiUrl = `${getApiHost()}/api/v1/web/gmr-api/all-news` +
    `?limit=${encodeURIComponent(limit)}` +
    `&offset=${encodeURIComponent(offset)}` +
    `&category=${encodeURIComponent(category)}` +
    `&subcategory=${encodeURIComponent(subCategory)}` +
    `&publishyear=${encodeURIComponent(publishyear)}` +
    `&publishmonth=${encodeURIComponent(publishmonth.toLowerCase())}` +
    `&tag=${encodeURIComponent(tag.toLowerCase())}` +
    `&orderby=${encodeURIComponent(orderby)}`;
  
  console.log('📡 Fetching data API:', apiUrl);
    
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  
  const json = await res.json();
  const items = json?.data?.data?.newsList?.items || [];
  
  console.log('✅ Data API returned items:', items.length);
  
  return items;
}

// ✅ FIXED: Fetches all items to get true count
async function fetchApiCount(category = "press-release", subCategory = "", publishyear = "", publishmonth = "", tag = "", orderby = "desc") {
  const apiUrl = `${getApiHost()}/api/v1/web/gmr-api/all-news` +
    `?limit=10000` +  
    `&offset=0` +
    `&category=${encodeURIComponent(category)}` +
    `&subcategory=${encodeURIComponent(subCategory)}` +
    `&publishyear=${encodeURIComponent(publishyear)}` +
    `&publishmonth=${encodeURIComponent(publishmonth.toLowerCase())}` +
    `&tag=${encodeURIComponent(tag.toLowerCase())}` +
    `&orderby=${encodeURIComponent(orderby)}`;
  
  console.log('📊 Fetching count API:', apiUrl);
    
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  
  const json = await res.json();
  const items = json?.data?.data?.newsList?.items || [];
  
  console.log('✅ Count API returned:', items.length);
  
  return items.length;  // ✅ Returns actual filtered count
}
