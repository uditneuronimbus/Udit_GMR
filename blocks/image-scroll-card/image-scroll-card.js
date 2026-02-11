
export default function decorate(block) {
  const isAuthorMode =
    document.body.classList.contains('aem-AuthorLayer-Edit') ||
    window.location.search.includes('wcmmode=edit');

  /* ==============================
     INIT GUARD
  ============================== */
  if (block.classList.contains('image-scroll-card-initialized')) return;

  const rows = [...block.children];
  if (!rows.length) return;

  /* ==============================
     READ SECTION DATA
  ============================== */
  const heading = rows[0]?.querySelector('h1, h2, h3, p')?.textContent?.trim();
  const description = rows[1]?.querySelector('p')?.textContent?.trim();

  /* ==============================
     READ ITEM DATA
  ============================== */
  const items = rows.slice(2)
    .map((row) => {
      const title = row.children[0]?.textContent?.trim();
      const logo = row.querySelector('img, picture');

      if (!logo) return null;

      return { title, logo };
    })
    .filter(Boolean);

  if (!items.length) return;

  /* ==============================
     MARK BLOCK AS INITIALIZED
  ============================== */
  block.classList.add('image-scroll-card-initialized');

  /* ==============================
     BUILD RUNTIME MARKUP
  ============================== */
  const runtime = document.createElement('div');
  runtime.className = 'image-scroll-card-runtime';

  /* Header */
  if (heading || description) {
    const header = document.createElement('div');
    header.className = 'isc-header';

    if (heading) {
      const h2 = document.createElement('h2');
      h2.className = 'isc-title';
      h2.textContent = heading;
      header.appendChild(h2);
    }

    if (description) {
      const p = document.createElement('p');
      p.className = 'isc-description';
      p.textContent = description;
      header.appendChild(p);
    }

    runtime.appendChild(header);
  }

  /* Logo Track */
  const trackWrapper = document.createElement('div');
  trackWrapper.className = 'isc-track-wrapper';

  const track = document.createElement('div');
  track.className = 'isc-track';

  items.forEach(({ title, logo }) => {
    const card = document.createElement('div');
    card.className = 'isc-card';

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'isc-logo';

    imageWrapper.appendChild(logo);

    if (title && logo.tagName === 'IMG') {
      logo.alt = title;
      logo.title = title;
    }

    card.appendChild(imageWrapper);
    track.appendChild(card);
  });

  trackWrapper.appendChild(track);
  runtime.appendChild(trackWrapper);

  /* ==============================
     APPEND (DO NOT REPLACE)
  ============================== */
  block.appendChild(runtime);

  /* ==============================
     SKIP JS BEHAVIOR IN EDIT MODE
  ============================== */
  if (isAuthorMode) return;

  // 👉 If later you add animation / scroll logic,
  // initialize it here (publish only)
}
