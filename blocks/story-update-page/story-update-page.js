import { formatDate } from "../../scripts/common.js";
import { getSlugFromURL } from "../../scripts/common.js";
import { getApiHost } from "../../scripts/api.js";

const PUBLISH_DOMAIN =
  "https://publish-p168597-e1803019.adobeaemcloud.com";

/* ================================
   Fix DAM image paths
================================ */
function fixImageSrc(html) {
  if (!html) return html;

  return html.replace(
    /<img([^>]+)src="(\/content\/dam[^"]+)"/g,
    `<img$1src="${PUBLISH_DOMAIN}$2"`
  );
}

export default async function decorate(block) {
  const slug = getSlugFromURL();
  
  const currentUrl = window.location.href;

  block.innerHTML = "";

  if (!slug) {
    block.innerHTML = "<p>Invalid news item.</p>";
    return;
  }

  const container = document.createElement("section");
  container.className = "news-detail spacer";

  container.innerHTML = `
    <div class="container">
      <div class="news-detail-wrapper">
        <p class="loading">Loading article...</p>
      </div>
    </div>

   
  `;

  block.appendChild(container);

  const contentWrapper = container.querySelector(".news-detail-wrapper");

    

  /* ================================
     Fetch news detail
  ================================ */
  try {
    const apiUrl =
        `${getApiHost()}/api/v1/web/gmr-api/story-details` +
        `?slugUrl=${encodeURIComponent(slug)}`;

    console.log("________________________", apiUrl);
    
    const res = await fetch(apiUrl);

    if (!res.ok) throw new Error(res.status);

    const json = await res.json();
        console.log(json);
    const items = json?.data?.data?.successStoryList?.items || [];

    const item = items[0] || null;

    if (!item) {
      contentWrapper.innerHTML = "<p>Story not found.</p>";
      return;
    }

    /* ================================
       Meta updates
    ================================ */
    document.title = item.metaTitle || item.title || "";

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = item.metaDescription?.plaintext || "";

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement("meta");
      metaKeywords.setAttribute("name", "keywords");
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute("content", item.metaKeywords || "");

    const publishDateRaw =
      item.publishDate?.iso ||
      item.publishDate?.value ||
      item.publishDate ||
      "";

    const publishDateFormatted = formatDate(publishDateRaw);

    const hasTitle = !!item.title;
    const hasImage = !!item.cardImage?._publishUrl;
   // const hasContent = !!item.description?.html;

    /* ================================
       Render page
    ================================ */
    contentWrapper.innerHTML = `

      <article class="news-article">

    ${
      hasTitle
        ? `<div class="news-title">
             <h1>${item.title}</h1>
           </div>`
        : ""
    }

    ${
      hasImage
        ? `<div class="news-card">
             <img
               src="${item.cardImage._publishUrl}"
               alt="${item.title || "News image"}"
             />
           </div>`
        : ""
    }

             <div>subCategory: ${item.subCategory}</div>
             <div>visitUrl: ${item.visitUrl}</div>
             <div>slugUrl: ${item.slugUrl}</div>
            <div>approachStrategyTitle: ${item.approachStrategyTitle}</div>
            <div>approachStrategy: ${item.approachStrategy?.html}</div>
            <div>contextHistoricalBackdropTitle: ${item.contextHistoricalBackdropTitle}</div>
            <div>contextHistoricalBackdrop: ${item.contextHistoricalBackdrop?.html}</div>
            <div>coreProblemStatementTitle: ${item.coreProblemStatementTitle}</div>
            <div>coreProblemStatement: ${item.coreProblemStatement?.html}</div>
            <div>executiveSummaryTitle: ${item.executiveSummaryTitle}</div>
            <div>executiveSummary: ${item.executiveSummary?.html}</div>
            <div>globalBenchmarkingInsightsTitle: ${item.globalBenchmarkingInsightsTitle}</div>
            <div>globalBenchmarkingInsights: ${item.globalBenchmarkingInsights?.html}</div>
            <div>implementationTitle: ${item.implementationTitle}</div>
            <div>implementation: ${item.implementation?.html}</div>
            <div>leadershipPerspectivesTitle: ${item.leadershipPerspectivesTitle}</div>
            <div>leadershipPerspectives: ${item.leadershipPerspectives?.html}</div>
            <div>openingNarrativeTitle: ${item.openingNarrativeTitle}</div>
            <div>openingNarrative: ${item.openingNarrative?.html}</div>
            <div>sustainabilityImpactTitle: ${item.sustainabilityImpactTitle}</div>
            <div>outcomesImpactwhereeverSustainabilityImpact: ${item.outcomesImpactwhereeverSustainabilityImpact?.html}</div>
            <div>stakeholderMapTitle: ${item.stakeholderMapTitle}</div>
            <div>stakeholderMap: ${item.stakeholderMap?.html}</div>
            <div>stakeholderMapTitle: ${item.stakeholderMapTitle}</div>
            <div>stakeholderMap: ${item.stakeholderMap?.html}</div>
            <div>Image 1: ${item.image1?._publishUrl}</div>
            <div>Image 2: ${item.image2?._publishUrl}</div>
            <div>Image 3: ${item.image3?._publishUrl}</div>
            <div>Image 4: ${item.image4?._publishUrl}</div>
            <div>Image 5: ${item.image5?._publishUrl}</div>
            <div>Image 6: ${item.image6?._publishUrl}</div>
            <div>Image 7: ${item.image7?._publishUrl}</div>
            <div>Image 8: ${item.image8?._publishUrl}</div>
            <div>Image 9: ${item.image9?._publishUrl}</div>
            <div>Image 10: ${item.image10?._publishUrl}</div>


  </article>
    `;

    /* ================================
       Events
    ================================ */

    container.querySelectorAll(".back-btn").forEach((btn) => {
      btn.addEventListener("click", () => history.back());
    });


  } catch (err) {
    console.error("News detail error:", err);
    contentWrapper.innerHTML = "<p>Error loading article.</p>";
  }
}