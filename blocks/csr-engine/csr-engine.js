export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 6) return;

  // Hide original authored rows (keep them for Universal Editor)
  rows.forEach((row) => (row.style.display = "none"));

  /*
  Expected structure (based on your HTML):
  0 → logo image
  1 → title
  2 → subtitle (optional / duplicate title)
  3 → description
  4 → main image
  5 → right description
  6+ → items (csr-engine-item components)
  */

  const logo = rows[0]?.querySelector('picture');
  const title = rows[1]?.textContent?.trim();
  const subtitle = rows[2]?.textContent?.trim();
  const description = rows[3]?.innerHTML;
  const mainImage = rows[4]?.querySelector('picture');
  const rightDescription = rows[5]?.innerHTML;

  const itemRows = rows.slice(6);

  /* ================= Create new rendered section ================= */
  const renderedSection = document.createElement('div');
  renderedSection.className = 'csr-rendered';

  /* ================= Header ================= */
  const header = document.createElement('div');
  header.className = 'csr-header';

  if (logo) {
    const logoWrap = document.createElement('div');
    logoWrap.className = 'csr-logo';
    logoWrap.append(logo.cloneNode(true)); // Clone to preserve original
    header.append(logoWrap);
  }

  if (title) {
    const h2 = document.createElement('h2');
    h2.className = 'csr-title';
    h2.textContent = title;
    header.append(h2);
  }

  if (description) {
    const desc = document.createElement('div');
    desc.className = 'csr-description';
    desc.innerHTML = description;
    header.append(desc);
  }

  /* ================= Layout ================= */
  const content = document.createElement('div');
  content.className = 'csr-content';

  /* ---- Left Image ---- */
  const left = document.createElement('div');
  left.className = 'csr-left';
  if (mainImage) left.append(mainImage.cloneNode(true));

  /* ---- Right Side ---- */
  const right = document.createElement('div');
  right.className = 'csr-right';

  if (rightDescription) {
    const rdesc = document.createElement('div');
    rdesc.className = 'csr-main-description';
    rdesc.innerHTML = rightDescription;
    right.append(rdesc);
  }

  /* ================= Items ================= */
  if (itemRows.length) {
    const itemsWrap = document.createElement('div');
    itemsWrap.className = 'csr-items';

    itemRows.forEach((row, index) => {
      // Preserve component identification for Universal Editor
      if (!row.classList.contains('csr-engine-item')) {
        row.classList.add('csr-engine-item');
      }
      
      const cols = [...row.children];

      const icon = cols[0]?.querySelector('picture');
      const itemTitle = cols[1]?.textContent?.trim();
      const itemDesc = cols[2]?.innerHTML;

      const item = document.createElement('div');
      item.className = 'csr-item';
      
      // Add data attributes to help with editing
      item.setAttribute('data-component', 'csr-engine-item');
      item.setAttribute('data-index', index);

      if (icon) {
        const iconWrap = document.createElement('div');
        iconWrap.className = 'csr-icon';
        iconWrap.append(icon.cloneNode(true));
        item.append(iconWrap);
      }

      const textWrap = document.createElement('div');
      textWrap.className = 'csr-item-text';

      if (itemTitle) {
        const h3 = document.createElement('h3');
        h3.className = 'csr-item-title';
        h3.textContent = itemTitle;
        textWrap.append(h3);
      }

      if (itemDesc) {
        const d = document.createElement('div');
        d.className = 'csr-item-desc';
        d.innerHTML = itemDesc;
        textWrap.append(d);
      }

      if (textWrap.children.length > 0) {
        item.append(textWrap);
      }

      itemsWrap.append(item);
    });

    right.append(itemsWrap);
  }

  content.append(left, right);
  renderedSection.append(header, content);

  // Add the rendered section after the original block content
  block.after(renderedSection);

  // Add a class to identify the block type (optional)
  block.classList.add('csr-engine-container');
}