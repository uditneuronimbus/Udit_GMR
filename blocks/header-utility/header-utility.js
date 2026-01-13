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
          <path d="M21 17V12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12V17" stroke="#333333" stroke-width="1.5"/>
          <path d="M22 15.5V17.5" stroke="#333333" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M2 15.5V17.5" stroke="#333333" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M8 13.8446C8 13.0802 8 12.698 7.82526 12.4323C7.73733 12.2985 7.62061 12.188 7.4844 12.1095C7.21371 11.9535 6.84812 11.9896 6.11694 12.0617C4.88487 12.1831 4.26884 12.2439 3.82737 12.5764C3.60394 12.7448 3.41638 12.9593 3.27646 13.2067C3 13.6955 3 14.3395 3 15.6276V17.1933C3 18.4685 3 19.1061 3.28198 19.5986C3.38752 19.7829 3.51981 19.9491 3.67416 20.0913C4.08652 20.4714 4.68844 20.5901 5.89227 20.8275C6.73944 20.9945 7.16302 21.078 7.47564 20.9021C7.591 20.8372 7.69296 20.7493 7.77572 20.6434C8 20.3565 8 19.9078 8 19.0104V13.8446Z" stroke="#333333" stroke-width="1.5"/>
          <path d="M16 13.8446C16 13.0802 16 12.698 16.1747 12.4323C16.2627 12.2985 16.3794 12.188 16.5156 12.1095C16.7863 11.9535 17.1519 11.9896 17.8831 12.0617C19.1151 12.1831 19.7312 12.2439 20.1726 12.5764C20.3961 12.7448 20.5836 12.9593 20.7235 13.2067C21 13.6955 21 14.3395 21 15.6276V17.1933C21 18.4685 21 19.1061 20.718 19.5986C20.6125 19.7829 20.4802 19.9491 20.3258 20.0913C19.9135 20.4714 19.3116 20.5901 18.1077 20.8275C17.2606 20.9945 16.837 21.078 16.5244 20.9021C16.409 20.8372 16.307 20.7493 16.2243 20.6434C16 20.3565 16 19.9078 16 19.0104V13.8446Z" stroke="#333333" stroke-width="1.5"/>
        </svg>
        <svg class="icon-stop" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: none;">
          <rect x="8" y="8" width="8" height="8" stroke="#333333" stroke-width="1.5"/>
          <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#333333" stroke-width="1.5"/>
        </svg>
      </span>
    </button>
    <button class="icon-btn accessibility-btn" aria-label="Accessibility" type="button">
      <span class="icon-accessibility">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#333333" stroke-width="1.5"/>
          <path d="M14 7C14 8.10457 13.1046 9 12 9C10.8954 9 10 8.10457 10 7C10 5.89543 10.8954 5 12 5C13.1046 5 14 5.89543 14 7Z" stroke="#333333" stroke-width="1.5"/>
          <path d="M18 10C18 10 14.4627 11.5 12 11.5C9.53727 11.5 6 10 6 10" stroke="#333333" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M12 12V13.4522M12 13.4522C12 14.0275 12.1654 14.5906 12.4765 15.0745L15 19M12 13.4522C12 14.0275 11.8346 14.5906 11.5235 15.0745L9 19" stroke="#333333" stroke-width="1.5" stroke-linecap="round"/>
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

  /* ===============================
     6️⃣ INIT TEXT-TO-SPEECH - COMMENTED OUT
     =============================== */
  // if (document.readyState === 'loading') {
  //   document.addEventListener('DOMContentLoaded', () => {
  //     initTextToSpeech();
  //   });
  // } else {
  //   initTextToSpeech();
  // }

  console.log("Header Utility initialized");
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
    'pa': 'ਪੰਜਾਬੀ', 'bn': 'বাংলা', 'ur': 'اردو', 'as': 'অসমীয়া',
    'brx': 'बर', 'doi': 'डोगरी', 'gom': 'कोंकणी', 'ks': 'कॉशुर',
    'mai': 'मैथिली', 'mni': 'মৈতৈলোন্', 'ne': 'नेपाली', 'or': 'ଓଡ଼ିଆ',
    'sa': 'संस्कृतम्', 'sat': 'ᱥᱟᱱᱛᱟᱲᱤ', 'sd': 'سنڌي'
  };

  const displayName = langNames[langCode] || langCode.toUpperCase();
  const arrowSvg = '<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7"/></svg>';

  langGroup.innerHTML = `${displayName} <span class="arrow">${arrowSvg}</span>`;
}

/* ======================================================
   TEXT TO SPEECH - COMMENTED OUT
   ====================================================== */
// Global TTS variables
// let ttsSynthesis = null;
// let ttsUtterance = null;
// let ttsSpeaking = false;
// let voicesLoaded = false;

// const BHASHINI_LANG_MAP = {
//   'en': 'en-US', 'hi': 'hi-IN', 'ta': 'ta-IN', 'te': 'te-IN',
//   'kn': 'kn-IN', 'ml': 'ml-IN', 'mr': 'mr-IN', 'gu': 'gu-IN',
//   'pa': 'pa-IN', 'bn': 'bn-IN', 'ur': 'ur-IN', 'as': 'as-IN',
//   'brx': 'brx-IN', 'doi': 'doi-IN', 'gom': 'gom-IN', 'ks': 'ks-IN',
//   'mai': 'mai-IN', 'mni': 'mni-IN', 'ne': 'ne-NP', 'or': 'or-IN',
//   'sa': 'sa-IN', 'sat': 'sat-IN', 'sd': 'sd-IN'
// };

// function detectCurrentLanguage() {
//   const bhashiniLang = localStorage.getItem('preferredLanguage');
//   if (bhashiniLang && BHASHINI_LANG_MAP[bhashiniLang]) {
//     return BHASHINI_LANG_MAP[bhashiniLang];
//   }

//   const htmlLang = document.documentElement.lang;
//   if (htmlLang) {
//     const langCode = htmlLang.toLowerCase().split('-')[0];
//     if (BHASHINI_LANG_MAP[langCode]) {
//       return BHASHINI_LANG_MAP[langCode];
//     }
//   }

//   return 'en-US';
// }

// function getVoiceForLanguage(langCode) {
//   if (!ttsSynthesis || !voicesLoaded) return null;
//   const voices = ttsSynthesis.getVoices();
//   if (!voices || voices.length === 0) return null;

//   let voice = voices.find(v => v.lang === langCode);
//   if (!voice) {
//     const langFamily = langCode.split('-')[0];
//     voice = voices.find(v => v.lang.startsWith(langFamily));
//   }
//   if (!voice) voice = voices.find(v => v.default);
//   if (!voice && voices.length > 0) voice = voices[0];

//   return voice;
// }

// function toggleSpeechIcons(isSpeaking) {
//   const speechBtn = document.getElementById("speech-button");
//   if (!speechBtn) return;

//   const playIcon = speechBtn.querySelector('.icon-play');
//   const stopIcon = speechBtn.querySelector('.icon-stop');
//   if (!playIcon || !stopIcon) return;

//   if (isSpeaking) {
//     playIcon.style.display = 'none';
//     stopIcon.style.display = 'block';
//     speechBtn.setAttribute('aria-label', 'Stop Audio');
//   } else {
//     playIcon.style.display = 'block';
//     stopIcon.style.display = 'none';
//     speechBtn.setAttribute('aria-label', 'Play Audio');
//   }
// }

// function initTextToSpeech() {
//   if (!("speechSynthesis" in window)) {
//     const speechBtn = document.getElementById("speech-button");
//     if (speechBtn) {
//       speechBtn.disabled = true;
//       speechBtn.style.opacity = "0.5";
//     }
//     return;
//   }

//   ttsSynthesis = window.speechSynthesis;

//   function loadVoices() {
//     const voices = ttsSynthesis.getVoices();
//     if (voices.length > 0) {
//       voicesLoaded = true;
//     } else {
//       setTimeout(loadVoices, 100);
//     }
//   }

//   ttsSynthesis.onvoiceschanged = loadVoices;
//   loadVoices();

//   const speechBtn = document.getElementById("speech-button");
//   if (!speechBtn) {
//     const btnByClass = document.querySelector('.audio-btn');
//     if (btnByClass) btnByClass.id = "speech-button";
//     else return;
//   }

//   toggleSpeechIcons(false);

//   document.getElementById("speech-button").addEventListener("click", function(e) {
//     e.preventDefault();
//     e.stopPropagation();

//     if (ttsSpeaking) {
//       stopTTS();
//     } else {
//       startTTS();
//     }
//   });

//   document.addEventListener("visibilitychange", function() {
//     if (document.hidden && ttsSpeaking) stopTTS();
//   });

//   window.addEventListener("beforeunload", function() {
//     if (ttsSpeaking) stopTTS();
//   });
// }

// function startTTS() {
//   if (!ttsSynthesis) return;
//   if (ttsSpeaking) {
//     stopTTS();
//     setTimeout(startTTS, 100);
//     return;
//   }

//   const text = collectPageText();
//   if (!text || text.trim().length === 0) {
//     alert("No text content found on this page to read aloud.");
//     return;
//   }

//   ttsUtterance = new SpeechSynthesisUtterance(text);
//   const currentLang = detectCurrentLanguage();
//   ttsUtterance.lang = currentLang;

//   const voice = getVoiceForLanguage(currentLang);
//   if (voice) ttsUtterance.voice = voice;

//   ttsUtterance.rate = 0.9;

//   ttsUtterance.onstart = function() {
//     ttsSpeaking = true;
//     toggleSpeechIcons(true);
//     document.getElementById("speech-button")?.classList.add("speech-active");
//   };

//   ttsUtterance.onend = function() {
//     resetTTS();
//   };

//   ttsUtterance.onerror = function(event) {
//     resetTTS();
//   };

//   ttsSynthesis.speak(ttsUtterance);
// }

// function stopTTS() {
//   if (!ttsSynthesis || !ttsSpeaking) return;
//   ttsSynthesis.cancel();
//   resetTTS();
// }

// function resetTTS() {
//   ttsSpeaking = false;
//   const speechBtn = document.getElementById("speech-button");
//   if (speechBtn) {
//     speechBtn.classList.remove("speech-active");
//     toggleSpeechIcons(false);
//   }
// }

// function collectPageText() {
//   const mainContent = document.querySelector("main") ||
//     document.querySelector("article") ||
//     document.querySelector(".content") ||
//     document.querySelector("body");

//   if (!mainContent) return "";

//   const elements = mainContent.querySelectorAll(
//     "h1, h2, h3, h4, h5, h6, p, li, figcaption, blockquote, .text-content, .article-content"
//   );

//   let text = "";
//   elements.forEach((el) => {
//     if (el.offsetParent !== null && el.textContent && el.textContent.trim().length > 0) {
//       const className = el.className.toLowerCase();
//       const parentClasses = el.parentElement?.className?.toLowerCase() || '';

//       if (!className.includes('nav') &&
//         !className.includes('menu') &&
//         !className.includes('footer') &&
//         !parentClasses.includes('nav') &&
//         !parentClasses.includes('menu') &&
//         !parentClasses.includes('footer')) {
//         const elementText = el.textContent.trim();
//         if (elementText.length > 10 && !elementText.includes('©')) {
//           text += elementText + ". ";
//         }
//       }
//     }
//   });

//   return text.trim();
// }