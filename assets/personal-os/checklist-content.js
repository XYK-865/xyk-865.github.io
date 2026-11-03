const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const external=(href,title)=>'<a href="'+escape(href)+'" target="_blank" rel="noopener noreferrer">'+escape(title)+' ↗</a>';

export async function attachChecklistContent(structure){
 const response=await fetch('assets/personal-os/checklist.json?v=content-20261101');
 if(!response.ok)throw Error('人生清单内容暂时无法加载，请刷新后重试。');
 const checklist=await response.json(),byId=new Map(checklist.items.map(item=>[item.id,item]));
 for(const node of structure.nodes.filter(node=>node.projectId==='life-checklist')){
  node.checklistItems=node.kind==='group'?checklist.items.filter(item=>'check-'+item.category===node.id):(node.resources||[]).map(resource=>byId.get(resource.id)).filter(Boolean);
  node.checklistReferences=checklist.references;
  node.checklistAttribution=checklist.attribution;
  node.checklistSearch=node.checklistItems.map(item=>[item.title,item.core,...item.steps,item.scope].join(' ')).join(' ');
 }
 if(!document.querySelector('[data-checklist-style]')){
  const style=document.createElement('link');style.rel='stylesheet';style.href='assets/personal-os/checklist-content.css?v=content-20261101';style.dataset.checklistStyle='';document.head.append(style);
 }
 return checklist;
}

export function checklistPreview(node){
 if(!node.checklistItems?.length)return '';
 return '<div class="checklist-card-preview">'+node.checklistItems.map(item=>'<div><strong>'+escape(item.title)+'</strong><p>'+escape(item.core)+'</p><small><b>先做一步</b>'+escape(item.steps[0])+'</small></div>').join('')+'</div>';
}

export function checklistDetails(node){
 if(!node.checklistItems?.length)return '';
 const attribution=node.checklistAttribution;
 return '<section class="branch-detail-section checklist-branch-content"><p class="kicker">READ & TRY / 内容与行动</p><h2>这个分支的实质内容</h2><p class="checklist-reading-note">先读核心内容，选择一个小步骤；复盘问题放在每条末尾，按需展开。</p><div class="checklist-detail-items">'+node.checklistItems.map(item=>{
  const refs=(item.verificationRefs||[]).map(id=>node.checklistReferences[id]).filter(Boolean);
  return '<article class="checklist-content-item" id="'+escape(item.id)+'"><header><span>生活清单 · '+escape(item.status)+'</span><h3>'+escape(item.title)+'</h3></header><div class="checklist-core"><h4>核心内容</h4><p>'+escape(item.core)+'</p></div><div class="checklist-steps"><h4>可执行步骤</h4><ol>'+item.steps.map(step=>'<li>'+escape(step)+'</li>').join('')+'</ol></div><div class="checklist-scope"><h4>适用与限制</h4><p>'+escape(item.scope)+'</p></div><div class="checklist-sources"><h4>原文来源</h4><p>'+external(item.sourceSnapshotURL,item.sourceTitle)+(item.sourceSections.length?' <span>原章第 '+escape(item.sourceSections.join('、'))+' 条</span>':'')+'</p><p>'+external(item.sourceURL,'查看原章最新版本')+'</p>'+(refs.length?'<details><summary>官方对照资料 · '+refs.length+' 项</summary><ul>'+refs.map(ref=>'<li>'+external(ref.url,ref.title)+'<small>'+escape(ref.supports)+' · 查阅 '+escape(ref.checkedAt)+'</small></li>').join('')+'</ul><p>对照范围见各链接说明；不代表已验证原章节全部研究、统计或个案结论。</p></details>':'')+'</div><details class="checklist-reflection"><summary>补充复盘问题</summary><p>'+escape(item.reflection)+'</p><a href="decision-model.html#quadrants">用四宫格继续梳理 →</a></details></article>';
 }).join('')+'</div><footer class="checklist-content-credit"><p>参考 '+external(attribution.repositoryURL,attribution.title)+'（'+escape(attribution.creator)+'），按 '+external(attribution.licenseURL,attribution.license)+' 使用。'+escape(attribution.adaptationNotice)+'</p><p>来源快照 '+escape(attribution.snapshot.slice(0,7))+' · 整理日期 '+escape(attribution.checkedAt)+'。健康、法律与财务条目需结合个人情况及当地现行规则。</p></footer></section>';
}
