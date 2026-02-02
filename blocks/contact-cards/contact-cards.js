export default function decorate(block) {
  const config = block.querySelector(":scope > div");
  const items = [...block.querySelectorAll(":scope > .contact-cards-item")];

  const heading = config?.dataset?.heading;

  block.innerHTML = "";

  const section = document.createElement("section");
  section.className = "contact-cards";

  const container = document.createElement("div");
  container.className = "container";

  if (heading) {
    const h = document.createElement("p");
    h.className = "contact-cards-heading";
    h.textContent = heading;
    container.append(h);
  }

  const grid = document.createElement("div");
  grid.className = "contact-cards-grid";

  items.forEach((item) => {
    const { name, title, email } = item.dataset;

    if (!name || !email) return;

    const card = document.createElement("div");
    card.className = "contact-card";

    card.innerHTML = `
      <h4 class="contact-name">${name}</h4>
      <p class="contact-title">${title || ""}</p>
      <a class="contact-email" href="mailto:${email}">
        <span class="email-icon"></span>
        ${email}
      </a>
    `;

    grid.append(card);
  });

  container.append(grid);
  section.append(container);
  block.append(section);
}
