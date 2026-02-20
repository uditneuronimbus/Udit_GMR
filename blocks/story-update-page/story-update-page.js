import { formatDate } from "../../scripts/common.js";
import { getSlugFromURL } from "../../scripts/common.js";
import { getApiHost } from "../../scripts/api.js";

const PUBLISH_DOMAIN =
  "https://publish-p168597-e1803019.adobeaemcloud.com";

/* ================================
   Swiper Loader
================================ */
const SWIPER_JS =
  "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js";
const SWIPER_CSS =
  "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css";

function loadScript(src) {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    document.body.appendChild(s);
  });
}

function loadCSS(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = href;
  document.head.appendChild(l);
}

/* ================================
   Fix DAM image paths
================================ */
function fixImageSrc(html) {
  if (!html) return html;

  return html.replace(
    /<img([^>]+)src="(\/content\/dam[^"]+)"/g,
    `<img$1src="${PUBLISH_DOMAIN}$2"`
  );
}

/* ================================
   Dynamic Section Renderer (NEW)
================================ */
function renderSection(title, content) {
  if (!title && !content) return "";

  return `
    <div class="section column">
      <div class="row">
        <div class="col-md-5">
          ${title ? `<h2>${title}</h2>` : ""}
        </div>
        <div class="col-md-7">
          ${fixImageSrc(content || "")}
        </div>
      </div>
    </div>
  `;
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

  try {
    const apiUrl =
      `${getApiHost()}/api/v1/web/gmr-api/story-details` +
      `?slugUrl=${encodeURIComponent(slug)}`;

    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(res.status);

    const json = await res.json();
    const items = json?.data?.data?.successStoryList?.items || [];
    const item = items[0] || null;

    if (!item) {
      contentWrapper.innerHTML = "<p>Story not found.</p>";
      return;
    }

    /* ================================
       Meta updates
    ================================ */
    document.title = item.metaTitle || item.title || "";

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = item.metaDescription?.plaintext || "";

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement("meta");
      metaKeywords.setAttribute("name", "keywords");
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute("content", item.metaKeywords || "");

    const publishDateRaw =
      item.publishDate?.iso ||
      item.publishDate?.value ||
      item.publishDate ||
      "";

    const publishDateFormatted = formatDate(publishDateRaw);

    const hasTitle = !!item.title;
    const hasImage = !!item.cardImage?._publishUrl;

    /* ================================
       Collect Gallery Images
    ================================ */
    const galleryImages = [
      item.image1?._publishUrl,
      item.image2?._publishUrl,
      item.image3?._publishUrl,
      item.image4?._publishUrl,
      item.image5?._publishUrl,
      item.image6?._publishUrl,
      item.image7?._publishUrl,
      item.image8?._publishUrl,
      item.image9?._publishUrl,
      item.image10?._publishUrl,
    ].filter(Boolean);

    /* ================================
       Banner Images
    ================================ */
    const bannerDesktop =
      item.bannerDesktop?._publishUrl || "../../img/press-desk.jpg";
    const bannerMobile =
      item.bannerMobile?._publishUrl || "../../img/press-mob.jpg";

    /* ================================
       Render page
    ================================ */
    contentWrapper.innerHTML = `
      <div class="press-hero-wrapper">
        <section class="press-banner">
          <div class="press-hero-media">
            <picture class="d-none d-md-block">
              <img src="${bannerDesktop}" width="1920" height="550">
            </picture>
            <picture class="d-block d-md-none">
              <img src="${bannerMobile}" width="640" height="965">
            </picture>
          </div>

          <div class="press-hero-content">
            <div class="container">
              <button class="btn-primary btn-sm btn back-btn">Back</button>

              <div class="press-hero-title">
                ${item.title || "News Title"}
              </div>

              <div class="press-hero-meta">
                ${item.subCategory ? `<span>${item.subCategory}</span>` : ""}
                ${publishDateFormatted ? `<span>${publishDateFormatted}</span>` : ""}
                ${item.location ? `<span>${item.location}</span>` : ""}
              </div>
            </div>
          </div>
        </section>
      </div>

      <article class="news-article">

        ${hasTitle ? `
          <div class="news-title">
            <h1>${item.title}</h1>
          </div>
        ` : ""}

        ${hasImage ? `
          <div class="news-card">
            <img src="${item.cardImage._publishUrl}" alt="${item.title || ""}"/>
          </div>
        ` : ""}

        <!-- Dynamic Sections -->
        ${[
          renderSection(item.approachStrategyTitle, item.approachStrategy?.html),
          renderSection(item.contextHistoricalBackdropTitle, item.contextHistoricalBackdrop?.html),
          renderSection(item.coreProblemStatementTitle, item.coreProblemStatement?.html),
          renderSection(item.executiveSummaryTitle, item.executiveSummary?.html),
          renderSection(item.globalBenchmarkingInsightsTitle, item.globalBenchmarkingInsights?.html),
          renderSection(item.implementationTitle, item.implementation?.html),
          renderSection(item.leadershipPerspectivesTitle, item.leadershipPerspectives?.html),
          renderSection(item.openingNarrativeTitle, item.openingNarrative?.html),
          renderSection(item.sustainabilityImpactTitle, item.outcomesImpactwhereeverSustainabilityImpact?.html),
          renderSection(item.stakeholderMapTitle, item.stakeholderMap?.html),
        ].join("")}

        ${galleryImages.length ? `
          <div class="news-gallery swiper">
            <div class="swiper-wrapper">
              ${galleryImages.map(img => `
                <div class="swiper-slide">
                  <img src="${img}" alt="Gallery image"/>
                </div>
              `).join("")}
            </div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
          </div>
        ` : ""}

      </article>
    `;

    /* ================================
       Back Button
    ================================ */
    container.querySelectorAll(".back-btn").forEach((btn) => {
      btn.addEventListener("click", () => history.back());
    });

    /* ================================
       Init Swiper
    ================================ */
    if (galleryImages.length) {
      loadCSS(SWIPER_CSS);
      await loadScript(SWIPER_JS);

      new Swiper(".news-gallery", {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
      });
    }
  } catch (err) {
    console.error("News detail error:", err);
    contentWrapper.innerHTML = "<p>Error loading article.</p>";
  }
}