// export default function decorate(block) {
//   const children = [...block.children];

//   const titleEl = children.shift();
//   const descEl = children.shift();
//   const buttonEl = children.shift();

//   // ✅ ONLY rows that contain an image are treated as cards
//   const items = children.filter(
//     (row) => row.querySelector("img")
//   );

//   block.classList.add("key-highlights");

//   /* ---------- Section Wrapper ---------- */
//   const section = document.createElement("div");
//   section.className = "sec-key spacer";

//   const wrapper = document.createElement("div");
//   wrapper.className = "key-highlights-wrapper container";

//   /* ---------- Header ---------- */
//   const headerRow = document.createElement("div");
//   headerRow.className = "row align-items-center mb-5";

//   const headerLeft = document.createElement("div");
//   headerLeft.className = "col-md-9";

//   headerLeft.innerHTML = `
//     ${titleEl ? `<h2 class="sec-title">${titleEl.textContent.trim()}</h2>` : ""}
//     ${descEl ? `<div class="sec-desc">${descEl.innerHTML}</div>` : ""}
//   `;

//   const headerRight = document.createElement("div");
//   headerRight.className = "col-md-3 text-md-end";

//   const btnLink = buttonEl?.querySelector("a");
//   if (btnLink) {
//     headerRight.innerHTML = `
//       <a href="${btnLink.href}" class="btn btn-primary">
//         ${btnLink.textContent.trim()}
//       </a>
//     `;
//   }

//   headerRow.append(headerLeft, headerRight);
//   wrapper.append(headerRow);

//   /* ---------- Grid ---------- */
//   const grid = document.createElement("div");
//   grid.className = "row g-4";

//   items.forEach((item) => {
//     const [imgEl, titleEl] = [...item.children];

//     const col = document.createElement("div");
//     col.className = "key-col col-md-6 col-lg-4";

//     col.innerHTML = `
//       <div class="career-card position-relative">
//         <div class="career-card-img">
//           ${imgEl?.innerHTML || ""}
//         </div>
//         <div class="career-card-overlay position-absolute bottom-0 start-0 p-3 text-white">
//           <h3 class="mb-1">${titleEl?.textContent.trim() || ""}</h3>
//           <a href="#" class="career-link text-white"></a>
//         </div>
//       </div>
//     `;

//     grid.append(col);
//   });

//   wrapper.append(grid);

//   /* ---------- Replace Block ---------- */
//   block.innerHTML = "";
//   section.append(wrapper);
//   block.append(section);
// }








export default function decorate(block) {
  const children = [...block.children];

  // Take first three as special rows (don't remove them yet)
  const titleEl   = children[0];
  const descEl    = children[1];
  const buttonEl  = children[2];   // ← keep reference, but don't shift

  // Filter cards: only rows that contain an <img>
  // This automatically skips title, desc, and button rows
  const items = children.filter(
    (row, index) => index >= 3 && row.querySelector("img")
  );

  block.classList.add("key-highlights");

  /* ---------- Section Wrapper ---------- */
  const section = document.createElement("div");
  section.className = "sec-key spacer";

  const wrapper = document.createElement("div");
  wrapper.className = "key-highlights-wrapper container";

  /* ---------- Header ---------- */
  const headerRow = document.createElement("div");
  headerRow.className = "row align-items-center mb-5";

  const headerLeft = document.createElement("div");
  headerLeft.className = "col-md-9";

  headerLeft.innerHTML = `
    ${titleEl ? `<h2 class="sec-title">${titleEl.textContent.trim()}</h2>` : ""}
    ${descEl  ? `<div class="sec-desc">${descEl.innerHTML}</div>` : ""}
  `;

  const headerRight = document.createElement("div");
  headerRight.className = "col-md-3 text-md-end";

  const btnLink = buttonEl?.querySelector("a");
  if (btnLink) {
    headerRight.innerHTML = `
      <a href="${btnLink.href}" class="btn btn-primary">
        ${btnLink.textContent.trim()}
      </a>
    `;
  }

  headerRow.append(headerLeft, headerRight);
  wrapper.append(headerRow);

  /* ---------- Grid ---------- */
  const grid = document.createElement("div");
  grid.className = "row g-4";

  items.forEach((item) => {
    const [imgEl, titleEl] = [...item.children];

    const col = document.createElement("div");
    col.className = "key-col col-md-6 col-lg-4";

    col.innerHTML = `
      <div class="career-card position-relative">
        <div class="career-card-img">
          ${imgEl?.innerHTML || ""}
        </div>
        <div class="career-card-overlay position-absolute bottom-0 start-0 p-3 text-white">
          <h3 class="mb-1">${titleEl?.textContent.trim() || ""}</h3>
          <a href="" class="career-link"></a>
        </div>
      </div>
    `;

    grid.append(col);
  });

  wrapper.append(grid);

  /* ---------- Replace Block ---------- */
  block.innerHTML = "";
  section.append(wrapper);
  block.append(section);
}

