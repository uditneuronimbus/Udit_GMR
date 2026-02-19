import { getApiHost } from "../../scripts/api.js";
import { slugToTitle } from "../../scripts/common.js";
import { formatDate } from "../../scripts/common.js";

function getCategoryFromURL() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (!parts.length) return "";

  let slug = parts[parts.length - 1].toLowerCase();

  const slugMap = {
    "brand-films-visuals": "press-release",
  };

  return slugMap[slug] || slug;
}

export default async function decorate(block) {
  let category = getCategoryFromURL();

  if (!category) category = "press-release";

  let autoLabel = "LATEST UPDATE";
  if (category === "press-release") {
    autoLabel = "LATEST PRESS RELEASE";
  } else if (category === "blog") {
    autoLabel = "LATEST INSIGHTS";
  }

  const authorLabel = block.dataset.label;
  const labelText = authorLabel || autoLabel;

  block.innerHTML = "";

  const container = document.createElement("section");
  container.className = "article-hero";

  container.innerHTML = `
    <div class="ah-wrapper">
      <p class="loading">Loading content...</p>
    </div>
  `;

  block.appendChild(container);
  const wrapper = container.querySelector(".ah-wrapper");

  try {
    const apiUrl =
      `${getApiHost()}/api/v1/web/gmr-api/films-latest`;

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`API error ${res.status}`);

    const json = await res.json();

    const items = json?.data?.data?.filmsVisualsList?.items || [];

    if (!items.length) {
      wrapper.innerHTML = "<p>No news available.</p>";
      return;
    }

    const item = items[0];

    const publishDateRaw =
        item?.publishDate ||
        (item?.publishMonth && item?.publishYear
          ? item.publishMonth + " " + item.publishYear
          : "");

      const publishDateFormatted = publishDateRaw
        ? formatDate(publishDateRaw)
        : "";

    const categoryText = slugToTitle(
      item.subCategory || item.category || "Press"
    );

    

    const videoUrl =
      item.videoUrl ||
      item.video?._publishUrl ||
      "";

    wrapper.innerHTML = `
      <div class="ah-header">
        <span class="ah-label">${labelText}</span>

        <h1 class="ah-title">
          ${item.title || ""}
        </h1>

        <div class="ah-meta">
          <span class="ah-category">
            ${categoryText}
          </span>

          <span class="ah-separator">|</span>

          <span class="ah-date">
            ${publishDateFormatted}
            
          </span>
        </div>
      </div>

      <div class="ah-media">
        ${
          videoUrl
            ? `
          <video controls class="ah-video">
            <source src="${videoUrl}" type="video/mp4">
          </video>
        `
            : `
          <img
            src="${item.cardImage?._publishUrl || ""}"
            alt="${item.title || ""}"
          />
        `
        }
      </div>
    `;
  } catch (err) {
    console.error("Article hero error:", err);
    wrapper.innerHTML = "<p>Error loading content.</p>";
  }
}
