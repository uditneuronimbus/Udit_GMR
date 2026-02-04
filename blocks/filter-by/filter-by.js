export default function decorate(block) {
    /* ================================
       1️⃣ Read authored values from JSON
       (multi:true → comma separated)
    ================================ */
    const getMultiValues = (key) =>
        block.dataset[key]
            ? block.dataset[key].split(",").map(v => v.trim()).filter(Boolean)
            : [];

    //   const years = getMultiValues("years");
    //   const months = getMultiValues("months");
    //   const tags = getMultiValues("tags");
    //   const categories = getMultiValues("filterCategories");

    /* ================================
       2️⃣ Author mode check
    ================================ */
    const isAuthorMode =
        document.body.classList.contains("universal-editor-edit") ||
        window.location.href.includes("/editor.html");

    if (isAuthorMode) {
        block.innerHTML = `
      <div style="padding:16px;border:1px dashed #ccc;background:#fff">
        <strong>Filter By</strong>
        <p><small>Filter UI is visible on publish.</small></p>
      </div>
    `;
        return;
    }
    const readMulti = (index) => {
        const col = block.children[index];
        if (!col) return [];

        return [...col.children]
            .flatMap(el =>
            el.textContent
                .split(",")               // 🔥 split comma-separated values
                .map(v => v.trim())
            )
            .filter(Boolean);
        };


    const years = readMulti(0);
    const months = readMulti(1);
    const tags = readMulti(2);
    const subCategories = readMulti(3);

    // clear authored markup
    block.innerHTML = "";


    const yearHTML = `
  <label class="filter-option active">
    <input type="radio" name="year" value="">
    <span>All Years</span>
  </label>
  ${years.map(y => `
    <label class="filter-option">
      <input type="radio" name="year" value="${y}">
      <span>${y}</span>
    </label>
  `).join("")}
`;

    const monthHTML = `
  <label class="filter-option active">
    <input type="radio" name="month" value="">
    <span>All Months</span>
  </label>
  ${months.map(m => `
    <label class="filter-option">
      <input type="radio" name="month" value="${m}">
      <span>${m}</span>
    </label>
  `).join("")}
`;

    const tagHTML = tags.map(t => `
  <label class="filter-option">
    <input type="checkbox" name="tag" value="${t}">
    <span>${t}</span>
  </label>
`).join("");

    const subCategoryHTML = `
  <label class="filter-option active">
    <input type="radio" name="subcategory" value="">
    <span>All</span>
  </label>
  ${subCategories.map(sc => `
    <label class="filter-option">
      <input type="radio" name="subcategory" value="${sc}">
      <span>${sc}</span>
    </label>
  `).join("")}
`;


    /* ================================
       4️⃣ Base Markup
    ================================ */
    block.innerHTML = `
  <aside class="press-filter-panel">
    <h4>Filter By</h4>

    <div class="filter-group filter-group-collapsible">
      <button class="filter-toggle active">
        <span>Year - <span class="selected-year">All</span></span>
        <span class="icon-chevron">⌄</span>
      </button>
      <div class="filter-options year-options">
        ${yearHTML}
      </div>
    </div>

    <div class="filter-group filter-group-collapsible">
      <button class="filter-toggle">
        <span>Month</span>
        <span class="icon-chevron">⌄</span>
      </button>
      <div class="filter-options month-options hidden">
        ${monthHTML}
      </div>
    </div>

    <div class="filter-group filter-group-collapsible">
      <button class="filter-toggle">
        <span>Tags</span>
        <span class="icon-chevron">⌄</span>
      </button>
      <div class="filter-options tag-options hidden">
        ${tagHTML}
      </div>
    </div>

    <div class="filter-group filter-group-collapsible">
      <button class="filter-toggle">
        <span>Sub Category</span>
        <span class="icon-chevron">⌄</span>
      </button>
      <div class="filter-options subcategory-options hidden">
        ${subCategoryHTML}
      </div>
    </div>
  </aside>
`;



    /* ================================
       5️⃣ DOM Refs
    ================================ */
    const yearBox = block.querySelector(".year-options");
    const monthBox = block.querySelector(".month-options");
    const tagBox = block.querySelector(".tag-options");
    const subCategoryBox = block.querySelector(".subcategory-options");

    const selectedYearText = block.querySelector(".selected-year");


    /* ================================
       9️⃣ Toggle Accordion
    ================================ */
    block.querySelectorAll(".filter-toggle").forEach(toggle => {
        toggle.addEventListener("click", () => {
            toggle.classList.toggle("active");
            toggle.nextElementSibling.classList.toggle("hidden");
        });
    });

    /* ================================
       🔟 Active State + Display
    ================================ */
    block.querySelectorAll('input[name="year"]').forEach(radio => {
        radio.addEventListener("change", () => {
            yearBox.querySelectorAll(".filter-option").forEach(o => o.classList.remove("active"));
            radio.closest(".filter-option").classList.add("active");
            selectedYearText.textContent = radio.value || "All";
        });
    });

    block.querySelectorAll(".filter-options").forEach(group => {
        group.addEventListener("change", e => {
            if (e.target.type !== "radio") return;
            group.querySelectorAll(".filter-option").forEach(o => o.classList.remove("active"));
            e.target.closest(".filter-option").classList.add("active");
        });
    });

    /* ================================
       1️⃣1️⃣ Emit Filter Event (optional)
       (for listing block integration)
    ================================ */
    block.addEventListener("change", () => {
        const detail = {
            year: block.querySelector('input[name="year"]:checked')?.value || "",
            month: block.querySelector('input[name="month"]:checked')?.value || "",
            tags: [...block.querySelectorAll('input[name="tag"]:checked')]
                .map(i => i.value),
            subCategory:
                block.querySelector('input[name="subcategory"]:checked')?.value || ""
        };

        window.dispatchEvent(
            new CustomEvent("filter-change", { detail })
        );
    });

}
