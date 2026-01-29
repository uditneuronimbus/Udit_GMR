export default function decorate(block) {
  const isAuthorMode =
    document.body.classList.contains('aem-AuthorLayer-Edit') ||
    window.location.search.includes('wcmmode=edit');

  const rows = [...block.children];
  if (!rows.length) return;

  /* ================================
     READ SECTION TITLE
  ================================ */
  const sectionTitle =
    rows[0].querySelector('p')?.textContent?.trim() ||
    'Group Holding Board';

  /* ================================
     READ CARD DATA
  ================================ */
  const cards = rows.slice(1)
    .map((row) => {
      const cells = [...row.children];
      if (cells.length < 5) return null;

      return {
        image: cells[0].innerHTML.trim(),
        title: cells[1].textContent.trim(),
        subtitle: cells[2].innerHTML.trim(),
        actionText: cells[3].textContent.trim() || 'READ PROFILE',
        actionLink: cells[4].querySelector('a')?.getAttribute('href') || '#',
      };
    })
    .filter(Boolean);

  if (!cards.length) return;

  /* ================================
     STOP HERE IN EDIT MODE
     (PREVENT DUPLICATION)
  ================================ */
  if (isAuthorMode) return;

  /* ================================
     HIDE AUTHORED CONTENT
  ================================ */
  block.classList.add('leadership-initialized');

  /* ================================
     BUILD RUNTIME UI
  ================================ */
  const section = document.createElement('section');
  section.className = 'leadership-runtime';

  section.innerHTML = `
    <h2 class="leadership-title">${sectionTitle}</h2>

    <div class="leadership-grid">
      ${cards
        .map(
          (card) => `
        <article class="leader-card">
          <div class="leader-image">
            ${card.image}
          </div>

          <div class="leader-content">
            <h3 class="leader-name">${card.title}</h3>
            <div class="leader-role">${card.subtitle}</div>
            <a href="${card.actionLink}" class="leader-link">
              ${card.actionText} <span>›</span>
            </a>
          </div>
        </article>
      `
        )
        .join('')}
    </div>
  `;

  block.append(section);
}
