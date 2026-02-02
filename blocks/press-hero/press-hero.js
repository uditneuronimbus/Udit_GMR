// export default function decorate(block) {
//   const [
//     titleEl,
//     categoryEl,
//     imageEl,
//     publishDateEl,
//     updatedDateEl,
//     locationEl
//   ] = [...block.children];

//   const picture = imageEl?.querySelector("picture");

//   const hero = document.createElement("section");
//   hero.className = "press-hero";

//   /* Background */
//   if (picture) {
//     const media = document.createElement("div");
//     media.className = "press-hero-media";
//     media.append(picture);
//     hero.append(media);
//   }

//   /* Content */
//   const content = document.createElement("div");
//   content.className = "press-hero-content";

//   const container = document.createElement("div");
//   container.className = "container";

//   if (categoryEl?.textContent.trim()) {
//     const tag = document.createElement("span");
//     tag.className = "press-hero-tag";
//     tag.textContent = categoryEl.textContent;
//     container.append(tag);
//   }

//   if (titleEl?.textContent.trim()) {
//     const h1 = document.createElement("h1");
//     h1.textContent = titleEl.textContent;
//     container.append(h1);
//   }

//   const meta = document.createElement("div");
//   meta.className = "press-hero-meta";

//   if (publishDateEl?.textContent.trim()) {
//     meta.append(`📅 ${publishDateEl.textContent}`);
//   }

//   if (updatedDateEl?.textContent.trim()) {
//     meta.append(` | 🕒 ${updatedDateEl.textContent}`);
//   }

//   if (locationEl?.textContent.trim()) {
//     meta.append(` | 📍 ${locationEl.textContent}`);
//   }

//   container.append(meta);
//   content.append(container);
//   hero.append(content);

//   block.replaceWith(hero);
// }
