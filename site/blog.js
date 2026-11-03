const posts=window.SPIKE_POSTS||[];
const categories=window.SPIKE_BLOG_CATEGORIES||[{id:'all',label:'全部'},{id:'people',label:'人物'},{id:'books',label:'书籍'},{id:'films',label:'电影'},{id:'food',label:'饮食'},{id:'finance',label:'金融'},{id:'ai-computing',label:'AI&计算机'},{id:'reflections',label:'感悟'}];
const categoryBar=document.querySelector('#blog-category-bar');
const tagBar=document.querySelector('#tag-bar');
const postList=document.querySelector('#post-list');
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const categoryFromHash=()=>categories.some(item=>item.id===location.hash.slice(1))?location.hash.slice(1):'all';
// Keep bookmarks from the earlier reflections tag pointing to the new peer category.
if(location.hash==='#reflections'&&new URLSearchParams(location.search).get('tag')==='知乎'){
 const url=new URL(location.href);url.hash='zhihu';url.searchParams.delete('tag');history.replaceState(null,'',url);
}
const safePostHref=value=>typeof value==='string'&&/^(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.html(?:[?#][^\s"'<>]*)?$/.test(value)?value:null;
let activeCategory=categoryFromHash();
let activeTag=new URLSearchParams(location.search).get('tag')||'全部';
let tagsExpanded=false;

function render(){
  categoryBar.innerHTML=categories.map(item=>`<button class="blog-category-button ${item.id===activeCategory?'active':''}" type="button" data-category="${item.id}" aria-pressed="${item.id===activeCategory}">${escapeHtml(item.label)}</button>`).join('');
  postList.classList.remove('film-view','people-view','zhihu-view');
  if(activeCategory==='zhihu'&&window.SpikeZhihu){tagBar.hidden=true;window.SpikeZhihu.render(postList);return;}
  if(activeCategory==='films'&&window.SpikeFilms){tagBar.hidden=true;document.querySelector('#blog-list-title').textContent='电影';window.SpikeFilms.render(postList);return;}
  if(activeCategory==='people'&&window.SpikePeople){tagBar.hidden=true;document.querySelector('#blog-list-title').textContent='人物';window.SpikePeople.render(postList);return;}
  const scoped=activeCategory==='all'?posts:posts.filter(post=>post.category===activeCategory);
  const tagCounts=new Map();
  for(const post of scoped)for(const tag of post.tags)tagCounts.set(tag,(tagCounts.get(tag)||0)+1);
  const tags=[...tagCounts.keys()].sort((a,b)=>tagCounts.get(b)-tagCounts.get(a));
  if(activeTag!=='全部'&&!tags.includes(activeTag))activeTag='全部';
  const primaryTags=tags.slice(0,5);
  if(activeTag!=='全部'&&!primaryTags.includes(activeTag))primaryTags.push(activeTag);
  const visibleTags=['全部',...(tagsExpanded?tags:primaryTags)];
  const hiddenCount=tags.length-primaryTags.length;
  const visible=activeTag==='全部'?scoped:scoped.filter(post=>post.tags.includes(activeTag));
  tagBar.hidden=tags.length===0;
  tagBar.innerHTML=`<span class="blog-tag-label" aria-hidden="true">主题</span><div class="blog-tag-options" id="blog-tag-options">${visibleTags.map(tag=>`<button class="tag-button ${tag===activeTag?'active':''}" type="button" data-tag="${escapeHtml(tag)}" aria-pressed="${tag===activeTag}">${escapeHtml(tag)}</button>`).join('')}</div>${tags.length>5?`<button type="button" class="blog-tags-toggle" data-tags-toggle aria-expanded="${tagsExpanded}" aria-controls="blog-tag-options">${tagsExpanded?'收起标签':`更多标签 <span>+${hiddenCount}</span>`}</button>`:''}`;
  const published=visible.filter(post=>post.status==='published').length;
  const preparing=visible.length-published;
  document.querySelector('#blog-list-title').textContent=activeTag!=='全部'?activeTag:activeCategory==='all'?'全部文章':categories.find(item=>item.id===activeCategory).label;
  document.querySelector('#blog-result-count').textContent=[published?`${published} 篇已发布`:'',preparing?`${preparing} 篇准备中`:''].filter(Boolean).join(' · ')||'暂无内容';
  postList.innerHTML=visible.length?visible.map(post=>{
    const href=safePostHref(post.href);
    const title=href?`<a href="${escapeHtml(href)}">${escapeHtml(post.title)}</a>`:escapeHtml(post.title);
    const date=/^\d{4}-\d{2}-\d{2}$/.test(post.date)?` datetime="${post.date}"`:'';
    const category=categories.find(item=>item.id===post.category)?.label;
    const cover=typeof post.cover==='string'&&/^assets\/[a-zA-Z0-9_\/-]+\.webp$/.test(post.cover)?`<img class="post-card-cover" src="${escapeHtml(post.cover)}" alt="${escapeHtml(post.title)}封面" loading="lazy">`:'';
    return `<article class="post-card${href?'':' post-card-draft'}"><div class="post-meta">${category?`<small class="post-category">${escapeHtml(category)}</small>`:''}${post.status==='published'?`<time${date}>${escapeHtml(post.date)}</time>`:'<span class="post-status">准备中</span>'}</div>${cover}<h2>${title}</h2><p>${escapeHtml(post.summary)}</p><div class="post-card-footer"><div class="post-tags">${post.tags.slice(0,3).map(tag=>`<span>${escapeHtml(tag)}</span>`).join('')}</div>${href?'<span class="post-read" aria-hidden="true">'+(post.status==='draft'?'查看文章草稿':'阅读全文')+' <span>↗</span></span>':''}</div></article>`;
  }).join(''):`<p class="post-empty">${escapeHtml(categories.find(item=>item.id===activeCategory).label)}板块暂时还没有文章。</p>`;
}
categoryBar.addEventListener('click',event=>{
  const button=event.target.closest('[data-category]');if(!button)return;
  activeCategory=button.dataset.category;activeTag='全部';tagsExpanded=false;
  const url=new URL(location.href);url.searchParams.delete('tag');url.searchParams.delete('folder');url.hash=activeCategory;history.replaceState(null,'',url);render();
  categoryBar.querySelector('.active').focus({preventScroll:true});
});
tagBar.addEventListener('click',event=>{
  if(event.target.closest('[data-tags-toggle]')){tagsExpanded=!tagsExpanded;render();tagBar.querySelector('[data-tags-toggle]').focus({preventScroll:true});return;}
  const button=event.target.closest('[data-tag]');if(!button)return;
  activeTag=button.dataset.tag;tagsExpanded=false;
  const url=new URL(location.href);if(activeTag==='全部')url.searchParams.delete('tag');else url.searchParams.set('tag',activeTag);history.replaceState(null,'',url);
  render();tagBar.querySelector('.active').focus({preventScroll:true});
});
window.addEventListener('hashchange',()=>{activeCategory=categoryFromHash();activeTag=new URLSearchParams(location.search).get('tag')||'全部';tagsExpanded=false;render();});
render();
