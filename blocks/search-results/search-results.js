import algoliasearch from "https://cdn.jsdelivr.net/npm/algoliasearch@4/dist/algoliasearch-lite.esm.browser.js";

const { ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY, ALGOLIA_INDEX } = window.APP_CONFIG;

/* ---------- Algolia Client ---------- */
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY, {
  hosts: [
    { url: `${ALGOLIA_APP_ID}-dsn.algolia.net`, accept: true },
    { url: `${ALGOLIA_APP_ID}-1.algolianet.com`, accept: true },
    { url: `${ALGOLIA_APP_ID}-2.algolianet.com`, accept: true },
  ],
});

const index = client.initIndex(ALGOLIA_INDEX);

/* ---------- Helpers ---------- */
function getQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("q") || "";
}

function highlight(text, query) {
  if (!text) return "";
  return text.replace(new RegExp(`(${query})`, "ig"), "<mark>$1</mark>");
}

/* ---------- No Results Template ---------- */
function renderNoResults(container, query) {
  container.innerHTML = `
    <section class="no-results-section">
      <div class="no-results">

        <p class="no-results-query">
          Search results for "<strong>${query}</strong>"
        </p>

        <div class="no-results-icon">
          <img src="../icons/search-no-result.svg" alt="No results" />
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
          <a href="/en/investors">INVESTOR RELATIONS</a>
          <a href="/en/sustainability">SUSTAINABILITY</a>
          <a href="/en/careers">CAREERS</a>
        </div>

        <div class="no-results-divider"></div>

      </div>
    </section>
  `;
}

/* ---------- Main Decorate ---------- */
export default async function decorate(block) {
  const query = getQuery();

  block.innerHTML = `
    <div class="search-results-header">
     ${query ? `<h2 class="mb-4" id="search-results-heading">Search results for "${query}"</h2>` : ""}
      <div class="search-results-search-box">
        <div class="search-box-inline" role="combobox" aria-expanded="false">
          <input
            type="text"
            class="form-control search-input-results"
            placeholder="Search..."
            value="${query}"
          />

          <div class="search-loader" hidden>
            <span class="spinner"></span>
            <span class="loader-text">Searching...</span>
          </div>

        </div>
      </div>

       
    </div>

    <section class="sec-search py-4">
      <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-10">
              <div class="search-results-list"></div>
            </div>
        </div>
      </div>
    </section>
  `;

  const input = block.querySelector(".search-input-results");
  const dropdown = block.querySelector(".search-results-dropdown");
  const loader = block.querySelector(".search-loader");
  const resultsList = block.querySelector(".search-results-list");
  const searchBox = block.querySelector(".search-box-inline");

  let dropdownResults = [];
  let activeIndex = -1;
  let debounceTimer;

  /* ---------- UI Helpers ---------- */
  function clearDropdown() {
    dropdown.innerHTML = "";
    dropdownResults = [];
    activeIndex = -1;
    searchBox.setAttribute("aria-expanded", "false");
  }

  function showLoader() {
    loader.hidden = false;
  }

  function hideLoader() {
    loader.hidden = true;
  }

  function updateActiveResult() {
    dropdownResults.forEach((el, i) => {
      el.classList.toggle("active", i === activeIndex);
    });

    if (dropdownResults[activeIndex]) {
      dropdownResults[activeIndex].scrollIntoView({ block: "nearest" });
    }
  }

  /* ---------- Render Dropdown ---------- */
  function renderDropdown(hits, query) {
    dropdown.innerHTML = "";

    hits.slice(0, 10).forEach((item, i) => {
      const a = document.createElement("a");
      const lang =
        window.location.pathname.split("/").filter(Boolean)[0] || "en";

      a.href = item.path || `/${lang}/`;
      a.role = "option";
      a.id = `search-option-${i}`;

      const title = item.title || item.metaTitle || "Untitled";
      const snippet =
        item._snippetResult?.content?.value ||
        item._snippetResult?.description?.value ||
        item.description ||
        "";

      a.innerHTML = `
        <div class="search-result">
          <strong>${highlight(title, query)}</strong>
          ${snippet ? `<p class="search-snippet">${snippet}</p>` : ""}
        </div>
      `;

      dropdown.appendChild(a);
    });

    dropdownResults = [...dropdown.querySelectorAll("a")];
    searchBox.setAttribute("aria-expanded", "true");
  }

  /* ---------- Dropdown Search ---------- */
  async function runDropdownSearch() {
    const q = input.value.trim();
    clearDropdown();

    if (q.length < 2) return;

    showLoader();

    try {
      const parts = window.location.pathname.split("/").filter(Boolean);
      const region = parts[0] || "en";
      const { hits } = await index.search(q, {
        filters: `region:${region}`,
        hitsPerPage: 10,
        attributesToSnippet: ["content:35", "description:25"],
        snippetEllipsisText: "...",
      });

      if (hits.length) renderDropdown(hits, q);
    } catch (e) {
      console.error("Dropdown search failed", e);
    } finally {
      hideLoader();
    }
  }

  /* ---------- Input Events ---------- */
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runDropdownSearch, 250);
  });

  input.addEventListener("keydown", (e) => {
    if (!dropdownResults.length && e.key !== "Enter") return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        activeIndex = (activeIndex + 1) % dropdownResults.length;
        updateActiveResult();
        break;

      case "ArrowUp":
        e.preventDefault();
        activeIndex =
          activeIndex <= 0 ? dropdownResults.length - 1 : activeIndex - 1;
        updateActiveResult();
        break;

      case "Enter":
        e.preventDefault();
        const q = input.value.trim();
        if (!q) return;
        const lang =
          window.location.pathname.split("/").filter(Boolean)[0] || "en";
        window.location.href = `/${lang}/search?q=${encodeURIComponent(q)}`;
        break;

      case "Escape":
        clearDropdown();
        input.blur();
        break;
    }
  });

  document.addEventListener("mousedown", (e) => {
    if (!searchBox.contains(e.target)) clearDropdown();
  });

  /* ---------- Load Main Search Results ---------- */
  if (!query) return;

  try {
    const lang = window.location.pathname.split("/").filter(Boolean)[0] || "en";

    const { hits } = await index.search(query, {
      filters: `region:${lang}`,
      hitsPerPage: 20,
      attributesToSnippet: ["content:40"],
      snippetEllipsisText: "...",
    });

    if (!hits.length) {
      const heading = block.querySelector("#search-results-heading");
      if (heading) heading.hidden = true;
      renderNoResults(resultsList, query);
      return;
    }

    resultsList.innerHTML = "";

    hits.forEach((item) => {
      const el = document.createElement("div");
      el.className = "search-result-item";

      const snippet =
        item._snippetResult?.content?.value || item.description || "";

      const safeHref = item.path || `/${lang}/`;

      el.innerHTML = `
        <a href="${safeHref}">
          <h3>${item.title || item.metaTitle || "Untitled"}</h3>
          ${snippet ? `<p>${snippet}</p>` : ""}
        </a>
      `;

      resultsList.appendChild(el);
    });
  } catch (e) {
    console.error("Search page failed", e);
    renderNoResults(resultsList, query);
  }
}
