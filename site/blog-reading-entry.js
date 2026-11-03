const header=document.querySelector('.blog-reading-header,.reflection-header');
const slug=location.pathname.endsWith('/reflections.html')?'reflections':location.pathname.match(/\/blog-articles\/([a-zA-Z0-9_-]+)\.html$/)?.[1];
if(header&&slug&&!header.querySelector('[data-blog-reader]')){
 const link=document.createElement('a');link.dataset.blogReader='';link.href='fitness-reader.html?id='+encodeURIComponent('blog-'+slug)+'&from=blog';link.textContent='阅读与批注 ↗';
 link.style.cssText='display:inline-block;margin-top:1rem;padding:.55rem .85rem;border:1px solid var(--line);border-radius:8px;font-size:.8rem;color:var(--text)';
 header.append(link);
}
