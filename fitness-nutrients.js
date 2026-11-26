import { nutrientCategories, nutrients } from './fitness-nutrients-data.js';

const icons = {
  protein: '<circle cx="5" cy="15" r="2"/><circle cx="12" cy="7" r="2"/><circle cx="19" cy="15" r="2"/><path d="m6.5 13.5 4-5m3 0 4 5"/>',
  carbohydrates: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="M8 9H6m12 6h-2m-4 4v-2"/>',
  lipids: '<path d="M7 3v18M7 6h4l2 2 2-2 2 2h4M7 12h4l2 2 2-2 2 2h4M7 18h5l2 2 2-2h5"/>',
  vitamins: '<path d="M6 18c-2.4-2.4-2.4-6.3 0-8.7l3.3-3.3c2.4-2.4 6.3-2.4 8.7 0s2.4 6.3 0 8.7L14.7 18c-2.4 2.4-6.3 2.4-8.7 0Z"/><path d="m8.5 8.5 7 7"/>',
  minerals: '<path d="m4 9 3-5h10l3 5-8 11L4 9Zm0 0h16m-10-5-2 5 4 11 4-11-2-5"/>',
  water: '<path d="M12 3c1.4 2.5 6 6.8 6 11a6 6 0 1 1-12 0c0-4.2 4.6-8.5 6-11Z"/><path d="M9 14a3 3 0 0 0 3 3"/>',
  fiber: '<path d="M5 19c1-5 5-9 12-12m-9 9C6 10 11 5 20 4c0 8-4 13-11 13Zm3-4 1-4"/>'
};

function textElement(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

function makeNutrientCard(nutrient) {
  const card = document.createElement('a');
  card.className = 'resource-category nutrient-knowledge-card';
  card.href = nutrient.articlePath;
  if (nutrient.id === 'lipids') card.id = 'dietary-fats';

  const icon = document.createElement('span');
  icon.className = 'nutrient-knowledge-icon';
  icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icons[nutrient.icon] + '</svg>';

  const languages = textElement('p', nutrient.englishTitle, 'nutrient-knowledge-english');
  languages.lang = 'en';
  const footer = document.createElement('div');
  const status = textElement('span', [nutrient.status, nutrient.version].filter(Boolean).join(' · '), 'nutrient-knowledge-status');
  if (nutrient.version) status.classList.add('is-ready');
  footer.append(status, textElement('strong', nutrient.version ? '阅读专题 ↗' : '查看专题 ↗'));

  card.append(icon, textElement('h4', nutrient.title), languages, textElement('p', nutrient.description), footer);
  return card;
}

export function renderNutrientKnowledge(container) {
  if (!container) return;
  const groups = nutrientCategories.map(category => {
    const section = document.createElement('section');
    section.className = 'nutrient-knowledge-group';
    section.dataset.category = category.id;
    const heading = textElement('h3', category.title);
    heading.id = 'nutrient-category-' + category.id;
    section.setAttribute('aria-labelledby', heading.id);
    if (category.englishTitle) {
      const english = textElement('span', category.englishTitle, 'nutrient-knowledge-english');
      english.lang = 'en';
      heading.append(' ', english);
    }
    const grid = document.createElement('div');
    grid.className = 'nutrient-knowledge-grid';
    grid.append(...nutrients.filter(nutrient => nutrient.category === category.id).map(makeNutrientCard));
    section.append(heading, grid);
    return section;
  });
  container.replaceChildren(...groups);
}
