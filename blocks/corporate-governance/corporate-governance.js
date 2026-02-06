export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  block.classList.add("corporate-governance");

  /* ===============================
     Outer structure
     =============================== */
  const outer = document.createElement("div");
  outer.className = "sec-corporate-governance spacer";

  const container = document.createElement("div");
  container.className = "container";

  /* ===============================
     Header Section
     =============================== */
  const header = document.createElement("div");
  header.className = "cg-header";

  const introRow = rows.shift();
  if (introRow) {
    introRow.classList.add("cg-intro");
    header.append(introRow);
  }

  const subtitleRow = rows.shift();
  if (subtitleRow) {
    const p = subtitleRow.querySelector("p");
    if (p) {
      const h3 = document.createElement("h3");
      h3.className = "cg-subtitle";
      h3.innerHTML = p.innerHTML;
      p.replaceWith(h3);
    }
    header.append(subtitleRow);
  }

  const imageRow = rows.shift();
  if (imageRow && imageRow.querySelector("img")) {
    imageRow.classList.add("cg-hero-image");
    header.append(imageRow);
  }

  container.append(header);

  /* ===============================
     Governance Sections
     =============================== */
  const sectionsWrap = document.createElement("div");
  sectionsWrap.className = "cg-sections";

  rows.forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    row.classList.add("cg-section");

    /* ---- Color Theme ---- */
    const themeCell = cells.shift();
    const theme =
      themeCell?.textContent?.trim().toLowerCase() || "red";
    row.classList.add(`theme-${theme}`);
    themeCell?.remove();

    /* ---- Image / Cube ---- */
    const imageCell = cells.shift();
    if (imageCell && imageCell.querySelector("img")) {
      imageCell.classList.add("cg-cube");
      row.append(imageCell);
    }

    /* ---- Content ---- */
    const content = document.createElement("div");
    content.className = "cg-content";

    /* ---- Title ---- */
    const titleCell = cells.shift();
    if (titleCell) {
      const p = titleCell.querySelector("p");
      if (p) {
        const h4 = document.createElement("h4");
        h4.className = "cg-title";
        h4.innerHTML = p.innerHTML;
        p.replaceWith(h4);
      }
      content.append(titleCell);
    }

    /* ---- Bullet Points (Optional, 1–6) ---- */
    const list = document.createElement("ul");
    list.className = "cg-points";

    cells.forEach((cell) => {
      const text = cell.textContent?.trim();
      if (text) {
        const li = document.createElement("li");
        li.textContent = text;
        list.append(li);
      }
      cell.remove();
    });

    if (list.children.length) {
      content.append(list);
    }

    row.append(content);
    sectionsWrap.append(row);
  });

  container.append(sectionsWrap);
  outer.append(container);
  block.append(outer);
}
