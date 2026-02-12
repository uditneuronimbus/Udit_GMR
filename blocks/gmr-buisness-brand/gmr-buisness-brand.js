import { loadCSS, loadScript } from "../../scripts/aem.js";

export default async function decorate(block) {
  /* ----------------------------------
     Load Swiper (UI Safe)
  ---------------------------------- */
  await loadScript("https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.js");

  /* ----------------------------------
     Check if in Universal Editor
  ---------------------------------- */
  const isUniversalEditor = document.querySelector('aem-extension, [data-aue-resource], [data-aue-prop]');
  const blockName = block.dataset.blockName || 'gmr-brand';
  
  // Add block level UE attributes
  if (isUniversalEditor) {
    block.dataset.aueType = 'container';
    block.dataset.aueResource = `component/${blockName}`;
    block.dataset.aueLabel = 'GMR Brand';
  }

  /* ----------------------------------
     Read authored content
  ---------------------------------- */
  const rows = [...block.children];

  const sectionTitle = rows[0]?.querySelector("p")?.textContent?.trim() || "";
  const sectionDesc  = rows[1]?.querySelector("p")?.textContent?.trim() || "";

  const itemRows = rows.slice(2);

  /* ----------------------------------
     Define and register AEM Component Model for Universal Editor
  ---------------------------------- */
  if (isUniversalEditor) {
    // Remove any existing model script
    const existingModel = block.querySelector('script[data-aue-model="gmr-brand"]');
    if (existingModel) existingModel.remove();

    // Add component model definition
    const modelScript = document.createElement('script');
    modelScript.type = 'application/json';
    modelScript.dataset.aueModel = 'gmr-brand';
    modelScript.dataset.aueType = 'component';
    modelScript.dataset.aueLabel = 'GMR Brand Component';
    modelScript.textContent = JSON.stringify({
      models: [{
        id: 'gmr-brand',
        title: 'GMR Brand',
        fields: [
          {
            component: 'text',
            name: 'sectionTitle',
            label: 'Section Title',
            valueType: 'string'
          },
          {
            component: 'richtext',
            name: 'sectionDescription',
            label: 'Section Description',
            valueType: 'string'
          },
          {
            component: 'multifield',
            name: 'items',
            label: 'Brand Items',
            valueType: 'array',
            item: {
              component: 'model',
              fields: [
                {
                  component: 'reference',
                  name: 'image',
                  label: 'Brand Image',
                  valueType: 'string'
                },
                {
                  component: 'text',
                  name: 'alt',
                  label: 'Image Alt Text',
                  valueType: 'string'
                },
                {
                  component: 'text',
                  name: 'title',
                  label: 'Brand Title',
                  valueType: 'string'
                },
                {
                  component: 'richtext',
                  name: 'description',
                  label: 'Brand Description',
                  valueType: 'string'
                },
                {
                  component: 'text',
                  name: 'ctaText',
                  label: 'CTA Text',
                  valueType: 'string'
                },
                {
                  component: 'text',
                  name: 'ctaLink',
                  label: 'CTA Link',
                  valueType: 'string'
                }
              ]
            }
          }
        ]
      }]
    });
    block.appendChild(modelScript);
  }

  /* ----------------------------------
     Build Swiper Markup with AEM UE attributes
  ---------------------------------- */
  const section = document.createElement("div");
  section.className = "sec-brand spacer";

  const container = document.createElement("div");
  container.className = "container";

  // Create header with AEM editable attributes
  const headerDiv = document.createElement('div');
  headerDiv.className = 'row';
  headerDiv.innerHTML = `
    <div class="col-md-7 text-center mx-auto mb-5">
      <h2 class="sec-title">${sectionTitle}</h2>
      <p class="sec-desc">${sectionDesc}</p>        
    </div>
  `;

  // Add UE attributes to header elements
  if (isUniversalEditor) {
    const titleEl = headerDiv.querySelector('.sec-title');
    const descEl = headerDiv.querySelector('.sec-desc');
    
    titleEl.dataset.aueProp = 'sectionTitle';
    titleEl.dataset.aueType = 'text';
    titleEl.dataset.aueLabel = 'Section Title';
    
    descEl.dataset.aueProp = 'sectionDescription';
    descEl.dataset.aueType = 'richtext';
    descEl.dataset.aueLabel = 'Section Description';
  }

  container.appendChild(headerDiv);

  // Create swiper container with items container
  const swiperContainer = document.createElement('div');
  swiperContainer.className = 'swiper gmr-brand-swiper';
  
  const swiperWrapper = document.createElement('div');
  swiperWrapper.className = 'swiper-wrapper';
  
  // Add UE attributes to items container
  if (isUniversalEditor) {
    swiperWrapper.dataset.aueProp = 'items';
    swiperWrapper.dataset.aueType = 'multifield';
    swiperWrapper.dataset.aueLabel = 'Brand Items';
    swiperWrapper.dataset.aueModel = 'gmr-brand-item';
  }

  swiperContainer.appendChild(swiperWrapper);
  
  // Add navigation
  const navDiv = document.createElement('div');
  navDiv.className = 'gmr-swiper-nav d-flex gap-3 justify-content-center mt-4';
  navDiv.innerHTML = `
    <button class="swiper-button-prev"></button>
    <button class="swiper-button-next"></button>
  `;
  swiperContainer.appendChild(navDiv);
  
  container.appendChild(swiperContainer);

  /* ----------------------------------
     Build Slides from authored content with UE attributes
  ---------------------------------- */
  itemRows.forEach((row, index) => {
    if (row.children.length < 3) return;

    // Get all cells
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
      slide.dataset.aueResource = `component/gmr-brand/item-${index}`;
      slide.dataset.aueModel = "gmr-brand-item";
      slide.dataset.aueLabel = `Brand Item ${index + 1}`;
    }

    // Create card HTML
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card card-ui-two h-100 p-4';
    
    // Image section
    const imgDiv = document.createElement('div');
    imgDiv.className = 'card-img';
    if (isUniversalEditor) {
      imgDiv.dataset.aueProp = 'image';
      imgDiv.dataset.aueType = 'reference';
      imgDiv.dataset.aueLabel = 'Brand Image';
    }
    imgDiv.innerHTML = pictureHtml;
    cardDiv.appendChild(imgDiv);
    
    // Body section
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'card-body';
    
    if (cardTitle) {
      const titleEl = document.createElement('h5');
      titleEl.className = 'card-title';
      titleEl.textContent = cardTitle;
      if (isUniversalEditor) {
        titleEl.dataset.aueProp = 'title';
        titleEl.dataset.aueType = 'text';
        titleEl.dataset.aueLabel = 'Brand Title';
      }
      bodyDiv.appendChild(titleEl);
    }
    
    if (desc) {
      const descEl = document.createElement('div');
      descEl.className = 'card-text mb-3';
      descEl.innerHTML = desc;
      if (isUniversalEditor) {
        descEl.dataset.aueProp = 'description';
        descEl.dataset.aueType = 'richtext';
        descEl.dataset.aueLabel = 'Brand Description';
      }
      bodyDiv.appendChild(descEl);
    }
    
    // CTA section
    const ctaDiv = document.createElement('div');
    ctaDiv.className = 'card-cta mt-auto';
    
    const ctaLinkEl = document.createElement('a');
    ctaLinkEl.href = ctaLink;
    ctaLinkEl.className = 'btn-link';
    ctaLinkEl.textContent = ctaText;
    
    if (isUniversalEditor) {
      ctaLinkEl.dataset.aueProp = 'ctaLink';
      ctaLinkEl.dataset.aueType = 'text';
      ctaLinkEl.dataset.aueLabel = 'CTA Link';
      
      // Also add attribute for CTA text
      ctaLinkEl.dataset.aueProps = JSON.stringify({
        text: {
          component: 'text',
          label: 'CTA Text',
          value: ctaText
        }
      });
    }
    
    ctaDiv.appendChild(ctaLinkEl);
    bodyDiv.appendChild(ctaDiv);
    cardDiv.appendChild(bodyDiv);
    slide.appendChild(cardDiv);
    
    swiperWrapper.appendChild(slide);
  });

  /* ----------------------------------
     Preserve original table structure for UE
  ---------------------------------- */
  if (isUniversalEditor) {
    // Keep original rows but hide them
    rows.forEach(row => {
      row.style.display = 'none';
    });
    
    // Add the original table as hidden content for UE to recognize
    const originalTable = document.createElement('div');
    originalTable.style.display = 'none';
    originalTable.dataset.aueOriginal = 'true';
    
    // Clone the original block children
    rows.forEach(row => {
      const clone = row.cloneNode(true);
      originalTable.appendChild(clone);
    });
    
    block.appendChild(originalTable);
  }

  /* ----------------------------------
     Replace block HTML
  ---------------------------------- */
  block.innerHTML = "";
  block.appendChild(section);
  block.appendChild(container);

  /* ----------------------------------
     Init Swiper
  ---------------------------------- */
  setTimeout(() => {
    if (typeof Swiper !== 'undefined') {
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
  }, 100);
}