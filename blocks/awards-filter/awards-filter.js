export default function decorate(block) {
  const children = [...block.children];
  if (children.length < 5) return;

  /* ===============================
     CONFIG (DEFENSIVE)
  =============================== */
  const allAwardsLabel =
    children[1]?.textContent?.trim() || "All Awards";
  const filterPanelTitle =
    children[2]?.textContent?.trim() || "Filter by Year and Category";
  const defaultYear =
    children[3]?.textContent?.trim() || "";
  const items = children.slice(4);

  /* ===============================
     RUNTIME STRUCTURE
  =============================== */
  const section = document.createElement("section");
  section.className = "awards-filter-runtime";

  const container = document.createElement("div");
  container.className = "container";

  const layout = document.createElement("div");
  layout.className = "awards-layout";

  /* ---------- FILTER PANEL ---------- */
  const aside = document.createElement("aside");
  aside.className = "awards-filter-panel";

  const h4 = document.createElement("h4");
  h4.textContent = filterPanelTitle;
  aside.appendChild(h4);

  const yearSelect = document.createElement("select");
  yearSelect.className = "year-filter";
  yearSelect.innerHTML = `<option value="">All Years</option>`;
  aside.appendChild(yearSelect);

  const categoryList = document.createElement("ul");
  categoryList.className = "category-filter";

  const allLi = document.createElement("li");
  allLi.textContent = allAwardsLabel;
  allLi.dataset.category = "all";
  allLi.classList.add("active");
  categoryList.appendChild(allLi);

  aside.appendChild(categoryList);

  /* ---------- LIST ---------- */
  const list = document.createElement("div");
  list.className = "awards-list";

  layout.appendChild(aside);
  layout.appendChild(list);
  container.appendChild(layout);
  section.appendChild(container);

  /* ===============================
     DATA COLLECTION (SAFE)
  =============================== */
  const years = new Set();
  const categories = new Set();
  const cards = [];

  items.forEach((item) => {
    const cols = [...item.children];
    if (!cols.length) return;

    // SAFE lookups
    const category = cols[0]?.textContent?.trim().toLowerCase() || "";
    const year = cols[1]?.textContent?.trim() || "";
    const title = cols[3]?.textContent?.trim() || "";
    
    // Get image and description for dropdown
    let imageEl = null;
    if (cols[2]) {
      imageEl = cols[2].querySelector("img") || cols[2].querySelector("picture");
    }
    
    const description = cols[4]?.innerHTML?.trim() || "";

    if (!title) return; // Need at least a title

    if (year) years.add(year);
    if (category) categories.add(category);

    /* ===============================
       CREATE AWARD CARD WITH DROPDOWN
    =============================== */
    const card = document.createElement("article");
    card.className = "award-card";
    card.dataset.year = year;
    card.dataset.category = category;

    /* ---------- Card Header (Always Visible) ---------- */
    const cardHeader = document.createElement("div");
    cardHeader.className = "award-card-header";
    
    // Title
    const titleEl = document.createElement("h3");
    titleEl.textContent = title;
    cardHeader.appendChild(titleEl);
    
    // Year badge
    if (year) {
      const yearBadge = document.createElement("span");
      yearBadge.className = "award-year";
      yearBadge.textContent = year;
      cardHeader.appendChild(yearBadge);
    }
    
    // Category badge
    if (category) {
      const categoryBadge = document.createElement("span");
      categoryBadge.className = "award-category";
      categoryBadge.textContent = category;
      cardHeader.appendChild(categoryBadge);
    }
    
    // Dropdown toggle button
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "award-toggle";
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.innerHTML = `
      <span class="toggle-icon">▼</span>
      <span class="sr-only">Show details</span>
    `;
    cardHeader.appendChild(toggleBtn);
    
    card.appendChild(cardHeader);

    /* ---------- Dropdown Content (Hidden by Default) ---------- */
    const dropdownContent = document.createElement("div");
    dropdownContent.className = "award-dropdown-content";
    dropdownContent.style.display = "none";
    
    // Add image if exists
    if (imageEl) {
      const imgWrap = document.createElement("div");
      imgWrap.className = "award-image-dropdown";
      imgWrap.appendChild(imageEl.cloneNode(true));
      dropdownContent.appendChild(imgWrap);
    }
    
    // Add description if exists
    if (description) {
      const descEl = document.createElement("div");
      descEl.className = "award-description-dropdown";
      descEl.innerHTML = description;
      dropdownContent.appendChild(descEl);
    }
    
    // If no image or description, show a message
    if (!imageEl && !description) {
      const noContent = document.createElement("p");
      noContent.className = "no-details";
      noContent.textContent = "No additional details available";
      dropdownContent.appendChild(noContent);
    }
    
    card.appendChild(dropdownContent);

    /* ---------- Add to DOM ---------- */
    list.appendChild(card);
    cards.push(card);

    /* ---------- Dropdown Toggle Functionality ---------- */
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
      const dropdown = card.querySelector(".award-dropdown-content");
      
      if (isExpanded) {
        // Close dropdown
        dropdown.style.display = "none";
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.querySelector(".toggle-icon").textContent = "▼";
      } else {
        // Open dropdown
        dropdown.style.display = "block";
        toggleBtn.setAttribute("aria-expanded", "true");
        toggleBtn.querySelector(".toggle-icon").textContent = "▲";
        
        // Close other open dropdowns (optional)
        document.querySelectorAll(".award-toggle[aria-expanded='true']").forEach(otherBtn => {
          if (otherBtn !== toggleBtn) {
            otherBtn.setAttribute("aria-expanded", "false");
            otherBtn.querySelector(".toggle-icon").textContent = "▼";
            otherBtn.closest(".award-card").querySelector(".award-dropdown-content").style.display = "none";
          }
        });
      }
    });
  });

  /* ===============================
     FILTER POPULATION
  =============================== */
  [...years]
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
    .forEach((y) => {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      if (y === defaultYear) opt.selected = true;
      yearSelect.appendChild(opt);
    });

  [...categories]
    .sort()
    .forEach((cat) => {
      const li = document.createElement("li");
      li.dataset.category = cat;
      li.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      categoryList.appendChild(li);
    });

  /* ===============================
     FILTER LOGIC
  =============================== */
  function applyFilter() {
    const yearVal = yearSelect.value;
    const catVal = categoryList.querySelector(".active")?.dataset.category || "all";

    cards.forEach((card) => {
      const yearMatch = !yearVal || card.dataset.year === yearVal;
      const catMatch = catVal === "all" || card.dataset.category === catVal;

      card.style.display = yearMatch && catMatch ? "" : "none";
    });
  }

  // Event listeners
  yearSelect.addEventListener("change", applyFilter);

  categoryList.addEventListener("click", (e) => {
    if (e.target.tagName !== "LI") return;

    categoryList
      .querySelectorAll("li")
      .forEach((li) => li.classList.remove("active"));

    e.target.classList.add("active");
    applyFilter();
  });

  /* ===============================
     FINAL AEM-SAFE RENDER
  =============================== */
  // Clear block safely
  while (block.firstChild) {
    block.removeChild(block.firstChild);
  }
  
  block.appendChild(section);
  applyFilter();
}