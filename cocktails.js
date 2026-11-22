import {esc, link} from './learning-store.js';

const iba = 'https://iba-world.com/iba-cocktail/';
const classics = [
  {
    id: 'negroni', name: '尼格罗尼', english: 'Negroni',
    spirit: '金酒', method: '杯调', taste: '苦甜、草本',
    ingredients: ['金酒 30 ml', '金巴利 30 ml', '甜红味美思 30 ml'],
    steps: ['预冷古典杯并装入冰块。', '倒入三种酒，轻搅至凉，以半片橙装饰。']
  },
  {
    id: 'old-fashioned', name: '古典', english: 'Old Fashioned',
    spirit: '威士忌', method: '杯调', taste: '甜苦、酒感明显',
    ingredients: ['波本或黑麦威士忌 45 ml', '方糖 1 块', '安哥斯图拉苦精和清水各数滴'],
    steps: ['在古典杯中用苦精和清水润湿方糖，压拌至溶解。', '加冰和威士忌，轻搅。以橙片或橙皮搭配一颗鸡尾酒樱桃。']
  },
  {
    id: 'daiquiri', name: '代基里', english: 'Daiquiri',
    spirit: '朗姆', method: '摇和', taste: '清爽、酸甜',
    ingredients: ['古巴白朗姆 60 ml', '鲜青柠汁 20 ml', '细砂糖 2 吧勺'],
    steps: ['在摇酒壶中混合朗姆、青柠汁和糖，搅到糖溶解。', '加冰摇匀，滤入预冷的鸡尾酒杯。']
  },
  {
    id: 'mojito', name: '莫吉托', english: 'Mojito',
    spirit: '朗姆', method: '杯调', taste: '薄荷、青柠、气泡',
    ingredients: ['古巴白朗姆 45 ml', '鲜青柠汁 20 ml', '薄荷 6 枝', '白蔗糖 2 茶匙', '苏打水适量'],
    steps: ['在高杯中轻拌薄荷、糖和青柠汁，加少量苏打水，再加冰。', '倒入朗姆，以苏打水补满，轻搅后放上薄荷和青柠片。']
  },
  {
    id: 'margarita', name: '玛格丽特', english: 'Margarita',
    spirit: '龙舌兰', method: '摇和', taste: '酸爽、橙香',
    ingredients: ['100% 龙舌兰原料酿制的 Tequila 50 ml', 'Triple Sec 橙味利口酒 20 ml', '鲜青柠汁 15 ml'],
    steps: ['预冷鸡尾酒杯，可在杯沿挂半圈盐。', '把三种液体加冰摇匀，滤入杯中。']
  },
  {
    id: 'espresso-martini', name: '浓缩马天尼', english: 'Espresso Martini',
    spirit: '伏特加', method: '摇和', taste: '咖啡香、甜苦',
    ingredients: ['伏特加 50 ml', 'Kahlúa 咖啡利口酒 30 ml', '糖浆 10 ml', '偏浓的意式浓缩 1 份'],
    steps: ['把所有液体倒入摇酒壶，加入冰块并充分摇匀。', '滤入预冷鸡尾酒杯，以 3 粒咖啡豆装饰。']
  }
];

const variations = [
  {
    id: 'boulevardier', name: '大道酒', english: 'Boulevardier', family: 'negroni',
    spirit: '威士忌', method: '搅拌后滤出',
    comparison: '沿用尼格罗尼的金巴利和甜红味美思，基酒换为威士忌并提高它的比例。',
    ingredients: ['波本或黑麦威士忌 45 ml', '金巴利 30 ml', '甜红味美思 30 ml'],
    steps: ['在调酒杯中加冰搅拌三种酒。', '滤入预冷的鸡尾酒杯，以橙皮或柠檬皮装饰。']
  },
  {
    id: 'americano', name: '美式鸡尾酒', english: 'Americano', family: 'negroni', image: 'americano-cocktail',
    spirit: '金巴利与味美思', method: '杯调',
    comparison: '保留尼格罗尼的两种苦甜配料，用一点苏打水拉长口感。',
    ingredients: ['金巴利 30 ml', '甜红味美思 30 ml', '少量苏打水'],
    steps: ['在装冰的古典杯中倒入金巴利和味美思。', '加少量苏打水，轻搅后放半片橙和柠檬皮。']
  },
  {
    id: 'sazerac', name: '萨泽拉克', english: 'Sazerac', family: 'old-fashioned',
    spirit: '干邑', method: '搅拌后滤出',
    comparison: '和古典一样用方糖与苦精。IBA 版本用干邑和 Peychaud’s 苦精，并用苦艾酒润杯。',
    ingredients: ['干邑 50 ml', '苦艾酒 10 ml（润杯）', '方糖 1 块', 'Peychaud’s 苦精 2 dash（甩两下）'],
    steps: ['用苦艾酒润过预冷古典杯，再放碎冰暂存。', '其余材料放入调酒杯中加冰搅拌。', '倒掉古典杯中的冰和多余苦艾酒，滤入酒液，以柠檬皮装饰。']
  },
  {
    id: 'hemingway-special', name: '海明威特调', english: 'Hemingway Special', family: 'daiquiri',
    spirit: '朗姆', method: '摇和',
    comparison: '延续代基里的朗姆和青柠，加入葡萄柚汁与樱桃利口酒，酸香更有层次。',
    ingredients: ['朗姆 60 ml', '葡萄柚汁 40 ml', 'Luxardo Maraschino 樱桃利口酒 15 ml', '鲜青柠汁 15 ml'],
    steps: ['将全部材料加冰摇匀。', '滤入大号鸡尾酒杯。']
  },
  {
    id: 'lime-mint-soda', name: '青柠薄荷苏打', english: 'Lime & Mint Soda', family: 'mojito',
    spirit: '家用无酒精版', method: '杯调',
    comparison: '取莫吉托的薄荷与青柠做成苏打饮品。用量可按青柠的酸度调整。',
    ingredients: ['鲜青柠汁 20 ml', '糖浆 10 ml', '薄荷叶 6 片', '无糖苏打水约 120 ml', '冰块适量'],
    steps: ['在高杯中轻拌薄荷、青柠汁和糖浆。', '放冰后加苏打水，轻搅即可。'],
    source: iba + 'mojito/', sourceLabel: '灵感参考 · IBA 莫吉托'
  },
  {
    id: 'tommys-margarita', name: '汤米玛格丽特', english: 'Tommy’s Margarita', family: 'margarita',
    spirit: '龙舌兰', method: '摇和',
    comparison: '用龙舌兰蜜替换经典玛格丽特里的橙味利口酒，并改在加冰的古典杯中饮用。',
    ingredients: ['100% 龙舌兰原料酿制的 Tequila 60 ml', '鲜青柠汁 30 ml', '龙舌兰蜜 30 ml'],
    steps: ['全部材料加冰摇匀。', '滤入加冰的预冷古典杯，放一片青柠。']
  },
  {
    id: 'equal-parts-espresso-martini', name: '等比例浓缩马天尼', english: 'Espresso Martini · Kahlúa', family: 'espresso-martini',
    spirit: '伏特加', method: '摇和',
    comparison: 'Kahlúa 将咖啡利口酒、伏特加与浓缩咖啡等量混合，甜度来自咖啡利口酒。',
    ingredients: ['Kahlúa 咖啡利口酒 30 ml', '伏特加 30 ml', '冷却的意式浓缩 30 ml'],
    steps: ['壶中加入冰块和三种液体，用力摇约 15–20 秒。', '滤入马天尼杯或鸡尾酒杯，以 3 粒咖啡豆装饰。'],
    source: 'https://www.kahlua.com/en-us/drinks/espresso-martini/', sourceLabel: 'Kahlúa 官方配方'
  },
  {
    id: 'black-russian', name: '黑俄罗斯', english: 'Black Russian', family: 'espresso-martini',
    spirit: '伏特加', method: '杯调',
    comparison: '从浓缩马天尼熟悉的伏特加和咖啡利口酒出发，用两种酒直接加冰杯调。',
    ingredients: ['伏特加 50 ml', '咖啡利口酒 20 ml'],
    steps: ['将两种酒倒入加冰的古典杯，轻搅即可。']
  }
];

function recipeCard(recipe) {
  const related = recipe.family
    ? classics.filter(classic => classic.id === recipe.family)
    : variations.filter(variant => variant.family === recipe.id);
  const source = link(recipe.source || iba + recipe.id + '/', recipe.sourceLabel || 'IBA 官方配方');
  return `<article id="cocktail-${esc(recipe.id)}" class="beverage-card">
    <img class="beverage-photo" src="assets/beverages/${esc(recipe.image || recipe.id)}.webp" alt="${esc(recipe.name)}示意图" loading="lazy" decoding="async">
    <div class="beverage-card-copy">
      <div class="beverage-card-meta"><span class="beverage-tag">${esc(recipe.spirit)}</span><span class="beverage-tag">${esc(recipe.method)}</span></div>
      <h3>${esc(recipe.name)}</h3>
      <p class="beverage-card-meta" lang="en">${esc(recipe.english)}</p>
      <p>${esc(recipe.comparison || recipe.taste)}</p>
      <details class="beverage-details">
        <summary>材料与步骤</summary>
        <h4>材料</h4>
        <ul>${recipe.ingredients.map(ingredient => '<li>' + esc(ingredient) + '</li>').join('')}</ul>
        <h4>做法</h4>
        <ol>${recipe.steps.map(step => '<li>' + esc(step) + '</li>').join('')}</ol>
      </details>
      <p class="beverage-card-meta">${source}</p>
      <p class="beverage-card-links">${related.map(item =>
        `<a href="#cocktail-${esc(item.id)}">${recipe.family ? '对照经典版 · ' : ''}${esc(item.name)} →</a>`).join('')}</p>
    </div>
  </article>`;
}

const spiritFilter = document.querySelector('#spirit');
const methodFilter = document.querySelector('#cocktail-method');
const grid = document.querySelector('#cocktail-grid');
const results = document.querySelector('#cocktail-results');
for (const spirit of new Set(classics.map(recipe => recipe.spirit))) spiritFilter.add(new Option(spirit));
for (const method of new Set(classics.map(recipe => recipe.method))) methodFilter.add(new Option(method));

function render() {
  const matches = classics.filter(recipe =>
    (!spiritFilter.value || recipe.spirit === spiritFilter.value) &&
    (!methodFilter.value || recipe.method === methodFilter.value)
  );
  results.textContent = `${matches.length} 款经典酒谱`;
  grid.innerHTML = matches.map(recipeCard).join('') ||
    '<p class="learning-empty">这一组合暂无配方，可以改选基酒或手法。</p>';
}

spiritFilter.addEventListener('change', render);
methodFilter.addEventListener('change', render);
document.querySelector('#cocktail-versions').innerHTML = variations.map(recipeCard).join('');
render();

function revealRecipe() {
  const hash = location.hash.slice(1);
  if (!hash.startsWith('cocktail-')) return;
  if (!document.getElementById(hash) && classics.some(recipe => 'cocktail-' + recipe.id === hash)) {
    spiritFilter.value = '';
    methodFilter.value = '';
    render();
  }
  document.getElementById(hash)?.scrollIntoView({behavior: 'instant'});
}
window.addEventListener('hashchange', revealRecipe);
revealRecipe();

const form = document.querySelector('#cocktail-notes');
const field = form.querySelector('textarea');
const status = form.querySelector('[role=status]');
const key = 'spike-cocktail-notes-v1';
try { field.value = localStorage.getItem(key) || ''; } catch { status.textContent = '当前浏览器无法读取笔记。'; }
form.addEventListener('submit', event => {
  event.preventDefault();
  try {
    localStorage.setItem(key, field.value);
    status.textContent = '已保存在当前浏览器。';
  } catch {
    status.textContent = '保存失败，请检查浏览器存储权限。';
  }
});
