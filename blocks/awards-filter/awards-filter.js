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

    // SAFE lookups with better null handling
    const category = cols[0]?.textContent?.trim().toLowerCase() || "";
    const year = cols[1]?.textContent?.trim() || "";
    
    // Get image safely - clone the element if it exists
    let imageEl = null;
    if (cols[2]) {
      imageEl = cols[2].querySelector("img");
      // If no img tag, check if it's a picture element
      if (!imageEl && cols[2].querySelector("picture")) {
        imageEl = cols[2].querySelector("picture");
      }
    }
    
    const title = cols[3]?.textContent?.trim() || "";
    const description = cols[4]?.innerHTML?.trim() || "";

    // Skip only if truly empty
    if (!category && !year && !title && !description && !imageEl) return;

    if (year) years.add(year);
    if (category) categories.add(category);

    const card = document.createElement("article");
    card.className = "award-card";
    card.dataset.year = year;
    card.dataset.category = category;

    /* ---------- Image ---------- */
    if (imageEl) {
      const imgWrap = document.createElement("div");
      imgWrap.className = "award-img";
      // Clone the entire element (img or picture)
      imgWrap.appendChild(imageEl.cloneNode(true));
      card.appendChild(imgWrap);
    }

    /* ---------- Content ---------- */
    const content = document.createElement("div");
    content.className = "award-content";

    if (title) {
      const h3 = document.createElement("h3");
      h3.textContent = title;
      content.appendChild(h3);
    }

    if (description) {
      const desc = document.createElement("div");
      desc.className = "award-description";
      desc.innerHTML = description;
      content.appendChild(desc);
    }

    card.appendChild(content);
    list.appendChild(card);
    cards.push(card);
  });

  /* ===============================
     FILTER POPULATION
  =============================== */
  // Sort years descending
  Array.from(years)
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
    .forEach((y) => {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      if (y === defaultYear) opt.selected = true;
      yearSelect.appendChild(opt);
    });

  // Sort categories alphabetically
  Array.from(categories)
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

  // Event listeners with error handling
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
     AEM-SAFE RENDER - FIXED
  =============================== */
  // Instead of clearing innerHTML, use a safer approach
  while (block.firstChild) {
    block.removeChild(block.firstChild);
  }
  
  block.appendChild(section);
  
  // Trigger initial filter
  applyFilter();
}