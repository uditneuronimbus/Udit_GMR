export default function decorate(block) {
  const rows = [...block.children].filter(row => row.children.length > 0); // skip fully empty rows

  if (rows.length === 0) {
    block.innerHTML = '<p>No content configured.</p>';
    return;
  }

  let idx = 0;

  // Title (first non-empty row, usually single cell or first cell)
  const title = rows[idx]?.children[0]?.textContent?.trim() || 'Investor Relations';
  idx++;

  // Description (next row, can have HTML)
  let description = '';
  if (rows[idx] && rows[idx].children.length > 0) {
    description = rows[idx].innerHTML.trim();
    idx++;
  }

  // Market section (usually 3 rows: title, date, content)
  let marketTitle = '';
  let marketDate = '';
  let marketContent = '';

  // Try to detect market block (often 2–3 consecutive rows)
  if (rows[idx] && rows[idx].children.length >= 1) {
    marketTitle = rows[idx].children[0]?.textContent?.trim() || '';
    idx++;
  }
  if (rows[idx] && rows[idx].children.length >= 1) {
    marketDate = rows[idx].children[0]?.textContent?.trim() || '';
    idx++;
  }
  if (rows[idx] && rows[idx].children.length >= 1) {
    marketContent = rows[idx].innerHTML.trim();
    idx++;
  }

  // CTA (usually one row with text + link)
  let ctaText = '';
  let ctaLink = '#';

  if (rows[idx] && rows[idx].children.length >= 2) {
    ctaText = rows[idx].children[0]?.textContent?.trim() || '';
    const linkCell = rows[idx].children[1];
    ctaLink = linkCell?.querySelector('a')?.href || linkCell?.textContent?.trim() || '#';
    idx++;
  } else if (rows[idx] && rows[idx].children.length >= 1) {
    ctaText = rows[idx].children[0]?.textContent?.trim() || '';
    idx++;
  }

  // Stats: collect remaining rows (up to 6), each as full innerHTML
  const stats = [];
  for (let i = idx; i < rows.length && stats.length < 6; i++) {
    const statHTML = rows[i]?.innerHTML?.trim();
    if (statHTML) {
      stats.push(statHTML);
    }
  }

  // Build structure
  block.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'gal-investor-wrapper';

  wrapper.innerHTML = `
    <div class="gal-left">
      <h2>${title}</h2>
      
      ${description ? `<div class="gal-desc">${description}</div>` : ''}

      ${(marketTitle || marketDate || marketContent) ? `
        <div class="gal-market">
          <div class="market-header">
            ${marketTitle ? `<span class="market-title">${marketTitle}</span>` : ''}
            ${marketDate ? `<span class="market-date">${marketDate}</span>` : ''}
          </div>
          ${marketContent ? `<div class="market-body">${marketContent}</div>` : ''}
        </div>
      ` : ''}

      ${ctaText ? `<a class="gal-cta" href="${ctaLink}">${ctaText}</a>` : ''}
    </div>

    <div class="gal-right">
      ${stats
        .map(stat => `<div class="gal-stat-card">${stat}</div>`)
        .join('')}
      
      ${Array(Math.max(0, 6 - stats.length))
        .fill('')
        .map(() => `<div class="gal-stat-card gal-stat-placeholder"></div>`)
        .join('')}
    </div>
  `;

  block.appendChild(wrapper);
}