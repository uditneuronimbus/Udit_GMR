import { loadCSS, loadScript } from "../../scripts/aem.js";

const SWIPER_JS = "../../scripts/swiper-bundle.min.js";
const SWIPER_CSS = "../../styles/swiper-bundle.min.css";

export default async function decorate(block) {
  /* ---------- Load Swiper (same as hero) ---------- */
  await loadCSS(SWIPER_CSS);
  await loadScript(SWIPER_JS);

  /* ---------- Preserve AEM editable fields ---------- */
  const original = [...block.children];
  if (!original.length) return;

  const sectionTitle = original[0];
  const sectionDesc = original[1];
  const items = original.slice(2);

  block.classList.add("awards-recognitions");

  /* ---------- Wrapper ---------- */
  const wrapper = document.createElement("div");
  wrapper.className = "awards-wrapper";

  /* ---------- Header (Title + Description in same container) ---------- */
  if (sectionTitle || sectionDesc) {
    const header = document.createElement("header");
    header.className = "entry-container text-center mb-5";

    // Title
    if (sectionTitle) {
      const titleText = sectionTitle.textContent.trim();
      if (titleText) {
        const h2 = document.createElement("h2");
        h2.className = "title";
        h2.textContent = titleText;
        header.appendChild(h2);
      }
    }

    // Description
    if (sectionDesc) {
      const descText = sectionDesc.textContent.trim();
      if (descText) {
        const p = document.createElement("p");
        p.className = "sec-desc";
        p.textContent = descText;
        header.appendChild(p);
      }
    }

    wrapper.append(header);
  }

  /* ---------- Swiper ---------- */
  const swiper = document.createElement("div");
  swiper.className = "swiper awards-swiper";

  const swiperWrapper = document.createElement("div");
  swiperWrapper.className = "swiper-wrapper";

  /* ---------- LOOP award-item → swiper-slide ---------- */
  items.forEach((item) => {
    if (!item || !item.children.length) return;

    const fields = [...item.children]; // image, title, desc

    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    const card = document.createElement("div");
    card.className = "award-card";

    /* Image */
    if (fields[0]) {
      const media = document.createElement("div");
      media.className = "award-media";
      media.append(fields[0]); // move node (UE preserved)
      card.append(media);
    }

    /* Title + Description Wrapper */
    if (fields[1] || fields[2]) {
      const content = document.createElement("div");
      content.className = "award-card-body";

      /* Title */
      if (fields[1]) {
        const text = fields[1].textContent.trim();

        if (text !== "") {
          const title = document.createElement("h3");
          title.textContent = text;
          content.append(title);
        }
      }

      /* Description */
      if (fields[2]) {
        const desc = document.createElement("div");
        desc.className = "award-desc";
        desc.innerHTML = fields[2].innerHTML;
        content.append(desc);
      }

      card.append(content);
    }

    // keep award-item wrapper (important for UE)
    item.innerHTML = "";
    item.append(card);

    slide.append(item);
    swiperWrapper.append(slide);
  });

  swiper.append(swiperWrapper);

  /* ---------- Pagination ---------- */
  const pagination = document.createElement("div");
  pagination.className = "swiper-pagination";
  swiper.append(pagination);

  wrapper.append(swiper);

  /* ---------- Replace block ---------- */
  block.innerHTML = "";
  block.append(wrapper);

  /* ---------- Init Swiper ---------- */
  new Swiper(swiper, {
    loop: items.length > 1,
    speed: 800,
    slidesPerView: 1,
    spaceBetween: 24,
    pagination: {
      el: pagination,
      clickable: true,
    },
    breakpoints: {
      768: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      },
    },
  });
}
