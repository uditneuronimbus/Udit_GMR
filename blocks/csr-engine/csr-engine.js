export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  block.innerHTML = '';

  let logo;
  let title;
  let description;
  let mainImage;
  let rightDescription;

  const items = [];

  /* =============================
     Detect content automatically
  ============================== */

  rows.forEach((row) => {
    const cols = [...row.children];

    // picture only row → image
    if (cols.length === 1 && cols[0].querySelector('picture')) {
      if (!logo) logo = cols[0].querySelector('picture');
      else if (!mainImage) mainImage = cols[0].querySelector('picture');
      return;
    }

    // single text row → title / description / right description
    if (cols.length === 1) {
      const text = cols[0].textContent.trim();

      if (!title) title = text;
      else if (!description) description = cols[0].innerHTML;
      else rightDescription = cols[0].innerHTML;

      return;
    }

    // 3 column row → item
    if (cols.length >= 3) {
      items.push({
        icon: cols[0].querySelector('picture'),
        title: cols[1].textContent.trim(),
        description: cols[2].innerHTML,
      });
    }
  });

  /* ================= Header ================= */

  const header = document.createElement('div');
  header.className = 'csr-header';

  if (logo) {
    const wrap = document.createElement('div');
    wrap.className = 'csr-logo';
    wrap.append(logo);
    header.append(wrap);
  }

  if (title) {
    const h2 = document.createElement('h2');
    h2.className = 'csr-title';
    h2.textContent = title;
    header.append(h2);
  }

  if (description) {
    const desc = document.createElement('div');
    desc.className = 'csr-description';
    desc.innerHTML = description;
    header.append(desc);
  }

  /* ================= Layout ================= */

  const content = document.createElement('div');
  content.className = 'csr-content';

  const left = document.createElement('div');
  left.className = 'csr-left';
  if (mainImage) left.append(mainImage);

  const right = document.createElement('div');
  right.className = 'csr-right';

  if (rightDescription) {
    const rdesc = document.createElement('div');
    rdesc.className = 'csr-main-description';
    rdesc.innerHTML = rightDescription;
    right.append(rdesc);
  }

  /* ================= Items ================= */

  if (items.length) {
    const wrap = document.createElement('div');
    wrap.className = 'csr-items';

    items.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'csr-item';

      if (item.icon) {
        const iconWrap = document.createElement('div');
        iconWrap.className = 'csr-icon';
        iconWrap.append(item.icon);
        el.append(iconWrap);
      }

      const textWrap = document.createElement('div');

      const h3 = document.createElement('h3');
      h3.textContent = item.title;
      textWrap.append(h3);

      const d = document.createElement('div');
      d.className = 'csr-item-desc';
      d.innerHTML = item.description;
      textWrap.append(d);

      el.append(textWrap);
      wrap.append(el);
    });

    right.append(wrap);
  }

  content.append(left, right);
  block.append(header, content);
}