// export default function decorate(block) {
//   if (block.classList.contains("factsheet-initialized")) return;

//   const rows = [...block.children];

//   const titleRow = rows.shift();
//   const sectionTitle = titleRow?.textContent?.trim() || "";


//   const itemRows = rows;


//   const runtime = document.createElement("div");
//   runtime.className = "factsheet-runtime";

//   runtime.innerHTML = `
//     <div class="factsheet-header">
//       <h2>${sectionTitle}</h2>
//       <div class="factsheet-tabs">
//         <button class="factsheet-tab" data-category="environment">Environment</button>
//         <button class="factsheet-tab" data-category="social">Social</button>
//         <button class="factsheet-tab" data-category="governance">Governance</button>
//       </div>
//     </div>
//     <div class="factsheet-grid"></div>
//   `;

//   block.append(runtime);
//   block.classList.add("factsheet-initialized");

//   const grid = runtime.querySelector(".factsheet-grid");
//   const tabs = [...runtime.querySelectorAll(".factsheet-tab")];


//   const cards = itemRows.map((row) => {
//     const [iconEl, titleEl, descEl, categoryEl] = [...row.children];

//     return {
//       icon: iconEl?.querySelector("img")?.src || "",
//       title: titleEl?.textContent?.trim() || "",
//       description: descEl?.innerHTML?.trim() || "", // ✅ KEEP HTML (bold, links, etc.)
//       category: categoryEl?.textContent?.trim()?.toLowerCase() || ""
//     };
//   });

 
//   const availableCategories = new Set(cards.map(c => c.category));

 
//   tabs.forEach(tab => {
//     const cat = tab.dataset.category;
//     if (!availableCategories.has(cat)) {
//       tab.style.display = "none";
//     }
//   });

//   const visibleTabs = tabs.filter(tab => tab.style.display !== "none");

 
//   function render(category) {
//     grid.innerHTML = "";

//     cards
//       .filter(c => c.category === category)
//       .forEach(c => {
//         const card = document.createElement("div");
//         card.className = "factsheet-card";

//         card.innerHTML = `
//           ${c.icon ? `<img src="${c.icon}" alt="">` : ""}
//           <h4>${c.title}</h4>
//           <p>${c.description}</p>
//         `;

//         grid.append(card);
//       });
//   }

//   visibleTabs.forEach(tab => {
//     tab.addEventListener("click", () => {
//       visibleTabs.forEach(t => t.classList.remove("active"));
//       tab.classList.add("active");
//       render(tab.dataset.category);
//     });
//   });


//   if (visibleTabs.length) {
//     visibleTabs[0].classList.add("active");
//     render(visibleTabs[0].dataset.category);
//   }
// }



export default function decorate(block) {
  if (block.classList.contains("factsheet-initialized")) return;

  const rows = [...block.children];

  /* ===============================
     1️⃣ Section title
  ================================ */
  const titleRow = rows.shift();
  const sectionTitle = titleRow?.textContent?.trim() || "";

  /* ===============================
     2️⃣ Item rows
  ================================ */
  const itemRows = rows;

  /* ===============================
     3️⃣ Runtime wrapper
  ================================ */
  const runtime = document.createElement("div");
  runtime.className = "factsheet-runtime";

  runtime.innerHTML = `
    <div class="factsheet-header">
      <h2>${sectionTitle}</h2>
      <div class="factsheet-tabs">
        <button class="factsheet-tab" data-category="environment">Environment</button>
        <button class="factsheet-tab" data-category="social">Social</button>
        <button class="factsheet-tab" data-category="governance">Governance</button>
      </div>
    </div>
    <div class="factsheet-grid"></div>
  `;

  block.append(runtime);
  block.classList.add("factsheet-initialized");

  const grid = runtime.querySelector(".factsheet-grid");
  const tabs = [...runtime.querySelectorAll(".factsheet-tab")];

  /* ===============================
     4️⃣ Build card data
  ================================ */
  const cards = itemRows.map((row) => {
    const [iconEl, titleEl, descEl, categoryEl] = [...row.children];

    return {
      icon: iconEl?.querySelector("img")?.src || "",
      title: titleEl?.textContent?.trim() || "",
      description: descEl?.innerHTML?.trim() || "", // keep HTML
      category: categoryEl?.textContent?.trim()?.toLowerCase() || ""
    };
  });

  /* ===============================
     5️⃣ Hide empty tabs
  ================================ */
  const availableCategories = new Set(cards.map(c => c.category));

  tabs.forEach(tab => {
    if (!availableCategories.has(tab.dataset.category)) {
      tab.style.display = "none";
    }
  });

  const visibleTabs = tabs.filter(tab => tab.style.display !== "none");

  /* ===============================
     6️⃣ Render cards
  ================================ */
  function render(category) {
    grid.innerHTML = "";

    cards
      .filter(card => card.category === category)
      .forEach(cardData => {
        const card = document.createElement("div");
        card.className = "factsheet-card";

        card.innerHTML = `
          ${cardData.icon ? `
            <div class="factsheet-icon">
              <img src="${cardData.icon}" alt="">
            </div>
          ` : ""}
          <h4>${cardData.title}</h4>
          <p>${cardData.description}</p>
        `;

        grid.append(card);
      });
  }

  /* ===============================
     7️⃣ Tab click handling
  ================================ */
  visibleTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      visibleTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      render(tab.dataset.category);
    });
  });

  /* ===============================
     8️⃣ Default active tab
  ================================ */
  if (visibleTabs.length) {
    visibleTabs[0].classList.add("active");
    render(visibleTabs[0].dataset.category);
  }
}
