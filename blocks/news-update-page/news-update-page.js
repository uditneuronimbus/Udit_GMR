import { getNewsDetail } from "../../scripts/news-api.js";

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
  return params.get("post");
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
    const item = await getNewsDetail();
    console.log("_________________________", item);
    document.title = item.metaTitle || item.title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = item.metaDescription?.plaintext || '';

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
  
    metaKeywords.setAttribute('content', item.metaKeywords || '');

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
        <div class="news-title">
          <h1>${item.title || ""}</h1>
        </div>
        <div class="news-card"></div>
          <img
            src="${item.cardImage?._publishUrl || ""}"
            alt="${item.title || ""}"
          />
        </div>
        <div class="news-content">
          ${fixImageSrc(item.description?.html) || ""}
        </div>
        <div class="news-contact-cards">
          ${item.contacts?.html || ""}
        </div>
      </article>
    `;
  } catch (err) {
    console.error("News detail error:", err);
    contentWrapper.innerHTML = "<p>Error loading article.</p>";
  }
}
