export default function decorate(block) {
  const rows = [...block.children];
  // Now expect 6 rows: image, title, desc, buttonText, buttonLink, image1
  if (rows.length < 6) return;

  block.classList.add("banner-overlay-sec");

  /* =========================
     Read UE-authored fields
  ========================== */
  const imageRow = rows[0];      // Desktop image
  const titleRow = rows[1];      // Title
  const descRow = rows[2];       // Description
  const buttonTextRow = rows[3]; // Button text
  const buttonLinkRow = rows[4]; // Button link
  const image1Row = rows[5];     // Mobile image (image1)

  const pictureDesktop = imageRow.querySelector("picture");
  const pictureMobile = image1Row.querySelector("picture");

  const titleCell = titleRow.children[0];
  const descCell = descRow.children[0];
  const btnText = buttonTextRow.textContent.trim();
  const btnLink =
    buttonLinkRow.querySelector("a")?.getAttribute("href") ||
    buttonLinkRow.textContent.trim();

  const hasDesc = descCell && descCell.textContent.trim().length > 0;
  const hasButton = btnText.length > 0 && btnLink.length > 0;

  /* =========================
     Build flat Structure
  ========================== */
  const container = document.createElement("div");
  container.className = "container";

  const bannerOverlay = document.createElement("div");
  bannerOverlay.className = "banner-overlay";

  /* ---- Background Images ---- */
  // Desktop image (shown by default)
  if (pictureDesktop) {
    pictureDesktop.classList.add("banner-overlay-img", "desktop-only");
    bannerOverlay.append(pictureDesktop);
  }

  // Mobile image (hidden on desktop)
  if (pictureMobile) {
    pictureMobile.classList.add("banner-overlay-img", "mobile-only");
    bannerOverlay.append(pictureMobile);
  }

  /* ---- Overlay Content ---- */
  const overlay = document.createElement("div");
  overlay.className = "banner-overlay-text";

  const row = document.createElement("div");
  row.className = "row";

  const col = document.createElement("div");
  col.className = "col-md-7";

  /* ---- Title ---- */
  if (titleCell) {
    let h2 = titleCell.querySelector("h2");

    // Convert <p> → <h2> if h2 doesn't exist
    if (!h2) {
      const p = titleCell.querySelector("p");

      if (p) {
        h2 = document.createElement("h2");
        h2.innerHTML = p.innerHTML; // keep formatting
        p.replaceWith(h2);
      } else {
        // fallback: wrap plain text
        h2 = document.createElement("h2");
        h2.innerHTML = titleCell.innerHTML;
        titleCell.innerHTML = "";
        titleCell.appendChild(h2);
      }
    }

    h2.classList.add("sec-title", "mb-4");
    col.append(titleCell);
  }

  /* ---- Description (optional) ---- */
  if (hasDesc) {
    descCell.classList.add("sec-desc", "mb-4");
    col.append(descCell);
  }

  /* ---- Button ---- */
  if (hasButton) {
    const btn = document.createElement("a");
    btn.href = btnLink;
    btn.className = "btn btn-primary btn-lg";
    btn.textContent = btnText;
    col.append(btn);
  }

  row.append(col);
  overlay.append(row);
  bannerOverlay.append(overlay);
  container.append(bannerOverlay);

  /* =========================
     Assemble (UE-safe)
  ========================== */
  block.innerHTML = "";
  block.append(container);
}