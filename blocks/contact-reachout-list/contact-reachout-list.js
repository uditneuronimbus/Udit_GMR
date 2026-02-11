export default function decorate(block) {
  const isAuthorMode =
    document.body.classList.contains('aem-AuthorLayer-Edit') ||
    window.location.search.includes('wcmmode=edit');

  const rows = [...block.children];
  if (!rows.length) return;

  block.classList.add('contact-reachout');

  /* ===============================
     PREVENT DOUBLE RENDER
  =============================== */
  const existingRuntime = block.querySelector('.contact-reachout-runtime');
  if (existingRuntime) existingRuntime.remove();

  /* ===============================
     1️⃣ Heading & Description
  =============================== */
  const headingRow = rows.shift();
  const headingText = headingRow?.querySelector('p')?.textContent?.trim() || '';

  const descRow = rows.shift();
  const descHTML = descRow?.innerHTML || '';
  
  // Debug logging
  console.log('Heading:', headingText);
  console.log('Description HTML:', descHTML);
  console.log('Total rows after heading/desc:', rows.length);

  const container = document.createElement('div');
  container.className = 'contact-reachout-container contact-reachout-runtime';

  if (headingText) {
    const h2 = document.createElement('h2');
    h2.className = 'contact-reachout-heading mb-4';
    h2.textContent = headingText;
    container.appendChild(h2);
  }

  if (descHTML && descHTML.trim() !== '') {
    const descDiv = document.createElement('div');
    descDiv.className = 'contact-reachout-description';
    descDiv.innerHTML = descHTML;
    container.appendChild(descDiv);
  }

  /* ===============================
     2️⃣ Items (with Icons)
  =============================== */
  if (rows.length) {
    const listWrapper = document.createElement('div');
    listWrapper.className = 'contact-reachout-items';

    rows.forEach((itemRow, index) => {
      const children = [...itemRow.children];
      console.log(`Item ${index} has ${children.length} cells`);
      
      if (!children.length) return;

      const itemDiv = document.createElement('div');
      itemDiv.className = 'contact-reachout-item';

      // Create content wrapper
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'contact-reachout-item-content-wrapper';

      // Process each cell based on position
      children.forEach((cell, cellIndex) => {
        console.log(`Cell ${cellIndex}:`, cell.innerHTML);
        
        // Cell 0: Heading
        if (cellIndex === 0) {
          const headingText = cell.textContent?.trim();
          if (headingText) {
            const h3 = document.createElement('h3');
            h3.className = 'contact-reachout-item-heading';
            h3.textContent = headingText;
            contentWrapper.appendChild(h3);
          }
        }
        // Cell 1: Content (richtext)
        else if (cellIndex === 1) {
          const contentHTML = cell.innerHTML;
          if (contentHTML && contentHTML.trim() !== '') {
            const contentDiv = document.createElement('div');
            contentDiv.className = 'contact-reachout-item-content';
            
            // ===== CHANGED: Handle icon placement within content div =====
            
            // First, check if we have an icon from cell 2
            const iconCell = children[2];
            if (iconCell) {
              const iconContainer = createIconElement(iconCell);
              if (iconContainer) {
                contentDiv.appendChild(iconContainer);
              }
            }
            
            // Then append the content HTML (which contains the p tags)
            contentDiv.innerHTML += contentHTML;
            
            contentWrapper.appendChild(contentDiv);
          }
        }
        // Cell 2: Icon (image reference) - Now handled in cell 1 processing
        else if (cellIndex === 2) {
          // This is now handled in cell 1 processing
          // We can skip or keep as placeholder
        }
      });

      itemDiv.appendChild(contentWrapper);
      
      // Only add if there's actual content
      if (itemDiv.children.length > 0) {
        listWrapper.appendChild(itemDiv);
      }
    });

    if (listWrapper.children.length > 0) {
      container.appendChild(listWrapper);
    }
  }

  /* =================================
     HIDE AUTHORED CONTENT (NOT DELETE)
  ================================= */
  block.classList.add('contact-reachout-initialized');

  block.appendChild(container);

  if (isAuthorMode) return;
}

// Helper function to create icon element
function createIconElement(cell) {
  const iconContent = cell.innerHTML;
  if (!iconContent || iconContent.trim() === '') return null;
  
  const iconContainer = document.createElement('div');
  iconContainer.className = 'contact-reachout-item-icon';
  
  // Check for img tag first
  const img = cell.querySelector('img');
  if (img) {
    const iconImg = document.createElement('img');
    iconImg.src = img.src;
    iconImg.alt = img.alt || 'Icon';
    iconImg.loading = 'lazy';
    iconContainer.appendChild(iconImg);
  } 
  // Check for link
  else if (cell.querySelector('a')) {
    const link = cell.querySelector('a');
    const iconImg = document.createElement('img');
    iconImg.src = link.href;
    iconImg.alt = 'Icon';
    iconImg.loading = 'lazy';
    iconContainer.appendChild(iconImg);
  }
  // Check for text content (could be icon class or SVG)
  else {
    const text = cell.textContent.trim();
    if (text) {
      const iconSpan = document.createElement('span');
      iconSpan.className = `contact-reachout-icon ${text}`;
      iconSpan.setAttribute('data-icon', text);
      iconContainer.appendChild(iconSpan);
    }
  }
  
  return iconContainer.children.length > 0 ? iconContainer : null;
}