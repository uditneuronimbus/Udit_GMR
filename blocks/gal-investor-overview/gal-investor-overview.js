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

//   const galTitle = rows[6]?.textContent?.trim();
//   const galDescription = rows[7]?.innerHTML?.trim();
//   const galCtaText = rows[8]?.textContent?.trim();
//   const galCtaLink = rows[9]?.querySelector('a')?.href;
//   const galStockSymbol = rows[10]?.textContent?.trim();

//   const galStats = [];
//   let index = 11;

//   while (rows[index] && rows[index + 1]) {
//     if (rows[index].dataset?.section === "gpil") break;

//     const statText = rows[index]?.innerHTML?.trim();
//     const statImage = rows[index + 1]?.innerHTML?.trim();

//     if (statText || statImage) {
//       galStats.push(`
//         <div class="gal-stat-card">
//           ${statImage ? `<div class="stat-image">${statImage}</div>` : ''}
//           ${statText ? `<div class="stat-text">${statText}</div>` : ''}
//         </div>
//       `);
//     }

//     index += 2;
//   }

//   /* ===============================
//      GPIL SECTION DATA
//   =============================== */

//   const gpilTitle = rows[index]?.textContent?.trim();
//   const gpilDescription = rows[index + 1]?.innerHTML?.trim();
//   const gpilCtaText = rows[index + 2]?.textContent?.trim();
//   const gpilCtaLink = rows[index + 3]?.querySelector('a')?.href;
//   const gpilStockSymbol = rows[index + 4]?.textContent?.trim();

//   const gpilStats = [];
//   let gpilIndex = index + 5;

//   while (rows[gpilIndex] && rows[gpilIndex + 1]) {
//     const statText = rows[gpilIndex]?.innerHTML?.trim();
//     const statImage = rows[gpilIndex + 1]?.innerHTML?.trim();

//     if (statText || statImage) {
//       gpilStats.push(`
//         <div class="gal-stat-card">
//           ${statImage ? `<div class="stat-image">${statImage}</div>` : ''}
//           ${statText ? `<div class="stat-text">${statText}</div>` : ''}
//         </div>
//       `);
//     }

//     gpilIndex += 2;
//   }

//   /* ===============================
//      RENDER HTML
//   =============================== */

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
//           ${galTitle ? `<h3>${galTitle}</h3>` : ''}
//           ${galDescription ? `<div class="gal-desc">${galDescription}</div>` : ''}

//           ${galStockSymbol ? `
//             <div class="gal-market">
//               <div class="market-symbol">
//                 <strong>${galStockSymbol}</strong>
//               </div>
//             </div>
//           ` : ''}

//           ${galCtaText && galCtaLink
//             ? `<a class="gal-cta" href="${galCtaLink}">${galCtaText}</a>`
//             : ''}
//         </div>

//         ${galStats.length ? `
//           <div class="gal-right">
//             ${galStats.join('')}
//           </div>
//         ` : ''}

//       </div>

//     </div>

//     <!-- GPIL CONTENT (Initially Hidden) -->
//     <div class="gpil-content" style="display:none;">

//       <div class="gal-main">
//         <div class="gal-left">
//           ${gpilTitle ? `<h3>${gpilTitle}</h3>` : ''}
//           ${gpilDescription ? `<div class="gal-desc">${gpilDescription}</div>` : ''}

//           ${gpilStockSymbol ? `
//             <div class="gal-market">
//               <div class="market-symbol">
//                 <strong>${gpilStockSymbol}</strong>
//               </div>
//             </div>
//           ` : ''}

//           ${gpilCtaText && gpilCtaLink
//             ? `<a class="gal-cta" href="${gpilCtaLink}">${gpilCtaText}</a>`
//             : ''}
//         </div>

//         ${gpilStats.length ? `
//           <div class="gal-right">
//             ${gpilStats.join('')}
//           </div>
//         ` : ''}

//       </div>

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

  const primaryText = rows[2]?.textContent?.trim();     // GMR Airport Limited
  const secondaryText = rows[4]?.textContent?.trim();   // GPUIL

  /* ===============================
     RENDER BLOCK
  =============================== */

  block.innerHTML = `
    <div class="gal-investor-wrapper">

      <div class="investors-trust-wrapper">
        ${topTitle ? `<h2 class="investors-title">${topTitle}</h2>` : ''}
        ${topDescription ? `<div class="investors-desc">${topDescription}</div>` : ''}

        <div class="investors-cta">
          ${primaryText ? `<button class="cta primary active">${primaryText}</button>` : ''}
          ${secondaryText ? `<button class="cta secondary">${secondaryText}</button>` : ''}
        </div>
      </div>

      <!-- ================= PRIMARY CONTENT (GAL) ================= -->
      <div class="company-content primary-content">

        <div class="gal-content">
          <div class="gal-main">
            <div class="gal-left">
              <h3>GMR Airports Limited (GAL)</h3>
              <div class="gal-desc">
                <p>
                  As Asia's largest private airport operator, the company develops,
                  operates, and manages airports and is a pioneer of integrated
                  aerotropolis developments that unlock airport value chains
                  beyond traditional revenue.
                </p>
              </div>

              <div class="gal-market">
                <div class="market-symbol">
                  <strong>gal</strong>
                </div>
              </div>

              <a class="gal-cta" href="http://localhost:3000/en/investors#">
                Visit Website
              </a>
            </div>

            <div class="gal-right">

              <div class="gal-stat-card">
                <div class="stat-text">
                  <p><strong>#1 in Asia</strong></p>
                  <p>Largest private airport operator</p>
                </div>
              </div>

              <div class="gal-stat-card">
                <div class="stat-text">
                  <p><strong>120+ million</strong></p>
                  <p>Passengers served FY25</p>
                </div>
              </div>

              <div class="gal-stat-card">
                <div class="stat-text">
                  <p><strong>₹10,414 crore</strong></p>
                  <p>FY25 airport revenue</p>
                </div>
              </div>

              <div class="gal-stat-card">
                <div class="stat-text">
                  <p><strong>12% Year-on-year</strong></p>
                  <p>Passenger growth</p>
                </div>
              </div>

              <div class="gal-stat-card">
                <div class="stat-text">
                  <p><strong>22.5% Growth</strong></p>
                  <p>in EBITDA to ₹4,188 crore</p>
                </div>
              </div>

              <div class="gal-stat-card">
                <div class="stat-text">
                  <p><strong>9 World-class</strong></p>
                  <p>Airport assets</p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      <!-- ================= SECONDARY CONTENT (GPUIL) ================= -->
      <div class="company-content secondary-content" style="display:none;">

        <div class="gal-content">
          <div class="gal-main">
            <div class="gal-left">
              <h3>GMR Power and Urban Infra Limited (GPUIL)</h3>
              <div class="gal-desc">
                <p>
                  GPUIL is a leader in energy, urban infrastructure, and transportation sectors.
                  The company runs power plants, manages highways, and develops industrial
                  areas along key Indian growth corridors.
                </p>
              </div>

              <div class="gal-market">
                <div class="market-symbol">
                  <strong>gpuil</strong>
                </div>
              </div>

              <a class="gal-cta" href="http://localhost:3000/en/investors#">
                Visit Website
              </a>
            </div>

            <div class="gal-right">

              <div class="gal-stat-card">
                <div class="stat-text">
                  <p><strong>₹6,344 crore</strong></p>
                  <p>FY25 total revenue</p>
                </div>
              </div>

              <div class="gal-stat-card">
                <div class="stat-text">
                  <p><strong>₹2,181 crore</strong></p>
                  <p>EBITDA for FY25</p>
                </div>
              </div>

              <div class="gal-stat-card">
                <div class="stat-text">
                  <p><strong>2,840 MW</strong></p>
                  <p>Installed power capacity</p>
                </div>
              </div>

              <div class="gal-stat-card">
                <div class="stat-text">
                  <p><strong>1,775 MW</strong></p>
                  <p>Power projects under development</p>
                </div>
              </div>

              <div class="gal-stat-card">
                <div class="stat-text">
                  <p><strong>2,400+ lane-km</strong></p>
                  <p>Highways operated across India</p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  `;

  /* ===============================
     TOGGLE FUNCTIONALITY
  =============================== */

  const primaryBtn = block.querySelector('.cta.primary');
  const secondaryBtn = block.querySelector('.cta.secondary');
  const primaryContent = block.querySelector('.primary-content');
  const secondaryContent = block.querySelector('.secondary-content');

  primaryBtn?.addEventListener('click', () => {
    primaryBtn.classList.add('active');
    secondaryBtn.classList.remove('active');

    primaryContent.style.display = 'block';
    secondaryContent.style.display = 'none';
  });

  secondaryBtn?.addEventListener('click', () => {
    secondaryBtn.classList.add('active');
    primaryBtn.classList.remove('active');

    primaryContent.style.display = 'none';
    secondaryContent.style.display = 'block';
  });
}








