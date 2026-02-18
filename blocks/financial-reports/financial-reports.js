export default function decorate(block) {
  const rows = [...block.children];

  if (!rows.length) {
    block.innerHTML = '<p>No content configured.</p>';
    return;
  }

  /* ===============================
     CONFIG ROW
  =============================== */
  const configCells = [...rows[0].children];

  const sectionTitle =
    (configCells[0]?.textContent || '').trim() || 'Financial Reports';

  /* ✅ AEM-SAFE DESCRIPTION FIX */
  let sectionDescriptionHTML = '';
  if (configCells[1]) {
    const descCell = configCells[1];
    const hasText = descCell.textContent
      ?.replace(/\u00A0/g, '')
      .trim();

    if (hasText) {
      sectionDescriptionHTML = descCell.innerHTML;
    }
  }

  const tab1Text =
    (configCells[2]?.textContent || '').trim() || 'GMR Airports Limited';

  const tab2Text =
    (configCells[3]?.textContent || '').trim() ||
    'GMR Power & Urban Infra Ltd.';

  const ctaText =
    (configCells[4]?.textContent || '').trim() || 'View All Reports';

  const ctaLink =
    (configCells[5]?.textContent || '').trim() || '#';

  /* ===============================
     COLLECT CARDS
  =============================== */
  const companyCards = {
    airport: [],
    infra: [],
  };

  for (let i = 1; i < rows.length; i++) {
    const cells = [...rows[i].children];
    if (cells.length < 2) continue;

    const companyCell =
      (cells[0]?.textContent || '').trim().toLowerCase();

    const isInfra =
      companyCell.includes('infra') ||
      companyCell.includes('power') ||
      companyCell.includes('urban') ||
      companyCell.includes('gpuil') ||
      companyCell.includes('pui');

    const companyKey = isInfra ? 'infra' : 'airport';

    for (let j = 0; j < 3; j++) {
      const titleCell = cells[1 + j * 2];
      const linkCell = cells[2 + j * 2];

      const title = (titleCell?.textContent || '').trim();
      let link = (linkCell?.textContent || '').trim();

      const aTag = linkCell?.querySelector('a');
      if (aTag?.href) {
        link = aTag.href;
      }

      if (title && link && link !== '#') {
        companyCards[companyKey].push({ title, link });
      }
    }
  }

  /* ===============================
     DEDUPE
  =============================== */
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

  /* ===============================
     BUILD HTML
  =============================== */
  block.innerHTML = `
    <div class="financial-wrapper">
      <h2>${sectionTitle}</h2>

      ${sectionDescriptionHTML ? `
        <div class="financial-desc">
          ${sectionDescriptionHTML}
        </div>
      ` : ''}

      <div class="financial-tabs" role="tablist">
        <button class="tab active" role="tab" data-company="airport">
          ${tab1Text}
        </button>
        <button class="tab" role="tab" data-company="infra">
          ${tab2Text}
        </button>
      </div>

      <div class="financial-cards"></div>

      <div class="financial-cta">
        <a href="${ctaLink}" class="cta-btn">${ctaText}</a>
      </div>
    </div>
  `;

  const cardsContainer = block.querySelector('.financial-cards');

  /* ===============================
     RENDER CARDS
  =============================== */
  function renderCards(type) {
    const cards = companyCards[type] || [];

    if (!cards.length) {
      cardsContainer.innerHTML =
        '<p class="no-reports">No reports available for this company yet.</p>';
      return;
    }

    cardsContainer.innerHTML = cards
      .map(card => `
        <a class="financial-card"
           href="${card.link}"
           target="_blank"
           rel="noopener">
          <h3>${card.title}</h3>
          <span>VIEW NOW &gt;</span>
        </a>
      `)
      .join('');
  }

  /* ===============================
     INIT + TAB HANDLERS
  =============================== */
  renderCards('airport');

  block.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      block.querySelectorAll('.tab')
        .forEach(t => t.classList.remove('active'));

      tab.classList.add('active');
      renderCards(tab.dataset.company);
    });
  });
}




