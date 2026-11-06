import { catalogRecords, detailUrl, loadCatalog, searchText, statuses, types } from './cosmetic-catalog-data.js';

const root = document.querySelector('#catalog-root');
const escape = value => String(value ?? '').replace(/[&<>"']/g, char =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const safeUrl = value => /^(https:\/\/|(?:\.\/)?assets\/)[^\s]+$/i.test(value ?? '') ? value : '';
const normalize = value => String(value ?? '').normalize('NFKC').toLocaleLowerCase();
const name = record => escape(record.item.name);
const href = record => escape(detailUrl(record.type, record.item.id));
const internalLink = record => `<a href="${href(record)}">${name(record)}</a>`;
const externalLink = (url, label) => safeUrl(url)
  ? `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)} ↗</a>`
  : '';

function media(record, large = false, explicitImage = null) {
  const { item, type } = record;
  const representative = record.products.find(product => product.item.images?.length)?.item;
  const candidate = explicitImage || item.images?.[0] || item.logo || item.heroImage ||
    (type === 'series' || type === 'brand' ? representative?.images?.[0] : null);
  const src = safeUrl(typeof candidate === 'string' ? candidate : candidate?.src);
  const alt = candidate?.alt || item.name;
  return `<div class="catalog-media catalog-media--${type}">
    <span class="catalog-placeholder" aria-hidden="true">${escape((item.nameEn || item.name).slice(0, 2).toUpperCase())}</span>
    ${src ? `<img src="${escape(src)}" alt="${escape(alt)}" loading="${large ? 'eager' : 'lazy'}" referrerpolicy="no-referrer">` : ''}
  </div>`;
}

function badges(record) {
  const keys = [...new Set(record.evidence.map(entry => entry.tag))];
  return keys.map(key => `<span class="catalog-badge" data-status="${key}">${statuses[key]}</span>`).join('');
}

function card(record) {
  const { type, item, parent } = record;
  const meta = type === 'group' ? `${item.country} · ${record.children.length} 个已收录品牌`
    : [parent?.item.name, item.category || item.positioning].filter(Boolean).join(' · ');
  const description = type === 'group' ? item.description : type === 'brand' || type === 'series' ? item.description : '';
  const categories = type === 'group' ? [...new Set(record.children.flatMap(({ item: brand }) => brand.categories ?? []))] : [];
  return `<a class="catalog-card" data-kind="${type}" href="${href(record)}">
    ${media(record)}
    <div class="catalog-card-copy">
      <p class="catalog-meta">${types[type][1]} · ${escape(meta)}</p>
      <h3>${name(record)}</h3>
      ${description ? `<p class="catalog-card-description">${escape(description)}</p>` : ''}
      ${type === 'group' ? `<p class="catalog-meta">已收录品牌 ${record.children.map(name).join('、') || '待补充'}</p>` : ''}
      <div class="catalog-badges">${categories.slice(0, 4).map(category => `<span class="catalog-badge">${escape(category)}</span>`).join('')}${badges(record)}</div>
      <span class="catalog-card-open" aria-hidden="true">查看详情 →</span>
    </div>
  </a>`;
}

const grid = records => `<div class="catalog-grid">${records.map(card).join('')}</div>`;
const distinct = items => [...new Set(items.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-Hans'));
const option = (value, label = value) => `<option value="${escape(value)}">${escape(label)}</option>`;
const section = (title, content) => `<section class="catalog-section"><h2>${escape(title)}</h2>${content}</section>`;
const empty = message => `<p class="catalog-empty">${escape(message)}</p>`;
const fact = (label, value) => value ? `<div><dt>${escape(label)}</dt><dd>${value}</dd></div>` : '';
const list = values => values?.length ? `<ul>${values.map(value => `<li>${escape(value)}</li>`).join('')}</ul>` : '';

function overview({ all, records }) {
  const groups = [...records.group.values()];
  const brands = [...records.brand.values()];
  const products = [...records.product.values()];
  const categories = distinct(products.map(({ item }) => item.category));
  const functions = distinct(products.flatMap(({ item }) => item.functionTags ?? []));
  const fields = [
    ['country', '总部国家／地区', distinct(groups.map(({ item }) => item.country)).map(value => option(value))],
    ['group', '所属集团', groups.map(({ item }) => option(item.id, item.name))],
    ['brand', '品牌', brands.map(({ item }) => option(item.id, item.name))],
    ['category', '产品类别', categories.map(value => option(value))],
    ['benefit', '功效标签', functions.map(value => option(value))],
    ['position', '品牌定位', distinct(brands.map(({ item }) => item.positioning)).map(value => option(value))],
    ['status', '产品状态', Object.entries(statuses).map(([key, label]) => option(key, label))],
    ['type', '结果类型', Object.entries(types).map(([key, [, label]]) => option(key, label))],
  ];
  root.innerHTML = `<section id="brands" class="catalog-section catalog-overview">
    <div class="catalog-counts">${Object.entries(types).map(([type, [, label]]) => `<span><strong>${records[type].size}</strong> ${label}</span>`).join('')}</div>
    <p class="catalog-meta">数量按图鉴已收录资料统计。国家筛选使用集团总部所在地，品牌创立地单独记录。</p>
    <form class="catalog-filters" role="search" aria-label="化妆品图鉴检索">
      <label class="catalog-query">全局检索<input name="q" type="search" placeholder="搜索集团、品牌、系列或单品" autocomplete="off"></label>
      <div class="catalog-filter-grid">
        ${fields.map(([key, label, options]) => `<label>${label}<select name="${key}">${option('', '全部')}${options.join('')}</select></label>`).join('')}
      </div>
      <button class="catalog-button" type="reset">清空筛选</button>
    </form>
    <div class="catalog-results-heading"><h2>集团总览</h2><p role="status" aria-live="polite"></p></div>
    <div class="catalog-results"></div>
    <button class="catalog-button catalog-more" type="button" hidden>显示更多</button>
  </section>`;
  const form = root.querySelector('form');
  const params = new URLSearchParams(location.search);
  const keys = ['q', ...fields.map(([key]) => key)];
  for (const key of keys) form.elements.namedItem(key).value = params.get(key) ?? '';
  const results = root.querySelector('.catalog-results');
  const heading = root.querySelector('.catalog-results-heading');
  const more = root.querySelector('.catalog-more');
  let limit = 24;
  const indexed = all.map(record => ({ record, text: normalize(searchText(record)) }));

  function render() {
    const filters = Object.fromEntries(new FormData(form));
    const words = normalize(filters.q).trim().split(/\s+/).filter(Boolean);
    const defaultView = !Object.values(filters).some(value => value.trim());
    const groupOnly = !words.length && !filters.type && !filters.brand && !filters.position &&
      !filters.category && !filters.benefit && !filters.status;
    const matched = indexed.filter(({ record, text }) => {
      if (groupOnly && record.type !== 'group') return false;
      if (filters.type && filters.type !== record.type) return false;
      if (filters.country && record.group?.country !== filters.country) return false;
      if (filters.group && record.group?.id !== filters.group) return false;
      if (!words.every(word => text.includes(word))) return false;
      if (!(filters.brand || filters.position || filters.category || filters.benefit || filters.status)) return true;
      const matchesBrand = brand => (!filters.brand || brand?.id === filters.brand) &&
        (!filters.position || brand?.positioning === filters.position);
      if (!filters.category && !filters.benefit && !filters.status) {
        return record.type === 'group' ? record.children.some(child => matchesBrand(child.item)) : matchesBrand(record.brand);
      }
      return record.products.some(product =>
        matchesBrand(product.brand) &&
        (!filters.category || product.item.category === filters.category) &&
        (!filters.benefit || product.item.functionTags?.includes(filters.benefit)) &&
        (!filters.status || product.evidence.some(entry => entry.tag === filters.status)));
    }).map(({ record }) => record);
    heading.querySelector('h2').textContent = defaultView || groupOnly ? '集团总览' : '检索结果';
    heading.querySelector('[role=status]').textContent = `${matched.length} 项`;
    results.innerHTML = matched.length ? grid(matched.slice(0, limit))
      : empty('没有符合这组条件的记录。可以清空一项筛选，或试试品牌的中英文名称。');
    more.hidden = matched.length <= limit;
    for (const key of keys) {
      if (filters[key].trim()) params.set(key, filters[key].trim());
      else params.delete(key);
    }
    history.replaceState(history.state, '', location.pathname + (params.size ? '?' + params : '') + location.hash);
  }
  form.addEventListener('input', () => { limit = 24; render(); });
  form.addEventListener('submit', event => { event.preventDefault(); render(); });
  form.addEventListener('reset', event => {
    event.preventDefault();
    for (const key of keys) form.elements.namedItem(key).value = '';
    limit = 24;
    render();
  });
  more.addEventListener('click', () => { limit += 24; render(); });
  render();
}

function sources(record) {
  const { item } = record;
  const links = (item.sources ?? []).map(source => externalLink(source.url, source.label)).filter(Boolean);
  const images = [item.logo, item.heroImage, ...(item.images ?? [])].filter(image => image?.sourceUrl);
  for (const image of images) {
    const link = externalLink(image.sourceUrl, image.sourceLabel || '图片来源');
    if (link && !links.includes(link)) links.push(link);
  }
  return section('来源与核验', (links.length ? `<ul>${links.map(link => `<li>${link}</li>`).join('')}</ul>` : empty('来源待补充。')) +
    (item.lastVerifiedAt ? `<p>核验日期 <time>${escape(item.lastVerifiedAt)}</time></p>` : ''));
}

function productEvidence(record) {
  return section('产品状态与依据', record.evidence.length
    ? `<ul class="catalog-evidence">${record.evidence.map(entry =>
      `<li><strong>${statuses[entry.tag]}</strong> · <time>${escape(entry.date)}</time> · ${externalLink(entry.url, entry.label || entry.type || '证据')} ${entry.market ? `<span>${escape(entry.market)}</span>` : ''}</li>`).join('')}</ul>`
    : empty('品牌经典、官方主推、市场热门和新品标签的依据待核实。'));
}

function highlights(record) {
  const featured = record.products.filter(product => product.evidence.length);
  const undecided = Object.values(statuses).filter(label => !featured.some(product =>
    product.evidence.some(entry => statuses[entry.tag] === label)));
  return section('明星与热门产品',
    (featured.length ? grid(featured) : empty('暂无带有可追溯状态标签的单品。')) +
    (undecided.length ? `<p class="catalog-meta">当前缺少可核验记录 · ${undecided.join('、')}</p>` : ''));
}

function seriesDirectory(record) {
  const items = record.children;
  const categories = distinct(items.flatMap(({ item }) => Array.isArray(item.category) ? item.category : [item.category]));
  return section('已收录系列目录', items.length ? `
    <label class="catalog-series-filter">按品类筛选<select id="catalog-series-category">${option('', '全部品类')}${categories.map(category => option(category)).join('')}</select></label>
    <div id="catalog-series-results">${grid(items)}</div>` : empty('系列资料待补充。'));
}

function productFacts(item) {
  let hasPrice = false;
  const sizes = (item.variants ?? []).map(variant => {
    if (typeof variant === 'string') return escape(variant);
    const price = variant.price;
    const value = price && typeof price === 'object' ? price : variant;
    const amount = value.amount ?? (typeof price === 'number' || typeof price === 'string' ? price : undefined);
    const date = value.date || value.asOf || value.verifiedAt;
    const market = value.market || value.region || variant.market;
    const priceSource = value.url || value.sourceUrl || variant.sourceUrl;
    const priced = amount != null && value.currency && market && date && safeUrl(priceSource);
    hasPrice ||= Boolean(priced);
    return [escape(variant.size || variant.name), priced
      ? `${escape(`${value.kind || '官方价格'} ${amount} ${value.currency} · ${market} · ${date}`)} ${externalLink(priceSource, '价格来源')}`
      : ''].filter(Boolean).join(' · ');
  }).filter(Boolean);
  return [
    fact('主要功效／产品用途', list(item.benefits) || '待核实'),
    fact('核心成分', list(item.ingredients) || '待核实'),
    fact('适合肤质或需求', list(item.skinTypes) || '待核实'),
    fact('使用方法', escape(item.usage) || '待核实'),
    fact('规格与容量', sizes.length ? `<ul>${sizes.map(size => `<li>${size}</li>`).join('')}</ul>` : '待核实'),
    fact('官方价格', hasPrice ? '见对应规格及其市场、日期和来源。' : '待核实'),
  ].join('');
}

function detail(data, { records }) {
  const params = new URLSearchParams(location.search);
  const type = params.get('type');
  const record = Object.hasOwn(types, type) && records[type].get(params.get('id'));
  if (!record) {
    root.innerHTML = empty('没有找到这条图鉴记录。可以返回总览重新搜索。');
    return;
  }
  const { item, parent } = record;
  document.title = `${item.name} | 化妆品图鉴 · Spike Hsu`;
  const company = (data.companies ?? []).find(entry => entry.id === item.companyId);
  const facts = [
    fact(type === 'group' ? '总部国家／地区' : '品牌创立地', escape(type === 'group' ? item.country : item.originCountry)),
    fact('成立时间', escape(item.founded)),
    fact('总部所在地', escape(item.headquarters)),
    fact('品牌定位', escape(item.positioning)),
    fact('产品类别', escape(item.category || item.categories?.join('、'))),
    fact('所属集团', type !== 'group' && record.path[0].type === 'group' ? internalLink(record.path[0]) : ''),
    fact('所属品牌', record.path.find(node => node.type === 'brand' && node !== record) ? internalLink(record.path.find(node => node.type === 'brand')) : ''),
    fact('所属系列', type === 'product' && parent ? internalLink(parent) : ''),
    fact('关联公司', company ? escape(company.name) : ''),
    fact('目标需求', escape(Array.isArray(item.audience) ? item.audience.join('、') : item.audience)),
    fact('官方链接', externalLink(item.officialUrl || item.website, '打开官网')),
  ].join('');
  const mainMedia = type === 'product' && item.images?.length > 1
    ? `<div class="catalog-gallery">${item.images.map((image, index) => media(record, index === 0, image)).join('')}</div>`
    : media(record, true);
  root.innerHTML = `
    <nav class="catalog-crumbs" aria-label="当前位置">
      <a href="cosmetic.html">Cosmetic</a><a href="cosmetic-brands.html">全球图鉴</a>
      ${record.path.slice(0, -1).map(internalLink).join('')}<span aria-current="page">${name(record)}</span>
    </nav>
    <header class="catalog-detail-hero" data-kind="${type}">
      ${mainMedia}
      <div class="catalog-detail-copy">
        <p class="kicker">${types[type][1]} / COSMETIC ATLAS</p>
        <h1>${name(record)}</h1>
        ${item.nameEn && item.nameEn !== item.name ? `<p class="catalog-alt-name">${escape(item.nameEn)}</p>` : ''}
        ${item.description ? `<p>${escape(item.description)}</p>` : ''}
        <div class="catalog-badges">${badges(record)}</div>
        ${facts ? `<dl class="catalog-facts">${facts}</dl>` : ''}
      </div>
    </header>`;
  if (type === 'group') {
    const companies = (data.companies ?? []).filter(entry => entry.parentGroupId === item.id);
    root.insertAdjacentHTML('beforeend', section('旗下已收录品牌', record.children.length ? grid(record.children) : empty('品牌资料待补充。')));
    if (companies.length) root.insertAdjacentHTML('beforeend', section('已核实的子公司／法律实体', `<ul>${companies.map(entry =>
      `<li>${escape(entry.name)} · ${escape(entry.country)} ${externalLink(entry.website || entry.sources?.[0]?.url, '官方资料')}</li>`).join('')}</ul>`));
    root.insertAdjacentHTML('beforeend', highlights(record) +
      section('集团已收录单品', record.products.length ? grid(record.products) : empty('产品资料待补充。')));
  } else if (type === 'brand') {
    root.insertAdjacentHTML('beforeend', highlights(record) + seriesDirectory(record));
    root.querySelector('#catalog-series-category')?.addEventListener('change', event => {
      const selected = event.target.value;
      const series = record.children.filter(({ item }) => !selected || [item.category].flat().includes(selected));
      root.querySelector('#catalog-series-results').innerHTML = series.length ? grid(series) : empty('这个类别暂无已收录系列。');
    });
  } else if (type === 'series') {
    root.insertAdjacentHTML('beforeend', section('系列内已收录单品', record.children.length ? grid(record.children) : empty('系列单品待补充。')) + highlights(record));
  } else {
    root.insertAdjacentHTML('beforeend', section('产品资料', `<dl class="catalog-facts">${productFacts(item)}</dl>`) + productEvidence(record));
    const siblings = parent?.children.filter(child => child !== record) ?? [];
    if (siblings.length) root.insertAdjacentHTML('beforeend', section('同系列其他单品', grid(siblings)));
  }
  root.insertAdjacentHTML('beforeend', sources(record));
}

root.addEventListener('error', event => {
  if (event.target instanceof HTMLImageElement) event.target.hidden = true;
}, true);

async function init() {
  root.innerHTML = '<p role="status">正在加载图鉴…</p>';
  try {
    const data = await loadCatalog();
    const index = catalogRecords(data);
    if (root.dataset.view === 'detail') detail(data, index);
    else overview(index);
  } catch (error) {
    console.error(error);
    root.innerHTML = '<p role="alert">图鉴暂时无法加载。</p><button type="button" class="catalog-button">重试</button>';
    root.querySelector('button').addEventListener('click', init, { once: true });
  }
}

init();
