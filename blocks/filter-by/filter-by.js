import { setSharedData } from '../../scripts/shared-filter.js';

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
        if (firstCellText.length < 20) { // Labels are usually short
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
        const text = (row.children[0]?.textContent || "").toLowerCase();
        return keywords.some(k => text.includes(k.toLowerCase()));
      });
    };

    // 1. Try finding by keyword
    let yearsRow = findRowByKeyword(['year']);
    let monthsRow = findRowByKeyword(['month']);
    let tagsRow = findRowByKeyword(['tag']);
    let catsRow = findRowByKeyword(['category', 'subcategory']);

    // 2. Fallback to indices if keywords didn't find specific rows
    // (Assuming Skip header if Row 0 is a title)
    let dataStartIndex = (rows[0]?.children?.length === 1 && rows[0]?.textContent.trim().toLowerCase().includes('filter')) ? 1 : 0;

    const data = {
      years: extractFromRow(yearsRow || rows[dataStartIndex]),
      months: extractFromRow(monthsRow || rows[dataStartIndex + 1]),
      tags: extractFromRow(tagsRow || rows[dataStartIndex + 2]),
      subCategories: extractFromRow(catsRow || rows[dataStartIndex + 3]),
    };

    block.dataset.decorated = 'true';
    block.innerHTML = '';

    setSharedData('pressFilters', data);

    window.dispatchEvent(
      new CustomEvent('press-filters-ready', { detail: data })
    );
  } catch (error) {
    console.error('Error decorating filter-by block:', error);
  }
}

