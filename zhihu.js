(() => {
 const posts=(window.SPIKE_POSTS||[]).filter(post=>post.category==='zhihu');
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const key='spike-zhihu-folders-v1';let folders=[],overrides={},container,selected='all',dialog,storageError='';
 try{const saved=JSON.parse(localStorage.getItem(key)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))overrides=saved;}catch{storageError='归类记录暂时无法读取。';}
 let ready;const loadFolders=()=>ready||=(fetch('zhihu-folders.json?v=20261103').then(r=>{if(!r.ok)throw Error('知乎文件夹暂时无法加载。');return r.json();}).then(data=>{folders=data.folders;}));
 const membership=post=>(Array.isArray(overrides[post.href])?overrides[post.href]:post.folderIds||[]).filter(id=>folders.some(folder=>folder.id===id));
 const articleHref=post=>/^blog-articles\/[a-zA-Z0-9_-]+\.html$/.test(post.href)?post.href:null;
 function draw(){
  const visible=selected==='all'?posts:posts.filter(post=>membership(post).includes(selected));
  const label=folders.find(folder=>folder.id===selected)?.label||'全部文章';
  document.querySelector('#blog-list-title').textContent='知乎';document.querySelector('#blog-result-count').textContent=posts.length+' 篇文章 · '+folders.length+' 个文件夹';
  container.classList.add('zhihu-view');
  container.innerHTML='<section class="zhihu-folder-panel" aria-label="知乎文件夹"><div class="zhihu-folder-toolbar"><h3>我的文件夹</h3><button type="button" data-folder="all" aria-pressed="'+(selected==='all')+'">全部文章</button><button type="button" data-folder-export>导出归类</button></div><div class="zhihu-folder-grid">'+folders.map(folder=>'<button type="button" data-folder="'+escape(folder.id)+'" aria-pressed="'+(selected===folder.id)+'"><span>'+escape(folder.label)+'</span><small>'+posts.filter(post=>membership(post).includes(folder.id)).length+' 篇</small></button>').join('')+'</div><p class="zhihu-storage-note">归类保存在当前浏览器；同一篇文章可以放入多个文件夹。</p><p role="status" class="zhihu-storage-note">'+escape(storageError)+'</p></section><div class="zhihu-current-folder"><h3>'+escape(label)+'</h3><span>'+visible.length+' 篇文章</span></div><div class="zhihu-article-grid">'+visible.map(post=>{
   const href=articleHref(post);if(!href)return '';
   const badges=membership(post).map(id=>folders.find(f=>f.id===id).label);
   return '<article class="post-card"><div class="post-meta"><small class="post-category">知乎摘录</small><time>'+escape(post.date)+'</time></div><h2><a href="'+href+'">'+escape(post.title)+'</a></h2><p>'+escape(post.summary)+'</p><p class="zhihu-author">作者：'+escape(post.author||'待补充')+'</p><div class="post-card-footer"><div class="post-tags">'+(badges.length?badges.map(text=>'<span>'+escape(text)+'</span>').join(''):'<span>未归档</span>')+'</div><button type="button" data-file="'+posts.indexOf(post)+'">归类到文件夹</button></div></article>';
  }).join('')+'</div>'+(visible.length?'':'<p class="post-empty">这个文件夹暂时没有文章，可在“全部文章”里选择“归类到文件夹”。</p>');
 }
 function fileArticle(index){
  const post=posts[index];if(!post)return;
  if(!dialog){dialog=document.createElement('dialog');dialog.className='zhihu-file-dialog';document.body.append(dialog);}
  const ids=membership(post);
  dialog.innerHTML='<form method="dialog"><h2>归类到文件夹</h2><p>'+escape(post.title)+'</p><div class="zhihu-folder-choices">'+folders.map(folder=>'<label><input type="checkbox" name="folder" value="'+escape(folder.id)+'"'+(ids.includes(folder.id)?' checked':'')+'>'+escape(folder.label)+'</label>').join('')+'</div><p class="zhihu-storage-note">只调整这篇知乎文章的归类。</p><div><button value="cancel">取消</button><button value="save">保存归类</button></div><p role="status" data-file-status></p></form>';
  dialog.querySelector('form').addEventListener('submit',event=>{
   if(event.submitter?.value!=='save')return;event.preventDefault();
   const updated={...overrides,[post.href]:[...dialog.querySelectorAll('input:checked')].map(input=>input.value)};
   try{localStorage.setItem(key,JSON.stringify(updated));overrides=updated;storageError='';dialog.close();draw();container.querySelector('[data-file="'+index+'"]')?.focus();}
   catch{dialog.querySelector('[data-file-status]').textContent='保存失败，当前浏览器可能禁止了本地存储。';}
  });dialog.showModal();
 }
 function clicked(event){
  const folder=event.target.closest('[data-folder]');
  if(folder){selected=folder.dataset.folder;const url=new URL(location.href);if(selected==='all')url.searchParams.delete('folder');else url.searchParams.set('folder',selected);history.replaceState(null,'',url);draw();container.querySelector('[data-folder="'+selected+'"]').focus();return;}
  const file=event.target.closest('[data-file]');if(file){fileArticle(Number(file.dataset.file));return;}
  if(event.target.closest('[data-folder-export]')){const assignments=Object.fromEntries(posts.map(post=>[post.href,membership(post)]));const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,folders,assignments},null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='知乎文件夹归类.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 }
 window.SpikeZhihu={async render(target){
  if(container!==target){container=target;container.addEventListener('click',clicked);}
  target.innerHTML='<p role="status">正在整理知乎文件夹…</p>';
  try{await loadFolders();if(location.hash!=='#zhihu')return;selected=new URL(location.href).searchParams.get('folder')||'all';if(!folders.some(f=>f.id===selected))selected='all';draw();}
  catch(error){if(location.hash==='#zhihu')target.textContent=error.message;}
 }};
})();
