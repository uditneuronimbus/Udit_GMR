export default function decorate(block) {
  const children = [...block.children];
  if (children.length < 3) return;

  // Get configuration from block structure
  const sectionTitle = children[0]?.textContent?.trim() || "Our Partners";
  const filterPanelTitle = children[1]?.textContent?.trim() || "Filter by Category";
  const items = children.slice(2);

  const isAuthorMode = document.body.classList.contains('universal-editor-edit') ||
                       document.body.classList.contains('aem-AuthorLayer-Edit') ||
                       window.location.href.includes('/editor.html');

  if (isAuthorMode) {
    block.classList.add('partners-author-mode');
    const authorNote = document.createElement('div');
    authorNote.className = 'partners-author-note';
    authorNote.innerHTML = `
      <p><strong>🤝 Partners List Component</strong></p>
      <p><small>• Edit partner items in the table below</small></p>
      <p><small>• Filter UI appears in publish mode</small></p>
      <p><small>• Item types: Airports, Energy, Transportation, GMR Varalakshmi Foundation, EPC</small></p>
    `;
    block.insertBefore(authorNote, children[0]);
    
    // Add a wrapper class to the original content for author mode styling
    const originalContent = document.createElement('div');
    originalContent.className = 'block-content';
    
    // Move original children to the wrapper
    while (block.children.length > 1) { // Keep the author note
      originalContent.appendChild(block.children[1]);
    }
    block.appendChild(originalContent);
    
    return;
  }

  /* =========================
     RUNTIME STRUCTURE - ADDED TO EXISTING BLOCK
  ========================= */
  const section = document.createElement("div");
  section.className = "partners-filter-runtime";

  const container = document.createElement("div");
  container.className = "container";

  // Section Title
  const titleElement = document.createElement("h2");
  titleElement.className = "section-title";
  titleElement.textContent = sectionTitle;
  container.appendChild(titleElement);

  // ---------------- DESKTOP ----------------
  const desktopLayout = document.createElement("div");
  desktopLayout.className = "desktop-layout";

  const desktopAside = document.createElement("aside");
  desktopAside.className = "partners-filter-panel";
  desktopAside.innerHTML = `<h4>${filterPanelTitle}</h4>`;
  
  const categoryListDesktop = document.createElement("ul");
  categoryListDesktop.className = "category-filter";
  
  // Add "All" option
  const allLiDesktop = document.createElement("li");
  allLiDesktop.textContent = "All Partners";
  allLiDesktop.dataset.category = "all";
  allLiDesktop.classList.add("active");
  categoryListDesktop.appendChild(allLiDesktop);
  
  desktopAside.appendChild(categoryListDesktop);

  const desktopList = document.createElement("div");
  desktopList.className = "partners-list";

  desktopLayout.appendChild(desktopAside);
  desktopLayout.appendChild(desktopList);

  // ---------------- MOBILE ----------------
  const mobileLayout = document.createElement("div");
  mobileLayout.className = "mobile-layout";

  // Mobile filter button
  const mobileFilterBtn = document.createElement("button");
  mobileFilterBtn.className = "mobile-filter-btn";
  mobileFilterBtn.innerHTML = `Filter by <span class="arrow">▼</span>`;

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
    <h3>${filterPanelTitle}</h3>
    <button class="close-modal">×</button>
  `;
  modalContent.appendChild(modalHeader);

  // Category group
  const categoryGroup = document.createElement("div");
  categoryGroup.className = "filter-group category-group";

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
  mobileList.className = "partners-list";

  mobileLayout.appendChild(mobileFilterBtn);
  mobileLayout.appendChild(mobileList);
  mobileLayout.appendChild(mobileModal);

  container.appendChild(desktopLayout);
  container.appendChild(mobileLayout);
  section.appendChild(container);

  // Insert the runtime UI at the beginning of the block
  block.insertBefore(section, block.firstChild);

  /* =========================
     DATA COLLECTION - USE EXISTING DATA
  ========================= */
  const categories = new Set();
  const cardsDesktop = [];
  const cardsMobile = [];

  // Map of category values to display names
  const categoryDisplayNames = {
    "airports": "Airports",
    "energy": "Energy",
    "transportation": "Transportation",
    "foundation": "GMR Varalakshmi Foundation",
    "epc": "EPC"
  };

  // Create cards from original items
  items.forEach((item, index) => {
    const cols = [...item.children];
    if (!cols.length) return;

    const category = cols[0]?.textContent?.trim().toLowerCase() || "";
    let imageEl = null;
    if (cols[1]) imageEl = cols[1].querySelector("img") || cols[1].querySelector("picture");
    const title = cols[2]?.textContent?.trim() || "";
    const description = cols[3]?.innerHTML?.trim() || "";
    const link = cols[4]?.textContent?.trim() || "";

    if (!category && !title && !description && !imageEl) return;

    if (category) categories.add(category);

    const createCard = () => {
      const card = document.createElement("article");
      card.className = "partner-card";
      card.dataset.category = category;
      
      // Image
      if (imageEl) {
        const imgWrap = document.createElement("div");
        imgWrap.className = "partner-img";
        const clonedImg = imageEl.cloneNode(true);
        imgWrap.appendChild(clonedImg);
        card.appendChild(imgWrap);
      }
      
      const content = document.createElement("div");
      content.className = "partner-content";
      
      // Title
      if (title) {
        const titleEl = document.createElement("h3");
        titleEl.textContent = title;
        content.appendChild(titleEl);
      }
      
      // Description
      if (description) {
        const desc = document.createElement("div");
        desc.className = "partner-description";
        desc.innerHTML = description;
        content.appendChild(desc);
      }
      
      // Link (if provided)
      if (link) {
        const linkWrap = document.createElement("div");
        linkWrap.className = "partner-link";
        const linkEl = document.createElement("a");
        linkEl.href = link;
        linkEl.textContent = "View Details";
        linkWrap.appendChild(linkEl);
        content.appendChild(linkWrap);
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
  const sortedCategories = Array.from(categories).sort();

  // Desktop Filters
  sortedCategories.forEach(cat => {
    const li = document.createElement("li");
    li.dataset.category = cat;
    li.textContent = categoryDisplayNames[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryListDesktop.appendChild(li);
  });

  // Mobile Filters
  categoryGroup.innerHTML = `<p>Select Category</p>`;
  
  // Add "All" option
  const allLabel = document.createElement("label");
  allLabel.innerHTML = `<input type="radio" name="category" value="all" id="category-all" checked> All Partners`;
  categoryGroup.appendChild(allLabel);
  
  // Add category options
  sortedCategories.forEach(cat => {
    const label = document.createElement("label");
    const displayName = categoryDisplayNames[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
    label.innerHTML = `<input type="radio" name="category" value="${cat}" id="category-${cat}"> ${displayName}`;
    categoryGroup.appendChild(label);
  });

  /* =========================
     STATE MANAGEMENT
  ========================= */
  let currentCategory = "all";
  let tempCategory = "all";

  /* =========================
     FILTER LOGIC
  ========================= */
  function applyFilter(category, cards) {
    currentCategory = category;
    
    cards.forEach(card => {
      const catMatch = category === "all" || card.dataset.category === category;
      card.style.display = catMatch ? "" : "none";
    });
    
    updateButtonText();
  }

  function updateButtonText() {
    let displayText = "All Partners";
    
    if (currentCategory !== "all") {
      const displayName = categoryDisplayNames[currentCategory] || 
                         currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1);
      displayText = displayName;
    }
    
    mobileFilterBtn.innerHTML = `Filter by - ${displayText} <span class="arrow">▼</span>`;
  }

  /* =========================
     MOBILE MODAL FUNCTIONS
  ========================= */
  function openModal() {
    mobileModal.classList.add("open");
    document.body.style.overflow = 'hidden';
    
    // Reset temp category to current category
    tempCategory = currentCategory;
    
    // Set radio button based on temp category
    const categoryRadio = modalContent.querySelector(`input[name="category"][value="${tempCategory}"]`);
    if (categoryRadio) {
      categoryRadio.checked = true;
    } else {
      modalContent.querySelector('input[name="category"][value="all"]').checked = true;
    }
    
    mobileFilterBtn.classList.add('active');
  }

  function closeModal() {
    mobileModal.classList.remove("open");
    document.body.style.overflow = '';
    mobileFilterBtn.classList.remove('active');
  }

  /* =========================
     EVENT LISTENERS
  ========================= */
  // Desktop Event Listeners
  categoryListDesktop.addEventListener("click", e => {
    if (e.target.tagName !== "LI") return;
    
    categoryListDesktop.querySelectorAll("li").forEach(li => li.classList.remove("active"));
    e.target.classList.add("active");
    
    applyFilter(e.target.dataset.category, cardsDesktop);
    currentCategory = e.target.dataset.category;
    updateButtonText();
  });

  // Mobile Event Listeners
  mobileFilterBtn.addEventListener("click", openModal);
  modalOverlay.addEventListener("click", closeModal);
  modalHeader.querySelector('.close-modal').addEventListener('click', closeModal);
  
  // Radio button change listener
  modalContent.querySelectorAll('input[name="category"]').forEach(radio => {
    radio.addEventListener('change', () => {
      tempCategory = radio.value;
    });
  });
  
  // Apply button listener
  applyButton.addEventListener('click', () => {
    applyFilter(tempCategory, cardsMobile);
    closeModal();
  });

  /* =========================
     INITIALIZATION
  ========================= */
  // Set initial state to show ALL partners
  currentCategory = "all";
  
  // Initialize desktop - All Partners selected
  categoryListDesktop.querySelectorAll("li").forEach(li => li.classList.remove("active"));
  categoryListDesktop.querySelector('li[data-category="all"]').classList.add("active");
  
  // Initialize mobile radio button - All Partners selected
  const allCategoryRadio = modalContent.querySelector('input[name="category"][value="all"]');
  if (allCategoryRadio) allCategoryRadio.checked = true;
  
  // IMPORTANT: Don't apply any filter on initialization - show all cards
  // All cards are already visible by default when added to DOM
  
  // Update button text to show initial state
  updateButtonText();

  // Close modal on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileModal.classList.contains('open')) {
      closeModal();
    }
  });

  // Note: Original data remains in the DOM but is not used in the runtime UI
  // The runtime UI creates its own cards from the original data
  // Original block content remains untouched for authoring/SEO purposes
}