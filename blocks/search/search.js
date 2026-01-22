import algoliasearch from "https://cdn.jsdelivr.net/npm/algoliasearch@4/dist/algoliasearch-lite.esm.browser.js";

// Algolia config (FRONTEND SAFE)
const ALGOLIA_APP_ID = "BARVAFD3OC";
const ALGOLIA_SEARCH_KEY = "e3ba8576fac702f5c6826b7b24cf221c";
const ALGOLIA_INDEX = "site_pages";

// ⚠️ Force stable hosts (fixes unreachable-host errors on corp networks)
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY, {
  hosts: [
    { url: `${ALGOLIA_APP_ID}-dsn.algolia.net`, accept: true },
    { url: `${ALGOLIA_APP_ID}-1.algolianet.com`, accept: true },
    { url: `${ALGOLIA_APP_ID}-2.algolianet.com`, accept: true }
  ]
});

const algoliaIndex = client.initIndex(ALGOLIA_INDEX);

// function getBasePath() {
//   const parts = window.location.pathname
//     .split("/")
//     .filter(Boolean);

//   if (parts.length >= 2) {
//     return `/${parts[0]}/${parts[1]}`;
//   }

//   return `/${parts[0] || ""}`;
// }


export default function decorate(block) {
  /* ---------- UI Markup (UNCHANGED) ---------- */
  block.innerHTML = `
    <button class="btn-search" type="button" data-bs-toggle="collapse" data-bs-target="#collapseSearch" aria-expanded="false" aria-controls="collapseSearch">
      Search
    </button>
    <div class="collapse" id="collapseSearch">
      <div class="search-box" role="combobox" aria-expanded="false">
        <input
          type="text"
          class="form-control"
          placeholder="Search..."
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-activedescendant=""
        />
        <div
          class="search-results"
          id="search-results"
          role="listbox"
        ></div>
      </div>
    </div>
  `;

  const input = block.querySelector("input");
  const resultsEl = block.querySelector(".search-results");

  let results = [];
  let activeIndex = -1;
  let debounceTimer;

  /* ---------- Helpers ---------- */
  function clearResults() {
    resultsEl.innerHTML = "";
    results = [];
    activeIndex = -1;
    input.setAttribute("aria-activedescendant", "");
    block.querySelector(".search-box").setAttribute("aria-expanded", "false");
  }

  function updateActiveResult() {
    results.forEach((el, i) => {
      el.classList.toggle("active", i === activeIndex);
    });

    if (results[activeIndex]) {
      input.setAttribute("aria-activedescendant", results[activeIndex].id);
      results[activeIndex].scrollIntoView({ block: "nearest" });
    }
  }

  function highlight(text, query) {
    if (!text) return "";
    return text.replace(
      new RegExp(`(${query})`, "ig"),
      "<mark>$1</mark>"
    );
  }

  function renderResults(hits, query) {
    resultsEl.innerHTML = "";

    hits.slice(0, 10).forEach((item, i) => {
      const a = document.createElement("a");
      a.href = item.path;
      a.id = `search-option-${i}`;
      a.role = "option";

      // ✅ Enhanced field usage
      const title =
        item.title ||
        item.metaTitle ||
        "Untitled";

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

      resultsEl.appendChild(a);
    });

    results = Array.from(resultsEl.querySelectorAll("a"));
    activeIndex = -1;

    block.querySelector(".search-box").setAttribute("aria-expanded", "true");
  }

  /* ---------- Algolia Search ---------- */
  async function runSearch() {
    const q = input.value.trim();
    clearResults();

    if (q.length < 2) return;

    try {
      const parts = window.location.pathname.split("/").filter(Boolean);
      const lang = parts[0] || "en";
      const { hits } = await algoliaIndex.search(q, {
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
        renderResults(hits, q);
      }
    } catch (e) {
      console.error("Algolia search failed", e);
    }
  }

  /* ---------- Events (UNCHANGED) ---------- */
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runSearch, 250);
  });

  input.addEventListener("keydown", (e) => {
    if (!results.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        activeIndex = activeIndex < results.length - 1 ? activeIndex + 1 : 0;
        updateActiveResult();
        break;

      case "ArrowUp":
        e.preventDefault();
        activeIndex = activeIndex > 0 ? activeIndex - 1 : results.length - 1;
        updateActiveResult();
        break;

      case "Enter":
        e.preventDefault();
        const query = input.value.trim();
        if (!query) return;
        // const parts = window.location.pathname.split("/").filter(Boolean);
        // const lang = parts[0] || "en";
        window.location.href = `/en/search?q=${encodeURIComponent(query)}`;
        break;

      case "Escape":
        clearResults();
        input.blur();
        break;
    }
  });

  document.addEventListener("click", (e) => {
    if (!block.contains(e.target)) {
      clearResults();
    }
  });
}
