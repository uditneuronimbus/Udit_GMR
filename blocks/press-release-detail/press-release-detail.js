/**
 * Press Release Detail Block
 * Reads category and slug from URL and displays the press release content
 * URL format: /press-releases/{category}/{slug}
 * Data source: /press-releases/press-release-data.json (spreadsheet)
 */

export default async function decorate(block) {
  console.log("Decorating Press Release Detail block");

  // Read authored fields for fallback/config
  const children = [...block.children];
  const backLinkText = children[0]?.textContent?.trim() || "Back to Press Releases";
  const backLinkUrl = children[1]?.textContent?.trim() || "/press-releases";
  const dataSourceUrl = children[2]?.textContent?.trim() || "/press-releases/press-release-data.json";

  /* ================================
     Check for Author Mode (AEM SAFE)
  ================================ */
  const isAuthorMode = document.body.classList.contains('universal-editor-edit') ||
    document.body.classList.contains('aem-AuthorLayer-Edit') ||
    window.location.href.includes('/editor.html');

  if (isAuthorMode) {
    block.classList.add('press-detail-author-mode');
    block.innerHTML = `
      <div class="press-detail-author-note">
        <p><strong>📰 Press Release Detail Component</strong></p>
        <p><small>• This block displays press release details based on URL</small></p>
        <p><small>• URL format: /press-releases/{category}/{slug}</small></p>
        <p><small>• Data source: ${dataSourceUrl}</small></p>
      </div>
    `;
    return;
  }

  // Clear block and show loading
  block.innerHTML = `
    <section class="press-release-detail-runtime">
      <div class="container">
        <div class="detail-loading">
          <div class="loading-spinner"></div>
          <p>Loading press release...</p>
        </div>
      </div>
    </section>
  `;

  /* ================================
     Parse URL to get category and slug
  ================================ */
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  // Expected: ['press-releases', 'category', 'slug']
  
  let category = '';
  let slug = '';

  if (pathParts.length >= 3 && pathParts[0] === 'press-releases') {
    category = pathParts[1];
    slug = pathParts[2];
  } else if (pathParts.length >= 2) {
    // Fallback: /press-releases/slug
    category = '';
    slug = pathParts[pathParts.length - 1];
  }

  if (!slug) {
    block.innerHTML = `
      <section class="press-release-detail-runtime">
        <div class="container">
          <div class="detail-error">
            <h2>Press Release Not Found</h2>
            <p>The requested press release could not be found.</p>
            <a href="${backLinkUrl}" class="btn-back">${backLinkText}</a>
          </div>
        </div>
      </section>
    `;
    return;
  }

  /* ================================
     Fetch press release data
  ================================ */
  try {
    const response = await fetch(dataSourceUrl);
    if (!response.ok) throw new Error(`Failed to fetch data: ${response.status}`);
    
    const data = await response.json();
    const pressReleases = data.data || data;

    // Find the press release by slug (and optionally category)
    const pressRelease = pressReleases.find(item => {
      const itemSlug = createSlug(item.title);
      const itemCategory = createSlug(item.category);
      
      if (category) {
        return itemSlug === slug && itemCategory === category;
      }
      return itemSlug === slug;
    });

    if (!pressRelease) {
      block.innerHTML = `
        <section class="press-release-detail-runtime">
          <div class="container">
            <div class="detail-error">
              <h2>Press Release Not Found</h2>
              <p>The requested press release could not be found.</p>
              <a href="${backLinkUrl}" class="btn-back">${backLinkText}</a>
            </div>
          </div>
        </section>
      `;
      return;
    }

    // Render the press release
    renderPressRelease(block, pressRelease, backLinkUrl, backLinkText);

  } catch (error) {
    console.error('Error loading press release:', error);
    block.innerHTML = `
      <section class="press-release-detail-runtime">
        <div class="container">
          <div class="detail-error">
            <h2>Error Loading Press Release</h2>
            <p>There was an error loading the press release. Please try again later.</p>
            <a href="${backLinkUrl}" class="btn-back">${backLinkText}</a>
          </div>
        </div>
      </section>
    `;
  }
}

/**
 * Create URL-friendly slug from text
 */
function createSlug(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format date to readable format
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  // If already formatted like "01 Jan 2026", return as is
  if (/^\d{1,2}\s+\w{3}\s+\d{4}$/.test(dateStr)) {
    return dateStr;
  }
  // Try to parse and format
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Render the press release detail page
 */
function renderPressRelease(block, pr, backLinkUrl, backLinkText) {
  const categoryClass = createSlug(pr.category) || 'general';
  
  block.innerHTML = `
    <section class="press-release-detail-runtime">
      <div class="container">
        <!-- Back Link -->
        <div class="detail-back">
          <a href="${backLinkUrl}" class="btn-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            ${backLinkText}
          </a>
        </div>

        <!-- Main Content -->
        <article class="detail-article">
          <!-- Header -->
          <header class="detail-header">
            <div class="detail-meta">
              ${pr.category ? `<span class="badge ${categoryClass}">${pr.category}</span>` : ''}
              ${pr.category ? '<span class="meta-separator">|</span>' : ''}
              ${pr.publishDate ? `
                <span class="meta-date">
                  <svg class="icon-calendar" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12.667 2.667H3.333C2.597 2.667 2 3.264 2 4v9.333c0 .737.597 1.334 1.333 1.334h9.334c.736 0 1.333-.597 1.333-1.334V4c0-.736-.597-1.333-1.333-1.333z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10.667 1.333v2.667M5.333 1.333v2.667M2 6.667h12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  ${formatDate(pr.publishDate)}
                </span>
              ` : ''}
              ${pr.lastUpdated ? `
                <span class="meta-separator">|</span>
                <span class="meta-updated">Last Updated: ${formatDate(pr.lastUpdated)}</span>
              ` : ''}
            </div>
            <h1 class="detail-title">${pr.title || ''}</h1>
          </header>

          <!-- Featured Image -->
          ${pr.image ? `
            <div class="detail-image">
              <img src="${pr.image}" alt="${pr.title || 'Press Release'}" loading="eager">
            </div>
          ` : ''}

          <!-- Content -->
          <div class="detail-content">
            ${pr.content || pr.description || ''}
          </div>

          <!-- Footer -->
          <footer class="detail-footer">
            ${pr.tags ? `
              <div class="detail-tags">
                <span class="tags-label">Tags:</span>
                ${pr.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}
              </div>
            ` : ''}
            
            <div class="detail-share">
              <span class="share-label">Share:</span>
              <div class="share-buttons">
                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" rel="noopener" class="share-btn facebook" aria-label="Share on Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(pr.title || '')}" target="_blank" rel="noopener" class="share-btn twitter" aria-label="Share on Twitter">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                  </svg>
                </a>
                <a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(pr.title || '')}" target="_blank" rel="noopener" class="share-btn linkedin" aria-label="Share on LinkedIn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                    <rect x="2" y="9" width="4" height="12"/>
                    <circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
                <button class="share-btn copy" aria-label="Copy link" onclick="navigator.clipboard.writeText(window.location.href); this.classList.add('copied'); setTimeout(() => this.classList.remove('copied'), 2000);">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              </div>
            </div>
          </footer>
        </article>

        <!-- Related Press Releases (Optional) -->
        <div class="detail-related" id="related-press-releases"></div>
      </div>
    </section>
  `;
}

