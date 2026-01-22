export default function decorate(block) {
  const textUrl = block.textContent?.trim();
  const dataUrl = block.dataset.docUrl;

  const documentUrl = dataUrl || textUrl;

  if (!documentUrl) {
    block.innerHTML = `<p class="doc-error">⚠️ No document URL provided</p>`;
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "document-preview-wrapper";

  wrapper.innerHTML = `
    <div class="document-toolbar">
      <a 
        href="${documentUrl}" 
        target="_blank" 
        rel="noopener"
        data-doc-url="${documentUrl}">
        ⬇️ Download Document
      </a>
    </div>
  `;

  block.innerHTML = "";
  block.appendChild(wrapper);
}
