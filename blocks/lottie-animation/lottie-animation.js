/**
 * Lottie Animation Component - Universal Editor Compatible
 * Properly handles JSON from AEM DAM assets
 */

import { fetchDamJson } from './dam-json-helper.js';

export default async function decorate(block) {
    // Parse block properties
    const props = parseBlockProps(block);

    // Debug log for authoring help
    if (props.showcontrols) {
        console.debug('[Lottie] Parsed properties:', props);
    }

    // Get asset path (case-insensitive search + deep search fallback)
    const assetPath =
        props.animation ||
        props.animationjsonfile ||
        props.animationasset ||
        props.assetpath ||
        Object.values(props).find(v => typeof v === 'string' && v.startsWith('/content/dam/')) ||
        scanBlockForDamPath(block);

    if (!assetPath) {
        block.innerHTML = `
      <div class="animation-placeholder">
        <p>⚠️ No animation selected</p>
        <p>Please select a Lottie JSON file from DAM</p>
        ${props.showcontrols ? `
          <div class="debug-info" style="font-size:10px; opacity:0.5; margin-top:20px; line-height: 1.5;">
            <strong>Debug info:</strong><br>
            Available keys: ${Object.keys(props).join(', ') || 'none'}<br>
            Classes: ${block.className}<br>
            Table rows: ${block.querySelectorAll(':scope > div').length}
          </div>
        ` : ''}
      </div>
    `;
        return;
    }

    // Handle case where assetPath might be a JSON array string ["path"]
    let finalPath = assetPath;
    if (typeof assetPath === 'string' && assetPath.startsWith('[') && assetPath.endsWith(']')) {
        try {
            const arr = JSON.parse(assetPath);
            if (Array.isArray(arr) && arr.length > 0) finalPath = arr[0];
        } catch (e) {
            console.warn('[Lottie] Failed to parse assetPath as array:', e);
        }
    }

    // Show loading state
    block.innerHTML = '<div class="loading">Loading animation from DAM...</div>';
    block.classList.add('lottie-animation-block');

    try {
        // Load Lottie library
        await loadLottieLibrary();

        // Fetch animation data from DAM
        console.log('[Lottie] Fetching animation from:', finalPath);
        const animationData = await fetchDamJson(finalPath);
        console.log('[Lottie] Animation data loaded:', animationData.nm || 'Unnamed');

        // Build the component UI
        buildAnimationUI(block, animationData, props, finalPath);

    } catch (error) {
        console.error('[Lottie] Failed to load animation:', error);
        showError(block, finalPath, error);
    }
}

function parseBlockProps(block) {
    const props = {
        loop: true,
        autoplay: true,
        showcontrols: false, // Hidden by default now
        renderer: 'svg',
        width: '100%',
        height: 'auto'
    };

    // 1. Get from data attributes (Universal Editor) - convert to lowercase
    const dataProps = block.dataset;
    Object.keys(dataProps).forEach(key => {
        if (key.startsWith('aue')) return;

        let value = dataProps[key];
        if (value === 'true') value = true;
        if (value === 'false') value = false;

        props[key.toLowerCase()] = value;
    });

    // 2. Get from block content (table format) - convert labels to lowercase keys
    const rows = block.querySelectorAll(':scope > div');
    rows.forEach(row => {
        const cells = row.querySelectorAll(':scope > div');
        if (cells.length === 2) {
            // Normalize labels to lowercase keys (e.g. "Animation" -> "animation")
            const key = cells[0].textContent.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

            const valueCell = cells[1];
            let value = valueCell.textContent.trim();

            const link = valueCell.querySelector('a');
            if (link && (link.href || link.textContent.startsWith('/content/'))) {
                value = link.getAttribute('href') || link.textContent.trim();
            }

            if (value === 'true') value = true;
            if (value === 'false') value = false;

            props[key] = value;
        }
    });

    return props;
}

function scanBlockForDamPath(block) {
    // Deep search for anything starting with /content/dam/ and ending in .json
    // Check links
    const link = block.querySelector('a[href*="/content/dam/"]');
    if (link && link.getAttribute('href').endsWith('.json')) {
        return link.getAttribute('href');
    }

    // Check text content
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    let node;
    while (node = walker.nextNode()) {
        const text = node.textContent.trim();
        if (text.startsWith('/content/dam/') && text.endsWith('.json')) {
            return text;
        }
    }

    return null;
}

async function loadLottieLibrary() {
    if (window.lottie) return;

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load Lottie library'));
        document.head.appendChild(script);
    });
}

function buildAnimationUI(block, animationData, props, assetPath) {
    block.innerHTML = '';

    // Info panel (shown during authoring)
    if (props.showControls) {
        const infoPanel = createInfoPanel(animationData, assetPath);
        block.appendChild(infoPanel);
    }

    // Animation container
    const container = document.createElement('div');
    container.className = 'lottie-animation-container';
    container.id = `lottie-${Date.now()}`;

    if (props.width) container.style.width = props.width;
    if (props.height && props.height !== 'auto') container.style.height = props.height;

    block.appendChild(container);

    // Initialize Lottie
    const animation = window.lottie.loadAnimation({
        container: container,
        renderer: props.renderer || 'svg',
        loop: props.loop !== false,
        autoplay: props.autoplay !== false,
        animationData: animationData
    });

    // Store reference
    block.lottieAnimation = animation;

    // Add controls if in authoring mode
    if (props.showControls) {
        addControls(block, animation);
    }

    console.log('✓ Animation rendered successfully');
}

function createInfoPanel(data, assetPath) {
    const panel = document.createElement('div');
    panel.className = 'animation-info';

    const duration = data.op && data.fr ? (data.op / data.fr).toFixed(2) : 'Unknown';

    panel.innerHTML = `
    <div class="info-header">
      <h3>📽️ Lottie Animation</h3>
      <div class="controls">
        <button class="btn-play-pause" data-state="playing">⏸ Pause</button>
        <button class="btn-restart">⟳ Restart</button>
      </div>
    </div>
    <div class="info-details">
      <div class="info-row">
        <span class="label">Name:</span>
        <span class="value">${data.nm || 'Unnamed'}</span>
      </div>
      <div class="info-row">
        <span class="label">Asset:</span>
        <span class="value">${assetPath}</span>
      </div>
      <div class="info-row">
        <span class="label">Size:</span>
        <span class="value">${data.w} × ${data.h} px</span>
      </div>
      <div class="info-row">
        <span class="label">Duration:</span>
        <span class="value">${duration}s @ ${data.fr}fps</span>
      </div>
      <div class="info-row">
        <span class="label">Layers:</span>
        <span class="value">${data.layers?.length || 0}</span>
      </div>
    </div>
  `;

    return panel;
}

function addControls(block, animation) {
    const playPauseBtn = block.querySelector('.btn-play-pause');
    const restartBtn = block.querySelector('.btn-restart');

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            const state = playPauseBtn.dataset.state;

            if (state === 'playing') {
                animation.pause();
                playPauseBtn.innerHTML = '▶ Play';
                playPauseBtn.dataset.state = 'paused';
            } else {
                animation.play();
                playPauseBtn.innerHTML = '⏸ Pause';
                playPauseBtn.dataset.state = 'playing';
            }
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            animation.goToAndPlay(0);
            if (playPauseBtn) {
                playPauseBtn.innerHTML = '⏸ Pause';
                playPauseBtn.dataset.state = 'playing';
            }
        });
    }
}

function showError(block, assetPath, error) {
    block.innerHTML = `
    <div class="animation-error">
      <h3>❌ Failed to Load Animation</h3>
      <div class="error-details">
        <p><strong>Asset Path:</strong> ${assetPath}</p>
        <p><strong>Error:</strong> ${error.message}</p>
      </div>
      <div class="error-actions">
        <button onclick="location.reload()">🔄 Retry</button>
        <a href="${assetPath}" target="_blank" class="btn-secondary">📄 View JSON File</a>
      </div>
      <div class="error-help">
        <p><strong>Common Issues:</strong></p>
        <ul>
          <li>File not published in AEM DAM</li>
          <li>Invalid JSON format</li>
          <li>Incorrect file path</li>
          <li>Missing CORS headers</li>
        </ul>
      </div>
    </div>
  `;
}