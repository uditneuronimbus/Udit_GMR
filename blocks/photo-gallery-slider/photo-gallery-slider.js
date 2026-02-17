import { loadCSS, loadScript } from "../../scripts/aem.js";

const SWIPER_JS = "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js";
const SWIPER_CSS =
  "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css";

export default async function decorate(block) {
  /* ---------------- Load Swiper ---------------- */
  await loadCSS(SWIPER_CSS);
  await loadScript(SWIPER_JS);

  /* ---------------- Collect Authored Rows ---------------- */
  const rows = [...block.children];
  if (rows.length < 3) return;

  const headingRow = rows[0];
  const descRow = rows[1];
  const itemRows = rows.slice(2);

  /* ---------------- Main Wrapper ---------------- */
  block.innerHTML = "";
  block.classList.add("photo-gallery-slider-wrapper");

  const container = document.createElement("div");
  container.className = "container";

  /* ---------------- Header ---------------- */
  const header = document.createElement("div");
  header.className = "pgs-header text-center mb-5";

  const heading = headingRow.textContent.trim();
  if (heading) {
    const h2 = document.createElement("h2");
    h2.className = "pgs-title";
    h2.textContent = heading;
    header.append(h2);
  }

  const descHTML = descRow.innerHTML.trim();
  if (descHTML) {
    const desc = document.createElement("div");
    desc.className = "pgs-desc";
    desc.innerHTML = descHTML;
    header.append(desc);
  }

  container.append(header);

  /* ---------------- Swiper Root ---------------- */
  const swiperEl = document.createElement("div");
  swiperEl.className = "swiper pgs-swiper";

  const wrapperEl = document.createElement("div");
  wrapperEl.className = "swiper-wrapper";

  /* ---------------- Slides ---------------- */
  itemRows.forEach((itemRow, index) => {
    const slide = document.createElement("div");
    slide.className = "swiper-slide pgs-slide";

    // Keep the authored structure intact (image + caption)
    itemRow.classList.add("pgs-item");

    // Add indexing for accessibility
    itemRow.setAttribute("data-slide-index", index + 1);

    slide.append(itemRow);
    wrapperEl.append(slide);
  });

  swiperEl.append(wrapperEl);

  /* ---------------- Navigation Buttons ---------------- */
  const navContainer = document.createElement("div");
  navContainer.className = "pgs-nav";

  const prev = document.createElement("button");
  prev.className = "swiper-button-prev pgs-prev";
  prev.setAttribute("aria-label", "Previous slide");
  prev.innerHTML = `<span>&larr;</span>`;

  const next = document.createElement("button");
  next.className = "swiper-button-next pgs-next";
  next.setAttribute("aria-label", "Next slide");
  next.innerHTML = `<span>&rarr;</span>`;

  navContainer.append(prev, next);

  swiperEl.append(navContainer);
  container.append(swiperEl);

  /* ---------------- Append to Block ---------------- */
  block.append(container);

  /* ---------------- Init Swiper ---------------- */
  new window.Swiper(swiperEl, {
    slidesPerView: 2.5,
    spaceBetween: 20,
    loop: itemRows.length > 1,
    navigation: {
      nextEl: next,
      prevEl: prev,
    },
    breakpoints: {
      0: { slidesPerView: 1.1, spaceBetween: 15 },
      576: { slidesPerView: 1.5, spaceBetween: 20 },
      768: { slidesPerView: 2, spaceBetween: 20 },
      1200: { slidesPerView: 2.5, spaceBetween: 24 },
    },
  });
}
