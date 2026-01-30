export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  /* ================================
     1️⃣ Identify rows (EDS safe)
  ================================ */
  const headerRow = rows[0];

  const tabRows = rows.filter(
    (row, index) => index > 0 && row.children.length === 3
  );

  const dropdownRows = rows.filter(
    (row, index) => index > 0 && row.children.length === 2
  );

  /* ================================
     2️⃣ Helpers
  ================================ */
  const cleanPath = (url) =>
    url?.replace(/^(https?:\/\/)?[^/]+/, "").replace(/\/$/, "");

  const currentPath = cleanPath(window.location.href);

  /* ================================
     3️⃣ Resolve dropdown button text
     (match URL → fallback first item)
  ================================ */
  let dropdownButtonText = "";

  dropdownRows.forEach((row) => {
    const cells = [...row.children];
    const text = cells[0]?.textContent?.trim();
    const url = cells[1]?.textContent?.trim();

    if (text && url && cleanPath(url) === currentPath) {
      dropdownButtonText = text;
    }
  });

  if (!dropdownButtonText && dropdownRows.length) {
    dropdownButtonText =
      dropdownRows[0].children[0]?.textContent?.trim();
  }

  /* ================================
     4️⃣ Hide authored rows
  ================================ */
  rows.forEach((row) => (row.style.display = "none"));

  /* ================================
     5️⃣ Runtime HTML
  ================================ */
  const runtime = document.createElement("div");
  runtime.className = "aviation-tabs-runtime";

  runtime.innerHTML = `
    <section class="aviation-tabs-section">
      <div class="container aviation-tabs-wrap">
        <ul class="aviation-tabs-list"></ul>
        ${
          dropdownRows.length
            ? `
          <div class="aviation-dropdown">
            <button class="aviation-dropdown-btn">
              ${dropdownButtonText}
              <span class="chevron"></span>
            </button>
            <ul class="aviation-dropdown-menu"></ul>
          </div>
        `
            : ""
        }
      </div>
    </section>
  `;

  block.after(runtime);

  const tabsUL = runtime.querySelector(".aviation-tabs-list");
  const dropdownBtn = runtime.querySelector(".aviation-dropdown-btn");
  const dropdownMenu = runtime.querySelector(".aviation-dropdown-menu");

  /* ================================
     6️⃣ Build tabs (LEFT)
  ================================ */
  tabRows.forEach((row) => {
    const cells = [...row.children];
    const label = cells[0]?.textContent?.trim();
    const link = cells[1]?.textContent?.trim();
    const isActive = cells[2]?.textContent?.trim() === "true";

    if (!label || !link) return;

    const li = document.createElement("li");
    if (isActive || cleanPath(link) === currentPath) {
      li.classList.add("active");
    }

    li.innerHTML = `<a href="${link}">${label}</a>`;
    tabsUL.appendChild(li);
  });

  /* ================================
     7️⃣ Build dropdown (RIGHT)
  ================================ */
  if (dropdownMenu && dropdownBtn) {
    dropdownRows.forEach((row) => {
      const cells = [...row.children];
      const text = cells[0]?.textContent?.trim();
      const url = cells[1]?.textContent?.trim();

      if (!text || !url) return;

      const li = document.createElement("li");
      li.innerHTML = `<a href="${url}">${text}</a>`;
      dropdownMenu.appendChild(li);
    });

    /* Toggle */
    dropdownBtn.addEventListener("click", (e) => {
      e.preventDefault();
      dropdownMenu.classList.toggle("open");
    });

    /* Outside click */
    document.addEventListener("click", (e) => {
      if (!runtime.contains(e.target)) {
        dropdownMenu.classList.remove("open");
      }
    });
  }
}