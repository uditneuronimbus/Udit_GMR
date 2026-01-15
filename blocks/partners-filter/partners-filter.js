export default function decorate(block) {
  console.log("Decorating Partners List block");

  const children = [...block.children];
  if (children.length < 3) return;

  /* ================================
     1️⃣ Read authored content
  ================================ */
  const sectionTitle =
    children[0]?.textContent?.trim() || "Our Partners";
  const filterPanelTitle =
    children[1]?.textContent?.trim() || "Filter by Category";
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
     3️⃣ Detach authored rows (NO display:none)
  ================================ */
  const authoredFragment = document.createDocumentFragment();
  children.forEach(child => authoredFragment.appendChild(child));

  /* ================================
     4️⃣ Runtime wrapper with layouts
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
              <label>
                <input type="radio" name="category" value="all" checked>
                All Partners
              </label>
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
  const desktopList = runtime.querySelector(".desktop-layout .partners-list");
  const mobileList = runtime.querySelector(".mobile-layout .partners-list");
  const categoryListDesktop = runtime.querySelector(".category-filter");
  const categoryFilterBtn = runtime.querySelector(".category-btn");
  const mobileModal = runtime.querySelector(".mobile-filter-modal");
  const modalOverlay = runtime.querySelector(".mobile-filter-overlay");
  const categoryGroup = runtime.querySelector(".category-group");
  const applyButton = runtime.querySelector(".apply-btn");
  const closeModalBtn = runtime.querySelector(".close-modal");

  /* ================================
     6️⃣ Data Collection & Card Build
  ================================ */
  const categories = new Set();
  const cardsDesktop = [];
  const cardsMobile = [];

  items.forEach(item => {
    const cols = [...item.children];
    if (!cols.length) return;

    const category =
      cols[0]?.textContent?.trim().toLowerCase() || "";
    const image = cols[1]?.querySelector("img, picture");
    const titleText = cols[2]?.textContent?.trim();
    const descHTML = cols[3]?.innerHTML?.trim() || "";
    const link = cols[4]?.textContent?.trim();

    if (category) categories.add(category);

    const createCard = () => {
      const card = document.createElement("article");
      card.className = "partner-card";
      card.dataset.category = category;

      if (image) {
        const imgWrap = document.createElement("div");
        imgWrap.className = "partner-img";
        imgWrap.appendChild(image.cloneNode(true));
        card.appendChild(imgWrap);
      }

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
        let p = temp.querySelector("p") || document.createElement("p");
        p.textContent = p.textContent || temp.textContent;
        p.classList.add("partner-description");
        content.appendChild(p);
      }

      if (link) {
        const linkWrap = document.createElement("div");
        linkWrap.className = "partner-link";
        linkWrap.innerHTML = `
          <a href="${link}" target="_blank" rel="noopener noreferrer">
            Visit Website
          </a>`;
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

  /* ================================
     7️⃣ Populate Filters
  ================================ */
  [...categories].sort().forEach(cat => {
    const label = cat.charAt(0).toUpperCase() + cat.slice(1);

    const li = document.createElement("li");
    li.dataset.category = cat;
    li.textContent = label;
    categoryListDesktop.appendChild(li);

    const radio = document.createElement("label");
    radio.innerHTML = `
      <input type="radio" name="category" value="${cat}">
      ${label}`;
    categoryGroup.appendChild(radio);
  });

  /* ================================
     8️⃣ State
  ================================ */
  const state = {
    category: "all",
    tempCategory: "all"
  };

  /* ================================
     9️⃣ Filtering Logic
  ================================ */
  function filterByCategory(category, cards) {
    state.category = category;

    cards.forEach(card => {
      card.hidden =
        !(category === "all" || card.dataset.category === category);
      card.classList.remove("active");
    });

    updateButtonText();
  }

  function updateButtonText() {
    const text =
      state.category === "all"
        ? "All Partners"
        : state.category.charAt(0).toUpperCase() +
          state.category.slice(1);

    categoryFilterBtn.innerHTML = `
      Filter by - ${text} <span class="arrow">▼</span>`;
  }

  /* ================================
     🔟 Events
  ================================ */
  categoryListDesktop.addEventListener("click", e => {
    if (e.target.tagName !== "LI") return;

    categoryListDesktop
      .querySelectorAll("li")
      .forEach(li => li.classList.remove("active"));

    e.target.classList.add("active");
    filterByCategory(e.target.dataset.category, cardsDesktop);
  });

  categoryFilterBtn.addEventListener("click", () => {
    mobileModal.classList.add("open");
    document.body.style.overflow = "hidden";
  });

  modalOverlay.addEventListener("click", closeModal);
  closeModalBtn.addEventListener("click", closeModal);

  function closeModal() {
    mobileModal.classList.remove("open");
    document.body.style.overflow = "";
  }

  applyButton.addEventListener("click", () => {
    filterByCategory(state.tempCategory, cardsMobile);
    closeModal();
  });

  categoryGroup
    .querySelectorAll('input[name="category"]')
    .forEach(radio =>
      radio.addEventListener("change", () => {
        state.tempCategory = radio.value;
      })
    );

  /* ================================
     1️⃣1️⃣ Init
  ================================ */
  filterByCategory("all", cardsDesktop);
  filterByCategory("all", cardsMobile);

  // Initialize desktop UI
  categoryListDesktop.querySelectorAll("li").forEach(li => li.classList.remove("active"));
  categoryListDesktop.querySelector('li[data-category="all"]').classList.add("active");

  console.log("Partners List initialized (no display:none)");
}
