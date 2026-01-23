export default function decorate(block) {
  console.log("Decorating Press Release Listing block");

  const children = [...block.children];
  if (children.length < 5) return;

  /* ================================
     1️⃣ Read authored content
  ================================ */
  const sectionTitle = children[0]?.textContent?.trim() || "All Releases";
  const allReleasesLabel = children[1]?.textContent?.trim() || "All";
  const filterPanelTitle = children[2]?.textContent?.trim() || "Filter by";
  const defaultYear = children[3]?.textContent?.trim() || "";
  const items = children.slice(4);

  /* ================================
     2️⃣ Check for Author Mode (AEM SAFE)
  ================================ */
  const isAuthorMode = document.body.classList.contains('universal-editor-edit') ||
    document.body.classList.contains('aem-AuthorLayer-Edit') ||
    window.location.href.includes('/editor.html');

  if (isAuthorMode) {
    block.classList.add('press-listing-author-mode');
    const authorNote = document.createElement('div');
    authorNote.className = 'press-listing-author-note';
    authorNote.innerHTML = `
      <p><strong>📰 Press Release Listing Component</strong></p>
      <p><small>• Edit press release items in the table below</small></p>
      <p><small>• Filter UI appears in publish mode</small></p>
    `;
    block.insertBefore(authorNote, children[0]);
    return;
  }

  /* ================================
     3️⃣ Preserve authored content for Universal Editor (AEM SAFE)
  ================================ */
  const authoredContentWrapper = document.createElement('div');
  authoredContentWrapper.className = 'press-listing-authored-content';
  authoredContentWrapper.setAttribute('aria-hidden', 'true');
  authoredContentWrapper.style.cssText = `
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
    opacity: 0 !important;
    pointer-events: none !important;
    visibility: hidden !important;
  `;

  // Move all children to the hidden wrapper while preserving them in DOM
  while (block.firstChild) {
    authoredContentWrapper.appendChild(block.firstChild);
  }

  // Add the hidden wrapper back to the block
  block.appendChild(authoredContentWrapper);

  /* ================================
     4️⃣ Runtime wrapper
  ================================ */
  const runtime = document.createElement("section");
  runtime.className = "press-listing-runtime bg-gray";

  runtime.innerHTML = `
    <div class="container">
      <!-- Desktop Layout -->
      <div class="press-layout desktop-layout">
        <aside class="press-filter-panel">
          <h4>${filterPanelTitle}</h4>
          <div class="filter-group">
            <label class="filter-label">Year</label>
            <select class="year-filter">
              <option value="">All Years</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Month</label>
            <select class="month-filter">
              <option value="">All Months</option>
              <option value="01">January</option>
              <option value="02">February</option>
              <option value="03">March</option>
              <option value="04">April</option>
              <option value="05">May</option>
              <option value="06">June</option>
              <option value="07">July</option>
              <option value="08">August</option>
              <option value="09">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
          <div class="filter-group category-group">
            <label class="filter-label">Business Category</label>
            <ul class="category-filter">
              <li data-category="all" class="active">${allReleasesLabel}</li>
            </ul>
          </div>
        </aside>
        <div class="press-main">
          <div class="press-header">
            <h2 class="press-title">${sectionTitle} - <span class="year-display">${defaultYear || new Date().getFullYear()}</span></h2>
            <p class="press-count">Displaying <span class="count-display">0</span></p>
          </div>
          <div class="press-list"></div>
        </div>
      </div>

      <!-- Mobile Layout -->
      <div class="press-layout mobile-layout">
        <div class="mobile-filter-buttons">
          <button class="mobile-filter-btn year-btn" data-type="year">
            Year <span class="arrow"><svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
</svg></span>
          </button>
          <button class="mobile-filter-btn category-btn" data-type="category">
            Filter by <span class="arrow"><svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
</svg></span>
          </button>
        </div>
        <div class="press-list"></div>
        
        <!-- Mobile Filter Modal -->
        <div class="mobile-filter-modal">
          <div class="mobile-filter-overlay"></div>
          <div class="mobile-filter-content">
            <div class="modal-header">
              <h3>Select Filter</h3>
              <button class="close-modal">×</button>
            </div>
            <div class="filter-group year-group" style="display: none;">
              <label><input type="radio" name="year" value="" checked> All Years</label>
            </div>
            <div class="filter-group month-group" style="display: none;">
              <label><input type="radio" name="month" value="" checked> All Months</label>
              <label><input type="radio" name="month" value="01"> January</label>
              <label><input type="radio" name="month" value="02"> February</label>
              <label><input type="radio" name="month" value="03"> March</label>
              <label><input type="radio" name="month" value="04"> April</label>
              <label><input type="radio" name="month" value="05"> May</label>
              <label><input type="radio" name="month" value="06"> June</label>
              <label><input type="radio" name="month" value="07"> July</label>
              <label><input type="radio" name="month" value="08"> August</label>
              <label><input type="radio" name="month" value="09"> September</label>
              <label><input type="radio" name="month" value="10"> October</label>
              <label><input type="radio" name="month" value="11"> November</label>
              <label><input type="radio" name="month" value="12"> December</label>
            </div>
            <div class="filter-group category-group" style="display: none;">
              <label><input type="radio" name="category" value="all" checked> ${allReleasesLabel}</label>
            </div>
            <div class="apply-filter-btn">
              <button class="apply-btn">Apply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  block.appendChild(runtime);

  /* ================================
     5️⃣ DOM References
  ================================ */
  const desktopList = runtime.querySelector('.desktop-layout .press-list');
  const mobileList = runtime.querySelector('.mobile-layout .press-list');
  const yearSelectDesktop = runtime.querySelector('.year-filter');
  const monthSelectDesktop = runtime.querySelector('.month-filter');
  const categoryListDesktop = runtime.querySelector('.category-filter');
  const yearFilterBtn = runtime.querySelector('.year-btn');
  const categoryFilterBtn = runtime.querySelector('.category-btn');
  const mobileModal = runtime.querySelector('.mobile-filter-modal');
  const modalOverlay = runtime.querySelector('.mobile-filter-overlay');
  const modalHeader = runtime.querySelector('.modal-header');
  const yearGroup = runtime.querySelector('.year-group');
  const monthGroup = runtime.querySelector('.month-group');
  const categoryGroup = runtime.querySelector('.mobile-filter-content .category-group');
  const applyButton = runtime.querySelector('.apply-btn');
  const closeModalBtn = runtime.querySelector('.close-modal');
  const countDisplay = runtime.querySelector('.count-display');
  const yearDisplay = runtime.querySelector('.year-display');

  /* ================================
     6️⃣ Data Collection & Card Building
  ================================ */
  const years = new Set();
  const categories = new Set();
  const cardsDesktop = [];
  const cardsMobile = [];

  // Use the items from the authored content wrapper
  const authoredItems = [...authoredContentWrapper.children]
    .slice(4)
    .sort((a, b) => {
      // Sort by date (newest first)
      const dateA = a.children[3]?.textContent?.trim() || "";
      const dateB = b.children[3]?.textContent?.trim() || "";
      return new Date(dateB) - new Date(dateA);
    });

  // Helper function to extract image URL
  const extractImageUrl = (imgElement) => {
    if (!imgElement) return '';
    if (imgElement.tagName === 'IMG') {
      return imgElement.src;
    } else if (imgElement.tagName === 'PICTURE') {
      const img = imgElement.querySelector('img');
      return img ? img.src : '';
    }
    return '';
  };

  authoredItems.forEach((item) => {
    const cols = [...item.children];
    if (!cols.length) return;

    // Item structure: category, year, image, title, publishDate, lastUpdated, ctaLink
    const category = cols[0]?.textContent?.trim().toLowerCase() || "";
    const year = cols[1]?.textContent?.trim() || "";
    let imageEl = null;
    if (cols[2]) imageEl = cols[2].querySelector("img") || cols[2].querySelector("picture");
    const title = cols[3]?.textContent?.trim() || "";
    const publishDate = cols[4]?.textContent?.trim() || "";
    const lastUpdated = cols[5]?.textContent?.trim() || "";
    const ctaLink = cols[6]?.querySelector("a")?.href || cols[6]?.textContent?.trim() || "#";

    if (!category && !year && !title && !imageEl) return;

    // Extract month from publishDate (format: "01 Jan 2026")
    let month = "";
    if (publishDate) {
      const dateMatch = publishDate.match(/(\d{2})\s+(\w{3})\s+(\d{4})/);
      if (dateMatch) {
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const monthIndex = monthNames.indexOf(dateMatch[2].toLowerCase());
        if (monthIndex !== -1) {
          month = String(monthIndex + 1).padStart(2, '0');
        }
      }
    }

    if (year) years.add(year);
    if (category) categories.add(category);

    const createCard = () => {
      const card = document.createElement("article");
      card.className = "press-card";
      card.dataset.year = year;
      card.dataset.month = month;
      card.dataset.category = category;

      const imageUrl = extractImageUrl(imageEl);
      const badgeClass = category.replace(/\s+/g, '-').replace(/&/g, '');

      card.innerHTML = `
        <div class="press-card-image">
          ${imageUrl ? `<img src="${imageUrl}" alt="${title}" loading="lazy">` : ''}
        </div>
        <div class="press-card-body">
          <h3 class="press-card-title">${title}</h3>
          <div class="press-card-meta">
            ${category ? `<span class="badge ${badgeClass}">${category.charAt(0).toUpperCase() + category.slice(1)}</span>` : ''}
            ${category ? '<span class="meta-separator">|</span>' : ''}
            ${publishDate ? `
              <span class="meta-date">
                <svg class="icon-calendar" width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M12.667 2.667H3.333C2.597 2.667 2 3.264 2 4v9.333c0 .737.597 1.334 1.333 1.334h9.334c.736 0 1.333-.597 1.333-1.334V4c0-.736-.597-1.333-1.333-1.333z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10.667 1.333v2.667M5.333 1.333v2.667M2 6.667h12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                ${publishDate}
              </span>
            ` : ''}
          </div>
          <div class="press-card-footer">
            <a href="${ctaLink}" class="btn-read-more">
              READ MORE
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3.333 8h9.334M8 3.333L12.667 8 8 12.667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
            ${lastUpdated ? `<span class="meta-updated">Last Updated : ${lastUpdated}</span>` : ''}
          </div>
        </div>
      `;

      return card;
    };

    const cardDesktop = createCard();
    const cardMobile = createCard();

    desktopList.appendChild(cardDesktop);
    mobileList.appendChild(cardMobile);

    cardsDesktop.push(cardDesktop);
    cardsMobile.push(cardMobile);
  });

  /* ================================
     7️⃣ Populate Filters
  ================================ */
  const sortedYears = Array.from(years).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  const sortedCategories = Array.from(categories).sort();

  // Desktop Year Filter
  sortedYears.forEach(y => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    if (y === defaultYear) opt.selected = true;
    yearSelectDesktop.appendChild(opt);
  });

  // Desktop Category Filter
  sortedCategories.forEach(cat => {
    const li = document.createElement("li");
    li.dataset.category = cat;
    li.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryListDesktop.appendChild(li);
  });

  // Mobile Year Filter
  sortedYears.forEach(y => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="radio" name="year" value="${y}" id="year-${y}"> ${y}`;
    yearGroup.appendChild(label);
  });

  // Mobile Category Filter
  sortedCategories.forEach(cat => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="radio" name="category" value="${cat}" id="category-${cat}"> ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
    categoryGroup.appendChild(label);
  });

  /* ================================
     8️⃣ State Management
  ================================ */
  const state = {
    year: defaultYear || "",
    month: "",
    category: "all",
    tempYear: "",
    tempMonth: "",
    tempCategory: "all"
  };

  /* ================================
     9️⃣ Filter Functions
  ================================ */
  function applyFilter(yearVal, monthVal, catVal, cards) {
    state.year = yearVal;
    state.month = monthVal;
    state.category = catVal;

    let visibleCount = 0;
    cards.forEach(card => {
      const yearMatch = !yearVal || card.dataset.year === yearVal;
      const monthMatch = !monthVal || card.dataset.month === monthVal;
      const catMatch = catVal === "all" || card.dataset.category === catVal;
      const isVisible = yearMatch && monthMatch && catMatch;
      card.style.display = isVisible ? "" : "none";
      if (isVisible) visibleCount++;
    });

    // Update count display
    countDisplay.textContent = visibleCount;
    yearDisplay.textContent = yearVal || "All Years";

    updateButtonText();
  }

  function updateButtonText() {
    // Update Year button text
    const yearText = state.year || "Year";
    yearFilterBtn.innerHTML = `${yearText} <span class="arrow"><svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
</svg></span>`;

    // Update Category button text
    const catText = state.category === "all" ?
      allReleasesLabel :
      state.category.charAt(0).toUpperCase() + state.category.slice(1);
    categoryFilterBtn.innerHTML = `Filter by - ${catText} <span class="arrow"><svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
</svg></span>`;
  }

  function openModal(filterType) {
    mobileModal.classList.add("open");
    document.body.style.overflow = 'hidden';

    // Set temp filters to current state
    state.tempYear = state.year;
    state.tempMonth = state.month;
    state.tempCategory = state.category;

    // Update modal UI
    const modalTitle = modalHeader.querySelector('h3');
    if (filterType === 'year') {
      modalTitle.textContent = 'Filter by Year & Month';
      yearGroup.style.display = 'block';
      monthGroup.style.display = 'block';
      categoryGroup.style.display = 'none';
    } else {
      modalTitle.textContent = 'Filter by Category';
      yearGroup.style.display = 'none';
      monthGroup.style.display = 'none';
      categoryGroup.style.display = 'block';
    }

    // Set active radio buttons
    if (filterType === 'year') {
      const yearRadio = yearGroup.querySelector(`input[name="year"][value="${state.tempYear}"]`);
      if (yearRadio) yearRadio.checked = true;
      else yearGroup.querySelector('input[name="year"][value=""]').checked = true;
      
      const monthRadio = monthGroup.querySelector(`input[name="month"][value="${state.tempMonth}"]`);
      if (monthRadio) monthRadio.checked = true;
      else monthGroup.querySelector('input[name="month"][value=""]').checked = true;
    } else {
      const catRadio = categoryGroup.querySelector(`input[name="category"][value="${state.tempCategory}"]`);
      if (catRadio) catRadio.checked = true;
      else categoryGroup.querySelector('input[name="category"][value="all"]').checked = true;
    }

    // Update button states
    yearFilterBtn.classList.toggle('active', filterType === 'year');
    categoryFilterBtn.classList.toggle('active', filterType === 'category');
  }

  function closeModal() {
    mobileModal.classList.remove("open");
    document.body.style.overflow = '';
    yearFilterBtn.classList.remove('active');
    categoryFilterBtn.classList.remove('active');
  }

  /* ================================
     🔟 Event Listeners
  ================================ */
  // Desktop Filters
  yearSelectDesktop.addEventListener("change", () => {
    const activeCat = categoryListDesktop.querySelector(".active")?.dataset.category || "all";
    applyFilter(yearSelectDesktop.value, monthSelectDesktop.value, activeCat, cardsDesktop);
  });

  monthSelectDesktop.addEventListener("change", () => {
    const activeCat = categoryListDesktop.querySelector(".active")?.dataset.category || "all";
    applyFilter(yearSelectDesktop.value, monthSelectDesktop.value, activeCat, cardsDesktop);
  });

  categoryListDesktop.addEventListener("click", e => {
    if (e.target.tagName !== "LI") return;

    categoryListDesktop.querySelectorAll("li").forEach(li => li.classList.remove("active"));
    e.target.classList.add("active");

    applyFilter(yearSelectDesktop.value, monthSelectDesktop.value, e.target.dataset.category, cardsDesktop);
  });

  // Mobile Filters
  yearFilterBtn.addEventListener("click", () => openModal('year'));
  categoryFilterBtn.addEventListener("click", () => openModal('category'));

  modalOverlay.addEventListener("click", closeModal);
  closeModalBtn.addEventListener('click', closeModal);

  // Mobile Radio Button Changes
  yearGroup.querySelectorAll('input[name="year"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.tempYear = radio.value;
    });
  });

  monthGroup.querySelectorAll('input[name="month"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.tempMonth = radio.value;
    });
  });

  categoryGroup.querySelectorAll('input[name="category"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.tempCategory = radio.value;
    });
  });

  // Apply Button
  applyButton.addEventListener('click', () => {
    applyFilter(state.tempYear, state.tempMonth, state.tempCategory, cardsMobile);
    closeModal();
  });

  // Escape Key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileModal.classList.contains('open')) {
      closeModal();
    }
  });

  /* ================================
     1️⃣1️⃣ Initialize
  ================================ */
  // Set initial state
  if (defaultYear) {
    yearSelectDesktop.value = defaultYear;
  }
  applyFilter(state.year, state.month, "all", cardsDesktop);
  applyFilter(state.year, state.month, "all", cardsMobile);

  // Initialize desktop UI
  categoryListDesktop.querySelectorAll("li").forEach(li => li.classList.remove("active"));
  categoryListDesktop.querySelector('li[data-category="all"]').classList.add("active");

  console.log("Press Release Listing block initialized");
}
