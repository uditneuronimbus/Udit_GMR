export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  /* ===============================
     1️⃣ Section title
  =============================== */
  const sectionTitle = rows[0]
    ?.querySelector("p")
    ?.textContent?.trim();

  const itemRows = rows.slice(1);

  /* ===============================
     2️⃣ Parse authored rows
  =============================== */
  const tabsMap = {};

  itemRows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 5) return;

    const tabTitle = cells[0]?.textContent?.trim();
    if (!tabTitle) return;

    if (!tabsMap[tabTitle]) {
      tabsMap[tabTitle] = [];
    }

    tabsMap[tabTitle].push({
      icon: cells[2]?.textContent?.trim(),
      title: cells[3]?.textContent?.trim(),
      desc: cells[4]?.textContent?.trim(),
    });
  });

  const tabTitles = Object.keys(tabsMap);
  if (!tabTitles.length) return;

  /* ===============================
     3️⃣ Hide authored HTML (EDS SAFE)
  =============================== */
  rows.forEach((row) => (row.style.display = "none"));

  /* ===============================
     4️⃣ Runtime markup
  =============================== */
  const runtime = document.createElement("section");
  runtime.className = "gmr-tabs-runtime";

  runtime.innerHTML = `
    <div class="container">
      ${
        sectionTitle
          ? `<h2 class="gmr-tabs-title text-center mb-4">${sectionTitle}</h2>`
          : ""
      }

      <div class="gmr-tabs-nav text-center mb-5">
        ${tabTitles
          .map(
            (title, i) => `
          <button
            class="gmr-tab-btn ${i === 0 ? "active" : ""}"
            data-tab="${i}">
            ${title}
          </button>`
          )
          .join("")}
      </div>

      <div class="gmr-tabs-content"></div>
    </div>
  `;

  block.after(runtime);

  const tabsNav = runtime.querySelectorAll(".gmr-tab-btn");
  const contentWrap = runtime.querySelector(".gmr-tabs-content");

  /* ===============================
     5️⃣ Render cards (ROW + COL)
  =============================== */
  function renderTab(index) {
    const tabTitle = tabTitles[index];
    const cards = tabsMap[tabTitle];

    contentWrap.innerHTML = `
      <div class="row justify-content-center gmr-cards">
        ${cards
          .map(
            (card) => `
          <div class="col-md-4 col-sm-6 mb-4">
            <div class="gmr-card text-center h-100">
              ${
                card.icon
                  ? `<div class="gmr-card-icon mb-3">${card.icon}</div>`
                  : ""
              }
              ${
                card.title
                  ? `<h4 class="gmr-card-title">${card.title}</h4>`
                  : ""
              }
              ${
                card.desc
                  ? `<div class="gmr-card-desc">${card.desc}</div>`
                  : ""
              }
            </div>
          </div>`
          )
          .join("")}
      </div>
    `;
  }

  /* ===============================
     6️⃣ Tabs click
  =============================== */
  tabsNav.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabsNav.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderTab(btn.dataset.tab);
    });
  });

  /* ===============================
     7️⃣ Init
  =============================== */
  renderTab(0);
}
