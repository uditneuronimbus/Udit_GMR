export default function decorate(block) {
  // CREATE a container before adding the row structure
  const container = document.createElement("div");
  container.classList.add("row");

  // Move the current block children into container
  // (They remain editable for Universal Editor)
  while (block.firstChild) {
    container.appendChild(block.firstChild);
  }

  // Add container inside block
  block.appendChild(container);

  // Now add row class to block
  block.classList.add("container");

  // Get each original row inside container (snapshot)
  const rows = [...container.children];

  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;

    const titleDiv = cells[0];
    const contentDiv = cells[1];

    const value = contentDiv.textContent.trim();
    const safeClass = "";
    // Prepare class name
    if (value != "" && value != "undefined") {
      const safeClass = value.toLowerCase().replace(/\s+/g, "-");
    }

    const titleWrapper = document.createElement("div");
    titleWrapper.classList.add("footer-nav");

    // Move editable nodes (this preserves the actual editable nodes, not clones)
    titleWrapper.append(...titleDiv.childNodes);

    while (row.firstChild) {
      row.removeChild(row.firstChild);
    }

    row.className = "";
    row.classList.add("w-20");
    if (safeClass) row.classList.add(safeClass);

    // Append the new wrapper(s)
    row.appendChild(titleWrapper);
  });

  // Select ALL <h4> inside footer-nav
  const titles = block.querySelectorAll(".footer-nav h4");

  titles.forEach((title) => {
    const list = title.nextElementSibling; // must be the next UL

    if (!list || list.tagName !== "UL") return;

    // Smooth accordion preparation
    list.style.overflow = "hidden";
    if (!list.classList.contains("active")) {
      list.style.maxHeight = "0px";
    }

    title.addEventListener("click", () => {
      const isOpen = list.classList.contains("active");

      // Close *all* ULs and remove active from *all* H4
      block.querySelectorAll(".footer-nav ul").forEach((ul) => {
        ul.classList.remove("active");
        ul.style.maxHeight = "0px";
      });

      block.querySelectorAll(".footer-nav h4").forEach((h) => {
        h.classList.remove("active");
      });

      // Toggle only the clicked element
      if (!isOpen) {
        list.classList.add("active");
        list.style.maxHeight = list.scrollHeight + "px";

        title.classList.add("active"); // ⭐ Add active to clicked H4
      }
    });

    title.style.cursor = "pointer";
  });
}
