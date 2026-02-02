import { loadCSS, loadScript } from "../../scripts/aem.js";

const SWIPER_JS = "../../scripts/swiper-bundle.min.js";
const SWIPER_CSS = "../../styles/swiper-bundle.min.css";

export default async function decorate(block) {
  /* ---------- Load Swiper assets ---------- */
  await loadCSS(SWIPER_CSS);
  await loadScript(SWIPER_JS);

  /* ---------- Read authored content ---------- */
  const rows = [...block.children];
  if (rows.length < 3) return;

  const headingRow = rows.shift();
  const descRow = rows.shift();

  block.classList.add("sec-image-slider");

  /* ---------- Container ---------- */
  const container = document.createElement("div");
  container.className = "container";

  /* ---------- Header ---------- */
  const headerRow = document.createElement("div");
  headerRow.className = "row";

  const col = document.createElement("div");
  col.className = "col-md-7 text-center mx-auto mb-5";

  const headingP = headingRow.querySelector("p");
  const descP = descRow.querySelector("p");

  if (headingP) {
    const heading = document.createElement("h2");
    heading.className = "sec-title";
    heading.textContent = headingP.textContent.trim();
    col.append(heading);
  }

  if (descP) {
    const desc = document.createElement("div");
    desc.className = "sec-desc";
    desc.append(descP); // move node (UE-safe)
    col.append(desc);
  }

  headerRow.append(col);

  /* ---------- Swiper ---------- */
  const swiperEl = document.createElement("div");
  swiperEl.className = "swiper image-slider-swiper";

  const swiperWrapper = document.createElement("div");
  swiperWrapper.className = "swiper-wrapper";

  rows.forEach((row) => {
    const picture = row.querySelector("picture");
    if (!picture) return;

    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    slide.append(picture); // move node

    swiperWrapper.append(slide);
  });

  swiperEl.append(swiperWrapper);

  /* ---------- Navigation ---------- */
  const prev = document.createElement("div");
  prev.className = "swiper-button-prev";

  const next = document.createElement("div");
  next.className = "swiper-button-next";

  swiperEl.append(prev, next);

  container.append(headerRow, swiperEl);

  /* ---------- Replace block ---------- */
  block.innerHTML = "";
  block.append(container);

  /* ---------- Init Swiper (IMPORTANT) ---------- */
  new window.Swiper(swiperEl, {
    slidesPerView: 2.5,
    spaceBetween: 20,
    loop: false,
    navigation: {
      nextEl: next,
      prevEl: prev,
    },
    breakpoints: {
      0: {
        slidesPerView: 1.2,
      },
      576: {
        slidesPerView: 2,
      },
      992: {
        slidesPerView: 2.5,
      },
    },
  });
}