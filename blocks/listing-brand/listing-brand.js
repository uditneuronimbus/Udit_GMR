export default function decorate(block) {
  // Author label (from JSON model)
  const authorLabel = block.dataset.label;

  // Default label
  const labelText = authorLabel || "OUR BRANDS";

  // Clear block content
  block.innerHTML = "";

  // Create structure
  const container = document.createElement("section");
  container.className = "listing-brand";

  container.innerHTML = `
    <div class="lb-wrapper">
      <h2 class="lb-label">${labelText}</h2>

      <div class="lb-grid">
        <div class="lb-item">Brand One</div>
        <div class="lb-item">Brand Two</div>
        <div class="lb-item">Brand Three</div>
        <div class="lb-item">Brand Four</div>
      </div>
    </div>
  `;

  block.appendChild(container);
}
