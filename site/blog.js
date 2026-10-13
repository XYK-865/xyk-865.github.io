const posts=window.SPIKE_POSTS||[];
const tagBar=document.querySelector('#tag-bar');
const postList=document.querySelector('#post-list');
const tags=['全部',...new Set(posts.flatMap(post=>post.tags))];
let activeTag='全部';

function renderTags(){
  tagBar.innerHTML=tags.map(tag=>`<button class="tag-button ${tag===activeTag?'active':''}" type="button" data-tag="${tag}">${tag}</button>`).join('<span aria-hidden="true">·</span>');
}
function renderPosts(){
  const visible=activeTag==='全部'?posts:posts.filter(post=>post.tags.includes(activeTag));
  postList.innerHTML=visible.length?visible.map(post=>`<article class="post-card"><time>${post.date}</time><div><h2>${post.title}</h2><p>${post.summary}</p></div><div class="post-tags">${post.tags.map(tag=>`<span>${tag}</span>`).join('')}</div></article>`).join(''):'<p class="post-empty">这个标签下还没有文章。</p>';
}
tagBar.addEventListener('click',event=>{const button=event.target.closest('[data-tag]');if(!button)return;activeTag=button.dataset.tag;renderTags();renderPosts()});
renderTags();renderPosts();
