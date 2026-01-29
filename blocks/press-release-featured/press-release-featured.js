export default function decorate(block) {
  console.log("Decorating Press Release Featured block");

  const children = [...block.children];
  if (children.length < 1) return;

  /* ================================
     1️⃣ Read authored content
  ================================ */
  const sectionLabel = children[0]?.textContent?.trim() || "LATEST PRESS UPDATE";
  const badge = children[1]?.textContent?.trim() || "";
  const title = children[2]?.textContent?.trim() || "";
  const description = children[3]?.innerHTML?.trim() || "";
  const publishDate = children[4]?.textContent?.trim() || "";
  const lastUpdated = children[5]?.textContent?.trim() || "";
  const ctaLink = children[6]?.querySelector("a")?.href || children[6]?.textContent?.trim() || "#";
  const ctaText = children[7]?.textContent?.trim() || "READ MORE";
  
  let imageEl = null;
  if (children[8]) {
    imageEl = children[8].querySelector("img") || children[8].querySelector("picture");
  }

  /* ================================
     2️⃣ Check for Author Mode (AEM SAFE)
  ================================ */
  const isAuthorMode = document.body.classList.contains('universal-editor-edit') ||
    document.body.classList.contains('aem-AuthorLayer-Edit') ||
    window.location.href.includes('/editor.html');

  if (isAuthorMode) {
    block.classList.add('press-featured-author-mode');
    const authorNote = document.createElement('div');
    authorNote.className = 'press-featured-author-note';
    authorNote.innerHTML = `
      <p><strong>📰 Press Release Featured Component</strong></p>
      <p><small>• Edit the content fields in the table below</small></p>
      <p><small>• Styled layout appears in publish mode</small></p>
    `;
    block.insertBefore(authorNote, children[0]);
    return;
  }

  /* ================================
     3️⃣ Preserve authored content for Universal Editor (AEM SAFE)
  ================================ */
  const authoredContentWrapper = document.createElement('div');
  authoredContentWrapper.className = 'press-featured-authored-content';
  authoredContentWrapper.setAttribute('aria-hidden', 'true');
  authoredContentWrapper.style.cssText = `
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
    opacity: 0 !important;
    pointer-events: none !important;
    visibility: hidden !important;
  `;

  // Move all children to the hidden wrapper while preserving them in DOM
  while (block.firstChild) {
    authoredContentWrapper.appendChild(block.firstChild);
  }

  // Add the hidden wrapper back to the block
  block.appendChild(authoredContentWrapper);

  /* ================================
     4️⃣ Get image URL
  ================================ */
  const extractImageUrl = (imgElement) => {
    if (!imgElement) return '';
    if (imgElement.tagName === 'IMG') {
      return imgElement.src;
    } else if (imgElement.tagName === 'PICTURE') {
      const img = imgElement.querySelector('img');
      return img ? img.src : '';
    }
    return '';
  };

  const imageUrl = extractImageUrl(imageEl);
  const imageAlt = imageEl?.alt || title || 'Press Release Image';

  /* ================================
     5️⃣ Runtime wrapper
  ================================ */
  const runtime = document.createElement("section");
  runtime.className = "press-release-featured-runtime";

  // Generate badge class from badge text
  const badgeClass = badge ? badge.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '') : 'general';

  runtime.innerHTML = `
      <div class="featured-wrapper">
        <div class="featured-content">
          <span class="featured-label">${sectionLabel}</span>
          <h1 class="featured-title">${title}</h1>
          <div class="featured-description">${description}</div>
          
          <div class="featured-meta">
            ${badge ? `<span class="badge ${badgeClass}">${badge}</span>` : ''}
            ${badge ? '<span class="meta-separator">|</span>' : ''}
            ${publishDate ? `
              <span class="meta-date">
                <svg class="icon-calendar" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12.667 2.667H3.333C2.597 2.667 2 3.264 2 4v9.333c0 .737.597 1.334 1.333 1.334h9.334c.736 0 1.333-.597 1.333-1.334V4c0-.736-.597-1.333-1.333-1.333z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10.667 1.333v2.667M5.333 1.333v2.667M2 6.667h12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                ${publishDate}
              </span>
            ` : ''}
            ${lastUpdated ? `
              <span class="meta-separator">|</span>
              <span class="meta-updated">
                <svg class="icon-calendar" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M12.667 2.667H3.333C2.597 2.667 2 3.264 2 4v9.333c0 .737.597 1.334 1.333 1.334h9.334c.736 0 1.333-.597 1.333-1.334V4c0-.736-.597-1.333-1.333-1.333z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10.667 1.333v2.667M5.333 1.333v2.667M2 6.667h12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Last Updated : ${lastUpdated}
              </span>
            ` : ''}
          </div>

          <a href="${ctaLink}" class="btn-link">
            ${ctaText}
          </a>
        </div>

        <div class="featured-image">
          ${imageUrl ? `<img src="${imageUrl}" alt="${imageAlt}" loading="eager">` : ''}
        </div>
      </div>
  `;

  block.appendChild(runtime);

  console.log("Press Release Featured block initialized");
}
