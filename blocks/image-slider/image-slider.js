import Swiper from "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs";

export default async function decorate(block) {
  const rows = [...block.children];

  // Extract heading & description
  const headingRow = rows.shift();
  const descRow = rows.shift();

  block.innerHTML = "";
  block.classList.add("sec-image-slider");

  const container = document.createElement("div");
  container.className = "container";

  /* Header */
  const headerRow = document.createElement("div");
  headerRow.className = "row";

  const col = document.createElement("div");
  col.className = "col-md-7 text-center mx-auto mb-5";

  // Extract original <p> elements
  const headingP = headingRow.querySelector("p");
  const descP = descRow.querySelector("p");

  // Create heading
  const heading = document.createElement("h2");
  heading.className = "sec-title";
  heading.textContent = headingP?.textContent || "";

  // Create description wrapper
  const desc = document.createElement("div");
  desc.className = "sec-desc";

  if (descP) {
    const descInner = document.createElement("div");
    descInner.append(descP);
    desc.append(descInner);
  }

  // Assemble
  col.append(heading, desc);
  headerRow.append(col);

  /* Swiper Structure */
  const swiperEl = document.createElement("div");
  swiperEl.className = "swiper image-slider-swiper";

  const wrapper = document.createElement("div");
  wrapper.className = "swiper-wrapper";

  rows.forEach((row) => {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    
    // Clone the entire row content to preserve all elements including images
    const content = row.innerHTML;
    
    // Instead of just extracting picture, preserve all original content
    // This ensures AEM's image handling (data attributes, etc.) is preserved
    slide.innerHTML = content;
    
    wrapper.append(slide);
  });

  swiperEl.append(wrapper);

  /* Navigation */
  const prev = document.createElement("div");
  prev.className = "swiper-button-prev";

  const next = document.createElement("div");
  next.className = "swiper-button-next";

  swiperEl.append(prev, next);

  container.append(headerRow, swiperEl);
  block.append(container);

  /* Init Swiper */
  new Swiper(swiperEl, {
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