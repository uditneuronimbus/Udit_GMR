export default function decorate(block) {
  const children = [...block.children];
  if (children.length < 5) return;

  /* ===============================
     CONFIG (DEFENSIVE)
  =============================== */
  // Extract config data
  const allAwardsLabel = 
    children[1]?.textContent?.trim() || "All Awards";
  const filterPanelTitle = 
    children[2]?.textContent?.trim() || "Filter by Year and Category";
  const defaultYear = 
    children[3]?.textContent?.trim() || "";
  const items = children.slice(4);

  // Check if we're in AEM author mode (Universal Editor)
  const isAuthorMode = document.body.classList.contains('universal-editor-edit') || 
                      document.body.classList.contains('aem-AuthorLayer-Edit') ||
                      window.location.href.includes('/editor.html');

  /* ===============================
     AEM-AUTHOR MODE: Show only the authoring structure
  =============================== */
  if (isAuthorMode) {
    // Add some styling for author visibility
    block.classList.add('awards-author-mode');
    
    // Add a visual indicator for authors
    const authorNote = document.createElement('div');
    authorNote.className = 'awards-author-note';
    authorNote.innerHTML = `
      <p><strong>🏆 Awards List Component</strong></p>
      <p><small>• Edit award items in the table below</small></p>
      <p><small>• Filter UI appears in publish mode</small></p>
    `;
    block.insertBefore(authorNote, children[0]);
    
    // In author mode, just style the table for better visibility
    items.forEach((item, index) => {
      item.classList.add('award-item-author');
      
      // Add labels to each column for clarity
      const cols = [...item.children];
      if (cols.length >= 6) {
        const labels = ['Category', 'Year', 'Award Image', 'Title', 'Description', 'Partner Image', 'Partner Description'];
        cols.forEach((col, colIndex) => {
          const label = document.createElement('span');
          label.className = 'column-label';
          label.textContent = labels[colIndex] || `Column ${colIndex + 1}`;
          col.insertBefore(label, col.firstChild);
        });
      }
    });
    
    return; // Stop execution in author mode
  }

  /* ===============================
     PUBLISH MODE: Build the runtime UI
  =============================== */
  // First, extract all data before modifying anything
  const years = new Set();
  const categories = new Set();
  const cardsData = [];

  // Extract data from all award items
  items.forEach((item) => {
    const cols = [...item.children];
    if (cols.length < 5) return; // Need at least basic info

    // Extract data
    const category = cols[0]?.textContent?.trim().toLowerCase() || "";
    const year = cols[1]?.textContent?.trim() || "";
    
    // Award image
    let awardImageEl = null;
    if (cols[2]) {
      // Remove any column labels that might have been added in author mode
      const label = cols[2].querySelector('.column-label');
      if (label) label.remove();
      
      awardImageEl = cols[2].querySelector("img") || cols[2].querySelector("picture");
    }

    const title = cols[3]?.textContent?.trim() || "";
    const description = cols[4]?.innerHTML?.trim() || "";
    
    // Partner image and description
    let partnerImageEl = null;
    let partnerDescription = "";
    
    // Partner image (column 5)
    if (cols[5]) {
      // Remove any column labels
      const label = cols[5].querySelector('.column-label');
      if (label) label.remove();
      
      partnerImageEl = cols[5].querySelector("img") || cols[5].querySelector("picture");
    }
    
    // Partner description (column 6)
    if (cols[6]) {
      // Remove any column labels
      const label = cols[6].querySelector('.column-label');
      if (label) label.remove();
      
      partnerDescription = cols[6].innerHTML?.trim() || "";
    }

    // Skip if no meaningful data
    if (!category && !year && !title) return;

    if (year) years.add(year);
    if (category) categories.add(category);

    cardsData.push({
      category,
      year,
      awardImageEl,
      title,
      description,
      partnerImageEl,
      partnerDescription
    });
  });

  // Build the runtime UI
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
  aside.appendChild(yearSelect);

  const categoryList = document.createElement("ul");
  categoryList.className = "category-filter";

  const allLi = document.createElement("li");
  allLi.textContent = allAwardsLabel;
  allLi.dataset.category = "all";
  allLi.classList.add("active");
  categoryList.appendChild(allLi);

  aside.appendChild(categoryList);

  /* ---------- AWARDS LIST ---------- */
  const list = document.createElement("div");
  list.className = "awards-list";

  layout.appendChild(aside);
  layout.appendChild(list);
  container.appendChild(layout);
  section.appendChild(container);

  // Build award cards from collected data
  const cards = [];
  cardsData.forEach((data, index) => {
    const card = document.createElement("article");
    card.className = "award-card";
    card.dataset.year = data.year;
    card.dataset.category = data.category;

    // Award Image
    const imgWrap = document.createElement("div");
    imgWrap.className = "award-img";
    if (data.awardImageEl) {
      const clonedImage = data.awardImageEl.cloneNode(true);
      Array.from(data.awardImageEl.attributes).forEach(attr => {
        clonedImage.setAttribute(attr.name, attr.value);
      });
      imgWrap.appendChild(clonedImage);
    }
    card.appendChild(imgWrap);

    // Content wrapper
    const content = document.createElement("div");
    content.className = "award-content";

    // Title
    if (data.title) {
      const h3 = document.createElement("h3");
      h3.textContent = data.title;
      content.appendChild(h3);
    }

    // Description
    if (data.description) {
      const desc = document.createElement("div");
      desc.className = "award-description";
      desc.innerHTML = data.description;
      content.appendChild(desc);
    }

    // Partner info (only if we have partner data)
    if (data.partnerImageEl || data.partnerDescription) {
      const partnerBlock = document.createElement("div");
      partnerBlock.className = "award-partner-info";
      
      // Partner image
      if (data.partnerImageEl) {
        const partnerImgWrap = document.createElement("div");
        partnerImgWrap.className = "partner-img";
        const clonedPartnerImage = data.partnerImageEl.cloneNode(true);
        Array.from(data.partnerImageEl.attributes).forEach(attr => {
          clonedPartnerImage.setAttribute(attr.name, attr.value);
        });
        partnerImgWrap.appendChild(clonedPartnerImage);
        partnerBlock.appendChild(partnerImgWrap);
      }
      
      // Partner description
      if (data.partnerDescription) {
        const partnerDesc = document.createElement("div");
        partnerDesc.className = "partner-description";
        partnerDesc.innerHTML = data.partnerDescription;
        partnerBlock.appendChild(partnerDesc);
      }
      
      content.appendChild(partnerBlock);
    }

    card.appendChild(content);
    list.appendChild(card);
    cards.push(card);
  });

  /* ---------- FILTER POPULATION ---------- */
  // Years dropdown
  const sortedYears = Array.from(years).sort((a, b) =>
    b.localeCompare(a, undefined, { numeric: true })
  );
  
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "All Years";
  yearSelect.appendChild(defaultOption);

  sortedYears.forEach((y) => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    if (y === defaultYear) opt.selected = true;
    yearSelect.appendChild(opt);
  });

  // Categories list
  Array.from(categories)
    .sort()
    .forEach((cat) => {
      const li = document.createElement("li");
      li.dataset.category = cat;
      li.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
      categoryList.appendChild(li);
    });

  /* ---------- FILTER LOGIC ---------- */
  function applyFilter() {
    const yearVal = yearSelect.value;
    const catVal = categoryList.querySelector(".active")?.dataset.category || "all";

    cards.forEach((card) => {
      const yearMatch = !yearVal || card.dataset.year === yearVal;
      const catMatch = catVal === "all" || card.dataset.category === catVal;
      card.style.display = yearMatch && catMatch ? "" : "none";
    });
  }

  yearSelect.addEventListener("change", applyFilter);

  categoryList.addEventListener("click", (e) => {
    if (e.target.tagName !== "LI") return;

    categoryList.querySelectorAll("li").forEach((li) =>
      li.classList.remove("active")
    );
    e.target.classList.add("active");
    applyFilter();
  });

  /* ---------- CLEAN UP ---------- */
  // Clear the entire block content first
  while (block.firstChild) {
    block.removeChild(block.firstChild);
  }
  
  // Append our new structure
  block.appendChild(section);

  // Apply initial filter
  applyFilter();
}