const pages=[
  {id:'about',label:'关于',href:'index.html'},
  {id:'resume',label:'简历',href:'resume.html'},
  {id:'blog',label:'博客',href:'blog.html'},
  {id:'projects',label:'项目',href:'projects.html'},
  {id:'fitness',label:'健身',href:'fitness.html'},
  {id:'travel',label:'旅行',href:'travel.html'},
  {id:'daily',label:'日常',href:'daily.html'}
];
const searchItems=[
  ...pages.map(page=>({title:page.label,description:`前往${page.label}页面`,href:page.href})),
  ...(window.SPIKE_POSTS||[]).map(post=>({title:post.title,description:post.tags.join(' · '),href:post.href||'blog.html'}))
];
const current=document.querySelector('#site-header')?.dataset.page;
const savedTheme=localStorage.getItem('spike-theme');
const preferredDark=window.matchMedia('(prefers-color-scheme: dark)').matches;
if(savedTheme==='dark'||(!savedTheme&&preferredDark))document.documentElement.dataset.theme='dark';

const header=document.querySelector('#site-header');
if(header){
  header.className='topbar';
  header.innerHTML=`<div class="nav-wrap page-shell"><a class="brand" href="index.html" aria-label="Spike Hsu 首页"><span class="brand-mark">♉</span><strong>Spike</strong><span>Hsu</span></a><nav class="main-nav" id="main-nav" aria-label="主导航">${pages.map(page=>`<a href="${page.href}" class="${current===page.id?'active':''}">${page.label}</a>`).join('')}</nav><div class="nav-actions"><span class="search-label">Ctrl K</span><button class="icon-button search-open" type="button" aria-label="打开搜索">⌕</button><button class="icon-button theme-toggle" type="button" aria-label="切换明暗模式">◐</button><button class="menu-button" type="button" aria-expanded="false" aria-controls="main-nav">菜单</button></div></div>`;
}
document.querySelector('#site-footer').className='site-footer';
document.querySelector('#site-footer').innerHTML=`<p>© ${new Date().getFullYear()} Spike Hsu</p><p>写作 · 训练 · 旅行 · 生活</p>`;

const menu=document.querySelector('.menu-button');
const nav=document.querySelector('.main-nav');
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
nav?.addEventListener('click',()=>{nav.classList.remove('open');menu?.setAttribute('aria-expanded','false')});
document.querySelector('.theme-toggle')?.addEventListener('click',()=>{const dark=document.documentElement.dataset.theme==='dark';if(dark)delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme='dark';localStorage.setItem('spike-theme',dark?'light':'dark');document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#ffffff':'#121512')});

const dialog=document.createElement('dialog');
dialog.className='search-dialog';
dialog.innerHTML='<div class="search-head"><input type="search" placeholder="搜索页面、文章或标签…" aria-label="全站搜索"><button class="search-close" type="button">关闭</button></div><div class="search-results"></div>';
document.body.append(dialog);
const input=dialog.querySelector('input');
const results=dialog.querySelector('.search-results');
function renderSearch(query=''){
  const value=query.trim().toLowerCase();
  const matches=searchItems.filter(item=>!value||`${item.title} ${item.description}`.toLowerCase().includes(value));
  results.innerHTML=matches.length?matches.map(item=>`<a class="search-result" href="${item.href}"><strong>${item.title}</strong><small>${item.description}</small></a>`).join(''):'<p class="search-empty">没有找到相关内容</p>';
}
function openSearch(){renderSearch();dialog.showModal();input.focus()}
document.querySelector('.search-open')?.addEventListener('click',openSearch);
dialog.querySelector('.search-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
input.addEventListener('input',()=>renderSearch(input.value));
document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();openSearch()}if(event.key==='Escape'&&dialog.open)dialog.close()});
