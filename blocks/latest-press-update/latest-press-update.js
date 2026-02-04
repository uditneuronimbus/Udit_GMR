import { getApiHost } from "../../scripts/api.js";



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

export default async function decorate(block) {
  const labelText = block.textContent.trim() || "LATEST PRESS UPDATE";
  block.innerHTML = "";
  

  const container = document.createElement("section");
  container.className = "latest-press-update";

  container.innerHTML = `
    <div class="lpu-wrapper">
      <p class="loading">Loading latest press update...</p>
    </div>
  `;

  block.appendChild(container);

  const wrapper = container.querySelector(".lpu-wrapper");

  /* ================================
     Fetch latest press
  ================================ */
  try {
      const limit = 3;
      const offset = 0;
      const category = "press-release";

     const apiUrl =
          `${getApiHost()}/api/v1/web/gmr-api/recent-posts` +
          `?limit=${encodeURIComponent(limit)}` +
          `&soffset=${encodeURIComponent(offset)}` +
          `&category=${encodeURIComponent(category)}`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`API error ${res.status}`);

    const json = await res.json();
    const items = json?.data?.data?.newsList?.items || [];
    if (!items.length) {
      block.innerHTML = "<p>No news available.</p>";
      return;
    }

    const item = items[0];
    
    if (!item) {
      wrapper.innerHTML = "<p>No press updates found.</p>";
      return;
    }

    const publishDateRaw =
      item.publishDate?.iso ||
      item.publishDate?.value ||
      item.publishDate ||
      "";

    const publishDateFormatted = formatDate(publishDateRaw);

    wrapper.innerHTML = `
      <div class="lpu-left">
        <span class="lpu-label">${labelText}</span>

        <h2 class="lpu-title">
          ${item.title || ""}
        </h2>

        <p class="lpu-location">
          ${item.location || ""}
        </p>

        <div class="lpu-meta">
          <span class="lpu-category">
            ${item.category || "Press"}
          </span>
          <span class="lpu-date">
            ${publishDateFormatted}
          </span>
        </div>

        <a
          href="/press?post=${item.slug}"
          class="lpu-cta"
        >
          Read More
        </a>
      </div>

      <div class="lpu-right">
        <img
          src="${item.cardImage?._publishUrl || ""}"
          alt="${item.title || ""}"
          loading="lazy"
        />
      </div>
    `;
  } catch (err) {
    console.error("Latest press update error:", err);
    wrapper.innerHTML = "<p>Error loading press update.</p>";
  }
}
