export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 5) return;

  block.classList.add("global-airport-network");

  /* ================================
     1️⃣ Read authored content
  ================================= */

  const titleEl = rows[0];
  const descEl = rows[1];
  const mapImageRow = rows[2];
  const imageAltRow = rows[3];
  // rows[4] = lottiePath (ignored completely)
  const itemRows = rows.slice(5);

  const titleText = titleEl?.textContent?.trim() || "";
  const hasTitle = titleText.length > 0;

  const mapImage = mapImageRow?.querySelector("img");
  const imageAltText = imageAltRow?.textContent?.trim() || "";

  /* ================================
     2️⃣ Create wrapper
  ================================= */

  const wrapper = document.createElement("div");
  wrapper.className = "gan-wrapper spacer";

  const container = document.createElement("div");
  container.className = "container";

  const row = document.createElement("div");
  row.className = "row align-items-center";

  /* ---------- Left Column ---------- */

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

  /* ---------- Right Column ---------- */

  const rightCol = document.createElement("div");
  rightCol.className = "col-lg-8 col-md-7";

  const mapWrap = document.createElement("div");
  mapWrap.className = "gan-map-wrap";

  /* ================================
     3️⃣ Background Map Image
  ================================= */

  if (mapImage) {
    mapImage.removeAttribute("width");
    mapImage.removeAttribute("height");
    mapImage.classList.add("gan-map-image");
    mapImage.setAttribute("alt", imageAltText || "");
    mapWrap.appendChild(mapImage);
  }

  /* ================================
     4️⃣ Locations Wrapper
  ================================= */

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
     5️⃣ Process Location Items
     (airportName, countryName, flagIcon, imageAlt)
  ================================= */

  itemRows.forEach((itemRow) => {
    if (!itemRow || itemRow.children.length < 3) return;

    const cells = [...itemRow.children];

    const airportEl = cells[0];
    const countryEl = cells[1];
    const flagEl = cells[2];
    const altCell = cells[3]; // optional

    const authoredAlt = altCell?.textContent?.trim() || "";
    const countryName = countryEl?.textContent?.trim() || "";
    const finalAlt = authoredAlt || countryName;

    const img = flagEl?.querySelector("img");
    if (img) img.setAttribute("alt", finalAlt);

    altCell?.remove();
    itemRow.remove();

    itemRow.className = "gan-location";
    itemRow.setAttribute("data-aue-behavior", "component");

    airportEl?.classList.add("gan-airport");
    airportEl?.removeAttribute("data-aue-label");

    countryEl?.classList.add("gan-country");
    countryEl?.removeAttribute("data-aue-label");

    flagEl?.classList.add("gan-flag");
    flagEl?.removeAttribute("data-aue-label");

    locationsWrap.appendChild(itemRow);
  });

  /* ================================
     6️⃣ Cleanup Unused Rows
  ================================= */

  mapImageRow?.remove();
  imageAltRow?.remove();
  rows[4]?.remove(); // remove lottiePath row completely

  block.innerHTML = "";
  block.appendChild(wrapper);
}