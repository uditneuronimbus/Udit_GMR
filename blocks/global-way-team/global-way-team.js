export default function decorate(block) {
    const rows = [...block.children];
    if (rows.length < 1) return;

    block.classList.add("global-way-team");

    // Helper to find row by label (case-insensitive)
    const getRow = (label) => rows.find(r => r.dataset?.aueLabel?.toLowerCase() === label.toLowerCase());

    /* ================================
       1️⃣ Identify Global Fields Safely
       ================================ */
    const imageRow = getRow("Background Image") || rows.find(r => r.querySelector("img, picture"));
    const imageAltRow = getRow("Alt Text");
    const titleEl = getRow("Section Title") || rows.find(r => r.querySelector("h1, h2, h3"));
    const descEl = getRow("Section Content") || rows.find(r => r.querySelector("p") && r !== titleEl);
    const footerEl = getRow("Footer Tag (e.g. FY 2025-26)");

    const sectionTitle = titleEl?.textContent?.trim() || "Global Way Team";
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

        const contentRow = document.createElement("div");
        contentRow.className = "row align-items-center";

        /* LEFT COLUMN → IMAGE + TITLE */
        if (imageRow || titleEl) {
            const leftCol = document.createElement("div");
            leftCol.className = "col-md-5";

            if (imageRow) {
                const logo = imageRow.cloneNode(true);
                logo.className = "gwt-logo mb-4";
                logo.removeAttribute("data-aue-label");
                applyAltText(logo, imageAlt);
                leftCol.appendChild(logo);
            }

            if (titleEl) {
                const titleContent = titleEl.cloneNode(true);
                titleContent.className = "sec-title";
                titleContent.removeAttribute("data-aue-label");
                leftCol.appendChild(titleContent);
            }

            contentRow.appendChild(leftCol);
        }

        /* RIGHT COLUMN → DESCRIPTION */
        if (descEl) {
            const rightCol = document.createElement("div");
            rightCol.className = "col-md-7 fs-md";

            const descContent = descEl.cloneNode(true);
            descContent.removeAttribute("data-aue-label");
            rightCol.appendChild(descContent);

            contentRow.appendChild(rightCol);
        }

        container.appendChild(contentRow);
        wrapper.appendChild(container);
    }

    /* ================================
       4️⃣ Team Members (Fixed Slots & Dynamic)
       ================================ */
    const teamWrapper = document.createElement("div");
    teamWrapper.className = "gwt-team-grid mt-5";
    const teamList = document.createElement("div");
    teamList.className = "row g-4 justify-content-center";

    // Strategy A: Check Fixed Slots (member1-image, etc.)
    for (let i = 1; i <= 8; i += 1) {
        const mImgRow = getRow(`Member ${i} Image`);
        const mNameRow = getRow(`Member ${i} Name`);

        if (mImgRow || mNameRow) {
            const pic = mImgRow?.querySelector("picture, img");
            const name = mNameRow?.textContent.trim();

            if (pic || name) {
                addMemberCard(teamList, pic, name);
            }
        }
    }

    // Strategy B: Detect Dynamic Items (data-aue-model="global-way-team-item")
    const dynamicItems = rows.filter(r => r.dataset?.aueModel === "global-way-team-item");
    dynamicItems.forEach(row => {
        const pic = row.querySelector("picture, img");
        const name = Array.from(row.children).find(c => c.textContent.trim() && !c.querySelector("img, picture"))?.textContent.trim();
        if (pic || name) addMemberCard(teamList, pic, name);
    });

    if (teamList.children.length > 0) {
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
       Helpers
       ================================ */
    function addMemberCard(container, pic, name) {
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
        container.appendChild(col);
    }

    function applyAltText(containerEl, altText) {
        if (!containerEl) return;
        containerEl.querySelectorAll("img").forEach((img) => {
            if (!img.hasAttribute("alt") || img.alt.trim() === "") {
                img.alt = altText;
            }
        });
    }
}
