import { loadCSS, loadScript } from '../../../scripts/aem.js';

const SWIPER_JS = 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js';
const SWIPER_CSS = 'https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css';

export default async function decorate(block) {
  // 🔒 Prevent double execution
  if (block.classList.contains('internal-slider-initialized')) return;
  block.classList.add('internal-slider-initialized');

  const isAuthorMode =
    document.body.classList.contains('aem-AuthorLayer-Edit') ||
    window.location.search.includes('wcmmode=edit');

  /* ================================
     1️⃣ Read Section Model Data
  ================================== */
  const eyebrowText = block.dataset.eyebrowtext || '';
  const sectionTitle = block.dataset.sectiontitle || '';
  const sectionSubtitle = block.dataset.sectionsubtitle || '';

  /* ================================
     2️⃣ Collect Authored Slide Items
  ================================== */
  const rows = [...block.children].filter(
    (row) => row.tagName === 'DIV' && row.children.length >= 4
  );

  if (!rows.length) return;

  const slidesData = rows
    .map((row) => {
      const cols = [...row.children];

      return {
        badgeText: cols[0]?.textContent?.trim() || '',
        slideTitle: cols[1]?.textContent?.trim() || '',
        slideDescription: cols[2]?.innerHTML || '',
        slideImage: cols[3]?.querySelector('img')?.outerHTML || '',
        slideIndex: cols[4]?.textContent?.trim() || '',
      };
    })
    .filter(Boolean);

  /* ================================
     3️⃣ Hide Authored Content (DO NOT DELETE)
  ================================== */
  rows.forEach((row) => {
    row.style.display = 'none';
  });

  /* ================================
     4️⃣ Create Runtime Wrapper
  ================================== */
  const wrapper = document.createElement('div');
  wrapper.className = 'internal-slider-wrapper';

  /* ================================
     5️⃣ Section Header
  ================================== */
  const header = document.createElement('div');
  header.className = 'internal-slider-header';

  header.innerHTML = `
    ${eyebrowText ? `<span class="internal-slider-eyebrow">${eyebrowText}</span>` : ''}
    ${sectionTitle ? `<h2 class="internal-slider-title">${sectionTitle}</h2>` : ''}
    ${sectionSubtitle ? `<p class="internal-slider-subtitle">${sectionSubtitle}</p>` : ''}
  `;

  wrapper.appendChild(header);

  /* ================================
     6️⃣ Swiper Markup
  ================================== */
  const sliderContainer = document.createElement('div');
  sliderContainer.className = 'internal-slider-container';

  sliderContainer.innerHTML = `
    <div class="swiper internal-swiper">
      <div class="swiper-wrapper"></div>

      <div class="internal-slider-navigation">
        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div>
      </div>

      <div class="swiper-pagination"></div>
    </div>
  `;

  wrapper.appendChild(sliderContainer);
  block.appendChild(wrapper);

  const swiperWrapper = sliderContainer.querySelector('.swiper-wrapper');

/* ================================
   7️⃣ Build Slides (Stable Odd/Even Logic)
================================== */
slidesData.forEach((slide, index) => {
  const slideEl = document.createElement('div');
  slideEl.className = 'swiper-slide';

  // If slideIndex exists use it
  // Otherwise fallback to loop index
  const numericIndex = slide.slideIndex
    ? parseInt(slide.slideIndex.replace(/\D/g, ''), 10)
    : index + 1;

  const isEven = numericIndex % 2 === 0;

  // Add layout class
  slideEl.classList.add(isEven ? 'layout-even' : 'layout-odd');

  const contentHTML = `
    <div class="internal-slide-content">
      ${slide.badgeText ? `<span class="internal-slide-badge">${slide.badgeText}</span>` : ''}
      ${slide.slideIndex ? `<span class="internal-slide-index">${slide.slideIndex}</span>` : ''}
      ${slide.slideTitle ? `<h3 class="internal-slide-title">${slide.slideTitle}</h3>` : ''}
      ${slide.slideDescription ? `<div class="internal-slide-description">${slide.slideDescription}</div>` : ''}
    </div>
  `;

  const imageHTML = slide.slideImage
    ? `<div class="internal-slide-image">${slide.slideImage}</div>`
    : '';

  slideEl.innerHTML = `
    <div class="internal-slide ${isEven ? 'reverse-layout' : ''}">
      ${contentHTML}
      ${imageHTML}
    </div>
  `;

  swiperWrapper.appendChild(slideEl);
});


  /* ================================
     8️⃣ Do NOT Init Swiper in Edit Mode
  ================================== */
  if (isAuthorMode) return;

  /* ================================
     9️⃣ Load Swiper & Initialize
  ================================== */
  await loadCSS(SWIPER_CSS);
  await loadScript(SWIPER_JS);

  new Swiper(sliderContainer.querySelector('.internal-swiper'), {
    slidesPerView: 1,
    spaceBetween: 40,
    loop: true,

    navigation: {
      nextEl: sliderContainer.querySelector('.swiper-button-next'),
      prevEl: sliderContainer.querySelector('.swiper-button-prev'),
    },

    pagination: {
      el: sliderContainer.querySelector('.swiper-pagination'),
      clickable: true,
    },

    speed: 800,
  });
}
