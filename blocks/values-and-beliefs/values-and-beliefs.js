export default function decorate(block) {
  const rows = [...block.children];
  const sectionTitle = rows[0]?.textContent?.trim() || 'Values & Beliefs';
  const cardRows = rows.slice(1);

  block.innerHTML = '';

  const section = document.createElement('div');
  section.className = 'values-section';

  const titleEl = document.createElement('h2');
  titleEl.className = 'values-title';
  titleEl.textContent = sectionTitle;
  section.appendChild(titleEl);

  const cardsWrapper = document.createElement('div');
  cardsWrapper.className = 'values-cards';

  cardRows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 4) return;

    const picture =
      cells[0].querySelector('picture') || cells[0].querySelector('img');
    const titleText = cells[1].textContent.trim();
    const descriptionHTML = cells[2].innerHTML.trim();
    const authorText = cells[3].textContent.trim();

    const card = document.createElement('div');
    card.className = 'value-card';

    const imgWrap = document.createElement('div');
    imgWrap.className = 'value-card-image';

    if (picture) imgWrap.appendChild(picture.cloneNode(true));

    const overlay = document.createElement('div');
    overlay.className = 'value-card-overlay';
    overlay.innerHTML = `<span>${titleText}</span><span class="icon"></span>`;

    const content = document.createElement('div');
    content.className = 'value-card-content';
    content.innerHTML = `
      <div class="quote">${descriptionHTML}</div>
      <p class="author">— ${authorText}</p>
    `;

    imgWrap.append(overlay, content);
    card.appendChild(imgWrap);

    /* ===============================
       OPEN (➕) — close others first
    ================================ */
    overlay.addEventListener('click', (e) => {
      e.stopPropagation();

      // close all other cards
      cardsWrapper
        .querySelectorAll('.value-card.active')
        .forEach((activeCard) => {
          if (activeCard !== card) {
            activeCard.classList.remove('active');
          }
        });

      // open this card
      card.classList.add('active');
    });

    /* ===============================
       CLOSE (➖ top-right hit area)
    ================================ */
    card.addEventListener('click', (e) => {
      if (!card.classList.contains('active')) return;

      const rect = card.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // minus icon hit area (top-right)
      if (clickX > rect.width - 44 && clickY < 44) {
        card.classList.remove('active');
      }
    });

    cardsWrapper.appendChild(card);
  });

  section.appendChild(cardsWrapper);
  block.appendChild(section);
}
