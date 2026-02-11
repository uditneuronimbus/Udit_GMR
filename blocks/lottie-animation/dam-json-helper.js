/**
 * Helper to fetch JSON from DAM assets correctly
 * Handles cases where AEM forces download instead of inline viewing
 */

export async function fetchDamJson(assetPath) {
    try {
        console.log('[DAM Helper] Original asset path:', assetPath);

        // Convert AEM DAM paths to full URLs when not on AEM author
        let fetchUrl = assetPath;

        // Check if we're NOT on AEM author and the path is a DAM path
        const isAemAuthor = window.location.hostname.includes('adobeaemcloud.com');

        if (!isAemAuthor && assetPath.startsWith('/content/dam/')) {
            // Use CORS proxy to fetch DAM assets (bypasses CORS restrictions)
            fetchUrl = `/tools/dam-proxy/dam-proxy.js?path=${encodeURIComponent(assetPath)}`;
            console.log('[DAM Helper] Edge Delivery detected, using CORS proxy:', fetchUrl);
        }

        // Try direct fetch first
        let response = await fetch(fetchUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: isAemAuthor ? 'same-origin' : 'omit'
        });

        console.log('[DAM Helper] Response status:', response.status);
        console.log('[DAM Helper] Response headers:', {
            contentType: response.headers.get('content-type'),
            contentDisposition: response.headers.get('content-disposition')
        });

        // If still getting download headers or 404, try with different approach
        if (!response.ok || response.headers.get('content-disposition')?.includes('attachment')) {
            console.log('[DAM Helper] Trying alternative fetch method...');

            // Add query parameter to force inline
            const url = new URL(fetchUrl);
            url.searchParams.append('inline', 'true');

            response = await fetch(url.toString(), {
                headers: {
                    'Accept': 'application/json'
                },
                credentials: isAemAuthor ? 'same-origin' : 'omit'
            });
        }

        // Check if response is OK
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to fetch DAM asset from ${fetchUrl}`);
        }

        // Get the response as text first
        const text = await response.text();
        console.log('[DAM Helper] Response length:', text.length);
        console.log('[DAM Helper] Response preview:', text.substring(0, 200));

        // Parse as JSON
        try {
            const jsonData = JSON.parse(text);
            console.log('[DAM Helper] ✓ JSON parsed successfully');
            return jsonData;
        } catch (parseError) {
            console.error('[DAM Helper] ❌ Failed to parse JSON:', parseError);
            console.error('[DAM Helper] Response text (first 500 chars):', text.substring(0, 500));
            console.error('[DAM Helper] Full response text:', text);
            throw new Error('Invalid JSON format');
        }

    } catch (error) {
        console.error('[DAM Helper] Error fetching DAM asset:', error);
        throw error;
    }
}

/**
 * Alternative: Use FileReader API if you have the asset reference
 */
export async function readJsonFromAsset(assetReference) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                resolve(json);
            } catch (error) {
                reject(new Error('Invalid JSON'));
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));

        // This would work if you have access to the File object
        reader.readAsText(assetReference);
    });
}

/**
 * Fetch via AEM's asset delivery API
 */
export async function fetchViaAssetAPI(assetPath) {
    // Remove /content/dam prefix if present and add API endpoint
    const cleanPath = assetPath.replace('/content/dam/', '');
    const apiUrl = `/api/assets/${cleanPath}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Asset API fetch failed:', error);
        throw error;
    }
}