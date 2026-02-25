import { setSharedData, getSharedData } from '../../scripts/shared-filter.js';

export default function decorate(block) {
  if (block.dataset.decorated) {
    return;
  }

  try {
    const rows = [...block.children];

    const extractFromRow = (row) => {
      if (!row) return [];
      const cells = [...row.children];

      // If there are 2+ cells, assume the first is a label and skip it if it's short
      let valuesCells = cells;
      if (cells.length >= 2) {
        const firstCellText = cells[0].textContent.trim();
        // Labels are usually short, but handle case where labels are also in cells
        if (firstCellText.length < 25) {
          valuesCells = cells.slice(1);
        }
      }

      return valuesCells.flatMap(el => {
        const text = el.textContent || "";
        return text
          .split(',')
          .map(v => v.trim())
          .filter(Boolean);
      });
    };

    const findRowByKeyword = (keywords) => {
      return rows.find(row => {
        // Check all cells for the keyword to handle translated/wrapped labels
        return [...row.children].some(cell => {
          const text = cell.textContent.toLowerCase();
          return keywords.some(k => text.includes(k.toLowerCase()));
        });
      });
    };

    // Heuristic Fallbacks if keywords fail (useful for translated content)
    const findRowBySignature = (type) => {
      if (type === 'year') {
        // Look for a row where at least one cell has a 4-digit number (2010-2030)
        return rows.find(row => [...row.children].some(cell => /\b20\d{2}\b/.test(cell.textContent)));
      }
      if (type === 'month') {
        // Look for common month names if they are likely translated
        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        return rows.find(row => [...row.children].some(cell => {
          const t = cell.textContent.toLowerCase();
          return months.some(m => t.includes(m));
        }));
      }
      return null;
    };

    // 1. Try finding by keyword or signature
    let yearsRow = findRowByKeyword(['year']) || findRowBySignature('year');
    let monthsRow = findRowByKeyword(['month']) || findRowBySignature('month');
    let tagsRow = findRowByKeyword(['tag']);
    let catsRow = findRowByKeyword(['category', 'subcategory']);

    // 2. Fallback to indices if keywords/signatures didn't find specific rows
    let dataStartIndex = (rows[0]?.children?.length === 1 && rows[0]?.textContent.trim().toLowerCase().includes('filter')) ? 1 : 0;

    const freshData = {
      years: extractFromRow(yearsRow || rows[dataStartIndex]),
      months: extractFromRow(monthsRow || rows[dataStartIndex + 1]),
      tags: extractFromRow(tagsRow || rows[dataStartIndex + 2]),
      subCategories: extractFromRow(catsRow || rows[dataStartIndex + 3]),
    };

    // 3. MERGE with existing data (to handle multiple fragments or blocks)
    const existing = getSharedData('pressFilters') || {};
    const merged = {
      years: [...new Set([...(existing.years || []), ...freshData.years])],
      months: [...new Set([...(existing.months || []), ...freshData.months])],
      tags: [...new Set([...(existing.tags || []), ...freshData.tags])],
      subCategories: [...new Set([...(existing.subCategories || []), ...freshData.subCategories])],
    };

    console.info(`[Filter-By] Raw detected: y=${freshData.years.length}, m=${freshData.months.length}, t=${freshData.tags.length}, c=${freshData.subCategories.length}`);
    console.info('[Filter-By] Merged data:', merged);

    block.dataset.decorated = 'true';
    block.innerHTML = '';

    setSharedData('pressFilters', merged);

    window.dispatchEvent(
      new CustomEvent('press-filters-ready', { detail: merged })
    );
  } catch (error) {
    console.error('[Filter-By] decoration error:', error);
  }
}
