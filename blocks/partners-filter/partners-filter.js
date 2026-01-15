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
     4️⃣ Runtime wrapper
  ================================ */
  const runtime = document.createElement("section");
  runtime.className = "partners-filter-runtime bg-gray";
  
  runtime.innerHTML = `
    <div class="container">
      <div class="desktop-layout">
        <aside class="partners-filter-panel">
          <h4>${filterPanelTitle}</h4>
          <ul class="category-filter">
            <li data-category="all" class="active">All Partners</li>
          </ul>
        </aside>
        <div class="partners-list"></div>
      </div>
    </div>
  `;

  block.appendChild(runtime);

  /* ================================
     5️⃣ DOM References
  ================================ */
  const partnersList = runtime.querySelector('.partners-list');
  const filterList = runtime.querySelector('.category-filter');

  /* ================================
     6️⃣ Data Collection & Card Building
  ================================ */
  const categories = new Set();
  const cards = [];

  items.forEach((item) => {
    const cols = [...item.children];
    if (!cols.length) return;

    const category = cols[0]?.textContent?.trim().toLowerCase() || "";
    const image = cols[1]?.querySelector("img, picture");
    const titleText = cols[2]?.textContent?.trim();
    const descHTML = cols[3]?.innerHTML?.trim() || "";
    const link = cols[4]?.textContent?.trim();

    if (category) categories.add(category);

    // Create card element
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
    
    // Add card to DOM and tracking array
    partnersList.appendChild(card);
    cards.push(card);
  });

  /* ================================
     7️⃣ Populate Filters
  ================================ */
  const sortedCategories = Array.from(categories).sort();

  sortedCategories.forEach(cat => {
    const li = document.createElement("li");
    li.dataset.category = cat;
    li.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    filterList.appendChild(li);
  });

  /* ================================
     8️⃣ Filter Functions
  ================================ */
  function filterByCategory(category) {
    cards.forEach(card => {
      card.style.display = category === "all" || card.dataset.category === category 
        ? "" 
        : "none";
      card.classList.remove("active");
    });
  }

  function toggleCardActive(card) {
    cards.forEach(c => c !== card && c.classList.remove("active"));
    card.classList.toggle("active");
  }

  /* ================================
     9️⃣ Event Listeners
  ================================ */
  // Filter category click
  filterList.addEventListener("click", (e) => {
    if (e.target.tagName !== "LI") return;

    filterList.querySelectorAll("li").forEach(li => li.classList.remove("active"));
    e.target.classList.add("active");

    filterByCategory(e.target.dataset.category);
  });

  // Card click for reveal toggle
  partnersList.addEventListener("click", (e) => {
    const card = e.target.closest('.partner-card');
    if (card && card.style.display !== 'none') {
      toggleCardActive(card);
    }
  });

  /* ================================
     🔟 Initialize
  ================================ */
  // Show all cards by default
  filterByCategory("all");
  
  console.log("Partners List block initialized");
}