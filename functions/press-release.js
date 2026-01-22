/**
 * Press Release API Function
 * Fetches press releases from AEM Content Fragments
 * 
 * Query Parameters:
 * - limit: Number of items to return (default: 10)
 * - offset: Pagination offset (default: 0)
 * - year: Filter by year (e.g., 2025)
 * - month: Filter by month (e.g., 01-12)
 * - category: Filter by business category
 * - sort: Sort order - 'newest' or 'oldest' (default: newest)
 */

const AEM_GRAPHQL_ENDPOINT = process.env.AEM_GRAPHQL_ENDPOINT || 'https://author-p12345-e67890.adobeaemcloud.com/graphql/execute.json';

async function main(params) {
  try {
    const {
      limit = 10,
      offset = 0,
      year = '',
      month = '',
      category = '',
      sort = 'newest'
    } = params;

    // Build GraphQL query with filters
    const filterConditions = [];
    
    if (year) {
      filterConditions.push(`publishDate_year: ${year}`);
    }
    
    if (month) {
      filterConditions.push(`publishDate_month: ${month}`);
    }
    
    if (category) {
      filterConditions.push(`businessCategory: "${category}"`);
    }

    const filterString = filterConditions.length > 0 
      ? `filter: { ${filterConditions.join(', ')} }` 
      : '';

    const sortOrder = sort === 'oldest' ? 'ASC' : 'DESC';

    const query = `
      query GetPressReleases($limit: Int, $offset: Int) {
        pressReleaseList(
          ${filterString}
          sort: "publishDate ${sortOrder}"
          _locale: "en"
          limit: $limit
          offset: $offset
        ) {
          items {
            _path
            title
            slug
            description {
              plaintext
              html
            }
            shortDescription
            publishDate
            lastModified
            businessCategory
            category
            cardImage {
              _publishUrl
              _authorUrl
            }
            featuredImage {
              _publishUrl
              _authorUrl
            }
            ctaLabel
            ctaLink
            path
          }
          _references {
            ... on ImageRef {
              _path
              _publishUrl
            }
          }
        }
        pressReleaseListTotal: pressReleaseList(
          ${filterString}
          _locale: "en"
        ) {
          items {
            _path
          }
        }
      }
    `;

    const response = await fetch(AEM_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AEM_AUTH_TOKEN || ''}`
      },
      body: JSON.stringify({
        query,
        variables: {
          limit: parseInt(limit, 10),
          offset: parseInt(offset, 10)
        }
      })
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`);
    }

    const result = await response.json();
    
    // Add total count to response
    if (result.data?.pressReleaseList) {
      result.data.pressReleaseList.total = result.data.pressReleaseListTotal?.items?.length || 0;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: {
        success: true,
        data: result
      }
    };

  } catch (error) {
    console.error('Press Release API Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: {
        success: false,
        error: error.message
      }
    };
  }
}

exports.main = main;

