import {loadPeople,esc,external,photo,bindPhotoFallback,sourceLinks,personHref,videoHref,normalize,ROLE_LABELS,MATCH_LABELS,showLoadError} from './fitness-people-store.js';

const host=document.querySelector('[data-people-app]');
let store;
const url=new URL(location.href);
const state={view:url.searchParams.get('view')==='graph'?'graph':'people',name:url.searchParams.get('name')||'',role:url.searchParams.get('role')||''};
if(state.role&&!ROLE_LABELS[state.role])state.role='';
function videoCard(v) {
  return `<article class="people-note video-note" data-video="${esc(v.id)}"><small>${esc(v.platform)} · ${esc(v.publisher)}</small><h3><a href="${videoHref(v)}">${esc(v.titleZh)} →</a> <small>译名</small></h3><p class="people-english">${esc(v.titleOriginal)}</p><p>${esc(v.summary)}</p><small>${esc(v.publishedAt||v.dateNote)}</small><div class="video-note-links"><a href="${videoHref(v)}">阅读文章导读 →</a>${external(v.url,v.platform==='播客'?'收听原节目':'观看原视频')}</div></article>`;
}
function movementCard(m,withPerson=false) {
  const p=store.maps.people.get(m.personId);
  return `<article class="people-note" data-match="${m.match}"><small>${esc(MATCH_LABELS[m.match])}${withPerson?' · '+esc(p.nameZh):''}</small><h3>${esc(m.nameZh)}</h3><p class="people-english">${esc(m.nameEn)}</p><p>${esc(m.muscles.join('、'))} · ${esc(m.type)}</p><p>${esc(m.evidence)} · ${esc(m.period)}</p>${m.difference?`<p class="people-context">${esc(m.difference)}</p>`:''}${m.movementId?`<button class="people-action" type="button" data-movement-id="${esc(m.movementId)}">${m.match==='exact'?'查看动作图与肌群图':'查看同类动作（含差异）'} ↗</button>`:`<p>建议归入：${esc(m.suggestedCategory)}</p>`}${sourceLinks(m.sourceIds,store.maps)}</article>`;
}
function pending(label) {return `<p class="people-state">${esc(label)}待补充。核实具体资料后再收录，不依据人物印象补写。</p>`;}
function syncDirectory() {
  const u=new URL(location.href);
  for(const key of ['view','name','role']) state[key] && (key!=='view'||state.view!=='people') ? u.searchParams.set(key,state[key]) : u.searchParams.delete(key);
  history.replaceState(null,'',u);
}
function renderDirectory() {
  host.innerHTML=`<div class="people-tabs" role="tablist" aria-label="人物与视频视图"><button id="people-tab" role="tab" aria-controls="people-directory" data-tab="people">人物目录</button><button id="graph-tab" role="tab" aria-controls="people-graph" data-tab="graph">训练理念图谱</button></div>
    <section id="people-directory" role="tabpanel" aria-labelledby="people-tab"><div class="people-heading"><div><p class="kicker">PEOPLE / 从一个人开始</p><h2>运动员与训练创作者</h2></div><p>先了解背景，再沿着资料进入训练。</p></div>
    <div class="people-filters"><label>姓名或别名<input id="people-search" type="search" placeholder="中文名、English name、CBum…" value="${esc(state.name)}"></label><label>身份<select id="people-role"><option value="">全部身份</option><option value="athlete">运动员</option><option value="educator">训练教育创作者</option></select></label><p id="people-count" role="status"></p></div><div id="people-cards" class="people-grid"></div>
    <section class="resource-section"><div class="people-heading"><h2>视频与访谈</h2><span>中文标题均为译名</span></div><div class="people-note-grid">${store.data.videos.map(videoCard).join('')}</div></section>
    <section class="resource-section" id="unmatched-movements"><h2>动作库待补充清单</h2><p class="people-muted">首版保留独立条目，尚未向动作库添加或覆盖动作。</p><div class="people-note-grid">${store.data.movements.filter(m=>m.match==='unmatched').map(m=>movementCard(m,true)).join('')}</div></section>
    </section>
    <section id="people-graph" role="tabpanel" aria-labelledby="graph-tab" hidden><div data-philosophy-graph></div></section>`;
  document.querySelector('#people-role').value=state.role;
  const drawCards=()=>{
    const q=normalize(state.name);
    const people=store.data.people.filter(p=>(!state.role||p.roles.includes(state.role))&&normalize([p.nameZh,p.nameEn,...p.aliases].join(' ')).includes(q));
    document.querySelector('#people-count').textContent=`${people.length} / ${store.data.people.length} 位人物 · 按唯一人物统计`;
    const grid=document.querySelector('#people-cards');
    grid.innerHTML=people.length?people.map(p=>`<article class="creator-card" data-person="${esc(p.id)}"><a class="creator-photo" href="${personHref(p)}">${photo(p)}</a><div class="creator-card-copy"><small>${esc(p.identity)}</small><h3><a href="${personHref(p)}">${esc(p.nameZh)} ↗</a></h3><p class="people-english">${esc(p.nameEn)}</p><p>${esc(p.directions.join(' · '))}</p><div class="people-card-foot"><span>${p.level==='focus'?'专题整理':'基础档案 · 持续补充'}</span><a href="${personHref(p)}">进入人物资料 →</a></div></div></article>`).join(''):'<p class="people-state">没有找到人物，请试试其他名称或身份。</p>';
    bindPhotoFallback(grid); syncDirectory();
  };
  document.querySelector('#people-search').addEventListener('input',e=>{state.name=e.target.value;drawCards();});
  document.querySelector('#people-role').addEventListener('change',e=>{state.role=e.target.value;drawCards();});
  let graphStarted=false;
  const setTab=async(view,focus=false)=>{
    state.view=view;syncDirectory();
    host.querySelectorAll('[data-tab]').forEach(b=>{const active=b.dataset.tab===view;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;if(active&&focus)b.focus();});
    document.querySelector('#people-directory').hidden=view!=='people';document.querySelector('#people-graph').hidden=view!=='graph';
    if(view==='graph'&&!graphStarted){
      graphStarted=true;const target=document.querySelector('[data-philosophy-graph]');
      const start=async()=>{try{const {mountPhilosophyGraph}=await import('./fitness-people-graph.js');mountPhilosophyGraph(target,store);}catch{graphStarted=false;showLoadError(target,()=>setTab('graph'));}};await start();
    }
  };
  host.querySelectorAll('[data-tab]').forEach(b=>{
    b.addEventListener('click',()=>setTab(b.dataset.tab));
    b.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();setTab(e.key==='Home'?'people':e.key==='End'?'graph':state.view==='people'?'graph':'people',true);}});
  });
  drawCards();setTab(state.view);
}
function renderPerson() {
  const id=host.dataset.personId||new URL(location.href).searchParams.get('id');
  const p=store.maps.people.get(id);
  if(!p){host.innerHTML='<div class="people-state"><h1>没有找到这位人物</h1><p>请检查链接中的人物 ID，或返回目录选择。</p><a href="fitness-videos.html">← 返回人物目录</a></div>';return;}
  document.title=p.nameZh+' · 人物与视频 · Spike Hsu';
  const {data,maps}=store, records=data.personViews.filter(r=>r.personId===id),moves=data.movements.filter(m=>m.personId===id),videos=data.videos.filter(v=>v.personIds.includes(id)),diets=data.diets.filter(d=>d.personId===id);
  const used=[...new Set([...p.sourceIds,p.photoSourceId,...records.flatMap(r=>r.sourceIds),...moves.flatMap(m=>m.sourceIds),...videos.flatMap(v=>v.sourceIds),...diets.flatMap(d=>d.sourceIds),...(data.books||[]).filter(b=>b.personIds.includes(id)).flatMap(b=>b.sourceIds)])];
  host.innerHTML=`<nav class="fitness-breadcrumb" aria-label="当前位置"><a href="fitness.html">健身</a><span>/</span><a href="fitness-videos.html">人物与视频</a><span>/</span><span>${esc(p.nameZh)}</span></nav>
    <header class="creator-profile-header people-profile"><div><p class="kicker">PEOPLE / ${p.level==='focus'?'专题整理':'基础档案'}</p><h1>${esc(p.nameZh)}</h1><p class="people-english">${esc(p.nameEn)}</p><p>${esc(p.identity)}</p><p>${esc(p.bio)}</p><div class="creator-platforms">${p.channels.map(c=>external(c.url,c.label)).join('')}</div></div><figure>${photo(p,'eager')}<figcaption>${esc(p.photoNote)} · ${external(maps.sources.get(p.photoSourceId).url,'照片来源')}</figcaption></figure></header>
    <nav class="people-section-nav" aria-label="人物资料目录">${[['intro','介绍'],['views','训练理念'],['movements','动作'],['videos','视频'],['diet','饮食'],['sources','来源']].map(([id,label])=>`<a href="#person-${id}">${label}</a>`).join('')}</nav>
    <section class="resource-section" id="person-intro"><h2>人物介绍</h2><p>${esc(p.bio)}</p><p>内容方向：${esc(p.directions.join('、'))}。</p>${sourceLinks(p.sourceIds,maps)}</section>
    <section class="resource-section" id="person-views"><h2>训练理念</h2><p class="people-muted">以下均为资料整理者的中文归纳，保留来源中的时期和训练情境。</p>${records.length?`<div class="people-note-grid">${records.map(r=>`<article class="people-note" id="view-${esc(r.id)}"><small>${esc(maps.views.get(r.viewId).topicIds.map(t=>maps.topics.get(t).label).join(' / '))}</small><h3>${esc(maps.views.get(r.viewId).label)}</h3><p>${esc(r.claim)}</p><p class="people-context">${esc(r.period)} · ${esc(r.context)}</p>${sourceLinks(r.sourceIds,maps)}<a href="fitness-videos.html?view=graph&person=${esc(p.id)}&node=record:${esc(r.id)}">在理念图谱中查看 →</a></article>`).join('')}</div>`:pending('训练理念')}${data.relations.filter(r=>records.some(v=>v.id===r.source||v.id===r.target)).map(r=>`<aside class="people-state"><h3>时期变化：${esc(r.label)}</h3><p>${esc(r.explanation)}</p>${sourceLinks(r.sourceIds,maps)}</aside>`).join('')}</section>
    <section class="resource-section" id="person-movements"><h2>训练动作与动作库</h2><p class="people-muted">动作名称匹配不代表握法、角度和个人执行方式完全相同；具体差异单独标明。</p>${moves.length?`<div class="people-note-grid">${moves.map(m=>movementCard(m)).join('')}</div>`:pending('有来源的训练动作')}<a href="fitness-movements.html">打开完整动作库 ↗</a></section>
    <section class="resource-section" id="person-videos"><h2>训练视频与访谈</h2>${videos.length?`<div class="people-note-grid">${videos.map(videoCard).join('')}</div>`:pending('具体视频')}<p class="people-muted">只有核实后的时间点才会收录；目前未补写逐段时间点。</p></section>
    <section class="resource-section" id="person-diet"><h2>训练饮食</h2>${diets.length?diets.map(d=>`<article class="people-note"><small>${esc(d.recordType)}</small><h3>${esc(d.phase)}</h3><p>${esc(d.period)}</p><p>${esc(d.summary)}</p>${d.meals.length?`<ul>${d.meals.map(m=>`<li>${esc(m)}</li>`).join('')}</ul>`:''}<p class="people-context">如何阅读：${esc(d.application)}</p>${sourceLinks(d.sourceIds,maps)}</article>`).join(''):pending('有明确训练阶段和来源的饮食记录')}</section>
    <section class="resource-section" id="person-sources"><h2>资料来源</h2><p class="people-muted">核验日期与内容发表日期分开记录。没有可靠日期时保持空缺。</p><ol class="people-source-list">${used.map(id=>{const s=maps.sources.get(id);return `<li>${external(s.url,s.title)}<p>${esc(s.publisher)} · 发布：${esc(s.publishedAt||'未核实')} · 核验：${esc(s.verifiedAt)}</p>${s.note?`<p>${esc(s.note)}</p>`:''}</li>`;}).join('')}</ol></section>
    <nav class="fitness-related-links"><a href="fitness-videos.html">← 返回人物目录</a><a href="fitness-videos.html?view=graph&person=${esc(p.id)}">浏览此人的理念图谱 →</a></nav>`;
  bindPhotoFallback(host);
  renderBooks(id);
}
function renderBooks(id) {
  const books=(store.data.books||[]).filter(b=>b.personIds.includes(id));
  const section=document.createElement('section');section.className='resource-section';section.id='person-books';
  section.innerHTML=`<h2>著作与延伸阅读</h2><p class="people-muted">列出已核实的作者与官方著作入口；阅读笔记持续补充。</p>${books.length?`<div class="people-note-grid">${books.map(b=>`<article class="people-note book-note"><small>BOOK / 著作</small><h3>${external(b.url,b.title)}</h3><p>${esc(b.authors.join('、'))}</p><p>${esc(b.summary)}</p>${sourceLinks(b.sourceIds,store.maps)}</article>`).join('')}</div>`:pending('已核实的著作条目')}`;
  document.querySelector('#person-sources').before(section);
  const nav=document.querySelector('.people-section-nav');const link=document.createElement('a');link.href='#person-books';link.textContent='著作';nav.lastElementChild.before(link);
}
function renderVideo() {
  const id=host.dataset.videoId||new URL(location.href).searchParams.get('id');
  const v=store.maps.videos.get(id),a=store.maps.articles?.get(v?.articleId);
  if(!v||!a){host.innerHTML='<div class="people-state"><h1>没有找到这篇导读</h1><a href="fitness-videos.html">← 返回人物与视频</a></div>';return;}
  document.title=a.title+' · 视频与访谈 · Spike Hsu';
  const people=a.participants.map(id=>store.maps.people.get(id));
  const used=[...new Set([...v.sourceIds,...a.sourceIds])];
  const time=seconds=>{const h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60),s=seconds%60;return h?`${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`:`${m}:${String(s).padStart(2,'0')}`;};
  host.innerHTML=`<nav class="fitness-breadcrumb" aria-label="当前位置"><a href="fitness.html">健身</a><span>/</span><a href="fitness-videos.html">人物与视频</a><span>/</span><span>视频与访谈</span></nav>
  <header class="people-reading-header"><p class="kicker">VIDEO & CONVERSATION / 阅读导读</p><h1>${esc(a.title)}</h1><p class="people-english">${esc(v.titleOriginal)} · 中文标题为译名</p><p>${esc(v.summary)}</p><div class="people-reading-meta"><span>${esc(v.platform)}</span><span>发布者：${esc(v.publisher)}</span><span>${esc(v.publishedAt||v.dateNote)}</span></div><p>已核实参与者：${people.length?people.map(p=>`<a href="${personHref(p)}">${esc(p.nameZh)} / ${esc(p.nameEn)}</a>`).join('、'):'待补充'}</p><div class="video-note-links">${external(v.url,v.platform==='播客'?'收听原节目':'观看原视频')}<a href="#reading-1">开始阅读 ↓</a></div></header>
  <aside class="people-reading-basis"><strong>这篇导读依据什么</strong><p>${esc(a.basis)}</p><small>中文整理：${esc(a.author)} · 更新 ${esc(a.updatedAt)}。每节标明资料类型与来源。</small></aside>
  <div class="people-reading-layout"><aside class="people-reading-outline"><nav aria-label="导读目录">${a.sections.map((s,i)=>`<a href="#reading-${i+1}"><small>${String(i+1).padStart(2,'0')}</small>${esc(s.title)}</a>`).join('')}</nav>${v.keyMoments.length?`<h3>原视频章节</h3>${v.keyMoments.map(m=>{const u=new URL(v.url);u.searchParams.set('t',m.seconds);return `<div>${external(u.href,time(m.seconds)+' · '+m.label)}</div>`;}).join('')}<p class="people-muted">时间点来自视频作者公开说明。</p>`:''}</aside>
  <article class="people-reading-body">${a.sections.map((s,i)=>`<section id="reading-${i+1}"><small class="people-reading-kind">${esc(s.kind)}</small><h2>${esc(s.title)}</h2><p>${esc(s.text)}</p>${sourceLinks(s.sourceIds,store.maps)}</section>`).join('')}
  <section id="reading-sources"><h2>资料来源</h2><ol class="people-source-list">${used.map(id=>{const s=store.maps.sources.get(id);return `<li>${external(s.url,s.title)}<p>${esc(s.publisher)} · 发布：${esc(s.publishedAt||'未核实')} · 核验：${esc(s.verifiedAt)}</p></li>`;}).join('')}</ol></section></article></div>
  <nav class="fitness-related-links"><a href="fitness-videos.html">← 返回视频与访谈</a>${people.map(p=>`<a href="${personHref(p)}">${esc(p.nameZh)}的人物资料 →</a>`).join('')}</nav>`;
}
async function start(retry=false) {
  try {
    store=await loadPeople({retry});
    if(host.dataset.peopleApp==='person')renderPerson();else if(host.dataset.peopleApp==='video')renderVideo();else renderDirectory();
    const meta=document.querySelector('[data-people-total]');
    if(meta)meta.textContent=`${store.data.people.length} 位人物 · ${store.data.videos.length} 条视频`;
  } catch(error) {console.error('People library:',error);showLoadError(host,()=>start(true));}
}
if(host)start();
