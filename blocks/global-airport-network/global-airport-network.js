import { getFetchUrl } from '../lottie-animation/dam-json-helper.js';

export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 5) return;

  block.classList.add("global-airport-network");

  /* ================================
     1️⃣ Read authored content
  ================================ */

  const titleEl = rows[0];
  const descEl = rows[1];

  const mapImageRow = rows[2];
  const imageAltRow = rows[3];
  const lottiePathRow = rows[4];

  const itemRows = rows.slice(5);

  const titleText = titleEl?.textContent?.trim() || "";
  const hasTitle = titleText.length > 0;

  const mapImage = mapImageRow?.querySelector("img");
  const imageAltText = imageAltRow?.textContent?.trim() || "";

  /* ================================
     2️⃣ Resolve Lottie JSON path
  ================================ */

  let finalLottiePath = "";

  const lottieLink = lottiePathRow?.querySelector("a");
  const lottieText = lottiePathRow?.textContent?.trim();

  if (lottieLink) {
    const href = lottieLink.getAttribute("href") || "";
    finalLottiePath = getFetchUrl(href);
  } else if (lottieText) {
    // Treat as repository filename
    finalLottiePath = getFetchUrl(lottieText);
  }

  /* ================================
     3️⃣ Layout
  ================================ */

  const wrapper = document.createElement("div");
  wrapper.className = "gan-wrapper spacer";

  const container = document.createElement("div");
  container.className = "container";

  const row = document.createElement("div");
  row.className = "row align-items-center";

  /* ---------- Left column ---------- */

  const leftCol = document.createElement("div");
  leftCol.className = "col-lg-4 col-md-5";

  if (hasTitle) {
    titleEl.remove();
    const h2 = document.createElement("h2");
    h2.className = "sec-title mb-4";
    h2.textContent = titleText;
    leftCol.appendChild(h2);
  }

  descEl.remove();
  descEl.classList.add("sec-desc");
  descEl.removeAttribute("data-aue-label");
  leftCol.appendChild(descEl);

  /* ---------- Right column ---------- */

  const rightCol = document.createElement("div");
  rightCol.className = "col-lg-8 col-md-7";

  const mapWrap = document.createElement("div");
  mapWrap.className = "gan-map-wrap";

  /* ================================
     4️⃣ Background image
  ================================ */

  if (mapImage) {
    mapImage.removeAttribute("width");
    mapImage.removeAttribute("height");
    mapImage.setAttribute("alt", imageAltText || "");
    mapImage.classList.add("gan-map-image");
    mapWrap.appendChild(mapImage);
  }

  /* ================================
     5️⃣ Lottie container
  ================================ */

  const lottieWrap = document.createElement("div");
  lottieWrap.className = "gan-lottie";

  mapWrap.appendChild(lottieWrap);

  /* ================================
     6️⃣ Locations
  ================================ */

  const locationsWrap = document.createElement("div");
  locationsWrap.className = "gan-locations";
  locationsWrap.setAttribute("data-aue-label", "Airport Locations");

  mapWrap.appendChild(locationsWrap);
  rightCol.appendChild(mapWrap);

  row.appendChild(leftCol);
  row.appendChild(rightCol);

  container.appendChild(row);
  wrapper.appendChild(container);

  /* ================================
     7️⃣ Process items
  ================================ */

  itemRows.forEach((itemRow) => {
    if (!itemRow || itemRow.children.length < 3) return;

    const cells = [...itemRow.children];

    const airportEl = cells[0];
    const countryEl = cells[1];
    const flagEl = cells[2];
    const altCell = cells[3];

    const authoredAlt = altCell?.textContent?.trim() || "";
    const countryName = countryEl.textContent.trim();
    const finalAlt = authoredAlt || countryName;

    const img = flagEl.querySelector("img");
    if (img) img.setAttribute("alt", finalAlt);

    altCell?.remove();
    itemRow.remove();

    itemRow.className = "gan-location";
    itemRow.setAttribute("data-aue-behavior", "component");

    airportEl.classList.add("gan-airport");
    airportEl.removeAttribute("data-aue-label");

    countryEl.classList.add("gan-country");
    countryEl.removeAttribute("data-aue-label");

    flagEl.classList.add("gan-flag");
    flagEl.removeAttribute("data-aue-label");

    locationsWrap.appendChild(itemRow);
  });

  /* ================================
     8️⃣ Cleanup authored rows
  ================================ */

  mapImageRow?.remove();
  imageAltRow?.remove();
  lottiePathRow?.remove();

  /* ================================
     9️⃣ Replace block
  ================================ */

  block.innerHTML = "";
  block.appendChild(wrapper);

  /* ================================
     🔟 Initialize Lottie (bodymovin)
  ================================ */

  if (finalLottiePath && window.innerWidth >= 768) {
    const lottieObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        lottieObserver.disconnect();
        if (window.bodymovin) {
          window.bodymovin.loadAnimation({
            container: lottieWrap,
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: finalLottiePath,
          });
        } else {
          console.warn("❌ bodymovin library not loaded");
        }
      }
    }, { threshold: 0, rootMargin: '200px' });

    lottieObserver.observe(block);
  }
}