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

    const picture = cells[0].querySelector('picture') || cells[0].querySelector('img');
    const titleText  = cells[1].textContent.trim();
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

    overlay.addEventListener('click', () => {
      card.classList.toggle('active');
    });

    cardsWrapper.appendChild(card);
  });

  section.appendChild(cardsWrapper);
  block.appendChild(section);
}