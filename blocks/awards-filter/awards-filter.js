export default function decorate(block) {
  const children = [...block.children];
  if (children.length < 5) return;

  /* ===============================
     CONFIG (DEFENSIVE)
  =============================== */
  // Extract config data BEFORE we modify anything
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
      <p><small>• Each award item has 6 columns: Category, Year, Award Image, Title, Description, Partner Image+Description</small></p>
      <p><small>• Filter UI appears in publish mode</small></p>
    `;
    block.insertBefore(authorNote, children[0]);
    
    return; // Stop execution in author mode
  }

  /* ===============================
     RUNTIME STRUCTURE (PUBLISH MODE ONLY)
     Collect data BEFORE we hide anything
  =============================== */
  const years = new Set();
  const categories = new Set();
  const cardsData = []; // Store data first, then render

  // First pass: Collect all data from original content
  items.forEach((item) => {
    const cols = [...item.children];
    if (!cols.length) return;

    // Debug logging to see what we're getting
    console.log('Processing item with columns:', cols.length);
    cols.forEach((col, index) => {
      console.log(`Column ${index}:`, col.innerHTML);
    });

    // Extract data with defensive checks
    const category = cols[0]?.textContent?.trim().toLowerCase() || "";
    const year = cols[1]?.textContent?.trim() || "";

    // Award image - check if column exists and has content
    let awardImageEl = null;
    if (cols[2] && cols[2].children.length > 0) {
      awardImageEl = cols[2].querySelector("img") || cols[2].querySelector("picture");
    }

    const title = cols[3]?.textContent?.trim() || "";
    const description = cols[4]?.innerHTML?.trim() || "";

    // Partner image and description - check multiple possible locations
    let partnerImageEl = null;
    let partnerDescription = "";
    
    // Try column 5 for partner image
    if (cols[5] && cols[5].children.length > 0) {
      partnerImageEl = cols[5].querySelector("img") || cols[5].querySelector("picture");
    }
    
    // Try column 6 for partner description, fall back to column 5 if it contains text
    if (cols[6]) {
      partnerDescription = cols[6].innerHTML?.trim() || "";
    } else if (cols[5] && !partnerImageEl && cols[5].textContent?.trim()) {
      // If column 5 doesn't have an image but has text, use it as description
      partnerDescription = cols[5].innerHTML?.trim() || "";
    }

    // Skip if no meaningful data
    if (!category && !year && !title && !description && !awardImageEl && !partnerImageEl && !partnerDescription) {
      console.log('Skipping item - no meaningful data');
      return;
    }

    if (year) years.add(year);
    if (category) categories.add(category);

    // Store data for rendering
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

  console.log('Collected cards data:', cardsData.length);
  console.log('Years:', Array.from(years));
  console.log('Categories:', Array.from(categories));

  /* ===============================
     BUILD RUNTIME UI
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

  // Now render all cards from collected data
  const cards = [];
  cardsData.forEach((data) => {
    const card = document.createElement("article");
    card.className = "award-card";
    card.dataset.year = data.year;
    card.dataset.category = data.category;

    // Award Image block
    if (data.awardImageEl) {
      const imgWrap = document.createElement("div");
      imgWrap.className = "award-img";
      const clonedImage = data.awardImageEl.cloneNode(true);
      // Clone all attributes
      Array.from(data.awardImageEl.attributes).forEach(attr => {
        clonedImage.setAttribute(attr.name, attr.value);
      });
      imgWrap.appendChild(clonedImage);
      card.appendChild(imgWrap);
    } else {
      // Add empty placeholder if no image
      const imgWrap = document.createElement("div");
      imgWrap.className = "award-img empty";
      card.appendChild(imgWrap);
    }

    // Award Content block
    const content = document.createElement("div");
    content.className = "award-content";

    if (data.title) {
      const h3 = document.createElement("h3");
      h3.textContent = data.title;
      content.appendChild(h3);
    }

    if (data.description) {
      const desc = document.createElement("div");
      desc.className = "award-description";
      desc.innerHTML = data.description;
      content.appendChild(desc);
    }

    // Partner Information Block (if available)
    if (data.partnerImageEl || data.partnerDescription) {
      const partnerBlock = document.createElement("div");
      partnerBlock.className = "award-partner-info";
      
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

  /* ===============================
     FILTER POPULATION
  =============================== */
  // Years
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

  // Categories
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

  yearSelect.addEventListener("change", applyFilter);

  categoryList.addEventListener("click", (e) => {
    if (e.target.tagName !== "LI") return;

    categoryList.querySelectorAll("li").forEach((li) =>
      li.classList.remove("active")
    );
    e.target.classList.add("active");
    applyFilter();
  });

  /* ===============================
     AEM-SAFE RENDER
     Now hide original content AFTER we've extracted all data
  =============================== */
  // Mark block as processed
  block.classList.add('awards-block-processed');
  
  // Hide all original content in publish mode
  Array.from(block.children).forEach(child => {
    child.style.display = 'none';
  });
  
  // Append our runtime UI
  block.appendChild(section);

  // Initial filter
  applyFilter();
}