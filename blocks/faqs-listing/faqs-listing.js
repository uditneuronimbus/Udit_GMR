// export default function decorate(block) {
//   let data = {};

//   // read json from embedded script OR dataset
//   try {
//     const jsonScript = block.querySelector('script[type="application/json"]');
//     if (jsonScript) {
//       data = JSON.parse(jsonScript.textContent);
//     }
//   } catch (e) {
//     console.error('FAQ JSON parse error', e);
//   }

//   const faqs = data?.faqs || [];

//   block.innerHTML = '';

//   const wrapper = document.createElement('div');
//   wrapper.className = 'faq-wrapper';

//   faqs.forEach((faq, index) => {
//     const item = document.createElement('div');
//     item.className = 'faq-item';

//     const header = document.createElement('button');
//     header.className = 'faq-question';
//     header.innerHTML = `
//       <span>${faq.question}</span>
//       <span class="faq-icon">+</span>
//     `;

//     const body = document.createElement('div');
//     body.className = 'faq-answer';
//     body.innerHTML = `<p>${faq.answer}</p>`;

//     header.addEventListener('click', () => {
//       const isOpen = item.classList.contains('active');

//       // close all
//       wrapper.querySelectorAll('.faq-item').forEach(el => {
//         el.classList.remove('active');
//       });

//       if (!isOpen) {
//         item.classList.add('active');
//       }
//     });

//     item.append(header, body);
//     wrapper.appendChild(item);
//   });

//   block.appendChild(wrapper);
// }



export default async function decorate(block) {
  // Read section data from block dataset
  const sectionTitle = block.dataset.sectionTitle || 'Everything you Need to Know';
  const sectionDescription = block.dataset.sectionDescription || '';

  // Read FAQ items from child blocks (filtered)
  const itemBlocks = [...block.querySelectorAll(':scope > div')];
  if (!itemBlocks.length) return;

  const items = itemBlocks.map((itemBlock) => {
    return {
      title: itemBlock.dataset.title || '',
      answer: itemBlock.dataset.answer || ''
    };
  }).filter(item => item.title && item.answer);

  if (!items.length) return;

  // Clear original block
  block.innerHTML = '';

  /* ===============================
     MAIN WRAPPER
  =============================== */
  const wrapper = document.createElement('div');
  wrapper.className = 'faq-wrapper';

  /* ===============================
     HEADER (TITLE + DESCRIPTION)
  =============================== */
  const headerWrap = document.createElement('div');
  headerWrap.className = 'faq-header';

  if (sectionTitle) {
    const h2 = document.createElement('h2');
    h2.textContent = sectionTitle;
    headerWrap.appendChild(h2);
  }

  if (sectionDescription) {
    const p = document.createElement('p');
    p.innerHTML = sectionDescription;
    headerWrap.appendChild(p);
  }

  /* ===============================
     ACCORDION
  =============================== */
  const accordion = document.createElement('div');
  accordion.className = 'faq-accordion';

  items.forEach((itemData) => {
    const item = document.createElement('div');
    item.className = 'faq-item';

    const btn = document.createElement('button');
    btn.className = 'faq-question';
    btn.innerHTML = `
      <span>${itemData.title}</span>
      <span class="faq-icon">+</span>
    `;

    const body = document.createElement('div');
    body.className = 'faq-answer';
    body.innerHTML = itemData.answer;

    btn.addEventListener('click', () => {
      const open = item.classList.contains('active');

      accordion.querySelectorAll('.faq-item')
        .forEach(el => el.classList.remove('active'));

      if (!open) item.classList.add('active');
    });

    item.append(btn, body);
    accordion.appendChild(item);
  });

  wrapper.append(headerWrap, accordion);
  block.appendChild(wrapper);
}





