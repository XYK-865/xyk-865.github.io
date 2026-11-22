import {esc, safe, link, load, failure} from './learning-store.js';

const host = document.querySelector('#wardrobe-content');
const key = 'spike-wardrobe-v1';
const seasons = ['春', '夏', '秋', '冬'];
const occasions = ['上课', '通勤', '约会', '周末', '面试', '正式活动'];
const states = ['灵感收藏', '想试穿', '已拥有'];
const colors = ['白', '黑', '灰', '蓝', '米', '棕', '绿', '其他'];
const styles = ['休闲', '利落', '工装', '正式'];
const topics = ['基础配色', '宽松比例', '叠穿', '通勤', '西装剪裁', '面料'];
const weather = ['昼夜温差', '室内外切换', '炎热', '凉爽', '寒冷', '下雨'];
const empty = message => '<p class="learning-empty">' + esc(message) + '</p>';
const grid = html => '<div class="wardrobe-grid">' + html + '</div>';
const option = (value, label = value) => '<option value="' + esc(value) + '">' + esc(label) + '</option>';
const select = (name, values, first) => '<select name="' + name + '">' + option('', first) + values.map(value => Array.isArray(value) ? option(...value) : option(value)).join('') + '</select>';
const label = (title, field) => '<label>' + esc(title) + field + '</label>';
const input = (name, type = 'text') => '<input name="' + name + '" type="' + type + '"' + (name === 'name' ? ' required' : '') + ' maxlength="250">';
const picks = (name, values) => '<fieldset><legend>' + (name === 'seasons' ? '季节' : '场合') + '</legend>' + values.map(v => '<label><input type="checkbox" name="' + name + '" value="' + esc(v) + '"> ' + esc(v) + '</label>').join('') + '</fieldset>';
const detail = (id, title, content) => '<details id="' + esc(id) + '"><summary>' + esc(title) + '</summary>' + content + '</details>';

const garmentPaths = {
  top: 'M18 12 33 5c3 7 11 7 14 0l15 7 12 15-12 9-5-7v31H23V29l-5 7-12-9Z',
  pants: 'M23 6h34l4 55H45l-5-34-5 34H19Z',
  shoes: 'M10 40c12 0 20-4 26-14l9 8 14-3c7 9 16 11 16 19v5H9Z',
  accessory: 'M13 19h54v30H13zM25 19v30m30-30v30'
};
function illustration(kind) {
  return '<svg viewBox="0 0 80 66" aria-hidden="true"><path d="' + (garmentPaths[kind] || garmentPaths.top) + '"/></svg>';
}
function start() {
  load('wardrobe-data.json', data => data).then(render).catch(error => {
    console.error(error);
    failure(host, start);
  });
}

function render(data) {
  let store = {items: [], outfits: [], references: []};
  let notice = '';
  try {
    const raw = JSON.parse(localStorage.getItem(key));
    for (const group of Object.keys(store)) if (Array.isArray(raw?.[group])) store[group] = raw[group];
  } catch {
    notice = '暂时无法读取本机档案。';
  }

  const creators = new Map(data.creators.map(row => [row[0], row[1]]));
  const refs = [...data.references.map(([id, authorIds, name, platform, url, note, topics]) => ({id, authorIds, name, platform, url, note, topics})), ...store.references];
  const refById = new Map(refs.map(row => [row.id, row]));
  const itemById = new Map(store.items.map(row => [row.id, row]));
  const examples = data.outfits.map(([id,name,season,occasion,style,conditions,parts,reason,swap,reference]) => ({
    id, name, seasons:[season], occasions:[occasion], style, conditions, parts:parts.split(' / '), reason, swap, reference, example:true
  }));
  const outfits = [...examples, ...store.outfits];
  const figure = (name, group, src) => {
    const kind = group === '裤装' ? 'pants' : group === '鞋履' ? 'shoes' : group === '配饰' ? 'accessory' : 'top';
    const localImage = /^data:image\/(jpeg|png|webp|gif);base64,[\w+/=]+$/i.test(src || '');
    return '<figure class="wardrobe-figure">' + (safe(src) || localImage ? '<img loading="lazy" src="' + esc(src) + '" alt="' + esc(name) + '">' : illustration(kind)) + '<figcaption>' + esc(name) + '</figcaption></figure>';
  };
  const refLink = id => refById.has(id) ? '<a href="#ref-' + esc(id) + '">' + esc(refById.get(id).name) + '</a>' : '';
  const fieldSet = values => values.filter(Boolean).map(esc).join(' · ');
  const itemChoices = group => store.items.filter(item => !group || item.group === group).map(item => [item.id, item.name]);
  const imageCredit = item => item.credit || item.imageSource ? '<p>图片：' + esc(item.credit) + ' ' + link(item.imageSource, '来源') + '</p>' : '';
  const itemCard = item => {
    const used = outfits.filter(row => row.itemIds?.includes(item.id) || row.swapId === item.id);
    return '<article class="learning-card" id="item-' + esc(item.id) + '">' + figure(item.name, item.group, item.image) +
      '<p>' + fieldSet([item.state, item.group, item.type, item.color, item.length, item.cut, item.fabric, item.fit, item.brand, item.price]) + '</p><p>' + fieldSet([...item.seasons,...item.occasions]) + '</p><p>' + esc(item.note) + '</p>' +
      imageCredit(item) + (item.url ? '<p>' + link(item.url, '原链接') + '</p>' : '') +
      '<p>使用这件单品的搭配</p>' + (used.length ? '<ul>' + used.map(row => '<li><a href="#outfit-' + esc(row.id) + '">' + esc(row.name) + '</a></li>').join('') + '</ul>' : '<small>尚未用于搭配。</small>') + '</article>';
  };
  const outfitCard = row => {
    const parts = row.example ? row.parts.map((name, i) => figure(name, ['', '裤装', '鞋履'][i]))
      : row.itemIds.map(id => itemById.get(id)).filter(Boolean).map(item => '<a href="#item-' + esc(item.id) + '">' + figure(item.name,item.group,item.image) + '</a>');
    return '<article class="learning-card wardrobe-outfit" id="outfit-' + esc(row.id) + '"><small>' + (row.example ? '示例 · 外部灵感改编' : esc(row.state || '我的改编')) + '</small><h3>' + esc(row.name) + '</h3><p>' + fieldSet([...row.seasons,...row.occasions,row.style,row.conditions,row.nickname]) +
      '</p><div class="wardrobe-parts">' + parts.join('') + '</div><p>' + esc(row.reason) + '</p>' +
      (row.swap || row.swapId ? '<p><strong>可替换</strong> ' + esc(row.swap) + (itemById.has(row.swapId) ? ' <a href="#item-' + esc(row.swapId) + '">' + esc(itemById.get(row.swapId).name) + '</a>' : '') + '</p>' : '') +
      (row.feedback ? '<p><strong>试穿</strong> ' + esc(row.feedback) + '</p>' : '') +
      (row.preference ? '<p><strong>穿着需求</strong> ' + esc(row.preference) + '</p>' : '') +
      (row.reference ? '<p><strong>原始灵感</strong> ' + refLink(row.reference) + '</p>' : '') + '</article>';
  };
  const referenceCard = row => {
    const linked = outfits.filter(outfit => outfit.reference === row.id);
    return '<article class="learning-card" id="ref-' + esc(row.id) + '"><small>' + fieldSet(['外部灵感',row.platform,...row.authorIds.map(id=>creators.get(id)),row.author,row.season,row.occasion,row.style,...(row.topics || [])]) + '</small><h3>' + esc(row.name) + '</h3><p>' + esc(row.note) + '</p><p>' + link(row.url, '看原始内容') + '</p>' +
      (itemById.has(row.itemId) ? '<p>可替换单品 <a href="#item-' + esc(row.itemId) + '">' + esc(itemById.get(row.itemId).name) + '</a></p>' : '') +
      linked.map(outfit=>'<p><a href="#outfit-' + esc(outfit.id) + '">查看改编 · ' + esc(outfit.name) + '</a></p>').join('') + '</article>';
  };

  host.innerHTML = '<p class="wardrobe-local">你的收藏与草稿保存在当前浏览器。页面内的示例供浏览。</p><p id="wardrobe-status" role="status">' + esc(notice) + '</p>' +
    '<section id="items"><h2>单品收藏</h2><div class="learning-controls" id="item-filters">' +
    label('品类',select('group',Object.keys(data.categories),'全部品类')) + label('颜色',select('color',colors,'全部颜色')) +
    label('季节',select('season',seasons,'全部季节')) + label('场合',select('occasion',occasions,'全部场合')) + label('收藏状态',select('state',states,'全部状态')) + '</div>' +
    detail('new-item','＋ 添加单品','<form id="item-form">' +
      label('名称',input('name')) + label('品类',select('group',Object.keys(data.categories),'请选择')) +
      label('子类',select('type',[],'先选品类')) + label('颜色',select('color',colors,'未记录')) +
      '<div id="pants-fields" hidden>' + label('裤长',select('length',['五分','七分','九分','全长'],'未记录')) + label('裤型',select('cut',['直筒','宽松','锥形','束脚'],'未记录')) + '</div>' +
      label('面料',input('fabric')) + label('版型',input('fit')) + label('品牌',input('brand')) + label('价格',input('price')) +
      label('状态',select('state',states,'灵感收藏（默认）')) + picks('seasons',seasons) + picks('occasions',occasions) +
      label('原链接',input('url','url')) + label('图片链接',input('image','url')) +
      label('或上传照片（最多 1 MB）','<input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif">') +
      label('图片来源链接',input('imageSource','url')) + label('图片署名',input('credit')) + label('喜欢的原因','<textarea name="note"></textarea>') +
      '<button type="submit">保存单品</button></form>') + '<div id="item-results"></div></section>' +
    '<section id="outfits"><h2>四季与搭配</h2><div class="wardrobe-seasons" aria-label="四季入口">' +
      ['全部',...seasons].map((season,i)=>'<button type="button" data-season="' + (i ? season : '') + '" aria-pressed="' + (i===0) + '">' + season + '</button>').join('') +
      '</div><div id="outfit-filters" class="learning-controls">' + label('天气',select('conditions',weather,'全部天气')) + label('场合',select('occasion',occasions,'全部场合')) + label('风格',select('style',styles,'全部风格')) + '</div>' +
    detail('new-outfit','＋ 组合搭配','<form id="outfit-form">' +
      label('名称',input('name')) + ['上衣','裤装','鞋履','外套','配饰'].map(group=>label(group,select('itemIds',itemChoices(group),'请选择'))).join('') +
      label('状态',select('state',['我的改编','实际穿过'],'我的改编（默认）')) + label('风格',select('style',styles,'未记录')) + label('天气',select('conditions',weather,'未记录')) +
      picks('seasons',seasons) + picks('occasions',occasions) + label('灵感',select('reference',refs.map(row=>[row.id,row.name]),'选择一条灵感')) +
      label('可替换单品',select('swapId',itemChoices(),'未选择')) + label('想呈现的感觉与搭配理由','<textarea name="reason"></textarea>') +
      label('替换说明',input('swap')) + label('试穿反馈','<textarea name="feedback"></textarea>') +
      label('搭配对象昵称（选填）',input('nickname')) + label('偏好与穿着需求（仅本机）',input('preference')) + '<button type="submit">保存搭配</button></form>') +
      '<div id="outfit-results"></div></section>' +
    suitGuide(data.suits) + '<section id="inspiration"><h2>灵感与博主</h2><div class="learning-controls">' + label('筛选创作者',select('creator',[...creators],'全部创作者')) + label('筛选主题',select('refTopic',topics,'全部主题')) + '</div>' +
    grid(data.creators.map(([id,name,intro,topic,url])=>'<article class="learning-card" id="creator-' + esc(id) + '"><h3>' + esc(name) + '</h3><p>' + esc(intro) + '</p><small>' + esc(topic) + '</small><p>' + link(url,'官方主页') + '</p><ul>' +
      refs.filter(row=>row.authorIds.includes(id)).map(row=>'<li>' + refLink(row.id) + '</li>').join('') + '</ul></article>').join('')) +
    detail('new-reference','＋ 收藏一条灵感','<form id="reference-form">' +
      label('标题',input('name')) + label('原链接','<input name="url" type="url" required>') + label('已有创作者',select('authorId',[...creators],'请选择')) +
      label('或填写作者',input('author')) + label('平台',input('platform')) + label('季节',select('season',seasons,'未记录')) + label('场合',select('occasion',occasions,'未记录')) +
      label('风格',select('style',styles,'未记录')) + label('主题',select('topic',topics,'未分类')) + label('可替换的衣橱单品',select('itemId',itemChoices(),'未选择')) +
      label('我喜欢的细节','<textarea name="note"></textarea>') + '<button type="submit">保存灵感</button></form>') + '<div id="reference-results"></div></section>';

  const query = selector => host.querySelector(selector);
  let season = '';
  function renderItems() {
    const filters = Object.fromEntries([...query('#item-filters').querySelectorAll('select')].map(field=>[field.name,field.value]));
    const rows = store.items.filter(row =>
      ['group','color','state'].every(key=>!filters[key] || row[key]===filters[key]) &&
      (!filters.season || row.seasons.includes(filters.season)) && (!filters.occasion || row.occasions.includes(filters.occasion)));
    query('#item-results').innerHTML = rows.length ? grid(rows.map(itemCard).join('')) : empty(store.items.length ? '没有符合这些筛选条件的单品。' : '收藏还是空的。可以添加一件自己喜欢的衣服。');
  }
  function renderOutfits() {
    const filters = Object.fromEntries([...query('#outfit-filters').querySelectorAll('select')].map(field=>[field.name,field.value]));
    const rows = outfits.filter(row=>(!season || row.seasons.includes(season)) &&
      (!filters.occasion || row.occasions.includes(filters.occasion)) &&
      ['style','conditions'].every(key=>!filters[key] || row[key]===filters[key]));
    query('#outfit-results').innerHTML = rows.length ? grid(rows.map(outfitCard).join('')) : empty('没有符合这些条件的搭配。');
  }
  function renderReferences() {
    const creator = query('[name="creator"]').value;
    const topic = query('[name=refTopic]').value;
    const rows = refs.filter(row=>(!creator || row.authorIds.includes(creator)) && (!topic || row.topics?.includes(topic)));
    query('#reference-results').innerHTML = rows.length ? grid(rows.map(referenceCard).join('')) : empty('这个创作者还没有收录内容。');
  }
  query('#item-filters').onchange = renderItems;
  query('#outfit-filters').onchange = renderOutfits;
  query('[name="creator"]').onchange = renderReferences;
  query('[name=refTopic]').onchange = renderReferences;
  for (const button of host.querySelectorAll('[data-season]')) button.onclick = () => {
    season = button.dataset.season;
    for (const peer of host.querySelectorAll('[data-season]')) peer.setAttribute('aria-pressed', String(peer===button));
    renderOutfits();
  };
  const itemForm = query('#item-form');
  itemForm.elements.group.onchange = () => {
    const group = itemForm.elements.group.value;
    itemForm.elements.type.innerHTML = option('','请选择') + (data.categories[group] || []).map(v=>option(v)).join('');
    query('#pants-fields').hidden = group !== '裤装';
    if (group !== '裤装') itemForm.elements.namedItem('length').value = itemForm.elements.cut.value = '';
  };

  for (const [formId, group] of [['item','items'],['outfit','outfits'],['reference','references']]) {
    query('#'+formId+'-form').onsubmit = async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const submit = form.querySelector('button[type="submit"]');
      submit.disabled = true;
      const formData = new FormData(form);
      const row = Object.fromEntries([...formData].filter(([,value])=>typeof value==='string').map(([name,value])=>[name,value.trim()]));
      row.id = crypto.randomUUID();
      row.seasons = formData.getAll('seasons');
      row.occasions = formData.getAll('occasions');
      try {
        if (!row.name) throw Error('请填写名称。');
        if (formId === 'item') {
          if (!row.group || !row.type) throw Error('请选择品类与子类。');
          row.state ||= states[0];
          const file = formData.get('photo');
          if (file?.size) {
            if (file.size > 1048576 || !['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)) throw Error('请选择小于 1 MB 的 JPG、PNG、WebP 或 GIF。');
            row.image = await new Promise((resolve,reject)=>{
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = () => reject(Error('图片读取失败。'));
              reader.readAsDataURL(file);
            });
          }
        } else if (formId === 'outfit') {
          row.itemIds = formData.getAll('itemIds').filter(Boolean);
          if (row.itemIds.length < 3 || !['上衣','裤装','鞋履'].every(category=>row.itemIds.some(id=>itemById.get(id)?.group===category))) throw Error('请至少各选一件上衣、裤装和鞋履。');
          row.state ||= '我的改编';
        } else {
          if (!/^https?:\/\//i.test(row.url)) throw Error('请填写 http 或 https 原链接。');
          row.authorIds = row.authorId ? [row.authorId] : [];
          row.topics = row.topic ? [row.topic] : [];
        }
        store[group] = [...store[group],row];
        try {
          localStorage.setItem(key,JSON.stringify(store));
        } catch {
          store[group].pop();
          throw Error('本机保存失败，请检查浏览器空间或换一张较小的图。');
        }
        render(data);
        query('#wardrobe-status').textContent = '已保存到当前浏览器。';
        const prefix = formId === 'reference' ? 'ref' : formId;
        const saved = document.getElementById(prefix+'-'+row.id);
        if (saved) {
          location.hash = saved.id;
          saved.tabIndex = -1;
          saved.focus();
        }
      } catch (error) {
        let status = form.querySelector('[role=alert]');
        if (!status) {
          status = document.createElement('p');
          status.setAttribute('role', 'alert');
          form.append(status);
        }
        status.textContent = error.message;
      } finally {
        submit.disabled = false;
      }
    };
  }
  renderItems();
  renderOutfits();
  renderReferences();

  function revealAnchor() {
    const target = document.getElementById(location.hash.slice(1));
    if (!target || !host.contains(target)) return;
    target.scrollIntoView();
  }
  requestAnimationFrame(revealAnchor);
  host.onclick = event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const id = anchor.hash.slice(1);
    if (document.getElementById(id)) return;
    if (id.startsWith('item-')) {
      for (const field of query('#item-filters').querySelectorAll('select')) field.value = '';
      renderItems();
    } else if (id.startsWith('outfit-')) {
      query('[data-season=""]').click();
      for (const field of query('#outfit-filters').querySelectorAll('select')) field.value = '';
      renderOutfits();
    } else if (id.startsWith('ref-')) {
      query('[name="creator"]').value = '';
      query('[name=refTopic]').value = '';
      renderReferences();
    }
    requestAnimationFrame(revealAnchor);
  };
}

function suitGuide({glossary, fit, cases}) {
  return '<section id="suits"><h2>西装手册</h2><p>看懂结构，试穿时逐项检查，再按场合和季节搭配。</p>' +
    detail('suit-basics','认识西装','<dl>' + glossary.map(([title,text])=>'<dt>' + esc(title) + '</dt><dd>' + esc(text) + '</dd>').join('') + '</dl>' + link('https://www.permanentstyle.com/style-lookbook','参考西装与单西造型图')) +
    detail('suit-fit','试穿检查清单','<p>穿上计划搭配的衬衫和鞋，依次检查。</p><ol class="wardrobe-checklist">' + fit.map(([title,text])=>'<li><label><input type="checkbox"> <strong>' + esc(title) + '</strong></label><p>' + esc(text) + '</p></li>').join('') + '</ol>') +
    detail('suit-occasions','场合搭配','<dl>' + cases.map(([title,text,url])=>'<dt>' + esc(title) + '</dt><dd>' + esc(text) + (url ? ' <a href="' + url + '">查看示例搭配</a>' : '') + '</dd>').join('') + '</dl>') +
    detail('suit-seasons','四季西装','<dl><dt>夏季 · 轻薄与透气</dt><dd>看轻克重、透气织法或半里布。夏季面试按场合选颜色和正式度。 <a href="#outfit-summer-smart">夏季面试</a></dd><dt>春秋 · 一套多穿</dt><dd>中等克重便于应对温差，春天用薄衬衫，秋天可试细针织或加外层。</dd><dt>秋冬 · 保暖与叠穿</dt><dd>比较厚羊毛和法兰绒的质感与体感。冬季通勤要给外层留够活动空间。 <a href="#outfit-winter-smart">冬季通勤</a></dd></dl>') + '</section>';
}

start();
