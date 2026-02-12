/**
 * DAM JSON Helper - Adobe Edge Delivery Services Compatible
 * 
 * According to Adobe's official documentation, DAM assets can be fetched
 * directly from Edge Delivery Services after they are published in AEM.
 * 
 * Requirements:
 * 1. Assets must be published in AEM DAM
 * 2. Fetch from AEM publish instance (not Edge Delivery domain)
 * 3. Assets are served with proper CORS headers automatically
 */

// AEM Publish instance URL - extracted from your project configuration
const AEM_PUBLISH_URL = 'https://publish-p168597-e1803019.adobeaemcloud.com';

export async function fetchDamJson(assetPath) {
    console.log('[DAM Helper] Fetching asset:', assetPath);

    // Validate input
    if (!assetPath) {
        throw new Error('Asset path is required');
    }

    // Normalize the path - ensure it starts with /content/dam/
    let normalizedPath = assetPath;
    if (!normalizedPath.startsWith('/content/dam/')) {
        if (normalizedPath.startsWith('content/dam/')) {
            normalizedPath = '/' + normalizedPath;
        } else {
            throw new Error('Invalid DAM path. Must start with /content/dam/');
        }
    }

    // Determine the correct fetch URL based on environment
    const fetchUrl = getFetchUrl(normalizedPath);
    console.log('[DAM Helper] Fetch URL:', fetchUrl);

    // Try multiple fetch strategies with fallbacks
    const strategies = [
        // Strategy 1: EDS-mapped path (Adobe's recommended approach)
        // This will work when the asset is published and paths.json is configured
        () => directFetch(fetchUrl),

        // Strategy 2: Direct from AEM publish with CORS mode
        // (will fail with CORS in browser, but worth trying)
        () => directFetchWithCors(`${AEM_PUBLISH_URL}${normalizedPath}`),

        // Strategy 3: Local test file (for development only)
        () => loadLocalTestFile(normalizedPath),

        // Strategy 4: Local path (for AEM author environment)
        () => directFetch(normalizedPath)
    ];

    let lastError;

    for (let i = 0; i < strategies.length; i++) {
        try {
            console.log(`[DAM Helper] Trying strategy ${i + 1}...`);
            const data = await strategies[i]();
            console.log('[DAM Helper] ✓ Successfully loaded JSON');
            return data;
        } catch (error) {
            console.warn(`[DAM Helper] Strategy ${i + 1} failed:`, error.message);
            lastError = error;
            // Continue to next strategy
        }
    }

    // All strategies failed
    throw createDetailedError(normalizedPath, fetchUrl, lastError);
}

/**
 * Determine the correct fetch URL based on environment
 */
function getFetchUrl(assetPath) {
    const hostname = window.location.hostname;

    // If we're on the AEM author/publish instance, use the local path
    if (hostname.includes('adobeaemcloud.com')) {
        console.log('[DAM Helper] Detected AEM instance, using direct path');
        return assetPath;
    }

    // For EDS (Edge Delivery Services) - use the mapped path
    // Adobe's recommended approach: Map /content/dam/gmr/animations/ to /animations/
    // This is configured in paths.json
    if (assetPath.startsWith('/content/dam/gmr/animations/')) {
        const filename = assetPath.replace('/content/dam/gmr/animations/', '');
        const edsMappedPath = `/animations/${filename}`;
        console.log('[DAM Helper] Using EDS-mapped path:', edsMappedPath);
        return edsMappedPath;
    }

    // Fallback: If on localhost or other Edge Delivery domains and not using mapped path,
    // try the dam-proxy (for backward compatibility)
    const isEdgeDelivery = hostname === 'localhost' ||
        hostname.includes('.aem.page') ||
        hostname.includes('.aem.live') ||
        hostname.includes('.hlx.page') ||
        hostname.includes('.hlx.live');

    if (isEdgeDelivery) {
        // Use dam-proxy to bypass CORS
        // The proxy runs server-side and adds CORS headers
        const proxyUrl = `/tools/dam-proxy/dam-proxy.js?path=${encodeURIComponent(assetPath)}`;
        console.log('[DAM Helper] Using dam-proxy to bypass CORS');
        return proxyUrl;
    }

    // Default: try AEM publish instance (may fail with CORS)
    console.warn('[DAM Helper] Unknown environment, trying AEM publish URL');
    return `${AEM_PUBLISH_URL}${assetPath}`;
}

/**
 * Direct fetch - for proxy or same-origin requests
 */
async function directFetch(url) {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'same-origin'
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Asset not found (404). The asset may not be published in AEM DAM.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Check content type - if it's JavaScript, the proxy returned source code (local dev issue)
    const contentType = response.headers.get('content-type');
    console.log('[DAM Helper] Content-Type:', contentType);

    if (contentType && contentType.includes('javascript')) {
        throw new Error('Proxy returned JavaScript source code (not executed). This happens in local development.');
    }

    // Get response as text first to handle edge cases
    const text = await response.text();

    if (!text || text.trim().length === 0) {
        throw new Error('Empty response received');
    }

    // Parse JSON
    try {
        return JSON.parse(text);
    } catch (parseError) {
        console.error('[DAM Helper] Failed to parse JSON. First 200 chars:', text.substring(0, 200));
        throw new Error(`Invalid JSON format: ${parseError.message}`);
    }
}

/**
 * Direct fetch with CORS enabled - for cross-origin requests to AEM publish
 * This will fail with CORS errors in most cases, but works if CORS is configured
 */
async function directFetchWithCors(url) {
    console.log('[DAM Helper] Attempting direct CORS fetch from:', url);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        mode: 'cors', // Explicitly request CORS
        credentials: 'omit' // Don't send credentials for cross-origin
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Asset not found (404). The asset may not be published in AEM DAM.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    console.log('[DAM Helper] Content-Type:', contentType);

    const text = await response.text();

    if (!text || text.trim().length === 0) {
        throw new Error('Empty response received');
    }

    try {
        return JSON.parse(text);
    } catch (parseError) {
        throw new Error(`Invalid JSON format: ${parseError.message}`);
    }
}

/**
 * Load from local test file - for development only
 * Looks for a test JSON file in the lottie-animation block directory
 */
async function loadLocalTestFile(assetPath) {
    // Only try this on localhost
    if (window.location.hostname !== 'localhost') {
        throw new Error('Local test files only available on localhost');
    }

    // Extract filename from DAM path
    const filename = assetPath.split('/').pop();

    // Try to load from blocks/lottie-animation/test-data/
    const testFilePath = `/blocks/lottie-animation/test-data/${filename}`;

    console.log('[DAM Helper] Attempting to load local test file:', testFilePath);
    console.warn('[DAM Helper] ⚠️ Using local test file for development. This will not work in production!');

    const response = await fetch(testFilePath);

    if (!response.ok) {
        throw new Error(`Local test file not found: ${testFilePath}`);
    }

    const text = await response.text();
    return JSON.parse(text);
}

/**
 * Create a detailed error with troubleshooting information
 */
function createDetailedError(assetPath, fetchUrl, originalError) {
    const isCorsError = originalError.message.includes('CORS') ||
        originalError.message.includes('Failed to fetch') ||
        originalError.message.includes('blocked');

    let troubleshootingSteps = `Troubleshooting steps:\n`;

    if (isCorsError) {
        troubleshootingSteps +=
            `⚠️ CORS Error Detected:\n` +
            `1. Ensure the dam-proxy function is deployed and accessible\n` +
            `2. Check that the asset is published in AEM DAM\n` +
            `3. Verify the AEM publish URL in tools/dam-proxy/dam-proxy.js\n` +
            `4. Try accessing the proxy directly: ${fetchUrl}\n` +
            `5. Check if the asset exists at: ${AEM_PUBLISH_URL}${assetPath}\n`;
    } else {
        troubleshootingSteps +=
            `1. Verify the asset is published in AEM DAM\n` +
            `2. Check the asset path is correct: ${assetPath}\n` +
            `3. Ensure the asset is a valid JSON file\n` +
            `4. Try accessing the URL directly: ${fetchUrl}\n` +
            `5. Check browser console for network errors\n`;
    }

    const error = new Error(
        `Failed to load DAM asset: ${assetPath}\n\n` +
        `Attempted URL: ${fetchUrl}\n\n` +
        `Original error: ${originalError.message}\n\n` +
        troubleshootingSteps
    );

    error.originalError = originalError;
    error.assetPath = assetPath;
    error.fetchUrl = fetchUrl;

    return error;
}

/**
 * Utility: Check if an asset is accessible
 * Useful for pre-validation before attempting to load
 */
export async function checkAssetAvailability(assetPath) {
    try {
        const response = await fetch(assetPath, {
            method: 'HEAD',
            credentials: 'same-origin'
        });

        return {
            available: response.ok,
            status: response.status,
            contentType: response.headers.get('content-type')
        };
    } catch (error) {
        return {
            available: false,
            status: 0,
            error: error.message
        };
    }
}