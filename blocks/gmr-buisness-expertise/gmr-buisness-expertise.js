export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 3) return;

  /* ================================
     1️⃣ Read authored content
  ================================ */
  const sectionTitleRow = rows[0];
  const sectionDescRow  = rows[1];
  const cardRows        = rows.slice(2);

  const sectionTitle = sectionTitleRow.textContent.trim();
  const sectionDesc  = sectionDescRow.innerHTML;

  /* ================================
     2️⃣ Hide authored rows (DO NOT REMOVE)
  ================================ */
  rows.forEach((row) => {
    row.style.display = "none";
  });

  /* ================================
     3️⃣ Runtime wrapper (OUTSIDE UE structure)
  ================================ */
  const runtime = document.createElement("div");
  runtime.className = "expertise-runtime";

  runtime.innerHTML = `
    <section class="sec-expertise spacer">
      <div class="container">  
          <div class="row justify-content-center">
            <div class="col-12">
                <div class="row">
                    <div class="col-md-7 text-center mx-auto mb-5">
                    <h2 class="sec-title">${sectionTitle}</h2>
                    <div class="sec-desc">${sectionDesc}</div>
                    </div>
                </div>   
            </div>
          </div>     
       
      </div>
    </section>
  `;

  block.after(runtime);

  const cardsRow = runtime.querySelector(".row");

  /* ================================
     4️⃣ Build cards
  ================================ */
  cardRows.forEach((row, index) => {
    const cells = [...row.children];
    if (cells.length < 3) return;

    // ───────────────────────────────────────
    //  Extract fields (adjust indices if order differs)
    // ───────────────────────────────────────
    const imgCell     = cells[0];
    const altCell     = cells[1];
    const titleCell   = cells[2];
    const descCell    = cells[3];
    const ctaCell     = cells[4];

    const authoredAlt = altCell?.textContent?.trim() || "";
    const title       = titleCell?.textContent?.trim() || "";
    const desc        = descCell?.textContent?.trim() || "";

    // Final alt logic: authored > title > ""
    const finalAlt = authoredAlt || title || "";

    let ctaText   = "";
    let ctaHref   = "";
    let ctaTarget = "_self";

    if (ctaCell) {
      const link = ctaCell.querySelector("a");
      if (link) {
        ctaText   = link.textContent.trim();
        ctaHref   = link.getAttribute("href");
        ctaTarget = link.getAttribute("target") || "_self";
      } else {
        const text = ctaCell.textContent.trim();
        if (text && text.toLowerCase() !== "na" && text.toLowerCase() !== "false") {
          ctaText = text;
          ctaHref = "#";
        }
      }
    }

    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4 mt-4";

    const card = document.createElement("div");
    card.className = index === 0 ? "card card-ui-one" : "card card-ui-one";

    /* ───────────────────────────────────────
       Handle image + alt override
    ──────────────────────────────────────── */
    const picture = imgCell?.querySelector("picture");
    if (picture) {
      const imgWrap = document.createElement("div");
      imgWrap.className = "card-img";

      // Use original picture HTML
      let pictureHtml = picture.outerHTML;

      // Override alt if we have a value to set
      if (finalAlt) {
        const temp = document.createElement("div");
        temp.innerHTML = pictureHtml;

        const img = temp.querySelector("img");
        if (img) {
          img.setAttribute("alt", finalAlt);
          pictureHtml = temp.innerHTML;
        }
      }

      imgWrap.innerHTML = pictureHtml;
      card.append(imgWrap);
    } else {
      // Optional: fallback if no picture — but keeping your original img logic
      const img = imgCell?.querySelector("img");
      if (img?.src) {
        const imgWrap = document.createElement("div");
        imgWrap.className = "card-img";

        const newImg = document.createElement("img");
        newImg.src = img.src;
        newImg.alt = finalAlt;           // ← apply final alt here too

        imgWrap.append(newImg);
        card.append(imgWrap);
      }
    }

    /* Content */
    const content = document.createElement("div");
    content.className = "card-body";

    content.innerHTML = `
      <h3 class="card-title">${title}</h3>
      <p class="card-desc">${desc}</p>
      ${ctaText
        ? `<div class="card-cta">
             <a href="${ctaHref}" target="${ctaTarget}" class="btn-link">
               ${ctaText}
             </a>
           </div>`
        : ""
      }
    `;

    card.append(content);
    col.append(card);
    cardsRow.append(col);
  });
}