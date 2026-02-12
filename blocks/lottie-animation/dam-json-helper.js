/**
 * DAM JSON Helper - Adobe Edge Delivery Services Compatible
 * 
 * According to Adobe's official documentation, DAM assets can be fetched
 * directly from Edge Delivery Services after they are published in AEM.
 * 
 * Requirements:
 * 1. Assets must be published in AEM DAM
 * 2. Use direct /content/dam/ paths (no proxy needed)
 * 3. Assets are served with proper CORS headers automatically
 */

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

    // Try multiple fetch strategies with fallbacks
    const strategies = [
        // Strategy 1: Direct fetch (recommended by Adobe for Edge Delivery)
        () => directFetch(normalizedPath),
        
        // Strategy 2: With inline query parameter
        () => directFetch(`${normalizedPath}?inline=true`),
        
        // Strategy 3: For AEM author/publish environments
        () => aemEnvironmentFetch(normalizedPath)
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
    throw createDetailedError(normalizedPath, lastError);
}

/**
 * Direct fetch - Adobe's recommended approach for Edge Delivery Services
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

    // Check if response is trying to force download
    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition && contentDisposition.includes('attachment')) {
        console.warn('[DAM Helper] Server is forcing download, but continuing...');
    }

    const contentType = response.headers.get('content-type');
    console.log('[DAM Helper] Content-Type:', contentType);

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
 * Fetch for AEM author/publish environments
 */
async function aemEnvironmentFetch(assetPath) {
    // Check if we're on an AEM environment
    const isAemEnvironment = window.location.hostname.includes('adobeaemcloud.com') ||
                            window.location.hostname.includes('aem.page') ||
                            window.location.hostname.includes('aem.live');

    if (!isAemEnvironment) {
        throw new Error('Not an AEM environment');
    }

    console.log('[DAM Helper] Detected AEM environment, using direct path');
    
    return directFetch(assetPath);
}

/**
 * Create a detailed error with troubleshooting information
 */
function createDetailedError(assetPath, originalError) {
    const error = new Error(
        `Failed to load DAM asset: ${assetPath}\n\n` +
        `Original error: ${originalError.message}\n\n` +
        `Troubleshooting steps:\n` +
        `1. Verify the asset is published in AEM DAM\n` +
        `2. Check the asset path is correct: ${assetPath}\n` +
        `3. Ensure the asset is a valid JSON file\n` +
        `4. Check browser console for CORS or network errors`
    );
    
    error.originalError = originalError;
    error.assetPath = assetPath;
    
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