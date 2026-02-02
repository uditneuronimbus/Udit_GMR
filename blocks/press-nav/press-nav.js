import { getApiHost } from "../../scripts/api.js";


export default async function decorate(block) {
  console.log("PRESS NAV JS LOADED");

  block.classList.add("press-nav");
  block.innerHTML = "";

  /* ================================
     Base UI (always visible)
  ================================ */
  block.innerHTML = `
    <div class="press-nav-side prev">
      <a class="nav-btn disabled">← Previous</a>
      <div class="nav-hover-card">
        <div class="label">Previous Press Release</div>
        <div class="title">No previous article</div>
      </div>
    </div>

    <div class="press-nav-side next">
      <div class="nav-hover-card">
        <div class="label">Next Press Release</div>
        <div class="title">No next article</div>
      </div>
      <a class="nav-btn primary disabled">Next →</a>
    </div>
  `;

  /* ================================
     Step 1: Get slug
  ================================ */
  const slug = getSlugFromURL();
  if (!slug) {
    console.warn("press-nav: slug missing");
    return;
  }

  /* ================================
     Step 2: Fetch current article
  ================================ */
  const detailUrl =
    `${getApiHost()}/api/v1/web/gmr-api/news-details` +
    `?slugUrl=${encodeURIComponent(slug)}`;

  const detailRes = await fetchJSON(detailUrl);
  const item = detailRes?.data?.data?.newsList?.items?.[0];

  if (!item || !item.publishDate) {
    console.warn("press-nav: publishDate not found");
    return;
  }

  const publishDate =
    item.publishDate?.iso ||
    item.publishDate?.value ||
    item.publishDate;

  /* ================================
     Step 3: Fetch prev / next
  ================================ */
  const prevUrl =
    `${PUBLISH_DOMAIN}/graphql/execute.json/GMR/pre-news` +
    `;publishDate=${publishDate}`;

  const nextUrl =
    `${PUBLISH_DOMAIN}/graphql/execute.json/GMR/next-news` +
    `;publishDate=${publishDate}`;

  const [prevRes, nextRes] = await Promise.all([
    fetchJSON(prevUrl),
    fetchJSON(nextUrl),
  ]);

  const prevItem = prevRes?.data?.preNews?.items?.[0];
  const nextItem = nextRes?.data?.nextNews?.items?.[0];

  /* ================================
     Step 4: Wire PREV
  ================================ */
  if (prevItem) {
    const prevBtn = block.querySelector(".prev .nav-btn");
    const prevCard = block.querySelector(".prev .nav-hover-card");

    prevBtn.href = prevItem._path;
    prevBtn.classList.remove("disabled");

    prevCard.querySelector(".title").textContent = prevItem.title;
  }

  /* ================================
     Step 5: Wire NEXT
  ================================ */
  if (nextItem) {
    const nextBtn = block.querySelector(".next .nav-btn");
    const nextCard = block.querySelector(".next .nav-hover-card");

    nextBtn.href = nextItem._path;
    nextBtn.classList.remove("disabled");

    nextCard.querySelector(".title").textContent = nextItem.title;
  }
}
