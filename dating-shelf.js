import {privateShelfRequest,mountPrivateShelfGate,lockPrivateShelf,watchPrivateShelf} from './private-shelf-client.js';
import {normalizeShelfCategory} from './bookshelf-topics.js';
const general=document.querySelector('#general-shelf-view'),privateView=document.querySelector('#dating-shelf-view'),buttons=[...document.querySelectorAll('[data-shelf-category]')];
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let active=false,items=[],stopWatching=null,generation=0;
function locked(message=''){
 generation++;items=[];stopWatching?.();stopWatching=null;privateView.replaceChildren();
 if(active)mountPrivateShelfGate(privateView,unlocked,message);
}
async function unlocked(){
 const current=++generation;
 stopWatching?.();stopWatching=watchPrivateShelf(()=>locked('会话已结束，请重新输入密码。'));
 const data=await privateShelfRequest('catalogue');
 if(!active||current!==generation)return;
 items=data.items;
 privateView.innerHTML='<header class="private-shelf-heading"><div><p class="kicker">PRIVATE SHELF / 约会</p><h2>约会书架</h2><p>已解锁 · '+items.length+' 份 PDF · 仅在当前会话查看</p></div><button type="button" id="dating-lock">重新上锁</button></header><div class="private-shelf-tools"><label for="dating-query">查找书籍</label><input id="dating-query" type="search" placeholder="搜索这个分类里的书名" autocomplete="off"><span id="dating-count" role="status"></span></div><div id="dating-bookshelf" class="bookshelf-grid"></div>';
 const query=privateView.querySelector('#dating-query'),grid=privateView.querySelector('#dating-bookshelf');
 const render=()=>{
  const shown=items.filter(item=>item.title.toLocaleLowerCase().includes(query.value.trim().toLocaleLowerCase()));
  grid.innerHTML=shown.length?shown.map(item=>'<article class="shelf-book"><a class="shelf-open" href="fitness-reader.html?id='+encodeURIComponent(item.id)+'&from=dating"><span class="shelf-cover"><img src="'+escape(item.cover)+'" alt="'+escape(item.title)+'的封面" loading="lazy"></span><span class="shelf-ledger"><span class="private-shelf-book-label">PDF · '+item.pages+' 页</span></span><h3>'+escape(item.title)+'</h3><p>约会 · 受保护资料</p></a></article>').join(''):'<p class="shelf-empty">没有找到匹配的书籍。</p>';
  privateView.querySelector('#dating-count').textContent=shown.length+' / '+items.length+' 份 PDF';
 };
 render();query.addEventListener('input',render);
 privateView.querySelector('#dating-lock').addEventListener('click',async()=>{locked();try{await lockPrivateShelf();}catch(error){locked(error.message);}});
 stopWatching?.();stopWatching=watchPrivateShelf(()=>locked('会话已结束，请重新输入密码。'));
}
async function choose(category){
 category=normalizeShelfCategory(category);
 active=category==='dating';general.hidden=active;privateView.hidden=!active;
 for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.shelfCategory===category));
 const url=new URL(location.href);if(category==='general')url.searchParams.delete('category');else url.searchParams.set('category',category);history.replaceState(null,'',url);
 window.dispatchEvent(new CustomEvent('shelf-category-change',{detail:{category}}));
 if(!active){locked();return;}
 locked();
 try{const session=await privateShelfRequest('session');if(active&&session.unlocked)await unlocked();}
 catch(error){if(active)locked(error.message);}
}
for(const button of buttons)button.addEventListener('click',()=>choose(button.dataset.shelfCategory));
choose(new URL(location.href).searchParams.get('category'));
addEventListener('pagehide',()=>{if(active)locked();});
addEventListener('pageshow',event=>{if(event.persisted&&active)choose('dating');});
