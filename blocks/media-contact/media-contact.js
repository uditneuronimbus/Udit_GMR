// export default function decorate(block) {
//   const rows = [...block.children];

//   const data = {};
//   rows.forEach((row) => {
//     const key = row.children[0]?.textContent?.trim();
//     const value = row.children[1]?.textContent?.trim();
//     if (key && value) {
//       data[key.toLowerCase()] = value;
//     }
//   });

//   block.innerHTML = `
//     <div class="media-contact-wrapper">
//       <div class="media-contact-header">
//         <h2>${data.title}</h2>
//         <p>${data.description}</p>
//       </div>
//       <div class="media-contact-cards">
//         <div class="media-card">
//           <h3>${data.lefttitle || ""}</h3>
//           <p>${data.leftcontent || ""}</p>
//         </div>
//         <div class="media-card">
//           <h3>${data.righttitle || ""}</h3>
//           <p>${data.rightcontent || ""}</p>
//         </div>
//       </div>
//     </div>
//   `;
// }
