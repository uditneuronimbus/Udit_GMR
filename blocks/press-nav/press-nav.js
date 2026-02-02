async function fetchData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

function getPublishDate() {
  return document
    .querySelector('meta[name="publishDate"]')
    ?.getAttribute('content');
}

export default async function decorate(block) {
  block.classList.add('press-nav');

  const publishDate = getPublishDate();
  if (!publishDate) return;

  const prevUrl = `https://publish-p168597-e1803019.adobeaemcloud.com/graphql/execute.json/GMR/pre-news;publishDate=${publishDate}`;
  const nextUrl = `https://publish-p168597-e1803019.adobeaemcloud.com/graphql/execute.json/GMR/next-news;publishDate=${publishDate}`;

  const [prevData, nextData] = await Promise.all([
    fetchData(prevUrl),
    fetchData(nextUrl),
  ]);

  block.innerHTML = '';

  const prevItem = prevData?.preNews?.items?.[0];
  const nextItem = nextData?.nextNews?.items?.[0];

  // PREV
  const prev = document.createElement('div');
  prev.className = 'press-nav-side prev';

  prev.innerHTML = `
    <a class="nav-btn ${prevItem ? '' : 'disabled'}" ${
      prevItem ? `href="${prevItem._path}"` : ''
    }>
      ← Previous
    </a>
    ${
      prevItem
        ? `
      <div class="nav-hover-card">
        <div class="label">Previous Press Release</div>
        <div class="title">${prevItem.title}</div>
      </div>`
        : ''
    }
  `;

  // NEXT
  const next = document.createElement('div');
  next.className = 'press-nav-side next';

  next.innerHTML = `
    ${
      nextItem
        ? `
      <div class="nav-hover-card">
        <div class="label">Next Press Release</div>
        <div class="title">${nextItem.title}</div>
      </div>`
        : ''
    }
    <a class="nav-btn primary ${nextItem ? '' : 'disabled'}" ${
      nextItem ? `href="${nextItem._path}"` : ''
    }>
      Next →
    </a>
  `;

  block.append(prev, next);
}
