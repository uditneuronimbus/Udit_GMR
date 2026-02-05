export default function decorate(block) {
  const cols = [...block.children];

  const heading = cols[0]?.textContent.trim();
  const content = cols[1]?.innerHTML.trim();

  block.innerHTML = `
    <div class="media-contact-wrapper">
      <div class="media-contact-header">
        <h2>${heading || ""}</h2>
        <div class="media-contact-content">
          ${content || ""}
        </div>
      </div>
    </div>
  `;
}
