import { getSharedData } from "../../scripts/shared-filter.js";
import { getApiHost } from "../../scripts/api.js";
import { slugToTitle } from "../../scripts/common.js";
import { formatDate } from "../../scripts/common.js";

/* ================================
   Create Bootstrap Video Modal
================================ */
function createVideoModal() {
  if (document.getElementById("videoModal")) return;

  const modalHTML = `
    <div class="modal fade" id="videoModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content bg-black">
          <button type="button"
            class="btn-close btn-close-white ms-auto m-2"
            data-bs-dismiss="modal">
          </button>

          <div class="ratio ratio-16x9">
            <iframe id="videoIframe" src="" allow="autoplay" allowfullscreen></iframe>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  document
    .getElementById("videoModal")
    .addEventListener("hidden.bs.modal", () => {
      document.getElementById("videoIframe").src = "";
    });
}

/* ================= YouTube ID ================= */
function getYouTubeId(url) {
  if (!url) return "";
  if (url.includes("watch?v=")) return url.split("watch?v=")[1].split("&")[0];
  if (url.includes("youtu.be/")) return url.split("youtu.be/")[1].split("?")[0];
  if (url.includes("embed/")) return url.split("embed/")[1].split("?")[0];
  return "";
}

/* ================= Open Video ================= */
function openVideoModal(url) {
  const id = getYouTubeId(url);
  if (!id) return;

  const iframe = document.getElementById("videoIframe");
  if (iframe) {
    iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;

    const modal = document.getElementById("videoModal");
    if (modal) {
      new bootstrap.Modal(modal).show();
    }
  }
}

export default async function decorate(block) {
  const defaultYear = "All";
  const limit = 6;

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
    totalCount: 0,
  };

  /* ================= Self-derived Filters from API ================= */
  // Start with whatever the filter-by fragment block already provided
  let filterData = getSharedData("pressFilters") || {};
  let dynamicYears = filterData.years || [];
  let dynamicMonths = filterData.months || [];
  let dynamicTags = filterData.tags || [];
  let dynamicSubCats = filterData.subCategories || [];

  // If no filter data from fragment, derive it from the full API dataset
  if (!dynamicYears.length && !dynamicMonths.length && !dynamicSubCats.length) {
    try {
      const allItems = await fetchAllItems();
      const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
      const yearsSet = new Set();
      const monthsSet = new Set();
      const catsSet = new Set();
      const tagsSet = new Set();

      allItems.forEach(item => {
        if (item.publishDate) {
          const d = new Date(item.publishDate);
          if (!isNaN(d)) {
            yearsSet.add(String(d.getFullYear()));
            monthsSet.add(monthNames[d.getMonth()]);
          }
        }
        if (item.category) catsSet.add(item.category);
        if (item.tags) {
          String(item.tags).split(',').map(t => t.trim()).filter(Boolean).forEach(t => tagsSet.add(t));
        }
      });

      dynamicYears = [...yearsSet].sort((a, b) => b - a);
      dynamicMonths = [...monthsSet];
      dynamicSubCats = [...catsSet];
      dynamicTags = [...tagsSet];
    } catch (e) {
      // silently fall back to empty
    }
  }

  /* ================= Render HTML ================= */
  block.innerHTML = `
  <section class="press-listing-runtime bg-gray">
    <div class="container">
      <!-- Desktop Layout -->
      <div class="press-layout desktop-layout">
        <aside class="press-filter-panel">
          <!-- Year -->
          <div class="filter-group filter-group-collapsible">
            <button class="filter-toggle active" data-target="year-options">
              <span>Year - <span class="selected-year">${defaultYear}</span></span>
              <svg class="icon-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="filter-options" id="year-options">
              ${renderYearOptions(dynamicYears)}
            </div>
          </div>

          <!-- Month -->
          <div class="filter-group filter-group-collapsible">
            <button class="filter-toggle" data-target="month-options">
              <span>Month</span>
              <svg class="icon-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="filter-options hidden" id="month-options">
              ${renderMonthOptions(dynamicMonths)}
            </div>
          </div>

          <!-- Category -->
          <div class="filter-group filter-group-collapsible">
            <button class="filter-toggle" data-target="subcat-options">
              <span>Business Category</span>
              <svg class="icon-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="filter-options hidden" id="subcat-options">
              ${renderCategoryOptions(dynamicSubCats)}
            </div>
          </div>

          <!-- Tags -->
          <div class="filter-group filter-group-collapsible">
            <button class="filter-toggle" data-target="tag-options">
              <span>Tags</span>
              <svg class="icon-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="filter-options hidden" id="tag-options">
              ${renderTagOptions(dynamicTags)}
            </div>
          </div>

        </aside>
        
        <div class="press-main">
          <div class="press-header">
            <div class="press-header-info">
              <h2 class="press-title">All Videos - <span class="selected-summary">All Categories</span></h2>
              <p class="press-count">Displaying <span class="count-text">Loading...</span></p>
            </div>
            
            <div class="press-sort">
              <div class="sort-dropdown">
                <button class="sort-toggle" id="sort-toggle">
                  <span>Sort by</span>
                  <svg class="icon-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <div class="sort-options" id="sort-options">
                  <label class="sort-option">
                    <span>Newest First</span>
                    <input type="radio" name="sort" value="desc" checked>
                  </label>
                  <label class="sort-option">
                    <span>Oldest First</span>
                    <input type="radio" name="sort" value="asc">
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="press-list"></div>
          <div class="press-pagination"></div>
        </div>
      </div>

      <!-- Mobile Layout -->
      <div class="press-layout mobile-layout">
        <div class="mobile-filter-buttons">
          <button class="mobile-filter-btn year-btn" data-type="year-month">
            Year & Month <span class="arrow">
              <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
              </svg>
            </span>
          </button>
          <button class="mobile-filter-btn category-btn" data-type="category">
            Category <span class="arrow">
              <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
              </svg>
            </span>
          </button>
          <button class="mobile-filter-btn tag-btn" data-type="tag">
            Tags <span class="arrow">
              <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
              </svg>
            </span>
          </button>
        </div>
        
        <div class="press-list"></div>
        <div class="press-pagination"></div>
        
        <!-- Mobile Filter Modal -->
        <div class="mobile-filter-modal">
          <div class="mobile-filter-overlay"></div>
          <div class="mobile-filter-content">
            <div class="modal-header">
              <h3>Filter by Category</h3>
              <button class="close-modal">×</button>
            </div>
            <div class="modal-body">
              <div class="filter-group year-group" style="display: none;">
                ${renderMobileOptions('year', dynamicYears)}
              </div>
              
              <div class="filter-group month-group" style="display: none;">
                ${renderMobileOptions('month', dynamicMonths)}
              </div>
              
              <div class="filter-group category-group" style="display: none;">
                ${renderMobileOptions('subcat', dynamicSubCats)}
              </div>
              
              <div class="filter-group tag-group" style="display: none;">
                ${renderMobileOptions('tag', dynamicTags)}
              </div>
            </div>
            <div class="apply-filter-btn">
              <button class="apply-btn">Apply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
`;

  /* ================= DOM References ================= */
  const summaryText = block.querySelector(".selected-summary");
  const countText = block.querySelector(".count-text");
  const desktopList = block.querySelector(".desktop-layout .press-list");
  const mobileList = block.querySelector(".mobile-layout .press-list");
  const desktopPagination = block.querySelector(
    ".desktop-layout .press-pagination",
  );
  const mobilePagination = block.querySelector(
    ".mobile-layout .press-pagination",
  );
  const sortToggle = block.querySelector("#sort-toggle");
  const sortOptions = block.querySelector("#sort-options");

  // Mobile elements
  const mobileFilterBtns = block.querySelectorAll(".mobile-filter-btn");
  const mobileModal = block.querySelector(".mobile-filter-modal");
  const modalOverlay = block.querySelector(".mobile-filter-overlay");
  const closeModalBtn = block.querySelector(".close-modal");
  const applyBtn = block.querySelector(".apply-btn");
  const categoryGroup = block.querySelector(".category-group");
  const tagGroup = block.querySelector(".tag-group");

  /* ================= Helper Functions ================= */

  function updateHeader() {
    const parts = [];
    if (state.year) parts.push(state.year);
    if (state.month) {
      // Month might be name or number, handle both
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      const monthName = isNaN(state.month) ? state.month : (monthNames[parseInt(state.month) - 1] || state.month);
      parts.push(monthName);
    }
    if (state.subCategory) parts.push(slugToTitle(state.subCategory));
    if (state.tag) parts.push(state.tag);
    summaryText.textContent = parts.length ? parts.join(" • ") : "All Years";
  }

  function renderYearOptions(years) {
    return `
      <label class="filter-option ${!state.year ? 'active' : ''}">
        <input type="radio" name="desktop-year" value="" ${!state.year ? 'checked' : ''}>
        <span>All Years</span>
      </label>
      ${years.map(y =>
      `<label class="filter-option ${state.year === y ? 'active' : ''}">
          <input type="radio" name="desktop-year" value="${y}" ${state.year === y ? 'checked' : ''}>
          <span>${y}</span>
        </label>`
    ).join("")}`;
  }

  function renderMonthOptions(months) {
    return `
      <label class="filter-option ${!state.month ? 'active' : ''}">
        <input type="radio" name="desktop-month" value="" ${!state.month ? 'checked' : ''}>
        <span>All Months</span>
      </label>
      ${months.map(m =>
      `<label class="filter-option ${state.month === m ? 'active' : ''}">
          <input type="radio" name="desktop-month" value="${m}" ${state.month === m ? 'checked' : ''}>
          <span>${m}</span>
        </label>`
    ).join("")}`;
  }

  function renderCategoryOptions(cats) {
    return `
      <label class="filter-option ${!state.subCategory ? 'active' : ''}" data-category="all">
        <input type="radio" name="desktop-subcat" value="" ${!state.subCategory ? 'checked' : ''}>
        <span>All Categories</span>
      </label>
      ${cats.map(s =>
      `<label class="filter-option ${state.subCategory === s ? 'active' : ''}">
          <input type="radio" name="desktop-subcat" value="${s}" ${state.subCategory === s ? 'checked' : ''}>
          <span>${s}</span>
        </label>`
    ).join("")}`;
  }

  function renderTagOptions(tags) {
    return `
      <label class="filter-option ${!state.tag ? 'active' : ''}">
        <input type="radio" name="desktop-tag" value="" ${!state.tag ? 'checked' : ''}>
        <span>All Tags</span>
      </label>
      ${tags.map(t =>
      `<label class="filter-option ${state.tag === t ? 'active' : ''}">
          <input type="radio" name="desktop-tag" value="${t}" ${state.tag === t ? 'checked' : ''}>
          <span>${t}</span>
        </label>`
    ).join("")}`;
  }

  function renderMobileOptions(type, items) {
    const labels = {
      year: 'All Years',
      month: 'All Months',
      subcat: 'All Categories',
      tag: 'All Tags'
    };
    const stateKey = type === 'subcat' ? 'subCategory' : type;
    const currentVal = state[stateKey];

    return `
      <label><input type="radio" name="mobile-${type}" value="" ${!currentVal ? 'checked' : ''}> ${labels[type]}</label>
      ${items.map(item =>
      `<label><input type="radio" name="mobile-${type}" value="${item}" ${currentVal === item ? 'checked' : ''}> ${item}</label>`
    ).join("")}`;
  }

  function setupAllEventListeners() {
    // Desktop Filter Toggles
    block.querySelectorAll('.filter-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetId = toggle.getAttribute('data-target');
        const options = block.querySelector(`#${targetId}`);
        toggle.classList.toggle('active');
        options.classList.toggle('hidden');
      });
    });

    // Desktop Radio Filters
    setupRadioFilters('desktop-year', 'year');
    setupRadioFilters('desktop-month', 'month');
    setupRadioFilters('desktop-subcat', 'subCategory');
    setupRadioFilters('desktop-tag', 'tag');

    // Sort Toggle
    const sortToggleBtn = block.querySelector("#sort-toggle");
    const sortOpts = block.querySelector("#sort-options");
    if (sortToggleBtn) {
      sortToggleBtn.onclick = (e) => {
        e.stopPropagation();
        sortOpts.classList.toggle("show");
        sortToggleBtn.classList.toggle('active');
      };
    }

    // Sort Options
    block.querySelectorAll('input[name="sort"]').forEach(radio => {
      radio.addEventListener("change", () => {
        state.sort = radio.value;
        state.page = 1;
        renderCards();
        sortOpts.classList.remove("show");
        sortToggleBtn.classList.remove('active');
      });
    });

    // Mobile buttons
    block.querySelectorAll('.mobile-filter-btn').forEach(btn => {
      btn.onclick = () => openMobileModal(btn.dataset.type);
    });
  }

  function refreshFilterUI() {
    const yearOpts = block.querySelector('#year-options');
    const monthOpts = block.querySelector('#month-options');
    const subcatOpts = block.querySelector('#subcat-options');
    const tagOpts = block.querySelector('#tag-options');

    if (yearOpts) yearOpts.innerHTML = renderYearOptions(dynamicYears);
    if (monthOpts) monthOpts.innerHTML = renderMonthOptions(dynamicMonths);
    if (subcatOpts) subcatOpts.innerHTML = renderCategoryOptions(dynamicSubCats);
    if (tagOpts) tagOpts.innerHTML = renderTagOptions(dynamicTags);

    const mobileModalBody = block.querySelector('.mobile-filter-modal .modal-body');
    if (mobileModalBody) {
      mobileModalBody.querySelector('.year-group').innerHTML = renderMobileOptions('year', dynamicYears);
      mobileModalBody.querySelector('.month-group').innerHTML = renderMobileOptions('month', dynamicMonths);
      mobileModalBody.querySelector('.category-group').innerHTML = renderMobileOptions('subcat', dynamicSubCats);
      mobileModalBody.querySelector('.tag-group').innerHTML = renderMobileOptions('tag', dynamicTags);
    }

    setupAllEventListeners();
  }

  // Handle late-arriving filter data from filter-by fragment (override API-derived data)
  window.addEventListener('press-filters-ready', (e) => {
    const fd = e.detail || {};
    if (fd.years?.length) dynamicYears = fd.years;
    if (fd.months?.length) dynamicMonths = fd.months;
    if (fd.tags?.length) dynamicTags = fd.tags;
    if (fd.subCategories?.length) dynamicSubCats = fd.subCategories;
    refreshFilterUI();
  });

  const setupRadioFilters = (name, property) => {
    block.querySelectorAll(`input[name="${name}"]`).forEach(r => {
      r.addEventListener("change", () => {
        state[property] = r.value;
        state.page = 1;

        // Update active state
        const container = r.closest('.filter-options');
        if (container) {
          container.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('active'));
          r.closest('.filter-option').classList.add('active');
        }

        if (property === 'year') {
          const selectedYearText = block.querySelector('.selected-year');
          if (selectedYearText) selectedYearText.textContent = r.value || "All";
        }

        updateHeader();
        renderCards();
      });
    });
  };

  function scrollWithOffset(element, offset = 150) {
    if (!element) return;
    const top = element.offsetTop - offset;
    window.scrollTo({
      top: top > 0 ? top : 0,
      behavior: "smooth"
    });
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
    const subCategory = item?.subCategory || item?.category || "";

    const title = item?.metaTitle || item?.title || "Untitled";

    const publishDateRaw =
      item?.publishDate || (item.publishMonth && item.publishYear ? item.publishMonth + " " + item.publishYear : "");

    const publishDateFormatted = publishDateRaw
      ? formatDate(publishDateRaw)
      : "";

    // Image source handling
    let imageSrc = "";
    if (item.thumbnail?._publishUrl) {
      imageSrc = item.thumbnail._publishUrl;
    } else if (item.thumbnail?.url) {
      imageSrc = item.thumbnail.url;
    } else if (typeof item.thumbnail === 'string') {
      imageSrc = item.thumbnail;
    } else {
      imageSrc = "https://via.placeholder.com/300x200?text=No+Image";
    }

    // Create badge class from subCategory
    const badgeClass = subCategory
      ? subCategory.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "")
      : "";

    // Add video attribute if exists
    const videoAttr = item.video ? `data-video="${item.video}"` : "";

    return `
  <article class="press-card">
    <div class="press-card-image" ${videoAttr} style="${item.video ? 'cursor: pointer;' : ''}">
      <img
        src="${imageSrc}"
        alt="${title}"
        loading="lazy"
        onerror="this.src='https://via.placeholder.com/300x200?text=Image+Not+Found'; this.onerror=null;"
      />
      ${item.video ? '<div class="play-icon inner-hero-play"></div>' : ''}
    </div>

    <div class="press-card-body">
      <div class="press-card-meta">
        ${subCategory ? `<span class="badge ${badgeClass}">${slugToTitle(subCategory)}</span>` : ""}
        ${subCategory && publishDateFormatted ? '<span class="meta-separator">|</span>' : ""}
        ${publishDateFormatted
        ? `<span class="meta-date">
          <svg class="icon-calendar" width="14" height="14" viewBox="0 0 20 20" fill="none">
            <path d="M1.66669 10C1.66669 6.85734 1.66669 5.286 2.643 4.30968C3.61931 3.33337 5.19066 3.33337 8.33335 3.33337H11.6667C14.8094 3.33337 16.3807 3.33337 17.357 4.30968C18.3334 5.286 18.3334 6.85734 18.3334 10V11.6667C18.3334 14.8094 18.3334 16.3808 17.357 17.3571C16.3807 18.3334 14.8094 18.3334 11.6667 18.3334H8.33335C5.19066 18.3334 3.61931 18.3334 2.643 17.3571C1.66669 16.3808 1.66669 14.8094 1.66669 11.6667V10Z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M5.83331 3.33337V2.08337" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M14.1667 3.33337V2.08337" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M2.08331 7.5H17.9166" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          ${publishDateFormatted}
        </span>`
        : ""
      }
      </div>
      <h3 class="press-card-title">
        ${title}
      </h3>
    </div>
  </article>
`;
  }

  /* ================= Render Functions ================= */

  async function renderCards() {
    try {
      desktopList.innerHTML = '<div class="loading">Loading...</div>';
      mobileList.innerHTML = '<div class="loading">Loading...</div>';
      countText.textContent = "Loading...";

      state.totalCount = await fetchApiCount(
        state.subCategory,
        state.year,
        state.month,
        state.tag,
        state.sort,
      );

      state.offset = (state.page - 1) * state.limit;

      const items = await fetchApiData(
        state.limit,
        state.offset,
        state.subCategory,
        state.year,
        state.month,
        state.tag,
        state.sort,
      );

      if (items.length === 0) {
        desktopList.innerHTML =
          '<div class="no-results">No results found</div>';
        mobileList.innerHTML = '<div class="no-results">No results found</div>';
      } else {
        const cardsHTML = items.map(createCardHTML).join("");
        desktopList.innerHTML = cardsHTML;
        mobileList.innerHTML = cardsHTML;

        // Create video modal and attach handlers
        createVideoModal();
        attachVideoClickHandlers();
      }

      updateCountDisplay();
      renderPagination();
      updateMobileFilterButtons();
    } catch (error) {
      console.error("Error fetching API data:", error);
      desktopList.innerHTML =
        '<div class="error">Error loading data. Please try again.</div>';
      mobileList.innerHTML =
        '<div class="error">Error loading data. Please try again.</div>';
      countText.textContent = "Error";
    }
  }

  function attachVideoClickHandlers() {
    const videoImages = block.querySelectorAll(".press-card-image[data-video]");
    videoImages.forEach(el => {
      el.removeEventListener("click", videoClickHandler);
      el.addEventListener("click", videoClickHandler);
    });
  }

  function videoClickHandler(event) {
    const imageEl = event.currentTarget;
    const videoUrl = imageEl.dataset.video;
    if (videoUrl) {
      openVideoModal(videoUrl);
    }
  }

  function renderPagination() {
    const totalPages = Math.ceil(state.totalCount / state.limit);

    if (totalPages <= 1) {
      desktopPagination.innerHTML = "";
      mobilePagination.innerHTML = "";
      return;
    }

    let html = "";

    // Previous button
    html += `
      <button class="page-btn prev ${state.page === 1 ? "disabled" : ""}" data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""}>
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M26.6667 16H5.33335M5.33335 16L13.3334 8M5.33335 16L13.3334 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `;

    // Page numbers with smart ellipsis
    const maxVisible = 5;
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
      <button class="page-btn next ${state.page === totalPages ? "disabled" : ""}" data-page="${state.page + 1}" ${state.page === totalPages ? "disabled" : ""}>
        <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5.33334 16H26.6667M26.6667 16L18.6667 8M26.6667 16L18.6667 24" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `;

    desktopPagination.innerHTML = html;
    mobilePagination.innerHTML = html;
  }

  /* ================= Mobile Modal Functions ================= */

  function updateMobileFilterButtons() {
    mobileFilterBtns.forEach((btn) => {
      const type = btn.dataset.type;
      let text = "";

      if (type === "category") {
        text = state.subCategory ? slugToTitle(state.subCategory) : "Category";
      }

      btn.innerHTML = `${text} <span class="arrow">
        <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
        </svg>
      </span>`;
    });
  }

  function openMobileModal(type) {
    mobileModal.classList.add("open");
    document.body.style.overflow = "hidden";

    // Hide all groups first
    categoryGroup.style.display = "none";
    tagGroup.style.display = "none";

    // Show selected group
    if (type === "category") {
      categoryGroup.style.display = "block";

      // Set current value
      const catRadio = categoryGroup.querySelector(
        `input[name="mobile-subcat"][value="${state.subCategory}"]`,
      );
      if (catRadio) {
        catRadio.checked = true;
      } else {
        const allRadio = categoryGroup.querySelector('input[name="mobile-subcat"][value=""]');
        if (allRadio) allRadio.checked = true;
      }
    }
  }

  function closeMobileModal() {
    mobileModal.classList.remove("open");
    document.body.style.overflow = "";
  }

  function applyMobileFilters() {
    const selectedCat = categoryGroup.querySelector(
      'input[name="mobile-subcat"]:checked',
    );

    if (selectedCat && selectedCat.value !== state.subCategory) {
      state.subCategory = selectedCat.value;
      state.page = 1;
    }

    closeMobileModal();
    updateHeader();
    updateMobileFilterButtons();
    renderCards();
  }

  /* ================= Event Listeners ================= */

  // Close filter options when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.filter-group-collapsible')) {
      block.querySelectorAll('.filter-options').forEach(options => {
        if (!options.classList.contains('hidden')) {
          options.classList.add('hidden');
          const toggle = block.querySelector(`[data-target="${options.id}"]`);
          if (toggle) toggle.classList.remove('active');
        }
      });
    }
  });

  // Pagination clicks
  desktopPagination.addEventListener("click", async (e) => {
    const btn = e.target.closest(".page-btn");
    if (!btn || btn.classList.contains("disabled") || btn.disabled) return;
    state.page = parseInt(btn.dataset.page, 10);
    await renderCards();
    scrollWithOffset(desktopList, 300);
  });

  mobilePagination.addEventListener("click", async (e) => {
    const btn = e.target.closest(".page-btn");
    if (!btn || btn.classList.contains("disabled") || btn.disabled) return;
    state.page = parseInt(btn.dataset.page, 10);
    await renderCards();
    scrollWithOffset(mobileList, 300);
  });

  // Mobile Modal Events
  modalOverlay.addEventListener('click', closeMobileModal);
  closeModalBtn.addEventListener('click', closeMobileModal);
  applyBtn.addEventListener('click', applyMobileFilters);

  // Escape key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileModal.classList.contains('open')) {
      closeMobileModal();
    }
  });

  setupAllEventListeners();

  /* ================= Initial Render ================= */
  renderCards();
}

/* ================= API Functions ================= */

async function fetchApiData(limit = 6, offset = 0, category = "", publishyear = "", publishmonth = "", tag = "", orderby = "desc",) {
  try {
    const apiUrl =
      `${getApiHost()}/api/v1/web/gmr-api/films-list` +
      `?limit=${encodeURIComponent(limit)}` +
      `&offset=${encodeURIComponent(offset)}` +
      `&category=${encodeURIComponent(category)}` +
      `&publishyear=${encodeURIComponent(publishyear)}` +
      `&publishmonth=${encodeURIComponent(publishmonth ? publishmonth.toLowerCase() : "")}` +
      `&tag=${encodeURIComponent(tag ? tag.toLowerCase() : "")}` +
      `&orderby=${encodeURIComponent(orderby)}`;

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`API error ${res.status}`);

    const json = await res.json();
    return json?.data?.data?.filmsVisualsList?.items || [];
  } catch (error) {
    console.error("Error in fetchApiData:", error);
    return [];
  }
}

async function fetchApiCount(category = "", publishyear = "", publishmonth = "", tag = "") {
  try {
    const apiUrl =
      `${getApiHost()}/api/v1/web/gmr-api/films-count` +
      `?category=${encodeURIComponent(category)}` +
      `&publishyear=${encodeURIComponent(publishyear)}` +
      `&publishmonth=${encodeURIComponent(publishmonth ? publishmonth.toLowerCase() : "")}` +
      `&tag=${encodeURIComponent(tag ? tag.toLowerCase() : "")}`;

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`API error ${res.status}`);

    const json = await res.json();
    const items = json?.data?.data?.filmsVisualsList?.items || [];
    return items.length;
  } catch (error) {
    console.error("Error in fetchApiCount:", error);
    return 0;
  }
}

/**
 * Fetches all film items (large limit) for deriving filter options.
 * Used as a self-sufficient fallback when no filter-by fragment is present.
 */
async function fetchAllItems() {
  try {
    const apiUrl =
      `${getApiHost()}/api/v1/web/gmr-api/films-list` +
      `?limit=500&offset=0&category=&publishyear=&publishmonth=&tag=&orderby=desc`;

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`API error ${res.status}`);

    const json = await res.json();
    return json?.data?.data?.filmsVisualsList?.items || [];
  } catch (error) {
    console.error("Error in fetchAllItems:", error);
    return [];
  }
}