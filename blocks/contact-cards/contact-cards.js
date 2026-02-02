export default function decorate(block) {
  const rows = [...block.children];
  block.innerHTML = "";

  if (!rows.length) return;

  /* Heading */
  const headingText = rows[0]?.textContent?.trim();

  const section = document.createElement("section");
  section.className = "contact-cards";

  const container = document.createElement("div");
  container.className = "container";

  if (headingText) {
    const heading = document.createElement("p");
    heading.className = "contact-cards-heading";
    heading.textContent = headingText;
    container.append(heading);
  }

  /* Cards wrapper */
  const cardsWrap = document.createElement("div");
  cardsWrap.className = "contact-cards-grid";

  rows.slice(1).forEach((row) => {
    const cols = [...row.children];
    if (cols.length < 3) return;

    const [nameCol, titleCol, emailCol] = cols;

    const card = document.createElement("div");
    card.className = "contact-card";

    card.innerHTML = `
      <h4 class="contact-name">${nameCol.textContent.trim()}</h4>
      <p class="contact-title">${titleCol.textContent.trim()}</p>
      <a class="contact-email" href="mailto:${emailCol.textContent.trim()}">
        <span class="email-icon"></span>
        ${emailCol.textContent.trim()}
      </a>
    `;

    cardsWrap.append(card);
  });

  container.append(cardsWrap);
  section.append(container);
  block.append(section);
}
