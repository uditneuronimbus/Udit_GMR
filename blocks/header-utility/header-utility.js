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
    <div class="accessibility-modal" id="accessibility-modal" style="display: none; position: fixed; top: 60px; right: 20px; z-index: 9999; width: 100%;max-width:500px;">
      <div class="accessibility-modal-content" style="background-color: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); width: 100%; max-height: 80vh; overflow-y: auto; border: 1px solid var(--light-grey);">
        <div class="accessibility-modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; border-bottom: 1px solid var(--light-grey); background-color: var(--white);">
          <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: var(--charcoal);">Accessibility Options</h3>
          <button class="accessibility-modal-close" aria-label="Close accessibility options" style="background: none; border: none; font-size: 2rem; line-height: 1; cursor: pointer; color: var(--yellow); padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">&times;</button>
        </div>
        <div class="accessibility-modal-body" style="padding: 20px;">
          <div class="accessibility-options" style="display: flex; flex-direction: row; gap: 12px; margin-bottom: 20px;">
            <!-- Font Size with 3-step toggle -->
            <div class="accessibility-font-size" style="display: flex; justify-content: center; flex-direction: column; align-items: center; width: 100%; padding: 12px 16px; background-color: var(--white); border: 1px solid var(--light-grey); border-radius: 16px; cursor: pointer; transition: all 0.2s ease; text-align: left; position: relative;">
              <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 8px;">
                <span class="option-icon" style="font-size: 18px; margin-right: 12px; width: 32px; text-align: center; font-weight: bold;">
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_1836_2719)">
<path d="M16.6666 16H20.6666V25.3333H24.6666V16H28.6666V12H16.6666V16ZM20.6666 5.33334H3.33325V9.33334H9.99992V25.3333H13.9999V9.33334H20.6666V5.33334Z" fill="#003366"/>
</g>
<defs>
<clipPath id="clip0_1836_2719">
<rect width="32" height="32" fill="white"/>
</clipPath>
</defs>
</svg>
</span>
<span class="option-text" style="font-size: 1rem; text-align: center; color: var(--blue); font-weight: 500;">Bigger Text</span>
<span class="option-checkmark" style="display: none; width: 10px; height: 10px; border-radius: 100px; background-color: var(--yellow); position: absolute;top:10px;right:10px;"></span>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 8px; align-items: center;">
                <button class="font-size-btn font-size-decrease" style="background: none; border: 1px solid #ddd; border-radius: 4px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; color: var(--charcoal);">-</button>
                <span class="font-size-label" id="font-size-label" style="font-size: 14px; color: var(--charcoal);">
                  <div class="font-size-dots" id="font-size-dots" style="display: flex; gap: 4px;">
                  <span class="font-size-dot dot1" data-level="1" style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--light-grey); cursor: pointer;"></span>
                  <span class="font-size-dot dot2" data-level="2" style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--light-grey); cursor: pointer;"></span>
                  <span class="font-size-dot dot3" data-level="3" style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--light-grey); cursor: pointer;"></span>
                </div>
                </span>
                <button class="font-size-btn font-size-increase" style="background: none; border: 1px solid #ddd; border-radius: 4px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 18px; color: var(--charcoal);">+</button>
              </div>
            </div>
            
            <!-- Highlight Links -->
            <button class="accessibility-option-btn" data-option="highlight-links" style="display: flex; justify-content: center; flex-direction: column; align-items: center; width: 100%; padding: 12px 16px; background-color: var(--white); border: 1px solid var(--light-grey); border-radius: 16px; cursor: pointer; transition: all 0.2s ease; text-align: left; position: relative;">
              <span class="option-icon" style="font-size: 18px; margin-right: 12px; width: 24px; text-align: center;">
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0_1836_2723" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
<rect width="32" height="32" fill="#D9D9D9"/>
</mask>
<g mask="url(#mask0_1836_2723)">
<path d="M9.33341 22.6667C7.48897 22.6667 5.91675 22.0167 4.61675 20.7167C3.31675 19.4167 2.66675 17.8444 2.66675 16C2.66675 14.1556 3.31675 12.5833 4.61675 11.2833C5.91675 9.98334 7.48897 9.33334 9.33341 9.33334H13.3334C13.7112 9.33334 14.0279 9.46111 14.2834 9.71667C14.539 9.97222 14.6667 10.2889 14.6667 10.6667C14.6667 11.0444 14.539 11.3611 14.2834 11.6167C14.0279 11.8722 13.7112 12 13.3334 12H9.33341C8.2223 12 7.27786 12.3889 6.50008 13.1667C5.7223 13.9444 5.33341 14.8889 5.33341 16C5.33341 17.1111 5.7223 18.0556 6.50008 18.8333C7.27786 19.6111 8.2223 20 9.33341 20H13.3334C13.7112 20 14.0279 20.1278 14.2834 20.3833C14.539 20.6389 14.6667 20.9556 14.6667 21.3333C14.6667 21.7111 14.539 22.0278 14.2834 22.2833C14.0279 22.5389 13.7112 22.6667 13.3334 22.6667H9.33341ZM12.0001 17.3333C11.6223 17.3333 11.3056 17.2056 11.0501 16.95C10.7945 16.6944 10.6667 16.3778 10.6667 16C10.6667 15.6222 10.7945 15.3056 11.0501 15.05C11.3056 14.7944 11.6223 14.6667 12.0001 14.6667H20.0001C20.3779 14.6667 20.6945 14.7944 20.9501 15.05C21.2056 15.3056 21.3334 15.6222 21.3334 16C21.3334 16.3778 21.2056 16.6944 20.9501 16.95C20.6945 17.2056 20.3779 17.3333 20.0001 17.3333H12.0001ZM18.6667 22.6667C18.289 22.6667 17.9723 22.5389 17.7167 22.2833C17.4612 22.0278 17.3334 21.7111 17.3334 21.3333C17.3334 20.9556 17.4612 20.6389 17.7167 20.3833C17.9723 20.1278 18.289 20 18.6667 20H22.6667C23.7779 20 24.7223 19.6111 25.5001 18.8333C26.2779 18.0556 26.6667 17.1111 26.6667 16C26.6667 14.8889 26.2779 13.9444 25.5001 13.1667C24.7223 12.3889 23.7779 12 22.6667 12H18.6667C18.289 12 17.9723 11.8722 17.7167 11.6167C17.4612 11.3611 17.3334 11.0444 17.3334 10.6667C17.3334 10.2889 17.4612 9.97222 17.7167 9.71667C17.9723 9.46111 18.289 9.33334 18.6667 9.33334H22.6667C24.5112 9.33334 26.0834 9.98334 27.3834 11.2833C28.6834 12.5833 29.3334 14.1556 29.3334 16C29.3334 17.8444 28.6834 19.4167 27.3834 20.7167C26.0834 22.0167 24.5112 22.6667 22.6667 22.6667H18.6667Z" fill="#003366"/>
</g>
</svg>
</span>
              <span class="option-text" style="font-size: 1rem; text-align: center; color: var(--blue); font-weight: 500;">Highlight Links</span>
              <span class="option-checkmark" style="display: none; width: 10px; height: 10px; border-radius: 100px; background-color: var(--yellow); position: absolute;top:10px;right:10px;"></span>
            </button>
            
            <!-- Dark Mode -->
            <button class="accessibility-option-btn" data-option="dark-mode" style="display: flex; justify-content: center; flex-direction: column; align-items: center; width: 100%; padding: 12px 16px; background-color: var(--white); border: 1px solid var(--light-grey); border-radius: 16px; cursor: pointer; transition: all 0.2s ease; text-align: left; position: relative;">
              <span class="option-icon" style="font-size: 18px; width: 32px; text-align: center;">
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0_1836_2729" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="32" height="32">
<rect width="32" height="32" fill="#D9D9D9"/>
</mask>
<g mask="url(#mask0_1836_2729)">
<path d="M16.0001 29.3333C14.1556 29.3333 12.4223 28.9833 10.8001 28.2833C9.17786 27.5833 7.76675 26.6333 6.56675 25.4333C5.36675 24.2333 4.41675 22.8222 3.71675 21.2C3.01675 19.5778 2.66675 17.8444 2.66675 16C2.66675 14.1556 3.01675 12.4222 3.71675 10.8C4.41675 9.17777 5.36675 7.76666 6.56675 6.56666C7.76675 5.36666 9.17786 4.41666 10.8001 3.71666C12.4223 3.01666 14.1556 2.66666 16.0001 2.66666C17.8445 2.66666 19.5779 3.01666 21.2001 3.71666C22.8223 4.41666 24.2334 5.36666 25.4334 6.56666C26.6334 7.76666 27.5834 9.17777 28.2834 10.8C28.9834 12.4222 29.3334 14.1556 29.3334 16C29.3334 17.8444 28.9834 19.5778 28.2834 21.2C27.5834 22.8222 26.6334 24.2333 25.4334 25.4333C24.2334 26.6333 22.8223 27.5833 21.2001 28.2833C19.5779 28.9833 17.8445 29.3333 16.0001 29.3333ZM17.3334 26.5667C19.9779 26.2333 22.1945 25.0722 23.9834 23.0833C25.7723 21.0944 26.6667 18.7333 26.6667 16C26.6667 13.2667 25.7723 10.9056 23.9834 8.91666C22.1945 6.92777 19.9779 5.76666 17.3334 5.43333V26.5667Z" fill="#003366"/>
</g>
</svg></span>
              <span class="option-text" style="font-size: 1rem; text-align: center; color: var(--blue); font-weight: 500;">Dark Mode</span>
              <span class="option-checkmark" style="display: none; width: 10px; height: 10px; border-radius: 100px; background-color: var(--yellow); position: absolute;top:10px;right:10px;"></span>
            </button>
          </div>
          
        </div>
        <div class="accessibility-actions" style="display: flex;padding: 16px 20px;box-shadow: 0px -1px 4px rgba(0, 0, 0, 0.12);">
            <button class="accessibility-reset-btn" id="accessibility-reset" style="display: flex; align-items: center; gap: 8px; padding: 10px 20px; background-color: var(--blue); color: var(--white); border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background-color 0.2s ease;">
              <span class="reset-icon" style="font-size: 16px;">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_1836_2735)">
<path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58001 4 4.01001 7.58 4.01001 12C4.01001 16.42 7.58001 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69001 18 6.00001 15.31 6.00001 12C6.00001 8.69 8.69001 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_1836_2735">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>
</svg></span>
              <span class="reset-text" style="font-size: 1rem;">Reset</span>
            </button>
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
        background-color: var(--royal-blue) !important;
      }
      
      /* Highlight Links Styles */
      .highlight-links-active a {
        background-color: var(--yellow) !important;
        color: var(--black) !important;
      }
      
      /* Dark Mode - SPECIFIC COLOR INVERTER */
      .dark-mode-active {
        /* Background and text color inversion */
        background-color: var(--black) !important;
        color: var(--white) !important;
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
        color: var(--white) !important;
        border-color: #555 !important;
      }
      
      .dark-mode-active .accessibility-modal-header {
        background-color: #3d3d3d !important;
        border-bottom-color: #555 !important;
      }
      
      .dark-mode-active .accessibility-modal-header h3 {
        color: var(--white) !important;
      }
      
      .dark-mode-active .accessibility-option-btn {
        background-color: #3d3d3d !important;
        border-color: #555 !important;
        color: var(--white) !important;
      }
      
      .dark-mode-active .accessibility-option-btn .option-text {
        color: var(--white) !important;
      }
      
      .dark-mode-active .option-icon {
        color: var(--white) !important;
      }
      
      .dark-mode-active .accessibility-reset-btn {
        background-color: #495057 !important;
      }
      
      .dark-mode-active .font-size-btn {
        border-color: var(--charcoal) !important;
        color: var(--white) !important;
      }
      
      .dark-mode-active #font-size-label {
        color: var(--white) !important;
      }
      
      .dark-mode-active .font-size-dot:not(.active) {
        background-color: #555 !important;
      }
      
      /* Active button styles */
      .accessibility-option-btn.active {
        box-shadow: 0px 0px 25px rgba(0, 0, 0, 0.10);
      }
      
      .accessibility-option-btn.active .option-checkmark {
        display: block !important;
      }
      
      .dark-mode-active .accessibility-option-btn.active {
        box-shadow: 0px 0px 25px rgba(0, 0, 0, 0.10);
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
  accessibilityBtn.addEventListener('click', function (e) {
    e.preventDefault();
    e.stopPropagation();
    console.log("Accessibility button clicked!");
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
  });

  // Close modal when clicking close button
  closeBtn.addEventListener('click', function () {
    modal.style.display = 'none';
  });

  // Close modal with Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      modal.style.display = 'none';
    }
  });

  // Handle font size increase
  fontSizeIncreaseBtn.addEventListener('click', function () {
    increaseFontSize();
  });

  // Handle font size decrease
  fontSizeDecreaseBtn.addEventListener('click', function () {
    decreaseFontSize();
  });

  // Handle font size dot clicks
  fontSizeDots.forEach(dot => {
    dot.addEventListener('click', function () {
      const level = parseInt(this.getAttribute('data-level'));
      setFontSizeLevel(level);
    });
  });

  // Handle option button clicks - whole button is clickable
  optionButtons.forEach(button => {
    button.addEventListener('click', function () {
      const option = this.getAttribute('data-option');
      console.log("Option clicked:", option);
      toggleAccessibilityOption(option, this);
    });
  });

  // Handle reset button - ENHANCED WITH DEBUGGING
  resetBtn.addEventListener('click', function () {
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
  { level: 0, className: '' },
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

  switch (option) {
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
    script.onload = function () {
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

  const CACHE_KEY = "header-stock-data";
  const CACHE_TIME_KEY = "header-stock-data-time";
  const CACHE_TTL = 60 * 1000; // 60 seconds

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
  localStorage.setItem = function (key, value) {
    originalSetItem.apply(this, arguments);
    if (key === 'preferredLanguage') {
      updateLanguageIndicator(value);
    }
  };

  window.addEventListener('storage', function (e) {
    if (e.key === 'preferredLanguage') {
      updateLanguageIndicator(e.newValue);
    }
  });

  if (window.BhashiniTranslationUtility) {
    window.BhashiniTranslationUtility.onLanguageChange = function (lang) {
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