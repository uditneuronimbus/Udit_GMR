/**
 * Header Utility Block – FINAL (Code-Based Lookup)
 * Stocks (Left) | Contact + Language + Icons (Right)
 * Universal Editor SAFE
 * Includes: Caching Strategy & ID-Based Lookup
 */
export default async function decorate(block) {
  /* ===============================
     CONFIG (ID MAPPING)
     =============================== */
  // Mapped to Company Codes (Stable IDs) from your API
  const STOCK_CODES = {
    "GAL": "15210029",    // GMR Airports Ltd.
    "GPUIL": "15131133"   // GMR Power and Urban Infra Ltd.
  };

  const rows = [...block.children];
  if (!rows.length) return;

  /* ===============================
     1️⃣ READ JSON MODEL (ROW BASED)
     =============================== */
  const stock1 = rows[0]?.textContent?.trim() || "";
  const stock2 = rows[1]?.textContent?.trim() || "";
  const contactLabel = rows[2]?.textContent?.trim() || "CONTACT";
  const contactUrl = rows[3]?.textContent?.trim() || "#";
  const stockSymbols = [stock1, stock2].filter(Boolean);

  /* ===============================
     2️⃣ HIDE AUTHORED ROWS (UE SAFE)
     =============================== */
  rows.forEach((row) => {
    row.style.display = "none";
  });

  /* ===============================
     3️⃣ BUILD RUNTIME DOM
     =============================== */
  const wrapper = document.createElement("div");
  wrapper.className = "header-utility-content";

  /* ---------- STOCK TICKER ---------- */
  const stockTicker = document.createElement("div");
  stockTicker.className = "stock-ticker";

  const stockTrack = document.createElement("div");
  stockTrack.className = "stock-track";
  stockTrack.innerHTML = `<div class="stock-loading">Loading market data…</div>`;

  stockTicker.appendChild(stockTrack);

  /* ---------- RIGHT UTILITIES ---------- */
  const utilityNav = document.createElement("div");
  utilityNav.className = "utility-nav position-relative";

  /* CONTACT */
  const contactGroup = document.createElement("div");
  contactGroup.className = "nav-group";
  contactGroup.innerHTML = `
    <a href="${contactUrl}" class="nav-label">
      ${contactLabel}
    </a>
  `;

  /* LANGUAGE (STATIC – will now swap with Bhashini) */
  const langGroup = document.createElement("div");
  langGroup.className = "nav-group language-group";
  langGroup.innerHTML = `
    <span class="nav-label">
      ENG <span class="arrow"><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/>
</svg></span>
    </span>
  `;

  /* BHASHINI BUTTON – swapped with language */
  const bhashiniGroup = document.createElement("div");
  bhashiniGroup.className = "nav-group bhashini-group";
  const bhashiniBtn = document.createElement("div");
  bhashiniBtn.className = "bhashini-btn";
  bhashiniGroup.appendChild(bhashiniBtn);

  /* ICONS */
  const iconsGroup = document.createElement("div");
  iconsGroup.className = "utility-icons";
  iconsGroup.innerHTML = `
    <button class="icon-btn audio-btn" id="speech-button" aria-label="Play Audio" type="button">
      <span class="icon-headphone">
        <svg class="icon-play" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 17V12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12V17" stroke="currentColor" stroke-width="1.5"/>
          <path d="M22 15.5V17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M2 15.5V17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M8 13.8446C8 13.0802 8 12.698 7.82526 12.4323C7.73733 12.2985 7.62061 12.188 7.4844 12.1095C7.21371 11.9535 6.84812 11.9896 6.11694 12.0617C4.88487 12.1831 4.26884 12.2439 3.82737 12.5764C3.60394 12.7448 3.41638 12.9593 3.27646 13.2067C3 13.6955 3 14.3395 3 15.6276V17.1933C3 18.4685 3 19.1061 3.28198 19.5986C3.38752 19.7829 3.51981 19.9491 3.67416 20.0913C4.08652 20.4714 4.68844 20.5901 5.89227 20.8275C6.73944 20.9945 7.16302 21.078 7.47564 20.9021C7.591 20.8372 7.69296 20.7493 7.77572 20.6434C8 20.3565 8 19.9078 8 19.0104V13.8446Z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M16 13.8446C16 13.0802 16 12.698 16.1747 12.4323C16.2627 12.2985 16.3794 12.188 16.5156 12.1095C16.7863 11.9535 17.1519 11.9896 17.8831 12.0617C19.1151 12.1831 19.7312 12.2439 20.1726 12.5764C20.3961 12.7448 20.5836 12.9593 20.7235 13.2067C21 13.6955 21 14.3395 21 15.6276V17.1933C21 18.4685 21 19.1061 20.718 19.5986C20.6125 19.7829 20.4802 19.9491 20.3258 20.0913C19.9135 20.4714 19.3116 20.5901 18.1077 20.8275C17.2606 20.9945 16.837 21.078 16.5244 20.9021C16.409 20.8372 16.307 20.7493 16.2243 20.6434C16 20.3565 16 19.9078 16 19.0104V13.8446Z" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <svg class="icon-stop" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: none;">
          <rect x="8" y="8" width="8" height="8" stroke="currentColor" stroke-width="1.5"/>
          <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </span>
    </button>
    <button class="icon-btn accessibility-btn" id="accessibility-button" aria-label="Accessibility Options" type="button">
      <span class="icon-accessibility">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/>
          <path d="M14 7C14 8.10457 13.1046 9 12 9C10.8954 9 10 8.10457 10 7C10 5.89543 10.8954 5 12 5C13.1046 5 14 5.89543 14 7Z" stroke="currentColor" stroke-width="1.5"/>
          <path d="M18 10C18 10 14.4627 11.5 12 11.5C9.53727 11.5 6 10 6 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M12 12V13.4522M12 13.4522C12 14.0275 12.1654 14.5906 12.4765 15.0745L15 19M12 13.4522C12 14.0275 11.8346 14.5906 11.5235 15.0745L9 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </span>
    </button>
  `;

  // Append in order: Contact → BHASHINI → Language → Icons
  utilityNav.append(contactGroup, bhashiniGroup, langGroup, iconsGroup);

  /* ---------- ASSEMBLE ---------- */
  wrapper.append(stockTicker, utilityNav);
  block.after(wrapper);

  /* ===============================
     4️⃣ FETCH STOCK DATA (WITH CACHE – now using localStorage)
     =============================== */
  try {
    const stockData = await fetchStockData();
    renderStocks(stockTrack, stockSymbols, stockData, STOCK_CODES);
  } catch (e) {
    console.error("Stock API Error:", e);
    stockTrack.innerHTML = `<div class="stock-error">Market data unavailable</div>`;
  }

  /* ===============================
     5️⃣ INIT BHASHINI (LANGUAGE) - ACTIVE
     =============================== */
  initBhashini(bhashiniGroup);

  console.log("Header Utility initialized");
}

/* ======================================================
   ACCESSIBILITY MODAL FUNCTIONALITY
   ====================================================== */
/* ======================================================
   ACCESSIBILITY MODAL FUNCTIONALITY
   ====================================================== */
function initAccessibilityModal() {
  console.log("Initializing accessibility modal...");
  
  // Create modal HTML - NO BACKGROUND OVERLAY
  const modalHTML = `
    <div class="accessibility-modal" id="accessibility-modal" style="display: none; position: fixed; top: 80px; right: 20px; z-index: 9999; width: 300px;">
      <div class="accessibility-modal-content" style="background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); width: 100%; max-height: 80vh; overflow-y: auto; border: 1px solid #e5e5e5;">
        <div class="accessibility-modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #e5e5e5; background-color: #f8f9fa;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #333;">Accessibility Options</h3>
          <button class="accessibility-modal-close" aria-label="Close accessibility options" style="background: none; border: none; font-size: 24px; line-height: 1; cursor: pointer; color: #666; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">&times;</button>
        </div>
        <div class="accessibility-modal-body" style="padding: 20px;">
          <div class="accessibility-options" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
            <!-- Font Size with 3-step toggle -->
            <div class="accessibility-font-size" style="margin-bottom: 16px;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span class="option-icon" style="font-size: 18px; margin-right: 12px; width: 24px; text-align: center; font-weight: bold;">A+</span>
                <span class="option-text" style="flex: 1; font-size: 14px; color: #333; font-weight: 500;">Font Size</span>
                <div class="font-size-dots" id="font-size-dots" style="display: flex; gap: 4px;">
                  <span class="font-size-dot" data-level="1" style="width: 8px; height: 8px; border-radius: 50%; background-color: #ddd; cursor: pointer;"></span>
                  <span class="font-size-dot" data-level="2" style="width: 8px; height: 8px; border-radius: 50%; background-color: #ddd; cursor: pointer;"></span>
                  <span class="font-size-dot" data-level="3" style="width: 8px; height: 8px; border-radius: 50%; background-color: #ddd; cursor: pointer;"></span>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <button class="font-size-btn font-size-decrease" style="background: none; border: 1px solid #ddd; border-radius: 4px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; color: #333;">-</button>
                <span class="font-size-label" id="font-size-label" style="font-size: 14px; color: #666;">Normal</span>
                <button class="font-size-btn font-size-increase" style="background: none; border: 1px solid #ddd; border-radius: 4px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; color: #333;">+</button>
              </div>
            </div>
            
            <!-- Highlight Links -->
            <button class="accessibility-option-btn" data-option="highlight-links" style="display: flex; align-items: center; width: 100%; padding: 12px 16px; background-color: #f8f9fa; border: 1px solid #e5e5e5; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; text-align: left; position: relative;">
              <span class="option-icon" style="font-size: 18px; margin-right: 12px; width: 24px; text-align: center;">🔗</span>
              <span class="option-text" style="flex: 1; font-size: 14px; color: #333; font-weight: 500;">Highlight Links</span>
              <span class="option-checkmark" style="display: none; width: 20px; height: 20px; border-radius: 4px; background-color: #007bff; position: relative; margin-left: 8px;">
                <svg style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 12px; height: 12px; fill: white;" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                </svg>
              </span>
            </button>
            
            <!-- Dark Mode -->
            <button class="accessibility-option-btn" data-option="dark-mode" style="display: flex; align-items: center; width: 100%; padding: 12px 16px; background-color: #f8f9fa; border: 1px solid #e5e5e5; border-radius: 6px; cursor: pointer; transition: all 0.2s ease; text-align: left; position: relative;">
              <span class="option-icon" style="font-size: 18px; margin-right: 12px; width: 24px; text-align: center;">🌙</span>
              <span class="option-text" style="flex: 1; font-size: 14px; color: #333; font-weight: 500;">Dark Mode</span>
              <span class="option-checkmark" style="display: none; width: 20px; height: 20px; border-radius: 4px; background-color: #007bff; position: relative; margin-left: 8px;">
                <svg style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 12px; height: 12px; fill: white;" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                </svg>
              </span>
            </button>
          </div>
          <div class="accessibility-actions" style="display: flex; justify-content: center;">
            <button class="accessibility-reset-btn" id="accessibility-reset" style="display: flex; align-items: center; gap: 8px; padding: 10px 20px; background-color: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background-color 0.2s ease;">
              <span class="reset-icon" style="font-size: 16px;">↺</span>
              <span class="reset-text" style="font-size: 14px;">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <style id="accessibility-styles">
      /* Font Size Levels */
      .font-size-level-1 {
        font-size: 1.1em !important;
      }
      
      .font-size-level-2 {
        font-size: 1.2em !important;
      }
      
      .font-size-level-3 {
        font-size: 1.3em !important;
      }
      
      .font-size-level-1 *,
      .font-size-level-2 *,
      .font-size-level-3 * {
        font-size: inherit !important;
      }
      
      .font-size-level-1 button,
      .font-size-level-1 input,
      .font-size-level-1 select,
      .font-size-level-1 textarea,
      .font-size-level-2 button,
      .font-size-level-2 input,
      .font-size-level-2 select,
      .font-size-level-2 textarea,
      .font-size-level-3 button,
      .font-size-level-3 input,
      .font-size-level-3 select,
      .font-size-level-3 textarea {
        font-size: 1em !important;
      }
      
      /* Active font size dot */
      .font-size-dot.active {
        background-color: #007bff !important;
      }
      
      /* Highlight Links Styles */
      .highlight-links-active a {
        background-color: #ffff00 !important;
        color: #000000 !important;
        padding: 2px 4px !important;
        border-radius: 3px !important;
        font-weight: bold !important;
        text-decoration: underline !important;
      }
      
      .highlight-links-active a:hover {
        background-color: #ffeb3b !important;
        text-decoration: none !important;
      }
      
      /* Dark Mode - SPECIFIC COLOR INVERTER */
      .dark-mode-active {
        /* Background and text color inversion */
        background-color: #121212 !important;
        color: #ffffff !important;
      }
      
      /* Specific color inversions */
      .dark-mode-active,
      .dark-mode-active * {
        /* Invert blue colors */
        --blue: #ffcc99 !important;           /* #003366 inverted */
        --red: #00ffff !important;            /* #ff0000 inverted */
        --yellow: #055ae6 !important;         /* #faa519 inverted */
        --turquoise: #ff543a !important;      /* #00abc5 inverted */
        --royal-blue: #cfa054 !important;     /* #305fab inverted */
        --gblue: #aa7b30 !important;          /* #5584cf inverted */
        --sky-blue: #1d1508 !important;       /* #e2eaf7 inverted */
        --orange: #0974e1 !important;         /* #f68b1e inverted */
        --lorange: #0444ac !important;        /* #fbbb53 inverted */
        --green: #d174a8 !important;          /* #2e8b57 inverted */
        --light-grey: #1f1f1f !important;     /* #e0e0e0 inverted */
        --white: #000000 !important;          /* #ffffff inverted */
        --black: #ffffff !important;          /* #000000 inverted */
        --charcoal: #cccccc !important;       /* currentColor inverted */
        --lpink: #010b1d !important;          /* #fef4e2 inverted */
      }
      
      /* Apply inverted colors to elements that use these variables */
      .dark-mode-active [style*="--blue"],
      .dark-mode-active [style*="003366"],
      .dark-mode-active [style*="#003366"] {
        background-color: var(--blue) !important;
        color: var(--blue) !important;
        border-color: var(--blue) !important;
      }
      
      .dark-mode-active [style*="--red"],
      .dark-mode-active [style*="ff0000"],
      .dark-mode-active [style*="#ff0000"] {
        background-color: var(--red) !important;
        color: var(--red) !important;
        border-color: var(--red) !important;
      }
      
      .dark-mode-active [style*="--yellow"],
      .dark-mode-active [style*="faa519"],
      .dark-mode-active [style*="#faa519"] {
        background-color: var(--yellow) !important;
        color: var(--yellow) !important;
        border-color: var(--yellow) !important;
      }
      
      .dark-mode-active [style*="--turquoise"],
      .dark-mode-active [style*="00abc5"],
      .dark-mode-active [style*="#00abc5"] {
        background-color: var(--turquoise) !important;
        color: var(--turquoise) !important;
        border-color: var(--turquoise) !important;
      }
      
      .dark-mode-active [style*="--royal-blue"],
      .dark-mode-active [style*="305fab"],
      .dark-mode-active [style*="#305fab"] {
        background-color: var(--royal-blue) !important;
        color: var(--royal-blue) !important;
        border-color: var(--royal-blue) !important;
      }
      
      .dark-mode-active [style*="--gblue"],
      .dark-mode-active [style*="5584cf"],
      .dark-mode-active [style*="#5584cf"] {
        background-color: var(--gblue) !important;
        color: var(--gblue) !important;
        border-color: var(--gblue) !important;
      }
      
      .dark-mode-active [style*="--sky-blue"],
      .dark-mode-active [style*="e2eaf7"],
      .dark-mode-active [style*="#e2eaf7"] {
        background-color: var(--sky-blue) !important;
        color: var(--sky-blue) !important;
        border-color: var(--sky-blue) !important;
      }
      
      .dark-mode-active [style*="--orange"],
      .dark-mode-active [style*="f68b1e"],
      .dark-mode-active [style*="#f68b1e"] {
        background-color: var(--orange) !important;
        color: var(--orange) !important;
        border-color: var(--orange) !important;
      }
      
      .dark-mode-active [style*="--lorange"],
      .dark-mode-active [style*="fbbb53"],
      .dark-mode-active [style*="#fbbb53"] {
        background-color: var(--lorange) !important;
        color: var(--lorange) !important;
        border-color: var(--lorange) !important;
      }
      
      .dark-mode-active [style*="--green"],
      .dark-mode-active [style*="2e8b57"],
      .dark-mode-active [style*="#2e8b57"] {
        background-color: var(--green) !important;
        color: var(--green) !important;
        border-color: var(--green) !important;
      }
      
      .dark-mode-active [style*="--light-grey"],
      .dark-mode-active [style*="e0e0e0"],
      .dark-mode-active [style*="#e0e0e0"] {
        background-color: var(--light-grey) !important;
        color: var(--light-grey) !important;
        border-color: var(--light-grey) !important;
      }
      
      .dark-mode-active [style*="--white"],
      .dark-mode-active [style*="ffffff"],
      .dark-mode-active [style*="#ffffff"] {
        background-color: var(--white) !important;
        color: var(--white) !important;
        border-color: var(--white) !important;
      }
      
      .dark-mode-active [style*="--black"],
      .dark-mode-active [style*="000000"],
      .dark-mode-active [style*="#000000"] {
        background-color: var(--black) !important;
        color: var(--black) !important;
        border-color: var(--black) !important;
      }
      
      .dark-mode-active [style*="--charcoal"],
      .dark-mode-active [style*="333333"],
      .dark-mode-active [style*="currentColor"] {
        background-color: var(--charcoal) !important;
        color: var(--charcoal) !important;
        border-color: var(--charcoal) !important;
      }
      
      .dark-mode-active [style*="--lpink"],
      .dark-mode-active [style*="fef4e2"],
      .dark-mode-active [style*="#fef4e2"] {
        background-color: var(--lpink) !important;
        color: var(--lpink) !important;
        border-color: var(--lpink) !important;
      }
      
      /* General color inversion for common color names */
      .dark-mode-active .blue,
      .dark-mode-active .red,
      .dark-mode-active .yellow,
      .dark-mode-active .turquoise,
      .dark-mode-active .royal-blue,
      .dark-mode-active .gblue,
      .dark-mode-active .sky-blue,
      .dark-mode-active .orange,
      .dark-mode-active .lorange,
      .dark-mode-active .green,
      .dark-mode-active .light-grey,
      .dark-mode-active .white,
      .dark-mode-active .black,
      .dark-mode-active .charcoal,
      .dark-mode-active .lpink {
        filter: invert(1) hue-rotate(180deg) !important;
      }
      
      /* Exclude images from any inversion */
      .dark-mode-active img,
      .dark-mode-active video,
      .dark-mode-active iframe,
      .dark-mode-active canvas,
      .dark-mode-active svg {
        filter: none !important;
      }
      
      /* Modal specific fixes for dark mode */
      .dark-mode-active .accessibility-modal-content {
        background-color: #2d2d2d !important;
        color: #ffffff !important;
        border-color: #555 !important;
      }
      
      .dark-mode-active .accessibility-modal-header {
        background-color: #3d3d3d !important;
        border-bottom-color: #555 !important;
      }
      
      .dark-mode-active .accessibility-modal-header h3 {
        color: #ffffff !important;
      }
      
      .dark-mode-active .accessibility-option-btn {
        background-color: #3d3d3d !important;
        border-color: #555 !important;
        color: #ffffff !important;
      }
      
      .dark-mode-active .accessibility-option-btn .option-text {
        color: #ffffff !important;
      }
      
      .dark-mode-active .option-icon {
        color: #ffffff !important;
      }
      
      .dark-mode-active .accessibility-reset-btn {
        background-color: #495057 !important;
      }
      
      .dark-mode-active .font-size-btn {
        border-color: #555 !important;
        color: #ffffff !important;
      }
      
      .dark-mode-active #font-size-label {
        color: #ffffff !important;
      }
      
      .dark-mode-active .font-size-dot:not(.active) {
        background-color: #555 !important;
      }
      
      /* Active button styles */
      .accessibility-option-btn.active {
        background-color: #e7f4ff !important;
        border-color: #007bff !important;
      }
      
      .accessibility-option-btn.active .option-checkmark {
        display: block !important;
      }
      
      .dark-mode-active .accessibility-option-btn.active {
        background-color: #1a3a5f !important;
        border-color: #4dabf7 !important;
      }
    </style>
  `;

  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  console.log("Modal HTML added to body");

  // Wait a bit for DOM to be ready, then set up event listeners
  setTimeout(() => {
    setupAccessibilityModalEvents();
  }, 100);
}

function setupAccessibilityModalEvents() {
  console.log("Setting up accessibility modal events...");
  
  // Get elements
  const accessibilityBtn = document.getElementById('accessibility-button');
  const modal = document.getElementById('accessibility-modal');
  
  if (!accessibilityBtn) {
    console.error("Accessibility button not found!");
    return;
  }
  
  if (!modal) {
    console.error("Accessibility modal not found!");
    return;
  }
  
  console.log("Found accessibility button and modal:", accessibilityBtn, modal);
  
  const closeBtn = modal.querySelector('.accessibility-modal-close');
  const resetBtn = document.getElementById('accessibility-reset');
  const optionButtons = modal.querySelectorAll('.accessibility-option-btn');
  const fontSizeIncreaseBtn = modal.querySelector('.font-size-increase');
  const fontSizeDecreaseBtn = modal.querySelector('.font-size-decrease');
  const fontSizeDots = modal.querySelectorAll('.font-size-dot');
  const fontSizeLabel = document.getElementById('font-size-label');

  // Load saved preferences
  loadAccessibilityPreferences();

  // Toggle modal visibility
  accessibilityBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("Accessibility button clicked!");
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
  });

  // Close modal when clicking close button
  closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
  });

  // Close modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      modal.style.display = 'none';
    }
  });

  // Handle font size increase
  fontSizeIncreaseBtn.addEventListener('click', function() {
    increaseFontSize();
  });

  // Handle font size decrease
  fontSizeDecreaseBtn.addEventListener('click', function() {
    decreaseFontSize();
  });

  // Handle font size dot clicks
  fontSizeDots.forEach(dot => {
    dot.addEventListener('click', function() {
      const level = parseInt(this.getAttribute('data-level'));
      setFontSizeLevel(level);
    });
  });

  // Handle option button clicks - whole button is clickable
  optionButtons.forEach(button => {
    button.addEventListener('click', function() {
      const option = this.getAttribute('data-option');
      console.log("Option clicked:", option);
      toggleAccessibilityOption(option, this);
    });
  });

  // Handle reset button - ENHANCED WITH DEBUGGING
  resetBtn.addEventListener('click', function() {
    console.log("Reset button clicked - starting reset process");
    resetAccessibilityOptions();
    // Close modal after reset
    setTimeout(() => {
      modal.style.display = 'none';
      console.log("Modal closed after reset");
    }, 300);
  });
  
  console.log("Accessibility modal events setup complete");
}

// Font size functionality
let currentFontSizeLevel = 0;
const fontSizeLevels = [
  { level: 0, className: '', label: 'Normal' },
  { level: 1, className: 'font-size-level-1', label: 'Large' },
  { level: 2, className: 'font-size-level-2', label: 'Larger' },
  { level: 3, className: 'font-size-level-3', label: 'Largest' }
];

function increaseFontSize() {
  if (currentFontSizeLevel < 3) {
    currentFontSizeLevel++;
    updateFontSize();
  }
}

function decreaseFontSize() {
  if (currentFontSizeLevel > 0) {
    currentFontSizeLevel--;
    updateFontSize();
  }
}

function setFontSizeLevel(level) {
  if (level >= 0 && level <= 3) {
    currentFontSizeLevel = level;
    updateFontSize();
  }
}

function updateFontSize() {
  const html = document.documentElement;
  const body = document.body;
  const modal = document.getElementById('accessibility-modal');
  
  if (!modal) return;
  
  // Remove all font size classes
  fontSizeLevels.forEach(fontLevel => {
    if (fontLevel.level > 0) {
      html.classList.remove(fontLevel.className);
      body.classList.remove(fontLevel.className);
    }
  });
  
  // Add current font size class
  if (currentFontSizeLevel > 0) {
    const currentLevel = fontSizeLevels[currentFontSizeLevel];
    html.classList.add(currentLevel.className);
    body.classList.add(currentLevel.className);
    fontSizeLabel.textContent = currentLevel.label;
    localStorage.setItem('accessibility-font-size', currentFontSizeLevel.toString());
  } else {
    fontSizeLabel.textContent = 'Normal';
    localStorage.removeItem('accessibility-font-size');
  }
  
  // Update dots
  const dots = modal.querySelectorAll('.font-size-dot');
  dots.forEach((dot, index) => {
    const dotLevel = index + 1;
    if (dotLevel <= currentFontSizeLevel) {
      dot.classList.add('active');
      dot.style.backgroundColor = '#007bff';
    } else {
      dot.classList.remove('active');
      dot.style.backgroundColor = '#ddd';
    }
  });
}

function toggleAccessibilityOption(option, button) {
  const html = document.documentElement;
  const body = document.body;
  const isActive = button.classList.contains('active');
  
  console.log(`Toggling ${option}: currently ${isActive ? 'active' : 'inactive'}`);
  
  switch(option) {
    case 'highlight-links':
      if (isActive) {
        // Remove link highlighting
        body.classList.remove('highlight-links-active');
        html.classList.remove('highlight-links-active');
        button.classList.remove('active');
        localStorage.removeItem('accessibility-highlight-links');
        console.log("Highlight links disabled");
      } else {
        // Add link highlighting
        body.classList.add('highlight-links-active');
        html.classList.add('highlight-links-active');
        button.classList.add('active');
        localStorage.setItem('accessibility-highlight-links', 'true');
        console.log("Highlight links enabled");
      }
      break;
      
    case 'dark-mode':
      if (isActive) {
        // Remove dark mode
        body.classList.remove('dark-mode-active');
        html.classList.remove('dark-mode-active');
        button.classList.remove('active');
        localStorage.removeItem('accessibility-dark-mode');
        console.log("Dark mode disabled");
      } else {
        // Add dark mode
        body.classList.add('dark-mode-active');
        html.classList.add('dark-mode-active');
        button.classList.add('active');
        localStorage.setItem('accessibility-dark-mode', 'true');
        console.log("Dark mode enabled");
      }
      break;
  }
}

function loadAccessibilityPreferences() {
  const html = document.documentElement;
  const body = document.body;
  const modal = document.getElementById('accessibility-modal');
  
  if (!modal) return;
  
  console.log("Loading accessibility preferences...");
  
  // Font Size
  const savedFontSize = localStorage.getItem('accessibility-font-size');
  if (savedFontSize !== null) {
    currentFontSizeLevel = parseInt(savedFontSize);
    updateFontSize();
    console.log(`Loaded: Font Size Level ${currentFontSizeLevel}`);
  }
  
  // Highlight Links
  if (localStorage.getItem('accessibility-highlight-links') === 'true') {
    body.classList.add('highlight-links-active');
    html.classList.add('highlight-links-active');
    const highlightBtn = modal.querySelector('[data-option="highlight-links"]');
    if (highlightBtn) highlightBtn.classList.add('active');
    console.log("Loaded: Highlight Links enabled");
  }
  
  // Dark Mode
  if (localStorage.getItem('accessibility-dark-mode') === 'true') {
    body.classList.add('dark-mode-active');
    html.classList.add('dark-mode-active');
    const darkModeBtn = modal.querySelector('[data-option="dark-mode"]');
    if (darkModeBtn) darkModeBtn.classList.add('active');
    console.log("Loaded: Dark Mode enabled");
  }
}

function resetAccessibilityOptions() {
  const html = document.documentElement;
  const body = document.body;
  const modal = document.getElementById('accessibility-modal');

  if (!modal) return;

  console.log("Resetting accessibility options...");

  /* ===============================
     1️⃣ RESET FONT SIZE
     =============================== */
  currentFontSizeLevel = 0;

  // Remove font size classes
  document.documentElement.className = document.documentElement.className
    .replace(/font-size-level-\d/g, '');
  document.body.className = document.body.className
    .replace(/font-size-level-\d/g, '');

  const fontSizeLabel = document.getElementById('font-size-label');
  if (fontSizeLabel) fontSizeLabel.textContent = 'Normal';

  modal.querySelectorAll('.font-size-dot').forEach(dot => {
    dot.classList.remove('active');
    dot.style.backgroundColor = '#ddd';
  });

  /* ===============================
     2️⃣ RESET HIGHLIGHT LINKS
     =============================== */
  html.classList.remove('highlight-links-active');
  body.classList.remove('highlight-links-active');

  /* ===============================
     3️⃣ RESET DARK MODE
     =============================== */
  html.classList.remove('dark-mode-active');
  body.classList.remove('dark-mode-active');

  /* ===============================
     4️⃣ RESET BUTTON STATES
     =============================== */
  modal.querySelectorAll('.accessibility-option-btn').forEach(button => {
    button.classList.remove('active');

    const checkmark = button.querySelector('.option-checkmark');
    if (checkmark) checkmark.style.display = 'none';
  });

  /* ===============================
     5️⃣ CLEAR LOCAL STORAGE
     =============================== */
  localStorage.removeItem('accessibility-font-size');
  localStorage.removeItem('accessibility-highlight-links');
  localStorage.removeItem('accessibility-dark-mode');

  console.log("Accessibility reset complete");
}


// Initialize accessibility modal when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing accessibility modal...");
    initAccessibilityModal();
  });
} else {
  console.log("DOM already loaded, initializing accessibility modal...");
  initAccessibilityModal();
}

/* ======================================================
   BHASHINI - ACTIVE
   ====================================================== */
function initBhashini(container) {
  if (container.querySelector(".bhashini-plugin-container")) return;

  const wrap = document.createElement("div");
  wrap.className = "bhashini-plugin-container";
  container.appendChild(wrap);

  if (!document.getElementById("bhashini-script")) {
    const script = document.createElement("script");
    script.id = "bhashini-script";
    script.src = "https://translation-plugin.bhashini.co.in/v3/website_translation_utility.js";
    script.defer = true;
    script.onload = function() {
      console.log("Bhashini script loaded");
      setTimeout(() => setupBhashiniLanguageMonitoring(), 1000);
    };
    script.onerror = () => {
      console.error("Failed to load Bhashini script");
      container.innerHTML = '<span class="bhashini-error">Translation unavailable</span>';
    };
    document.body.appendChild(script);
  }
}

/* ======================================================
   STOCK HELPERS (CACHING + CODE LOOKUP)
   ====================================================== */
async function fetchStockData() {
  const API_URL = "https://gmr.itsneobot.com:4000/api/share/get-latest-share-price";
  const AUTH_TOKEN = "U2FsdGVkX1+IAunex0zJueoZQpRBfpUm/DSQSMufK69HpTEh4abfdnhz0fQ+jbSmPrqojCZOhYZ6/mvA28aQxw";

  const CACHE_KEY      = "header-stock-data";
  const CACHE_TIME_KEY = "header-stock-data-time";
  const CACHE_TTL      = 60 * 1000; // 60 seconds

  try {
    // 1️⃣ Check localStorage cache first (survives page refresh)
    const cached = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

    if (cached && cachedTime) {
      const age = Date.now() - Number(cachedTime);
      if (age < CACHE_TTL) {
        return JSON.parse(cached);
      }
    }

    // 2️⃣ Call API only if cache missing/expired
    const response = await fetch(API_URL, {
      headers: {
        Authorization: AUTH_TOKEN,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`API Error ${response.status}`);
    }

    const json = await response.json();
    const data = json.success && Array.isArray(json.data) ? json.data : [];

    // 3️⃣ Save to localStorage cache
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());

    return data;

  } catch (error) {
    console.error("Stock fetch failed:", error);
    // Fallback to whatever is in cache (even if old)
    const fallback = localStorage.getItem(CACHE_KEY);
    return fallback ? JSON.parse(fallback) : [];
  }
}

function renderStocks(container, symbols, apiData, stockCodes) {
  container.innerHTML = "";

  // 1. Index the API data by Company Code for O(1) Lookup
  const apiDataMap = {};
  apiData.forEach(item => {
    if (item.companyCode) {
      apiDataMap[String(item.companyCode)] = item;
    }
  });

  // 2. Iterate through requested symbols (GAL, GPUIL)
  [...new Set(symbols)].forEach((sym) => {
    const upperSym = sym.toUpperCase();
    // Lookup the correct ID from our CONFIG map
    const code = stockCodes[upperSym];
    const record = code ? apiDataMap[code] : null;

    // Show placeholder if no data found
    if (!record) {
      const item = document.createElement("div");
      item.className = `stock-item stock-code stock-${upperSym}`;
      item.innerHTML = `<strong>${sym}</strong><span class="stock-no-data">No data</span>`;
      container.appendChild(item);
      return;
    }

    const item = document.createElement("div");
    item.className = `stock-item stock-code stock-${upperSym}`;
    item.innerHTML = `<strong>${sym}</strong>`; // Display "GAL" (Short Name)

    if (record.exchanges && Array.isArray(record.exchanges)) {
      record.exchanges.forEach((ex) => {
        const down = ex.change < 0;
        const exchangeWrapper = document.createElement("div");
        exchangeWrapper.className = `exchange-wrapper ${down ? "trend-down" : "trend-up"} stock-${upperSym} exchange-${ex.exchange.toLowerCase()}`;

        const price = Number(ex.lastTradedPrice) || 0;
        const change = Number(ex.change) || 0;
        const changePercent = Number(ex.changePercent) || 0;

        exchangeWrapper.innerHTML = `
          <span class="exchange_name">${ex.exchange}</span>
          <span class="exchange_trend">${down ? "↓" : "↑"}</span>
          <span class="exchange_price">₹${price.toFixed(2)}</span>
          <span class="exchange_change">${change.toFixed(2)} (${changePercent.toFixed(2)}%)</span>
        `;

        item.appendChild(exchangeWrapper);
      });
    }

    container.appendChild(item);
  });

  if (!container.children.length) {
    container.innerHTML = `<div class="stock-empty">No active stocks</div>`;
  }
}

/* ======================================================
   BHASHINI LANGUAGE MONITORING - ACTIVE
   ====================================================== */
function setupBhashiniLanguageMonitoring() {
  console.log("Setting up Bhashini language monitoring");

  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    if (key === 'preferredLanguage') {
      updateLanguageIndicator(value);
    }
  };

  window.addEventListener('storage', function(e) {
    if (e.key === 'preferredLanguage') {
      updateLanguageIndicator(e.newValue);
    }
  });

  if (window.BhashiniTranslationUtility) {
    window.BhashiniTranslationUtility.onLanguageChange = function(lang) {
      updateLanguageIndicator(lang);
    };
  }
}

function updateLanguageIndicator(langCode) {
  const langGroup = document.querySelector('.language-group .nav-label');
  if (!langGroup) return;

  const langNames = {
    'en': 'ENG', 'hi': 'हिन्दी', 'ta': 'தமிழ்', 'te': 'తెలుగు',
    'kn': 'ಕನ್ನಡ', 'ml': 'മലയാളം', 'mr': 'मराठी', 'gu': 'ગુજરાતી',
    'pa': 'ਪੰਜਾਬी', 'bn': 'বাংলা', 'ur': 'اردو', 'as': 'অসমীয়া',
    'brx': 'बर', 'doi': 'डोगरी', 'gom': 'कोंकणी', 'ks': 'कॉशुर',
    'mai': 'मैथिली', 'mni': 'मैतैलोन्', 'ne': 'नेपाली', 'or': 'ଓଡ଼ିଆ',
    'sa': 'संस्कृतम्', 'sat': 'ᱥᱟᱱᱛᱟᱲी', 'sd': 'سنڌي'
  };

  const displayName = langNames[langCode] || langCode.toUpperCase();
  const arrowSvg = '<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/></svg>';

  langGroup.innerHTML = `${displayName} <span class="arrow">${arrowSvg}</span>`;
}