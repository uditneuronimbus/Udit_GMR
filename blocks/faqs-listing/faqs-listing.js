export default function decorate(block) {
  let data = {};

  // read json from embedded script OR dataset
  try {
    const jsonScript = block.querySelector('script[type="application/json"]');
    if (jsonScript) {
      data = JSON.parse(jsonScript.textContent);
    }
  } catch (e) {
    console.error('FAQ JSON parse error', e);
  }

  const faqs = data?.faqs || [];

  block.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'faq-wrapper';

  faqs.forEach((faq, index) => {
    const item = document.createElement('div');
    item.className = 'faq-item';

    const header = document.createElement('button');
    header.className = 'faq-question';
    header.innerHTML = `
      <span>${faq.question}</span>
      <span class="faq-icon">+</span>
    `;

    const body = document.createElement('div');
    body.className = 'faq-answer';
    body.innerHTML = `<p>${faq.answer}</p>`;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // close all
      wrapper.querySelectorAll('.faq-item').forEach(el => {
        el.classList.remove('active');
      });

      if (!isOpen) {
        item.classList.add('active');
      }
    });

    item.append(header, body);
    wrapper.appendChild(item);
  });

  block.appendChild(wrapper);
}




// export default function decorate(block) {
//   const rows = [...block.children];

//   /* =============================
//      READ LIST FIELDS
//   ============================= */
//   const headerRow = rows.shift();
//   const [titleEl, descEl] = headerRow?.children || [];

//   block.innerHTML = '';

//   /* =============================
//      MAIN WRAPPER
//   ============================= */
//   const wrapper = document.createElement('div');
//   wrapper.className = 'career-faqs';

//   /* =============================
//      TITLE + DESCRIPTION
//   ============================= */
//   const content = document.createElement('div');
//   content.className = 'career-faqs__content';

//   if (titleEl?.innerHTML) {
//     const h2 = document.createElement('h2');
//     h2.innerHTML = titleEl.innerHTML;
//     content.appendChild(h2);
//   }

//   if (descEl?.innerHTML) {
//     const p = document.createElement('p');
//     p.innerHTML = descEl.innerHTML; // richtext
//     content.appendChild(p);
//   }

//   /* =============================
//      ACCORDION
//   ============================= */
//   const accordion = document.createElement('div');
//   accordion.className = 'career-faqs__accordion';

//   rows.forEach((row) => {
//     const [questionEl, answerEl] = row.children;
//     if (!questionEl || !answerEl) return;

//     const item = document.createElement('div');
//     item.className = 'career-faqs__item';

//     const question = document.createElement('button');
//     question.className = 'career-faqs__question';
//     question.innerHTML = `
//       <span>${questionEl.innerHTML}</span>
//       <span class="career-faqs__icon">+</span>
//     `;

//     const answer = document.createElement('div');
//     answer.className = 'career-faqs__answer';
//     answer.innerHTML = answerEl.innerHTML;

//     question.addEventListener('click', () => {
//       const isOpen = item.classList.contains('active');

//       accordion
//         .querySelectorAll('.career-faqs__item')
//         .forEach(el => el.classList.remove('active'));

//       if (!isOpen) item.classList.add('active');
//     });

//     item.append(question, answer);
//     accordion.appendChild(item);
//   });

//   wrapper.append(content, accordion);
//   block.appendChild(wrapper);
// }



