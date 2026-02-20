// export default function decorate(block) {
//   const isAuthorMode =
//     document.body.classList.contains('aem-AuthorLayer-Edit') ||
//     window.location.search.includes('wcmmode=edit');

//   if (isAuthorMode) return;

//   const rows = [...block.children];
//   if (!rows.length) return;

//   /* ===============================
//      TOP SECTION
//   =============================== */

//   const topTitle = rows[0]?.textContent?.trim();
//   const topDescription = rows[1]?.innerHTML?.trim();

//   const primaryText = rows[2]?.textContent?.trim();
//   const primaryLink = rows[3]?.querySelector('a')?.href;

//   const secondaryText = rows[4]?.textContent?.trim();
//   const secondaryLink = rows[5]?.querySelector('a')?.href;

//   /* ===============================
//      LEFT SECTION
//   =============================== */

//   const companyTitle = rows[6]?.textContent?.trim();
//   const companyDescription = rows[7]?.innerHTML?.trim();

//   const ctaText = rows[8]?.textContent?.trim();
//   const ctaLink = rows[9]?.querySelector('a')?.href;

//   const stockSymbol = rows[10]?.textContent?.trim();

//   /* ===============================
//      STAT CARDS (Dynamic — no fixed 6)
//   =============================== */

//   const stats = [];
//   let index = 11;

//   while (rows[index] || rows[index + 1]) {
//     const statText = rows[index]?.innerHTML?.trim();
//     const statImage = rows[index + 1]?.innerHTML?.trim();

//     if (statText || statImage) {
//       stats.push(`
//         <div class="gal-stat-card">
//           ${statImage ? `<div class="stat-image">${statImage}</div>` : ''}
//           ${statText ? `<div class="stat-text">${statText}</div>` : ''}
//         </div>
//       `);
//     }

//     index += 2;
//   }

//   /* ===============================
//      BUILD STRUCTURE
//   =============================== */

//   block.innerHTML = '';

//   const wrapper = document.createElement('div');
//   wrapper.className = 'gal-investor-wrapper';

//   wrapper.innerHTML = `

//     ${topTitle || topDescription || primaryText || secondaryText ? `
//       <div class="investors-trust-wrapper">
//         ${topTitle ? `<h2 class="investors-title">${topTitle}</h2>` : ''}
//         ${topDescription ? `<div class="investors-desc">${topDescription}</div>` : ''}

//         ${(primaryText && primaryLink) || (secondaryText && secondaryLink) ? `
//           <div class="investors-cta">
//             ${primaryText && primaryLink
//               ? `<a class="cta primary" href="${primaryLink}">${primaryText}</a>`
//               : ''}
//             ${secondaryText && secondaryLink
//               ? `<a class="cta secondary" href="${secondaryLink}">${secondaryText}</a>`
//               : ''}
//           </div>
//         ` : ''}
//       </div>
//     ` : ''}

//     ${(companyTitle || companyDescription || stockSymbol || ctaText || stats.length) ? `
//       <div class="gal-main">

//         <div class="gal-left">
//           ${companyTitle ? `<h3>${companyTitle}</h3>` : ''}
//           ${companyDescription ? `<div class="gal-desc">${companyDescription}</div>` : ''}

//           ${stockSymbol ? `
//             <div class="gal-market">
//               <div class="market-symbol">
//                 <strong>${stockSymbol}</strong>
//               </div>
//             </div>
//           ` : ''}

//           ${ctaText && ctaLink
//             ? `<a class="gal-cta" href="${ctaLink}">${ctaText}</a>`
//             : ''}
//         </div>

//         ${stats.length ? `
//           <div class="gal-right">
//             ${stats.join('')}
//           </div>
//         ` : ''}

//       </div>
//     ` : ''}

//   `;

//   block.appendChild(wrapper);
// }



// export default function decorate(block) {
//   const isAuthorMode =
//     document.body.classList.contains('aem-AuthorLayer-Edit') ||
//     window.location.search.includes('wcmmode=edit');

//   if (isAuthorMode) return;

//   const rows = [...block.children];
//   if (!rows.length) return;

//   /* ===============================
//      TOP SECTION
//   =============================== */

//   const topTitle = rows[0]?.textContent?.trim();
//   const topDescription = rows[1]?.innerHTML?.trim();

//   const primaryText = rows[2]?.textContent?.trim();
//   const primaryLink = rows[3]?.querySelector('a')?.href;

//   const secondaryText = rows[4]?.textContent?.trim();
//   const secondaryLink = rows[5]?.querySelector('a')?.href;

//   /* ===============================
//      GAL SECTION DATA
//   =============================== */

//   const companyTitle = rows[6]?.textContent?.trim();
//   const companyDescription = rows[7]?.innerHTML?.trim();
//   const ctaText = rows[8]?.textContent?.trim();
//   const ctaLink = rows[9]?.querySelector('a')?.href;
//   const stockSymbol = rows[10]?.textContent?.trim();

//   /* ===============================
//      STAT CARDS
//   =============================== */

//   const stats = [];
//   let index = 11;

//   while (rows[index] || rows[index + 1]) {
//     const statText = rows[index]?.innerHTML?.trim();
//     const statImage = rows[index + 1]?.innerHTML?.trim();

//     if (statText || statImage) {
//       stats.push(`
//         <div class="gal-stat-card">
//           ${statImage ? `<div class="stat-image">${statImage}</div>` : ''}
//           ${statText ? `<div class="stat-text">${statText}</div>` : ''}
//         </div>
//       `);
//     }

//     index += 2;
//   }

//   block.innerHTML = '';

//   const wrapper = document.createElement('div');
//   wrapper.className = 'gal-investor-wrapper';

//   wrapper.innerHTML = `

//     <div class="investors-trust-wrapper">
//       ${topTitle ? `<h2 class="investors-title">${topTitle}</h2>` : ''}
//       ${topDescription ? `<div class="investors-desc">${topDescription}</div>` : ''}

//       <div class="investors-cta">
//         ${primaryText ? `<button class="cta primary active">${primaryText}</button>` : ''}
//         ${secondaryText ? `<button class="cta secondary">${secondaryText}</button>` : ''}
//       </div>
//     </div>

//     <!-- GAL CONTENT (Default Visible) -->
//     <div class="gal-content">

//       <div class="gal-main">
//         <div class="gal-left">
//           ${companyTitle ? `<h3>${companyTitle}</h3>` : ''}
//           ${companyDescription ? `<div class="gal-desc">${companyDescription}</div>` : ''}

//           ${stockSymbol ? `
//             <div class="gal-market">
//               <div class="market-symbol">
//                 <strong>${stockSymbol}</strong>
//               </div>
//             </div>
//           ` : ''}

//           ${ctaText && ctaLink
//             ? `<a class="gal-cta" href="${ctaLink}">${ctaText}</a>`
//             : ''}
//         </div>

//         ${stats.length ? `
//           <div class="gal-right">
//             ${stats.join('')}
//           </div>
//         ` : ''}
//       </div>

//     </div>

//     <!-- GPIL CONTENT (Initially Hidden) -->
//     <div class="gpil-content" style="display:none;">
//       <!-- You can author separate GPIL rows later if needed -->
//     </div>

//   `;

//   block.appendChild(wrapper);

//   /* ===============================
//      TOGGLE FUNCTIONALITY
//   =============================== */

//   const primaryBtn = wrapper.querySelector('.cta.primary');
//   const secondaryBtn = wrapper.querySelector('.cta.secondary');
//   const galContent = wrapper.querySelector('.gal-content');
//   const gpilContent = wrapper.querySelector('.gpil-content');

//   if (primaryBtn && secondaryBtn) {
//     primaryBtn.addEventListener('click', () => {
//       primaryBtn.classList.add('active');
//       secondaryBtn.classList.remove('active');

//       galContent.style.display = 'block';
//       gpilContent.style.display = 'none';
//     });

//     secondaryBtn.addEventListener('click', () => {
//       secondaryBtn.classList.add('active');
//       primaryBtn.classList.remove('active');

//       galContent.style.display = 'none';
//       gpilContent.style.display = 'block';
//     });
//   }
// }



export default function decorate(block) {
  const isAuthorMode =
    document.body.classList.contains('aem-AuthorLayer-Edit') ||
    window.location.search.includes('wcmmode=edit');

  if (isAuthorMode) return;

  const rows = [...block.children];
  if (!rows.length) return;

  /* ===============================
     TOP SECTION
  =============================== */

  const topTitle = rows[0]?.textContent?.trim();
  const topDescription = rows[1]?.innerHTML?.trim();

  const primaryText = rows[2]?.textContent?.trim();
  const primaryLink = rows[3]?.querySelector('a')?.href;

  const secondaryText = rows[4]?.textContent?.trim();
  const secondaryLink = rows[5]?.querySelector('a')?.href;

  /* ===============================
     GAL SECTION DATA
  =============================== */

  const galTitle = rows[6]?.textContent?.trim();
  const galDescription = rows[7]?.innerHTML?.trim();
  const galCtaText = rows[8]?.textContent?.trim();
  const galCtaLink = rows[9]?.querySelector('a')?.href;
  const galStockSymbol = rows[10]?.textContent?.trim();

  const galStats = [];
  let index = 11;

  while (rows[index] && rows[index + 1]) {
    if (rows[index].dataset?.section === "gpil") break;

    const statText = rows[index]?.innerHTML?.trim();
    const statImage = rows[index + 1]?.innerHTML?.trim();

    if (statText || statImage) {
      galStats.push(`
        <div class="gal-stat-card">
          ${statImage ? `<div class="stat-image">${statImage}</div>` : ''}
          ${statText ? `<div class="stat-text">${statText}</div>` : ''}
        </div>
      `);
    }

    index += 2;
  }

  /* ===============================
     GPIL SECTION DATA
  =============================== */

  const gpilTitle = rows[index]?.textContent?.trim();
  const gpilDescription = rows[index + 1]?.innerHTML?.trim();
  const gpilCtaText = rows[index + 2]?.textContent?.trim();
  const gpilCtaLink = rows[index + 3]?.querySelector('a')?.href;
  const gpilStockSymbol = rows[index + 4]?.textContent?.trim();

  const gpilStats = [];
  let gpilIndex = index + 5;

  while (rows[gpilIndex] && rows[gpilIndex + 1]) {
    const statText = rows[gpilIndex]?.innerHTML?.trim();
    const statImage = rows[gpilIndex + 1]?.innerHTML?.trim();

    if (statText || statImage) {
      gpilStats.push(`
        <div class="gal-stat-card">
          ${statImage ? `<div class="stat-image">${statImage}</div>` : ''}
          ${statText ? `<div class="stat-text">${statText}</div>` : ''}
        </div>
      `);
    }

    gpilIndex += 2;
  }

  /* ===============================
     RENDER HTML
  =============================== */

  block.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'gal-investor-wrapper';

  wrapper.innerHTML = `

    <div class="investors-trust-wrapper">
      ${topTitle ? `<h2 class="investors-title">${topTitle}</h2>` : ''}
      ${topDescription ? `<div class="investors-desc">${topDescription}</div>` : ''}

      <div class="investors-cta">
        ${primaryText ? `<button class="cta primary active">${primaryText}</button>` : ''}
        ${secondaryText ? `<button class="cta secondary">${secondaryText}</button>` : ''}
      </div>
    </div>

    <!-- GAL CONTENT (Default Visible) -->
    <div class="gal-content">

      <div class="gal-main">
        <div class="gal-left">
          ${galTitle ? `<h3>${galTitle}</h3>` : ''}
          ${galDescription ? `<div class="gal-desc">${galDescription}</div>` : ''}

          ${galStockSymbol ? `
            <div class="gal-market">
              <div class="market-symbol">
                <strong>${galStockSymbol}</strong>
              </div>
            </div>
          ` : ''}

          ${galCtaText && galCtaLink
            ? `<a class="gal-cta" href="${galCtaLink}">${galCtaText}</a>`
            : ''}
        </div>

        ${galStats.length ? `
          <div class="gal-right">
            ${galStats.join('')}
          </div>
        ` : ''}

      </div>

    </div>

    <!-- GPIL CONTENT (Initially Hidden) -->
    <div class="gpil-content" style="display:none;">

      <div class="gal-main">
        <div class="gal-left">
          ${gpilTitle ? `<h3>${gpilTitle}</h3>` : ''}
          ${gpilDescription ? `<div class="gal-desc">${gpilDescription}</div>` : ''}

          ${gpilStockSymbol ? `
            <div class="gal-market">
              <div class="market-symbol">
                <strong>${gpilStockSymbol}</strong>
              </div>
            </div>
          ` : ''}

          ${gpilCtaText && gpilCtaLink
            ? `<a class="gal-cta" href="${gpilCtaLink}">${gpilCtaText}</a>`
            : ''}
        </div>

        ${gpilStats.length ? `
          <div class="gal-right">
            ${gpilStats.join('')}
          </div>
        ` : ''}

      </div>

    </div>
  `;

  block.appendChild(wrapper);

  /* ===============================
     TOGGLE FUNCTIONALITY
  =============================== */

  const primaryBtn = wrapper.querySelector('.cta.primary');
  const secondaryBtn = wrapper.querySelector('.cta.secondary');
  const galContent = wrapper.querySelector('.gal-content');
  const gpilContent = wrapper.querySelector('.gpil-content');

  if (primaryBtn && secondaryBtn) {
    primaryBtn.addEventListener('click', () => {
      primaryBtn.classList.add('active');
      secondaryBtn.classList.remove('active');

      galContent.style.display = 'block';
      gpilContent.style.display = 'none';
    });

    secondaryBtn.addEventListener('click', () => {
      secondaryBtn.classList.add('active');
      primaryBtn.classList.remove('active');

      galContent.style.display = 'none';
      gpilContent.style.display = 'block';
    });
  }
}











