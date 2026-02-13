import algoliasearch from "https://cdn.jsdelivr.net/npm/algoliasearch@4/dist/algoliasearch-lite.esm.browser.js";

const { ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY, ALGOLIA_INDEX } = window.APP_CONFIG;

// ⚠️ Force stable hosts (fixes unreachable-host errors on corp networks)
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY, {
  hosts: [
    { url: `${ALGOLIA_APP_ID}-dsn.algolia.net`, accept: true },
    { url: `${ALGOLIA_APP_ID}-1.algolianet.com`, accept: true },
    { url: `${ALGOLIA_APP_ID}-2.algolianet.com`, accept: true }
  ]
});

const index = client.initIndex(ALGOLIA_INDEX);

function getBasePath() {
  const parts = window.location.pathname
    .split("/")
    .filter(Boolean);

  if (parts.length >= 2) {
    return `/${parts[0]}/${parts[1]}`;
  }

  return `/${parts[0] || ""}`;
}

function getQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("q") || "";
}

export default async function decorate(block) {
  const query = getQuery();

  block.innerHTML = `
    <!-- Search Bar Section -->
    <div class="search-results-header">
      <div class="search-results-search-box">
        <div class="search-box-inline" role="combobox" aria-expanded="false">
          <input
            type="text"
            class="form-control search-input-results"
            placeholder="Search..."
            value="${query}"
          />
          <!-- 🔄 Loader -->
          <div class="search-loader" hidden>
            <span class="spinner"></span>
            <span class="loader-text">Searching...</span>
          </div>

          <div
            class="search-results-dropdown"
            id="search-results-dropdown"
            role="listbox"
          ></div>
        </div>
      </div>
      <h2>Search results for "${query}"</h2>
    </div>
    <!-- Results Section -->
    
    <div class="search-results-list"></div>
  `;

  const input = block.querySelector(".search-input-results");
  const resultsDropdown = block.querySelector(".search-results-dropdown");
  const loaderEl = block.querySelector(".search-loader");
  const resultsList = block.querySelector(".search-results-list");

  let dropdownResults = [];
  let activeIndex = -1;
  let debounceTimer;

  /* ---------- Helpers ---------- */
  function clearDropdown() {
    resultsDropdown.innerHTML = "";
    dropdownResults = [];
    activeIndex = -1;
    input.setAttribute("aria-activedescendant", "");
  }

  function clearAll() {
    clearDropdown();
    block.querySelector(".search-box-inline").setAttribute("aria-expanded", "false");
  }

  function showLoader() {
    loaderEl.hidden = false;
  }

  function hideLoader() {
    loaderEl.hidden = true;
  }

  function updateActiveResult() {
    dropdownResults.forEach((el, i) => {
      el.classList.toggle("active", i === activeIndex);
    });

    if (dropdownResults[activeIndex]) {
      input.setAttribute("aria-activedescendant", dropdownResults[activeIndex].id);
      dropdownResults[activeIndex].scrollIntoView({ block: "nearest" });
    }
  }

  function highlight(text, query) {
    if (!text) return "";
    return text.replace(
      new RegExp(`(${query})`, "ig"),
      "<mark>$1</mark>"
    );
  }

  function renderDropdown(hits, query) {
    resultsDropdown.innerHTML = "";

    hits.slice(0, 10).forEach((item, i) => {
      const a = document.createElement("a");
      const parts = window.location.pathname.split("/").filter(Boolean);
      const lang = parts[0] || "en";

      a.href = item.path || `/${lang}/`;
      a.id = `search-dropdown-option-${i}`;
      a.role = "option";

      const title = item.title || item.metaTitle || "Untitled";
      const snippet =
        item._snippetResult?.content?.value ||
        item._snippetResult?.description?.value ||
        item.description ||
        "";

      const tags = Array.isArray(item.tags)
        ? item.tags.join(", ")
        : item.tags;

      a.innerHTML = `
        <div class="search-result">
          <strong>${highlight(title, query)}</strong>
          ${snippet ? `<p class="search-snippet">${snippet}</p>` : ""}
          ${tags ? `<small>${tags}</small>` : ""}
        </div>
      `;

      resultsDropdown.appendChild(a);
    });

    dropdownResults = Array.from(resultsDropdown.querySelectorAll("a"));
    activeIndex = -1;

    block.querySelector(".search-box-inline").setAttribute("aria-expanded", "true");
  }

  /* ---------- Dropdown Search ---------- */
  async function runDropdownSearch() {
    const q = input.value.trim();
    clearDropdown();

    if (q.length < 2) return;
    showLoader();

    try {
      const parts = window.location.pathname.split("/").filter(Boolean);
      const lang = parts[0] || "en";
      const { hits } = await index.search(q, {
        hitsPerPage: 10,
        attributesToRetrieve: [
          "title",
          "metaTitle",
          "description",
          "metaDescription",
          "content",
          "tags",
          "path"
        ],
        attributesToSnippet: [
          "content:35",
          "description:25"
        ],
        snippetEllipsisText: "..."
      });

      if (hits.length) {
        renderDropdown(hits, q);
      }
    } catch (e) {
      console.error("Algolia dropdown search failed", e);
    } finally {
      hideLoader();
    }
  }

  /* ---------- Events for Search Input ---------- */
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runDropdownSearch, 250);
  });

  input.addEventListener("keydown", (e) => {
    if (!dropdownResults.length && e.key !== "Enter" && e.key !== "Escape") return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        activeIndex = activeIndex < dropdownResults.length - 1 ? activeIndex + 1 : 0;
        updateActiveResult();
        break;

      case "ArrowUp":
        e.preventDefault();
        activeIndex = activeIndex > 0 ? activeIndex - 1 : dropdownResults.length - 1;
        updateActiveResult();
        break;

      case "Enter":
        e.preventDefault();
        const query = input.value.trim();
        if (!query) return;
        const parts = window.location.pathname.split("/").filter(Boolean);
        const lang = parts[0] || "en";
        window.location.href = `/${lang}/search?q=${encodeURIComponent(query)}`;
        break;

      case "Escape":
        clearAll();
        input.blur();
        break;
    }
  });

  document.addEventListener("mousedown", (e) => {
    const searchBox = block.querySelector(".search-box-inline");
    const clickedInsideSearch = searchBox && searchBox.contains(e.target);

    if (!clickedInsideSearch) {
      clearDropdown();
    }
  });

  /* ---------- Load Main Search Results ---------- */
  if (!query) return;

  try {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const lang = parts[0] || "en";
    const { hits } = await index.search(query, {
      hitsPerPage: 20,
      attributesToSnippet: ["content:40"],
      snippetEllipsisText: "..."
    });

    if (!hits.length) {
      list.innerHTML = `
        <section class="no-results-section">
          <div class="no-results">
        
            <div class="no-results-icon">
              <img src="../../icons/logo.svg" alt="No results icon" />
            </div>
        
            <h2 class="no-results-title">
              Your Search did not Return Any Results.
            </h2>
        
            <p class="no-results-subtext">
              Please check the spelling or try broader terms.
            </p>
        
            <p class="no-results-browse">
              You can also browse key sections below.
            </p>
        
            <div class="no-results-divider"></div>
        
            <div class="no-results-links">
              <a href="#">INVESTOR RELATIONS</a>
              <a href="#">SUSTAINABILITY</a>
              <a href="#">CAREERS</a>
            </div>
        
            <div class="no-results-divider"></div>
        
          </div>
        </section>`
      return;
    }

    hits.forEach((item) => {
      const el = document.createElement("div");
      el.className = "search-result-item";

      const snippet =
        item._snippetResult?.content?.value ||
        item.description ||
        "";
      const safeHref = item.path ? item.path : `/${lang}/`;
      
      el.innerHTML = `
        <a href="${safeHref}">
          <h3>${item.title || item.metaTitle}</h3>
          <p>${snippet}</p>
        </a>
      `;

      resultsList.appendChild(el);
    });

  } catch (e) {
    console.error("Search page failed", e);
    block.innerHTML += `
        <section class="no-results-section">
          <div class="no-results">
        
            <div class="no-results-icon">
              <img src="../../icons/logo.svg" alt="No results icon" />
            </div>
        
            <h2 class="no-results-title">
              Your Search did not Return Any Results.
            </h2>
        
            <p class="no-results-subtext">
              Please check the spelling or try broader terms.
            </p>
        
            <p class="no-results-browse">
              You can also browse key sections below.
            </p>
        
            <div class="no-results-divider"></div>
        
            <div class="no-results-links">
              <a href="#">INVESTOR RELATIONS</a>
              <a href="#">SUSTAINABILITY</a>
              <a href="#">CAREERS</a>
            </div>
        
            <div class="no-results-divider"></div>
        
          </div>
        </section>`;
  }
}