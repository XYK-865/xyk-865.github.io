(() => {
 'use strict';
 const openTarget=()=>{let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}if(!id)return;const target=document.getElementById(id);if(!target)return;for(let node=target;node;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true;requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'instant'}));};
 document.addEventListener('click',event=>{const a=event.target.closest('a[href]');if(!a||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;const url=new URL(a.href);if(url.origin!==location.origin||url.pathname!==location.pathname||!url.hash)return;let id;try{id=decodeURIComponent(url.hash.slice(1));}catch{return;}const target=document.getElementById(id);if(!target)return;event.preventDefault();history.pushState(null,'',location.pathname+location.search+url.hash);openTarget();});
 if(matchMedia('(max-width:720px)').matches){const toc=document.querySelector('.blog-reading-toc details');if(toc)toc.open=false;}
 addEventListener('hashchange',openTarget);openTarget();
})();
