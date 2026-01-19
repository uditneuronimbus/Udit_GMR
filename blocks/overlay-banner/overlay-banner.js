export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 6) return;

  block.classList.add("banner-overlay-sec");

  /* =========================
     Read UE-authored fields
  ========================== */
  const imageRow = rows[0];      // desktop image
  const imageRowMobile = rows[1]; // mobile image (image1)
  const titleRow = rows[2];
  const descRow = rows[3];
  const buttonTextRow = rows[4];
  const buttonLinkRow = rows[5];

  const picture = imageRow.querySelector("picture");
  const pictureMobile = imageRowMobile.querySelector("picture");

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
  if (picture) {
    picture.classList.add("banner-overlay-img");
    bannerOverlay.append(picture);
  }

  if (pictureMobile) {
    pictureMobile.classList.add("banner-overlay-img");
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

    if (!h2) {
      const p = titleCell.querySelector("p");

      if (p) {
        h2 = document.createElement("h2");
        h2.innerHTML = p.innerHTML;
        p.replaceWith(h2);
      } else {
        h2 = document.createElement("h2");
        h2.innerHTML = titleCell.innerHTML;
        titleCell.innerHTML = "";
        titleCell.appendChild(h2);
      }
    }

    h2.classList.add("sec-title", "mb-4");
    col.append(titleCell);
  }

  /* ---- Description ---- */
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

  /* =========================
     Mobile switch (NO styling change)
  ========================== */
  const mq = window.matchMedia("(max-width: 767px)");

  const toggleImages = () => {
    if (picture) picture.style.display = mq.matches ? "none" : "";
    if (pictureMobile) pictureMobile.style.display = mq.matches ? "" : "none";
  };

  toggleImages();
  mq.addEventListener("change", toggleImages);
}
