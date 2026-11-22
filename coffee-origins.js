import {esc, link, load} from './learning-store.js';

const content = document.querySelector('#origin-content');
const journal = 'coffee.html';

function sources(items) {
  return '<ul class="origin-sources">' + items.map(([label, url]) => '<li>' + link(url, label) + '</li>').join('') + '</ul>';
}

function renderRegion(region) {
  return `<article class="learning-card origin-region" id="region-${esc(region.id)}">
    <h3>${esc(region.name)}</h3>
    <p class="origin-roman" lang="${esc(region.language || 'en')}">${esc(region.label)}</p>
    <dl>
      <dt>豆种与品种</dt><dd>${esc(region.varieties)}</dd>
      <dt>风味线索</dt><dd>${esc(region.profile)}</dd>
      <dt>对照着喝</dt><dd>${esc(region.compare)}</dd>
    </dl>
  </article>`;
}

function renderCountry(country) {
  const recordUrl = country.journalBeanId
    ? journal + '?bean=' + encodeURIComponent(country.journalBeanId) + '#coffee-records'
    : journal + '?write=1#coffee-records';
  return `<section id="origin-${esc(country.id)}" class="beverage-section origin-country" aria-labelledby="title-${esc(country.id)}">
    <div class="beverage-section-head origin-country-header">
      <p class="kicker" lang="en">${esc(country.label)}</p>
      <h2 id="title-${esc(country.id)}">${esc(country.name)}</h2>
      <p>${esc(country.summary)}</p>
    </div>
    <div class="beverage-layout origin-regions">${country.regions.map(renderRegion).join('')}</div>
    <div class="origin-notes">
      <h3>怎么选一包</h3>
      <p>${esc(country.choose)}</p>
      <p><a class="origin-text-link" href="${esc(recordUrl)}">记下这杯咖啡 →</a></p>
    </div>
    ${sources(country.sources)}
  </section>`;
}

function render(data) {
  content.innerHTML = `<nav class="learning-nav beverage-nav" aria-label="咖啡产地">
    <a href="#origin-compare">产区对照</a>
    ${data.countries.map(country => `<a href="#origin-${esc(country.id)}">${esc(country.name)}</a>`).join('')}
    <a href="#origin-labels">读懂豆袋</a>
  </nav>
  <section id="origin-compare" class="beverage-section" aria-labelledby="origin-compare-title">
    <div class="beverage-section-head"><h2 id="origin-compare-title">按想喝到的风味选产区</h2></div>
    <ul class="origin-compare-list">${data.countries.map(country => `<li><a href="#origin-${esc(country.id)}"><strong>${esc(country.name)} →</strong><span>${esc(country.pick)}</span></a></li>`).join('')}</ul>
    <p class="origin-tip">风味是产区介绍或具体批次常见的线索，品种、处理、烘焙和冲煮都会改变结果。想比较产区，先选烘焙深浅相近、处理法相同的样本。</p>
  </section>
  ${data.countries.map(renderCountry).join('')}
  <section id="origin-labels" class="beverage-section origin-country" aria-labelledby="origin-labels-title">
    <div class="beverage-section-head"><h2 id="origin-labels-title">读懂豆袋</h2></div>
    <div class="beverage-layout origin-regions">${data.labelGuide.map(([term, explanation]) => `<article class="learning-card"><h3>${esc(term)}</h3><p>${esc(explanation)}</p></article>`).join('')}</div>
    ${sources(data.sources)}
  </section>`;
  content.removeAttribute('aria-busy');
  // Direct country links arrive before the data-backed anchors exist.
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior: 'instant'});
}

function start() {
  content.setAttribute('aria-busy', 'true');
  load('coffee-origins-data.json', data => data).then(render).catch(() => {
    content.removeAttribute('aria-busy');
    content.innerHTML = '<p role="status">暂时无法读取产地资料。</p><button type="button">重新加载</button>';
    content.querySelector('button').addEventListener('click', start, {once: true});
  });
}

start();
