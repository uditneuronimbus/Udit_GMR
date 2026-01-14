export default function decorate(block) {
  const children = [...block.children];
  if (children.length < 5) return;

  /* ===============================
     CONFIG ROWS
  =============================== */

  const allAwardsLabel =
    children[1]?.textContent?.trim() || "All Awards";
  const filterPanelTitle =
    children[2]?.textContent?.trim() || "Filter by Year and Category";
  const defaultYear =
    children[3]?.textContent?.trim() || "";

  const awardItems = children.slice(4);

  /* ===============================
     WRAPPER
  =============================== */

  const section = document.createElement("section");
  section.className = "awards-filter-runtime";

  const container = document.createElement("div");
  container.className = "container";

  const layout = document.createElement("div");
  layout.className = "awards-layout";

  /* ===============================
     FILTER PANEL
  =============================== */

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

  /* ===============================
     LIST
  =============================== */

  const list = document.createElement("div");
  list.className = "awards-list";

  layout.appendChild(aside);
  layout.appendChild(list);
  container.appendChild(layout);
  section.appendChild(container);

  /* ===============================
     DATA COLLECTION
  =============================== */

  const years = new Set();
  const categories = new Set();
  const cards = [];

  awardItems.forEach((item) => {
    const cells = [...item.children];
    if (!cells.length) return;

    const category = cells[0]?.textContent?.trim().toLowerCase();
    const year = cells[1]?.textContent?.trim();
    const img = cells[2]?.querySelector("img");
    const title = cells[3]?.textContent?.trim();
    const desc = cells[4]?.innerHTML?.trim();

    // ❗ allow description-only items
    if (!title && !desc) return;

    if (year) years.add(year);
    if (category) categories.add(category);

    const card = document.createElement("article");
    card.className = "award-card";
    card.dataset.year = year || "";
    card.dataset.category = category || "";

    if (img) {
      const imgWrap = document.createElement("div");
      imgWrap.className = "award-img";
      imgWrap.appendChild(img.cloneNode(true));
      card.appendChild(imgWrap);
    }

    const content = document.createElement("div");
    content.className = "award-content";

    if (title) {
      const h3 = document.createElement("h3");
      h3.textContent = title;
      content.appendChild(h3);
    }

    if (desc) {
      const p = document.createElement("p");
      p.innerHTML = desc;
      content.appendChild(p);
    }

    card.appendChild(content);
    list.appendChild(card);
    cards.push(card);
  });

  /* ===============================
     POPULATE FILTERS
  =============================== */

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
    li.textContent = cat;
    categoryList.appendChild(li);
  });

  /* ===============================
     FILTER LOGIC
  =============================== */

  function applyFilter() {
    const yearVal = yearSelect.value;
    const catVal =
      categoryList.querySelector(".active")?.dataset.category || "all";

    cards.forEach((card) => {
      const yearMatch = !yearVal || card.dataset.year === yearVal;
      const catMatch =
        catVal === "all" || card.dataset.category === catVal;

      card.style.display = yearMatch && catMatch ? "" : "none";
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

  /* ===============================
     FINAL RENDER (AEM SAFE)
  =============================== */

  block.innerHTML = "";
  block.appendChild(section);

  applyFilter();
}
