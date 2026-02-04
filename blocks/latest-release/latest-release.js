import { getLatestPress } from "../../scripts/news-api.js";

const PUBLISH_DOMAIN =
  "https://publish-p168597-e1803019.adobeaemcloud.com";

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
    const item = await getLatestPress();

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
