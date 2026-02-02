import { getApiHost } from "../../scripts/api.js";


const PUBLISH_DOMAIN = 'https://publish-p168597-e1803019.adobeaemcloud.com';
 
function fixImageSrc(html) {
  if (!html) return html;
 
  return html.replace(
    /<img([^>]+)src="(\/content\/dam[^"]+)"/g,
    `<img$1src="${PUBLISH_DOMAIN}$2"`
  );
}

/* ================================
   Date formatter
================================ */
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

/* ================================
   Read slug from URL
================================ */
function getSlugFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("slug");
}

export default async function decorate(block) {
  const slug = getSlugFromURL();
  
  block.innerHTML = "";

  if (!slug) {
    block.innerHTML = "<p>Invalid news item.</p>";
    return;
  }

  const container = document.createElement("section");
  container.className = "news-detail spacer";

  container.innerHTML = `
    <div class="container">
      <div class="news-detail-wrapper">
        <p class="loading">Loading article...</p>
      </div>
    </div>
  `;

  block.appendChild(container);

  const contentWrapper = container.querySelector(".news-detail-wrapper");

  /* ================================
     Fetch news detail
  ================================ */
  try {
    const apiUrl =
      `${getApiHost()}/api/v1/web/gmr-api/news-details` +
      `?slugUrl=${encodeURIComponent(slug)}`;

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`API error ${res.status}`);

    const json = await res.json();
    const item = json?.data?.data?.newsList?.items[0];
    
    if (!item) {
      contentWrapper.innerHTML = "<p>News not found.</p>";
      return;
    }

    const publishDateRaw =
      item.publishDate?.iso ||
      item.publishDate?.value ||
      item.publishDate ||
      "";

    const publishDateFormatted = formatDate(publishDateRaw);

    /* ================================
       Render detail page
    ================================ */
    contentWrapper.innerHTML = `
      <article class="news-article">
        <h2 class="news-key-highlight">KEY HIGHLIGHT</h2>
        <div class="news-content">
          ${fixImageSrc(item.description?.html) || ""}
        </div>
      </article>
    `;
  } catch (err) {
    console.error("News detail error:", err);
    contentWrapper.innerHTML = "<p>Error loading article.</p>";
  }
}
