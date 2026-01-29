export default function decorate(block) {
  const rows = [...block.children];

  if (rows.length < 2) return;

  block.classList.add("global-leaders-aviation");

  /* ================================
     1️⃣ Identify fields safely
     ================================ */
  let logoEl = null;
  let titleEl = null;
  let descEl = null;
  let footerEl = null;
  const itemRows = [];

  rows.forEach((row) => {
    if (!logoEl && row.querySelector("img, picture, svg")) {
      logoEl = row;
      return;
    }

    if (!titleEl && row.querySelector("h1, h2, h3")) {
      titleEl = row;
      return;
    }

    if (!descEl && row.querySelector("p")) {
      descEl = row;
      return;
    }

    if (!footerEl && row.textContent.trim()) {
      footerEl = row;
      return;
    }

    itemRows.push(row);
  });

  const hasLogo = logoEl?.querySelector("img, picture, svg");
  const hasTitle = titleEl?.textContent.trim();
  const hasDesc = descEl?.textContent.trim();
  const hasFooter = footerEl?.textContent.trim();

  /* ================================
     2️⃣ Wrapper
     ================================ */
  const wrapper = document.createElement("div");
  wrapper.className = "gla-wrapper spacer";

  /* ================================
     3️⃣ Main content layout
     ================================ */
  if (hasLogo || hasTitle || hasDesc) {
    const container = document.createElement("div");
    container.className = "container";

    const row = document.createElement("div");
    row.className = "row";

    /* LEFT COLUMN → LOGO + TITLE */
    if (hasLogo || hasTitle) {
      const leftCol = document.createElement("div");
      leftCol.className = "col-lg-5 col-md-5";

      if (hasLogo) {
        logoEl.remove();
        logoEl.classList.add("service-logo", "mb-4");
        logoEl.removeAttribute("data-aue-label");
        leftCol.appendChild(logoEl);
      }

      if (hasTitle) {
        titleEl.remove();
        titleEl.classList.add("sec-title");
        titleEl.removeAttribute("data-aue-label");
        leftCol.appendChild(titleEl);
      }

      row.appendChild(leftCol);
    }

    /* RIGHT COLUMN → DESCRIPTION ONLY */
    if (hasDesc) {
      const rightCol = document.createElement("div");
      rightCol.className = "col-md-7 col-lg-6 fs-md";

      descEl.remove();
      descEl.removeAttribute("data-aue-label");
      rightCol.appendChild(descEl);

      row.appendChild(rightCol);
    }

    container.appendChild(row);
    wrapper.appendChild(container);
  }

  /* ================================
     4️⃣ Stats (STRICT FILTER)
     ================================ */
  const validStats = itemRows.filter((row) => {
    if (!row || row.children.length < 2) return false;
    const [num, txt] = row.children;
    return num.textContent.trim() && txt.textContent.trim();
  });

  if (validStats.length) {
    const statsContainer = document.createElement("ul");
    statsContainer.className = "gla-stats pt-5 pb-4";
    statsContainer.setAttribute("data-aue-label", "Global Items");

    validStats.forEach((row) => {
      const [num, txt] = row.children;

      row.remove();
      row.className = "gla-stat";
      row.setAttribute("data-aue-behavior", "component");

      num.classList.add("gla-stat-number");
      num.removeAttribute("data-aue-label");

      txt.classList.add("gla-stat-text");
      txt.removeAttribute("data-aue-label");

      statsContainer.appendChild(row);
    });

    wrapper.appendChild(statsContainer);
  }

  /* ================================
     5️⃣ Footer
     ================================ */
  if (hasFooter) {
    const footerDiv = document.createElement("div");
    footerDiv.className = "gla-footer";
    footerDiv.innerHTML = footerEl.innerHTML;
    footerDiv.removeAttribute("data-aue-label");
    wrapper.appendChild(footerDiv);
  }

  /* ================================
     6️⃣ Replace block
     ================================ */
  block.innerHTML = "";
  block.appendChild(wrapper);
}
