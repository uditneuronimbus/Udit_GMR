import { loadCSS, loadScript } from "../../scripts/aem.js";

const SWIPER_JS = "../../scripts/swiper-bundle.min.js";
const SWIPER_CSS = "../../styles/swiper-bundle.min.css";

export default async function decorate(block) {
  /* ---------- Load Swiper ---------- */
  await loadCSS(SWIPER_CSS);
  await loadScript(SWIPER_JS);

  /* ---------- Preserve authored content ---------- */
  const original = [...block.children];
  if (original.length < 3) return;

  const headingRow = original[0];
  const descRow = original[1];
  const slideRows = original.slice(2);

  block.classList.add("sec-image-slider");

  /* ---------- Wrapper ---------- */
  const container = document.createElement("div");
  container.className = "container";

  /* ---------- Header ---------- */
  const headerRow = document.createElement("div");
  headerRow.className = "row";

  const col = document.createElement("div");
  col.className = "col-md-7 text-center mx-auto mb-5";

  /* Heading */
  const headingText = headingRow.textContent.trim();
  if (headingText) {
    const h2 = document.createElement("h2");
    h2.className = "sec-title";
    h2.textContent = headingText;
    col.append(h2);
  }

  /* Description */
  const descContent = descRow.innerHTML.trim();
  if (descContent) {
    const desc = document.createElement("div");
    desc.className = "sec-desc";
    desc.innerHTML = descContent;
    col.append(desc);
  }

  headerRow.append(col);
  container.append(headerRow);

  /* ---------- Swiper ---------- */
  const swiper = document.createElement("div");
  swiper.className = "swiper image-slider-swiper";

  const swiperWrapper = document.createElement("div");
  swiperWrapper.className = "swiper-wrapper";

  /* ---------- Slides ---------- */
  slideRows.forEach((row) => {
    const picture = row.querySelector("picture");
    if (!picture) return;

    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    /* Move node (UE-safe like reference code) */
    slide.append(picture);

    /* Keep row editable */
    row.innerHTML = "";
    row.append(slide);

    swiperWrapper.append(row);
  });

  swiper.append(swiperWrapper);

  /* ---------- Navigation ---------- */
  const prev = document.createElement("div");
  prev.className = "swiper-button-prev";

  const next = document.createElement("div");
  next.className = "swiper-button-next";

  swiper.append(prev, next);
  container.append(swiper);

  /* ---------- Replace block ---------- */
  block.innerHTML = "";
  block.append(container);

  /* ---------- Init Swiper ---------- */
  new Swiper(swiper, {
    slidesPerView: 2.5,
    spaceBetween: 20,
    loop: slideRows.length > 1,
    navigation: {
      nextEl: next,
      prevEl: prev,
    },
    breakpoints: {
      0: { slidesPerView: 1.2 },
      576: { slidesPerView: 2 },
      992: { slidesPerView: 2.5 },
    },
  });
}