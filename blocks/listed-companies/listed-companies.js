// listed-companies.js
// Combined version – WORKING + FIXED + localStorage CACHED (60s)

const STOCK_API_URL = 'https://gmr.itsneobot.com:4000/api/share/get-latest-share-price';
const AUTH_TOKEN =
  'U2FsdGVkX1+IAunex0zJueoZQpRBfpUm/DSQSMufK69HpTEh4abfdnhz0fQ+jbSmPrqojCZOhYZ6/mvA28aQxw';

// ────────────────────────────────────────────────
// Cache Configuration
// ────────────────────────────────────────────────
const CACHE_KEY = 'listed-companies-stock-data';
const CACHE_TIME_KEY = 'listed-companies-stock-data-time';
const CACHE_TTL = 60 * 1000; // 60 seconds

// ────────────────────────────────────────────────
// Utility: Fetch stock data with localStorage cache
// ────────────────────────────────────────────────
async function fetchStockPrices() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

    if (cached && cachedTime) {
      const age = Date.now() - Number(cachedTime);
      if (age < CACHE_TTL) {
        console.log('[Stock Cache] Using cached data');
        return JSON.parse(cached);
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

    const response = await fetch(STOCK_API_URL, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        Authorization: AUTH_TOKEN,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const json = await response.json();
    if (!json.success || !Array.isArray(json.data)) {
      throw new Error('Invalid response format');
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(json.data));
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());

    return json.data;
  } catch (err) {
    console.error('[Stock API] Fetch failed:', err);

    const fallback = localStorage.getItem(CACHE_KEY);
    if (fallback) {
      console.warn('[Stock Cache] Using stale cached data');
      return JSON.parse(fallback);
    }

    throw err;
  }
}

// ────────────────────────────────────────────────
// Format stock card HTML
// ────────────────────────────────────────────────
function renderStockOverview(companyData, displayName) {
  if (!companyData || !companyData.exchanges?.length) {
    return `<div class="error">No market data available for ${displayName}</div>`;
  }

  let displayTime = 'Latest';
  if (companyData.fetchedAt) {
    try {
      const dt = new Date(companyData.fetchedAt);
      displayTime = dt.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {}
  }

  let html = `
    <div class="d-flex align-items-center">
      <div class="market-title">${displayName} - MARKET OVERVIEW</div>
      <div class="as-on">As on ${displayTime}</div>
    </div>
    <div class="exchanges">
  `;

  companyData.exchanges.slice(0, 2).forEach((ex) => {
    const isNegative = ex.change < 0;
    const arrow = isNegative ? '↓' : '↑';

    html += `
      <div class="exchange-row">
        <div class="exchange">${ex.exchange}</div>
        <div class="exchange_price">
          <div class="price">
            <span class="arrow ${isNegative ? 'negative' : 'positive'}">${arrow}</span>
            ₹${ex.lastTradedPrice.toFixed(2)}
          </div>
          <div class="change ${isNegative ? 'negative' : 'positive'}">
            ${Math.abs(ex.change).toFixed(2)} (${Math.abs(ex.changePercent).toFixed(2)}%)
          </div>
        </div>
      </div>
    `;
  });

  const mainVolume =
    companyData.exchanges[0]?.volume?.toLocaleString('en-IN') || '—';

  html += `
    </div>
    <div class="volume">Volume ${mainVolume}</div>
  `;

  return html;
}

// ────────────────────────────────────────────────
// Main decorate function
// ────────────────────────────────────────────────
export default async function decorate(block) {
  const children = [...block.children];

  /* ===============================
     HEADER
  =============================== */

  const header = document.createElement('header');
  header.className = 'd-md-flex align-items-center gap-3';

  const entryContainer = document.createElement('div');
  entryContainer.className = 'entry-container fullCont mb-5';

  if (children[0]) {
    const h2 = document.createElement('h2');
    while (children[0].firstChild) {
      h2.appendChild(children[0].firstChild);
    }
    entryContainer.appendChild(h2);
  }

  if (children[1]) entryContainer.appendChild(children[1]);
  header.appendChild(entryContainer);

  if (children[2] && children[3]) {
    const btn = document.createElement('a');
    btn.href = children[3].textContent.trim() || '#';
    btn.className = 'btn btn-orange';
    btn.textContent = children[2].textContent.trim();
    header.appendChild(btn);
  }

  /* ===============================
     COMPANIES GRID
  =============================== */

  const companiesCol = document.createElement('div');
  companiesCol.className = 'companiesCol';

  const row = document.createElement('div');
  row.className = 'row';

  const stockDivsMap = new Map();

  for (let i = 4; i < children.length; i++) {
    const companyItem = children[i];
    if (!companyItem || companyItem.children.length < 3) continue;

    companyItem.classList.add('listed-company-item');

    const col = document.createElement('div');
    col.className = 'col-lg-6 mt-4';

    const companiesGrid = document.createElement('div');
    companiesGrid.className = 'companiesGrid';

    const h3 = document.createElement('h3');
    const p = companyItem.children[0].querySelector('p');
    h3.textContent = p
      ? p.textContent.trim()
      : companyItem.children[0].textContent.trim();
    companyItem.replaceChild(h3, companyItem.children[0]);

    const symbol = companyItem.children[2]?.textContent.trim();

    [...companyItem.children].forEach((child, index) => {
      if (index > 1) child.style.display = 'none';
    });

    const companiesStock = document.createElement('div');
    companiesStock.className = 'companiesStock';
    companiesStock.innerHTML =
      '<div class="loading">Loading market data...</div>';

    if (symbol) stockDivsMap.set(symbol, companiesStock);

    const btnContainer = document.createElement('div');
    btnContainer.className = 'companies-links mt-5 mb-4';

    if (companyItem.children[3] && companyItem.children[4]) {
      const a = document.createElement('a');
      a.href = companyItem.children[4].textContent.trim() || '#';
      a.className = 'btn btn-circle';
      a.textContent = companyItem.children[3].textContent.trim();
      btnContainer.appendChild(a);
    }

    if (companyItem.children[5] && companyItem.children[6]) {
      const a = document.createElement('a');
      a.href = companyItem.children[6].textContent.trim() || '#';
      a.className = 'btn btn-circle';
      a.textContent = companyItem.children[5].textContent.trim();
      btnContainer.appendChild(a);
    }

    companiesGrid.appendChild(companyItem);
    companiesGrid.appendChild(btnContainer);
    col.appendChild(companiesGrid);
    col.appendChild(companiesStock);
    row.appendChild(col);
  }

  companiesCol.appendChild(row);
  block.replaceChildren(header, companiesCol);

  /* ===============================
     API CALL – CACHED + BY CODE
  =============================== */

  if (stockDivsMap.size === 0) return;

  // Defer execution to avoid blocking rendering
  setTimeout(async () => {
    try {
      const rawData = await fetchStockPrices();

      const apiDataByCode = {};
      rawData.forEach((item) => {
        if (item.companyCode) {
          apiDataByCode[String(item.companyCode)] = item;
        }
      });

      const symbolToCompanyCode = {
        GAL: '15210029',
        GPUIL: '15131133',
      };

      for (const [symbol, stockDiv] of stockDivsMap.entries()) {
        const code = symbolToCompanyCode[symbol];
        const companyData = code ? apiDataByCode[code] : null;

        stockDiv.innerHTML = companyData
          ? renderStockOverview(companyData, symbol)
          : `<div class="error">No data found for ${symbol}</div>`;
      }
    } catch (err) {
      console.error('[Stock API] Failed to load data:', err);
      for (const stockDiv of stockDivsMap.values()) {
        stockDiv.innerHTML =
          '<div class="error">Market data unavailable</div>';
      }
    }
  }, 0);
}
