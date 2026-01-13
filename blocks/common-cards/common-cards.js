export default function decorate(block) {
    // ===== Read authorable content from existing DOM =====
    const rows = [...block.children];
  
    // Section title (parent model)
    const sectionTitle =
      rows[0]?.querySelector("p")?.textContent?.trim() ||
      "Group Holding Board";
  
    // Card items (child models)
    const cards = rows.slice(1).map((row) => {
      const image = row.querySelector("img")?.getAttribute("src") || "";
      const title = row.querySelector('[data-aue-prop="cardTitle"]')?.textContent?.trim() || "";
      const subtitle = row.querySelector('[data-aue-prop="subTitle"]')?.innerHTML || "";
      const actionText = row.querySelector('[data-aue-prop="actionText"]')?.textContent?.trim() || "READ PROFILE";
      const actionLink = row.querySelector('[data-aue-prop="actionLink"]')?.textContent?.trim() || "#";
  
      return { image, title, subtitle, actionText, actionLink };
    });
  
    block.innerHTML = "";
  
    const section = document.createElement("section");
    section.className = "leadership-section";
  
    section.innerHTML = `
      <h2 class="leadership-title">${sectionTitle}</h2>
      <div class="leadership-grid">
        ${cards
          .map(
            (card) => `
          <article class="leader-card">
            <div class="leader-image">
              <img src="${card.image}" alt="${card.title}" loading="lazy" />
            </div>
  
            <div class="leader-content">
              <h3 class="leader-name">${card.title}</h3>
              <div class="leader-role">${card.subtitle}</div>
              <a href="${card.actionLink}" class="leader-link">
                ${card.actionText} <span>›</span>
              </a>
            </div>
          </article>
        `
          )
          .join("")}
      </div>
    `;
  
    block.appendChild(section);
  }