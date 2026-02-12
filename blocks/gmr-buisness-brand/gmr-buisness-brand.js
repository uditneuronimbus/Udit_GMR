import { loadCSS, loadScript } from "../../scripts/aem.js";

export default async function decorate(block) {
  /* ----------------------------------
     Load Swiper (UI Safe)
  ---------------------------------- */
  // await loadCSS('/libs/swiper/swiper-bundle.min.css');
  await loadScript("https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js");

  /* ----------------------------------
     Read authored content
  ---------------------------------- */
  const rows = [...block.children];

  const sectionTitle = rows[0]?.querySelector("p")?.textContent?.trim() || "";
  const sectionDesc  = rows[1]?.querySelector("p")?.textContent?.trim() || "";

  const itemRows = rows.slice(2);

  /* ----------------------------------
     Build Swiper Markup
  ---------------------------------- */
  const section = document.createElement("div");
  section.className = "sec-brand spacer";

  const container = document.createElement("div");
  container.className = "container";

  container.innerHTML = `
    <div class="row">
        <div class="col-md-7 text-center mx-auto mb-5">
         <h2 class="sec-title">${sectionTitle}</h2>
          <p class="sec-desc">${sectionDesc}</p>        
        </div>
    </div>
    <div class="swiper gmr-brand-swiper">
      <div class="swiper-wrapper"></div>
      <div class="gmr-swiper-nav d-flex gap-3 justify-content-center mt-4">
        <button class="swiper-button-prev"></button>
        <button class="swiper-button-next"></button>
      </div>
    </div>
  `;

  const swiperWrapper = container.querySelector(".swiper-wrapper");

  /* ----------------------------------
     Build Slides from authored content
  ---------------------------------- */
  itemRows.forEach((row) => {
    if (row.children.length < 3) return; // skip invalid rows

    // Assuming order: image, alt-text, title, description, cta
    const imgCell   = row.children[0];
    const altCell   = row.children[1];
    const titleCell = row.children[2];
    const descCell  = row.children[3];
    const ctaCell   = row.children[4];

    const authoredAlt = altCell?.textContent?.trim() || "";
    const cardTitle   = titleCell?.textContent?.trim() || "";
    const desc        = descCell?.innerHTML?.trim() || "";
    const ctaText     = ctaCell?.textContent?.trim() || "Read More";
    const ctaLink     = ctaCell?.querySelector("a")?.href || "#";

    // Final alt: authored > title > ""
    const finalAlt = authoredAlt || cardTitle || "";

    // Get the rendered <picture> from authoring
    let pictureHtml = "";
    const picture = imgCell?.querySelector("picture");
    if (picture) {
      pictureHtml = picture.outerHTML;

      // Override alt if needed
      if (finalAlt) {
        const temp = document.createElement("div");
        temp.innerHTML = pictureHtml;

        const img = temp.querySelector("img");
        if (img) {
          img.setAttribute("alt", finalAlt);
          pictureHtml = temp.innerHTML;
        }
      }
    }

    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    slide.innerHTML = `
      <div class="card card-ui-two h-100 p-4">
        <div class="card-img">${pictureHtml}</div>

        <div class="card-body">
          ${cardTitle ? `<h5 class="card-title">${cardTitle}</h5>` : ""}
          ${desc ? `<div class="card-text mb-3">${desc}</div>` : ""}
          <div class="card-cta mt-auto">
            <a href="${ctaLink}" class="btn-link">
                ${ctaText}
            </a>
          </div>
        </div>
      </div>
    `;

    swiperWrapper.appendChild(slide);
  });

  /* ----------------------------------
     Replace block HTML
  ---------------------------------- */
  block.innerHTML = "";
  section.appendChild(container);
  block.appendChild(section);

  /* ----------------------------------
     Init Swiper
  ---------------------------------- */
  // eslint-disable-next-line no-undef
  new Swiper(".gmr-brand-swiper", {
    slidesPerView: 1.1,
    spaceBetween: 24,
    loop: false,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
      768: {
        slidesPerView: 2.2,
      },
      1024: {
        slidesPerView: 3,
      },
    },
  });
}