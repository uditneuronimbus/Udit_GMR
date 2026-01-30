import { getApiHost } from "../../scripts/api.js";

/* ================================
   Helpers
   ================================ */
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
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

/* ================================
   Decorate
   ================================ */
export default async function decorate(block) {
  block.innerHTML = "";

  const newsId = getQueryParam("id");

  if (!newsId) {
    block.innerHTML = "<p>Missing news id.</p>";
    return;
  }

  const section = document.createElement("section");
  section.className = "news-detail";

  const container = document.createElement("div");
  container.className = "container";

  section.appendChild(container);
  block.appendChild(section);

  try {
    const apiUrl =
      `${getApiHost()}/api/v1/web/gmr-api/news-update/${encodeURIComponent(newsId)}`;

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`API error ${res.status}`);

    const json = await res.json();
    const item = json?.data?.data;

    if (!item) {
      container.innerHTML = "<p>News not found.</p>";
      return;
    }

    const publishDateRaw =
      item.publishDate?.iso ||
      item.publishDate?.value ||
      item.publishDate ||
      "";

    const publishDateFormatted = formatDate(publishDateRaw);

    container.innerHTML = `
      <span class="badge ${item.category || ""}">
        ${item.category || ""}
      </span>

      <h1 class="news-title">${item.title || ""}</h1>

      <div class="news-meta">
        <span>${publishDateFormatted}</span>
      </div>

      ${
        item.cardImage?._publishUrl
          ? `<div class="news-hero">
               <img src="${item.cardImage._publishUrl}" alt="${item.title || ""}">
             </div>`
          : ""
      }

      <div class="news-content">
        ${item.description?.html || item.description?.plaintext || ""}
      </div>
    `;
  } catch (err) {
    console.error("News Update Page error:", err);
    container.innerHTML = "<p>Error loading news.</p>";
  }
}
