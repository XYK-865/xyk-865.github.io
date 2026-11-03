// The selected wide layout is the default in HTML; keep earlier comparison links usable.
(() => {
  const variant = new URLSearchParams(location.search).get('hero');
  if (!['wide', 'compact'].includes(variant)) return;
  const hero = document.querySelector('.personal-shelf-hero');
  if (!hero) return;
  hero.classList.remove('shelf-layout-wide', 'shelf-layout-compact');
  hero.classList.add('shelf-layout-' + variant);
  hero.querySelector('.personal-shelf-background').src = variant === 'wide'
    ? 'assets/books/snow-reading-landscape-v2.webp'
    : 'assets/books/snow-reading-background.webp';
})();
