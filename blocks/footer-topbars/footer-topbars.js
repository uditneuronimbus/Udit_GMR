export default function decorate(block) {
  const authoredRows = [...block.children];

  // Extract first row fields
  const firstRow = authoredRows[0];
  const cells = firstRow ? [...firstRow.children] : [];

  let image = "";
  if (cells[0]) {
    const img = cells[0].querySelector("img");
    image = img ? img.src : "";
  }

  const linkedin = cells[1] ? cells[1].innerText.trim() : "";
  const facebook = cells[2] ? cells[2].innerText.trim() : "";
  const youtube = cells[3] ? cells[3].innerText.trim() : "";
  const buttonLabel = cells[4] ? cells[4].innerText.trim() : "";
  const textHtml = cells[5] ? cells[5].innerHTML : "";

  // ------------------------------------------------------------------
  // BLUE STRIP
  // ------------------------------------------------------------------
  const blueStrip = document.createElement("div");
  blueStrip.classList.add("footer-top", "bg-primary");

  const blueContainer = document.createElement("div");
  blueContainer.classList.add("container");

  const item = document.createElement("div");
  item.classList.add(
    "d-flex",
    "flex-wrap",
    "align-items-md-start",
    "align-items-center",
    "gap-2",
  );

  // IMAGE WRAPPER
  const imgWrap = document.createElement("div");
  imgWrap.classList.add("footertopbar-image");

  if (image) {
    const imgEl = document.createElement("img");
    imgEl.src = image;
    imgEl.alt = "";
    imgWrap.appendChild(imgEl);
  }
  item.appendChild(imgWrap);

  // SOCIAL LINKS
  const socialWrap = document.createElement("div");
  socialWrap.classList.add("ms-md-auto", "social-links", "d-flex", "gap-2");

  if (linkedin) {
    const a = document.createElement("a");
    a.href = linkedin;
    const icon = document.createElement("img");
    icon.src = "/icons/linkedin-icon.svg";
    icon.alt = "Linkedin";
    a.appendChild(icon);
    socialWrap.appendChild(a);
  }

  if (facebook) {
    const a = document.createElement("a");
    a.href = facebook;
    const icon = document.createElement("img");
    icon.src = "/icons/facebook-icon.svg";
    icon.alt = "Facebook";
    a.appendChild(icon);
    socialWrap.appendChild(a);
  }

  if (youtube) {
    const a = document.createElement("a");
    a.href = youtube;
    const icon = document.createElement("img");
    icon.src = "/icons/youtube-icon.svg";
    icon.alt = "YouTube";
    a.appendChild(icon);
    socialWrap.appendChild(a);
  }
  item.appendChild(socialWrap);

  // BUTTON WRAPPER
  const btnWrap = document.createElement("div");
  btnWrap.classList.add("group-btn", "ms-md-0", "ms-auto");

  if (buttonLabel) {
    const btn = document.createElement("button");
    btn.classList.add("btn", "btn-primary");
    btn.type = "button";
    btn.setAttribute("data-bs-toggle", "collapse");
    btn.setAttribute("data-bs-target", "#groupWebsiteCollapse");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "groupWebsiteCollapse");

    btn.textContent = buttonLabel;

    const span = document.createElement("span");
    btn.appendChild(span);

    btnWrap.appendChild(btn);
  }
  item.appendChild(btnWrap);

  // FOOTER TEXT
  const textWrap = document.createElement("div");
  textWrap.classList.add("footertopbar-text");
  textWrap.innerHTML = textHtml; // SAFE: this is authored content
  item.appendChild(textWrap);

  blueContainer.appendChild(item);
  blueStrip.appendChild(blueContainer);

  // ------------------------------------------------------------------
  // COLLAPSE SECTION
  // ------------------------------------------------------------------
  const collapseSection = document.createElement("div");
  collapseSection.classList.add(
    "footer-collapse",
    "bg-royal-blue",
    "text-white",
    "collapse",
  );
  collapseSection.id = "groupWebsiteCollapse";

  const collapseContainer = document.createElement("div");
  collapseContainer.classList.add("container", "py-5");

  const loopRow = document.createElement("div");
  loopRow.classList.add("row", "g-5");

  authoredRows.slice(1).forEach((row) => {
    const loopItem = document.createElement("div");
    loopItem.classList.add("loop-item", "col-md-3");

    while (row.firstChild) {
      loopItem.appendChild(row.firstChild);
    }

    loopRow.appendChild(loopItem);
  });

  collapseContainer.appendChild(loopRow);
  collapseSection.appendChild(collapseContainer);

  // Replace content safely
  block.innerHTML = "";
  block.appendChild(blueStrip);
  block.appendChild(collapseSection);
}
