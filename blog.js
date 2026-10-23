const posts=window.SPIKE_POSTS||[];
const categories=[{id:'all',label:'全部'},{id:'books',label:'书籍'},{id:'films',label:'电影'},{id:'food',label:'饮食'},{id:'finance',label:'金融'},{id:'reflections',label:'感悟'}];
const categoryBar=document.querySelector('#blog-category-bar');
const tagBar=document.querySelector('#tag-bar');
const postList=document.querySelector('#post-list');
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const categoryFromHash=()=>categories.some(item=>item.id===location.hash.slice(1))?location.hash.slice(1):'all';
const safePostHref=value=>typeof value==='string'&&/^(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.html(?:[?#][^\s"'<>]*)?$/.test(value)?value:null;
let activeCategory=categoryFromHash();
let activeTag='全部';

function render(){
  const scoped=activeCategory==='all'?posts:posts.filter(post=>post.category===activeCategory);
  const tags=['全部',...new Set(scoped.flatMap(post=>post.tags))];
  const visible=activeTag==='全部'?scoped:scoped.filter(post=>post.tags.includes(activeTag));
  categoryBar.innerHTML=categories.map(item=>`<button class="blog-category-button ${item.id===activeCategory?'active':''}" type="button" data-category="${item.id}" aria-pressed="${item.id===activeCategory}">${item.label}</button>`).join('');
  tagBar.innerHTML=tags.map(tag=>`<button class="tag-button ${tag===activeTag?'active':''}" type="button" data-tag="${escapeHtml(tag)}" aria-pressed="${tag===activeTag}">${escapeHtml(tag)}</button>`).join('<span aria-hidden="true">·</span>');
  const published=visible.filter(post=>post.status==='published').length;
  const preparing=visible.length-published;
  document.querySelector('#blog-result-count').textContent=[published?`${published} 篇已发布`:'',preparing?`${preparing} 篇准备中`:''].filter(Boolean).join(' · ')||'暂无内容';
  postList.innerHTML=visible.length?visible.map(post=>{
    const href=safePostHref(post.href);
    const title=href?`<a href="${escapeHtml(href)}">${escapeHtml(post.title)}</a>`:escapeHtml(post.title);
    const date=/^\d{4}-\d{2}-\d{2}$/.test(post.date)?` datetime="${post.date}"`:'';
    const category=categories.find(item=>item.id===post.category)?.label;
    return `<article class="post-card"><div><time${date}>${escapeHtml(post.date)}</time>${category?`<small class="post-category">${category}</small>`:''}</div><div><h2>${title}</h2><p>${escapeHtml(post.summary)}</p></div><div class="post-tags">${post.tags.map(tag=>`<span>${escapeHtml(tag)}</span>`).join('')}</div></article>`;
  }).join(''):`<p class="post-empty">${escapeHtml(categories.find(item=>item.id===activeCategory).label)}板块暂时还没有文章。</p>`;
}
categoryBar.addEventListener('click',event=>{
  const button=event.target.closest('[data-category]');if(!button)return;
  activeCategory=button.dataset.category;activeTag='全部';
  history.replaceState(null,'','#'+activeCategory);render();
  categoryBar.querySelector('.active').focus({preventScroll:true});
});
tagBar.addEventListener('click',event=>{
  const button=event.target.closest('[data-tag]');if(!button)return;
  activeTag=button.dataset.tag;render();tagBar.querySelector('.active').focus({preventScroll:true});
});
window.addEventListener('hashchange',()=>{activeCategory=categoryFromHash();activeTag='全部';render();});
render();
