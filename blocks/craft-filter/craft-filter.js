export default function decorate(block) {
    console.log("Decorating Craft List block");

    const children = [...block.children];
    if (children.length < 3) return;

    /* ================================
       1️⃣ Read authored content
    ================================ */
    const sectionTitle = children[0]?.textContent?.trim() || "Our Crafts";
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
        block.classList.add("craft-author-mode");
        return;
    }

    /* ================================
       3️⃣ Preserve authored content for Universal Editor (AEM SAFE)
       while hiding it visually for end users
    ================================ */

    const authoredContentWrapper = document.createElement('div');
    authoredContentWrapper.className = 'craft-authored-content';
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

    while (block.firstChild) {
        authoredContentWrapper.appendChild(block.firstChild);
    }

    block.appendChild(authoredContentWrapper);

    /* ================================
       4️⃣ Runtime wrapper with mobile layout
    ================================ */
    const runtime = document.createElement("section");
    runtime.className = "craft-filter-runtime bg-gray";

    runtime.innerHTML = `
    <div class="container">
      <!-- Desktop Layout -->
      <div class="craft-layout desktop-layout">
        <aside class="craft-filter-panel">
          <h4>${filterPanelTitle}</h4>
          <ul class="category-filter">
            <li data-category="all" class="active">All Crafts</li>
          </ul>
        </aside>
        <div class="craft-list"></div>
      </div>

      <!-- Mobile Layout -->
      <div class="craft-layout mobile-layout">
        <div class="mobile-filter-buttons">
          <button class="mobile-filter-btn category-btn" data-type="category">
            Filter by - All Crafts <span class="arrow">▼</span>
          </button>
        </div>
        <div class="craft-list"></div>
        
        <!-- Mobile Filter Modal -->
        <div class="mobile-filter-modal">
          <div class="mobile-filter-overlay"></div>
          <div class="mobile-filter-content">
            <div class="modal-header">
              <h3>Filter by Category</h3>
              <button class="close-modal">×</button>
            </div>
            <div class="filter-group category-group">
              <label><input type="radio" name="category" value="all" checked> All Crafts</label>
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
    const desktopList = runtime.querySelector('.desktop-layout .craft-list');
    const mobileList = runtime.querySelector('.mobile-layout .craft-list');
    const categoryListDesktop = runtime.querySelector('.desktop-layout .category-filter');
    const categoryFilterBtn = runtime.querySelector('.category-btn');
    const mobileModal = runtime.querySelector('.mobile-filter-modal');
    const modalOverlay = runtime.querySelector('.mobile-filter-overlay');
    const categoryGroup = runtime.querySelector('.category-group');
    const applyButton = runtime.querySelector('.apply-btn');
    const closeModalBtn = runtime.querySelector('.close-modal');

    /* ================================
       6️⃣ Data Collection & Card Building
    ================================ */
    const categoryMapping = {
        "airports": "Airports",
        "energy": "Energy",
        "transportation": "Transportation",
        "foundation": "GMR Varalakshmi Foundation",
        "epc": "EPC"
    };

    const categorySlugToName = {};
    Object.entries(categoryMapping).forEach(([slug, name]) => {
        categorySlugToName[slug] = name;
    });

    const categories = new Map();
    const cardsDesktop = [];
    const cardsMobile = [];

    const authoredItems = [...authoredContentWrapper.children].slice(2);

    authoredItems.forEach((item) => {
        const cols = [...item.children];
        if (!cols.length) return;

        const categorySlug = cols[0]?.textContent?.trim().toLowerCase() || "";
        const image = cols[1]?.querySelector("img, picture");

        const getTextFromColumn = (col) => {
            if (!col) return "";
            const p = col.querySelector('p');
            return p ? p.textContent.trim() : col.textContent.trim();
        };

        let imageAltText = "";
        let titleText = "";
        let descHTML = "";
        let link = "";

        if (cols.length >= 6) {
            const col2Text = getTextFromColumn(cols[2]);
            imageAltText = col2Text;
            titleText = col2Text;

            const col3Text = getTextFromColumn(cols[3]);
            if (col3Text && col3Text.length > 50) {
                descHTML = col3Text;
            } else if (col3Text) {
                titleText = col3Text;
            }

            descHTML = cols[4]?.innerHTML?.trim() || descHTML;
            link = cols[5]?.textContent?.trim() || "";
        } else if (cols.length === 5) {
            const col2Text = getTextFromColumn(cols[2]);
            if (col2Text && col2Text.length > 50) {
                descHTML = col2Text;
            } else {
                titleText = col2Text;
            }
            descHTML = cols[3]?.innerHTML?.trim() || descHTML;
            link = cols[4]?.textContent?.trim() || "";
        }

        let extractedLink = "";
        if (descHTML.includes('<a href="')) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = descHTML;
            const linkElement = tempDiv.querySelector('a');
            if (linkElement && linkElement.href) {
                extractedLink = linkElement.href;
                linkElement.remove();
                descHTML = tempDiv.innerHTML.trim();
            }
        }

        if (!link && extractedLink) {
            link = extractedLink;
        }

        const categoryName = categorySlugToName[categorySlug] ||
            categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

        if (categorySlug) {
            categories.set(categorySlug, categoryName);
        }

        const createCard = () => {
            const card = document.createElement("article");
            card.className = "craft-card";
            card.dataset.category = categorySlug;

            if (image) {
                const imgWrap = document.createElement("div");
                imgWrap.className = "craft-img";

                let imageUrl = "";
                if (image.tagName === 'IMG') {
                    imageUrl = image.src;
                } else if (image.tagName === 'PICTURE') {
                    const img = image.querySelector('img');
                    imageUrl = img ? img.src : '';
                }

                if (imageUrl) {
                    const newImg = document.createElement('img');
                    newImg.src = imageUrl;

                    if (imageAltText && imageAltText.trim() !== "") {
                        newImg.alt = imageAltText.trim();
                    } else if (titleText && titleText.trim() !== "") {
                        newImg.alt = titleText.trim();
                    } else {
                        newImg.alt = sectionTitle;
                    }

                    newImg.loading = "lazy";
                    if (image.width) newImg.width = image.width;
                    if (image.height) newImg.height = image.height;

                    imgWrap.appendChild(newImg);
                } else {
                    const clonedImage = image.cloneNode(true);
                    if (clonedImage.tagName === 'IMG') {
                        if (imageAltText && imageAltText.trim() !== "") {
                            clonedImage.alt = imageAltText.trim();
                        }
                    } else if (clonedImage.tagName === 'PICTURE') {
                        const img = clonedImage.querySelector('img');
                        if (img && imageAltText && imageAltText.trim() !== "") {
                            img.alt = imageAltText.trim();
                        }
                    }
                    imgWrap.appendChild(clonedImage);
                }

                card.appendChild(imgWrap);
            }

            const content = document.createElement("div");
            content.className = "craft-content";

            if (titleText) {
                const h3 = document.createElement("h3");
                h3.textContent = titleText;
                content.appendChild(h3);
            }

            if (descHTML) {
                const p = document.createElement("p");
                p.className = "craft-description";
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = descHTML;
                const cleanText = tempDiv.textContent || tempDiv.innerText || '';
                p.textContent = cleanText.trim();
                content.appendChild(p);
            }

            if (link) {
                const linkWrap = document.createElement("div");
                linkWrap.className = "craft-link";
                linkWrap.innerHTML = `<a href="${link}" target="_blank" rel="noopener noreferrer">Visit Website</a>`;
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
    const sortedCategories = Array.from(categories.entries())
        .sort((a, b) => a[1].localeCompare(b[1]));

    sortedCategories.forEach(([slug, name]) => {
        const li = document.createElement("li");
        li.dataset.category = slug;
        li.textContent = name;
        categoryListDesktop.appendChild(li);
    });

    sortedCategories.forEach(([slug, name]) => {
        const label = document.createElement("label");
        label.innerHTML = `<input type="radio" name="category" value="${slug}" id="category-${slug}"> ${name}`;
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
        let displayText = "All Crafts";
        if (state.category !== "all") {
            displayText = categories.get(state.category) ||
                state.category.charAt(0).toUpperCase() + state.category.slice(1);
        }
        categoryFilterBtn.innerHTML = `Filter by - ${displayText} <span class="arrow"><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
</svg></span>`;
    }

    function openModal() {
        mobileModal.classList.add("open");
        document.body.style.overflow = 'hidden';
        state.tempCategory = state.category;
        const catRadio = categoryGroup.querySelector(`input[name="category"][value="${state.tempCategory}"]`);
        if (catRadio) catRadio.checked = true;
        else categoryGroup.querySelector('input[name="category"][value="all"]').checked = true;
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
    categoryListDesktop.addEventListener("click", (e) => {
        if (e.target.tagName !== "LI") return;
        categoryListDesktop.querySelectorAll("li").forEach(li => li.classList.remove("active"));
        e.target.classList.add("active");
        filterByCategory(e.target.dataset.category, cardsDesktop);
    });

    desktopList.addEventListener("click", (e) => {
        const card = e.target.closest('.craft-card');
        if (card && card.style.display !== 'none') {
            toggleCardActive(card, cardsDesktop);
        }
    });

    categoryFilterBtn.addEventListener("click", openModal);
    modalOverlay.addEventListener("click", closeModal);
    closeModalBtn.addEventListener('click', closeModal);

    categoryGroup.querySelectorAll('input[name="category"]').forEach(radio => {
        radio.addEventListener('change', () => {
            state.tempCategory = radio.value;
        });
    });

    applyButton.addEventListener('click', () => {
        filterByCategory(state.tempCategory, cardsMobile);
        closeModal();
    });

    mobileList.addEventListener("click", (e) => {
        const card = e.target.closest('.craft-card');
        if (card && card.style.display !== 'none') {
            toggleCardActive(card, cardsMobile);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileModal.classList.contains('open')) {
            closeModal();
        }
    });

    /* ================================
       1️⃣1️⃣ Initialize
    ================================ */
    filterByCategory("all", cardsDesktop);
    filterByCategory("all", cardsMobile);
    categoryListDesktop.querySelectorAll("li").forEach(li => li.classList.remove("active"));
    categoryListDesktop.querySelector('li[data-category="all"]').classList.add("active");

    console.log("Craft List block initialized");
}
