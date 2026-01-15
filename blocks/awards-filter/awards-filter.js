export default function decorate(block) {
  const children = [...block.children];
  if (children.length < 5) return;

  const allAwardsLabel = children[1]?.textContent?.trim() || "All Awards";
  const filterPanelTitle = children[2]?.textContent?.trim() || "Filter by Year and Category";
  const defaultYear = children[3]?.textContent?.trim() || "";
  const items = children.slice(4);

  const isAuthorMode = document.body.classList.contains('universal-editor-edit') ||
                       document.body.classList.contains('aem-AuthorLayer-Edit') ||
                       window.location.href.includes('/editor.html');

  if (isAuthorMode) {
    block.classList.add('awards-author-mode');
    const authorNote = document.createElement('div');
    authorNote.className = 'awards-author-note';
    authorNote.innerHTML = `
      <p><strong>🏆 Awards List Component</strong></p>
      <p><small>• Edit award items in the table below</small></p>
      <p><small>• Filter UI appears in publish mode</small></p>
    `;
    block.insertBefore(authorNote, children[0]);
    return;
  }

  /* =========================
     RUNTIME STRUCTURE
  ========================= */
  const section = document.createElement("section");
  section.className = "awards-filter-runtime bg-gray";

  const container = document.createElement("div");
  container.className = "container";

  // ---------------- DESKTOP ----------------
  const desktopLayout = document.createElement("div");
  desktopLayout.className = "awards-layout desktop-layout";

  const desktopAside = document.createElement("aside");
  desktopAside.className = "awards-filter-panel";
  desktopAside.innerHTML = `<h4>${filterPanelTitle}</h4>`;
  
  const yearSelectDesktop = document.createElement("select");
  yearSelectDesktop.className = "year-filter";
  desktopAside.appendChild(yearSelectDesktop);
  
  const categoryListDesktop = document.createElement("ul");
  categoryListDesktop.className = "category-filter";
  const allLiDesktop = document.createElement("li");
  allLiDesktop.textContent = allAwardsLabel;
  allLiDesktop.dataset.category = "all";
  allLiDesktop.classList.add("active");
  categoryListDesktop.appendChild(allLiDesktop);
  desktopAside.appendChild(categoryListDesktop);

  const desktopList = document.createElement("div");
  desktopList.className = "awards-list";

  desktopLayout.appendChild(desktopAside);
  desktopLayout.appendChild(desktopList);

  // ---------------- MOBILE ----------------
  const mobileLayout = document.createElement("div");
  mobileLayout.className = "awards-layout mobile-layout";

  // Mobile filter buttons container
  const mobileFilterButtons = document.createElement("div");
  mobileFilterButtons.className = "mobile-filter-buttons";

  // Year filter button
  const yearFilterBtn = document.createElement("button");
  yearFilterBtn.className = "mobile-filter-btn year-btn";
  yearFilterBtn.dataset.type = "year";
  yearFilterBtn.innerHTML = `Year <span class="arrow">▼</span>`;

  // Category filter button
  const categoryFilterBtn = document.createElement("button");
  categoryFilterBtn.className = "mobile-filter-btn category-btn";
  categoryFilterBtn.dataset.type = "category";
  categoryFilterBtn.innerHTML = `Filter by <span class="arrow">▼</span>`;

  mobileFilterButtons.appendChild(yearFilterBtn);
  mobileFilterButtons.appendChild(categoryFilterBtn);

  // Mobile filter modal
  const mobileModal = document.createElement("div");
  mobileModal.className = "mobile-filter-modal";

  const modalOverlay = document.createElement("div");
  modalOverlay.className = "mobile-filter-overlay";

  const modalContent = document.createElement("div");
  modalContent.className = "mobile-filter-content";

  // Modal header
  const modalHeader = document.createElement("div");
  modalHeader.className = "modal-header";
  modalHeader.innerHTML = `
    <h3>Select Year</h3>
    <button class="close-modal">×</button>
  `;
  modalContent.appendChild(modalHeader);

  // Year group
  const yearGroup = document.createElement("div");
  yearGroup.className = "filter-group year-group";
  yearGroup.style.display = "none";

  // Category group
  const categoryGroup = document.createElement("div");
  categoryGroup.className = "filter-group category-group";
  categoryGroup.style.display = "none";

  modalContent.appendChild(yearGroup);
  modalContent.appendChild(categoryGroup);

  // Apply button container
  const applyButtonContainer = document.createElement("div");
  applyButtonContainer.className = "apply-filter-btn";
  const applyButton = document.createElement("button");
  applyButton.className = "apply-btn";
  applyButton.textContent = "Apply";
  applyButtonContainer.appendChild(applyButton);
  modalContent.appendChild(applyButtonContainer);

  mobileModal.appendChild(modalOverlay);
  mobileModal.appendChild(modalContent);

  const mobileList = document.createElement("div");
  mobileList.className = "awards-list";

  mobileLayout.appendChild(mobileFilterButtons);
  mobileLayout.appendChild(mobileList);
  mobileLayout.appendChild(mobileModal);

  container.appendChild(desktopLayout);
  container.appendChild(mobileLayout);
  section.appendChild(container);
  block.appendChild(section);

  /* =========================
     DATA COLLECTION
  ========================= */
  const years = new Set();
  const categories = new Set();
  const cardsDesktop = [];
  const cardsMobile = [];

  items.forEach((item) => {
    const cols = [...item.children];
    if (!cols.length) return;

    const category = cols[0]?.textContent?.trim().toLowerCase() || "";
    const year = cols[1]?.textContent?.trim() || "";
    let imageEl = null;
    if (cols[2]) imageEl = cols[2].querySelector("img") || cols[2].querySelector("picture");
    const title = cols[3]?.textContent?.trim() || "";
    const description = cols[4]?.innerHTML?.trim() || "";

    if (!category && !year && !title && !description && !imageEl) return;

    if (year) years.add(year);
    if (category) categories.add(category);

    const createCard = () => {
      const card = document.createElement("article");
      card.className = "award-card";
      card.dataset.year = year;
      card.dataset.category = category;
      
        if (imageEl) {
          const imgWrap = document.createElement("div");
          imgWrap.className = "award-img";
          const clonedImg = imageEl.cloneNode(true);
          imgWrap.appendChild(clonedImg);
          card.appendChild(imgWrap);
        }
      
      const content = document.createElement("div");
      content.className = "award-content";
      
      if (title) {
        const titleEl = document.createElement("h3");
        titleEl.textContent = title;
        content.appendChild(titleEl);
      }
      
      if (description) {
  const temp = document.createElement("div");
  temp.innerHTML = description;

  let p = temp.querySelector("p");

  if (!p) {
    p = document.createElement("p");
    p.textContent = description;
  }

  p.classList.add("award-description");
  content.appendChild(p);
}
      
      card.appendChild(content);
      return card;
    };

    const cardDesktop = createCard();
    const cardMobile = createCard();

    desktopList.appendChild(cardDesktop);
    mobileList.appendChild(cardMobile);

    cardsDesktop.push(cardDesktop);
    cardsMobile.push(cardMobile);
  });

  /* =========================
     POPULATE FILTERS
  ========================= */
  const sortedYears = Array.from(years).sort((a,b) => b.localeCompare(a, undefined, { numeric: true }));
  const sortedCategories = Array.from(categories).sort();

  // Desktop Filters
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "All Years";
  yearSelectDesktop.appendChild(defaultOption);
  
  sortedYears.forEach(y => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    if (y === defaultYear) opt.selected = true;
    yearSelectDesktop.appendChild(opt);
  });
  
  sortedCategories.forEach(cat => {
    const li = document.createElement("li");
    li.dataset.category = cat;
    li.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryListDesktop.appendChild(li);
  });

  // Mobile Year Filters
  yearGroup.innerHTML = `<p>Year</p>`;
  const allYearLabel = document.createElement("label");
  allYearLabel.innerHTML = `<input type="radio" name="year" value="" id="year-all" checked> All Years`;
  yearGroup.appendChild(allYearLabel);
  
  sortedYears.forEach(y => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="radio" name="year" value="${y}" id="year-${y}"> ${y}`;
    yearGroup.appendChild(label);
  });

  // Mobile Category Filters
  categoryGroup.innerHTML = `<p>Filter by Category</p>`;
  const allLabel = document.createElement("label");
  allLabel.innerHTML = `<input type="radio" name="category" value="all" id="category-all" checked> ${allAwardsLabel}`;
  categoryGroup.appendChild(allLabel);
  
  sortedCategories.forEach(cat => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="radio" name="category" value="${cat}" id="category-${cat}"> ${cat.charAt(0).toUpperCase() + cat.slice(1)}`;
    categoryGroup.appendChild(label);
  });

  /* =========================
     STATE MANAGEMENT
  ========================= */
  let currentFilters = {
    year: "",
    category: "all"
  };

  let tempFilters = {
    year: "",
    category: "all"
  };

  /* =========================
     FILTER LOGIC
  ========================= */
  function applyFilter(yearVal, catVal, cards) {
    currentFilters.year = yearVal;
    currentFilters.category = catVal;
    
    cards.forEach(card => {
      const yearMatch = !yearVal || card.dataset.year === yearVal;
      const catMatch = catVal === "all" || card.dataset.category === catVal;
      card.style.display = yearMatch && catMatch ? "" : "none";
    });
  }

  function updateButtonText() {
    // Update Year button text
    const yearText = currentFilters.year || "Year";
    yearFilterBtn.innerHTML = `${yearText} <span class="arrow">▼</span>`;
    
    // Update Category button text
    const catText = currentFilters.category === "all" ? 
                   allAwardsLabel : 
                   currentFilters.category.charAt(0).toUpperCase() + currentFilters.category.slice(1);
    categoryFilterBtn.innerHTML = `Filter by - ${catText} <span class="arrow">▼</span>`;
  }

  function resetToAll() {
    // Reset all filters to show all records
    currentFilters = {
      year: "",
      category: "all"
    };
    
    // Reset UI elements
    yearSelectDesktop.value = "";
    
    categoryListDesktop.querySelectorAll("li").forEach(li => li.classList.remove("active"));
    categoryListDesktop.querySelector('li[data-category="all"]').classList.add("active");
    
    // Reset mobile radio buttons
    const allYearRadio = modalContent.querySelector('input[name="year"][value=""]');
    if (allYearRadio) allYearRadio.checked = true;
    
    const allCategoryRadio = modalContent.querySelector('input[name="category"][value="all"]');
    if (allCategoryRadio) allCategoryRadio.checked = true;
    
    // Apply filters to show all records
    applyFilter("", "all", cardsDesktop);
    applyFilter("", "all", cardsMobile);
    updateButtonText();
  }

  /* =========================
     MOBILE MODAL FUNCTIONS
  ========================= */
  function openModal(filterType) {
    mobileModal.classList.add("open");
    document.body.style.overflow = 'hidden';
    
    // Reset temp filters to current filters
    tempFilters = { ...currentFilters };
    
    // Update modal title
    const modalTitle = modalHeader.querySelector('h3');
    if (filterType === 'year') {
      modalTitle.textContent = 'Select Year';
      yearGroup.style.display = 'block';
      categoryGroup.style.display = 'none';
    } else {
      modalTitle.textContent = 'Select Category';
      yearGroup.style.display = 'none';
      categoryGroup.style.display = 'block';
    }
    
    // Set radio buttons based on temp filters
    if (filterType === 'year') {
      const yearRadio = modalContent.querySelector(`input[name="year"][value="${tempFilters.year}"]`);
      if (yearRadio) yearRadio.checked = true;
      else modalContent.querySelector('input[name="year"][value=""]').checked = true;
    } else {
      const catRadio = modalContent.querySelector(`input[name="category"][value="${tempFilters.category}"]`);
      if (catRadio) catRadio.checked = true;
      else modalContent.querySelector('input[name="category"][value="all"]').checked = true;
    }
    
    // Update active button
    yearFilterBtn.classList.toggle('active', filterType === 'year');
    categoryFilterBtn.classList.toggle('active', filterType === 'category');
  }

  function closeModal() {
    mobileModal.classList.remove("open");
    document.body.style.overflow = '';
    yearFilterBtn.classList.remove('active');
    categoryFilterBtn.classList.remove('active');
  }

  /* =========================
     EVENT LISTENERS
  ========================= */
  // Desktop Event Listeners
  yearSelectDesktop.addEventListener("change", () => {
    const activeCat = categoryListDesktop.querySelector(".active")?.dataset.category || "all";
    applyFilter(yearSelectDesktop.value, activeCat, cardsDesktop);
    currentFilters.year = yearSelectDesktop.value;
    updateButtonText();
  });
  
  categoryListDesktop.addEventListener("click", e => {
    if (e.target.tagName !== "LI") return;
    
    categoryListDesktop.querySelectorAll("li").forEach(li => li.classList.remove("active"));
    e.target.classList.add("active");
    
    applyFilter(yearSelectDesktop.value, e.target.dataset.category, cardsDesktop);
    currentFilters.category = e.target.dataset.category;
    updateButtonText();
  });

  // Mobile Event Listeners
  yearFilterBtn.addEventListener("click", () => openModal('year'));
  categoryFilterBtn.addEventListener("click", () => openModal('category'));
  
  modalOverlay.addEventListener("click", closeModal);
  
  modalHeader.querySelector('.close-modal').addEventListener('click', closeModal);
  
  // Radio button change listeners
  modalContent.querySelectorAll('input[name="year"]').forEach(radio => {
    radio.addEventListener('change', () => {
      tempFilters.year = radio.value;
    });
  });
  
  modalContent.querySelectorAll('input[name="category"]').forEach(radio => {
    radio.addEventListener('change', () => {
      tempFilters.category = radio.value;
    });
  });
  
  // Apply button listener
  applyButton.addEventListener('click', () => {
    applyFilter(tempFilters.year, tempFilters.category, cardsMobile);
    updateButtonText();
    closeModal();
  });

  /* =========================
     INITIALIZATION
  ========================= */
  // Hide original content
  Array.from(block.children).forEach(child => {
    if (child !== section) child.style.display = "none";
  });

  // Set initial state to show ALL records
  // Don't apply any filters initially
  currentFilters.year = "";
  currentFilters.category = "all";
  
  // Initialize desktop - All Years and All Awards selected
  yearSelectDesktop.value = "";
  categoryListDesktop.querySelectorAll("li").forEach(li => li.classList.remove("active"));
  categoryListDesktop.querySelector('li[data-category="all"]').classList.add("active");
  
  // Initialize mobile radio buttons - All Years and All Awards selected
  const allYearRadio = modalContent.querySelector('input[name="year"][value=""]');
  if (allYearRadio) allYearRadio.checked = true;
  
  const allCategoryRadio = modalContent.querySelector('input[name="category"][value="all"]');
  if (allCategoryRadio) allCategoryRadio.checked = true;
  
  // IMPORTANT: Don't apply any filter on initialization - show all cards
  // All cards are already visible by default when added to DOM
  // No need to call applyFilter() initially
  
  // Update button text to show initial state
  updateButtonText();

  // Close modal on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileModal.classList.contains('open')) {
      closeModal();
    }
  });

  // Optional: Add a reset button or functionality if needed
  // You could add a reset button that calls resetToAll() function
}