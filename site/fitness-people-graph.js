import {createGraph2D} from './fitness-science-2d.js';
import {esc,sourceLinks,personHref,normalize} from './fitness-people-store.js';

export const PEOPLE_RELATIONS={
  contains:{label:'包含',color:'#879298'},
  shared:{label:'共同观点',color:'#4d8b77'},
  practice:{label:'具体做法',color:'#547f9b'},
  disagreement:{label:'明确分歧',color:'#b16b75',dashed:true},
  change:{label:'时期变化',color:'#a78355',dashed:true}
};
// Reachability is recomputed from visible paths: a collapsed branch cannot remove
// a shared view that is still reached through another expanded theme.
export function buildPeopleGraph(data,{person='',topic='',query='',expanded=new Set(),selected='',edge=''}={}) {
  const q=normalize(query);
  const people=new Map(data.people.map(p=>[p.id,p]));
  let records=data.personViews.filter(r=>!person||r.personId===person);
  const matchingViews=new Set(data.views.filter(v=>normalize([v.label,v.description,...(v.aliases||[]),...v.topicIds.map(id=>data.topics.find(t=>t.id===id)?.label)].join(' ')).includes(q)).map(v=>v.id));
  if(q)records=records.filter(r=>matchingViews.has(r.viewId)||normalize([r.claim,r.period,r.context,people.get(r.personId).nameZh,people.get(r.personId).nameEn,...people.get(r.personId).aliases].join(' ')).includes(q));
  const views=data.views.filter(v=>(!topic||v.topicIds.includes(topic))&&records.some(r=>r.viewId===v.id));
  const topics=data.topics.filter(t=>(!topic||t.id===topic)&&views.some(v=>v.topicIds.includes(t.id)));
  const nodes=new Map(),edges=new Map();
  const add=(id,label,category,depth,entity)=>nodes.set(id,{id,label,category,depth,entity});
  const link=(id,source,target,kind,label,explanation,sourceIds=[])=>edges.set(id,{id,source,target,kind,label,explanation,sourceIds,direction:'directed'});
  add('root','训练理念','阅读起点',0,null);
  for(const t of topics) {
    const tid='topic:'+t.id;add(tid,t.label,'共性主题',1,t);
    link('root-'+t.id,'root',tid,'contains','包含主题','主题分类是整理者提供的阅读入口，不代表所有人物都支持同一观点。');
    if(!expanded.has(tid)&&!q)continue;
    for(const v of views.filter(v=>v.topicIds.includes(t.id))) {
      const vid='view:'+v.id,rs=records.filter(r=>r.viewId===v.id);
      const shared=new Set(data.personViews.filter(r=>r.viewId===v.id).map(r=>r.personId)).size>=2;
      add(vid,v.label,shared?'共同观点':'个人做法',2,v);
      link(tid+'-'+vid,tid,vid,shared?'shared':'contains',shared?'共同观点':'个人做法',v.description,rs.flatMap(r=>r.sourceIds));
      if(!expanded.has(vid)&&!q)continue;
      for(const r of rs){const rid='record:'+r.id;add(rid,people.get(r.personId).nameZh,'人物做法',3,r);link(vid+'-'+rid,vid,rid,'practice','具体做法',r.claim,r.sourceIds);}
    }
  }
  for(const r of data.relations){const a='record:'+r.source,b='record:'+r.target;if(nodes.has(a)&&nodes.has(b))link('relation:'+r.id,a,b,r.kind,r.label,r.explanation,r.sourceIds);}
  for(let depth=0;depth<4;depth++){
    const column=[...nodes.values()].filter(n=>n.depth===depth);
    column.forEach((n,i)=>{n.x=[.02,.27,.56,.88][depth];n.y=(i+.5)/column.length*.88;n.degree=[...edges.values()].filter(e=>e.source===n.id||e.target===n.id).length;n.crossDomainDegree=0;});
  }
  return {nodes:[...nodes.values()],edges:[...edges.values()],selectedId:selected,selectedEdgeId:edge,recordCount:records.filter(r=>views.some(v=>v.id===r.viewId)).length};
}
export function mountPhilosophyGraph(host,{data,maps}) {
  const params=new URL(location.href).searchParams;
  const expanded=new Set((params.get('open')||'').split(',').filter(Boolean));
  const state={person:params.get('person')||'',topic:params.get('topic')||'',query:params.get('q')||'',expanded,selected:params.get('node')||'',edge:'',mode:matchMedia('(max-width:700px)').matches?'list':'graph'};
  if(!maps.people.has(state.person))state.person='';if(!maps.topics.has(state.topic))state.topic='';
  function openPath(id){
    const record=id.startsWith('record:')&&maps.personViews.get(id.slice(7));
    const v=record?maps.views.get(record.viewId):id.startsWith('view:')&&maps.views.get(id.slice(5));
    if(v){v.topicIds.forEach(t=>expanded.add('topic:'+t));if(record)expanded.add('view:'+v.id);}
  }
  // A person-page deep link has no expansion state; restored graph URLs do.
  // Do not reopen other parent themes when refreshing a shared selected view.
  if(!params.has('open'))openPath(state.selected);
  host.innerHTML=`<div class="people-heading"><div><p class="kicker">IDEAS / 从共性看到差异</p><h2>训练理念图谱</h2></div><p>主题 → 观点 → 人物在特定情境中的做法</p></div>
    <div class="people-filters graph-filters"><label>人物<select data-filter="person"><option value="">全部人物</option>${data.people.map(p=>`<option value="${esc(p.id)}">${esc(p.nameZh)}</option>`).join('')}</select></label><label>主题<select data-filter="topic"><option value="">全部主题</option>${data.topics.map(t=>`<option value="${esc(t.id)}">${esc(t.label)}</option>`).join('')}</select></label><label>搜索节点<input data-filter="query" type="search" placeholder="动作控制、恢复、人物名称…"></label></div>
    <div class="people-graph-tools"><div><button data-mode="graph">图形</button><button data-mode="list">列表</button></div><div><button data-zoom="1.25" aria-label="放大图谱">＋</button><button data-zoom="0.8" aria-label="缩小图谱">−</button><button data-reset>重置视图与筛选</button></div></div>
    <div class="people-legend">${Object.entries(PEOPLE_RELATIONS).map(([id,v])=>`<span><i style="--relation:${v.color}"></i>${esc(v.label)}${id==='disagreement'?'（暂未收录）':''}</span>`).join('')}</div>
    <p class="people-muted">点击主题或观点展开／收起，同时查看依据。相同主题不表示做法相同；没有资料不代表反对。未收录的六位人物暂不生成推测连线。</p>
    <p data-graph-status role="status"></p><div class="people-graph-workspace"><div><div class="people-graph-canvas" data-graph-canvas></div><div class="people-graph-list" data-graph-list hidden></div><p class="people-graph-help">空白处拖动平移 · 滚轮或 ＋ / − 缩放 · 图形获焦后方向键移动、Home 复位 · 节点 Enter / 空格选择</p></div><aside class="people-graph-detail" data-graph-detail aria-label="选中节点或关系的说明" aria-live="polite"></aside></div>`;
  const canvas=host.querySelector('[data-graph-canvas]'),list=host.querySelector('[data-graph-list]'),panel=host.querySelector('[data-graph-detail]');
  const renderer=createGraph2D(canvas,{kinds:PEOPLE_RELATIONS,onNode:selectNode,onEdge:selectEdge});
  let graph;
  function sync(){
    const u=new URL(location.href);
    for(const [key,value] of Object.entries({person:state.person,topic:state.topic,q:state.query,open:[...expanded].sort().join(','),node:state.selected})) value?u.searchParams.set(key,value):u.searchParams.delete(key);
    history.replaceState(null,'',u);
  }
  function detail(){
    const e=graph.edges.find(e=>e.id===state.edge),n=graph.nodes.find(n=>n.id===state.selected);
    if(e){panel.innerHTML=`<small>关系 · ${esc(PEOPLE_RELATIONS[e.kind].label)}</small><h3>${esc(e.label)}</h3><p>${esc(graph.nodes.find(n=>n.id===e.source).label)} → ${esc(graph.nodes.find(n=>n.id===e.target).label)}</p><p>${esc(e.explanation)}</p>${e.sourceIds.length?sourceLinks(e.sourceIds,maps):'<p>结构分类，由整理者组织。</p>'}`;return;}
    if(!graph.recordCount){panel.innerHTML='<h3>暂无匹配的已核实观点</h3><p>这位人物的训练理念可能尚待整理，也可以尝试其他关键词或主题。资料空缺不代表他反对某种观点。</p>';return;}
    if(!n||n.depth===0){panel.innerHTML='<small>阅读图谱</small><h3>先选一个主题</h3><p>初始只显示主题。展开后比较具体观点，再看每个人的做法和资料出处。</p><p>共性仅归纳到资料支持的范围。明确分歧目前没有足够记录，不生成反对关系。</p>';return;}
    if(n.depth===1){
      const views=data.views.filter(v=>v.topicIds.includes(n.entity.id)),rs=data.personViews.filter(r=>views.some(v=>v.id===r.viewId)&&(!state.person||r.personId===state.person));
      const ids=[...new Set(rs.map(r=>r.personId))];
      panel.innerHTML=`<small>共性主题 · 整理者分类</small><h3>${esc(n.label)}</h3><p>${esc(n.entity.description)}</p><p>有来源的相关人物：${ids.map(id=>esc(maps.people.get(id).nameZh)).join('、')}。</p><p>展开具体观点后，查看共同点与各自的细节。</p>${sourceLinks(rs.flatMap(r=>r.sourceIds),maps)}`;
    } else if(n.depth===2){
      const rs=data.personViews.filter(r=>r.viewId===n.entity.id&&(!state.person||r.personId===state.person));
      panel.innerHTML=`<small>${esc(n.category)} · 整理者归纳</small><h3>${esc(n.label)}</h3><p>${esc(n.entity.description)}</p>${rs.map(r=>`<h4>${esc(maps.people.get(r.personId).nameZh)}</h4><p>${esc(r.claim)}</p><p class="people-context">${esc(r.period)} · ${esc(r.context)}</p>${sourceLinks(r.sourceIds,maps)}`).join('')}`;
    } else {
      const r=n.entity,p=maps.people.get(r.personId);
      panel.innerHTML=`<small>人物在具体情境中的做法</small><h3>${esc(p.nameZh)}</h3><p>${esc(maps.views.get(r.viewId).label)}</p><p>${esc(r.claim)}</p><p class="people-context">${esc(r.period)} · ${esc(r.context)}</p>${sourceLinks(r.sourceIds,maps)}<a href="${personHref(p)}#view-${esc(r.id)}">进入人物详情 →</a>`;
    }
    if(n.depth<3)panel.insertAdjacentHTML('beforeend',`<button class="people-action" data-toggle-selected>${expanded.has(n.id)?'收起':'展开'}这个分支</button>`);
  }
  function draw(){
    const focused=document.activeElement?.dataset.graphNode||document.activeElement?.dataset.listNode;
    const focusedEdge=document.activeElement?.dataset.graphEdge;
    graph=buildPeopleGraph(data,state);renderer.update(graph);
    host.querySelector('[data-graph-status]').textContent=`${graph.nodes.length} 个可见节点 · ${graph.edges.length} 条关系 · ${graph.recordCount} 条匹配的观点记录`;
    list.innerHTML=[0,1,2,3].map(depth=>`<section><h3>${['阅读起点','共性主题','具体观点','人物做法'][depth]}</h3>${graph.nodes.filter(n=>n.depth===depth).map(n=>`<button data-list-node="${esc(n.id)}" aria-pressed="${n.id===state.selected}" ${depth>0&&depth<3?`aria-expanded="${expanded.has(n.id)||!!state.query}"`:''}><strong>${esc(n.label)}</strong><small>${esc(n.category)}${depth===3?' · '+esc(n.entity.period):''}</small>${depth>0&&depth<3?`<span>${expanded.has(n.id)?'− 收起':'+ 展开'}</span>`:''}</button>`).join('')}</section>`).join('');
    canvas.hidden=state.mode!=='graph';list.hidden=state.mode!=='list';
    host.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===state.mode)));
    detail();sync();
    if(focused){const button=(state.mode==='graph'?canvas:list).querySelector(`[${state.mode==='graph'?'data-graph-node':'data-list-node'}="${CSS.escape(focused)}"]`);button?.focus({preventScroll:true});}
    if(focusedEdge)canvas.querySelector(`[data-graph-edge="${CSS.escape(focusedEdge)}"]`)?.focus({preventScroll:true});
  }
  function selectNode(id){state.selected=id;state.edge='';if(id.startsWith('topic:')||id.startsWith('view:'))expanded.has(id)?expanded.delete(id):expanded.add(id);draw();}
  function selectEdge(id){state.edge=id;state.selected='';draw();}
  host.querySelectorAll('[data-filter]').forEach(input=>{
    input.value=state[input.dataset.filter];
    input.addEventListener(input.tagName==='INPUT'?'input':'change',()=>{state[input.dataset.filter]=input.value;state.selected='';state.edge='';draw();});
  });
  host.addEventListener('click',e=>{
    const mode=e.target.closest('[data-mode]'),zoom=e.target.closest('[data-zoom]'),node=e.target.closest('[data-list-node]');
    if(mode){state.mode=mode.dataset.mode;draw();renderer.reset();}
    if(zoom)renderer.zoom(Number(zoom.dataset.zoom));
    if(node)selectNode(node.dataset.listNode);
    if(e.target.closest('[data-toggle-selected]'))selectNode(state.selected);
    if(e.target.closest('[data-reset]')){
      Object.assign(state,{person:'',topic:'',query:'',selected:'',edge:''});expanded.clear();host.querySelectorAll('[data-filter]').forEach(el=>el.value='');renderer.reset();draw();
    }
  });
  draw();
}
