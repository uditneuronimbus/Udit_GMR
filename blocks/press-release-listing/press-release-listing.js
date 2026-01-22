import { getApiHost } from "../../scripts/api.js";

/**
 * Format date to "DD Mon YYYY" format
 */
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Get available years from current year going back
 */
function getYearOptions(startYear = 2020) {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= startYear; y--) {
    years.push(y);
  }
  return years;
}

/**
 * Month options
 */
const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

/**
 * Business Categories
 */
const BUSINESS_CATEGORIES = [
  { value: "", label: "All" },
  { value: "Corporate", label: "Corporate" },
  { value: "Airports & Aero Services", label: "Airports & Aero Services" },
  { value: "Energy", label: "Energy" },
  { value: "Sports", label: "Sports" },
  { value: "Transport & Urban Infrastructure", label: "Transport & Urban Infrastructure" },
  { value: "Foundation", label: "Foundation" },
];

export default async function decorate(block) {
  // Read authored fields
  const [titleEl, itemsPerPageEl] = [...block.children];
  const sectionTitle = titleEl?.textContent?.trim() || "All Releases";
  const itemsPerPage = parseInt(itemsPerPageEl?.textContent?.trim(), 10) || 10;

  // Clear block
  block.innerHTML = "";

  // State
  let currentPage = 1;
  let currentYear = new Date().getFullYear();
  let currentMonth = "";
  let currentCategory = "";
  let currentSort = "newest";
  let totalItems = 0;

  // Create main section
  const section = document.createElement("section");
  section.className = "press-release-listing";

  section.innerHTML = `
    <div class="container">
      <div class="listing-layout">
        <!-- Sidebar Filters -->
        <aside class="listing-sidebar">
          <div class="filter-panel">
            <h3 class="filter-title">Filter by</h3>
            
            <!-- Year Filter -->
            <div class="filter-group">
              <button class="filter-toggle active" data-target="year-options">
                <span>Year - <span class="selected-value">${currentYear}</span></span>
                <svg class="icon-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div class="filter-options" id="year-options">
                ${getYearOptions().map(year => `
                  <label class="filter-option">
                    <input type="radio" name="year" value="${year}" ${year === currentYear ? 'checked' : ''}>
                    <span>${year}</span>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- Month Filter -->
            <div class="filter-group">
              <button class="filter-toggle" data-target="month-options">
                <span>Month</span>
                <svg class="icon-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div class="filter-options hidden" id="month-options">
                <label class="filter-option">
                  <input type="radio" name="month" value="" checked>
                  <span>All Months</span>
                </label>
                ${MONTHS.map(month => `
                  <label class="filter-option">
                    <input type="radio" name="month" value="${month.value}">
                    <span>${month.label}</span>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- Business Category Filter -->
            <div class="filter-group">
              <button class="filter-toggle" data-target="category-options">
                <span>Business Categories</span>
                <svg class="icon-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <div class="filter-options hidden" id="category-options">
                ${BUSINESS_CATEGORIES.map(cat => `
                  <label class="filter-option ${cat.value === '' ? 'active' : ''}">
                    <input type="radio" name="category" value="${cat.value}" ${cat.value === '' ? 'checked' : ''}>
                    <span>${cat.label}</span>
                    ${cat.value === '' ? '<svg class="icon-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.333 8h9.334M8 3.333L12.667 8 8 12.667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
                  </label>
                `).join('')}
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="listing-content">
          <div class="listing-header">
            <div class="listing-info">
              <h2 class="listing-title">${sectionTitle} - <span class="year-display">${currentYear}</span></h2>
              <p class="listing-count">Displaying <span class="count-display">0</span></p>
            </div>
            <div class="listing-sort">
              <select class="sort-select" id="sort-select">
                <option value="newest">Sort by</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          <div class="listing-grid" id="listing-grid">
            <div class="loading">Loading press releases...</div>
          </div>

          <div class="listing-pagination" id="listing-pagination"></div>
        </main>
      </div>
    </div>
  `;

  block.appendChild(section);

  // DOM References
  const listingGrid = section.querySelector("#listing-grid");
  const listingPagination = section.querySelector("#listing-pagination");
  const countDisplay = section.querySelector(".count-display");
  const yearDisplay = section.querySelector(".year-display");
  const sortSelect = section.querySelector("#sort-select");

  /**
   * Fetch and render press releases
   */
  async function fetchAndRender() {
    listingGrid.innerHTML = `<div class="loading">Loading press releases...</div>`;

    try {
      const offset = (currentPage - 1) * itemsPerPage;
      let apiUrl = `${getApiHost()}/api/v1/web/gmr/press-release?limit=${itemsPerPage}&offset=${offset}`;
      
      if (currentYear) apiUrl += `&year=${currentYear}`;
      if (currentMonth) apiUrl += `&month=${currentMonth}`;
      if (currentCategory) apiUrl += `&category=${encodeURIComponent(currentCategory)}`;
      if (currentSort) apiUrl += `&sort=${currentSort}`;

      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`API error ${res.status}`);

      const json = await res.json();
      const items = json?.data?.data?.pressReleaseList?.items || [];
      totalItems = json?.data?.data?.pressReleaseList?.total || items.length;

      // Update count display
      const startItem = offset + 1;
      const endItem = Math.min(offset + itemsPerPage, totalItems);
      countDisplay.textContent = `${startItem} - ${endItem} of ${totalItems}`;
      yearDisplay.textContent = currentYear;

      if (!items.length) {
        listingGrid.innerHTML = `<p class="no-results">No press releases found for the selected filters.</p>`;
        listingPagination.innerHTML = "";
        return;
      }

      // Render cards
      listingGrid.innerHTML = items.map(item => {
        const publishDate = formatDate(item.publishDate?.iso || item.publishDate);
        const lastUpdated = formatDate(item.lastModified?.iso || item.lastModified || item.publishDate);
        const categoryClass = (item.businessCategory || item.category || "general").toLowerCase().replace(/\s+/g, '-').replace(/&/g, '');

        return `
          <div class="press-card">
            <div class="press-card-image">
              <img src="${item.cardImage?._publishUrl || item.featuredImage?._publishUrl || ''}" alt="${item.title || ''}" loading="lazy">
            </div>
            <div class="press-card-body">
              <h3 class="press-card-title">${item.title || ""}</h3>
              <div class="press-card-meta">
                <span class="badge ${categoryClass}">${item.businessCategory || item.category || ""}</span>
                <span class="meta-separator">|</span>
                <span class="meta-date">
                  <svg class="icon-calendar" width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M12.667 2.667H3.333C2.597 2.667 2 3.264 2 4v9.333c0 .737.597 1.334 1.333 1.334h9.334c.736 0 1.333-.597 1.333-1.334V4c0-.736-.597-1.333-1.333-1.333z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10.667 1.333v2.667M5.333 1.333v2.667M2 6.667h12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  ${publishDate}
                </span>
              </div>
              <div class="press-card-footer">
                <a href="${item.ctaLink || item.path || '#'}" class="btn-read-more">
                  READ MORE
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3.333 8h9.334M8 3.333L12.667 8 8 12.667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </a>
                <span class="meta-updated">Last Updated : ${lastUpdated}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Render pagination
      renderPagination();

    } catch (err) {
      console.error("Press Release Listing error:", err);
      listingGrid.innerHTML = `<p class="error">Error loading press releases. Please try again.</p>`;
    }
  }

  /**
   * Render pagination
   */
  function renderPagination() {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) {
      listingPagination.innerHTML = "";
      return;
    }

    let paginationHTML = `<button class="page-btn prev" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M10 12l-4-4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>`;

    // Page numbers
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      paginationHTML += `<button class="page-btn" data-page="1">1</button>`;
      if (startPage > 2) paginationHTML += `<span class="page-ellipsis">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) paginationHTML += `<span class="page-ellipsis">...</span>`;
      paginationHTML += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
    }

    paginationHTML += `<button class="page-btn next" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>`;

    listingPagination.innerHTML = paginationHTML;
  }

  // Event Listeners

  // Filter toggles
  section.querySelectorAll(".filter-toggle").forEach(toggle => {
    toggle.addEventListener("click", () => {
      const targetId = toggle.getAttribute("data-target");
      const options = section.querySelector(`#${targetId}`);
      toggle.classList.toggle("active");
      options.classList.toggle("hidden");
    });
  });

  // Year filter
  section.querySelectorAll('input[name="year"]').forEach(input => {
    input.addEventListener("change", (e) => {
      currentYear = parseInt(e.target.value, 10);
      currentPage = 1;
      section.querySelector('.filter-group:first-child .selected-value').textContent = currentYear;
      fetchAndRender();
    });
  });

  // Month filter
  section.querySelectorAll('input[name="month"]').forEach(input => {
    input.addEventListener("change", (e) => {
      currentMonth = e.target.value;
      currentPage = 1;
      fetchAndRender();
    });
  });

  // Category filter
  section.querySelectorAll('input[name="category"]').forEach(input => {
    input.addEventListener("change", (e) => {
      currentCategory = e.target.value;
      currentPage = 1;
      // Update active state
      section.querySelectorAll('#category-options .filter-option').forEach(opt => {
        opt.classList.remove('active');
        const arrow = opt.querySelector('.icon-arrow');
        if (arrow) arrow.remove();
      });
      const label = e.target.closest('.filter-option');
      label.classList.add('active');
      label.insertAdjacentHTML('beforeend', '<svg class="icon-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.333 8h9.334M8 3.333L12.667 8 8 12.667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
      fetchAndRender();
    });
  });

  // Sort
  sortSelect.addEventListener("change", (e) => {
    currentSort = e.target.value;
    currentPage = 1;
    fetchAndRender();
  });

  // Pagination
  listingPagination.addEventListener("click", (e) => {
    const btn = e.target.closest(".page-btn");
    if (btn && !btn.disabled) {
      currentPage = parseInt(btn.getAttribute("data-page"), 10);
      fetchAndRender();
      // Scroll to top of listing
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  // Initial fetch
  fetchAndRender();
}

