import algoliasearch from "https://cdn.jsdelivr.net/npm/algoliasearch@4/dist/algoliasearch-lite.esm.browser.js";

const ALGOLIA_APP_ID = "BARVAFD3OC";
const ALGOLIA_SEARCH_KEY = "e3ba8576fac702f5c6826b7b24cf221c";
const ALGOLIA_INDEX = "site_pages";

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
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
    <h2>Search results for "${query}"</h2>
    <div class="search-results-list"></div>
  `;

  if (!query) return;

  try {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const lang = parts[0] || "en";
    const { hits } = await index.search(query, {
      hitsPerPage: 20,
      attributesToSnippet: ["content:40"],
      snippetEllipsisText: "..."
    });

    const list = block.querySelector(".search-results-list");

    if (!hits.length) {
      list.innerHTML = "<p>No results found.</p>";
      return;
    }

    hits.forEach((item) => {
      const el = document.createElement("div");
      el.className = "search-result-item";

      const snippet =
        item._snippetResult?.content?.value ||
        item.description ||
        "";

      el.innerHTML = `
        <a href="${item.path}">
          <h3>${item.title || item.metaTitle}</h3>
          <p>${snippet}</p>
        </a>
      `;

      list.appendChild(el);
    });

  } catch (e) {
    console.error("Search page failed", e);
    block.innerHTML += "<p>Error loading search results.</p>";
  }
}
