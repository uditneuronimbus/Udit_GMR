export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  /* ================================
     1️⃣ Read fields sequentially (Franklin safe)
  ================================ */

  const getValue = (index) =>
    rows[index]?.textContent?.trim() || "";

  const getHTML = (index) =>
    rows[index]?.innerHTML?.trim() || "";

  const data = {
    sectionTitle: getValue(0),
    companyName: getValue(1),
    address: getHTML(2),
    phone: getValue(3),
    email: getValue(4),
    socialTitle: getValue(5),
    instagramUrl: getValue(6),
    xUrl: getValue(7),
    linkedinUrl: getValue(8),
    youtubeUrl: getValue(9),
    whatsappUrl: getValue(10),
    facebookUrl: getValue(11),
    mapEmbedUrl: getValue(12),
  };

  /* ================================
     2️⃣ Hide authored rows
  ================================ */
  rows.forEach((r) => (r.style.display = "none"));

  /* ================================
     3️⃣ Create runtime wrapper
  ================================ */

  const runtime = document.createElement("section");
  runtime.className = "contact-section";

  const container = document.createElement("div");
  container.className = "container";

  const wrapper = document.createElement("div");
  wrapper.className = "contact-wrapper";

  /* ================================
     4️⃣ LEFT SIDE (Office Info)
  ================================ */

  const left = document.createElement("div");
  left.className = "contact-left";

  if (data.sectionTitle) {
    const title = document.createElement("h2");
    title.className = "contact-title";
    title.textContent = data.sectionTitle;
    left.append(title);
  }

  if (data.companyName) {
    const company = document.createElement("div");
    company.className = "contact-company";
    company.textContent = data.companyName;
    left.append(company);
  }

  if (data.address) {
    const address = document.createElement("div");
    address.className = "contact-address";
    address.innerHTML = data.address;
    left.append(address);
  }

  /* phone + email */
  if (data.phone || data.email) {
    const meta = document.createElement("div");
    meta.className = "contact-meta";

    if (data.phone) {
      const phone = document.createElement("a");
      phone.href = `tel:${data.phone}`;
      phone.textContent = data.phone;
      meta.append(phone);
    }

    if (data.email) {
      const email = document.createElement("a");
      email.href = `mailto:${data.email}`;
      email.textContent = data.email;
      meta.append(email);
    }

    left.append(meta);
  }

  /* social links */
  const socialLinks = [
    data.linkedinUrl,
    data.facebookUrl,
    data.youtubeUrl,
    data.instagramUrl,
  ].filter(Boolean);

  if (socialLinks.length) {
    const social = document.createElement("div");
    social.className = "contact-social";

    if (data.socialTitle) {
      const label = document.createElement("p");
      label.textContent = data.socialTitle;
      social.append(label);
    }

    const linksWrap = document.createElement("div");
    linksWrap.className = "social-links";

    socialLinks.forEach((url) => {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.textContent = "•";
      linksWrap.append(a);
    });

    social.append(linksWrap);
    left.append(social);
  }

  /* ================================
     5️⃣ RIGHT SIDE FORM
  ================================ */

  const right = document.createElement("div");
  right.className = "contact-right";

  right.innerHTML = `
    Form Here
  `;

  wrapper.append(left, right);
  container.append(wrapper);

  /* ================================
     6️⃣ Map (if exists)
  ================================ */

  if (data.mapEmbedUrl) {
    const map = document.createElement("div");
    map.className = "contact-map";

    const iframe = document.createElement("iframe");
    iframe.src = data.mapEmbedUrl;
    iframe.loading = "lazy";
    iframe.setAttribute("allowfullscreen", "");

    map.append(iframe);
    container.append(map);
  }

  runtime.append(container);
  block.append(runtime);
}
