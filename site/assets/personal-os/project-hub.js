import {renderProjectGraph} from './project-graph.js?v=project-split-20261102';
import {renderDecisionFlow} from './decision-workbench.js?v=guided-20261101';
import {attachChecklistContent,checklistPreview,checklistDetails} from './checklist-content.js?v=content-20261101';

const $=selector=>document.querySelector(selector);
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const branchHref=node=>'project-branch.html?project='+encodeURIComponent(node.projectId)+'&branch='+encodeURIComponent(node.id);
const guide=$('[data-project-guide]'),hub=$('[data-project-hub]');
function openGuide(){
 if(!guide)return;
 // Old bookmarks for relocated material open its new project, preserving the section.
 let hash;try{hash=decodeURIComponent(location.hash.slice(1));}catch{}
 if(hub?.dataset.projectHub==='personal-os'&&(/^(mother-questions|knowledge|action-engine|cross-domain|evolution|templates)$/.test(hash||'')||/^MQ-\d{3}$/.test(hash||''))){
  location.replace('mother-questions.html?view=guide#'+encodeURIComponent(hash));return;
 }
 let target;try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{}
 if(new URL(location.href).searchParams.get('view')==='guide'||target&&guide.contains(target)){
  guide.open=true;
  requestAnimationFrame(()=>{(target||guide).scrollIntoView({block:'start',behavior:'instant'});});
 }
}
if(guide){
 openGuide();addEventListener('hashchange',openGuide);
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href^="#"]');if(!link)return;
  const target=document.getElementById(link.getAttribute('href').slice(1));
  if(target&&guide.contains(target))guide.open=true;
 });
}

async function loadStructure(){
 const response=await fetch('assets/personal-os/project-structure.json?v=project-split-20261102');
 if(!response.ok)throw Error('项目结构暂时无法加载，请刷新后重试。');
 return response.json();
}

function createIndex(data){
 const byId=new Map(data.nodes.map(node=>[node.id,node])),children=new Map();
 for(const node of data.nodes){const key=node.parentId||'';if(!children.has(key))children.set(key,[]);children.get(key).push(node);}
 const childNodes=node=>children.get(node.id)||[];
 const ancestors=node=>{const result=[];let next=byId.get(node.parentId);while(next){result.unshift(next);next=byId.get(next.parentId);}return result;};
 const descendants=node=>[node,...childNodes(node).flatMap(descendants)];
 const resources=node=>[...new Map(descendants(node).flatMap(n=>n.resources||[]).map(resource=>[resource.href,resource])).values()];
 return{byId,childNodes,ancestors,descendants,resources};
}

function resourceLink(resource){
 const download=resource.type==='模板'?' download':'';
 return '<a class="branch-resource" href="'+escape(resource.href)+'"'+download+'><span class="branch-resource-type">'+escape(resource.type)+'</span><span><strong>'+escape(resource.title)+'</strong>'+(resource.summary?'<small>'+escape(resource.summary)+'</small>':'')+'</span><b aria-hidden="true">'+(download?'↓':'↗')+'</b></a>';
}

function card(node,index){
 const children=index.childNodes(node),resources=index.resources(node);
 if(node.checklistItems?.length)return '<a class="branch-card checklist-preview-card" data-branch-card="'+escape(node.id)+'" href="'+branchHref(node)+'"><span class="branch-card-type">'+node.checklistItems.length+' 条内容 · 含行动步骤</span><h3>'+escape(node.title)+'</h3>'+checklistPreview(node)+'<span class="branch-card-meta">阅读全文、适用限制与来源<span aria-hidden="true">→</span></span></a>';
 return '<a class="branch-card" data-branch-card="'+escape(node.id)+'" href="'+branchHref(node)+'"><span class="branch-card-type">'+(children.length?'分支目录':'内容分支')+'</span><h3>'+escape(node.title)+'</h3><p>'+escape(node.summary)+'</p><span class="branch-card-meta">'+(children.length?children.length+' 个子分支 · ':'')+resources.length+' 个资料入口<span aria-hidden="true">→</span></span></a>';
}

function relatedNodes(node,data,index){
 const ids=new Set(node.relatedIds||[]),labels=new Map();
 for(const relation of data.relations){
  if(relation.source===node.id){ids.add(relation.target);labels.set(relation.target,relation.label);}
  else if(relation.target===node.id){ids.add(relation.source);labels.set(relation.source,relation.label);}
 }
 return [...ids].map(id=>({node:index.byId.get(id),label:labels.get(id)||'相关分支'})).filter(item=>item.node);
}

function renderSelection(panel,node,data,index){
 const path=index.ancestors(node).map(n=>n.title).join(' / '),related=relatedNodes(node,data,index);
 panel.innerHTML='<p class="branch-panel-kicker">'+escape(path||'当前分类')+'</p><h3>'+escape(node.title)+'</h3><p>'+escape(node.summary)+'</p><a class="branch-primary-link" href="'+branchHref(node)+'">进入这个分支 →</a>'+(related.length?'<h4>相连的分支</h4><ul>'+related.map(({node:other,label})=>'<li><a href="'+branchHref(other)+'"><small>'+escape(label)+'</small>'+escape(other.title)+' ↗</a></li>').join('')+'</ul>':'');
}

function renderPortal(data){
 const index=createIndex(data),project=data.projects.find(project=>project.id===hub.dataset.projectHub);
 if(!project)throw Error('没有找到这个项目的目录。');
 const own=data.nodes.filter(node=>node.projectId===project.id),roots=own.filter(node=>!node.parentId),leaves=own.filter(node=>node.kind==='branch');
 const uniqueResources=new Map(own.flatMap(node=>node.resources||[]).map(resource=>[resource.href,resource]));
 hub.innerHTML='<div class="project-hub-heading"><div><p class="kicker">EXPLORE / 项目结构</p><h2>从一个分支开始</h2><p>先看分类，再沿着问题进入资料。也可以换一种方式，看看它们如何相连。</p></div><a href="#project-guide">阅读核心说明 ↗</a></div><div class="project-hub-stats"><span><b>'+roots.length+'</b>个分类</span><span><b>'+leaves.length+'</b>个内容分支</span><span><b>'+uniqueResources.size+'</b>个资料入口</span></div><div class="project-explorer-toolbar"><div class="project-view-switch" role="group" aria-label="浏览项目的方式"><button type="button" data-project-view="cards" aria-pressed="true">分类卡片</button><button type="button" data-project-view="tree" aria-pressed="false">树形目录</button><button type="button" data-project-view="network" aria-pressed="false">知识网络</button></div><div class="project-explorer-inputs"><label><span class="sr-only">搜索分支与资料</span><input type="search" id="branch-query" placeholder="搜索分支、问题或资料" autocomplete="off"></label><label><span class="sr-only">选择项目分类</span><select id="branch-category"><option value="all">全部分类</option>'+roots.map(root=>'<option value="'+escape(root.id)+'">'+escape(root.title)+'</option>').join('')+'</select></label></div></div><p id="branch-result-count" role="status" aria-live="polite"></p><div class="project-explorer-view" id="project-cards-view" data-project-panel="cards"></div><div class="project-explorer-view" id="project-tree-view" data-project-panel="tree" hidden></div><div class="project-explorer-view" id="project-network-view" data-project-panel="network" hidden><div class="project-network-layout"><div id="project-network-canvas"></div><aside id="project-network-selection" class="branch-network-selection" aria-live="polite"><h3>选择一个节点</h3><p>查看这个分支的内容，以及它与其他分支的关联。</p></aside></div><p class="project-network-caption">实线展示分类层级；关联线展示内容的应用和反馈路径。节点关系用于导航。</p></div><p class="project-explorer-empty" id="branch-empty" hidden>没有找到对应分支，试试其他关键词或分类。</p>';
 if(project.id==='life-checklist'){
  const heading=hub.querySelector('.project-hub-heading');
  heading.querySelector('h2').textContent='先看内容，再选一步行动';
  heading.querySelector('p:not(.kicker)').textContent='七类主题、28 条内容。分类里直接预览要点，进入分支阅读步骤、适用限制和原文来源。';
  heading.querySelector('a').textContent='阅读完整清单与署名 ↗';
  heading.insertAdjacentHTML('afterend','<p class="checklist-portal-credit">参考 <a href="https://github.com/eternity4719/HowToLiveBetter" target="_blank" rel="noopener noreferrer">eternity4719 / HowToLiveBetter</a>，按 <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> 改写并补充步骤；原文与官方对照见各内容分支。</p>');
 }
 let mode='cards',graph=null,world=null,worldTicket=0;
 if(project.id==='decision-model'){
  hub.querySelector('[data-project-view=network]').textContent='流程与返回路径';
  hub.querySelector('.project-network-caption').textContent='01 → 06 展示先后步骤；检查点的新证据会带你返回比较、协商或下一轮行动。';
 }
 const query=$('#branch-query'),category=$('#branch-category');
 const rootOf=node=>index.ancestors(node)[0]||node;
 const visible=()=>{
  const term=query.value.trim().toLocaleLowerCase();
  const matches=own.filter(node=>(category.value==='all'||rootOf(node).id===category.value)&&(!term||[node,...index.ancestors(node)].some(n=>[n.title,n.summary,n.checklistSearch||'',...(n.resources||[]).map(r=>r.title+' '+(r.summary||''))].join(' ').toLocaleLowerCase().includes(term))));
  const ids=new Set(matches.flatMap(node=>[node,...index.ancestors(node)].map(node=>node.id)));
  return{matches,ids};
 };
 function drawCards(ids){
  $('#project-cards-view').innerHTML=roots.filter(root=>ids.has(root.id)).map(root=>{
   const nodes=index.childNodes(root).filter(node=>ids.has(node.id));
   const showWorld=project.id==='personal-os'&&root.id==='os-domains'&&!query.value.trim();
   const cards='<div class="branch-card-grid">'+(nodes.length?nodes.map(node=>card(node,index)).join(''):card(root,index))+'</div>';
   return '<section class="branch-card-group"><header><div><h3>'+escape(root.title)+'</h3><p>'+escape(root.summary)+'</p></div><a href="'+branchHref(root)+'">查看分类 →</a></header>'+(showWorld?'<div data-domain-world><p role="status">正在展开人生领域的立体结构…</p></div><details class="domain-card-index"><summary>查看八个领域的分支与资料</summary>'+cards+'</details>':cards)+'</section>';
  }).join('');
  const slot=hub.querySelector('[data-domain-world]');
  if(slot){
   const ticket=worldTicket;
   import('./domain-world.js?v=local-design-20261101').then(({renderLifeDomains})=>{
    if(ticket!==worldTicket||!slot.isConnected)return;
    world=renderLifeDomains({container:slot,nodes:index.childNodes(index.byId.get('os-domains')),branchHref,onSelect:node=>{for(const card of hub.querySelectorAll('[data-branch-card]'))card.classList.toggle('domain-linked-card',card.dataset.branchCard===node.id);}});
   }).catch(()=>{if(slot.isConnected)slot.innerHTML='<p>立体视图暂未载入，仍可展开下方领域目录继续阅读。</p>';});
  }
 }
 function treeNode(node,ids,depth=0){
  const children=index.childNodes(node).filter(node=>ids.has(node.id)),resources=node.resources||[];
  return '<details class="project-tree-node" data-tree-node="'+escape(node.id)+'"'+(depth===0||query.value.trim()?' open':'')+'><summary><span class="project-tree-indicator" aria-hidden="true">'+(depth===0?'▤':'◇')+'</span><span><strong>'+escape(node.title)+'</strong><small>'+index.resources(node).length+' 个资料入口'+(children.length?' · '+children.length+' 个子分支':'')+'</small></span></summary><div class="project-tree-children"><p>'+escape(node.summary)+'</p><a class="project-tree-open" href="'+branchHref(node)+'">进入'+(node.kind==='group'?'分类':'分支')+' →</a>'+children.map(child=>treeNode(child,ids,depth+1)).join('')+(resources.length?'<ul class="project-tree-resources">'+resources.map(resource=>'<li><a href="'+escape(resource.href)+'">'+escape(resource.title)+'<span>'+escape(resource.type)+'</span></a></li>').join('')+'</ul>':'')+'</div></details>';
 }
 function drawTree(ids){
  $('#project-tree-view').innerHTML='<div class="project-tree-actions"><button type="button" data-tree-toggle="open">展开全部</button><button type="button" data-tree-toggle="close">收起全部</button></div><div class="project-tree">'+roots.filter(root=>ids.has(root.id)).map(root=>treeNode(root,ids)).join('')+'</div>';
  for(const button of hub.querySelectorAll('[data-tree-toggle]'))button.addEventListener('click',()=>{for(const details of hub.querySelectorAll('.project-tree-node'))details.open=button.dataset.treeToggle==='open';});
 }
 function update(){
  const flowMode=project.id==='decision-model'&&mode==='network';
  const {matches,ids}=flowMode?{matches:own,ids:new Set(own.map(node=>node.id))}:visible(),leafCount=matches.filter(node=>node.kind==='branch').length;
  hub.querySelector('.project-explorer-inputs').hidden=flowMode;
  $('#branch-result-count').textContent=flowMode?'始终展示完整六步；点击查看输入、输出与返回路径':query.value||category.value!=='all'?leafCount+' 个内容分支匹配当前条件':'选择分类，或切换目录和关系视图';
  $('#branch-empty').hidden=ids.size>0;
  for(const panel of hub.querySelectorAll('[data-project-panel]'))panel.hidden=panel.dataset.projectPanel!==mode||ids.size===0;
  graph?.destroy();graph=null;worldTicket++;world?.destroy();world=null;
  if(mode==='cards')drawCards(ids);
  if(mode==='tree')drawTree(ids);
  if(mode==='network'&&ids.size){
   const expanded=new Set(ids);
   for(const relation of data.relations){if(ids.has(relation.source))expanded.add(relation.target);if(ids.has(relation.target))expanded.add(relation.source);}
   const nodes=data.nodes.filter(node=>expanded.has(node.id));
   const relations=data.relations.filter(relation=>expanded.has(relation.source)&&expanded.has(relation.target));
   graph=project.id==='decision-model'?renderDecisionFlow({container:$('#project-network-canvas')}):renderProjectGraph({container:$('#project-network-canvas'),nodes,relations,projectId:project.id,branchHref,onSelect:node=>renderSelection($('#project-network-selection'),node,data,index)});
  }
  for(const button of hub.querySelectorAll('[data-project-view]'))button.setAttribute('aria-pressed',String(button.dataset.projectView===mode));
 }
 function setMode(value,persist=true){
  mode=['cards','tree','network'].includes(value)?value:'cards';
  if(persist){const url=new URL(location.href);url.searchParams.set('view',mode);history.replaceState(null,'',url);}
  update();
 }
 for(const button of hub.querySelectorAll('[data-project-view]'))button.addEventListener('click',()=>setMode(button.dataset.projectView));
 query.addEventListener('input',update);category.addEventListener('change',update);
 setMode(new URL(location.href).searchParams.get('view'),false);
}

function renderBranch(data,main){
 const index=createIndex(data),params=new URL(location.href).searchParams,node=index.byId.get(params.get('branch'));
 if(node&&params.get('project')!==node.projectId&&(node.previousProjectIds||[]).includes(params.get('project'))){
  params.set('project',node.projectId);history.replaceState(null,'',location.pathname+'?'+params.toString()+location.hash);
 }
 if(!node||params.get('project')&&params.get('project')!==node.projectId){
  main.innerHTML='<section class="branch-not-found"><p class="kicker">PROJECTS</p><h1>没有找到这个分支</h1><p>从项目总览重新选择一个分类或内容分支。</p><a href="projects.html">返回项目与作品 →</a></section>';return;
 }
 const project=data.projects.find(project=>project.id===node.projectId),ancestors=index.ancestors(node),children=index.childNodes(node),resources=node.resources||[],related=relatedNodes(node,data,index);
 document.body.classList.add('project-'+node.projectId);
 document.title=node.title+' · '+project.title+' · Spike Hsu';
 main.innerHTML='<nav class="life-breadcrumb" aria-label="面包屑"><a href="projects.html">项目</a><span>/</span><a href="'+project.id+'.html">'+escape(project.title)+'</a>'+ancestors.map(ancestor=>'<span>/</span><a href="'+branchHref(ancestor)+'">'+escape(ancestor.title)+'</a>').join('')+'<span>/</span><span>'+escape(node.title)+'</span></nav><header class="branch-detail-header"><p class="kicker">'+(node.kind==='group'?'CATEGORY / 分类':'BRANCH / 内容分支')+'</p><h1>'+escape(node.title)+'</h1><p>'+escape(node.summary)+'</p><div class="branch-detail-meta">'+(children.length?'<span>'+children.length+' 个子分支</span>':'')+'<span>'+index.resources(node).length+' 个资料入口</span><a href="'+project.id+'.html?view=tree">在目录中查看 ↗</a></div></header><div class="branch-detail-layout"><div>'+(children.length?'<section class="branch-detail-section"><h2>继续向下探索</h2><div class="branch-card-grid">'+children.map(child=>card(child,index)).join('')+'</div></section>':'')+(resources.length?'<section class="branch-detail-section"><h2>这个分支里的资料</h2><div class="branch-resource-list">'+resources.map(resourceLink).join('')+'</div></section>':'')+((node.prompts||[]).length?'<section class="branch-detail-section branch-reflection"><p class="kicker">REVIEW / 带着问题回看</p><h2>下一次，可以问自己</h2><ol>'+node.prompts.map(prompt=>'<li>'+escape(prompt)+'</li>').join('')+'</ol><a href="assets/personal-os/templates/review.md" download>下载空白复盘模板 ↓</a></section>':'')+'</div><aside class="branch-detail-aside"><section><h2>所在位置</h2><a href="'+project.id+'.html">'+escape(project.title)+'</a><ol>'+[...ancestors,node].map(item=>'<li>'+ (item.id===node.id?'<strong>'+escape(item.title)+'</strong>':'<a href="'+branchHref(item)+'">'+escape(item.title)+'</a>')+'</li>').join('')+'</ol></section>'+(related.length?'<section><h2>相连的分支</h2>'+related.map(({node:other,label})=>'<a class="branch-related-link" href="'+branchHref(other)+'"><small>'+escape(label)+'</small><strong>'+escape(other.title)+' ↗</strong><span>'+escape(data.projects.find(project=>project.id===other.projectId)?.title||'')+'</span></a>').join('')+'</section>':'')+'<section class="branch-overview-links"><a href="'+project.id+'.html?view=cards">分类卡片 →</a><a href="'+project.id+'.html?view=tree">树形目录 →</a><a href="'+project.id+'.html?view=network">知识网络 →</a></section></aside></div><footer class="life-page-end"><a href="'+project.id+'.html">← 返回项目总览</a><a href="#main">返回顶部 ↑</a></footer>';
 if(node.checklistItems?.length){
  const column=main.querySelector('.branch-detail-layout>div');
  column.querySelector('.branch-reflection')?.remove();
  column.querySelector('.branch-resource-list')?.closest('section').remove();
  column.insertAdjacentHTML('afterbegin',checklistDetails(node));
 }
}

const branchMain=$('[data-project-branch]');
if(hub||branchMain){
 try{
  const data=await loadStructure(),branchId=new URL(location.href).searchParams.get('branch');
  if(hub?.dataset.projectHub==='life-checklist'||branchMain&&data.nodes.some(node=>node.id===branchId&&node.projectId==='life-checklist'))await attachChecklistContent(data);
  if(hub)renderPortal(data);if(branchMain)renderBranch(data,branchMain);
 }
 catch(error){const target=hub||branchMain;target.innerHTML='<p class="project-load-error" role="alert">'+escape(error.message)+'</p><a href="projects.html">返回项目页 →</a>';}
}
