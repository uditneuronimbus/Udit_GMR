export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  block.classList.add('contact-reachout');

  /* ===============================
     1️⃣ Heading & Description
  =============================== */
  const headingRow = rows.shift();
  const headingText =
    headingRow?.querySelector('p')?.textContent?.trim() || '';

  const descRow = rows.shift();
  const descHTML = descRow?.innerHTML || '';

  const container = document.createElement('div');
  container.className = 'contact-reachout-container';

  if (headingText) {
    const h2 = document.createElement('h2');
    h2.className = 'contact-reachout-heading';
    h2.textContent = headingText;
    container.appendChild(h2);
  }

  if (descHTML) {
    const descDiv = document.createElement('div');
    descDiv.className = 'contact-reachout-description';
    descDiv.innerHTML = descHTML;
    container.appendChild(descDiv);
  }

  /* ===============================
     2️⃣ Items
  =============================== */
  if (rows.length) {
    const listWrapper = document.createElement('div');
    listWrapper.className = 'contact-reachout-items';

    rows.forEach((itemRow) => {
      const children = [...itemRow.children];
      if (!children.length) return;

      const itemDiv = document.createElement('div');
      itemDiv.className = 'contact-reachout-item';

      /* ---- Item Heading (first <p>) ---- */
      const headingEl = children.shift();
      const headingText = headingEl?.textContent?.trim();

      if (headingText) {
        const h3 = document.createElement('h3');
        h3.className = 'contact-reachout-item-heading';
        h3.textContent = headingText;
        itemDiv.appendChild(h3);
      }

      /* ---- Item Content (rest of elements) ---- */
      if (children.length) {
        const contentDiv = document.createElement('div');
        contentDiv.className = 'contact-reachout-item-content';

        children.forEach((el) => contentDiv.appendChild(el));

        itemDiv.appendChild(contentDiv);
      }

      listWrapper.appendChild(itemDiv);
    });

    container.appendChild(listWrapper);
  }

  block.innerHTML = '';
  block.appendChild(container);
}
