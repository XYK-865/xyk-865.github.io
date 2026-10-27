(() => {
  const source=new URL(document.currentScript.src);
  const version=source.searchParams.get('v')||'cat-smooth-parity-20261028';
  const asset=path=>{const url=new URL(path,source);url.searchParams.set('v',version);return url.href;};
  document.documentElement.dataset.siteRelease=version;
  const versionLinks=node=>{
    const links=[...(node.matches?.('a[href]')?[node]:[]),...node.querySelectorAll('a[href]')];
    for(const link of links){
      const href=link.getAttribute('href');
      if(!href||href.startsWith('#'))continue;
      const url=new URL(href,document.baseURI);
      if(url.origin!==location.origin||!url.pathname.endsWith('.html'))continue;
      url.searchParams.set('v',version);link.setAttribute('href',url.href);
    }
  };
  versionLinks(document);
  new MutationObserver(records=>{
    for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)versionLinks(node);
  }).observe(document.body,{childList:true,subtree:true});
  if(!document.querySelector('script[data-site-intro-loader]')){
    const loader=document.createElement('script');
    loader.src=asset('assets/intro/site-intro-loader.js');
    loader.dataset.siteIntroLoader='';
    document.head.append(loader);
  }
  const catLoader=document.createElement('script');
  catLoader.src=asset('assets/cat/cat-loader.js');
  catLoader.dataset.siteCatLoader='';
  document.head.append(catLoader);
})();

const pages=[
  {id:'about',label:'关于',href:'index.html'},
  {id:'resume',label:'简历',href:'resume.html'},
  {id:'blog',label:'博客',href:'blog.html'},
  {id:'projects',label:'项目',href:'projects.html'},
  {id:'fitness',label:'健身',href:'fitness.html'},
  {id:'travel',label:'旅行',href:'travel.html'},
  {id:'daily',label:'日常',href:'daily.html'}
];
const current=document.querySelector('#site-header')?.dataset.page;
const savedTheme=localStorage.getItem('spike-theme');
const preferredDark=window.matchMedia('(prefers-color-scheme: dark)').matches;
if(savedTheme==='dark'||(!savedTheme&&preferredDark))document.documentElement.dataset.theme='dark';

const header=document.querySelector('#site-header');
if(header){
  header.className='topbar';
  header.innerHTML=`<div class="nav-wrap page-shell"><a class="brand" href="index.html" aria-label="Spike Hsu 首页"><span class="brand-mark">♉</span><strong>Spike</strong><span>Hsu</span></a><nav class="main-nav" id="main-nav" aria-label="主导航">${pages.map(page=>`<a href="${page.href}" class="${current===page.id?'active':''}">${page.label}</a>`).join('')}</nav><div class="nav-actions"><button class="search-label search-open" type="button" aria-label="搜索文章（Ctrl+K）">Ctrl K</button><button class="icon-button search-open" type="button" aria-label="打开搜索">⌕</button><button class="icon-button theme-toggle" type="button" aria-label="切换明暗模式">◐</button><button class="menu-button" type="button" aria-expanded="false" aria-controls="main-nav">菜单</button></div></div>`;
}
const siteFooter=document.querySelector('#site-footer');
const introControls=[...siteFooter.querySelectorAll('[data-site-intro-replay],.personal-intro-notice')];
siteFooter.className='site-footer';
siteFooter.innerHTML=`<p>© ${new Date().getFullYear()} Spike Hsu</p><p>写作 · 训练 · 旅行 · 生活</p>`;
siteFooter.append(...introControls);

const menu=document.querySelector('.menu-button');
const nav=document.querySelector('.main-nav');
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});
nav?.addEventListener('click',()=>{nav.classList.remove('open');menu?.setAttribute('aria-expanded','false')});
document.querySelector('.theme-toggle')?.addEventListener('click',()=>{const dark=document.documentElement.dataset.theme==='dark';if(dark)delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme='dark';localStorage.setItem('spike-theme',dark?'light':'dark');document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#ffffff':'#121512')});

(()=>{
  const style=document.createElement('link');
  style.rel='stylesheet';style.href='search.css?v=20261024-search';document.head.append(style);
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize=value=>String(value).normalize('NFKC').toLowerCase().replace(/\s+/g,' ').replace(/([\u3400-\u9fff])\s+(?=[\u3400-\u9fff])/g,'$1').trim();
  const safeHref=value=>typeof value==='string'&&/^(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.html(?:[?#][^\s"'<>]*)?$/.test(value);
  const roots=[...pages.map(page=>({title:page.label,description:`前往${page.label}页面`,href:page.href})),
    {title:'我的健身训练实践',description:'训练实践 · V1.56',href:'fitness-practice.html'},
    ...(window.SPIKE_POSTS||[]).filter(post=>post.status==='published'&&safeHref(post.href)).map(post=>({title:post.title,description:post.tags.join(' · '),summary:post.summary,href:post.href}))];
  const entries=[];
  let loading=null,loaded=false,failed=false;
  const dialog=document.createElement('dialog');
  dialog.className='search-dialog';dialog.setAttribute('aria-label','站内全文搜索');
  dialog.innerHTML='<div class="search-head"><input type="search" placeholder="搜索文章标题、标签或正文…" aria-label="全站搜索" maxlength="160"><button class="search-close" type="button">关闭</button></div><p class="search-status" aria-live="polite"></p><div class="search-results"></div>';
  document.body.append(dialog);
  const input=dialog.querySelector('input'),results=dialog.querySelector('.search-results'),status=dialog.querySelector('.search-status');
  function highlight(text,terms){
    const lower=text.toLowerCase();let cursor=0,html='';
    while(cursor<text.length){
      let next=-1,word='';
      for(const term of terms){const at=lower.indexOf(term,cursor);if(at>=0&&(next<0||at<next)){next=at;word=term;}}
      if(next<0){html+=escape(text.slice(cursor));break;}
      html+=escape(text.slice(cursor,next))+'<mark>'+escape(text.slice(next,next+word.length))+'</mark>';cursor=next+word.length;
    }
    return html;
  }
  function snippet(text,terms){
    const lower=text.toLowerCase();const positions=terms.map(term=>lower.indexOf(term)).filter(at=>at>=0);
    const at=positions.length?Math.min(...positions):0,start=Math.max(0,at-28),end=Math.min(text.length,start+125);
    return (start?'…':'')+text.slice(start,end)+(end<text.length?'…':'');
  }
  function render(){
    const terms=input.value.trim().split(/\s+/).map(normalize).filter(Boolean).slice(0,12);
    const candidates=terms.length?[...roots,...entries]:roots;
    const matches=candidates.map(item=>{
      const title=normalize(item.title),description=normalize(item.description||''),body=normalize(item.text||'');
      const searchable=item.text?normalize((item.heading||'')+' '+item.text):normalize(item.title+' '+(item.description||'')+' '+(item.summary||''));
      if(!terms.every(term=>searchable.includes(term)))return null;
      const score=terms.reduce((sum,term)=>sum+(title.includes(term)?50:0)+(description.includes(term)?15:0)+(body.includes(term)?3:0),0)+(item.text?0:10);
      return {item,score};
    }).filter(Boolean).sort((a,b)=>b.score-a.score);
    status.textContent=failed?'正文索引暂时无法加载，仍可搜索页面和文章标题。':!loaded?'正在加载文章正文索引…':terms.length?`找到 ${matches.length} 项结果${matches.length>12?'，显示前 12 项':''}`:'支持已发布文章的标题、标签和正文搜索。';
    results.innerHTML=matches.length?matches.slice(0,12).map(({item})=>{
      const excerpt=snippet(item.text||item.summary||'',terms);
      return `<a class="search-result" href="${escape(item.href)}"><strong>${highlight(item.title,terms)}</strong><small>${escape(item.description||(item.text?item.sourceTitle+' · 正文':'文章'))}</small>${excerpt?`<p class="search-excerpt">${highlight(excerpt,terms)}</p>`:''}</a>`;
    }).join(''):`<p class="search-empty">${!loaded&&!failed?'正在加载正文，请稍候…':'没有找到相关内容，试试其他关键词。'}</p>`;
  }
  function loadIndex(){
    if(loaded)return Promise.resolve();if(loading)return loading;failed=false;
    loading=fetch('search-index.json?v=20261024-search').then(response=>{if(!response.ok)throw new Error('Search index unavailable');return response.json();}).then(data=>{
      if(!Array.isArray(data.items))throw new Error('Invalid search index');
      for(const item of data.items){
        if(typeof item.title!=='string'||typeof item.text!=='string'||!safeHref(item.href))continue;
        entries.push(item);
        const href=item.href.split('#')[0];
        if(item.sourceTitle&&!roots.some(root=>root.href===href))roots.push({title:item.sourceTitle,description:'已发布文章',href});
      }
      loaded=true;
    }).catch(()=>{failed=true;loading=null;}).finally(()=>{if(dialog.open)render();});
    return loading;
  }
  function openSearch(){if(!dialog.open)dialog.showModal();loadIndex();render();input.focus();}
  document.querySelectorAll('.search-open').forEach(button=>button.addEventListener('click',openSearch));
  dialog.querySelector('.search-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  input.addEventListener('input',render);
  results.addEventListener('click',event=>{if(event.target.closest('a.search-result'))dialog.close();});
  input.addEventListener('keydown',event=>{
    if(event.isComposing)return;
    if(event.key==='ArrowDown'){event.preventDefault();results.querySelector('a')?.focus();}
    if(event.key==='Enter'){event.preventDefault();results.querySelector('a')?.click();}
  });
  results.addEventListener('keydown',event=>{
    if(!['ArrowDown','ArrowUp'].includes(event.key))return;event.preventDefault();
    const links=[...results.querySelectorAll('a')],at=links.indexOf(document.activeElement),next=at+(event.key==='ArrowDown'?1:-1);
    if(next<0)input.focus();else links[next]?.focus();
  });
  document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();openSearch();}if(event.key==='Escape'&&dialog.open)dialog.close();});
})();
