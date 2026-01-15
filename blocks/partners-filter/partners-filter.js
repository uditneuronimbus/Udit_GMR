export default function decorate(block) {
  console.log("Decorating Partners List block");

  const children = [...block.children];
  if (children.length < 3) return;

  /* ================================
     1️⃣ Read authored content
  ================================ */
  const sectionTitle = children[0]?.textContent?.trim() || "Our Partners";
  const filterPanelTitle = children[1]?.textContent?.trim() || "Filter by Category";
  const items = children.slice(2);

  /* ================================
     2️⃣ Check for Author Mode (AEM SAFE)
  ================================ */
  const isAuthorMode =
    document.body.classList.contains("universal-editor-edit") ||
    document.body.classList.contains("aem-AuthorLayer-Edit") ||
    window.location.href.includes("/editor.html");

  if (isAuthorMode) {
    block.classList.add("partners-author-mode");
    return;
  }

  /* ================================
     3️⃣ Hide authored rows (AEM SAFE)
  ================================ */
  children.forEach(child => child.style.display = "none");

  /* ================================
     4️⃣ Runtime wrapper with mobile layout
  ================================ */
  const runtime = document.createElement("section");
  runtime.className = "partners-filter-runtime bg-gray";
  
  runtime.innerHTML = `
    <div class="container">
      <!-- Desktop Layout -->
      <div class="partners-layout desktop-layout">
        <aside class="partners-filter-panel">
          <h4>${filterPanelTitle}</h4>
          <ul class="category-filter">
            <li data-category="all" class="active">All Partners</li>
          </ul>
        </aside>
        <div class="partners-list"></div>
      </div>

      <!-- Mobile Layout -->
      <div class="partners-layout mobile-layout">
        <div class="mobile-filter-buttons">
          <button class="mobile-filter-btn category-btn" data-type="category">
            Filter by - All Partners <span class="arrow">▼</span>
          </button>
        </div>
        <div class="partners-list"></div>
        
        <!-- Mobile Filter Modal -->
        <div class="mobile-filter-modal">
          <div class="mobile-filter-overlay"></div>
          <div class="mobile-filter-content">
            <div class="modal-header">
              <h3>Select Category</h3>
              <button class="close-modal">×</button>
            </div>
            <div class="filter-group category-group">
              <p>Filter by Category</p>
              <label><input type="radio" name="category" value="all" checked> All Partners</label>
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
  const desktopList = runtime.querySelector('.desktop-layout .partners-list');
  const mobileList = runtime.querySelector('.mobile-layout .partners-list');
  const categoryListDesktop = runtime.querySelector('.desktop-layout .category-filter');
  const categoryFilterBtn = runtime.querySelector('.category-btn');
  const mobileModal = runtime.querySelector('.mobile-filter-modal');
  const modalOverlay = runtime.querySelector('.mobile-filter-overlay');
  const modalHeader = runtime.querySelector('.modal-header');
  const categoryGroup = runtime.querySelector('.category-group');
  const applyButton = runtime.querySelector('.apply-btn');
  const closeModalBtn = runtime.querySelector('.close-modal');

  /* ================================
     6️⃣ Data Collection & Card Building
  ================================ */
  const categories = new Set();
  const cardsDesktop = [];
  const cardsMobile = [];

  items.forEach((item) => {
    const cols = [...item.children];
    if (!cols.length) return;

    const category = cols[0]?.textContent?.trim().toLowerCase() || "";
    const image = cols[1]?.querySelector("img, picture");
    const titleText = cols[2]?.textContent?.trim();
    const descHTML = cols[3]?.innerHTML?.trim() || "";
    const link = cols[4]?.textContent?.trim();

    if (category) categories.add(category);

    // Create card element function
    const createCard = () => {
      const card = document.createElement("article");
      card.className = "partner-card";
      card.dataset.category = category;

      // Image handling
      if (image) {
        const imgWrap = document.createElement("div");
        imgWrap.className = "partner-img";
        
        // Clone image to preserve original
        const clonedImage = image.cloneNode(true);
        imgWrap.appendChild(clonedImage);
        card.appendChild(imgWrap);
      }

      // Content section
      const content = document.createElement("div");
      content.className = "partner-content";

      if (titleText) {
        const h3 = document.createElement("h3");
        h3.textContent = titleText;
        content.appendChild(h3);
      }

      if (descHTML) {
        const temp = document.createElement("div");
        temp.innerHTML = descHTML;

        let p = temp.querySelector("p");
        if (!p) {
          p = document.createElement("p");
          p.textContent = descHTML.replace(/<[^>]*>/g, ''); // Strip HTML tags if present
        }

        p.classList.add("partner-description");
        content.appendChild(p);
      }

      if (link) {
        const linkWrap = document.createElement("div");
        linkWrap.className = "partner-link";
        linkWrap.innerHTML = `<a href="${link}" target="_blank" rel="noopener noreferrer">Visit Website</a>`;
        content.appendChild(linkWrap);
      }

      card.appendChild(content);
      return card;
    };

    // Create cards for both desktop and mobile
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
  const sortedCategories = Array.from(categories).sort();

  // Desktop Category Filter
  sortedCategories.forEach(cat => {
    const li = document.createElement("li");
    li.dataset.category = cat;
    li.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryListDesktop.appendChild(li);
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
    category: "all",
    tempCategory: "all"
  };

  /* ================================
     9️⃣ Filter Functions
  ================================ */
  function filterByCategory(category, cards) {
    state.category = category;
    
    cards.forEach(card => {
      card.style.display = category === "all" || card.dataset.category === category 
        ? "" 
        : "none";
      card.classList.remove("active");
    });

    updateButtonText();
  }

  function toggleCardActive(card, cards) {
    cards.forEach(c => c !== card && c.classList.remove("active"));
    card.classList.toggle("active");
  }

  function updateButtonText() {
    const catText = state.category === "all" ?
      "All Partners" :
      state.category.charAt(0).toUpperCase() + state.category.slice(1);
    categoryFilterBtn.innerHTML = `Filter by - ${catText} <span class="arrow">▼</span>`;
  }

  function openModal() {
    mobileModal.classList.add("open");
    document.body.style.overflow = 'hidden';

    // Set temp filter to current state
    state.tempCategory = state.category;

    // Set active radio button
    const catRadio = categoryGroup.querySelector(`input[name="category"][value="${state.tempCategory}"]`);
    if (catRadio) catRadio.checked = true;
    else categoryGroup.querySelector('input[name="category"][value="all"]').checked = true;

    // Update button state
    categoryFilterBtn.classList.add('active');
  }

  function closeModal() {
    mobileModal.classList.remove("open");
    document.body.style.overflow = '';
    categoryFilterBtn.classList.remove('active');
  }

  /* ================================
     🔟 Event Listeners
  ================================ */
  // Desktop Filters
  categoryListDesktop.addEventListener("click", (e) => {
    if (e.target.tagName !== "LI") return;

    categoryListDesktop.querySelectorAll("li").forEach(li => li.classList.remove("active"));
    e.target.classList.add("active");

    filterByCategory(e.target.dataset.category, cardsDesktop);
  });

  // Desktop Card click for reveal toggle
  desktopList.addEventListener("click", (e) => {
    const card = e.target.closest('.partner-card');
    if (card && card.style.display !== 'none') {
      toggleCardActive(card, cardsDesktop);
    }
  });

  // Mobile Filters
  categoryFilterBtn.addEventListener("click", openModal);
  modalOverlay.addEventListener("click", closeModal);
  closeModalBtn.addEventListener('click', closeModal);

  // Mobile Radio Button Changes
  categoryGroup.querySelectorAll('input[name="category"]').forEach(radio => {
    radio.addEventListener('change', () => {
      state.tempCategory = radio.value;
    });
  });

  // Apply Button
  applyButton.addEventListener('click', () => {
    filterByCategory(state.tempCategory, cardsMobile);
    closeModal();
  });

  // Mobile Card click for reveal toggle
  mobileList.addEventListener("click", (e) => {
    const card = e.target.closest('.partner-card');
    if (card && card.style.display !== 'none') {
      toggleCardActive(card, cardsMobile);
    }
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
  // Show all cards by default
  filterByCategory("all", cardsDesktop);
  filterByCategory("all", cardsMobile);
  
  // Initialize desktop UI
  categoryListDesktop.querySelectorAll("li").forEach(li => li.classList.remove("active"));
  categoryListDesktop.querySelector('li[data-category="all"]').classList.add("active");

  console.log("Partners List block initialized with mobile view");
}