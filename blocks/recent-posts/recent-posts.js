import { getApiHost } from "../../scripts/api.js";
import { getNewsDetail } from "../../scripts/news-api.js";

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
function slugToTitle(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
export default async function decorate(block) {
  const item = await getNewsDetail();
  const limit = 3;
  const offset = 0;
  const category = item.category;
  const slugUrl = item.slugUrl;

  block.innerHTML = "";

  // ✅ Create container ONCE
  const container = document.createElement("div");
  container.className = "news-updates-container";
  block.appendChild(container);

  try {
    const apiUrl =
      `${getApiHost()}/api/v1/web/gmr-api/recent-posts` +
      `?limit=${encodeURIComponent(limit)}` +
      `&soffset=${encodeURIComponent(offset)}` +
      `&category=${encodeURIComponent(category)}` +
      `&slugUrl=${encodeURIComponent(slugUrl)}`;

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`API error ${res.status}`);

    const json = await res.json();
    const items = json?.data?.data?.newsList?.items || [];

    if (!items.length) {
      block.innerHTML = "<p>No news available.</p>";
      return;
    }

    const titleDiv = document.createElement("div");
    titleDiv.className = "news-updates-title";
    titleDiv.innerHTML = `<h2>Related ${slugToTitle(category)}</h2>`;
    container.appendChild(titleDiv);
    items.forEach((item) => {
      const publishDateFormatted = formatDate(item.publishDate);

      const card = document.createElement("div");

      card.innerHTML = `

        <div class="card card-news">
            
          <div class="card-img">
            <img
              src="${item.cardImage?._publishUrl || ""}"
              alt="${item.title || ""}"
            />
          </div>

          <div class="card-body">
            <div class="card-meta">
              <span class="badge ${item.category || ""}">
                ${slugToTitle(item.category || "")}
              </span>
              <span class="meta-date">
                ${publishDateFormatted}
              </span>
            </div>

            <h3 class="card-title">
              ${item.title || ""}
            </h3>

            <p class="card-text d-none">
              ${item.description?.plaintext || ""}
            </p>

            <div class="card-cta">
              <a
                class="btn-link"
                href="/en/news-update?post=${encodeURIComponent(
                  item.slugUrl || ""
                )}"
              >
                 READ MORE
              </a>
            </div>
          </div>
        </div>
      `;

      // ✅ Append card only to container
      container.appendChild(card);
    });
  } catch (err) {
    console.error("News Updates error:", err);
    block.innerHTML = "<p>Failed to load news.</p>";
  }
}
