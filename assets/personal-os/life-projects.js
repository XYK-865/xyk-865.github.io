const toc=document.querySelector('.life-toc details');
if(toc&&matchMedia('(max-width:760px)').matches)toc.open=false;

for(const block of document.querySelectorAll('.life-code')){
 if(!block.textContent.includes('决策/项目：'))continue;
 const button=document.createElement('button');button.type='button';button.className='life-copy';button.textContent='复制退出合约';
 block.before(button);
 button.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(block.textContent);button.textContent='已复制';}
  catch{button.textContent='请在下方选中模板并复制';}
 });
}

const query=document.querySelector('#life-query'),buttons=[...document.querySelectorAll('[data-life-category]')];
if(query){
 let category='all';
 const cards=[...document.querySelectorAll('[data-life-item]')],groups=[...document.querySelectorAll('[data-life-group]')];
 const apply=()=>{
  const term=query.value.trim().toLocaleLowerCase();let count=0;
  for(const card of cards){card.hidden=(category!=='all'&&card.dataset.category!==category)||!card.textContent.toLocaleLowerCase().includes(term);if(!card.hidden)count++;}
  for(const group of groups)group.hidden=![...group.querySelectorAll('[data-life-item]')].some(card=>!card.hidden);
  document.querySelector('#life-count').textContent=count+' / '+cards.length+' 个主题';
  document.querySelector('#life-empty').hidden=count>0;
  for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.lifeCategory===category));
 };
 for(const button of buttons)button.addEventListener('click',()=>{category=button.dataset.lifeCategory;apply();});
 query.addEventListener('input',apply);
 const reveal=()=>{
  let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
  const target=document.getElementById(id);
  if(!target?.matches('[data-life-item]'))return;
  category='all';query.value='';apply();
  requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'instant'}));
 };
 addEventListener('hashchange',reveal);reveal();
}
