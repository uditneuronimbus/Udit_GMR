import { getApiHost } from "../../scripts/api.js";
import { getNewsDetail } from "../../scripts/news-api.js";

/* ================================
   Fetch JSON safely (returns FULL JSON)
================================ */
async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`API failed: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error("press-nav fetch error:", err);
    return null;
  }
}

export default async function decorate(block) {
  console.log("PRESS NAV JS LOADED");

  block.classList.add("press-nav");

  /* ================================
     Base UI (always visible)
  ================================ */
  // block.innerHTML = `
  //   <div class="press-nav-side prev">
  //     <a class="nav-btn disabled">← Previous</a>
  //     <div class="nav-hover-card">
  //       <div class="label">Previous Press Release</div>
  //       <div class="title">No previous article</div>
  //     </div>
  //   </div>

  //   <div class="press-nav-side next">
  //     <div class="nav-hover-card">
  //       <div class="label">Next Press Release</div>
  //       <div class="title">No next article</div>
  //     </div>
  //     <a class="nav-btn primary disabled">Next →</a>
  //   </div>
  // `;

  block.innerHTML = `
    <div class="press-nav-actions">
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
    </div>
  `;

  /* ================================
     Get shared news detail
  ================================ */
  const item = await getNewsDetail();

  if (!item || !item.publishDate) {
    console.warn("press-nav: publishDate missing");
    return;
  }

  const publishDate =
    item.publishDate?.iso ||
    item.publishDate?.value ||
    item.publishDate;

    const tags = item.tags || [];

  const formattedTags = tags.map((tag) =>
    tag
      .replace(/^news:/, "")
      .replace(/--/g, " & ")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
  block.innerHTML += `
    <div class="news-tags">
      <span class="news-tags-label">Tags:</span>
      <span class="news-tags-list">
        ${formattedTags.map((t) => `<span>${t}</span>`).join("<span class='sep'>|</span>")}
      </span>
    </div>
  `;

  /* ================================
     Fetch prev / next (GraphQL)
  ================================ */
  const prevUrl =
    `${getApiHost()}/api/v1/web/gmr-api/pre-news` +
    `;publishDate=${publishDate}`;

  const nextUrl =
    `${getApiHost()}/api/v1/web/gmr-api/news-next` +
    `;publishDate=${publishDate}`;
  
  const [prevRes, nextRes] = await Promise.all([
    fetchJSON(prevUrl),
    fetchJSON(nextUrl),
  ]);

  const prevItem = prevRes?.data?.preNews?.items?.[0];
  const nextItem = nextRes?.data?.nextNews?.items?.[0];

  /* ================================
     Wire PREV
  ================================ */
  if (prevItem) {
    const prevBtn = block.querySelector(".prev .nav-btn");
    const prevCard = block.querySelector(".prev .nav-hover-card");

    prevBtn.href = prevItem._path;
    prevBtn.classList.remove("disabled");
    prevCard.querySelector(".title").textContent = prevItem.title;
  }

  /* ================================
     Wire NEXT
  ================================ */
  if (nextItem) {
    const nextBtn = block.querySelector(".next .nav-btn");
    const nextCard = block.querySelector(".next .nav-hover-card");

    nextBtn.href = nextItem._path;
    nextBtn.classList.remove("disabled");
    nextCard.querySelector(".title").textContent = nextItem.title;
  }
}
