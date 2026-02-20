export default function decorate(block) {
  const isAuthorMode =
    document.body.classList.contains('aem-AuthorLayer-Edit') ||
    window.location.search.includes('wcmmode=edit');

  if (isAuthorMode) return;

  const rows = [...block.children];
  if (!rows.length) return;

  /* ===============================
     1️⃣ Section Title + Description
  =============================== */

  const sectionTitle =
    rows[0]?.querySelector('h1,h2,h3,h4,h5,h6')?.textContent?.trim() || '';

  const sectionDescription =
    rows[0]?.querySelector('p')?.innerHTML || '';

  /* ===============================
     2️⃣ FAQ Items (Rest of rows)
  =============================== */

  const faqItems = rows.slice(1).map((row) => {
    const question =
      row.querySelector('h1,h2,h3,h4,h5,h6')?.textContent?.trim() || '';

    const answer =
      row.querySelector('p, div')?.innerHTML || '';

    return { question, answer };
  });

  /* ===============================
     3️⃣ Generate HTML
  =============================== */

  block.innerHTML = `
    <section class="career-faqs">
      <div class="career-faqs__container">

        ${
          sectionTitle
            ? `<h2 class="career-faqs__title">${sectionTitle}</h2>`
            : ''
        }

        ${
          sectionDescription
            ? `<div class="career-faqs__desc">${sectionDescription}</div>`
            : ''
        }

        <div class="career-faqs__accordion">
          ${faqItems
            .map(
              (item, index) => `
            <div class="career-faqs__item">
              <button class="career-faqs__question" aria-expanded="false">
                <span>${item.question}</span>
                <span class="career-faqs__icon">+</span>
              </button>
              <div class="career-faqs__answer">
                ${item.answer}
              </div>
            </div>
          `
            )
            .join('')}
        </div>

      </div>
    </section>
  `;

  /* ===============================
     4️⃣ Accordion Functionality
  =============================== */

  const items = block.querySelectorAll('.career-faqs__item');

  items.forEach((item) => {
    const button = item.querySelector('.career-faqs__question');
    const answer = item.querySelector('.career-faqs__answer');
    const icon = item.querySelector('.career-faqs__icon');

    button.addEventListener('click', () => {
      const isOpen = button.getAttribute('aria-expanded') === 'true';

      // Close all
      items.forEach((el) => {
        el.querySelector('.career-faqs__question')
          .setAttribute('aria-expanded', 'false');
        el.querySelector('.career-faqs__answer')
          .classList.remove('is-open');
        el.querySelector('.career-faqs__icon').textContent = '+';
      });

      // Open current
      if (!isOpen) {
        button.setAttribute('aria-expanded', 'true');
        answer.classList.add('is-open');
        icon.textContent = '–';
      }
    });
  });
}
