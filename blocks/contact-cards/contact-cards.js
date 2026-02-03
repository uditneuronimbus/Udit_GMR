// export default function decorate(block) {
//   // Add wrapper
//   block.classList.add('contact-cards-wrapper');

//   const rows = [...block.children];

//   // First row = section heading
//   const headingRow = rows.shift();
//   if (headingRow) {
//     headingRow.classList.add('contact-cards-heading');
//   }

//   // Create cards container
//   const cardsContainer = document.createElement('div');
//   cardsContainer.className = 'contact-cards-grid';

//   // Remaining rows = card items
//   rows.forEach((row) => {
//     row.classList.add('contact-card');
//     cardsContainer.append(row);
//   });

//   block.append(cardsContainer);
// }

import { getNewsDetail } from "../../scripts/news-api.js";

export default async function decorate(block) {
  try {
    const items = await getNewsDetail();
    if (!item) {
      contentWrapper.innerHTML = "<p>News not found.</p>";
      return;
    }
    contentWrapper.innerHTML = `
  }
}