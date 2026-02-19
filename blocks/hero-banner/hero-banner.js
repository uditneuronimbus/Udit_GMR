import { loadCSS, loadScript } from "../../scripts/aem.js";
import { trackPageVisit, getTargetOffer } from "../../scripts/target.js";

const SWIPER_JS = "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js";
const QUICK_LINKS_SCOPE = "hero-quick-links";


function isValidRow(row) {
  return (
    row.textContent.trim().length > 0 ||
    row.querySelector("picture") ||
    row.querySelector("a")
  );
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

function normaliseOffer(offer) {
  if (!offer) return null;
  if (Array.isArray(offer) && offer[0]?.url) return offer;           // [{ label, url }]
  if (Array.isArray(offer?.links) && offer.links[0]?.url) return offer.links; // { links: [...] }
  return null;
}

function renderLinks(dropdown, links) {
  dropdown.innerHTML = "";
  links.forEach(({ label, url }) => {
    const item = document.createElement("a");
    item.href = url;
    item.className = "quick-link-item";
    item.innerHTML = `
      ${label}
      <span>
        <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
             width="18" height="18" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round"
                stroke-linejoin="round" stroke-width="2" d="m9 5 7 7-7 7"/>
        </svg>
      </span>
    `;
    dropdown.appendChild(item);
  });
}

async function buildQuickLinks(block) {
  block.style.position = "relative";

  const offer = await getTargetOffer(QUICK_LINKS_SCOPE);

  // If Target returns nothing — visitor has no history yet, don't show widget
  if (!offer) return;

  // Read the actual visited pages from localStorage (already tracked by trackPageVisit)
  const { getCachedVisitedPages } = await import("../../scripts/target.js");
  const visited = getCachedVisitedPages();
  if (!visited?.length) return;

  const links = visited.slice(0, 5);

  /* Build widget only after we have real Target data */
  const wrapper = document.createElement("div");
  wrapper.className = "quick-links-wrapper";

  const button = document.createElement("button");
  button.className = "btn btn-primary quick-links-btn";
  button.innerHTML = `
    <span>Quick Links</span>
    <span class="arrow">
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-width="2" fill="none" d="m5 15 7-7 7 7"/>
      </svg>
    </span>
  `;

  const dropdown = document.createElement("div");
  dropdown.className = "quick-links-dropdown";

  renderLinks(dropdown, links.slice(0, 5));

  button.addEventListener("click", () => dropdown.classList.toggle("open"));

  wrapper.append(dropdown, button);
  block.appendChild(wrapper);
}

export default async function decorate(block) {
  trackPageVisit(); // fire-and-forget, non-blocking

  await loadScript(SWIPER_JS);

  const rows = [...block.children].filter(isValidRow);
  if (!rows.length) return;

  const swiperEl = document.createElement("div");
  swiperEl.className = "swiper hero-swiper";

  const wrapper = document.createElement("div");
  wrapper.className = "swiper-wrapper";

  rows.forEach((row) => {
    const cells = [...row.children];
    const [
      title, description, bgImage, bgVideo,
      knowLabel, knowLink, watchLabel, watchLink,
    ] = cells;

    const slide = document.createElement("div");
    slide.className = "swiper-slide hero-slide";

    const media = document.createElement("div");
    media.className = "hero-media";

    const picture = bgImage?.querySelector("picture");
    if (picture) media.append(picture);

    const videoAnchor = bgVideo?.querySelector("a");
    if (videoAnchor) {
      const video = document.createElement("video");
      video.src = videoAnchor.href;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      media.append(video);
    }

    const content = document.createElement("div");
    content.className = "hero-content";

    const container = document.createElement("div");
    container.className = "container";

    const contentInner = document.createElement("div");
    contentInner.className = "hero-content-inner";

    if (title?.textContent.trim()) {
      const h3 = document.createElement("h3");
      h3.innerHTML = title.innerHTML;
      contentInner.append(h3);
    }

    if (description?.innerHTML.trim()) {
      const div = document.createElement("div");
      div.className = "hero-desc";
      div.innerHTML = description.innerHTML;
      contentInner.append(div);
    }

    const actions = document.createElement("div");
    actions.className = "hero-actions";

    if (knowLabel?.textContent && knowLink?.querySelector("a")) {
      const a = knowLink.querySelector("a");
      a.textContent = knowLabel.textContent;
      a.className = "btn btn-primary";
      actions.append(a);
    }

    if (watchLabel?.textContent && watchLink?.querySelector("a")) {
      const a = watchLink.querySelector("a");
      a.textContent = watchLabel.textContent;
      a.className = "btn btn-outline-primary";
      actions.append(a);
    }

    contentInner.append(actions);
    container.append(contentInner);
    content.append(container);
    slide.append(media, content);
    wrapper.append(slide);
  });

  swiperEl.append(wrapper);
  block.append(swiperEl);
  block.classList.add("hero-banner-initialized");

  const swiperInstance = new Swiper(swiperEl, {
    loop: true,
    speed: 3000,
    autoplay: { delay: 5000, disableOnInteraction: false },
  });

  buildHeroNav(swiperInstance, rows.length);
  buildQuickLinks(block); // async, non-blocking — widget appears only when Target responds
}