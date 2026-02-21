import { moveInstrumentation } from "../../scripts/scripts.js";

export default function decorate(block) {
    const rows = [...block.children];

    // We now have 5 metadata rows before items:
    // Title, Description, Desktop Image, Mobile Image, Image Alt
    const [titleRow, descriptionRow, imageRow, mobileImageRow, imageAltRow, ...items] = rows;

    const title = titleRow?.textContent?.trim() || "";
    const descriptionHTML = descriptionRow?.children[0]?.innerHTML || descriptionRow?.innerHTML || "";
    const desktopPicture = imageRow?.querySelector("picture");
    const mobilePicture = mobileImageRow?.querySelector("picture");
    const imageAlt = imageAltRow?.textContent?.trim() || title || "Section Image";

    block.innerHTML = "";

    const container = document.createElement("div");
    container.className = "cards-image-container container";

    // Main Intro Section
    const introSection = document.createElement("div");
    introSection.className = "cards-image-intro row align-items-center mb-5";

    const introTextCol = document.createElement("div");
    introTextCol.className = "col-lg-6 cards-image-intro-text";

    if (titleRow) {
        const h2 = document.createElement("h2");
        h2.className = "cards-image-title";
        h2.textContent = title;
        moveInstrumentation(titleRow, h2);
        introTextCol.append(h2);
    }

    if (descriptionRow) {
        const desc = document.createElement("div");
        desc.className = "cards-image-description";
        desc.innerHTML = descriptionHTML;
        moveInstrumentation(descriptionRow, desc);
        introTextCol.append(desc);
    }

    const introImgCol = document.createElement("div");
    introImgCol.className = "col-lg-6 cards-image-intro-img";

    if (desktopPicture || mobilePicture) {
        const pictureWrap = document.createElement("div");
        pictureWrap.className = "cards-image-picture-wrap";

        if (desktopPicture) {
            const pic = desktopPicture.cloneNode(true);
            const img = pic.querySelector("img");
            if (img) img.alt = imageAlt;
            pic.classList.add("d-none", "d-md-block");
            moveInstrumentation(imageRow, pic);
            pictureWrap.append(pic);
        }

        if (mobilePicture) {
            const pic = mobilePicture.cloneNode(true);
            const img = pic.querySelector("img");
            if (img) img.alt = imageAlt;
            pic.classList.add("d-block", "d-md-none");
            moveInstrumentation(mobileImageRow, pic);
            pictureWrap.append(pic);
        }
        introImgCol.append(pictureWrap);
    }

    introSection.append(introTextCol, introImgCol);
    container.append(introSection);

    // Cards Section
    if (items.length > 0) {
        const cardsGrid = document.createElement("div");
        cardsGrid.className = "cards-image-grid row g-4";

        items.forEach((itemRow) => {
            // items each have 1 field: content (richtext)
            // typically rendered as: <div component="cards-and-image-item"><div>richtext</div></div>
            const contentField = itemRow.children[0];
            const contentHTML = contentField?.innerHTML || "";

            const cardCol = document.createElement("div");
            cardCol.className = "col-md-4 col-sm-6 cards-image-card-col";

            const card = document.createElement("div");
            card.className = "cards-image-card h-100 p-4 shadow-sm border rounded";
            card.innerHTML = contentHTML;

            moveInstrumentation(itemRow, card);
            cardCol.append(card);
            cardsGrid.append(cardCol);
        });

        container.append(cardsGrid);
    }

    block.append(container);
}
