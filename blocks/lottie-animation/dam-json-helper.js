///**
// * Helper to fetch JSON from DAM assets correctly
// * Handles cases where AEM forces download instead of inline viewing
// */
//
//export async function fetchDamJson(assetPath) {
//    try {
//        // Try direct fetch first
//        let response = await fetch(assetPath, {
//            method: 'GET',
//            headers: {
//                'Accept': 'application/json',
//                'Content-Type': 'application/json'
//            },
//            credentials: 'same-origin'
//        });
//
//        // If still getting download headers, try with different approach
//        if (!response.ok || response.headers.get('content-disposition')?.includes('attachment')) {
//            console.log('Trying alternative fetch method...');
//
//            // Add query parameter to force inline
//            const url = new URL(assetPath, window.location.origin);
//            url.searchParams.append('inline', 'true');
//
//            response = await fetch(url.toString(), {
//                headers: {
//                    'Accept': 'application/json'
//                }
//            });
//        }
//
//        // Get the response as text first
//        const text = await response.text();
//
//        // Parse as JSON
//        try {
//            return JSON.parse(text);
//        } catch (parseError) {
//            console.error('Failed to parse JSON:', parseError);
//            throw new Error('Invalid JSON format');
//        }
//
//    } catch (error) {
//        console.error('Error fetching DAM asset:', error);
//        throw error;
//    }
//}
//
///**
// * Alternative: Use FileReader API if you have the asset reference
// */
//export async function readJsonFromAsset(assetReference) {
//    return new Promise((resolve, reject) => {
//        const reader = new FileReader();
//
//        reader.onload = (event) => {
//            try {
//                const json = JSON.parse(event.target.result);
//                resolve(json);
//            } catch (error) {
//                reject(new Error('Invalid JSON'));
//            }
//        };
//
//        reader.onerror = () => reject(new Error('Failed to read file'));
//
//        // This would work if you have access to the File object
//        reader.readAsText(assetReference);
//    });
//}
//
///**
// * Fetch via AEM's asset delivery API
// */
//export async function fetchViaAssetAPI(assetPath) {
//    // Remove /content/dam prefix if present and add API endpoint
//    const cleanPath = assetPath.replace('/content/dam/', '');
//    const apiUrl = `/api/assets/${cleanPath}`;
//
//    try {
//        const response = await fetch(apiUrl, {
//            headers: {
//                'Accept': 'application/json'
//            }
//        });
//
//        if (!response.ok) {
//            throw new Error(`API request failed: ${response.status}`);
//        }
//
//        return await response.json();
//    } catch (error) {
//        console.error('Asset API fetch failed:', error);
//        throw error;
//    }
//}
/**
 * Lottie JSON Helper - Project Repository Base
 * 
 * This helper fetches Lottie JSON files stored in the project's code repository
 * under /blocks/lottie-animation/lottie-data/
 */

export async function fetchLottieJson(filename) {
    console.log('[Lottie Helper] Fetching animation:', filename);

    // Validate input
    if (!filename) {
        throw new Error('Animation filename is required');
    }

    // Determine the correct fetch URL
    const fetchUrl = getFetchUrl(filename);
    console.log('[Lottie Helper] Resolved URL:', fetchUrl);

    try {
        const response = await fetch(fetchUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Animation file "${filename}.json" not found in lottie-data folder.`);
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('[Lottie Helper] ✓ Successfully loaded JSON');
        return data;

    } catch (error) {
        console.error('[Lottie Helper] Fetch failed:', error.message);
        throw error;
    }
}

/**
 * Resolve filename to the local project path
 */
export function getFetchUrl(filename) {
    // If it's already a full path (starting with /), return it
    if (filename.startsWith('/')) {
        return filename;
    }

    // Strip .json extension if provided by user
    const baseName = filename.replace(/\.json$/, '');

    // Resolve to the project's lottie-data directory
    // window.hlx.codeBasePath handles correctly resolving paths in EDS
    const codeBase = window.hlx?.codeBasePath || '';
    const repoPath = `${codeBase}/blocks/lottie-animation/lottie-data/${baseName}.json`.replace(/\/+/g, '/');

    return repoPath;
}

/**
 * Utility: Check if an asset is accessible
 */
export async function checkAssetAvailability(filename) {
    try {
        const url = getFetchUrl(filename);
        const response = await fetch(url, {
            method: 'HEAD'
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
