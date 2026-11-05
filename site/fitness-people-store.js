// Shared by directory, person pages and graph. Data is inert JSON, never executable HTML.
export const ROLE_LABELS = {athlete:'运动员', educator:'训练教育创作者'};
export const MATCH_LABELS = {exact:'完全匹配', similar:'同类动作', unmatched:'动作库未收录'};
export function validatePeople(data, movementLibrary) {
  const names = ['people','sources','topics','views','personViews','movements','videos','diets','relations'];
  for(const optional of ['books','articles']) if(data[optional]) names.push(optional);
  const maps = {};
  for (const name of names) {
    if (!Array.isArray(data[name])) throw new Error(`缺少数据集合：${name}`);
    maps[name] = new Map();
    for (const item of data[name]) {
      if (!item.id || maps[name].has(item.id)) throw new Error(`无效或重复 ID：${name}/${item.id}`);
      maps[name].set(item.id,item);
    }
  }
  const ref = (table,id) => {if (!maps[table].has(id)) throw new Error(`关联不存在：${table}/${id}`);};
  const sources = item => {
    if (!item.sourceIds?.length) throw new Error(`缺少来源：${item.id}`);
    item.sourceIds.forEach(id => ref('sources',id));
  };
  for (const p of data.people) {
    if (!p.nameZh || !p.nameEn || !p.roles.length || p.roles.some(r => !ROLE_LABELS[r])) throw new Error(`人物名称或身份不完整：${p.id}`);
    sources(p); ref('sources',p.photoSourceId);
  }
  data.views.forEach(v => v.topicIds.forEach(id => ref('topics',id)));
  for (const r of data.personViews) {ref('people',r.personId);ref('views',r.viewId);sources(r);}
  for (const r of [...data.movements,...data.diets]) {ref('people',r.personId);sources(r);}
  for (const m of data.movements) {
    if (!MATCH_LABELS[m.match]) throw new Error(`未知匹配类型：${m.id}`);
    if (m.match === 'unmatched' && m.movementId) throw new Error(`未匹配条目不应绑定动作：${m.id}`);
    if (m.match !== 'unmatched' && (!m.movementId || movementLibrary && !movementLibrary.some(x => x.id === m.movementId))) throw new Error(`无效动作 ID：${m.id}`);
    if (m.match === 'similar' && !m.difference) throw new Error(`同类动作缺少差异：${m.id}`);
  }
  for (const v of data.videos) {
    v.personIds.forEach(id => ref('people',id));sources(v);
    if(v.articleId) ref('articles',v.articleId);
    for(const moment of v.keyMoments || []) if(!Number.isInteger(moment.seconds)||moment.seconds<0||!moment.label) throw new Error(`无效时间点：${v.id}`);
  }
  for(const b of data.books || []) {b.personIds.forEach(id=>ref('people',id));sources(b);}
  for(const a of data.articles || []) {
    ref('videos',a.videoId);a.participants.forEach(id=>ref('people',id));sources(a);
    if(!a.sections.length||!a.basis) throw new Error(`导读内容不完整：${a.id}`);
    a.sections.forEach(s=>{if(!s.title||!s.text||!s.kind)throw new Error(`缺少导读段落：${a.id}`);sources({...s,id:a.id});});
  }
  for (const r of data.relations) {
    ref('personViews',r.source);ref('personViews',r.target);sources(r);
    if (!['change','disagreement'].includes(r.kind) || !r.explanation) throw new Error(`无效观点关系：${r.id}`);
  }
  for (const s of data.sources) {
    if (!s.title || !s.publisher || !s.verifiedAt || !/^https:\/\//.test(s.url)) throw new Error(`来源信息不完整：${s.id}`);
  }
  return maps;
}
let pending;
export function loadPeople({retry=false}={}) {
  if (retry) pending = undefined;
  return pending ||= fetch(new URL('./fitness-people-data.json',import.meta.url))
    .then(r => {if (!r.ok) throw new Error('资料暂时无法读取');return r.json();})
    .then(data => ({data,maps:validatePeople(data,window.FITNESS_MOVEMENTS)}))
    .catch(error => {pending=undefined;throw error;});
}
export const esc = value => String(value ?? '').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const normalize = text => String(text).normalize('NFKC').toLowerCase().replace(/[\s·・._-]/g,'');
export const personHref = p => ['jeff-nippard','mike-israetel','eric-helms'].includes(p.id) ? `fitness-creator-${p.id}.html` : `fitness-person.html?id=${encodeURIComponent(p.id)}`;
export const videoHref = v => v.id==='volume-original'?'fitness-video-volume-hypertrophy.html':v.id==='junk-original'?'fitness-video-junk-volume.html':`fitness-video.html?id=${encodeURIComponent(v.id)}`;
export const external = (url,label) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
export function sourceLinks(ids,maps) {
  return `<div class="people-sources-inline">${[...new Set(ids)].map(id => {
    const s=maps.sources.get(id);
    return external(s.url,`${s.publisher} · ${s.title}`);
  }).join('')}</div>`;
}
export function photo(p,loading='lazy') {
  return `<span class="person-image${p.photoFit==='contain'?' person-image--contain':''}"><img src="${esc(p.image)}" alt="${esc(p.nameZh+' / '+p.nameEn)}" loading="${loading}"${p.photoAlign==='top'?' style="object-position:center top"':''}><span class="person-image-fallback" hidden>${esc(p.nameZh)}<small>${esc(p.nameEn)}</small></span></span>`;
}
export function bindPhotoFallback(container) {
  container.querySelectorAll('.person-image img').forEach(img => {
    const fallback=() => {img.hidden=true;img.nextElementSibling.hidden=false;};
    img.addEventListener('error',fallback,{once:true});
    if (img.complete && !img.naturalWidth) fallback();
  });
}
export function showLoadError(container,retry) {
  container.innerHTML='<div class="people-state" role="alert"><h2>资料暂时无法打开</h2><p>请检查连接后重试。已打开的其他栏目仍可继续使用。</p><button type="button">重新加载资料</button></div>';
  container.querySelector('button').addEventListener('click',retry,{once:true});
}
