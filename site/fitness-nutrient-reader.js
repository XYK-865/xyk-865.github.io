const article = document.querySelector('[data-nutrient-content]');
const outline = document.querySelector('[data-nutrient-outline]');
const navigation = document.querySelector('[data-nutrient-toc]');

if (article && outline && navigation) {
  const desktop = matchMedia('(min-width: 851px)');
  const top = document.querySelector('#nutrient-top');
  const reader = article.closest('main');
  const stickyOutline = outline.closest('.nutrient-reader-toc');
  const header = document.querySelector('#site-header');
  const progress = document.createElement('progress');
  progress.className = 'nutrient-reader-progress';
  progress.dataset.nutrientProgress = '';
  progress.setAttribute('aria-label', '文章阅读进度');
  progress.max = 100;
  progress.value = 0;

  const backToTop = document.createElement('a');
  backToTop.href = '#' + top.id;
  backToTop.className = 'nutrient-back-to-top';
  backToTop.textContent = '↑ 顶部';
  backToTop.hidden = true;
  reader.append(backToTop, progress);

  const sections = document.createElement('ol');
  let sectionItem;
  let subList;
  let subheadingIndex = 0;
  const headings = [...article.querySelectorAll('h2, h3')].map(heading => {
    const item = document.createElement('li');
    if (heading.tagName === 'H2') {
      sectionItem = item;
      subList = null;
      subheadingIndex = 0;
      sections.append(item);
    } else {
      if (!subList) {
        subList = document.createElement('ol');
        (sectionItem ?? sections).append(subList);
      }
      subList.append(item);
    }
    if (!heading.id) {
      const parentId = sectionItem?.querySelector('a')?.hash.slice(1) ?? 'nutrient-section';
      heading.id = parentId + '-topic-' + ++subheadingIndex;
    }
    const link = document.createElement('a');
    link.href = '#' + heading.id;
    link.textContent = heading.textContent.trim();
    item.prepend(link);
    return { heading, link };
  });
  navigation.replaceChildren(sections);

  for (const image of article.querySelectorAll('figure img')) {
    if (image.closest('a')) continue;
    const link = document.createElement('a');
    link.className = 'nutrient-reader-figure-link';
    link.href = image.getAttribute('src');
    link.target = '_blank';
    link.rel = 'noopener';
    link.setAttribute('aria-label', '查看原图 · ' + (image.alt || '文章配图'));
    image.before(link);
    link.append(image);
  }

  const syncOutline = () => { outline.open = desktop.matches; };
  desktop.addEventListener('change', syncOutline);
  syncOutline();
  navigation.addEventListener('click', event => {
    if (!desktop.matches && event.target.closest('a')) outline.open = false;
  });

  let currentLink;
  let scheduled = false;
  function updateReadingState() {
    scheduled = false;
    const offset = (header?.getBoundingClientRect().height ?? 72) + 35;
    const bounds = article.getBoundingClientRect();
    const scrollable = Math.max(1, bounds.height - innerHeight + offset);
    const fraction = Math.max(0, Math.min(1, (offset - bounds.top) / scrollable));
    progress.value = Math.round(fraction * 100);
    backToTop.hidden = bounds.top > offset;

    let active = headings[0]?.link;
    for (const { heading, link } of headings) {
      if (heading.getBoundingClientRect().top > offset) break;
      active = link;
    }
    if (!active || active === currentLink) return;
    currentLink?.removeAttribute('aria-current');
    active.setAttribute('aria-current', 'location');
    currentLink = active;

    if (desktop.matches) {
      const area = stickyOutline.getBoundingClientRect();
      const label = active.getBoundingClientRect();
      if (label.bottom > area.bottom - 12) stickyOutline.scrollTop += label.bottom - area.bottom + 12;
      if (label.top < area.top + 12) stickyOutline.scrollTop -= area.top + 12 - label.top;
    }
  }

  function scheduleReadingUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateReadingState);
  }

  window.addEventListener('scroll', scheduleReadingUpdate, { passive: true });
  window.addEventListener('resize', scheduleReadingUpdate);
  window.addEventListener('hashchange', scheduleReadingUpdate);
  new ResizeObserver(scheduleReadingUpdate).observe(article);

  // Section URLs generated for level-three headings are available after the outline is built.
  const fragment = location.hash.slice(1);
  const target = document.getElementById(fragment);
  if (article.contains(target)) target.scrollIntoView({ block: 'start', behavior: 'instant' });
  scheduleReadingUpdate();
}
