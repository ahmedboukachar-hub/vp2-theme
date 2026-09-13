document.addEventListener('click', (event) => {
  const link = event.target.closest('.designer-filter a');
  if (!link) return;
  const target = new URL(link.href, window.location.origin);
  const current = new URL(window.location.href);
  for (const [key, value] of current.searchParams) {
    if (key === 'sort_by' || (key.startsWith('filter.') && key !== 'filter.p.vendor')) {
      target.searchParams.append(key, value);
    }
  }
  link.href = target.href;
});
