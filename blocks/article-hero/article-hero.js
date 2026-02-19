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

/* ================================
   Create Bootstrap Video Modal
================================ */
function createVideoModal() {
  if (document.getElementById("videoModal")) return;

  const modalHTML = `
    <div class="modal fade" id="videoModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content bg-black">
          <button type="button"
            class="btn-close btn-close-white ms-auto m-2"
            data-bs-dismiss="modal">
          </button>

          <div class="ratio ratio-16x9">
            <iframe
              id="videoIframe"
              src=""
              title="YouTube video"
              allow="autoplay; encrypted-media"
              allowfullscreen>
            </iframe>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // stop video when modal closes
  const modalEl = document.getElementById("videoModal");
  modalEl.addEventListener("hidden.bs.modal", () => {
    document.getElementById("videoIframe").src = "";
  });
}

/* ================================
   Extract YouTube ID
================================ */
function getYouTubeId(url) {
  if (!url) return "";

  if (url.includes("watch?v=")) {
    return url.split("watch?v=")[1].split("&")[0];
  }

  if (url.includes("youtu.be/")) {
    return url.split("youtu.be/")[1].split("?")[0];
  }

  return "";
}

/* ================================
   Open Video Modal
================================ */
function openVideoModal(url) {
  const videoId = getYouTubeId(url);
  if (!videoId) return;

  const iframe = document.getElementById("videoIframe");
  iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;

  const modalEl = document.getElementById("videoModal");

  // use Bootstrap modal if available
  if (window.bootstrap) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  } else {
    // fallback if bootstrap JS not loaded
    modalEl.style.display = "block";
    modalEl.classList.add("show");
  }
}

export default async function decorate(block) {
  let category = getCategoryFromURL();
  if (!category) category = "press-release";

  let autoLabel = "LATEST UPDATE";
  if (category === "press-release") autoLabel = "Featured Video";
  else if (category === "blog") autoLabel = "LATEST INSIGHTS";

  const authorLabel = block.dataset.label;
  const labelText = authorLabel || autoLabel;

  block.innerHTML = "";

  const container = document.createElement("section");
  container.className = "article-hero spacer";

  container.innerHTML = `
    <div class="ah-wrapper">
      <p class="loading">Loading content...</p>
    </div>
  `;

  block.appendChild(container);
  const wrapper = container.querySelector(".ah-wrapper");

  try {
    const apiUrl = `${getApiHost()}/api/v1/web/gmr-api/films-latest`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`API error ${res.status}`);

    const json = await res.json();
    const items = json?.data?.data?.filmsVisualsList?.items || [];

    if (!items.length) {
      wrapper.innerHTML = "<p>No news available.</p>";
      return;
    }

    const item = items[0];

    /* ===== Publish Date ===== */
    const publishDateRaw =
      item?.publishDate ||
      (item?.publishMonth && item?.publishYear
        ? item.publishMonth + " " + item.publishYear
        : "");

    const publishDateFormatted = publishDateRaw
      ? formatDate(publishDateRaw)
      : "";

    /* ===== Category Badge ===== */
    const categorySlug = (item.subCategory || item.category || "press")
      .toLowerCase()
      .replace(/\s+/g, "-");

    const categoryText = slugToTitle(
      item.subCategory || item.category || "Press"
    );

    /* ===== Render ===== */
    wrapper.innerHTML = `
      <div class="ah-header">
        <span class="ah-label">${labelText}</span>

        <h1 class="ah-title">${item.title || ""}</h1>

        <div class="ah-meta">
          <span class="ah-category badge ${categorySlug}">
            ${categoryText}
          </span>

          <span class="ah-separator">|</span>

          <span class="ah-date">${publishDateFormatted}</span>
        </div>
      </div>

      <div class="ah-media">
        <img
          src="${item.thumbnail?._publishUrl || ""}"
          alt="${item.title}"
          loading="lazy"
        />

        ${
          item.video
            ? `<button class="ah-video-btn inner-hero-play" data-video="${item.video}">
                Play Video
              </button>`
            : ""
        }
      </div>
    `;

    /* ===== Setup Video Modal ===== */
    if (item.video) {
      createVideoModal();

      wrapper.querySelector(".ah-video-btn")?.addEventListener("click", (e) => {
        openVideoModal(e.currentTarget.dataset.video);
      });
    }

  } catch (err) {
    console.error("Article hero error:", err);
    wrapper.innerHTML = "<p>Error loading content.</p>";
  }
}
