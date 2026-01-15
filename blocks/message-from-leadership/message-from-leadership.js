export default function decorate(block) {
  const runtime = block.querySelector('.mfl-runtime');
  if (!runtime) return;

  const slidesWrapper = runtime.querySelector('.mfl-slides');
  const prevBtn = runtime.querySelector('.mfl-prev');
  const nextBtn = runtime.querySelector('.mfl-next');

  const items = [...block.children].filter(
    (child) => child.dataset?.aueModel === 'message-from-leadership-item'
  );

  if (!items.length) return;

  items.forEach((item) => {
    const cells = [...item.children];
    if (cells.length < 4) return;

    const image = cells[0].querySelector('img');
    const subtitle = cells[1].textContent.trim();
    const message = cells[2].innerHTML;
    const designation = cells[3].textContent.trim();

    const slide = document.createElement('div');
    slide.className = 'mfl-slide';

    slide.innerHTML = `
      <div class="mfl-card">
        <div class="mfl-image">
          ${image ? image.outerHTML : ''}
        </div>

        <div class="mfl-content">
          <h2 class="mfl-title">Message from Leadership</h2>
          <h4 class="mfl-subtitle">${subtitle}</h4>
          <div class="mfl-message">${message}</div>
          <div class="mfl-author">${designation}</div>

          <div class="mfl-nav">
            <button class="mfl-prev" aria-label="Previous">&#8592;</button>
            <button class="mfl-next" aria-label="Next">&#8594;</button>
          </div>
        </div>
      </div>
    `;

    slidesWrapper.append(slide);
  });

  let index = 0;
  const slides = [...slidesWrapper.children];

  function update() {
    slides.forEach((slide, i) => {
      slide.style.display = i === index ? 'block' : 'none';
    });
  }

  runtime.addEventListener('click', (e) => {
    if (e.target.classList.contains('mfl-prev')) {
      index = (index - 1 + slides.length) % slides.length;
      update();
    }

    if (e.target.classList.contains('mfl-next')) {
      index = (index + 1) % slides.length;
      update();
    }
  });

  update();
}
