export default function decorate(block) {
  /* ===============================
     1️⃣ Collect authored items FIRST
     =============================== */
  const items = [...block.children].filter(
    (child) => child.dataset?.aueModel === 'message-from-leadership-item'
  );

  if (!items.length) return;

  const slidesData = items.map((item) => {
    const cells = [...item.children];
    if (cells.length < 4) return null;

    return {
      image: cells[0].querySelector('img')?.outerHTML || '',
      subtitle: cells[1].textContent.trim(),
      message: cells[2].innerHTML,
      designation: cells[3].textContent.trim(),
    };
  }).filter(Boolean);

  /* ===============================
     2️⃣ Clear authored markup
     =============================== */
  block.innerHTML = '';

  /* ===============================
     3️⃣ Create runtime
     =============================== */
  const runtime = document.createElement('div');
  runtime.className = 'mfl-runtime';

  runtime.innerHTML = `
    <div class="mfl-container">
      <div class="mfl-slider">
        <div class="mfl-slides"></div>

        <div class="mfl-navigation">
          <button class="mfl-prev" aria-label="Previous">&#8592;</button>
          <button class="mfl-next" aria-label="Next">&#8594;</button>
        </div>
      </div>
    </div>
  `;

  block.append(runtime);
  block.classList.add('mfl-initialized');

  const slidesWrapper = runtime.querySelector('.mfl-slides');
  const prevBtn = runtime.querySelector('.mfl-prev');
  const nextBtn = runtime.querySelector('.mfl-next');

  /* ===============================
     4️⃣ Build slides
     =============================== */
  slidesData.forEach((data) => {
    const slide = document.createElement('div');
    slide.className = 'mfl-slide';

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

    slidesWrapper.append(slide);
  });

  /* ===============================
     5️⃣ Slider logic
     =============================== */
  const slides = [...slidesWrapper.children];
  let index = 0;

  function update() {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
  }

  prevBtn.addEventListener('click', () => {
    index = (index - 1 + slides.length) % slides.length;
    update();
  });

  nextBtn.addEventListener('click', () => {
    index = (index + 1) % slides.length;
    update();
  });

  update();
}
