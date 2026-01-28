// export default function decorate(block) {
//   const items = [...block.children].filter((child) => {
//     return (
//       child.tagName === 'DIV' &&
//       child.children.length >= 4 &&
//       child.querySelector('img, picture')
//     );
//   });

//   if (!items.length) return;

//   const slidesData = items
//     .map((item) => {
//       const cells = [...item.children];
//       if (cells.length < 4) return null;

//       return {
//         image: cells[0].innerHTML.trim(),
//         subtitle: cells[1].textContent.trim(),
//         message: cells[2].innerHTML.trim(),
//         designation: cells[3].textContent.trim(),
//       };
//     })
//     .filter(Boolean);

//   block.innerHTML = '';

//   const container = document.createElement('div');
//   container.className = 'mfl-container';

//   container.innerHTML = `
//     <div class="mfl-slider">
//       <div class="mfl-slides"></div>
//     </div>
//   `;

//   block.append(container);

//   const slidesWrapper = container.querySelector('.mfl-slides');

//   slidesData.forEach((data, idx) => {
//     const slide = document.createElement('div');
//     slide.className = 'mfl-slide';
//     if (idx === 0) slide.classList.add('active');

//     slide.innerHTML = `
//       <div class="mfl-card">
//         <div class="mfl-image">${data.image}</div>

//         <div class="mfl-content">
//           <h2 class="mfl-title">Message From Leadership</h2>
//           <div class="mfl-message">${data.message}</div>
//           <div class="mfl-author">${data.designation}</div>

//           <!-- ✅ NAVIGATION MOVED INSIDE CONTENT -->
//           <div class="mfl-navigation">
//             <button class="mfl-prev" aria-label="Previous slide">←</button>
//             <button class="mfl-next" aria-label="Next slide">→</button>
//           </div>
//         </div>
//       </div>
//     `;

//     slidesWrapper.appendChild(slide);
//   });

//   let current = 0;
//   const slides = slidesWrapper.querySelectorAll('.mfl-slide');

//   function showSlide(idx) {
//     slides.forEach((s, i) => {
//       s.classList.toggle('active', i === idx);
//     });
//   }

//   slidesWrapper.addEventListener('click', (e) => {
//     if (!e.target.closest('button')) return;

//     if (e.target.classList.contains('mfl-prev')) {
//       current = (current - 1 + slides.length) % slides.length;
//     }

//     if (e.target.classList.contains('mfl-next')) {
//       current = (current + 1) % slides.length;
//     }

//     showSlide(current);
//   });

//   showSlide(0);
// }





export default function decorate(block) {
  if (block.classList.contains('mfl-initialized')) return;
  block.classList.add('mfl-initialized');

  const rows = [...block.children];
  if (!rows.length) return;

  const slides = rows
    .map((row) => {
      const cells = [...row.children];
      if (cells.length < 4) return null;

      const slide = document.createElement('div');
      slide.className = 'mfl-slide';

      slide.innerHTML = `
        <div class="mfl-card">
          <div class="mfl-image">${cells[0].innerHTML}</div>

          <div class="mfl-content">
            <h2 class="mfl-title">${cells[1].innerHTML}</h2>
            <div class="mfl-message">${cells[2].innerHTML}</div>
            <div class="mfl-author">${cells[3].innerHTML}</div>

            <div class="mfl-navigation">
              <button class="mfl-prev" aria-label="Previous slide">←</button>
              <button class="mfl-next" aria-label="Next slide">→</button>
            </div>
          </div>
        </div>
      `;

      return slide;
    })
    .filter(Boolean);

  block.innerHTML = `
    <div class="mfl-runtime">
      <div class="mfl-container">
        <div class="mfl-slider">
          <div class="mfl-slides"></div>
        </div>
      </div>
    </div>
  `;

  const slidesWrapper = block.querySelector('.mfl-slides');

  slides.forEach((slide, index) => {
    if (index === 0) slide.classList.add('active');
    slidesWrapper.appendChild(slide);
  });

  let current = 0;

  slidesWrapper.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const allSlides = slidesWrapper.querySelectorAll('.mfl-slide');

    if (btn.classList.contains('mfl-prev')) {
      current = (current - 1 + allSlides.length) % allSlides.length;
    }

    if (btn.classList.contains('mfl-next')) {
      current = (current + 1) % allSlides.length;
    }

    allSlides.forEach((slide, i) => {
      slide.classList.toggle('active', i === current);
    });
  });
}

