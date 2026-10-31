import {loadCatalogue} from './reading-catalogue.js';
import {openEPUB} from './reading-epub.js';
import {listItems,listStates,importItem} from './reading-store.js';
const grid=document.querySelector('#bookshelf'),status=document.querySelector('#library-status'),search=document.querySelector('#shelf-search'),sort=document.querySelector('#shelf-sort');
let active='全部',items=[],states=new Map();
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
 let shown=items.filter(i=>(active==='全部'||i.type===active)&&(i.title+' '+i.label+' '+(i.author||'')).toLowerCase().includes(search.value.trim().toLowerCase()));
 shown.sort(sort.value==='recent'?(a,b)=>(states.get(b.id)?.lastOpened||b.importedAt||0)-(states.get(a.id)?.lastOpened||a.importedAt||0):(a,b)=>a.title.localeCompare(b.title,'zh-CN'));
 grid.innerHTML=shown.length?shown.map(item=>{
  const state=states.get(item.id)||{},progress=Math.min(100,Math.max(0,state.progress||0)),notes=(state.annotations||[]).length;
  const cover=item.cover?'<img src="'+escape(item.cover)+'" alt="'+escape(item.title)+'的封面">':'<span class="shelf-cover-copy"><small>'+escape(item.type)+'</small><strong>'+escape(item.title)+'</strong><span>'+escape(item.subtitle||item.label)+'</span><em>'+escape(item.author||'我的本地资料')+'</em></span>';
  return '<article class="shelf-book"><a class="shelf-open" href="fitness-reader.html?id='+encodeURIComponent(item.id)+'"><span class="shelf-cover tone-'+escape(item.tone||'teal')+'">'+cover+'</span><span class="shelf-ledger"><span class="shelf-progress" role="progressbar" aria-label="阅读进度" aria-valuenow="'+Math.round(progress)+'" aria-valuemin="0" aria-valuemax="100"><i style="width:'+progress+'%"></i></span><small>'+Math.round(progress)+'%</small></span><h3>'+escape(item.title)+'</h3><p>'+escape(item.label)+(notes?' · '+notes+' 条批注':'')+'</p></a></article>';
 }).join(''):'<p class="shelf-empty">没有找到对应资料，可以换个关键词或导入 PDF。</p>';
 document.querySelector('#shelf-count').textContent=shown.length+' 份资料';
}
async function refresh(){const saved=await listItems(),boundHashes=new Set(saved.filter(item=>!item.id.startsWith('local-')&&item.sha256).map(item=>item.sha256));items=[...new Map([...await loadCatalogue(),...saved].map(item=>[item.id,item])).values()].filter(item=>!item.id.startsWith('local-')||!boundHashes.has(item.sha256||item.id.slice(6)));states=new Map((await listStates()).map(s=>[s.id,s]));const note=document.querySelector('.shelf-local-note');if(note)note.textContent=items.some(item=>item.requiresImport)?'支持 PDF、EPUB、TXT 和 Markdown。打开书籍条目后，选择自己的文件即可阅读；自行导入的文件、阅读进度和批注保存在当前浏览器。':'支持 PDF、EPUB、TXT 和 Markdown。原文件在本机读取；自行导入的文件、阅读进度和批注保存在当前浏览器。';render();}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{active=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();}));
search.addEventListener('input',render);sort.addEventListener('change',render);
document.querySelector('#import-reading').addEventListener('change',async event=>{
 const files=[...event.target.files];if(!files.length)return;
 const button=document.querySelector('.shelf-import');button.setAttribute('aria-busy','true');
 try{
  for(const file of files){
   status.textContent='正在导入 '+file.name+'…';
   const isPDF=file.type==='application/pdf'||/\.pdf$/i.test(file.name),isEPUB=/\.epub$/i.test(file.name);
   if(!isPDF&&!isEPUB&&!/\.(txt|md)$/i.test(file.name))throw Error('支持 PDF、EPUB、TXT 和 Markdown 文件。');
   const bytes=await file.arrayBuffer(),signature=new TextDecoder().decode(bytes.slice(0,5));
   if(isPDF&&signature!=='%PDF-')throw Error(file.name+' 不是可识别的 PDF 文件。');
   const digest=await crypto.subtle.digest('SHA-256',bytes),sha256=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join(''),existing=items.find(item=>item.sha256===sha256||item.id==='local-'+sha256),id=existing?.id||'local-'+sha256;
   const title=existing?.title||file.name.replace(/\.[^.]+$/,'');
   let cover=null;
   if(isPDF){
    try{
     const pdfjs=await import('./assets/vendor/pdfjs/pdf.js');pdfjs.GlobalWorkerOptions.workerSrc='./assets/vendor/pdfjs/pdf.worker.js';
     const pdf=await pdfjs.getDocument({data:new Uint8Array(bytes.slice(0)),cMapUrl:'./assets/vendor/pdfjs/cmaps/',cMapPacked:true,standardFontDataUrl:'./assets/vendor/pdfjs/standard_fonts/',wasmUrl:'./assets/vendor/pdfjs/wasm/',isEvalSupported:false}).promise;
     const page=await pdf.getPage(1),viewport=page.getViewport({scale:.5}),canvas=document.createElement('canvas');canvas.width=viewport.width;canvas.height=viewport.height;
     await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;cover=canvas.toDataURL('image/webp',.75);await pdf.destroy();
    }catch{/* Reading can still report unsupported or password-protected PDFs clearly. */}
   }
   if(isEPUB){const book=await openEPUB(bytes);if(book.cover){const image=new Image();image.src=book.cover;await image.decode();const canvas=document.createElement('canvas');canvas.width=240;canvas.height=Math.round(240*image.naturalHeight/image.naturalWidth);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);cover=canvas.toDataURL('image/webp',.8);}book.release();}
   await importItem({...existing,id,title,sha256,type:existing?.type||(isEPUB?'书籍':isPDF?'PDF':'文章'),label:existing?.label||(isEPUB?'本地 EPUB':isPDF?'本地 PDF':'本地文章'),kind:isEPUB?'epub':isPDF?'pdf':'text',tone:existing?.tone||'teal',cover:existing?.cover||cover,importedAt:Date.now()},isPDF||isEPUB?{bytes}:{text:new TextDecoder().decode(bytes)});
  }
  await refresh();status.textContent='已导入 '+files.length+' 份资料，仅保存在当前浏览器。';
 }catch(error){status.textContent='导入未完成：'+error.message;}
 finally{button.removeAttribute('aria-busy');event.target.value='';}
});
window.addEventListener('pageshow',()=>refresh().catch(error=>{status.textContent='书架暂时无法读取：'+error.message}));
refresh().catch(error=>{status.textContent='浏览器存储不可用：'+error.message});

