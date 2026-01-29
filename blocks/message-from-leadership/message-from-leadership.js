import { loadCSS, loadScript } from '../../../scripts/aem.js';

const SWIPER_JS = '../../../scripts/swiper-bundle.min.js';
const SWIPER_CSS = '../../../styles/swiper-bundle.min.css';

export default async function decorate(block) {
  const isAuthorMode =
    document.body.classList.contains('aem-AuthorLayer-Edit') ||
    window.location.search.includes('wcmmode=edit');

  const items = [...block.children].filter((child) => {
    return (
      child.tagName === 'DIV' &&
      child.children.length >= 4 &&
      child.querySelector('img, picture')
    );
  });

  if (!items.length) return;

  /* ================================
     READ AUTHORED CONTENT
  ================================ */
  const slidesData = items
    .map((item) => {
      const cells = [...item.children];
      if (cells.length < 4) return null;

      return {
        image: cells[0].innerHTML.trim(),
        subtitle: cells[1].textContent.trim(),
        message: cells[2].innerHTML.trim(),
        designation: cells[3].textContent.trim(),
      };
    })
    .filter(Boolean);

  /* ================================
     HIDE AUTHORED CONTENT (NOT DELETE)
  ================================ */
  block.classList.add('mfl-initialized');

  /* ================================
     BUILD RUNTIME SWIPER
  ================================ */
  const container = document.createElement('div');
  container.className = 'mfl-runtime';

  container.innerHTML = `
    <div class="swiper mfl-swiper">
      <div class="swiper-wrapper"></div>

      <div class="swiper-pagination"></div>
      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>
    </div>
  `;

  block.append(container);

  const swiperWrapper = container.querySelector('.swiper-wrapper');

  slidesData.forEach((data) => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';

    slide.innerHTML = `
      <div class="mfl-card">
        <div class="mfl-image">${data.image}</div>

        <div class="mfl-content">
          <h2 class="mfl-title">${data.subtitle || 'Message From Leadership'}</h2>
          <div class="mfl-message">${data.message}</div>
          <div class="mfl-author">${data.designation}</div>
        </div>
      </div>
    `;

    swiperWrapper.appendChild(slide);
  });

  /* ================================
     DO NOT INIT SWIPER IN EDIT MODE
  ================================ */
  if (isAuthorMode) return;

  await loadCSS(SWIPER_CSS);
  await loadScript(SWIPER_JS);

  new Swiper(container.querySelector('.mfl-swiper'), {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    pagination: {
      el: container.querySelector('.swiper-pagination'),
      clickable: true,
    },
    navigation: {
      nextEl: container.querySelector('.swiper-button-next'),
      prevEl: container.querySelector('.swiper-button-prev'),
    },
  });
}

