export default function decorate(block) {
  // 1. Find authored slide items (adjust selector to your reality)
  const items = [...block.children].filter((child) => {
    return (
      child.tagName === 'DIV' &&
      child.children.length >= 4 &&
      child.querySelector('img, picture')
    );
  });

  if (items.length === 0) {
    console.warn('No leadership message items found in block');
    return;
  }

  // 2. Extract data
  const slidesData = items.map((item) => {
    const cells = [...item.children];
    if (cells.length < 4) return null;

    return {
      image: cells[0].innerHTML.trim(),              
      subtitle: cells[1].textContent.trim(),
      message: cells[2].innerHTML.trim(),
      designation: cells[3].textContent.trim(),
    };
  }).filter(Boolean);

  if (slidesData.length === 0) return;

  block.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'mfl-container';

  container.innerHTML = `
    <div class="mfl-slider">
      <div class="mfl-slides"></div>
      <div class="mfl-navigation">
        <button class="mfl-prev" aria-label="Previous slide">←</button>
        <button class="mfl-next" aria-label="Next slide">→</button>
      </div>
    </div>
  `;

  block.append(container);
  block.classList.add('mfl-decorated');

  const slidesWrapper = container.querySelector('.mfl-slides');
  const prevBtn = container.querySelector('.mfl-prev');
  const nextBtn = container.querySelector('.mfl-next');

  slidesData.forEach((data, idx) => {
    const slide = document.createElement('div');
    slide.className = 'mfl-slide';
    if (idx === 0) slide.classList.add('active');

    slide.innerHTML = `
      <div class="mfl-card">
        <div class="mfl-image">${data.image}</div>
        <div class="mfl-content">
          <h2 class="mfl-title">Message from Leadership</h2>
          <h4 class="mfl-subtitle">${data.subtitle}</h4>
          <div class="mfl-message">${data.message}</div>
          <div class="mfl-author">${data.designation}</div>
        </div>
      </div>
    `;
    slidesWrapper.appendChild(slide);
  });

  let current = 0;
  const slides = slidesWrapper.children;

  function showSlide(idx) {
    [...slides].forEach((s, i) => {
      s.classList.toggle('active', i === idx);
    });
  }

  prevBtn.addEventListener('click', () => {
    current = (current - 1 + slides.length) % slides.length;
    showSlide(current);
  });

  nextBtn.addEventListener('click', () => {
    current = (current + 1) % slides.length;
    showSlide(current);
  });

  showSlide(0);


}