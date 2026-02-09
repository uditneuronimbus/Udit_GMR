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
