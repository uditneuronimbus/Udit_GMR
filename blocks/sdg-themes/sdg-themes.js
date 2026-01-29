// export default function decorate(block) {
//   if (block.classList.contains('sdg-themes-initialized')) return;
//   block.classList.add('sdg-themes-initialized');

//   const rows = [...block.children];
//   if (rows.length < 2) return;

  
//   const title = rows[0]?.textContent?.trim() || '';

 
//   const itemRows = rows.slice(1);

 
//   const runtime = document.createElement('div');
//   runtime.className = 'sdg-themes-runtime';

//   runtime.innerHTML = `
//     <div class="sdg-container">
//       <h2 class="sdg-title">${title}</h2>
//       <div class="sdg-grid"></div>
//     </div>
//   `;

//   const grid = runtime.querySelector('.sdg-grid');

 
//   itemRows.forEach((row) => {
//     const cells = [...row.children];
//     if (cells.length < 4) return;

//     const imgEl = cells[0].querySelector('img');
//     const imgSrc = imgEl?.getAttribute('src') || '';
//     const imgAlt = imgEl?.getAttribute('alt') || '';

//     const number = cells[1]?.textContent?.trim() || '';
//     const title = cells[2]?.textContent?.trim() || '';
//     const desc = cells[3]?.innerHTML || '';

//     const card = document.createElement('article');
//     card.className = 'sdg-card';

//     card.innerHTML = `
//       <div class="sdg-image">
//         ${imgSrc ? `<img src="${imgSrc}" alt="${imgAlt}">` : ''}
//         ${number ? `<span class="sdg-number">${number}</span>` : ''}
//       </div>
//       <div class="sdg-content">
//         <h3>${title}</h3>
//         <div class="sdg-desc">${desc}</div>
//       </div>
//     `;

//     grid.append(card);
//   });

//   block.append(runtime);
// }



export default function decorate(block) {
  if (block.classList.contains('sdg-themes-initialized')) return;
  block.classList.add('sdg-themes-initialized');

  const rows = [...block.children];
  if (rows.length < 2) return;

  /* ===============================
     1️⃣ Section title
  =============================== */
  const sectionTitle = rows[0]?.textContent?.trim() || '';

  /* ===============================
     2️⃣ Item rows
  =============================== */
  const itemRows = rows.slice(1);
  block.innerHTML = '';

  /* ===============================
     3️⃣ Runtime wrapper
  =============================== */
  const runtime = document.createElement('div');
  runtime.className = 'sdg-themes-runtime';

  const container = document.createElement('div');
  container.className = 'sdg-container';

  const titleEl = document.createElement('h2');
  titleEl.className = 'sdg-title';
  titleEl.textContent = sectionTitle;

  const grid = document.createElement('div');
  grid.className = 'sdg-grid';

  container.append(titleEl, grid);
  runtime.append(container);
  block.append(runtime);

  /* ===============================
     4️⃣ Build cards
  =============================== */
  itemRows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 4) return;

    const imgEl = cells[0].querySelector('img');
    const imgSrc = imgEl?.getAttribute('src');
    const imgAlt = imgEl?.getAttribute('alt') || '';

    const number = cells[1]?.textContent?.trim() || '';
    const title = cells[2]?.textContent?.trim() || '';
    const desc = cells[3]?.innerHTML || '';

    const card = document.createElement('article');
    card.className = 'sdg-card';

    /* IMAGE */
    const imgWrap = document.createElement('div');
    imgWrap.className = 'sdg-image';

    if (imgSrc) {
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = imgAlt;
      imgWrap.appendChild(img);
    }

    if (number) {
      const num = document.createElement('span');
      num.className = 'sdg-number';
      num.textContent = number;
      imgWrap.appendChild(num);
    }

    /* BOTTOM BAR */
    const overlay = document.createElement('div');
    overlay.className = 'sdg-content';

    overlay.innerHTML = `
      <div>
        <h3>${title}</h3>
        <div class="sdg-description">${desc}</div>
      </div>
    `;

    card.appendChild(imgWrap);
    card.appendChild(overlay);
    grid.appendChild(card);

    /* ===============================
       TOGGLE (➕ / ➖)
    =============================== */
    overlay.addEventListener('click', (e) => {
      e.stopPropagation();

      const isActive = card.classList.contains('active');

      // Close all cards (reference behavior)
      grid.querySelectorAll('.sdg-card.active').forEach((c) => {
        c.classList.remove('active');
      });

      // Toggle current
      if (!isActive) {
        card.classList.add('active');
      }
    });
  });
}
