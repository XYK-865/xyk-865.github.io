import {FOOD_PHOTO_DATA} from './food-photo-data.js';
import {FOODS, BASE_FOODS, RECIPES, nutritionFor, recipeNutrition, fdcUrl} from './food-data.js';

const grid = document.querySelector('#food-grid');
const recipes = document.querySelector('#recipe-grid');
const search = document.querySelector('#food-search');
const basis = document.querySelector('#food-basis');
const categories = [...document.querySelectorAll('[data-category]')];
const amounts = new Map();
let category = '全部';

const escape = value => String(value).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
const format = (value, digits = 1) => new Intl.NumberFormat('zh-CN', {maximumFractionDigits: digits}).format(value);
const loadPhoto = element => {
  element.style.backgroundImage = `url("${element.dataset.photoSrc}")`;
  element.dataset.photoLoaded = 'true';
};
const photoObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) { loadPhoto(entry.target); photoObserver.unobserve(entry.target); }
}, {rootMargin: '350px'}) : null;
function loadNearbyPhotos() {
  photoObserver?.disconnect();
  for (const element of document.querySelectorAll('[data-photo-src]:not([data-photo-loaded])')) {
    if (photoObserver) photoObserver.observe(element); else loadPhoto(element);
  }
}
const picture = (key, name, foodId=key) => {
  const photo=FOOD_PHOTO_DATA.photos[foodId];
  if(photo?.kind==='sprite'){
    const sheet=FOOD_PHOTO_DATA.sheets[photo.sheet],frame=photo.frame||photo,scale=132/frame.size;
    return `<div class="food-picture food-picture-photo"><span class="food-photo-cutout" role="img" aria-label="${escape(name)}参考配图" data-photo-src="assets/food/reference-sheets/${escape(sheet.file)}" style="background-size:${sheet.width*scale}px ${sheet.height*scale}px;background-position:${-frame.x*scale}px ${-frame.y*scale}px"></span><small>${escape(photo.note)}</small></div>`;
  }
  if(photo?.kind==='photo')return `<div class="food-picture food-picture-photo"><img class="food-photo${photo.license==='AI-generated'?' food-photo-generated':''}" data-subject="${escape(foodId)}" src="${escape(photo.src)}" alt="${escape(name)}${photo.license==='AI-generated'?'食材示意图':'参考照片'}" loading="lazy" width="132" height="132"><small>${escape(photo.note)}</small></div>`;
  if (['bowl','oat-bowl'].includes(key)) return `<div class="food-picture"><svg viewBox="0 0 240 150" role="img" aria-label="${escape(name)}配方示意图"><use href="assets/food/illustrations.svg#${key}"></use></svg><small>配方示意图</small></div>`;
  return `<div class="food-picture"><span role="img" aria-label="${escape(name)}配图待补充">配图待补充</span></div>`;
};

function macros(values) {
  return [['kcal', '热量 · kcal', 0], ['protein', '蛋白质 · g', 1], ['fat', '脂肪 · g', 1], ['carbs', '碳水化合物 · g', 1]].map(([key, label, digits]) =>
    `<div><strong>${values ? format(values[key], digits) : '—'}</strong><small>${label}</small></div>`).join('');
}

function foodSource(food) {
  if (food.fdcId) return `${food.sourceNote?`<p>${escape(food.sourceNote)}</p>`:''}<p>${escape(food.description)}</p><p>USDA SR Legacy · 2018<br><a href="${fdcUrl(food.fdcId)}" target="_blank" rel="noopener noreferrer">查看 FDC ${food.fdcId} 原始条目 ↗</a></p>`;
  const recipe = RECIPES.find(item => item.id === food.recipeId);
  const grams = recipe.ingredients.reduce((sum, ingredient) => sum + ingredient.grams, 0);
  return `<p>本站示例配方，不是独立的 USDA 饮料条目。原料合计 ${grams} g，营养总和 ÷ ${grams} × 100 得到每 100 g。</p><p>${recipe.ingredients.map(ingredient => {
    const source = BASE_FOODS.find(item => item.id === ingredient.food);
    return `${escape(source.name)} ${ingredient.grams} g：<a href="${fdcUrl(source.fdcId)}" target="_blank" rel="noopener noreferrer">FDC ${source.fdcId} ↗</a>`;
  }).join('<br>')}</p><p><a href="#${recipe.id}">查看配方与做法 ↓</a></p>`;
}

function photoSource(food) {
  const photo = FOOD_PHOTO_DATA.photos[food.id];
  if (!photo || photo.kind === 'sprite') return '<p>配图取自提供的食物参考图片，仅用于辨识食材；份量、生熟状态和做法以本条目文字为准。</p>';
  if (photo.license === 'AI-generated') return '<p>配图为 AI 生成的食材示意图，不能据此判断实际份量或营养成分。</p>';
  return `<p>配图：${escape(photo.credit)} · <a href="${escape(photo.sourceUrl)}" target="_blank" rel="noopener noreferrer">原图 ↗</a> · <a href="${escape(photo.licenseUrl)}" target="_blank" rel="noopener noreferrer">使用许可 ↗</a>。图片仅用于辨识食材，营养按所列状态计算。</p>`;
}

function renderFoods() {
  const query = search.value.trim().toLocaleLowerCase();
  const foods = FOODS.filter(food => (category === '全部' || category === food.category) &&
    `${food.name} ${food.aliases} ${food.state} ${food.description || ''}`.toLocaleLowerCase().includes(query));
  document.querySelector('#food-count').textContent = `${foods.length} / ${FOODS.length} 项食物与饮料`;
  grid.innerHTML = foods.length ? foods.map(food => {
    const grams = amounts.get(food.id) ?? (basis.value === 'portion' ? food.portion.grams : 100);
    return `<article class="food-card" data-food="${food.id}">
      ${picture(food.illustration, food.name, food.id)}
      <div class="food-card-copy"><small>${escape(food.category)} · ${food.fdcId ? 'USDA 通用条目' : '本站配方估算'}</small>
      <h3>${escape(food.name)}</h3><p>${escape(food.state)}<br>${escape(food.note)}</p>
      <div class="food-measure"><label for="amount-${food.id}">计算重量 <input id="amount-${food.id}" type="number" inputmode="decimal" min="0" step="any" value="${grams}" data-amount="${food.id}" aria-describedby="portion-${food.id}"> g</label><span id="portion-${food.id}">${escape(food.portion.label)}：${format(food.portion.grams)} g</span></div>
      <div class="food-macros" data-values aria-live="polite" aria-label="当前重量的营养估算">${macros(nutritionFor(food, grams))}</div>
      <details><summary>份量说明与数据来源</summary><p>以下示例份量由本站设定，不是推荐食用量。换算：每 100 g 数值 × 输入克数 ÷ 100。热量四舍五入为整数，三大营养素保留一位小数；极少量可能显示为 0。</p>${foodSource(food)}${photoSource(food)}</details></div></article>`;
  }).join('') : '<p class="food-empty">暂时没有匹配的食物。试试别的名称或切换到“全部”。</p>';
  loadNearbyPhotos();
}

function renderRecipes() {
  recipes.innerHTML = RECIPES.map(recipe => {
    const total = recipeNutrition(recipe);
    const perServing = Object.fromEntries(Object.entries(total).map(([key, value]) => [key, value / recipe.servings]));
    return `<article class="recipe-card" id="${recipe.id}">${picture(recipe.illustration, recipe.name)}<div class="recipe-copy"><p class="recipe-tag">示例配方 · 营养估算</p><h3>${escape(recipe.name)}</h3><p>${escape(recipe.intro)}</p>
      <h4>整份配方用料</h4><ul>${recipe.ingredients.map(ingredient => {
        const food = BASE_FOODS.find(item => item.id === ingredient.food);
        return `<li>${escape(food.name)} ${ingredient.grams} g <span class="recipe-state">（${escape(food.state)}）</span></li>`;
      }).join('')}</ul><h4>做法</h4><ol>${recipe.steps.map(step => `<li>${escape(step)}</li>`).join('')}</ol><p>${escape(recipe.note)}</p>
      <div class="recipe-total"><p>整份配方总量 · ${format(total.kcal, 0)} kcal / 蛋白质 ${format(total.protein)} g / 脂肪 ${format(total.fat)} g / 碳水 ${format(total.carbs)} g</p>
      <label for="servings-${recipe.id}">把整份配方分成 <input id="servings-${recipe.id}" data-servings="${recipe.id}" type="number" min="1" max="20" step="1" value="${recipe.servings}" inputmode="numeric"> 份</label>
      <p data-serving-caption>每份约含（整份配方 ÷ ${recipe.servings}）</p><div class="food-macros" data-recipe-values aria-live="polite" aria-label="每份营养估算">${macros(perServing)}</div></div></div></article>`;
  }).join('');
  loadNearbyPhotos();
}

search.addEventListener('input', renderFoods);
basis.addEventListener('change', () => { amounts.clear(); renderFoods(); });
for (const button of categories) button.addEventListener('click', () => {
  category = button.dataset.category;
  for (const item of categories) item.setAttribute('aria-pressed', String(item === button));
  renderFoods();
});
grid.addEventListener('input', event => {
  const input = event.target.closest('[data-amount]');
  if (!input) return;
  const food = FOODS.find(item => item.id === input.dataset.amount);
  const value = input.valueAsNumber;
  const valid = input.validity.valid && Number.isFinite(value) && value >= 0;
  input.setAttribute('aria-invalid', String(!valid));
  if (valid) amounts.set(food.id, value);
  input.closest('.food-card').querySelector('[data-values]').innerHTML = macros(valid ? nutritionFor(food, value) : null);
});
recipes.addEventListener('input', event => {
  const input = event.target.closest('[data-servings]');
  if (!input) return;
  const value = input.valueAsNumber;
  const valid = input.validity.valid && Number.isInteger(value) && value >= 1 && value <= 20;
  input.setAttribute('aria-invalid', String(!valid));
  const card = input.closest('.recipe-card');
  const total = recipeNutrition(RECIPES.find(item => item.id === input.dataset.servings));
  const perServing = valid ? Object.fromEntries(Object.entries(total).map(([key, amount]) => [key, amount / value])) : null;
  card.querySelector('[data-serving-caption]').textContent = valid ? `每份约含（整份配方 ÷ ${value}）` : '请输入 1–20 的整数份数。';
  card.querySelector('[data-recipe-values]').innerHTML = macros(perServing);
});

renderFoods();
renderRecipes();
