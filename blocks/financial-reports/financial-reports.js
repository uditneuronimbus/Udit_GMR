export default function decorate(block) {
  const rows = [...block.children];

  if (rows.length === 0) {
    block.innerHTML = '<p>No content configured.</p>';
    return;
  }

  // First row = config
  const configCells = [...rows[0].children];

  const sectionTitle = (configCells[0]?.textContent || '').trim() || 'Financial Reports';

  // Description: take raw innerHTML to preserve formatting
  let sectionDescriptionHTML = '';
  if (configCells[1]) {
    sectionDescriptionHTML = configCells[1].innerHTML.trim();
  }

  const tab1Text = (configCells[2]?.textContent || '').trim() || 'GMR Airports Limited';
  const tab2Text = (configCells[3]?.textContent || '').trim() || 'GMR Power & Urban Infra Ltd.';
  const ctaText  = (configCells[4]?.textContent || '').trim() || 'View All Reports';
  const ctaLink  = (configCells[5]?.textContent || '').trim() || '#';

  // Collect cards from remaining rows
  const companyCards = { airport: [], infra: [] };

  for (let i = 1; i < rows.length; i++) {
    const cells = [...rows[i].children];
    if (cells.length < 2) continue;

    const companyCell = (cells[0]?.textContent || '').trim().toLowerCase();
    const isInfra = companyCell.includes('infra') || companyCell.includes('power') || companyCell.includes('urban') || companyCell.includes('gpuil') || companyCell.includes('pui');

    const companyKey = isInfra ? 'infra' : 'airport';

    // Parse up to 3 cards per row (title + link pairs)
    for (let j = 0; j < 3; j++) {
      const titleCell = cells[1 + j * 2];
      const linkCell = cells[2 + j * 2];

      const title = (titleCell?.textContent || '').trim();
      let link = (linkCell?.textContent || '').trim();

      // If link cell has <a>, get href instead of text
      const aTag = linkCell?.querySelector('a');
      if (aTag) {
        link = aTag.href || '#';
      }

      if (title && link !== '#') {  // require both title and valid link
        companyCards[companyKey].push({ title, link });
      }
    }
  }

  // Deduplicate
  const dedupe = (arr) => {
    const seen = new Set();
    return arr.filter(item => {
      const key = `${item.title}|${item.link}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  companyCards.airport = dedupe(companyCards.airport);
  companyCards.infra = dedupe(companyCards.infra);

  // Build main structure
  block.innerHTML = `
    <div class="financial-wrapper">
      <h2>${sectionTitle}</h2>

      ${sectionDescriptionHTML ? `
        <div class="financial-desc">
          ${sectionDescriptionHTML}
        </div>
      ` : ''}

      <div class="financial-tabs">
        <button class="tab active" data-company="airport">${tab1Text}</button>
        <button class="tab" data-company="infra">${tab2Text}</button>
      </div>

      <div class="financial-cards"></div>

      <div class="financial-cta">
        <a href="${ctaLink}" class="cta-btn">${ctaText}</a>
      </div>
    </div>
  `;

  const cardsContainer = block.querySelector('.financial-cards');

  function renderCards(type) {
    const cards = companyCards[type] || [];
    if (cards.length === 0) {
      cardsContainer.innerHTML = '<p class="no-reports">No reports available for this company yet.</p>';
      return;
    }

    cardsContainer.innerHTML = cards.map(card => `
      <a class="financial-card" href="${card.link}" target="_blank" rel="noopener">
        <h3>${card.title}</h3>
        <span>VIEW NOW ></span>
      </a>
    `).join('');
  }

  // Initial render
  renderCards('airport');

  // Tab switching
  block.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      block.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderCards(tab.dataset.company);
    });
  });

  // Optional: debug helper (remove in production)
  // console.log('Airport cards:', companyCards.airport);
  // console.log('Infra cards:', companyCards.infra);
}