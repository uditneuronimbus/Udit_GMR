export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  /* ==============================
     1️⃣ Read Config
     ============================== */
  const configCells = [...rows[0].children];

  const sectionTitle = configCells[0]?.textContent?.trim();
  const allAwardsLabel =
    configCells[1]?.textContent?.trim() || "All Awards";
  const filterPanelTitle =
    configCells[2]?.textContent?.trim() || "Filter by Year and Category";
  const defaultYear =
    configCells[3]?.textContent?.trim() || "";

  const itemRows = rows.slice(1);

  /* ==============================
     2️⃣ Hide authored rows (AEM SAFE)
     ============================== */
  rows.forEach((row) => (row.style.display = "none"));

  /* ==============================
     3️⃣ Runtime Wrapper
     ============================== */
  const section = document.createElement("section");
  section.className = "awards-filter-runtime";

  section.innerHTML = `
    <div class="container">
      ${sectionTitle ? `<h2 class="sec-title">${sectionTitle}</h2>` : ""}

      <div class="awards-layout">
        <aside class="awards-filter-panel">
          <h4>${filterPanelTitle}</h4>

          <select class="year-filter">
            <option value="">All Years</option>
          </select>

          <ul class="category-filter">
            <li class="active" data-category="all">${allAwardsLabel}</li>
          </ul>
        </aside>

        <div class="awards-list"></div>
      </div>
    </div>
  `;

  block.after(section);

  const yearSelect = section.querySelector(".year-filter");
  const categoryList = section.querySelector(".category-filter");
  const awardsList = section.querySelector(".awards-list");

  const years = new Set();
  const categories = new Set();
  const cards = [];

  /* ==============================
     4️⃣ Build Award Cards
     ============================== */
  itemRows.forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    const category = cells[0]?.textContent?.trim()?.toLowerCase();
    const year = cells[1]?.textContent?.trim();
    const img = cells[2]?.querySelector("img");
    const title = cells[3]?.textContent?.trim();
    const description = cells[4]?.innerHTML?.trim();

    if (!title) return;

    if (year) years.add(year);
    if (category) categories.add(category);

    const card = document.createElement("article");
    card.className = "award-card";
    card.dataset.year = year || "";
    card.dataset.category = category || "";

    card.innerHTML = `
      ${img ? `<div class="award-img">${img.outerHTML}</div>` : ""}
      <div class="award-content">
        <h3>${title}</h3>
        ${description ? `<p>${description}</p>` : ""}
      </div>
    `;

    awardsList.appendChild(card);
    cards.push(card);
  });

  /* ==============================
     5️⃣ Populate Filters
     ============================== */
  [...years]
    .sort((a, b) => b - a)
    .forEach((y) => {
      const opt = document.createElement("option");
      opt.value = y;
      opt.textContent = y;
      if (y === defaultYear) opt.selected = true;
      yearSelect.appendChild(opt);
    });

  categories.forEach((cat) => {
    const li = document.createElement("li");
    li.dataset.category = cat;
    li.textContent = cat.replace(/-/g, " ");
    categoryList.appendChild(li);
  });

  /* ==============================
     6️⃣ Filtering Logic
     ============================== */
  function applyFilter() {
    const selectedYear = yearSelect.value;
    const activeCat =
      categoryList.querySelector(".active")?.dataset.category || "all";

    cards.forEach((card) => {
      const yearMatch = !selectedYear || card.dataset.year === selectedYear;
      const catMatch =
        activeCat === "all" || card.dataset.category === activeCat;

      card.style.display = yearMatch && catMatch ? "grid" : "none";
    });
  }

  yearSelect.addEventListener("change", applyFilter);

  categoryList.addEventListener("click", (e) => {
    if (e.target.tagName !== "LI") return;
    categoryList
      .querySelectorAll("li")
      .forEach((li) => li.classList.remove("active"));
    e.target.classList.add("active");
    applyFilter();
  });

  /* ==============================
     7️⃣ Init
     ============================== */
  applyFilter();
}
