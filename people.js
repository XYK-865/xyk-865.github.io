(()=>{
  const data=window.SPIKE_PEOPLE_LIBRARY;if(!data)return;
  const posts=window.SPIKE_POSTS||[];
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const articleHref=value=>typeof value==='string'&&/^(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.html(?:[?#][^\s"'<>]*)?$/.test(value)?value:null;
  const profileHref=person=>'person.html?id='+encodeURIComponent(person.id);
  const groupLabel=id=>data.groups.find(group=>group.id===id)?.label||'';
  const notesFor=person=>posts.filter(post=>post.peopleIds?.includes(person.id)&&articleHref(post.href));
  const peopleFor=post=>data.people.filter(person=>post.peopleIds?.includes(person.id));
  const state={group:'all',query:''};
  let container;

  function noteCard(post,heading='h4'){
    const names=peopleFor(post);
    return '<article class="people-note"><div class="people-note-meta"><span>'+escape(post.status==='published'?'已整理':'准备中')+'</span><time>'+escape(post.date)+'</time></div><'+heading+'><a href="'+escape(articleHref(post.href))+'">'+escape(post.title)+'</a></'+heading+'><p>'+escape(post.summary)+'</p><div class="people-note-footer"><div>'+names.map(person=>'<a href="'+profileHref(person)+'">'+escape(person.name)+'</a>').join('')+'</div><a class="people-read-link" href="'+escape(articleHref(post.href))+'">阅读笔记 <span aria-hidden="true">↗</span></a></div></article>';
  }

  function personCard(person){
    const notes=notesFor(person);
    return '<article class="person-card'+(notes.length?' has-notes':'')+'"><div class="person-card-top"><p>'+escape(groupLabel(person.group))+'</p><span class="person-status">'+(notes.length?notes.length+' 篇笔记':'待整理')+'</span></div><h4><a href="'+profileHref(person)+'">'+escape(person.name)+'</a></h4>'+(person.aliases.length?'<p class="person-aliases">'+(person.nameNote?'检索别名：':'')+escape(person.aliases.join(' / '))+'</p>':'')+'<p class="person-card-intro">'+escape(person.intro||(notes.length?'已有阅读与访谈笔记，人物资料待补充。':'资料与阅读笔记待整理。'))+'</p><a class="person-profile-link" href="'+profileHref(person)+'">查看人物 <span aria-hidden="true">↗</span></a></article>';
  }

  function updateResults(){
    const query=state.query.trim().toLocaleLowerCase();
    const people=data.people.filter(person=>(state.group==='all'||person.group===state.group)&&[person.name,...person.aliases,...person.topics,groupLabel(person.group)].join(' ').toLocaleLowerCase().includes(query));
    const notes=posts.filter(post=>articleHref(post.href)&&people.some(person=>post.peopleIds?.includes(person.id)));
    const groups=data.groups.filter(group=>people.some(person=>person.group===group.id));
    document.querySelector('#blog-result-count').textContent=people.length+' 位人物 · '+notes.length+' 篇笔记';
    container.querySelectorAll('[data-people-group]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.peopleGroup===state.group)));
    const results=container.querySelector('#people-results');
    results.innerHTML=(notes.length?'<section class="people-notes-section" aria-labelledby="people-notes-title"><div class="people-section-title"><h3 id="people-notes-title">已有笔记</h3><span>'+notes.length+' 篇</span></div><div class="people-notes-grid">'+notes.map(post=>noteCard(post)).join('')+'</div></section>':'')+(people.length?groups.map(group=>'<section class="people-group" aria-labelledby="people-group-'+group.id+'"><div class="people-section-title"><h3 id="people-group-'+group.id+'">'+escape(group.label)+'</h3><span>'+people.filter(person=>person.group===group.id).length+' 位</span></div><div class="people-card-grid">'+people.filter(person=>person.group===group.id).map(personCard).join('')+'</div></section>').join(''):'<div class="people-empty"><h3>没有找到相关人物</h3><p>试试姓名、英文名或阅读主题。</p><button type="button" data-people-reset>重置筛选</button></div>');
  }

  function render(target){
    if(container!==target){container=target;container.addEventListener('click',clicked);container.addEventListener('input',searched);}
    container.classList.add('people-view');
    container.innerHTML='<div class="people-browser"><div class="people-browser-intro"><div><p class="kicker">PEOPLE / 人物与阅读</p><h3>从一个人，读到一个问题。</h3><p>关注的作者、研究者与创业者，以及围绕他们留下的阅读和思考。</p></div><label class="people-search-label" for="people-search">搜索人物<input id="people-search" type="search" placeholder="姓名、英文名或主题" value="'+escape(state.query)+'" autocomplete="off" aria-controls="people-results"></label></div><div class="people-group-tabs" role="group" aria-label="按阅读主题浏览"><button type="button" data-people-group="all" aria-pressed="'+(state.group==='all')+'">全部人物</button>'+data.groups.map(group=>'<button type="button" data-people-group="'+group.id+'" aria-pressed="'+(state.group===group.id)+'">'+escape(group.label)+'</button>').join('')+'</div><p class="people-browser-note">按阅读主题归档；标记“待整理”的人物还没有笔记。YC 人物先从三位开始收录。</p></div><div id="people-results" aria-live="polite" aria-atomic="false"></div>';
    updateResults();
  }

  function clicked(event){
    if(!container.classList.contains('people-view'))return;
    const button=event.target.closest('[data-people-group],[data-people-reset]');if(!button)return;
    if(button.hasAttribute('data-people-reset')){state.group='all';state.query='';container.querySelector('#people-search').value='';}else state.group=button.dataset.peopleGroup;
    updateResults();
    if(button.hasAttribute('data-people-reset'))container.querySelector('#people-search').focus({preventScroll:true});
  }
  function searched(event){if(container.classList.contains('people-view')&&event.target.id==='people-search'){state.query=event.target.value;updateResults();}}

  function renderPerson(target){
    const id=new URL(location.href).searchParams.get('id'),person=data.people.find(item=>item.id===id);
    if(!person){document.title='未找到人物 · Spike Hsu';target.innerHTML='<div class="person-detail-hero"><p class="kicker">PEOPLE</p><h1>未找到这位人物</h1><p><a href="blog.html#people">返回人物目录 ↗</a></p></div>';return;}
    const notes=notesFor(person);
    document.title=person.name+' · 人物 · Spike Hsu';
    const sourceLinks=(person.sources||[]).filter(source=>/^https:\/\//.test(source.url));
    target.innerHTML='<header class="person-detail-hero"><p class="kicker">PEOPLE / '+escape(groupLabel(person.group))+'</p><h1>'+escape(person.name)+'</h1>'+(person.aliases.length?'<p class="person-detail-aliases">'+(person.nameNote?'检索别名：':'')+escape(person.aliases.join(' / '))+'</p>':'')+'<p class="person-detail-intro">'+escape(person.intro||'人物资料待整理。')+'</p><span class="person-detail-status">'+(notes.length?notes.length+' 篇相关笔记':'阅读笔记待整理')+'</span>'+(person.nameNote?'<p class="person-name-note">'+escape(person.nameNote)+'</p>':'')+'</header><section class="person-detail-notes" aria-labelledby="person-notes-title"><div class="people-section-title"><h2 id="person-notes-title">阅读与思考</h2><span>'+notes.length+' 篇</span></div>'+(notes.length?'<div class="people-notes-grid">'+notes.map(post=>noteCard(post,'h3')).join('')+'</div>':'<div class="person-pending"><p class="kicker">待整理</p><h3>下一篇笔记，从这里开始。</h3><p>这里会收录阅读、访谈与自己的思考。</p></div>')+'</section>'+(sourceLinks.length?'<section class="person-sources" aria-labelledby="person-sources-title"><h2 id="person-sources-title">资料来源</h2><ul>'+sourceLinks.map(source=>'<li><a href="'+escape(source.url)+'" target="_blank" rel="noopener noreferrer">'+escape(source.title)+' ↗</a><span>核对于 '+escape(source.checked)+'</span></li>').join('')+'</ul></section>':'')+'<a class="person-back-link" href="blog.html#people">← 返回人物目录</a>';
  }
  window.SpikePeople={render};
  const detail=document.querySelector('#person-detail');if(detail)renderPerson(detail);
})();
