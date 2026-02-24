const STOCK_API_URL =
  "https://gmr.itsneobot.com:4000/api/share/get-latest-share-price";

const AUTH_TOKEN =
  "U2FsdGVkX1+IAunex0zJueoZQpRBfpUm/DSQSMufK69HpTEh4abfdnhz0fQ+jbSmPrqojCZOhYZ6/mvA28aQxw";

const CACHE_KEY = "gal-gpuil-stock-cache";
const CACHE_TIME_KEY = "gal-gpuil-stock-cache-time";
const CACHE_TTL = 60000;

/* ===============================
   FETCH STOCK WITH CACHE
=============================== */

async function fetchStockData() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

    if (cached && cachedTime) {
      const age = Date.now() - Number(cachedTime);
      if (age < CACHE_TTL) {
        return JSON.parse(cached);
      }
    }

    const res = await fetch(STOCK_API_URL, {
      method: "GET",
      headers: {
        Authorization: AUTH_TOKEN,
        Accept: "application/json",
      },
    });

    if (!res.ok) throw new Error("API failed");

    const json = await res.json();

    if (json.success && Array.isArray(json.data)) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(json.data));
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      return json.data;
    }

    return [];
  } catch (e) {
    console.error("Stock API error:", e);
    const fallback = localStorage.getItem(CACHE_KEY);
    return fallback ? JSON.parse(fallback) : [];
  }
}

/* ===============================
   FULL MARKET OVERVIEW (UPDATED)
=============================== */

function renderMarketHTML(companyData, displayName) {
  if (!companyData || !companyData.exchanges?.length) {
    return `<div class="stock-error">Market data unavailable</div>`;
  }

  let displayTime = "Latest";
  if (companyData.fetchedAt) {
    try {
      const dt = new Date(companyData.fetchedAt);
      displayTime = dt.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {}
  }

  let html = `
    <div class="market-title">${displayName} - MARKET OVERVIEW</div>
    <div class="as-on">As on ${displayTime}</div>
    <div class="exchanges">
  `;

  companyData.exchanges.slice(0, 2).forEach((ex) => {
    const isNegative = ex.change < 0;
    const arrow = isNegative ? "↓" : "↑";

    html += `
      <div class="exchange-row">
        <div class="exchange">${ex.exchange}</div>
        <div class="exchange_price">
          <div class="price">
            <span class="${isNegative ? "negative" : "positive"}">
              ${arrow} ₹${ex.lastTradedPrice.toFixed(2)}
            </span>
          </div>
          <div class="change ${isNegative ? "negative" : "positive"}">
            ${Math.abs(ex.change).toFixed(2)} 
            (${Math.abs(ex.changePercent).toFixed(2)}%)
          </div>
        </div>
      </div>
    `;
  });

  const mainVolume =
    companyData.exchanges[0]?.volume?.toLocaleString("en-IN") || "—";

  html += `
    </div>
    <div class="volume">Volume ${mainVolume}</div>
  `;

  return html;
}

/* ===============================
   DECORATE
=============================== */

export default async function decorate(block) {
  const isAuthorMode =
    document.body.classList.contains("aem-AuthorLayer-Edit") ||
    window.location.search.includes("wcmmode=edit");

  if (isAuthorMode) return;

  const rows = [...block.children];
  if (!rows.length) return;

  const topTitle = rows[0]?.textContent?.trim();
  const topDescription = rows[1]?.innerHTML?.trim();
  const primaryText = rows[2]?.textContent?.trim();
  const secondaryText = rows[4]?.textContent?.trim();

  block.innerHTML = `
    <div class="gal-investor-wrapper">

      <div class="investors-trust-wrapper">
        ${topTitle ? `<h2 class="investors-title">${topTitle}</h2>` : ""}
        ${topDescription ? `<div class="investors-desc">${topDescription}</div>` : ""}

        <div class="investors-cta">
          ${primaryText ? `<button class="cta primary active">${primaryText}</button>` : ""}
          ${secondaryText ? `<button class="cta secondary">${secondaryText}</button>` : ""}
        </div>
      </div>

      <div class="company-content primary-content">
        <div class="gal-content">
          <div class="gal-main">
            <div class="gal-left">
              <h3>GMR Airports Limited (GAL)</h3>
              <div class="gal-desc">
                <p>
                  As Asia's largest private airport operator, the company develops,
                  operates, and manages airports and is a pioneer of integrated
                  aerotropolis developments that unlock airport value chains
                  beyond traditional revenue.
                </p>
              </div>

              <div class="gal-market">
                <div class="market-symbol">Loading market data...</div>
              </div>

              <a class="gal-cta" href="#">Visit Website</a>
            </div>

            <div class="gal-right">
              <div class="gal-stat-card"><div class="stat-text"><p><strong>#1 in Asia</strong></p><p>Largest private airport operator</p></div></div>
              <div class="gal-stat-card"><div class="stat-text"><p><strong>120+ million</strong></p><p>Passengers served FY25</p></div></div>
              <div class="gal-stat-card"><div class="stat-text"><p><strong>₹10,414 crore</strong></p><p>FY25 airport revenue</p></div></div>
              <div class="gal-stat-card"><div class="stat-text"><p><strong>12% Year-on-year</strong></p><p>Passenger growth</p></div></div>
              <div class="gal-stat-card"><div class="stat-text"><p><strong>22.5% Growth</strong></p><p>in EBITDA to ₹4,188 crore</p></div></div>
              <div class="gal-stat-card"><div class="stat-text"><p><strong>9 World-class</strong></p><p>Airport assets</p></div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="company-content secondary-content" style="display:none;">
        <div class="gal-content">
          <div class="gal-main">
            <div class="gal-left">
              <h3>GMR Power and Urban Infra Limited (GPUIL)</h3>
              <div class="gal-desc">
                <p>
                  GPUIL is a leader in energy, urban infrastructure, and transportation sectors.
                </p>
              </div>

              <div class="gal-market">
                <div class="market-symbol">Click to load market data</div>
              </div>

              <a class="gal-cta" href="#">Visit Website</a>
            </div>

            <div class="gal-right">
              <div class="gal-stat-card"><div class="stat-text"><p><strong>₹6,344 crore</strong></p><p>FY25 total revenue</p></div></div>
              <div class="gal-stat-card"><div class="stat-text"><p><strong>₹2,181 crore</strong></p><p>EBITDA for FY25</p></div></div>
              <div class="gal-stat-card"><div class="stat-text"><p><strong>2,840 MW</strong></p><p>Installed power capacity</p></div></div>
              <div class="gal-stat-card"><div class="stat-text"><p><strong>1,775 MW</strong></p><p>Power projects under development</p></div></div>
              <div class="gal-stat-card"><div class="stat-text"><p><strong>2,400+ lane-km</strong></p><p>Highways operated across India</p></div></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;

  const primaryBtn = block.querySelector(".cta.primary");
  const secondaryBtn = block.querySelector(".cta.secondary");
  const primaryContent = block.querySelector(".primary-content");
  const secondaryContent = block.querySelector(".secondary-content");

  const galContainer = primaryContent.querySelector(".market-symbol");
  const gpuilContainer = secondaryContent.querySelector(".market-symbol");

  const codeMap = {
    GAL: "15210029",
    GPUIL: "15131133",
  };

  let apiData = null;

  async function loadStock(symbol, container) {
    if (!container) return;

    container.innerHTML = "Loading market data...";

    if (!apiData) {
      apiData = await fetchStockData();
    }

    const apiByCode = {};
    apiData.forEach((item) => {
      if (item.companyCode) {
        apiByCode[String(item.companyCode)] = item;
      }
    });

    const companyData = apiByCode[codeMap[symbol]];
    container.innerHTML = renderMarketHTML(companyData, symbol);
  }

  primaryBtn?.addEventListener("click", async () => {
    primaryBtn.classList.add("active");
    secondaryBtn.classList.remove("active");
    primaryContent.style.display = "block";
    secondaryContent.style.display = "none";
    await loadStock("GAL", galContainer);
  });

  secondaryBtn?.addEventListener("click", async () => {
    secondaryBtn.classList.add("active");
    primaryBtn.classList.remove("active");
    primaryContent.style.display = "none";
    secondaryContent.style.display = "block";
    await loadStock("GPUIL", gpuilContainer);
  });

  await loadStock("GAL", galContainer);
}