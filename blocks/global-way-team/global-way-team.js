export default function decorate(block) {
    const rows = [...block.children];
    if (rows.length < 2) return;

    block.classList.add("global-way-team");

    /* ================================
       1️⃣ Identify fields safely
       ================================ */
    let imageRow = null;
    let imageAltRow = null;
    let titleEl = null;
    let descEl = null;
    let footerEl = null;
    const itemRows = [];

    rows.forEach((row) => {
        if (!imageRow && row.querySelector("img, picture, svg")) {
            imageRow = row;
            return;
        }

        if (!imageAltRow && row.dataset?.aueLabel === "Alt Text") {
            imageAltRow = row;
            return;
        }

        if (!titleEl && row.querySelector("h1, h2, h3")) {
            titleEl = row;
            return;
        }

        if (!descEl && row.querySelector("p")) {
            descEl = row;
            return;
        }

        if (!footerEl && row.textContent.trim()) {
            footerEl = row;
            return;
        }

        itemRows.push(row);
    });

    const sectionTitle =
        titleEl?.textContent?.trim() || "Global Way Team";

    const imageAlt = imageAltRow?.textContent?.trim() || sectionTitle;

    /* ================================
       2️⃣ Wrapper
       ================================ */
    const wrapper = document.createElement("div");
    wrapper.className = "gwt-wrapper spacer";

    /* ================================
       3️⃣ Main content layout
       ================================ */
    if (imageRow || titleEl || descEl) {
        const container = document.createElement("div");
        container.className = "container";

        const row = document.createElement("div");
        row.className = "row align-items-center";

        /* LEFT COLUMN → IMAGE + TITLE */
        if (imageRow || titleEl) {
            const leftCol = document.createElement("div");
            leftCol.className = "col-md-5";

            if (imageRow) {
                imageRow.remove();
                imageRow.classList.add("gwt-logo", "mb-4");
                imageRow.removeAttribute("data-aue-label");

                applyAltText(imageRow, imageAlt);
                leftCol.appendChild(imageRow);
            }

            if (titleEl) {
                titleEl.remove();
                titleEl.classList.add("sec-title");
                titleEl.removeAttribute("data-aue-label");
                leftCol.appendChild(titleEl);
            }

            row.appendChild(leftCol);
        }

        /* RIGHT COLUMN → DESCRIPTION */
        if (descEl) {
            const rightCol = document.createElement("div");
            rightCol.className = "col-md-7 fs-md";

            descEl.remove();
            descEl.removeAttribute("data-aue-label");
            rightCol.appendChild(descEl);

            row.appendChild(rightCol);
        }

        container.appendChild(row);
        wrapper.appendChild(container);
    }

    /* ================================
     4️⃣ Team Members (Precision Mapping)
     ================================ */
    const teamWrapper = document.createElement("div");
    teamWrapper.className = "gwt-team-grid mt-5";

    // The fields are authored in pairs: Name Row then Image Row
    // We skip the first few rows (Image, Alt, Title, Desc, FooterTag)
    // and look for our 16 member cells (8 names, 8 images)
    const memberRows = itemRows; // itemRows contains everything after the footerEl

    if (memberRows.length >= 2) {
        const teamList = document.createElement("div");
        teamList.className = "row g-4 justify-content-center";

        for (let i = 0; i < memberRows.length; i += 2) {
            const imageRow = memberRows[i];
            const nameRow = memberRows[i + 1];
            if (!imageRow) break;

            const num = i / 2 + 1;
            const name = nameRow?.textContent.trim() || "";
            const pic = imageRow.querySelector("picture, img");

            if (name || pic) {
                const col = document.createElement("div");
                col.className = "col-lg-3 col-md-4 col-sm-6 text-center gwt-member";

                const card = document.createElement("div");
                card.className = "gwt-member-card";

                if (pic) {
                    const imgWrapper = document.createElement("div");
                    imgWrapper.className = "gwt-member-img mb-3";
                    imgWrapper.append(pic.cloneNode(true));
                    card.appendChild(imgWrapper);
                }

                if (name) {
                    const nameEl = document.createElement("h4");
                    nameEl.className = "gwt-member-name";
                    nameEl.textContent = name;
                    card.appendChild(nameEl);
                }

                col.appendChild(card);
                teamList.appendChild(col);
            }
        }
        teamWrapper.appendChild(teamList);
        wrapper.appendChild(teamWrapper);
    }

    /* ================================
       5️⃣ Footer
       ================================ */
    if (footerEl?.textContent?.trim()) {
        const footerDiv = document.createElement("div");
        footerDiv.className = "gwt-footer pt-4";
        footerDiv.innerHTML = footerEl.innerHTML;
        footerDiv.removeAttribute("data-aue-label");
        wrapper.appendChild(footerDiv);
    }

    /* ================================
       6️⃣ Replace block
       ================================ */
    block.innerHTML = "";
    block.appendChild(wrapper);

    /* ================================
       7️⃣ Alt helper (condition-based)
       ================================ */
    function applyAltText(containerEl, altText) {
        if (!containerEl) return;

        containerEl.querySelectorAll("img").forEach((img) => {
            // ✅ Do NOT overwrite DAM-authored alt
            if (!img.hasAttribute("alt") || img.alt.trim() === "") {
                img.alt = altText;
            }
        });
    }
}
