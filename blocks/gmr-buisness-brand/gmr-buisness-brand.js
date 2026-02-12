import { loadScript } from "../../scripts/aem.js";

export default async function decorate(block) {
  await loadScript("https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js");

  const rows = [...block.children];
  if (rows.length < 3) return;

  const sectionTitle = rows[0]?.textContent?.trim() || "";
  const sectionDesc  = rows[1]?.textContent?.trim() || "";
  const itemRows     = rows.slice(2);

  /* -----------------------------
     Create Structure (No innerHTML)
  ----------------------------- */

  const section = document.createElement("div");
  section.className = "sec-brand spacer";

  const container = document.createElement("div");
  container.className = "container";

  const headerRow = document.createElement("div");
  headerRow.className = "row";

  const headerCol = document.createElement("div");
  headerCol.className = "col-md-7 text-center mx-auto mb-5";

  if (sectionTitle) {
    const h2 = document.createElement("h2");
    h2.className = "sec-title";
    h2.textContent = sectionTitle;
    headerCol.appendChild(h2);
  }

  if (sectionDesc) {
    const p = document.createElement("p");
    p.className = "sec-desc";
    p.textContent = sectionDesc;
    headerCol.appendChild(p);
  }

  headerRow.appendChild(headerCol);
  container.appendChild(headerRow);

  /* -----------------------------
     Swiper Wrapper
  ----------------------------- */

  const swiper = document.createElement("div");
  swiper.className = "swiper gmr-brand-swiper";

  const swiperWrapper = document.createElement("div");
  swiperWrapper.className = "swiper-wrapper";

  swiper.appendChild(swiperWrapper);

  /* Navigation */

  const nav = document.createElement("div");
  nav.className = "gmr-swiper-nav d-flex gap-3 justify-content-center mt-4";

  const prevBtn = document.createElement("button");
  prevBtn.className = "swiper-button-prev";

  const nextBtn = document.createElement("button");
  nextBtn.className = "swiper-button-next";

  nav.appendChild(prevBtn);
  nav.appendChild(nextBtn);

  swiper.appendChild(nav);

  container.appendChild(swiper);
  section.appendChild(container);

  /* -----------------------------
     Build Slides (DOM Safe)
  ----------------------------- */

  itemRows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 3) return;

    const imgCell   = cells[0];
    const altCell   = cells[1];
    const titleCell = cells[2];
    const descCell  = cells[3];
    const ctaCell   = cells[4];

    const cardTitle = titleCell?.textContent?.trim() || "";
    const authoredAlt = altCell?.textContent?.trim() || "";

    const finalAlt = authoredAlt || cardTitle || "";

    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    const card = document.createElement("div");
    card.className = "card card-ui-two h-100 p-4";

    /* Move picture safely */
    const cardImg = document.createElement("div");
    cardImg.className = "card-img";

    const picture = imgCell?.querySelector("picture");
    if (picture) {
      const img = picture.querySelector("img");
      if (img && finalAlt) {
        img.setAttribute("alt", finalAlt);
      }
      cardImg.appendChild(picture); // MOVE node (not clone)
    }

    /* Card Body */
    const cardBody = document.createElement("div");
    cardBody.className = "card-body d-flex flex-column";

    if (cardTitle) {
      const h5 = document.createElement("h5");
      h5.className = "card-title";
      h5.textContent = cardTitle;
      cardBody.appendChild(h5);
    }

    if (descCell) {
      const descDiv = document.createElement("div");
      descDiv.className = "card-text mb-3";
      descDiv.append(...descCell.childNodes); // MOVE nodes safely
      cardBody.appendChild(descDiv);
    }

    if (ctaCell) {
      const link = ctaCell.querySelector("a");
      if (link) {
        const ctaWrapper = document.createElement("div");
        ctaWrapper.className = "card-cta mt-auto";
        ctaWrapper.appendChild(link); // MOVE link
        cardBody.appendChild(ctaWrapper);
      }
    }

    card.appendChild(cardImg);
    card.appendChild(cardBody);
    slide.appendChild(card);
    swiperWrapper.appendChild(slide);
  });

  /* -----------------------------
     Clean + Append (Safe)
  ----------------------------- */

  block.replaceChildren(section);

  /* -----------------------------
     Init Swiper
  ----------------------------- */

  // eslint-disable-next-line no-undef
  new Swiper(swiper, {
    slidesPerView: 1.1,
    spaceBetween: 24,
    loop: false,
    navigation: {
      nextEl: nextBtn,
      prevEl: prevBtn,
    },
    breakpoints: {
      768: { slidesPerView: 2.2 },
      1024: { slidesPerView: 3 },
    },
  });
}
