import {esc, link, load, failure} from './learning-store.js';

const guide = document.querySelector('#coffee-guide');
const grid = html => `<div class="learning-grid">${html}</div>`;
const card = (title, body, id = '') => `<article class="learning-card"${id ? ` id="${esc(id)}"` : ''}><h3>${esc(title)}</h3>${body}</article>`;
const section = (id, title, intro, body) => `<section class="daily-chapter beverage-section" id="${id}" aria-labelledby="${id}-title">
  <div class="beverage-section-head coffee-guide-heading"><h2 id="${id}-title">${title}</h2><p>${intro}</p></div>${body}</section>`;
const line = (label, content) => `<p><strong>${label}</strong> ${esc(content)}</p>`;
const groups = {all: '全部饮品', black: '黑咖啡', milk: '奶咖'};
const originLinks = new Set(['ethiopia', 'colombia', 'brazil']);

function referenceList(sources) {
  return `<p class="coffee-guide-references">${sources.map(({label, url}) => link(url, label)).join('')}</p>`;
}

function guideCard(entry, type, body) {
  const {id, title, summary, alt, imageCaption} = entry;
  return `<article class="beverage-card coffee-guide-card" id="${type}-${esc(id)}">
    <figure class="beverage-photo">
      <img src="assets/beverages/${type}-${esc(id)}.webp" alt="${esc(alt)}" loading="lazy" decoding="async">
      <figcaption>${esc(imageCaption)}</figcaption>
    </figure>
    <div class="beverage-card-copy">
      <h3>${esc(title)}</h3>
      <p>${esc(summary)}</p>
      ${body}
    </div>
  </article>`;
}

function brewDirectory(brews) {
  return `<nav class="coffee-guide-shortcuts" aria-label="选择冲煮方法">
    ${brews.map(({id, title}) => `<a href="#brew-${esc(id)}">${esc(title)}</a>`).join('')}
  </nav>
  <div class="beverage-grid coffee-brew-grid">${brews.map(brew => guideCard(brew, 'brew', `
    ${line('器具', brew.tools)}
    <p class="coffee-recipe-amount"><strong>一杯起始参数</strong><br>${esc(brew.recipe)}</p>
    <details class="beverage-details"><summary>分步骤操作与调整</summary>
      <ol class="coffee-brew-steps">${brew.steps.map(({title, detail}) => `<li><strong>${esc(title)}</strong><span>${esc(detail)}</span></li>`).join('')}</ol>
      <dl class="coffee-guide-facts">${brew.adjustments.map(({label, detail}) => `<div><dt>${esc(label)}</dt><dd>${esc(detail)}</dd></div>`).join('')}</dl>
      ${referenceList(brew.sources)}
    </details>`)).join('')}</div>`;
}

function gearDirectory(gear) {
  const labels = ['使用什么', '主要控制'];
  const comparisons = `<div class="coffee-compare"><table>
    <thead><tr><th scope="col">设备</th>${labels.map(label => `<th scope="col">${label}</th>`).join('')}</tr></thead>
    <tbody>${gear.map(item => `<tr><th scope="row"><a href="#gear-${esc(item.id)}">${esc(item.title)}</a></th>${
      [item.compareType, item.compareControl].map((value, index) => `<td data-label="${labels[index]}">${esc(value)}</td>`).join('')
    }</tr>`).join('')}</tbody>
    </table></div>`;
  return `<details class="learning-card coffee-comparison"><summary>快速比较设备</summary>${comparisons}</details>
    <div class="beverage-grid coffee-gear-grid">${gear.map(item => guideCard(item, 'gear', `
      <dl class="coffee-guide-facts"><div><dt>适合</dt><dd>${esc(item.uses)}</dd></div></dl>
      <details class="beverage-details"><summary>工作原理、取舍与清洁</summary>
        <dl class="coffee-guide-facts">
          <div><dt>工作原理</dt><dd>${esc(item.mechanism)}</dd></div>
          <div><dt>可调范围</dt><dd>${esc(item.controls)}</dd></div>
          <div><dt>日常取舍</dt><dd>${esc(item.tradeoff)}</dd></div>
          <div><dt>清洁维护</dt><dd>${esc(item.care)}</dd></div>
        </dl>
        ${referenceList(item.sources)}
      </details>`)).join('')}</div>`;
}

function recipeSteps({tools, steps, tip, source, url}) {
  const sourceUrl = url.startsWith('#') ? `coffee.html${url}` : url;
  return `${line('器具', tools)}
    <ol>${steps.map(step => `<li>${esc(step)}</li>`).join('')}</ol>
    ${line('调整', tip)}<p class="beverage-source">${link(sourceUrl, source)}</p>`;
}

function recipeCard(recipe, [id, title, , taste]) {
  const variants = recipe.variants.map(variant => `<section class="coffee-variant learning-card" id="recipe-${esc(variant.id)}">
    <p class="beverage-tag">${variant.temperature === 'iced' ? '冰饮' : '热饮'}</p>
    <h4>${esc(variant.title)} <span class="beverage-card-meta" lang="en">${esc(variant.name)}</span></h4>
    ${variant.image ? `<figure class="beverage-photo"><img src="${esc(variant.image)}" alt="${esc(variant.title)}示意图" loading="lazy" decoding="async"></figure>` : ''}
    ${line('一杯用量', variant.amount)}${recipeSteps(variant)}</section>`).join('');
  return `<article class="beverage-card" data-coffee-group="${esc(recipe.group)}" id="recipe-${esc(id)}">
    <img class="beverage-photo" src="assets/beverages/${esc(id)}.webp" alt="${esc(title)}示意图" loading="lazy" decoding="async">
    <div class="beverage-card-copy">
      <p class="beverage-tag">${esc(groups[recipe.group])}</p>
      <h3>${esc(title)}</h3><p class="beverage-card-meta" lang="en">${esc(recipe.name)}</p>
      <p>${esc(taste)}</p>
      <p class="coffee-recipe-amount"><strong>经典版 · 一杯用量</strong><br>${esc(recipe.amount)}</p>
      <details class="coffee-recipe-body"><summary>经典版步骤</summary>${recipeSteps(recipe)}</details>
      ${variants ? `<details class="coffee-recipe-body"><summary>${recipe.variants.length} 种做法变化</summary>${variants}</details>` : ''}
    </div></article>`;
}

function recipeDirectory(data) {
  const cols = ['主要成分', '口感', '浓淡与奶感', '怎么区分'];
  const drinks = `<div class="coffee-compare"><table><thead><tr><th scope="col">饮品</th>${cols.map(c => `<th scope="col">${c}</th>`).join('')}</tr></thead>
    <tbody>${data.drinks.map(([id, title, ...cells]) => `<tr id="drink-${esc(id)}"><th scope="row">${esc(title)}</th>${cells.map((cell, index) => `<td data-label="${cols[index]}">${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const recipes = data.drinkRecipes.map(recipe => recipeCard(recipe, data.drinks.find(drink => drink[0] === recipe.id)));
  return `<div class="beverage-controls">
      <div role="group" aria-label="筛选饮品">${Object.entries(groups).map(([id, label]) =>
        `<button type="button" data-coffee-filter="${id}" aria-pressed="${id === 'all'}" aria-controls="coffee-recipe-list">${label}</button>`).join('')}</div>
      <p id="coffee-recipe-count" role="status">${recipes.length} 种饮品</p>
    </div>
    <div id="coffee-recipe-list" class="beverage-grid coffee-recipe-list">${recipes.join('')}</div>
    <details class="learning-card coffee-comparison"><summary>比较这些经典咖啡</summary>${drinks}</details>`;
}

function setupRecipeNavigation() {
  const filters = [...guide.querySelectorAll('[data-coffee-filter]')];
  const recipes = [...guide.querySelectorAll('[data-coffee-group]')];
  const count = guide.querySelector('#coffee-recipe-count');
  function filter(group) {
    for (const button of filters) button.setAttribute('aria-pressed', String(button.dataset.coffeeFilter === group));
    for (const recipe of recipes) recipe.hidden = group !== 'all' && recipe.dataset.coffeeGroup !== group;
    count.textContent = `${recipes.filter(recipe => !recipe.hidden).length} 种饮品`;
  }
  for (const button of filters) button.addEventListener('click', () => filter(button.dataset.coffeeFilter));

  function revealHash() {
    const target = document.getElementById(location.hash.slice(1));
    if (!target || (!guide.contains(target) && target.id !== 'coffee-records')) return;
    if (target.closest('[data-coffee-group][hidden]')) filter('all');
    for (let disclosure = target.parentElement.closest('details'); disclosure; disclosure = disclosure.parentElement.closest('details')) {
      disclosure.open = true;
    }
    target.scrollIntoView({behavior: 'instant'});
  }
  window.addEventListener('hashchange', revealHash);
  revealHash();
}

function render(data) {
  const beanCards = data.beans.map(([id, title, definition, taste]) => card(title,
    `<p>${esc(definition)}</p>${line('风味倾向', taste)}
    ${originLinks.has(id) ? `<p><a href="coffee-origins.html#origin-${id}">查看产区与品种 →</a></p>` : ''}
    <p><a href="?bean=${encodeURIComponent(id)}#coffee-records">用这条资料记一杯 →</a></p>`, 'bean-' + id)).join('');
  const beans = `<p><a class="beverage-action" href="coffee-origins.html">打开产地图鉴 →</a></p>
    <details class="learning-card coffee-comparison"><summary>查豆袋术语与记录标签</summary>${grid(beanCards)}</details>`;
  const books = data.books.map(book => card(book.title, `<p>${esc(book.author)} · ${esc(book.publisher)}</p><p>${esc(book.note)}</p>
    <ul>${book.editions.map(edition => `<li>${link(edition.url, edition.title)} · ISBN ${esc(edition.isbn)}</li>`).join('')}</ul>
    <form class="coffee-book-notes" data-book="${esc(book.id)}">
      <label>我的读书笔记（保存在当前浏览器）<textarea rows="3" maxlength="10000" placeholder="页码、观点，或者想试的冲煮配方"></textarea></label>
      <button type="submit">保存笔记</button> <small role="status"></small>
    </form>`)).join('');
  guide.innerHTML = section('coffee-drinks', '咖啡饮品', '先选想喝的口味，再展开经典步骤或冰饮变化。用量按一杯的家用起点整理，参考链接提供原做法。饮品配图为 AI 生成的外观示意。', recipeDirectory(data))
    + section('coffee-brews', '冲煮方法', '先在图中找到关键动作，再展开步骤照着做。参数适合作为第一杯的起点，品尝后每次调整一项。图片为 AI 操作示意。', brewDirectory(data.brews))
    + section('coffee-beans', '<a href="coffee-origins.html">咖啡豆与产地</a>', '从产区找典型品种，对照风味与选豆线索。手里已有豆袋时，可以查下方的品种和处理法，再关联到咖啡记录。', beans)
    + section('coffee-gear', '咖啡机与器具', '用对照表看设备吃什么料、能调什么，再展开卡片了解工作原理和清洁。图片为 AI 器具示意。', gearDirectory(data.gear))
    + section('coffee-books', '咖啡书架', '对照出版社的版本信息，在同一处记下读书笔记。', books)
    + `<details class="learning-card"><summary>参考资料</summary><ul>${data.sources.map(([label, url]) => `<li>${link(url, label)}</li>`).join('')}</ul></details>`;

  const select = document.querySelector('#coffee-bean');
  for (const [id, title] of data.beans) select.add(new Option(title, id));
  const bean = new URLSearchParams(location.search).get('bean');
  if (data.beans.some(([id]) => id === bean)) {
    select.value = bean;
    document.querySelector('#coffee-editor').open = true;
  }
  for (const form of guide.querySelectorAll('[data-book]')) {
    const key = 'spike-coffee-book-note-v1:' + form.dataset.book;
    const field = form.querySelector('textarea');
    const status = form.querySelector('[role=status]');
    try { field.value = localStorage.getItem(key) || ''; }
    catch { status.textContent = '无法读取本机笔记。'; }
    form.addEventListener('submit', event => {
      event.preventDefault();
      try {
        localStorage.setItem(key, field.value);
        status.textContent = '已保存。';
      } catch { status.textContent = '当前浏览器无法保存。'; }
    });
  }
  setupRecipeNavigation();
}

function start() {
  load('coffee-data.json', data => data).then(render).catch(error => {
    console.error(error);
    failure(guide, start);
  });
}
start();
