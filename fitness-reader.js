import {loadCatalogue} from './reading-catalogue.js';
import {openEPUB} from './reading-epub.js';
import {createPDFRegions} from './reading-pdf-regions.js';
import {createScriptView} from './reading-script.js';
import {createReadingLanguage} from './reading-language.js';
import {getItem,getFile,getState,saveState,importItem,listItems} from './reading-store.js';
const $=s=>document.querySelector(s),content=$('#reader-content'),stage=$('#reader-stage'),status=$('#reader-status'),outline=$('#outline-list');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let item,state,pdf,pdfjs,pageNumber=1,textRoot=content,selectionData=null,editing=null,loaded=false,renderTask=null,renderToken=0,saveTimer;
const say=text=>{status.textContent=text};
const scriptView=createScriptView();
const language=createReadingLanguage({scriptView,getContext:()=>({pdf:!!pdf,root:textRoot,text:()=>textRoot.textContent}),say,onScriptChange:()=>{if(loaded)renderNotes()}});
const regions=createPDFRegions({content,button:$('#area-highlight'),tool:$('#mark-tool'),size:$('#brush-size'),getPage:()=>pageNumber,getAnnotations:()=>state?.annotations||[],say,onCreate:async data=>{selectionData=data;await addAnnotation();}});
$('#area-highlight').addEventListener('click',()=>{selectionData=null;});
async function persist(){try{await saveState({...state,annotations:[...state.annotations]});say('已保存在当前浏览器。')}catch(error){say('保存失败，请导出笔记备份：'+error.message)}}
function rangeAt(root,start,end){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node,offset=0,a=null,b=null;
 while(node=walker.nextNode()){
  const next=offset+node.textContent.length;
  if(!a&&start>=offset&&start<=next)a={node,offset:start-offset};
  if(end>=offset&&end<=next){b={node,offset:end-offset};if(a)break;}
  offset=next;
 }
 if(!a||!b)return null;const range=document.createRange();range.setStart(a.node,a.offset);range.setEnd(b.node,b.offset);return range;
}
function locateAnnotation(note){
 if(!pdf)return scriptView.locate(note,rangeAt);
 let range=rangeAt(textRoot,note.start,note.end);
 if(!range||range.toString()!==note.quote){const at=textRoot.textContent.indexOf(note.quote);range=at<0?null:rangeAt(textRoot,at,at+note.quote.length);}
 return range;
}
function applyHighlights(){
 if(!window.Highlight||!CSS.highlights)return;
 const groups={yellow:[],green:[],pink:[]};
 for(const note of state.annotations){
  if(note.rect||note.stroke||note.wholePage||(pdf&&note.page!==pageNumber))continue;
  const range=locateAnnotation(note);
  if(range)(groups[note.color]||groups.yellow).push(range);
 }
 for(const [color,ranges]of Object.entries(groups))CSS.highlights.set('reader-'+color,new Highlight(...ranges));
}
function renderNotes(){
 $('#annotation-count').textContent=state.annotations.length;
 $('#annotation-list').innerHTML=state.annotations.length?state.annotations.map(note=>'<article class="reader-annotation" data-id="'+note.id+'"><button class="annotation-jump" type="button"><small>'+(note.page?'第 '+note.page+' 页':'正文')+' · '+(note.note?'批注':'高亮')+'</small><q>'+escape(note.quote.slice(0,220))+(note.quote.length>220?'…':'')+'</q></button>'+(note.note?'<p>'+escape(note.note)+'</p>':'')+'<div><button data-action="edit" type="button">编辑</button><button data-action="delete" type="button">删除</button></div></article>').join(''):'<p class="reader-empty">选中文字后点击“高亮”或“添加批注”。你的笔记会显示在这里。</p>';
 applyHighlights();
 regions.render();
}
function captureSelection(){
 if(!loaded)return;
 const selected=getSelection();if(!selected||selected.isCollapsed||!selected.rangeCount)return;
 const range=selected.getRangeAt(0);if(!textRoot.contains(range.commonAncestorContainer))return;
 const quote=range.toString();if(!quote.trim())return;
 const prefix=document.createRange();prefix.selectNodeContents(textRoot);prefix.setEnd(range.startContainer,range.startOffset);
 selectionData={...(pdf?{start:prefix.toString().length,end:prefix.toString().length+quote.length,quote}:scriptView.capture(range)),page:pdf?pageNumber:0};
 say('已选中 '+quote.trim().length+' 个字符，可高亮或添加批注。');
}
content.addEventListener('pointerup',captureSelection);content.addEventListener('keyup',captureSelection);
document.addEventListener('selectionchange',captureSelection);
for(const button of [$('#add-highlight'),$('#add-note')])button.addEventListener('pointerdown',event=>event.preventDefault());
async function addAnnotation(noteText=''){
 if(!selectionData){say('请先在正文中选择一段文字。');return;}
 const annotation={id:crypto.randomUUID(),...selectionData,color:$('#highlight-color').value,note:noteText,createdAt:Date.now()};
 state.annotations.push(annotation);renderNotes();await persist();getSelection()?.removeAllRanges();selectionData=null;
}
$('#add-highlight').addEventListener('click',()=>addAnnotation());
function openNote(note=null){
 if(!note&&!selectionData&&pdf)selectionData={quote:'第 '+pageNumber+' 页的整页批注',page:pageNumber,wholePage:true};
 if(!note&&!selectionData){say('请先选择需要批注的文字。');return;}
 editing=note?.id||null;$('#note-quote').textContent=note?.quote||selectionData.quote;$('#note-text').value=note?.note||'';
 $('#note-dialog-title').textContent=note?'编辑批注':'添加批注';$('#note-dialog').showModal();$('#note-text').focus();
}
$('#add-note').addEventListener('click',()=>openNote());
$('#save-note').addEventListener('click',async()=>{
 const value=$('#note-text').value.trim();
 if(editing){const note=state.annotations.find(n=>n.id===editing);if(note)note.note=value;renderNotes();await persist();}
 else await addAnnotation(value);
 $('#note-dialog').close();editing=null;
});
$('#annotation-list').addEventListener('click',async event=>{
 const article=event.target.closest('[data-id]');if(!article)return;
 const note=state.annotations.find(n=>n.id===article.dataset.id);if(!note)return;
 const action=event.target.closest('[data-action]')?.dataset.action;
 if(action==='edit'){openNote(note);return;}
 if(action==='delete'){state.annotations=state.annotations.filter(n=>n.id!==note.id);renderNotes();await persist();return;}
 if(event.target.closest('.annotation-jump')){
  if(pdf&&note.page!==pageNumber)await renderPDF(note.page);
  document.body.classList.remove('notes-open');
  if(note.rect||note.stroke){content.querySelector('[data-annotation-id="'+note.id+'"]')?.scrollIntoView({block:'center',behavior:'smooth'});return;}
  if(note.wholePage){stage.scrollTo({top:0,behavior:'smooth'});return;}
  const range=locateAnnotation(note);
  range?.startContainer.parentElement?.scrollIntoView({block:'center',behavior:'smooth'});
 }
});
$('#export-notes').addEventListener('click',()=>{
 const blob=new Blob([JSON.stringify({version:1,document:{id:item.id,title:item.title,type:item.type},progress:state.progress,annotations:state.annotations},null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=item.title+'-阅读笔记.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);say('已导出笔记，不包含原文件。');
});
for(const [button,panel,cls]of [['#outline-toggle','#reader-outline','outline-open'],['#notes-toggle','#reader-notes','notes-open']]){
 $(button).addEventListener('click',()=>{
  const mobile=matchMedia('(max-width: 850px)').matches;
  if(mobile){const open=document.body.classList.toggle(cls);$(button).setAttribute('aria-expanded',String(open));}
  else{$(panel).hidden=!$(panel).hidden;document.querySelector('.reader-layout').classList.toggle(cls+'-hidden',$(panel).hidden);$(button).setAttribute('aria-expanded',String(!$(panel).hidden));}
 });
}
function outlineButton(text,depth,action){const button=document.createElement('button');button.type='button';button.textContent=text;button.style.setProperty('--outline-depth',depth);button.addEventListener('click',()=>{action();document.body.classList.remove('outline-open');});outline.append(button);}
function sanitizeArticle(source,sourceURL){
 source.querySelectorAll('script,style,iframe,object,embed,form,input,button,nav').forEach(el=>el.remove());
 for(const el of source.querySelectorAll('*')){
  for(const attribute of [...el.attributes])if(attribute.name.startsWith('on')||['srcdoc','style'].includes(attribute.name))el.removeAttribute(attribute.name);
  if(el.tagName==='IMG'){const url=new URL(el.getAttribute('src')||'',sourceURL);if(url.origin!==location.origin){el.remove();continue;}el.src=url.href;el.loading='eager';}
  if(el.tagName==='A'){
   const href=el.getAttribute('href')||'';
   if(href.startsWith('#'))continue;
   const url=new URL(href,sourceURL);if(!['http:','https:'].includes(url.protocol)){el.removeAttribute('href');continue;}
   el.href=url.href;el.target='_blank';el.rel='noopener noreferrer';
  }
 }
 return source;
}
function markdown(text){
 const fragment=document.createDocumentFragment();let paragraph=[];
 const flush=()=>{if(paragraph.length){const p=document.createElement('p');p.textContent=paragraph.join('\n');fragment.append(p);paragraph=[];}};
 for(const line of text.replace(/\r/g,'').split('\n')){const h=line.match(/^(#{1,6})\s+(.+)$/);if(h){flush();const heading=document.createElement('h'+Math.min(h[1].length+1,6));heading.textContent=h[2];fragment.append(heading);}else if(!line.trim())flush();else paragraph.push(line);}
 flush();return fragment;
}
async function openArticle(){
 content.className='reader-content reader-article';
 let book;
 if(item.kind==='epub'){
  const bytes=item.source?await fetch(item.source).then(r=>{if(!r.ok)throw Error('找不到本地 EPUB 文件。');return r.arrayBuffer();}):(await getFile(item.id)).bytes;
  book=await openEPUB(bytes);content.replaceChildren(book.fragment);window.addEventListener('pagehide',()=>book.release(),{once:true});
 }else if(item.source){
  const response=await fetch(item.source);if(!response.ok)throw Error('无法加载这份站内资料。');
  const doc=new DOMParser().parseFromString(await response.text(),'text/html'),source=doc.querySelector(item.selector);
  if(!source)throw Error('未找到文章正文。');
  content.replaceChildren(sanitizeArticle(source.cloneNode(true),new URL(item.source,location.href)));
 }else{const file=await getFile(item.id);content.replaceChildren(markdown(file.text));}
 const label=document.createElement('p');label.className='reader-document-label';label.textContent=item.label+(item.id==='pyramids'?'；当前为书籍资料条目，导入自己的文件后可阅读正文。':'');content.prepend(label);
 if(book)for(const entry of book.outline)outlineButton(entry.title,entry.depth,()=>document.getElementById(entry.id)?.scrollIntoView({block:'start',behavior:'smooth'}));
 else{
  const headings=[...content.querySelectorAll('h2,h3')];
  headings.forEach((h,index)=>{if(!h.id)h.id='reader-heading-'+index;outlineButton(h.textContent,h.tagName==='H3'?1:0,()=>h.scrollIntoView({block:'start',behavior:'smooth'}));});
  if(!headings.length)outlineButton('正文',0,()=>stage.scrollTo({top:0,behavior:'smooth'}));
 }
 textRoot=content;scriptView.setRoot(content);scriptView.setAux([...outline.querySelectorAll('button'),$('#reader-title')]);language.syncButton();
 await Promise.all([...content.querySelectorAll('img')].map(img=>img.decode().catch(()=>{})));
 stage.scrollTop=(stage.scrollHeight-stage.clientHeight)*(state.progress||0)/100;loaded=true;renderNotes();say('选中文字后可高亮或添加批注。');
}
async function renderPDF(number){
 const token=++renderToken;regions.reset();renderTask?.cancel();loaded=false;selectionData=null;pageNumber=Math.max(1,Math.min(pdf.numPages,number));
 $('#page-number').value=pageNumber;
 const page=await pdf.getPage(pageNumber);if(token!==renderToken)return;
 const unscaled=page.getViewport({scale:1}),fit=Math.max(160,stage.clientWidth-48)/unscaled.width;
 const scale=Math.min(1.6,fit)*Number($('#pdf-zoom').value),viewport=page.getViewport({scale});
 const holder=document.createElement('div');holder.className='pdf-page';holder.style.width=viewport.width+'px';holder.style.height=viewport.height+'px';
 holder.style.setProperty('--scale-factor',scale);holder.style.setProperty('--total-scale-factor',scale);holder.style.setProperty('--user-unit',1);
 const canvas=document.createElement('canvas'),ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.floor(viewport.width*ratio);canvas.height=Math.floor(viewport.height*ratio);canvas.style.width=viewport.width+'px';canvas.style.height=viewport.height+'px';
 const text=document.createElement('div');text.className='textLayer';holder.append(canvas,text);content.replaceChildren(holder);content.className='reader-content reader-pdf';
 renderTask=page.render({canvasContext:canvas.getContext('2d'),viewport,transform:ratio===1?null:[ratio,0,0,ratio,0,0]});
 try{await renderTask.promise;}catch(error){if(error.name==='RenderingCancelledException')return;throw error;}
 if(token!==renderToken)return;
 const textContent=await page.getTextContent();
 const layer=new pdfjs.TextLayer({textContentSource:textContent,container:text,viewport});await layer.render();
 if(token!==renderToken)return;
 textRoot=text;loaded=true;stage.scrollTop=0;state.page=pageNumber;state.progress=Math.round(pageNumber/pdf.numPages*100);
 holder.dataset.ready='true';
 applyHighlights();renderNotes();await persist();
 say(textContent.items.some(i=>i.str?.trim())?'选中文字后可高亮或添加批注，也可以标记页面区域。':'扫描页：使用“区域高亮”框选图片，或点击“添加批注”记录整页笔记。');
}
async function openPDF(){
 pdfjs=await import('./assets/vendor/pdfjs/pdf.js');pdfjs.GlobalWorkerOptions.workerSrc='./assets/vendor/pdfjs/pdf.worker.js';
 const source=item.source?{url:item.source}:{data:new Uint8Array((await getFile(item.id)).bytes)};
 pdf=await pdfjs.getDocument({...source,cMapUrl:'./assets/vendor/pdfjs/cmaps/',cMapPacked:true,standardFontDataUrl:'./assets/vendor/pdfjs/standard_fonts/',wasmUrl:'./assets/vendor/pdfjs/wasm/',isEvalSupported:false}).promise;
 $('#pdf-controls').hidden=false;$('#page-count').textContent=pdf.numPages;$('#page-number').max=pdf.numPages;
 $('#area-highlight').hidden=false;
 $('#brush-options').hidden=false;
 const tree=await pdf.getOutline();
 async function walk(nodes,depth=0){
  for(const node of nodes){
   outlineButton(node.title,depth,async()=>{try{const dest=typeof node.dest==='string'?await pdf.getDestination(node.dest):node.dest;if(!dest)return;const index=typeof dest[0]==='number'?dest[0]:await pdf.getPageIndex(dest[0]);await renderPDF(index+1);}catch(error){say('无法跳到这个目录：'+error.message)}});
   if(node.items?.length)await walk(node.items,depth+1);
  }
 }
 if(tree?.length)await walk(tree);
 else{const p=document.createElement('p');p.className='reader-outline-note';p.textContent='PDF 未提供目录，按页浏览。';outline.append(p);for(let n=1;n<=pdf.numPages;n++)outlineButton('第 '+n+' 页',0,()=>renderPDF(n));}
 await renderPDF(state.page||1);
 scriptView.setAux([...outline.querySelectorAll('button'),$('#reader-title')]);language.syncButton();
}
$('#previous-page').addEventListener('click',()=>renderPDF(pageNumber-1).catch(e=>say(e.message)));
$('#next-page').addEventListener('click',()=>renderPDF(pageNumber+1).catch(e=>say(e.message)));
$('#page-number').addEventListener('change',event=>renderPDF(Number(event.target.value)||1).catch(e=>say(e.message)));
$('#pdf-zoom').addEventListener('change',()=>renderPDF(pageNumber).catch(e=>say(e.message)));
let resizeTimer,previousWidth=stage.clientWidth;
new ResizeObserver(()=>{
 if(stage.clientWidth===previousWidth)return;
 previousWidth=stage.clientWidth;clearTimeout(resizeTimer);
 if(pdf)resizeTimer=setTimeout(()=>renderPDF(pageNumber).catch(e=>say(e.message)),150);
}).observe(stage);
stage.addEventListener('scroll',()=>{if(!loaded||pdf)return;clearTimeout(saveTimer);saveTimer=setTimeout(()=>{const distance=stage.scrollHeight-stage.clientHeight;state.progress=distance<=0?100:Math.round(stage.scrollTop/distance*100);saveState({...state}).catch(e=>say('阅读位置未保存：'+e.message));},300);},{passive:true});
async function init(){
 const id=new URLSearchParams(location.search).get('id');item=await getItem(id)||(await loadCatalogue()).find(x=>x.id===id);
 if(!item)throw Error('未找到这份资料，请返回书架重新打开。');
 state=await getState(item.id);state.lastOpened=Date.now();state.annotations=Array.isArray(state.annotations)?state.annotations:[];
 $('#reader-title').textContent=item.title;document.title=item.title+' · 阅读器';
 if(matchMedia('(max-width:850px)').matches){$('#outline-toggle').setAttribute('aria-expanded','false');$('#notes-toggle').setAttribute('aria-expanded','false');}
 if(item.requiresImport){
  content.className='reader-content reader-article';
  const heading=document.createElement('h2');heading.textContent='选择这本资料的文件';
  const explanation=document.createElement('p');explanation.textContent='书架保留了这份资料的信息。选择你自己的 '+item.kind.toUpperCase()+' 文件后，即可在此阅读、查看目录和做批注；文件只保存在当前浏览器。';
  const label=document.createElement('label');label.textContent='选择 '+item.kind.toUpperCase()+' 文件：';
  const input=document.createElement('input');input.id='attach-reading-file';input.type='file';input.accept='.'+item.kind;label.append(input);content.replaceChildren(heading,explanation,label);
  say('请选择与“'+item.title+'”对应的文件，开始阅读。');
  input.addEventListener('change',async()=>{
   const file=input.files[0];if(!file)return;input.disabled=true;
   try{
    if(!file.name.toLowerCase().endsWith('.'+item.kind))throw Error('请选择 '+item.kind.toUpperCase()+' 格式的文件。');
    const bytes=await file.arrayBuffer();
    if(item.kind==='pdf'&&new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('不是可识别的 PDF 文件。');
    if(item.kind==='epub'){const book=await openEPUB(bytes);book.release();}
    const hash=await crypto.subtle.digest('SHA-256',bytes),sha256=[...new Uint8Array(hash)].map(value=>value.toString(16).padStart(2,'0')).join('');
    const previous=(await listItems()).find(entry=>entry.id!==item.id&&(entry.sha256===sha256||entry.id==='local-'+sha256));
    if(previous){const current=await getState(item.id),saved=await getState(previous.id);if(!current.progress&&!current.annotations?.length)await saveState({...saved,id:item.id});}
    const imported={...item,sha256,requiresImport:false,label:'本机 '+item.kind.toUpperCase()+' · 自行导入',importedAt:Date.now()};delete imported.source;
    await importItem(imported,{bytes});await init();
   }catch(error){say('导入未完成：'+error.message);input.disabled=false;input.value='';}
  });return;
 }
 await saveState(state);
 if(item.kind==='pdf')await openPDF();else await openArticle();
}
init().catch(error=>{content.replaceChildren();const p=document.createElement('p');p.textContent='打开失败：'+error.message;content.append(p);say('可以返回书架，检查文件或重新导入。');});

