export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  const headerRow = rows[0];

  const tabRows = rows.filter(
    (row, index) => index > 0 && row.children.length === 3
  );

  const dropdownRows = rows.filter(
    (row, index) => index > 0 && row.children.length === 2
  );

  const headerCells = [...headerRow.children];
  const dropdownButtonText =
    headerCells[1]?.textContent?.trim() || "Wind Energy";

  rows.forEach((row) => (row.style.display = "none"));

  /* ================================
     Runtime wrapper
  ================================ */
  const runtime = document.createElement("div");
  runtime.className = "aviation-tabs-runtime";

  runtime.innerHTML = `
    <section class="aviation-tabs-section">
      <div class="container aviation-tabs-wrap">
        <ul class="aviation-tabs-list"></ul>
        ${dropdownRows.length ? `
          <div class="aviation-dropdown">
            <button class="aviation-dropdown-btn">
              ${dropdownButtonText}
              <span class="chevron"></span>
            </button>
            <ul class="aviation-dropdown-menu"></ul>
          </div>
        ` : ``}
      </div>
    </section>
  `;

  block.after(runtime);

  const tabsUL = runtime.querySelector(".aviation-tabs-list");
  const dropdownBtn = runtime.querySelector(".aviation-dropdown-btn");
  const dropdownMenu = runtime.querySelector(".aviation-dropdown-menu");

  const cleanPath = (url) =>
    url?.replace(/^(https?:\/\/)?[^/]+/, "").replace(/\/$/, "");

  const currentPath = cleanPath(window.location.href);

  /* ================================
     Tabs
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
     Dropdown (ONLY if exists)
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

    dropdownBtn.addEventListener("click", (e) => {
      e.preventDefault();
      dropdownMenu.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!runtime.contains(e.target)) {
        dropdownMenu.classList.remove("open");
      }
    });
  }
}