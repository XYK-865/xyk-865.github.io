(() => {
 'use strict';
 // Keep attribution and source visible while moving editorial notes out of the reading flow.
 const note=document.querySelector('.blog-import-note');
 const paragraphs=note ? [...note.querySelectorAll(':scope > p')] : [];
 if(paragraphs.length>2 && paragraphs[0].textContent.trim().startsWith('作者')){
  const original=paragraphs[1].querySelector('a[href]');
  const extra=paragraphs.slice(2);
  const details=document.createElement('details');
  const summary=document.createElement('summary');
  summary.textContent='版权与整理说明';details.append(summary);
  for(const paragraph of extra){
   const link=paragraph.querySelector('a:only-child');
   if(original && link?.href===original.href && paragraph.textContent.trim()===link.href)paragraph.remove();
   else details.append(paragraph);
  }
  if(details.children.length>1)note.append(details);
 }

 // Keep long tables of contents scannable while preserving every original anchor.
 const chapters=document.querySelector('.blog-reading-toc details > ol');
 const groupsByTarget=new Map();
 if(chapters && chapters.children.length>=15){
  let chapter;
  let children;
  for(const item of [...chapters.children]){
   if(item.classList.contains('toc-level-2')){
    chapter=item;
    children=null;
   }else if(chapter && item.classList.contains('toc-level-3')){
    if(!children){
     const group=document.createElement('details');
     group.className='toc-subsections';
     const label=document.createElement('summary');
     label.textContent='小节';
     label.setAttribute('aria-label',chapter.querySelector('a').textContent+'的小节');
     children=document.createElement('ol');
     group.append(label,children);
     chapter.append(group);
    }
    children.append(item);
    const link=item.querySelector('a');
    if(link)groupsByTarget.set(link.hash,children.parentElement);
   }
  }
 }
 const openTarget=()=>{
  if(!location.hash)return;
  let id;
  try{id=decodeURIComponent(location.hash.slice(1))}catch{return}
  const target=document.getElementById(id);
  if(!target)return;
  const group=groupsByTarget.get(location.hash);
  if(group)group.open=true;
  for(let node=target;node;node=node.parentElement){
   if(node.tagName==='DETAILS')node.open=true;
  }
  requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'instant'}));
 };
 document.addEventListener('click',event=>{const a=event.target.closest('a[href]');if(!a||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;const url=new URL(a.href);if(url.origin!==location.origin||url.pathname!==location.pathname||!url.hash)return;let id;try{id=decodeURIComponent(url.hash.slice(1));}catch{return;}const target=document.getElementById(id);if(!target)return;event.preventDefault();history.pushState(null,'',location.pathname+location.search+url.hash);openTarget();});
 if(matchMedia('(max-width:720px)').matches){const toc=document.querySelector('.blog-reading-toc details');if(toc)toc.open=false;}
 addEventListener('hashchange',openTarget);openTarget();
})();
