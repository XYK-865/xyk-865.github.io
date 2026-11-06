const map = document.querySelector('.person-map');
const core = map.querySelector('.person-core');
const svg = map.querySelector('svg');
const detail = document.querySelector('#person-detail');
const status = document.querySelector('#person-status');
const route = 'personal-os/person-analysis/';

const evidenceTypes = [
  ['已知事实', '有可核对来源、时间和范围的信息。'],
  ['观察记录', '写下在具体情境中看到或听到的内容。'],
  ['个人解释', '标明这是自己的解读，并列出其他可能解释。'],
  ['尚未验证的假设', '写清需要什么证据支持或推翻这个判断。'],
  ['未知信息', '注明信息缺口。涉及隐私时，允许它继续未知。'],
];

function element(tag, text, attributes = {}) {
  const node = document.createElement(tag);
  node.textContent = text;
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
  return node;
}

function section(letter, title, ...children) {
  const card = element('section', '');
  card.append(element('h3', letter + ' · ' + title), ...children);
  return card;
}

function list(tag, entries) {
  const result = element(tag, '');
  for (const entry of entries) {
    const item = element('li', '');
    item.append(entry);
    result.append(item);
  }
  return result;
}

async function readData(filename) {
  const response = await fetch(new URL(filename, import.meta.url));
  if (!response.ok) throw new Error('Data unavailable: ' + filename);
  return response.json();
}

async function readMotherQuestions() {
  const response = await fetch('mother-questions.html');
  if (!response.ok) throw new Error('Mother questions unavailable');
  const source = new DOMParser().parseFromString(await response.text(), 'text/html');
  return new Map([...source.querySelectorAll('.life-question-grid article[id]')].map(article => [
    article.id, article.querySelector('h3').textContent.trim(),
  ]));
}

function knowledgeCard(label, title, href, description) {
  const card = element('div', '', {class: 'person-knowledge-card'});
  card.append(element('span', label), element('a', title, {href}));
  if (description) card.append(element('p', description));
  return card;
}

function branchHref(node) {
  return 'project-branch.html?' + new URLSearchParams({project: node.projectId, branch: node.id});
}

async function init() {
  const [data, structure, questions] = await Promise.all([
    readData('person-analysis.json?v=person-v02-20261105'),
    readData('project-structure.json'),
    readMotherQuestions().catch(() => new Map()),
  ]);
  const dimensions = data.dimensions.filter(item => item.status === 'published');
  const byId = new Map(dimensions.map(item => [item.id, item]));
  const branches = new Map(structure.nodes.map(node => [node.id, node]));
  const posts = new Map((window.SPIKE_POSTS || []).filter(post => post.status === 'published').map(post => [post.href, post]));
  const branchCards = (ids, label) => ids.flatMap(id => {
    const node = branches.get(id);
    return node ? [knowledgeCard(label, node.title, branchHref(node), node.summary)] : [];
  });
  const buttons = new Map();
  const paths = new Map();

  for (const [index, item] of dimensions.entries()) {
    const button = element('button', item.title, {
      type: 'button', class: 'person-node', 'aria-controls': 'person-detail', 'aria-pressed': 'false',
    });
    button.style.setProperty('--node', item.color);
    button.addEventListener('click', () => activate(item.id));
    map.querySelector(index < Math.ceil(dimensions.length / 2) ? '.person-left' : '.person-right').append(button);
    buttons.set(item.id, button);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke', item.color);
    svg.append(path);
    paths.set(item.id, path);
  }

  function drawBranches() {
    const bounds = map.getBoundingClientRect();
    const center = core.getBoundingClientRect();
    const startY = center.top + center.height / 2 - bounds.top - map.clientTop;
    for (const [id, button] of buttons) {
      const node = button.getBoundingClientRect();
      const isLeft = node.right < center.left;
      const startX = (isLeft ? center.left : center.right) - bounds.left - map.clientLeft;
      const endX = (isLeft ? node.right : node.left) - bounds.left - map.clientLeft;
      const endY = node.top + node.height / 2 - bounds.top - map.clientTop;
      const middle = (startX + endX) / 2;
      paths.get(id).setAttribute('d', `M ${startX} ${startY} C ${middle} ${startY}, ${middle} ${endY}, ${endX} ${endY}`);
    }
  }

  function render(id, focus = false) {
    const item = byId.get(id);
    for (const [key, button] of buttons) {
      button.classList.toggle('is-related', Boolean(item?.relatedIds.includes(key)));
      button.setAttribute('aria-pressed', String(key === id));
      paths.get(key).classList.toggle('is-active', key === id);
    }
    detail.hidden = !item;
    status.textContent = item
      ? '已选中「' + item.title + '」。虚线边框标出关联维度。'
      : '选择上方任一节点，查看这个维度的探索问题。';
    if (!item) return;

    const heading = element('h2', item.title, {id: 'person-detail-title', tabindex: '-1'});
    const header = element('header', '', {class: 'person-detail-header'});
    header.append(element('p', item.category + ' · 更新 ' + item.updated, {class: 'kicker'}), heading);

    const evidence = element('dl', '');
    for (const [label, description] of evidenceTypes) {
      evidence.append(element('dt', label), element('dd', description));
    }

    const related = [];
    for (const relation of data.relations) {
      const otherId = relation.source === id ? relation.target : relation.source;
      if (!item.relatedIds.includes(otherId) || (relation.source !== id && relation.target !== id)) continue;
      const other = byId.get(otherId);
      if (!other) continue;
      const entry = element('div', '');
      const link = element('a', other.title, {href: route + '#' + other.id});
      link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
        event.preventDefault();
        activate(other.id);
      });
      entry.append(link, element('p', relation.mechanism + ' ' + relation.boundary));
      related.push(entry);
    }

    const motherQuestions = item.motherQuestionIds.map(id => knowledgeCard(
      '母题 · ' + id, questions.get(id) || '查看母题 ' + id, 'mother-questions.html?view=guide#' + encodeURIComponent(id),
    ));
    const tools = [
      ...branchCards(item.principleIds, '原则'),
      ...branchCards(item.modelIds, '模型与方法'),
    ];
    const reading = [
      ...branchCards(item.domainIds, '人生领域'),
      ...item.references.flatMap(reference => {
        const post = posts.get(reference.postHref);
        return post ? [knowledgeCard('公开文章', post.title, post.href, reference.note)] : [];
      }),
    ];
    const caseReview = element('p', '', {class: 'person-case-review'});
    caseReview.append(
      element('a', '案例组织方法', {href: branchHref(branches.get('os-cases'))}),
      ' · ',
      element('a', '复盘与反例', {href: branchHref(branches.get('os-reviews'))}),
    );

    const grid = element('div', '', {class: 'person-detail-grid'});
    grid.append(
      section('A', '维度介绍', element('p', item.summary)),
      section('B', '核心问题', list('ol', item.prompts)),
      section('C', '认知模型与母题', element('strong', item.method.title), element('p', item.method.summary),
        ...motherQuestions, ...tools),
      section('D', '事实与解释', evidence),
      section('E', '关联维度', related.length ? list('ul', related) : element('p', '这个维度的关联有待补充。')),
      section('F', '延伸阅读与复盘', ...reading, caseReview),
    );
    const back = element('button', '↑ 返回导图', {type: 'button', class: 'life-copy'});
    back.addEventListener('click', () => buttons.get(id).focus());
    header.append(back);
    detail.replaceChildren(header, grid);
    if (focus) {
      heading.focus({preventScroll: true});
      detail.scrollIntoView({block: 'start', behavior: 'instant'});
    }
  }

  function activate(id) {
    if (location.hash !== '#' + id) history.pushState(null, '', location.pathname + location.search + '#' + id);
    render(id, true);
  }

  addEventListener('popstate', () => render(location.hash.slice(1)));
  addEventListener('hashchange', () => render(location.hash.slice(1)));
  drawBranches();
  new ResizeObserver(drawBranches).observe(map);
  render(location.hash.slice(1), byId.has(location.hash.slice(1)));
}

init().catch(error => {
  console.error(error);
  status.textContent = '暂时无法加载分析维度，请刷新页面重试。';
});
