import { loadCSS, loadScript } from "../../scripts/aem.js";

export default async function decorate(block) {
  /* ----------------------------------
     Load Swiper (UI Safe)
  ---------------------------------- */
  // await loadCSS('/libs/swiper/swiper-bundle.min.css');
  await loadScript("https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js");

  /* ----------------------------------
     Check if in Universal Editor
  ---------------------------------- */
  const isUniversalEditor = document.querySelector('aem-extension, [data-aue-resource], [data-aue-prop]');
  const blockName = block.dataset.blockName || 'gmr-brand';

  /* ----------------------------------
     Read authored content
  ---------------------------------- */
  const rows = [...block.children];

  const sectionTitle = rows[0]?.querySelector("p")?.textContent?.trim() || "";
  const sectionDesc  = rows[1]?.querySelector("p")?.textContent?.trim() || "";

  const itemRows = rows.slice(2);

  /* ----------------------------------
     Build Swiper Markup with AEM UE attributes
  ---------------------------------- */
  const section = document.createElement("div");
  section.className = "sec-brand spacer";

  const container = document.createElement("div");
  container.className = "container";

  // Create header with AEM editable attributes
  const headerHTML = `
    <div class="row">
      <div class="col-md-7 text-center mx-auto mb-5">
        <h2 class="sec-title" ${isUniversalEditor ? `data-aue-prop="sectionTitle" data-aue-type="text" data-aue-label="Section Title"` : ''}>
          ${sectionTitle}
        </h2>
        <p class="sec-desc" ${isUniversalEditor ? `data-aue-prop="sectionDescription" data-aue-type="richtext" data-aue-label="Section Description"` : ''}>
          ${sectionDesc}
        </p>        
      </div>
    </div>
  `;

  container.innerHTML = headerHTML + `
    <div class="swiper gmr-brand-swiper">
      <div class="swiper-wrapper" ${isUniversalEditor ? `data-aue-prop="items" data-aue-type="multifield" data-aue-label="Brand Items" data-aue-model="brandItem"` : ''}></div>
      <div class="gmr-swiper-nav d-flex gap-3 justify-content-center mt-4">
        <button class="swiper-button-prev"></button>
        <button class="swiper-button-next"></button>
      </div>
    </div>
  `;

  const swiperWrapper = container.querySelector(".swiper-wrapper");

  /* ----------------------------------
     Define AEM Component Model for Universal Editor
  ---------------------------------- */
  if (isUniversalEditor) {
    // Add component model definition
    const modelScript = document.createElement('script');
    modelScript.type = 'application/json';
    modelScript.dataset.aueModel = blockName;
    modelScript.textContent = JSON.stringify({
      models: [
        {
          id: blockName,
          fields: [
            {
              component: "text",
              name: "sectionTitle",
              label: "Section Title"
            },
            {
              component: "richtext",
              name: "sectionDescription",
              label: "Section Description"
            },
            {
              component: "multifield",
              name: "items",
              label: "Brand Items",
              fields: [
                {
                  component: "reference",
                  name: "image",
                  label: "Brand Image"
                },
                {
                  component: "text",
                  name: "alt",
                  label: "Image Alt Text"
                },
                {
                  component: "text",
                  name: "title",
                  label: "Brand Title"
                },
                {
                  component: "richtext",
                  name: "description",
                  label: "Brand Description"
                },
                {
                  component: "text",
                  name: "cta",
                  label: "CTA Text"
                },
                {
                  component: "text",
                  name: "ctaLink",
                  label: "CTA Link"
                }
              ]
            }
          ]
        }
      ]
    });
    block.appendChild(modelScript);
  }

  /* ----------------------------------
     Build Slides from authored content with UE attributes
  ---------------------------------- */
  itemRows.forEach((row, index) => {
    if (row.children.length < 3) return; // skip invalid rows

    // Get all cells
    const imgCell   = row.children[0];
    const altCell   = row.children[1];
    const titleCell = row.children[2];
    const descCell  = row.children[3];
    const ctaCell   = row.children[4];

    // Add AEM UE attributes to cells
    if (isUniversalEditor) {
      // Mark each cell as editable
      if (imgCell) imgCell.dataset.aueProp = 'image';
      if (altCell) altCell.dataset.aueProp = 'alt';
      if (titleCell) titleCell.dataset.aueProp = 'title';
      if (descCell) descCell.dataset.aueProp = 'description';
      if (ctaCell) ctaCell.dataset.aueProp = 'cta';
    }

    const authoredAlt = altCell?.textContent?.trim() || "";
    const cardTitle   = titleCell?.textContent?.trim() || "";
    const desc        = descCell?.innerHTML?.trim() || "";
    const ctaText     = ctaCell?.textContent?.trim() || "Read More";
    const ctaLink     = ctaCell?.querySelector("a")?.href || "#";

    // Final alt: authored > title > ""
    const finalAlt = authoredAlt || cardTitle || "";

    // Get the rendered <picture> from authoring
    let pictureHtml = "";
    let picture = imgCell?.querySelector("picture");
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
    
    // Add GMR business item attributes for dropdown
    if (isUniversalEditor) {
      slide.dataset.aueType = "item";
      slide.dataset.aueResource = `${blockName}-item-${index}`;
      slide.dataset.aueModel = "brandItem";
    }

    slide.innerHTML = `
      <div class="card card-ui-two h-100 p-4">
        <div class="card-img" ${isUniversalEditor ? `data-aue-prop="image" data-aue-type="reference"` : ''}>
          ${pictureHtml}
        </div>

        <div class="card-body">
          ${cardTitle ? `<h5 class="card-title" ${isUniversalEditor ? `data-aue-prop="title" data-aue-type="text"` : ''}>${cardTitle}</h5>` : ""}
          ${desc ? `<div class="card-text mb-3" ${isUniversalEditor ? `data-aue-prop="description" data-aue-type="richtext"` : ''}>${desc}</div>` : ""}
          <div class="card-cta mt-auto">
            <a href="${ctaLink}" class="btn-link" ${isUniversalEditor ? `data-aue-prop="ctaLink" data-aue-type="text"` : ''}>
                ${ctaText}
            </a>
          </div>
        </div>
      </div>
    `;

    swiperWrapper.appendChild(slide);
  });

  /* ----------------------------------
     Hide original rows in Universal Editor
  ---------------------------------- */
  if (isUniversalEditor) {
    // Hide original table structure but keep it for authoring
    rows.forEach(row => {
      row.style.display = 'none';
    });
  }

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