export default function decorate(block) {
  const children = [...block.children];
  if (children.length < 3) return;

  const sectionTitle = children[0]?.textContent?.trim() || "Our Partners";
  const filterPanelTitle = children[1]?.textContent?.trim() || "Filter by Category";
  const items = children.slice(2);

  const isAuthorMode =
    document.body.classList.contains("universal-editor-edit") ||
    document.body.classList.contains("aem-AuthorLayer-Edit") ||
    window.location.href.includes("/editor.html");

  if (isAuthorMode) {
    block.classList.add("partners-author-mode");
    return;
  }

  /* =========================
     STRUCTURE
  ========================= */
  const section = document.createElement("section");
  section.className = "partners-filter-runtime bg-gray";

  const container = document.createElement("div");
  container.className = "container";

  const desktopLayout = document.createElement("div");
  desktopLayout.className = "desktop-layout";

  const aside = document.createElement("aside");
  aside.className = "partners-filter-panel";
  aside.innerHTML = `<h4>${filterPanelTitle}</h4>`;

  const filterList = document.createElement("ul");
  filterList.className = "category-filter";

  const allLi = document.createElement("li");
  allLi.textContent = "All Partners";
  allLi.dataset.category = "all";
  allLi.classList.add("active");
  filterList.appendChild(allLi);

  aside.appendChild(filterList);

  const list = document.createElement("div");
  list.className = "partners-list";

  desktopLayout.appendChild(aside);
  desktopLayout.appendChild(list);

  container.appendChild(desktopLayout);
  section.appendChild(container);
  block.appendChild(section);

  /* =========================
     CARD CREATION
  ========================= */
  const cards = [];
  const categories = new Set();

  items.forEach((item) => {
    const cols = [...item.children];
    if (!cols.length) return;

    const category = cols[0]?.textContent?.trim().toLowerCase() || "";
    const image = cols[1]?.querySelector("img, picture");
    const titleText = cols[2]?.textContent?.trim();
    const descHTML = cols[3]?.textContent?.trim();
    const link = cols[4]?.textContent?.trim();

    if (category) categories.add(category);

    const card = document.createElement("article");
    card.className = "partner-card";
    card.dataset.category = category;

    if (image) {
  // Get the dropdown/container
  const dropdown = card.closest('.partner-listing-item') || card.parentElement;

  // Create wrapper
  const imgWrap = document.createElement("div");
  imgWrap.className = "partner-img";

  // Remove image from its current position (outside)
  if (image.parentNode) {
    image.parentNode.removeChild(image);
  }

  // Append image inside card dropdown
  imgWrap.appendChild(image);
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
      const desc = document.createElement("div");
      desc.className = "partner-description";
      desc.innerHTML = descHTML;
      content.appendChild(desc);
    }

    if (link) {
      const linkWrap = document.createElement("div");
      linkWrap.className = "partner-link";
      linkWrap.innerHTML = `<a href="${link}" target="_blank">Visit Website</a>`;
      content.appendChild(linkWrap);
    }

    card.appendChild(content);

    /* 🔥 REVEAL TOGGLE */
    card.addEventListener("click", () => {
      cards.forEach(c => c !== card && c.classList.remove("active"));
      card.classList.toggle("active");
    });

    list.appendChild(card);
    cards.push(card);
  });

  /* =========================
     FILTER LOGIC
  ========================= */
  categories.forEach(cat => {
    const li = document.createElement("li");
    li.dataset.category = cat;
    li.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    filterList.appendChild(li);
  });

  filterList.addEventListener("click", (e) => {
    if (e.target.tagName !== "LI") return;

    filterList.querySelectorAll("li").forEach(li => li.classList.remove("active"));
    e.target.classList.add("active");

    const cat = e.target.dataset.category;
    cards.forEach(card => {
      card.style.display =
        cat === "all" || card.dataset.category === cat ? "" : "none";
      card.classList.remove("active");
    });
  });

  /* =========================
     CLEANUP
  ========================= */
  [...block.children].forEach(child => {
    if (child !== section) child.style.display = "none";
  });
}
