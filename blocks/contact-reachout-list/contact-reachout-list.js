export default function decorate(block) {
  const isAuthorMode =
    document.body.classList.contains('aem-AuthorLayer-Edit') ||
    window.location.search.includes('wcmmode=edit');

  const rows = [...block.children];
  if (!rows.length) return;

  block.classList.add('contact-reachout');

  /* ===============================
     PREVENT DOUBLE RENDER
  =============================== */
  const existingRuntime = block.querySelector('.contact-reachout-runtime');
  if (existingRuntime) existingRuntime.remove();

  /* ===============================
     1️⃣ Heading & Description
  =============================== */
  const headingRow = rows.shift();
  const headingText = headingRow?.querySelector('p')?.textContent?.trim() || '';

  const descRow = rows.shift();
  const descHTML = descRow?.innerHTML || '';

  /* ===============================
     2️⃣ Build Items HTML
  =============================== */
  let itemsHTML = '';
  
  if (rows.length) {
    itemsHTML = rows.map((itemRow) => {
      const children = [...itemRow.children];
      if (!children.length) return '';

      const heading = children[0]?.textContent?.trim() || '';
      const contentHTML = children[1]?.innerHTML || '';
      const iconCell = children[2];
      
      // Create icon HTML
      let iconHTML = '';
      if (iconCell) {
        const img = iconCell.querySelector('img');
        const link = iconCell.querySelector('a');
        
        if (img) {
          iconHTML = `<img src="${img.src}" alt="${img.alt || 'Icon'}" loading="lazy">`;
        } else if (link) {
          iconHTML = `<img src="${link.href}" alt="Icon" loading="lazy">`;
        } else {
          const text = iconCell.textContent.trim();
          if (text) {
            iconHTML = `<span class="contact-reachout-icon ${text}" data-icon="${text}"></span>`;
          }
        }
      }

      // Build item HTML
      return `
        <div class="contact-reachout-item">
          <div class="contact-reachout-item-content-wrapper">
            ${heading ? `<h3 class="contact-reachout-item-heading">${heading}</h3>` : ''}
            <div class="contact-reachout-item-content">
              ${iconHTML ? `<div class="contact-reachout-item-icon">${iconHTML}</div>` : ''}
              ${contentHTML || ''}
            </div>
          </div>
        </div>
      `;
    }).filter(Boolean).join('');
  }

  /* ===============================
     3️⃣ Build Complete Container with Wrapper Divs
  =============================== */
  const container = document.createElement('div');
  container.className = 'contact-reachout-container contact-reachout-runtime';
  
  container.innerHTML = `
    <div class="contactSec spacer">
      <div class="container">
        <div class="contact-reachoutList">
          ${headingText ? `<h2 class="contact-reachout-heading">${headingText}</h2>` : ''}
          ${descHTML?.trim() ? `<div class="contact-reachout-description">${descHTML}</div>` : ''}
          ${itemsHTML ? `<div class="contact-reachout-items">${itemsHTML}</div>` : ''}
          <a href="/en/contact-us" title="Contact Us" class="btn btn-primary mt-4">Contact Us</a>
        </div>
      </div>
    </div>
  `;

  /* =================================
     HIDE AUTHORED CONTENT (NOT DELETE)
  ================================= */
  block.classList.add('contact-reachout-initialized');
  block.appendChild(container);

  if (isAuthorMode) return;
}