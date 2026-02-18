import { COUNTRIES } from './countries.js';

/**
 * Optimized Contact Us Component
 */
export default function decorate(block) {
  const rows = [...block.children];

  /* ================================
     1. Dynamic Configuration
  ================================ */

  const getValue = (idx) => rows[idx]?.textContent?.trim() || "";
  const getHTML = (idx) => rows[idx]?.innerHTML?.trim() || "";

  const config = {
    sectionTitle: block.dataset.sectiontitle || getValue(0) || "Corporate Office",
    companyName: block.dataset.companyname || getValue(1) || "GMR Group",
    address: block.dataset.address || getHTML(2) || "New Udaan Bhawan, New Delhi, India.",
    phone: block.dataset.phone || getValue(3) || "+9111 4253 2600",
    email: block.dataset.email || getValue(4) || "info@gmrgroup.in",
    socialTitle: block.dataset.socialtitle || getValue(5) || "Connect with us",
    instagramUrl: block.dataset.instagramurl || getValue(6),
    xUrl: block.dataset.xurl || getValue(7),
    linkedinUrl: block.dataset.linkedinurl || getValue(8),
    youtubeUrl: block.dataset.youtubeurl || getValue(9),
    whatsappUrl: block.dataset.whatsappurl || getValue(10),
    facebookUrl: block.dataset.facebookurl || getValue(11),
    submitLabel: block.dataset.submitlabel || "Submit",
    successMessage: block.dataset.successmessage || "Success!",
    mapEmbedUrl: block.dataset.mapembedurl || getValue(12) || "",
  };

  rows.forEach((r) => (r.style.display = "none"));

  /* ================================
     2. Build UI Data
  ================================ */

  const socialLinks = [
    { id: "instagram", url: config.instagramUrl, icon: "📷" },
    { id: "x", url: config.xUrl, icon: "𝕏" },
    { id: "linkedin", url: config.linkedinUrl, icon: "in" },
    { id: "youtube", url: config.youtubeUrl, icon: "▶" },
    { id: "whatsapp", url: config.whatsappUrl, icon: "💬" },
    { id: "facebook", url: config.facebookUrl, icon: "f" },
  ].filter((l) => l.url);

  const enquiryOptions = [
    "General Inquiry",
    "Business Partnership",
    "Career Opportunities",
    "Media & Press",
    "Other",
  ]
    .map(
      (opt) =>
        `<option value="${opt.toLowerCase().replace(/\s/g, "_")}">${opt}</option>`
    )
    .join("");

  const countryOptions = COUNTRIES.map(
    (c) => `<option value="${c.value}">${c.label}</option>`
  ).join("");

  /* ================================
     3. Render Markup (UPDATED STRUCTURE)
  ================================ */

  block.innerHTML = `
    <section class="contact-section spacer pb-0">
      <div class="container">
        <div class="contact-wrapper">

          <!-- LEFT SIDE -->
          <div class="contact-left">

            ${
              config.sectionTitle
                ? `<h2 class="contact-title">${config.sectionTitle}</h2>`
                : ""
            }

            ${
              config.companyName
                ? `<div class="contact-company">${config.companyName}</div>`
                : ""
            }

            ${
              config.address
                ? `<div class="contact-address">${config.address}</div>`
                : ""
            }

            ${
              config.phone || config.email
                ? `
              <div class="contact-meta">

                ${
                  config.phone
                    ? `
                  <div class="contact-item">
                    <span>📞</span>
                    <a href="tel:${config.phone.replace(/\s+/g, "")}">
                      ${config.phone}
                    </a>
                  </div>
                `
                    : ""
                }

                ${
                  config.email
                    ? `
                  <div class="contact-item">
                    <span>✉️</span>
                    <a href="mailto:${config.email}">
                      ${config.email}
                    </a>
                  </div>
                `
                    : ""
                }

              </div>
            `
                : ""
            }

            ${
              socialLinks.length
                ? `
              <div class="contact-social">
                ${
                  config.socialTitle
                    ? `<p>${config.socialTitle}</p>`
                    : ""
                }
                <div class="social-links">
                  ${socialLinks
                    .map(
                      (l) => `
                    <a href="${l.url}" target="_blank" aria-label="${l.id}">
                      ${l.icon}
                    </a>
                  `
                    )
                    .join("")}
                </div>
              </div>
            `
                : ""
            }

          </div>

          <!-- RIGHT SIDE FORM -->
          <div class="contact-right">
            <form class="contact-form" id="contactForm" novalidate>

              <div class="form-row">
                <select id="enquiry" name="enquiry" required>
                  <option value="">Select enquiry type</option>
                  ${enquiryOptions}
                </select>

                <select id="country" name="country" required>
                  <option value="">Select country</option>
                  ${countryOptions}
                </select>
              </div>

              <div class="form-row">
                <input type="text" id="firstName" name="firstName" placeholder="First Name*" required>
                <input type="text" id="lastName" name="lastName" placeholder="Last Name">
              </div>

              <div class="form-row">
                <input type="tel" id="mobile" name="mobile" placeholder="Mobile No.*" required>
                <input type="email" id="email" name="email" placeholder="Email ID*" required>
              </div>

              <textarea id="message" name="message" placeholder="Message*" required></textarea>

              <button type="submit" class="btn-submit">
                ${config.submitLabel}
              </button>

              <div class="form-status" aria-live="polite" style="display:none"></div>

            </form>
          </div>

        </div>
      </div>
    </section>

    ${
      config.mapEmbedUrl
        ? `
      <div class="contact-map">
        <iframe src="${config.mapEmbedUrl}" loading="lazy" allowfullscreen></iframe>
      </div>
    `
        : ""
    }
  `;

  /* ================================
     4. Logic & Validation (UNCHANGED)
  ================================ */

  const form = block.querySelector("#contactForm");
  const status = block.querySelector(".form-status");
  const submitBtn = block.querySelector(".btn-submit");
  const mobileInput = block.querySelector("#mobile");

  function updateStatus(msg, isError = true) {
    status.textContent = msg;
    status.style.display = "block";
    status.className = isError ? "form-status error" : "form-status success";
  }

  const loadLib = (url, isCss = false) => {
    const sel = isCss ? `link[href="${url}"]` : `script[src="${url}"]`;
    if (document.querySelector(sel)) return Promise.resolve();

    return new Promise((res, rej) => {
      const el = document.createElement(isCss ? "link" : "script");
      if (isCss) {
        el.rel = "stylesheet";
        el.href = url;
      } else {
        el.src = url;
        el.async = true;
      }
      el.onload = res;
      el.onerror = rej;
      document.head.appendChild(el);
    });
  };

  let iti;

  Promise.all([
    loadLib(
      "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/css/intlTelInput.css",
      true
    ),
    loadLib(
      "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/intlTelInput.min.js"
    ),
  ]).then(() => {
    iti = window.intlTelInput(mobileInput, {
      initialCountry: "auto",
      separateDialCode: true,
      utilsScript:
        "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js",
      geoIpLookup: (cb) =>
        fetch("https://ipapi.co/json/")
          .then((r) => r.json())
          .then((d) => cb(d.country_code))
          .catch(() => cb("in")),
    });
  });

  form.querySelectorAll("input, select, textarea").forEach((el) => {
    el.addEventListener("blur", () => {
      el.classList.toggle("invalid", !el.checkValidity());
      if (el === mobileInput && iti && !iti.isValidNumber())
        el.classList.add("invalid");
    });

    el.addEventListener("input", () => el.classList.remove("invalid"));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity() || (iti && !iti.isValidNumber())) {
      form.querySelectorAll(":invalid").forEach((i) =>
        i.classList.add("invalid")
      );
      if (iti && !iti.isValidNumber()) mobileInput.classList.add("invalid");
      updateStatus("Please correct the highlighted fields.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Processing...";
    status.style.display = "none";

    const fd = new FormData(form);
    const countryObj = COUNTRIES.find((c) => c.value === fd.get("country"));

    const payload = {
      enquiryType: fd.get("enquiry"),
      country: countryObj?.label || fd.get("country"),
      country_code: `+${iti?.getSelectedCountryData().dialCode || ""}`,
      firstName: fd.get("firstName"),
      lastName: fd.get("lastName") || "",
      mobileNo:
        iti
          ?.getNumber(window.intlTelInputUtils?.numberFormat.NATIONAL)
          .replace(/\D/g, "") || fd.get("mobile"),
      email: fd.get("email"),
      message: fd.get("message"),
    };

    try {
      const gmrPromise = fetch(
        "http://13.200.106.168:4000/api/enquiry/save-enquery",
        {
          method: "POST",
          headers: {
            Authorization:
              "U2FsdGVkX1+IAunex0zJueoZQpRBfpUm/DSQSMufK69HpTEh4abfdnhz0fQ+jbSmPrqojCZOhYZ6/mvA28aQxw",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const adobePromise = fetch(
        "https://3842504-emailer-default.adobeioruntime.net/api/v1/web/eds-smtp-mailer/send-mail",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${payload.firstName} ${payload.lastName}`.trim(),
            email: payload.email,
            message: `NEW SUBMISSION\nEnquiry: ${payload.enquiryType}\nCountry: ${payload.country}\nPhone: ${payload.country_code}${payload.mobileNo}\n\nMessage:\n${payload.message}`,
          }),
        }
      );

      const results = await Promise.allSettled([gmrPromise, adobePromise]);

      const anySuccess = results.some(
        (r) => r.status === "fulfilled" && (r.value.ok || r.value.status === 200)
      );

      if (anySuccess) {
        window.location.href = "/en/thankyou";
      } else {
        throw new Error("Service temporarily unavailable.");
      }
    } catch (err) {
      updateStatus(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = config.submitLabel;
    }
  });
}
