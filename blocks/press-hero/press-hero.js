import { getNewsDetail } from "../../scripts/news-api.js";

// const PUBLISH_DOMAIN = "https://publish-p168597-e1803019.adobeaemcloud.com";

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

function getSlugFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("slug");
}


function buildHeroNav(swiper, total) {
  const nav = document.createElement("div");
  nav.className = "hero-nav";

  const container = document.createElement("div");
  container.className = "container";

  const prev = document.createElement("button");
  prev.className = "swiper-button-prev";
  prev.setAttribute("aria-label", "Previous slide");

  const next = document.createElement("button");
  next.className = "swiper-button-next";
  next.setAttribute("aria-label", "Next slide");

  const numbers = document.createElement("div");
  numbers.className = "hero-numbers";

  const nums = [];

  for (let i = 0; i < total; i += 1) {
    const num = document.createElement("span");
    num.className = "hero-num";
    num.textContent = String(i + 1).padStart(2, "0");
    num.addEventListener("click", () => swiper.slideToLoop(i));
    nums.push(num);
    numbers.append(num);
  }

  container.append(prev, numbers, next);
  nav.append(container);
  swiper.el.append(nav);

  prev.onclick = () => swiper.slidePrev();
  next.onclick = () => swiper.slideNext();

  function updateActive() {
    nums.forEach((n) => n.classList.remove("active"));
    nums[swiper.realIndex]?.classList.add("active");
  }

  swiper.on("slideChange", updateActive);
  updateActive();
}


/* ================================
   Build Hero
================================ */
function buildPressHero(item) {
  const publishDate =
    item.publishDate?.iso ||
    item.publishDate?.value ||
    item.publishDate ||
    "";
  const publishDateFormatted = formatDate(publishDate);
  const lastUpdated =
    item.lastUpdatedDate?.iso ||
    item.lastUpdatedDate?.value ||
    "";

  const bgUrl =
    item.cardImage?._publishUrl ||
    item.cardImage?.publishUrl ||
    "";

  const hero = document.createElement("section");
  hero.className = "press-hero";

  hero.innerHTML = `
    ${bgUrl ? `
      <div class="press-hero-media">
        <img src="${bgUrl}" alt="${item.title || ""}">
      </div>
    ` : ""}

    <div class="press-hero-overlay"></div>

    <div class="press-hero-content">
      <div class="container">

        <button class="press-hero-back" onclick="history.back()">
          ← Back
        </button>

        

        <h1 class="press-hero-title">
          ${item.title || ""}
        </h1>

        <div class="press-hero-meta">
          ${item.subCategory || item.category ? `
            <span class="press-hero-tag">
                ${item.subCategory || item.category}
            </span>
            ` : ""}
          ${publishDate ? `
            <span><i class="icon-calendar"></i>${publishDateFormatted}</span>
          ` : ""}
          ${lastUpdated ? `
            <span><i class="icon-clock"></i>|   Last Updated: ${lastUpdated}</span>
          ` : ""}
          ${item.location ? `
            <span><i class="icon-location"></i>${item.location}</span>
          ` : ""}
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
    // const apiUrl =
    //   `${getApiHost()}/api/v1/web/gmr-api/news-details` +
    //   `?slugUrl=${encodeURIComponent(slug)}`;

    // const res = await fetch(apiUrl);
    // if (!res.ok) throw new Error(`API error ${res.status}`);

    // const json = await res.json();
    const item = await getNewsDetail();

    if (!item) {
      contentWrapper.innerHTML = "<p>News not found.</p>";
      return;
    }
    // console.log("_____________________________", item);
    

    /* Inject Hero */
    const hero = buildPressHero(item);
    block.prepend(hero);
    buildHeroNav(swiper, swiper.slides.length);


    /* Render article body */
    contentWrapper.innerHTML = `
      <article class="news-article">
        <div class="news-content">
          ${item.description?.html || ""}
        </div>
      </article>
    `;
  } catch (err) {
    console.error("Press hero error:", err);
    contentWrapper.innerHTML = "<p>Error loading article.</p>";
  }
}
