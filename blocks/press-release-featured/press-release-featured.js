import { getApiHost } from "../../scripts/api.js";

/**
 * Format date to "DD Mon YYYY" format
 */
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function decorate(block) {
  // Read authored fields
  const [titleEl, categoryEl] = [...block.children];
  const sectionTitle = titleEl?.textContent?.trim() || "LATEST PRESS UPDATE";
  const category = categoryEl?.textContent?.trim() || "";

  // Clear block
  block.innerHTML = "";

  // Create section
  const section = document.createElement("section");
  section.className = "press-release-featured";

  const container = document.createElement("div");
  container.className = "container";

  // Loading state
  container.innerHTML = `<div class="featured-loading">Loading...</div>`;
  section.appendChild(container);
  block.appendChild(section);

  try {
    // Fetch latest press release
    const apiUrl = `${getApiHost()}/api/v1/web/gmr/press-release?category=${encodeURIComponent(category)}&limit=1`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`API error ${res.status}`);

    const json = await res.json();
    const items = json?.data?.data?.pressReleaseList?.items || [];

    if (!items.length) {
      container.innerHTML = `<p class="no-data">No press releases found.</p>`;
      return;
    }

    const item = items[0];
    const publishDate = formatDate(item.publishDate?.iso || item.publishDate);
    const lastUpdated = formatDate(item.lastModified?.iso || item.lastModified || item.publishDate);

    container.innerHTML = `
      <div class="featured-wrapper">
        <div class="featured-content">
          <span class="featured-label">${sectionTitle}</span>
          <h1 class="featured-title">${item.title || ""}</h1>
          <p class="featured-description">${item.description?.plaintext || item.shortDescription || ""}</p>
          
          <div class="featured-meta">
            <span class="badge ${item.businessCategory?.toLowerCase().replace(/\s+/g, '-') || 'general'}">${item.businessCategory || item.category || ""}</span>
            <span class="meta-separator">|</span>
            <span class="meta-date">
              <svg class="icon-calendar" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12.667 2.667H3.333C2.597 2.667 2 3.264 2 4v9.333c0 .737.597 1.334 1.333 1.334h9.334c.736 0 1.333-.597 1.333-1.334V4c0-.736-.597-1.333-1.333-1.333z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10.667 1.333v2.667M5.333 1.333v2.667M2 6.667h12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              ${publishDate}
            </span>
            <span class="meta-separator">|</span>
            <span class="meta-updated">
              <svg class="icon-calendar" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12.667 2.667H3.333C2.597 2.667 2 3.264 2 4v9.333c0 .737.597 1.334 1.333 1.334h9.334c.736 0 1.333-.597 1.333-1.334V4c0-.736-.597-1.333-1.333-1.333z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10.667 1.333v2.667M5.333 1.333v2.667M2 6.667h12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Last Updated : ${lastUpdated}
            </span>
          </div>

          <a href="${item.ctaLink || item.path || '#'}" class="btn-read-more">
            READ MORE
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3.333 8h9.334M8 3.333L12.667 8 8 12.667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>

        <div class="featured-image">
          <img src="${item.cardImage?._publishUrl || item.featuredImage?._publishUrl || ''}" alt="${item.title || ''}" loading="eager">
        </div>
      </div>
    `;
  } catch (err) {
    console.error("Press Release Featured error:", err);
    container.innerHTML = `<p class="error">Error loading press release.</p>`;
  }
}

