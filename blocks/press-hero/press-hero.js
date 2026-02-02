import { getApiHost } from "../../scripts/api.js";

const PUBLISH_DOMAIN = "https://publish-p168597-e1803019.adobeaemcloud.com";

/* ================================
   Helpers
================================ */
function fixImageSrc(html) {
  if (!html) return html;

  return html.replace(
    /<img([^>]+)src="(\/content\/dam[^"]+)"/g,
    `<img$1src="${PUBLISH_DOMAIN}$2"`
  );
}

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

function getSlugFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("slug");
}

/* ================================
   Hero Builder
================================ */
function buildHero(item) {
  const hero = document.createElement("section");
  hero.className = "press-hero";

  const bgUrl =
    item.cardImage?._publishUrl ||
    item.cardImage?.publishUrl ||
    "";

  hero.innerHTML = `
    ${bgUrl ? `
      <div class="press-hero-media">
        <img src="${bgUrl}" alt="${item.title || ""}">
      </div>
    ` : ""}

    <div class="press-hero-content">
      <div class="container">
        ${item.category ? `
          <span class="press-hero-tag">${item.category}</span>
        ` : ""}

        <h1>${item.title || ""}</h1>

        <div class="press-hero-meta">
          ${
            item.publishDate
              ? `📅 ${formatDate(
                  item.publishDate.iso ||
                  item.publishDate.value ||
                  item.publishDate
                )}`
              : ""
          }
          ${
            item.location
              ? ` | 📍 ${item.location}`
              : ""
          }
        </div>
      </div>
    </div>
  `;

  return hero;
}

/* ================================
   Decorate
================================ */
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

  block.append(container);

  const contentWrapper = container.querySelector(".news-detail-wrapper");

  try {
    const apiUrl =
      `${getApiHost()}/api/v1/web/gmr-api/news-details` +
      `?slugUrl=${encodeURIComponent(slug)}`;

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`API error ${res.status}`);

    const json = await res.json();
    const item = json?.data?.data?.newsList?.items?.[0];

    if (!item) {
      contentWrapper.innerHTML = "<p>News not found.</p>";
      return;
    }

    /* ================================
       Inject HERO (API-driven)
    ================================ */
    const hero = buildHero(item);
    block.prepend(hero);

    /* ================================
       Render Article
    ================================ */
    contentWrapper.innerHTML = `
      <article class="news-article">
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
