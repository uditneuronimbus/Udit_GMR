export default function decorate(block) {
    const rows = [...block.children];
    if (rows.length < 3) return;

    const [titleRow, descriptionRow, imageRow, imageAltRow, ...items] = rows;

    const title = titleRow?.textContent?.trim() || "";
    const descriptionHTML = descriptionRow?.innerHTML || "";
    const mainImagePicture = imageRow?.querySelector("picture");
    const imageAlt = imageAltRow?.textContent?.trim() || title || "Section Image";

    block.innerHTML = "";

    const container = document.createElement("div");
    container.className = "cards-image-container container";

    // Main Intro Section
    const introSection = document.createElement("div");
    introSection.className = "cards-image-intro row align-items-center mb-5";

    const introTextCol = document.createElement("div");
    introTextCol.className = "col-lg-6 cards-image-intro-text";

    if (title) {
        const h2 = document.createElement("h2");
        h2.className = "cards-image-title";
        h2.textContent = title;
        introTextCol.append(h2);
    }

    if (descriptionHTML) {
        const desc = document.createElement("div");
        desc.className = "cards-image-description";
        desc.innerHTML = descriptionHTML;
        introTextCol.append(desc);
    }

    const introImgCol = document.createElement("div");
    introImgCol.className = "col-lg-6 cards-image-intro-img";

    if (mainImagePicture) {
        const pic = mainImagePicture.cloneNode(true);
        const img = pic.querySelector("img");
        if (img) img.alt = imageAlt;
        introImgCol.append(pic);
    }

    introSection.append(introTextCol, introImgCol);
    container.append(introSection);

    // Cards Section
    if (items.length > 0) {
        const cardsGrid = document.createElement("div");
        cardsGrid.className = "cards-image-grid row g-4";

        items.forEach((itemRow) => {
            const contentHTML = itemRow?.innerHTML || "";
            if (!contentHTML.trim()) return;

            const cardCol = document.createElement("div");
            cardCol.className = "col-md-4 col-sm-6 cards-image-card-col";

            const card = document.createElement("div");
            card.className = "cards-image-card h-100 p-4 shadow-sm border rounded";
            card.innerHTML = contentHTML;

            cardCol.append(card);
            cardsGrid.append(cardCol);
        });

        container.append(cardsGrid);
    }

    block.append(container);
}
