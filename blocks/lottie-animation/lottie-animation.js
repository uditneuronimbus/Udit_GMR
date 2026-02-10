/**
 * Lottie Animation Component - Universal Editor Compatible
 * Properly handles JSON from AEM DAM assets
 */

import { fetchDamJson } from './dam-json-helper.js';

export default async function decorate(block) {
    // Parse block properties
    const props = parseBlockProps(block);

    // The asset path can be in multiple possible property names
    const assetPath = props.animationJsonFile || props.animationAsset || props.assetPath || props.animation;

    if (!assetPath) {
        block.innerHTML = `
      <div class="animation-placeholder">
        <p>⚠️ No animation selected</p>
        <p>Please select a Lottie JSON file from DAM</p>
      </div>
    `;
        return;
    }

    // Show loading state
    block.innerHTML = '<div class="loading">Loading animation from DAM...</div>';
    block.classList.add('lottie-animation-block');

    try {
        // Load Lottie library
        await loadLottieLibrary();

        // Fetch animation data from DAM
        console.log('Fetching animation from:', assetPath);
        const animationData = await fetchDamJson(assetPath);
        console.log('Animation data loaded:', animationData.nm || 'Unnamed');

        // Build the component UI
        buildAnimationUI(block, animationData, props, assetPath);

    } catch (error) {
        console.error('Failed to load animation:', error);
        showError(block, assetPath, error);
    }
}

function parseBlockProps(block) {
    const props = {
        loop: true,
        autoplay: true,
        showControls: true,
        renderer: 'svg',
        width: '100%',
        height: 'auto'
    };

    // Get from data attributes (Universal Editor)
    const dataProps = block.dataset;
    Object.keys(dataProps).forEach(key => {
        if (key.startsWith('aue')) return; // Skip AUE attributes

        let value = dataProps[key];

        // Convert string booleans
        if (value === 'true') value = true;
        if (value === 'false') value = false;

        props[key] = value;
    });

    // Get from block content (table format)
    const rows = block.querySelectorAll(':scope > div');
    rows.forEach(row => {
        const cells = row.querySelectorAll(':scope > div');
        if (cells.length === 2) {
            // Convert "Animation JSON File" -> "animationJsonFile"
            const rawKey = cells[0].textContent.trim();
            const key = rawKey
                .toLowerCase()
                .replace(/[^a-z0-9]+(.)/g, (m, chr) => chr.toUpperCase());

            const valueCell = cells[1];
            let value = valueCell.textContent.trim();

            // If the value cell contains a link, prioritize the link URL
            const link = valueCell.querySelector('a');
            if (link && (link.href || link.textContent.startsWith('/content/'))) {
                value = link.getAttribute('href') || link.textContent.trim();
            }

            // Convert booleans
            if (value === 'true') value = true;
            if (value === 'false') value = false;

            props[key] = value;
        }
    });

    return props;
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