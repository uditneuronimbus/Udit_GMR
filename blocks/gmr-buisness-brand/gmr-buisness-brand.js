import { loadCSS, loadScript } from "../../scripts/aem.js";

const SWIPER_JS =
  "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js";
const SWIPER_CSS =
  "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.css";

export default async function decorate(block) {
  /* ================================
     1️⃣ Read authored content
  ================================ */
  const rows = [...block.children];
  if (rows.length < 3) return;

  const sectionTitle = rows[0]?.textContent?.trim() || "";
  const sectionDesc = rows[1]?.innerHTML || "";
  const itemRows = rows.slice(2);

  /* ================================
     2️⃣ UNIVERSAL EDITOR SAFE
     👉 DO NOT DELETE AUTHORED HTML
  ================================ */
  const isUE =
    document.querySelector(
      "aem-extension, [data-aue-resource], [data-aue-prop]"
    );

  if (isUE) {
    block.dataset.aueType = "container";
    block.dataset.aueLabel = "GMR Business Brand";

    // mark header editable
    rows[0].dataset.aueProp = "sectionTitle";
    rows[1].dataset.aueProp = "sectionDescription";

    // mark multifield container
    itemRows.forEach((row, i) => {
      row.dataset.aueType = "item";
      row.dataset.aueLabel = `GMR Business Item ${i + 1}`;
    });
  }

  /* Hide authored rows (IMPORTANT) */
  rows.forEach((row) => (row.style.display = "none"));

  /* ================================
     3️⃣ Create Swiper UI (outside block)
  ================================ */
  const section = document.createElement("section");
  section.className = "sec-brand spacer";

  section.innerHTML = `
    <div class="container">

      <div class="row">
        <div class="col-md-7 text-center mx-auto mb-5">
          <h2 class="sec-title">${sectionTitle}</h2>
          <div class="sec-desc">${sectionDesc}</div>
        </div>
      </div>

      <div class="swiper gmr-brand-swiper">
        <div class="swiper-wrapper"></div>
        <div class="gmr-swiper-nav d-flex gap-3 justify-content-center mt-4">
          <button class="swiper-button-prev"></button>
          <button class="swiper-button-next"></button>
        </div>
      </div>

    </div>
  `;

  block.after(section);

  const wrapper = section.querySelector(".swiper-wrapper");

  /* ================================
     4️⃣ Build Slides
  ================================ */
  itemRows.forEach((row) => {
    const cells = [...row.children];

    const img = cells[0]?.querySelector("img");
    const alt = cells[1]?.textContent?.trim() || "";
    const title = cells[2]?.textContent?.trim() || "";
    const desc = cells[3]?.innerHTML || "";
    const ctaLink = cells[4]?.querySelector("a")?.href || "#";
    const ctaText = cells[4]?.textContent?.trim() || "Read More";

    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    slide.innerHTML = `
      <div class="card card-ui-two h-100 p-4">
        ${
          img
            ? `
        <div class="card-img">
          <img src="${img.src}" alt="${alt || title}">
        </div>`
            : ""
        }

        <div class="card-body">
          <h5 class="card-title">${title}</h5>
          <div class="card-text mb-3">${desc}</div>

          <div class="card-cta mt-auto">
            <a href="${ctaLink}" class="btn-link">${ctaText}</a>
          </div>
        </div>
      </div>
    `;

    wrapper.append(slide);
  });

  /* ================================
     5️⃣ Load Swiper
  ================================ */
  await loadCSS(SWIPER_CSS);
  await loadScript(SWIPER_JS);

  new window.Swiper(section.querySelector(".gmr-brand-swiper"), {
    slidesPerView: 1,
    spaceBetween: 24,
    navigation: {
      nextEl: section.querySelector(".swiper-button-next"),
      prevEl: section.querySelector(".swiper-button-prev"),
    },
    breakpoints: {
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
  });
}
