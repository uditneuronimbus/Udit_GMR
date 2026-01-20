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
     Background image
  ============================== */
  const img = bgRow.querySelector('img');
  if (img) {
    bg.style.backgroundImage = `url(${img.src})`;
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
  if (titleRow && titleRow.textContent.trim()) {
    titleRow.classList.add('infra-hero-title');
    content.appendChild(titleRow);
  } else if (titleRow) {
    titleRow.remove();
  }

  /* =============================
     Subtitle
  ============================== */
  if (subtitleRow && subtitleRow.textContent.trim()) {
    subtitleRow.classList.add('infra-hero-subtitle');
    content.appendChild(subtitleRow);
  } else if (subtitleRow) {
    subtitleRow.remove();
  }

  /* =============================
     Description
  ============================== */
  if (descRow && descRow.textContent.trim()) {
    descRow.classList.add('infra-hero-description');
    content.appendChild(descRow);
  } else if (descRow) {
    descRow.remove();
  }

  /* =============================
     Extra row (optional)
  ============================== */
  if (extraRow && extraRow.textContent.trim()) {
    content.appendChild(extraRow);
  } else if (extraRow) {
    extraRow.remove();
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
