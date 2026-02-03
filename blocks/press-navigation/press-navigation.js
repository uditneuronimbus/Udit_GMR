import { getApiHost } from "../../scripts/api.js";
import { getNewsDetail } from "../../scripts/news-api.js";

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
function slugToTitle(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default async function decorate(block) {
  const item = await getNewsDetail();

  block.classList.add("press-nav");
  const nextcat =slugToTitle(item.category);
  block.innerHTML = `
    <div class="press-nav-actions">
      <div class="press-nav-side prev">
        <a class="nav-btn disabled" >← Previous</a>
        <div class="nav-hover-card">
          <div class="label">Previous ${nextcat}</div>
          <div class="title">No previous article</div>
        </div>
      </div>

      <div class="press-nav-side next">
        <div class="nav-hover-card">
          <div class="label">Next ${nextcat}</div>
          <div class="title">No next article</div>
        </div>
        <a class="nav-btn primary disabled">Next →</a>
      </div>
    </div>
  `;

  
  
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

  const category = item.category;
  const prevUrl =
    `${getApiHost()}/api/v1/web/gmr-api/news-pre` +
    `?category=${category}` +
    `&publishDate=${publishDate}`;
 
  const nextUrl =
    `${getApiHost()}/api/v1/web/gmr-api/news-next` +
    `?category=${category}` +
    `&publishDate=${publishDate}`;
 
  const [prevRes, nextRes] = await Promise.all([
    fetchJSON(prevUrl),
    fetchJSON(nextUrl),
  ]);
  
  const prevItem = prevRes?.data?.data?.newsList?.items?.[0];
  const nextItem = nextRes?.data?.data?.newsList?.items?.[0];
  
  const parts = window.location.pathname.split("/").filter(Boolean);
  const lang = parts[0] || "en";
 
  if (prevItem) {
    const prevBtn = block.querySelector(".prev .nav-btn");
    const prevCard = block.querySelector(".prev .nav-hover-card");

    prevBtn.href = `/${lang}/news-update?post=${prevItem.slugUrl}`;
    prevBtn.classList.remove("disabled");
    prevCard.querySelector(".title").textContent = prevItem.title;
  }

  if (nextItem) {
    const nextBtn = block.querySelector(".next .nav-btn");
    const nextCard = block.querySelector(".next .nav-hover-card");

    nextBtn.href = `/${lang}/news-update?post=${nextItem.slugUrl}`;
    nextBtn.classList.remove("disabled");
    nextCard.querySelector(".title").textContent = nextItem.title;
  }
}
