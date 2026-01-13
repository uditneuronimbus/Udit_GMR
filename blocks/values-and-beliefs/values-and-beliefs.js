export default function decorate(block) {
    const rows = [...block.children];
  
    const sectionTitle = rows[0]?.textContent?.trim();
  
    const cardRows = rows.slice(1);
  
    block.innerHTML = '';
  
    const section = document.createElement('div');
    section.className = 'values-section';
  
    if (sectionTitle) {
      const title = document.createElement('h2');
      title.className = 'values-title';
      title.textContent = sectionTitle;
      section.appendChild(title);
    }
  
    const cardsWrapper = document.createElement('div');
    cardsWrapper.className = 'values-cards';
  
    cardRows.forEach((row) => {
      const cells = [...row.children];
      if (cells.length < 4) return;
  
      const picture = cells[0].querySelector('picture');
      const titleText = cells[1].textContent.trim();
      const descriptionHTML = cells[2].innerHTML;
      const authorText = cells[3].textContent.trim();
  
      const card = document.createElement('div');
      card.className = 'value-card';
  
      const imageWrap = document.createElement('div');
      imageWrap.className = 'value-card-image';
      if (picture) imageWrap.appendChild(picture);
  
      const overlay = document.createElement('div');
      overlay.className = 'value-card-overlay';
      overlay.innerHTML = `<span>${titleText}</span>`;
  
      imageWrap.appendChild(overlay);
  
      const content = document.createElement('div');
      content.className = 'value-card-content';
      content.innerHTML = `
        <h3>${titleText}</h3>
        <div class="quote">${descriptionHTML}</div>
        <p class="author">${authorText}</p>
      `;
  
      card.append(imageWrap, content);
      cardsWrapper.appendChild(card);
    });
  
    section.appendChild(cardsWrapper);
    block.appendChild(section);
  }