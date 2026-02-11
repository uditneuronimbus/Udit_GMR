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




export default function decorate(block) {
  const jsonScript = block.querySelector('script[type="application/json"]');
  if (!jsonScript) {
    console.warn('FAQ Block: No JSON script found');
    return; 
  }

  let rawData;
  try {
    rawData = JSON.parse(jsonScript.textContent);
  } catch (e) {
    console.error('FAQ JSON parse error', e);
    return;
  }

  // Handle cases where data might be nested inside .data or .model
  const data = rawData.data || rawData;
  
  // Look for the array in common Franklin locations
  const faqs = data.items || data['career-faqs-item'] || [];

  block.innerHTML = '';

  // Render Title
  if (data.sectionTitle) {
    const title = document.createElement('h2');
    title.textContent = data.sectionTitle;
    block.append(title);
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'faq-wrapper';

  faqs.forEach((faq) => {
    // Ensure we have data before rendering
    if (!faq.title) return;

    const item = document.createElement('div');
    item.className = 'faq-item';

    item.innerHTML = `
      <button class="faq-question" aria-expanded="false">
        <span>${faq.title}</span>
        <span class="faq-icon">+</span>
      </button>
      <div class="faq-answer">
        <div class="faq-answer-content">${faq.answer || ''}</div>
      </div>
    `;

    const header = item.querySelector('.faq-question');
    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      
      // Close others (Accordion effect)
      block.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('active');
        i.querySelector('button').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
      }
    });

    wrapper.append(item);
  });

  block.append(wrapper);
}





