export default function decorate(block) {
  const [docEl] = [...block.children];

  const documentUrl = docEl?.textContent?.trim();

  block.innerHTML = "";

  if (!documentUrl) {
    block.innerHTML = `<p class="doc-error">⚠️ No document URL provided</p>`;
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "document-preview-wrapper";

  const fileExtension = documentUrl.split(".").pop().toLowerCase();

  let previewHTML = "";

  // ✅ PDF Preview
  if (fileExtension === "pdf") {
    previewHTML = `
      <iframe 
        src="${documentUrl}" 
        class="document-frame"
        loading="lazy">
      </iframe>
    `;
  }

  // ✅ Word / Excel via Google Viewer fallback
  else {
    const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
      documentUrl
    )}&embedded=true`;

    previewHTML = `
      <iframe 
        src="${viewerUrl}" 
        class="document-frame"
        loading="lazy">
      </iframe>
    `;
  }

  wrapper.innerHTML = `
    <div class="document-toolbar">
      <a href="${documentUrl}" target="_blank" rel="noopener">
        ⬇️ Download Document
      </a>
    </div>

    <div class="document-container">
      ${previewHTML}
    </div>
  `;

  block.appendChild(wrapper);
}
