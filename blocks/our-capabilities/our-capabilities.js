export default function decorate(block) {
    const rows = [...block.children];
    if (rows.length < 5) return;

    const [
        titleRow,
        descriptionRow,
        desktopImageRow,
        mobileImageRow,
        imageAltRow,
        buttonLabelRow,
        buttonLinkRow,
    ] = rows;

    const title = titleRow?.textContent?.trim() || "";
    const descriptionHTML = descriptionRow?.innerHTML || "";
    const desktopPicture = desktopImageRow?.querySelector("picture");
    const mobilePicture = mobileImageRow?.querySelector("picture");
    const imageAlt = imageAltRow?.textContent?.trim() || title || "Capability image";
    const buttonLabel = buttonLabelRow?.textContent?.trim();
    const buttonLink = buttonLinkRow?.textContent?.trim() || "#";

    block.innerHTML = "";

    const container = document.createElement("div");
    container.className = "our-capabilities-container container";

    const row = document.createElement("div");
    row.className = "row align-items-center";

    // Content Column
    const contentCol = document.createElement("div");
    contentCol.className = "col-lg-6 our-capabilities-content";

    if (title) {
        const h2 = document.createElement("h2");
        h2.className = "our-capabilities-title";
        h2.textContent = title;
        contentCol.append(h2);
    }

    if (descriptionHTML) {
        const desc = document.createElement("div");
        desc.className = "our-capabilities-description";
        desc.innerHTML = descriptionHTML;
        contentCol.append(desc);
    }

    if (buttonLabel) {
        const cta = document.createElement("a");
        cta.className = "btn btn-primary our-capabilities-cta";
        cta.href = buttonLink;
        cta.textContent = buttonLabel;
        contentCol.append(cta);
    }

    // Image Column
    const imageCol = document.createElement("div");
    imageCol.className = "col-lg-6 our-capabilities-image-wrap";

    if (desktopPicture || mobilePicture) {
        const pictureWrap = document.createElement("div");
        pictureWrap.className = "our-capabilities-picture";

        if (desktopPicture) {
            const desktopClone = desktopPicture.cloneNode(true);
            applyAltText(desktopClone, imageAlt);
            desktopClone.classList.add("d-none", "d-md-block");
            pictureWrap.append(desktopClone);
        }

        if (mobilePicture) {
            const mobileClone = mobilePicture.cloneNode(true);
            applyAltText(mobileClone, imageAlt);
            mobileClone.classList.add("d-block", "d-md-none");
            pictureWrap.append(mobileClone);
        }
        imageCol.append(pictureWrap);
    }

    row.append(contentCol, imageCol);
    container.append(row);
    block.append(container);

    function applyAltText(pictureEl, alt) {
        if (!pictureEl) return;
        pictureEl.querySelectorAll("img").forEach((img) => {
            img.alt = alt;
        });
    }
}
