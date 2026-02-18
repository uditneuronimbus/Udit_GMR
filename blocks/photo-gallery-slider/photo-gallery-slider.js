import { loadCSS, loadScript } from "../../scripts/aem.js";

const SWIPER_JS = "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js";

export default async function decorate(block) {
  /* ---------- Load Swiper ---------- */
  await loadScript(SWIPER_JS);

  /* ---------- Preserve authored structure ---------- */
  const original = [...block.children];
  if (original.length < 3) return;

  const headingRow = original[0];
  const descRow = original[1];
  const items = original.slice(2); // Each is a "photo-gallery-slider-item"

  block.classList.add("sec-photo-slider", "spacer");

  /* ---------- Container ---------- */
  const container = document.createElement("div");
  container.className = "container";

  /* ---------- Header ---------- */
  const headerRow = document.createElement("div");
  headerRow.className = "row";

  const col = document.createElement("div");
  col.className = "col-md-7 text-center mx-auto mb-5";

  const headingText = headingRow.textContent.trim();
  if (headingText) {
    const h2 = document.createElement("h2");
    h2.className = "sec-title";
    h2.textContent = headingText;
    col.append(h2);
  }

  if (descRow.innerHTML.trim()) {
    const desc = document.createElement("div");
    desc.className = "sec-desc";
    desc.innerHTML = descRow.innerHTML;
    col.append(desc);
  }

  headerRow.append(col);
  container.append(headerRow);

  /* ---------- Swiper ---------- */
  const swiper = document.createElement("div");
  swiper.className = "swiper image-slider-swiper";

  const swiperWrapper = document.createElement("div");
  swiperWrapper.className = "swiper-wrapper";

  /* ---------- Build slides using JSON model ---------- */
  items.forEach((item) => {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    // Based on your JSON fields:
    // Row 0 = image
    // Row 1 = altText
    // Row 2 = description

    const [imageRow, altRow, descRow] = [...item.children];

    const imgEl = imageRow ? imageRow.querySelector("img") : null;

    const imgSrc = imgEl ? imgEl.src : "";
    const altText = altRow ? altRow.textContent.trim() : "";
    const descriptionHTML = descRow ? descRow.innerHTML : "";

    // Wrappers
    const card = document.createElement("div");
    card.className = "card card-ui-one";

    const imgWrap = document.createElement("div");
    imgWrap.className = "card-img";

    const textWrap = document.createElement("div");
    textWrap.className = "card-body";

    /* ---------- Build Image Tag with correct ALT ---------- */
    if (imgSrc) {
      const finalImg = document.createElement("img");
      finalImg.src = imgSrc;
      finalImg.alt = altText; // ← JSON altText applied here
      finalImg.loading = "lazy";
      imgWrap.append(finalImg);
    }

    /* ---------- Add Description ---------- */
    if (descriptionHTML) {
      textWrap.innerHTML = descriptionHTML;
    }

    slide.append(card);
    card.append(imgWrap, textWrap);
    swiperWrapper.append(slide);
  });

  swiper.append(swiperWrapper);

  /* ---------- Navigation ---------- */

  const arrow = document.createElement("div");
  arrow.className = "d-flex gap-3 justify-content-center mt-5";

  const prev = document.createElement("div");
  prev.className = "swiper-button-prev";

  const next = document.createElement("div");
  next.className = "swiper-button-next";

  swiper.append(arrow);
  arrow.append(prev, next);
  container.append(swiper);

  /* ---------- Replace Block ---------- */
  block.innerHTML = "";
  block.append(container);

  /* ---------- Init Swiper ---------- */
  new window.Swiper(swiper, {
    slidesPerView: 2.5,
    spaceBetween: 20,
    loop: false,
    navigation: {
      nextEl: next,
      prevEl: prev,
    },
    breakpoints: {
      0: { slidesPerView: 1 },
      576: { slidesPerView: 2 },
      992: { slidesPerView: 2 },
    },
  });
}
