import { loadCSS, loadScript } from "../../scripts/aem.js";

export default async function decorate(block) {
  /* ----------------------------------
     Load Swiper
  ---------------------------------- */
  await loadScript("https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js");

  /* ----------------------------------
     Check Universal Editor
  ---------------------------------- */
  const isUniversalEditor =
    document.querySelector("aem-extension, [data-aue-resource], [data-aue-prop]");

  const blockName = block.dataset.blockName || "gmr-brand";

  if (isUniversalEditor) {
    block.dataset.aueType = "container";
    block.dataset.aueResource = `component/${blockName}`;
    block.dataset.aueLabel = "GMR Brand";
  }

  /* ----------------------------------
     Read authored content
  ---------------------------------- */
  const rows = [...block.children];

  const sectionTitle =
    rows[0]?.querySelector("p")?.textContent?.trim() || "";
  const sectionDesc =
    rows[1]?.querySelector("p")?.textContent?.trim() || "";

  const itemRows = rows.slice(2);

  /* ----------------------------------
     CLEAR BLOCK FIRST (IMPORTANT)
     Prevents model deletion issue
  ---------------------------------- */
  block.innerHTML = "";

  /* ----------------------------------
     Build Layout
  ---------------------------------- */
  const section = document.createElement("div");
  section.className = "sec-brand spacer";

  const container = document.createElement("div");
  container.className = "container";

  /* ---------- Header ---------- */
  const headerRow = document.createElement("div");
  headerRow.className = "row";

  const headerCol = document.createElement("div");
  headerCol.className = "col-md-7 text-center mx-auto mb-5";

  const titleEl = document.createElement("h2");
  titleEl.className = "sec-title";
  titleEl.textContent = sectionTitle;

  const descEl = document.createElement("p");
  descEl.className = "sec-desc";
  descEl.textContent = sectionDesc;

  if (isUniversalEditor) {
    titleEl.dataset.aueProp = "sectionTitle";
    titleEl.dataset.aueType = "text";

    descEl.dataset.aueProp = "sectionDescription";
    descEl.dataset.aueType = "richtext";
  }

  headerCol.append(titleEl, descEl);
  headerRow.appendChild(headerCol);
  container.appendChild(headerRow);

  /* ---------- Swiper ---------- */
  const swiperContainer = document.createElement("div");
  swiperContainer.className = "swiper gmr-brand-swiper";

  const swiperWrapper = document.createElement("div");
  swiperWrapper.className = "swiper-wrapper";

  if (isUniversalEditor) {
    swiperWrapper.dataset.aueProp = "items";
    swiperWrapper.dataset.aueType = "multifield";
    swiperWrapper.dataset.aueLabel = "Brand Items";
    swiperWrapper.dataset.aueModel = "gmr-brand";
  }

  swiperContainer.appendChild(swiperWrapper);

  /* ---------- Navigation ---------- */
  const nav = document.createElement("div");
  nav.className =
    "gmr-swiper-nav d-flex gap-3 justify-content-center mt-4";

  nav.innerHTML = `
    <button class="swiper-button-prev"></button>
    <button class="swiper-button-next"></button>
  `;

  swiperContainer.appendChild(nav);
  container.appendChild(swiperContainer);

  /* ----------------------------------
     Build Slides
  ---------------------------------- */
  itemRows.forEach((row, index) => {
    if (row.children.length < 3) return;

    const imgCell = row.children[0];
    const altCell = row.children[1];
    const titleCell = row.children[2];
    const descCell = row.children[3];
    const ctaCell = row.children[4];

    const authoredAlt = altCell?.textContent?.trim() || "";
    const cardTitle = titleCell?.textContent?.trim() || "";
    const desc = descCell?.innerHTML?.trim() || "";
    const ctaText = ctaCell?.textContent?.trim() || "Read More";
    const ctaLink = ctaCell?.querySelector("a")?.href || "#";

    const finalAlt = authoredAlt || cardTitle || "";

    /* ----- Get picture ----- */
    let pictureHtml = "";
    const picture = imgCell?.querySelector("picture");

    if (picture) {
      const temp = document.createElement("div");
      temp.innerHTML = picture.outerHTML;

      const img = temp.querySelector("img");
      if (img && finalAlt) img.setAttribute("alt", finalAlt);

      pictureHtml = temp.innerHTML;
    }

    /* ----- Slide ----- */
    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    if (isUniversalEditor) {
      slide.dataset.aueType = "item";
      slide.dataset.aueResource = `component/${blockName}/item-${index}`;
      slide.dataset.aueModel = "gmr-brand";
      slide.dataset.aueLabel = `Brand Item ${index + 1}`;
    }

    const card = document.createElement("div");
    card.className = "card card-ui-two h-100 p-4";

    /* Image */
    const imgDiv = document.createElement("div");
    imgDiv.className = "card-img";
    imgDiv.innerHTML = pictureHtml;

    if (isUniversalEditor) {
      imgDiv.dataset.aueProp = "image";
      imgDiv.dataset.aueType = "reference";
    }

    /* Body */
    const body = document.createElement("div");
    body.className = "card-body";

    if (cardTitle) {
      const t = document.createElement("h5");
      t.className = "card-title";
      t.textContent = cardTitle;

      if (isUniversalEditor) {
        t.dataset.aueProp = "title";
        t.dataset.aueType = "text";
      }

      body.appendChild(t);
    }

    if (desc) {
      const d = document.createElement("div");
      d.className = "card-text mb-3";
      d.innerHTML = desc;

      if (isUniversalEditor) {
        d.dataset.aueProp = "description";
        d.dataset.aueType = "richtext";
      }

      body.appendChild(d);
    }

    /* CTA */
    const ctaWrap = document.createElement("div");
    ctaWrap.className = "card-cta mt-auto";

    const link = document.createElement("a");
    link.href = ctaLink;
    link.textContent = ctaText;
    link.className = "btn-link";

    if (isUniversalEditor) {
      link.dataset.aueProp = "ctaText";
      link.dataset.aueHref = "ctaLink";
    }

    ctaWrap.appendChild(link);
    body.appendChild(ctaWrap);

    card.append(imgDiv, body);
    slide.appendChild(card);
    swiperWrapper.appendChild(slide);
  });

  /* ----------------------------------
     Append Layout
  ---------------------------------- */
  block.appendChild(section);
  block.appendChild(container);

  /* ----------------------------------
     Add Universal Editor Model
     (AFTER rendering — VERY IMPORTANT)
  ---------------------------------- */
  if (isUniversalEditor) {
    const modelScript = document.createElement("script");
    modelScript.type = "application/json";
    modelScript.dataset.aueModel = "gmr-brand";

    modelScript.textContent = JSON.stringify({
      models: [
        {
          id: "gmr-brand",
          fields: [
            {
              component: "text",
              name: "sectionTitle",
              label: "Section Title",
            },
            {
              component: "richtext",
              name: "sectionDescription",
              label: "Section Description",
            },
            {
              component: "multifield",
              name: "items",
              label: "Brand Items",
              item: {
                component: "model",
                fields: [
                  { component: "reference", name: "image", label: "Image" },
                  { component: "text", name: "title", label: "Title" },
                  { component: "richtext", name: "description", label: "Description" },
                  { component: "text", name: "ctaText", label: "CTA Text" },
                  { component: "text", name: "ctaLink", label: "CTA Link" },
                ],
              },
            },
          ],
        },
      ],
    });

    block.appendChild(modelScript);
  }

  /* ----------------------------------
     Init Swiper
  ---------------------------------- */
  setTimeout(() => {
    if (window.Swiper) {
      new window.Swiper(".gmr-brand-swiper", {
        slidesPerView: 1,
        spaceBetween: 24,
        loop: false,
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
        breakpoints: {
          768: { slidesPerView: 2},
          1024: { slidesPerView: 3 },
        },
      });
    }
  }, 200);
}
