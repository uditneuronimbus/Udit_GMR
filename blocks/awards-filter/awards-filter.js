export default function decorate(block) {
  const children = [...block.children];
  if (children.length < 5) return;

  /* =========================
     UNIVERSAL EDITOR GUARD
  ========================= */
  const isAuthorMode =
    document.body.classList.contains("universal-editor-edit") ||
    document.body.classList.contains("aem-AuthorLayer-Edit") ||
    window.location.href.includes("/editor.html");

  if (isAuthorMode) {
    block.classList.add("awards-author-mode");
    return; // 🚫 DO NOT RENDER DOM IN UE
  }

  /* =========================
     READ AUTHORED DATA
  ========================= */
  const allAwardsLabel = children[1]?.textContent?.trim() || "All Awards";
  const filterPanelTitle = children[2]?.textContent?.trim() || "Filter by Year and Category";
  const defaultYear = children[3]?.textContent?.trim() || "";
  const items = children.slice(4);

  /* =========================
     RUNTIME STRUCTURE
  ========================= */
  const section = document.createElement("section");
  section.className = "awards-filter-runtime bg-gray";

  const container = document.createElement("div");
  container.className = "container";

  /* ---------- DESKTOP ---------- */
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

  desktopLayout.append(desktopAside, desktopList);

  /* ---------- MOBILE ---------- */
  const mobileLayout = document.createElement("div");
  mobileLayout.className = "awards-layout mobile-layout";

  const mobileFilterButtons = document.createElement("div");
  mobileFilterButtons.className = "mobile-filter-buttons";

  const yearFilterBtn = document.createElement("button");
  yearFilterBtn.className = "mobile-filter-btn year-btn";
  yearFilterBtn.innerHTML = `Year <span class="arrow">▼</span>`;

  const categoryFilterBtn = document.createElement("button");
  categoryFilterBtn.className = "mobile-filter-btn category-btn";
  categoryFilterBtn.innerHTML = `Filter by <span class="arrow">▼</span>`;

  mobileFilterButtons.append(yearFilterBtn, categoryFilterBtn);

  const mobileList = document.createElement("div");
  mobileList.className = "awards-list";

  mobileLayout.append(mobileFilterButtons, mobileList);

  container.append(desktopLayout, mobileLayout);
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
    const imageEl = cols[2]?.querySelector("picture, img");
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

      /* IMAGE */
      if (imageEl) {
        const imgWrap = document.createElement("div");
        imgWrap.className = "award-img";
        imgWrap.appendChild(imageEl.cloneNode(true));
        card.appendChild(imgWrap);
      }

      /* CONTENT */
      const content = document.createElement("div");
      content.className = "award-content";

      if (title) {
        const h3 = document.createElement("h3");
        h3.textContent = title;
        content.appendChild(h3);
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
     FILTER POPULATION
  ========================= */
  const sortedYears = [...years].sort((a, b) =>
    b.localeCompare(a, undefined, { numeric: true })
  );
  const sortedCategories = [...categories].sort();

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "All Years";
  yearSelectDesktop.appendChild(defaultOption);

  sortedYears.forEach((y) => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    if (y === defaultYear) opt.selected = true;
    yearSelectDesktop.appendChild(opt);
  });

  sortedCategories.forEach((cat) => {
    const li = document.createElement("li");
    li.dataset.category = cat;
    li.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryListDesktop.appendChild(li);
  });

  /* =========================
     FILTER LOGIC
  ========================= */
  function applyFilter(yearVal, catVal, cards) {
    cards.forEach((card) => {
      const yMatch = !yearVal || card.dataset.year === yearVal;
      const cMatch = catVal === "all" || card.dataset.category === catVal;
      card.style.display = yMatch && cMatch ? "" : "none";
    });
  }

  yearSelectDesktop.addEventListener("change", () => {
    const activeCat =
      categoryListDesktop.querySelector(".active")?.dataset.category || "all";
    applyFilter(yearSelectDesktop.value, activeCat, cardsDesktop);
  });

  categoryListDesktop.addEventListener("click", (e) => {
    if (e.target.tagName !== "LI") return;
    categoryListDesktop.querySelectorAll("li").forEach((li) =>
      li.classList.remove("active")
    );
    e.target.classList.add("active");
    applyFilter(yearSelectDesktop.value, e.target.dataset.category, cardsDesktop);
  });

  /* =========================
     HIDE AUTHORED CONTENT
  ========================= */
  [...block.children].forEach((child) => {
    if (child !== section) child.style.display = "none";
  });
}
