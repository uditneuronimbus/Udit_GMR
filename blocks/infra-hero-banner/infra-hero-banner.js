export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 8) return;

  const [
    bgRow,
    titleRow,
    subtitleRow,
    descRow,
    extraRow,
    ctaTextRow,
    ctaLinkRow,
    alignmentRow,
  ] = rows;

  /* =============================
     Create wrapper
  ============================== */
  const hero = document.createElement('div');
  hero.className = 'infra-hero';

  const bg = document.createElement('div');
  bg.className = 'infra-hero-bg';

  const content = document.createElement('div');
  content.className = 'infra-hero-content';

  /* =============================
     Background image (FULL QUALITY)
  ============================== */
  const img = bgRow.querySelector('img');

  if (img) {
    // remove Franklin params
    const baseSrc = img.src.split('?')[0];

    // force large + high quality
    img.src = `${baseSrc}?width=2400&quality=90&format=jpg`;

    img.className = 'infra-hero-bg-img';
    img.removeAttribute('width');
    img.removeAttribute('height');

    bg.appendChild(img);
  }

  bgRow.remove();

  /* =============================
     Alignment
  ============================== */
  const alignment = alignmentRow.textContent.trim().toLowerCase();
  hero.classList.add(alignment === 'left' ? 'align-left' : 'align-right');
  alignmentRow.remove();

  /* =============================
     Title
  ============================== */
  if (titleRow?.textContent.trim()) {
    titleRow.classList.add('infra-hero-title');
    content.appendChild(titleRow);
  } else {
    titleRow?.remove();
  }

  /* =============================
     Subtitle
  ============================== */
  if (subtitleRow?.textContent.trim()) {
    subtitleRow.classList.add('infra-hero-subtitle');
    content.appendChild(subtitleRow);
  } else {
    subtitleRow?.remove();
  }

  /* =============================
     Description
  ============================== */
  if (descRow?.textContent.trim()) {
    descRow.classList.add('infra-hero-description');
    content.appendChild(descRow);
  } else {
    descRow?.remove();
  }

  /* =============================
     Extra row
  ============================== */
  if (extraRow?.textContent.trim()) {
    content.appendChild(extraRow);
  } else {
    extraRow?.remove();
  }

  /* =============================
     CTA
  ============================== */
  const ctaText = ctaTextRow.textContent.trim();
  const ctaLink = ctaLinkRow.textContent.trim();

  if (ctaText && ctaLink) {
    const cta = document.createElement('a');
    cta.className = 'infra-hero-cta';
    cta.textContent = ctaText;
    cta.href = ctaLink;
    cta.setAttribute('data-aue-link', 'true');
    content.appendChild(cta);
  }

  ctaTextRow.remove();
  ctaLinkRow.remove();

  /* =============================
     Assemble
  ============================== */
  hero.append(bg, content);
  block.prepend(hero);
}
