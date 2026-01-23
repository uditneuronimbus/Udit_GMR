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
          <h2 class="mfl-title">Message From Leadership</h2>
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



// export default function decorate(block) {
//   const rows = [...block.children];

//   if (!rows.length) return;

//   /* ===============================
//      1. CONFIG ROW (TITLE)
//   =============================== */
//   const title =
//     rows[0]?.textContent?.trim() || 'Message From Leadership';

//   /* ===============================
//      2. SLIDE ITEMS
//   =============================== */
//   const items = rows.slice(1).filter((row) => {
//     return (
//       row.children.length >= 4 &&
//       row.querySelector('img, picture')
//     );
//   });

//   if (!items.length) {
//     console.warn('No leadership message items found');
//     return;
//   }

//   const slidesData = items.map((item) => {
//     const cells = [...item.children];

//     return {
//       image: cells[0].innerHTML.trim(),
//       subtitle: cells[1].textContent.trim(),
//       message: cells[2].innerHTML.trim(),
//       designation: cells[3].textContent.trim(),
//     };
//   });

//   /* ===============================
//      3. CLEAR & BUILD MARKUP
//   =============================== */
//   block.innerHTML = '';
//   block.classList.add('mfl-decorated');

//   const container = document.createElement('div');
//   container.className = 'mfl-container';

//   container.innerHTML = `
//     <h2 class="mfl-title">${title}</h2>

//     <div class="mfl-slider">
//       <div class="mfl-slides"></div>

//       <div class="mfl-navigation">
//         <button class="mfl-prev" aria-label="Previous slide">←</button>
//         <button class="mfl-next" aria-label="Next slide">→</button>
//       </div>
//     </div>
//   `;

//   block.append(container);

//   const slidesWrapper = container.querySelector('.mfl-slides');
//   const prevBtn = container.querySelector('.mfl-prev');
//   const nextBtn = container.querySelector('.mfl-next');

//   /* ===============================
//      4. RENDER SLIDES
//   =============================== */
//   slidesData.forEach((data, idx) => {
//     const slide = document.createElement('div');
//     slide.className = 'mfl-slide';
//     if (idx === 0) slide.classList.add('active');

//     slide.innerHTML = `
//       <div class="mfl-card">
//         <div class="mfl-image">${data.image}</div>

//         <div class="mfl-content">
//           <h4 class="mfl-subtitle">${data.subtitle}</h4>
//           <div class="mfl-message">${data.message}</div>
//           <div class="mfl-author">${data.designation}</div>
//         </div>
//       </div>
//     `;

//     slidesWrapper.appendChild(slide);
//   });

//   /* ===============================
//      5. SLIDER LOGIC
//   =============================== */
//   let current = 0;
//   const slides = [...slidesWrapper.children];

//   function showSlide(index) {
//     slides.forEach((slide, i) => {
//       slide.classList.toggle('active', i === index);
//     });
//   }

//   prevBtn.addEventListener('click', () => {
//     current = (current - 1 + slides.length) % slides.length;
//     showSlide(current);
//   });

//   nextBtn.addEventListener('click', () => {
//     current = (current + 1) % slides.length;
//     showSlide(current);
//   });

//   showSlide(0);
// }
