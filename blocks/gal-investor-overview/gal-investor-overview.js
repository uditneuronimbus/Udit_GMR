export default function decorate(block) {
  const rows = [...block.children].filter(
    (row) => row.children.length && row.textContent.trim()
  );

  if (!rows.length) {
    block.innerHTML = '<p>No content configured.</p>';
    return;
  }

  let cursor = 0;

  // TITLE
  const title = rows[cursor]?.children[0]?.textContent.trim() || 'Investor Relations';
  cursor++;

  // DESCRIPTION (optional)
  let description = '';
  if (rows[cursor] && rows[cursor].children.length === 1) {
    description = rows[cursor].innerHTML.trim();
    cursor++;
  }

  // ──────────────────────────────────────────────
  // MARKET SECTION ─ only if ≥ 2 single-cell rows
  // ──────────────────────────────────────────────
  let marketTitle = '';
  let marketDate = '';
  let marketContent = '';

  if (
    cursor < rows.length &&
    rows[cursor].children.length === 1 &&
    cursor + 1 < rows.length &&
    rows[cursor + 1].children.length === 1 &&
    !rows[cursor].querySelector('a') &&
    !rows[cursor + 1].querySelector('a')
  ) {
    marketTitle = rows[cursor].textContent.trim();
    cursor++;

    marketDate = rows[cursor].textContent.trim();
    cursor++;

    if (
      cursor < rows.length &&
      rows[cursor].children.length === 1 &&
      !rows[cursor].querySelector('a')
    ) {
      marketContent = rows[cursor].innerHTML.trim();
      cursor++;
    }
  }

  // CTA
  let ctaText = '';
  let ctaLink = '#';

  if (rows[cursor]) {
    const cells = [...rows[cursor].children];
    const hasLink = rows[cursor].querySelector('a');

    if (cells.length >= 2 || hasLink) {
      ctaText = cells[0]?.textContent.trim() || '';
      ctaLink =
        cells[1]?.querySelector('a')?.href ||
        hasLink?.href ||
        cells[1]?.textContent.trim() ||
        '#';
      cursor++;
    }
  }

  // STATS
  const stats = [];
  for (let i = cursor; i < rows.length && stats.length < 6; i++) {
    const html = rows[i].innerHTML.trim();
    if (html) stats.push(html);
  }

  // BUILD DOM (unchanged)
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
      ${stats.map(stat => `
        <div class="gal-stat-card">${stat}</div>
      `).join('')}

      ${Array(Math.max(0, 6 - stats.length))
        .fill('')
        .map(() => `<div class="gal-stat-card gal-stat-placeholder"></div>`)
        .join('')}
    </div>
  `;

  block.appendChild(wrapper);
}