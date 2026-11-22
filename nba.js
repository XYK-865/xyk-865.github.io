import {esc, link, load, validateNBA, failure} from './learning-store.js';

const main = document.querySelector('#main');
const params = new URLSearchParams(location.search);
const url = (key, id) => 'nba.html?' + new URLSearchParams({[key]: id});
const empty = message => `<p class="learning-empty">${esc(message)}</p>`;
const grid = content => `<div class="learning-grid">${content}</div>`;
const rounds = {finals: '总决赛', east: '东部决赛', west: '西部决赛'};
const awards = {mvp: '常规赛 MVP', champion: 'NBA 总冠军', 'finals-mvp': '总决赛 MVP'};
const head = (title, text) => `<header class="learning-hero"><p class="kicker">NBA / 收藏馆</p><h1>${esc(title)}</h1><p>${esc(text)}</p></header>`;

function start() {
  load('nba-data.json', validateNBA).then(render).catch(error => {
    console.error(error);
    failure(main, start);
  });
}

function render(data) {
  const {players, teams, images, memberships} = data;
  const {jerseys = [], cards = [], shoes = [], interviews = [], honors = [], seasons = [], series = []} = data;
  const byId = rows => new Map(rows.map(row => [row.id, row]));
  const playerById = byId(players), teamById = byId(teams), imageById = byId(images);
  const seasonById = byId(seasons), seriesById = byId(series);
  const layoutPreview = params.get('view') === 'player-layout';
  const team = teamById.get(params.get('team'));
  const player = playerById.get(params.get('player')) || (layoutPreview
    ? {id:'',name:'球员',reason:'球员馆结构预览。选定球员后，这里会显示姓名、简介和关联球队。'} : null);
  const selectedSeries = seriesById.get(params.get('series'));
  const archive = params.get('view') === 'playoffs';
  const playerLink = id => playerById.has(id) ? link(url('player', id), playerById.get(id).name) : '';
  const teamLink = id => teamById.has(id) ? link(url('team', id), teamById.get(id).name) : '';
  const getImages = ids => (ids || []).map(id => imageById.get(id)).filter(Boolean);
  const archiveLink = 'nba.html?view=playoffs';
  const section = (id, title, html) => `<section id="${id}" class="daily-chapter"><h2>${title}</h2>${html}</section>`;
  const groups = new Map();
  let nextGroup = 0;

  function media(items, {frame = '', message = '这个展区等你加入收藏。'} = {}) {
    const entries = items.filter(item => item.image);
    if (!entries.length) return empty(message);
    const group = String(nextGroup++);
    groups.set(group, entries);
    return grid(entries.map(({image, title}, i) => `<figure class="learning-card nba-media ${frame}">
      <button class="nba-image-button" data-group="${group}" data-media="${i}" aria-label="放大：${esc(title || image.caption)}">
        <img src="${esc(image.src)}" alt="${esc(image.caption)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">${title ? `<span>${esc(title)}</span>` : ''}
      </button><figcaption>${esc(image.caption)}</figcaption></figure>`).join(''));
  }
  const plainMedia = (rows, options) => media(rows.map(image => ({image})), options);

  function home() {
    const teamDoor = (id, fallback) => {
      const entry = teamById.get(id);
      return entry ? `<a href="${url('team', id)}" aria-label="进入${esc(entry.name)}历史馆"><small>${esc(entry.mark || id.toUpperCase())}</small><strong>${esc(entry.shortName || entry.name)}</strong><span>进入球队馆 →</span></a>` : fallback;
    };
    const choices = players.map(p => `<article class="learning-card"><h3>${playerLink(p.id)}</h3><p>${esc(p.reason || '个人展示馆')}</p></article>`).join('');
    return `<header class="nba-split"><div class="nba-split-copy"><p class="kicker">BASKETBALL / 个人兴趣</p>
      <h1>NBA 收藏馆</h1><p>${esc(data.hero.intro)}</p></div><div class="nba-doors">${teamDoor('okc', '')}${teamDoor('sas', '')}</div></header>
      <nav class="learning-nav" aria-label="NBA 收藏馆"><a href="#nba-players">球员展示馆</a><a href="${archiveLink}">季后赛影像档案</a><a href="#nba-gallery">图片收藏</a></nav>
      ${section('nba-players', '球员展示馆', choices ? grid(choices) : empty('选好球员后，每位球员都会有独立入口，展示照片、球衣、球员卡、采访和荣誉。') + link('nba.html?view=player-layout', '预览球员馆结构'))}
      ${section('nba-archive-entry', '季后赛影像档案', `<p>按赛季、轮次和系列赛回看比赛。</p>${link(archiveLink, '打开季后赛档案')}`)}
      ${gallery(images)}`;
  }

  function teamRoom() {
    const teammates = [...new Set(memberships.filter(m => m.teamId === team.id).map(m => m.playerId))];
    const eras = (team.eras || []).map(era => {
      const eraImages = images.filter(image => image.eraIds?.includes(era.id));
      const people = (era.playerIds || []).map(playerLink).filter(Boolean);
      return section('era-' + esc(era.id), esc(era.title), `<p>${esc(era.note)}</p>
        <p>${people.join(' · ') || '等待收录这个时期的球员。'}</p>
        ${(era.games || []).length ? `<h3>重要比赛</h3><ul>${era.games.map(game => `<li>${esc(game.date)} · ${esc(game.title)} · ${esc(game.note)} ${game.sourceUrl ? link(game.sourceUrl, '来源') : ''}</li>`).join('')}</ul>` : '<p class="chapter-muted">重要比赛待添加。</p>'}
        ${plainMedia(eraImages, {message: '待补球队影像。'})}`);
    }).join('');
    return head(team.name + '历史馆', team.note)
      + `<nav class="learning-nav" aria-label="球队历史时期">${(team.eras || []).map(era => `<a href="#era-${esc(era.id)}">${esc(era.title)}</a>`).join('')}</nav>`
      + eras + section('team-players', '相关球员', teammates.length ? teammates.map(playerLink).join(' · ') : empty('关联球员将显示在这里。'))
      + gallery(images.filter(image => image.teamIds.includes(team.id)));
  }

  function playerRoom() {
    const related = memberships.filter(m => m.playerId === player.id);
    const select = rows => rows.filter(row => row.playerId === player.id);
    const playerJerseys = select(jerseys);
    const wallTeams = [...new Set(playerJerseys.map(row => row.teamId).filter(Boolean))];
    const jerseyOutline = row => `<svg viewBox="0 0 120 124" aria-hidden="true"><path d="M39 9h11q10 13 20 0h11l25 14-12 26-10-5v70H36V44l-10 5-12-26z"/><text x="60" y="81">${esc(row.number ?? '')}</text></svg>`;
    const jerseyCard = row => {
      const title = [row.title, row.season || seasonById.get(row.seasonId)?.title].filter(Boolean).join(' · ');
      const photo = imageById.get(row.imageId);
      let frame = `<div class="nba-frame" data-tone="${esc(row.tone || 'navy')}" aria-hidden="true">${jerseyOutline(row)}<span>装裱示意</span></div>`;
      if (photo) {
        const group = String(nextGroup++);
        groups.set(group, [{image: photo, title}]);
        frame = `<button class="nba-frame nba-jersey-photo" data-group="${group}" data-media="0" aria-label="放大：${esc(title)}">
          <img src="${esc(photo.src)}" alt="${esc(photo.caption)}" loading="lazy" decoding="async" referrerpolicy="no-referrer"></button>`;
      }
      return `<article class="learning-card nba-exhibit">${frame}
        <h4>${esc(title)}</h4><small>${esc(row.status || '')}</small>
        ${row.sourceUrl ? `<p>${link(row.sourceUrl, '查看款式或资料来源')}</p>` : ''}
      </article>`;
    };
    const ringRows = player.id === 'kawhi-leonard'
      ? [...playerJerseys].sort((a, b) => (a.season || '').localeCompare(b.season || '')) : [];
    const ring = ringRows.length ? `<div class="nba-ring" aria-label="球衣环形时间线">
      <div class="nba-ring-heading"><div><p class="kicker">JERSEY TIMELINE</p><h3>环形展墙</h3></div>
      <div class="nba-ring-controls"><button type="button" data-ring-step="-1" aria-label="前一个时期">←</button>
      <button type="button" data-ring-step="1" aria-label="后一个时期">→</button></div></div>
      <p>按赛季从早到晚。点球衣或用左右方向键转动展墙。</p>
      <div class="nba-ring-stage">${ringRows.map((row, i) => `<button type="button" class="nba-ring-stop" data-ring-index="${i}" data-tone="${esc(row.tone || 'navy')}" aria-pressed="false">
        ${jerseyOutline(row)}<strong>${esc(row.season)}</strong><span>${esc(teamById.get(row.teamId)?.shortName || '特别赛事')}</span></button>`).join('')}</div>
      <div class="nba-ring-details" aria-live="polite">${ringRows.map((row, i) => `<div data-ring-detail hidden>
        <strong>${esc(row.season)} · ${esc(row.title)}</strong><p>${esc(row.status)} · 装裱示意</p>
        ${row.sourceUrl ? link(row.sourceUrl, '查看资料来源') : ''}</div>`).join('')}</div></div>` : '';
    const jerseyWalls = player.id === 'shai-gilgeous-alexander' ? '' : wallTeams.map(id => `<section class="nba-team-wall" id="wall-${esc(id)}"><h3>${esc(teamById.get(id)?.name || id)}装裱墙</h3>
      ${grid(playerJerseys.filter(row => row.teamId === id).map(jerseyCard).join(''))}</section>`).join('');
    const eventJerseys = playerJerseys.filter(row => !row.teamId);
    const isSga = player.id === 'shai-gilgeous-alexander';
    const startYear = row => Number((row.season || '').slice(0, 4));
    const regularRows = playerJerseys.filter(row => /Association \/ Icon \/ Statement/.test(row.title));
    const bySeason = new Map();
    if (isSga) {
      for (const row of playerJerseys.filter(row => row.teamId && !regularRows.includes(row))) {
        if (!bySeason.has(row.season)) bySeason.set(row.season, []);
        bySeason.get(row.season).push(row);
      }
      for (const row of regularRows) {
        const first = startYear(row);
        const last = Number(row.season.match(/至 (\d{4})/)?.[1] || first);
        for (let year = first; year <= last; year++) {
          const season = year + '–' + String(year + 1).slice(-2);
          if (!bySeason.has(season)) bySeason.set(season, []);
          bySeason.get(season).unshift(...['Association', 'Icon', 'Statement'].map((title, i) => ({
            ...row, title, season, tone: ['silver', 'blue', 'navy'][i]
          })));
        }
      }
    }
    const timeline = [...bySeason].sort(([a], [b]) => a.localeCompare(b));
    const timelineWall = timeline.length ? `<div class="nba-sga-wall" aria-label="SGA 球衣半环展墙">
      <div class="nba-ring-heading"><div><p class="kicker">SGA / JERSEY ARCHIVE</p><h3>球衣半环展墙</h3></div>
        <div class="nba-ring-controls"><button type="button" data-wall-step="-1" aria-label="向左浏览赛季">←</button><button type="button" data-wall-step="1" aria-label="向右浏览赛季">→</button></div></div>
      <p>从左到右，从快船新秀季走到雷霆。点年份直达展位，或横向浏览。</p>
      <div class="nba-wall-plan" aria-label="赛季导航">
        <svg viewBox="0 0 1000 175" preserveAspectRatio="none" aria-hidden="true"><path d="M24 155 Q500 -110 976 155"/></svg>
        ${timeline.map(([season], i) => {
          const fraction = timeline.length === 1 ? .5 : i / (timeline.length - 1);
          return `<button type="button" data-wall-year="${i}" style="--x:${2.4 + fraction * 95.2}%;--y:${(155 - 530 * fraction * (1 - fraction)) / 1.75}%" aria-label="查看 ${esc(season)} 赛季"><span>${esc(season.slice(0,4))}</span></button>`;
        }).join('')}
      </div>
      <div class="nba-wall-track" tabindex="0" aria-label="按赛季横向浏览球衣">
        ${timeline.map(([season, rows], i) => {
          const teamId = rows[0].teamId;
          const anchor = i === 0 || timeline[i - 1][1][0].teamId !== teamId ? ' id="wall-' + esc(teamId) + '"' : '';
          return `<section class="nba-wall-bay" data-wall-bay${anchor}><header><small>${esc(teamById.get(teamId)?.shortName || teamId)}</small><h4>${esc(season)}</h4></header><div class="nba-bay-frames">${rows.map(jerseyCard).join('')}</div></section>`;
        }).join('')}
      </div><p class="nba-wall-note">有照片的展框可放大。其余用装裱示意，球队款式与已核实实穿分别标注。</p></div>` : '';
    const cardWall = select(cards).map(row => {
      const views = [{image: imageById.get(row.frontId), title: '正面'}, {image: imageById.get(row.backId), title: '背面'}];
      if (isSga) {
        const face = views[0].image;
        const dialogId = 'card-' + row.id;
        return `<article class="nba-acrylic-display">
          <button type="button" class="nba-acrylic-button" data-card-open="${esc(dialogId)}" aria-haspopup="dialog">
            <span class="nba-acrylic-card">${face ? `<img src="${esc(face.src)}" alt="" loading="lazy">` : ''}<strong>${esc(row.title)}</strong></span>
            <span class="nba-acrylic-base">${esc(row.season)} <span>查看卡片 →</span></span>
          </button>
          <dialog class="nba-card-dialog" id="${esc(dialogId)}" aria-labelledby="${esc(dialogId)}-title">
            <form method="dialog"><button aria-label="关闭卡片详情">关闭</button></form>
            <p class="kicker">SGA / CARD ARCHIVE</p><h3 id="${esc(dialogId)}-title">${esc(row.title)}</h3>
            <dl><dt>赛季</dt><dd>${esc(row.season || '待核对')}</dd><dt>卡面图源</dt><dd>${link(row.sourceUrl, row.photoSource || '查看来源')}<br>原始摄影与具体拍摄场次待核对。</dd>
            <dt>卡片背后的故事</dt><dd>${esc(row.story || '待补充')} ${row.storyUrl ? link(row.storyUrl, '核对故事出处') : ''}</dd></dl>
            ${views.some(view => view.image) ? media(views) : '<p>站内正反面图片待补，可打开上面的图源。</p>'}
          </dialog></article>`;
      }
      return `<article class="learning-card nba-collectible"><h3>${esc(row.title)}</h3>
        ${views.some(view => view.image) ? media(views) : '<p class="chapter-muted">正反面素材待补</p>'}
        ${row.sourceUrl ? link(row.sourceUrl, '查看卡图或清单') : ''}</article>`;
    }).join('');
    const playerShoes = select(shoes);
    const shoeRack = playerShoes.length ? section('player-shoes', '赛博球鞋架',
      `<div class="nba-shoe-rack"><p class="kicker">CONVERSE / SHAI 001</p>${
        [...new Set(playerShoes.map(row => row.model))].map(model => `<section><h3>${esc(model)}</h3>
        <ul class="nba-shoe-shelf">${playerShoes.filter(row => row.model === model).map(row => `<li data-tone="${esc(row.tone)}">
          <svg viewBox="0 0 120 52" aria-hidden="true"><path d="M5 36c3-7 14-5 25-8 12-4 16-16 24-16l13 9 20-3 14-8c4 3 7 11 8 18l6 10-2 6H9z"/><path d="M9 39h103"/></svg>
          <strong>${esc(row.title)}</strong>${link(row.sourceUrl, '官方图与详情')}</li>`).join('')}</ul></section>`).join('')
      }<p>鞋型为展架示意。${link('https://investors.nike.com/_assets/_7ad5807a683b3a1e2c41980aae77adf4/nike/db/938/9540/webcast_transcript/NIKE-Inc-Q4FY26-OFFICIAL-Transcript_-FINAL.pdf', 'Nike 后续展位 · 官方资料')}</p></div>`) : '';
    const clips = select(interviews).map(row => `<article class="learning-card"><h3>${esc(row.title)}</h3>
      <p>${row.time ? `<time>${esc(row.time)}</time> · ` : ''}${row.url ? link(row.url, '原视频') : ''}</p><p>${esc(row.note)}</p><small>${esc(row.source)} · ${esc(row.credit)}</small></article>`).join('');
    return head(player.name + '展示馆', player.reason || '我的球员收藏')
      + (player.sourceUrl ? '<p>' + link(player.sourceUrl, '核对最新效力记录') + '</p>' : '')
      + `<div class="learning-nav" aria-label="效力时期">${related.map(m => `<span>${teamLink(m.teamId)} · ${esc(m.period)}</span>`).join('')}</div>`
      + (wallTeams.length ? '<nav class="learning-nav" aria-label="收藏展区">' + wallTeams.map(id => '<a href="#wall-' + esc(id) + '">' + esc(teamById.get(id)?.shortName || id) + '墙</a>').join('') + '<a href="#player-cards">球星卡</a>' + (shoeRack ? '<a href="#player-shoes">球鞋架</a>' : '') + '</nav>' : '')
      + section('player-photos', '精选照片', plainMedia(images.filter(i => i.playerIds.includes(player.id) && (!i.kind || i.kind === 'photo') && !i.seriesId)))
      + section('player-jerseys', '线上球衣装裱', timelineWall || jerseyWalls || eventJerseys.length ? ring + (timelineWall || jerseyWalls) + (eventJerseys.length ? '<h3>特别赛事球衣</h3>' + grid(eventJerseys.map(jerseyCard).join('')) : '') : empty('等待球衣照片、号码、所属球队和赛季。'))
      + section('player-cards', '球员卡', cardWall ? (isSga ? '<div class="nba-acrylic-grid">' + cardWall + '</div>' : grid(cardWall)) : empty('等待球员卡正反面。'))
      + shoeRack
      + section('player-interviews', '采访片段', clips ? grid(clips) : empty('等待采访视频链接、片段时间点和你的备注。'))
      + section('player-honors', '荣誉时刻', Object.entries(awards).map(([id, name]) => `<h3>${name}</h3>${media(select(honors).filter(row => row.type === id).flatMap(row => getImages(row.imageIds).map(image => ({image, title: String(row.year)}))))}`).join(''));
  }

  function playoffs() {
    return head('季后赛影像档案', '赛季 → 轮次 → 系列赛')
      + seasons.map(season => section('season-' + esc(season.id), esc(season.title), grid(Object.entries(rounds).map(([id, name]) => {
        const matchups = series.filter(s => s.seasonId === season.id && s.round === id);
        return `<article class="learning-card"><h3>${name}</h3>${matchups.length ? matchups.map(s => `<p>${link(url('series', s.id), s.title)}</p>`).join('') : '<p>待收录系列赛。</p>'}</article>`;
      }).join('')))).join('') + gallery(images.filter(image => seriesById.has(image.seriesId)));
  }

  function seriesRoom() {
    const s = selectedSeries;
    const photos = images.filter(image => image.seriesId === s.id);
    return head(s.title, [seasonById.get(s.seasonId)?.title, rounds[s.round]].filter(Boolean).join(' · '))
      + `<div class="learning-nav">${(s.teamIds || []).map(teamLink).join('') || '<span>对阵待录入</span>'}</div>`
      + section('series-games', '场次与精彩时刻', (s.games || []).map(game => `<article class="learning-card">
        <h3>${esc(game.title)}</h3><p>${esc(game.date)} · ${esc(game.note)}</p>
        ${game.sourceUrl ? link(game.sourceUrl, '比赛来源') : ''}${plainMedia(photos.filter(i => i.gameId === game.id))}</article>`).join('') || empty('待加入比赛日期、场次和精彩时刻。'))
      + gallery(photos);
  }

  let galleryItems;
  function gallery(rows) {
    galleryItems = rows;
    const select = (id, label, options) => `<label>${label}<select id="nba-${id}"><option value="">全部${label}</option>${options.map(({id, title}) => `<option value="${esc(id)}">${esc(title)}</option>`).join('')}</select></label>`;
    return section('nba-gallery', '图片收藏', `<div class="learning-controls">
      ${select('season', '赛季', seasons)}
      ${select('team', '球队', teams.map(t => ({id: t.id, title: t.name})))}
      ${select('player', '球员', players.map(p => ({id: p.id, title: p.name})))}
      ${select('tag', '标签', [...new Set(rows.flatMap(i => i.tags))].map(t => ({id: t, title: t})))}
      <button id="nba-reset" type="button">清空筛选</button></div>
      <p id="nba-count" role="status"></p><div id="nba-images"></div>`);
  }

  const detail = params.has('team') || params.has('player') || params.has('series') || layoutPreview;
  const body = team ? teamRoom() : player ? playerRoom() : selectedSeries ? seriesRoom()
    : detail ? head('暂未收录', '可以返回收藏馆查看已开放的展区。') : archive ? playoffs() : home();
  main.innerHTML = `<p>${link('daily.html', '返回日常')}${detail || archive ? ' · ' + link('nba.html', 'NBA 收藏馆') : ''}
    ${selectedSeries ? ' · ' + link(archiveLink, '季后赛影像档案') : ''}</p>${body}
    <dialog id="nba-lightbox" aria-label="查看收藏图片"><div class="nba-lightbox-controls">
      <button id="nba-prev" aria-label="上一张">← 上一张</button><span id="nba-position" aria-live="polite"></span>
      <button id="nba-next" aria-label="下一张">下一张 →</button><button id="nba-close">关闭</button>
    </div><div id="nba-large"></div><div id="nba-caption"></div></dialog>`;
  if (detail || archive) document.title = main.querySelector('h1').textContent + ' · Spike Hsu';

  function fallbacks(root) {
    for (const img of root.querySelectorAll('img')) {
      img.addEventListener('error', () => {
        img.hidden = true;
        img.insertAdjacentHTML('afterend', empty('图片暂时无法加载。'));
      }, {once:true});
    }
  }
  fallbacks(main);

  const ring = main.querySelector('.nba-ring');
  if (ring) {
    const stops = [...ring.querySelectorAll('[data-ring-index]')];
    const details = [...ring.querySelectorAll('[data-ring-detail]')];
    let index = 0;
    function rotate(next) {
      index = (next + stops.length) % stops.length;
      stops.forEach((stop, i) => {
        const angle = (i - index) * 2 * Math.PI / stops.length;
        const depth = Math.cos(angle);
        stop.style.setProperty('--ring-x', (50 + Math.sin(angle) * 33) + '%');
        stop.style.setProperty('--ring-y', (50 + depth * 28) + '%');
        stop.style.setProperty('--ring-scale', (0.84 + depth * 0.16).toFixed(2));
        stop.style.zIndex = String(Math.round(10 + depth * 8));
        stop.setAttribute('aria-pressed', String(i === index));
        details[i].hidden = i !== index;
      });
    }
    rotate(0);
    ring.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (button?.dataset.ringIndex !== undefined) rotate(Number(button.dataset.ringIndex));
      if (button?.dataset.ringStep !== undefined) rotate(index + Number(button.dataset.ringStep));
    });
    ring.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      rotate(index + (event.key === 'ArrowRight' ? 1 : -1));
    });
  }


  if (galleryItems) {
    const keys = ['season', 'team', 'player', 'tag'];
    const filters = Object.fromEntries(keys.map(key => [key, main.querySelector('#nba-' + key)]));
    let galleryGroup;
    function draw() {
      if (galleryGroup) groups.delete(galleryGroup);
      const {season, team, player, tag} = Object.fromEntries(keys.map(k => [k, filters[k].value]));
      const rows = galleryItems.filter(i =>
        (!season || (i.seasonId || seriesById.get(i.seriesId)?.seasonId) === season)
        && (!team || i.teamIds.includes(team))
        && (!player || i.playerIds.includes(player))
        && (!tag || i.tags.includes(tag)));
      const results = main.querySelector('#nba-images');
      results.innerHTML = plainMedia(rows, {message: galleryItems.length ? '没有符合当前筛选的照片。' : '暂无图片，加入收藏后可按赛季、球队和球员筛选。'});
      galleryGroup = results.querySelector('[data-group]')?.dataset.group;
      main.querySelector('#nba-count').textContent = rows.length + ' 张图片';
      fallbacks(results);
    }
    for (const filter of Object.values(filters)) filter.addEventListener('change', draw);
    main.querySelector('#nba-reset').onclick = () => {
      for (const filter of Object.values(filters)) filter.value = '';
      draw();
    };
    draw();
  }

  const track = main.querySelector('.nba-wall-track');
  if (track) {
    const bays = [...track.querySelectorAll('[data-wall-bay]')];
    const wall = track.closest('.nba-sga-wall');
    const years = [...wall.querySelectorAll('[data-wall-year]')];
    const steps = [...wall.querySelectorAll('[data-wall-step]')];
    const position = bay => bay.offsetLeft;
    const current = () => track.scrollLeft >= track.scrollWidth - track.clientWidth - 2 ? bays.length - 1 : bays.reduce((best, bay, i) =>
      Math.abs(position(bay) - track.scrollLeft) < Math.abs(position(bays[best]) - track.scrollLeft) ? i : best, 0);
    const jump = i => {
      const bay = bays[Math.max(0, Math.min(bays.length - 1, i))];
      track.scrollTo({left: position(bay), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    };
    const highlight = () => {
      const index = current();
      bays.forEach((bay, i) => bay.style.setProperty('--bay-angle', Math.max(-15, Math.min(15, (i - index) * -9)) + 'deg'));
      years.forEach((button, i) => button.setAttribute('aria-current', i === index ? 'step' : 'false'));
      steps[0].disabled = index === 0;
      steps[1].disabled = index === bays.length - 1;
    };
    years.forEach((button, i) => button.onclick = () => jump(i));
    steps.forEach(button => button.onclick = () => jump(current() + Number(button.dataset.wallStep)));
    track.addEventListener('scroll', highlight, {passive: true});
    track.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key) || event.target !== track) return;
      event.preventDefault();
      jump(current() + (event.key === 'ArrowRight' ? 1 : -1));
    });
    highlight();
  }
  main.querySelectorAll('[data-card-open]').forEach(button => {
    const dialog = document.getElementById(button.dataset.cardOpen);
    button.onclick = () => dialog.showModal();
    dialog.addEventListener('close', () => button.focus());
  });

  const box = main.querySelector('#nba-lightbox');
  let visible = [], active = 0, returnFocus, touchX;
  function show(index) {
    active = (index + visible.length) % visible.length;
    const {image, title} = visible[active];
    const large = main.querySelector('#nba-large');
    large.innerHTML = `<img src="${esc(image.src)}" alt="${esc(image.caption)}">`;
    const season = seasonById.get(image.seasonId || seriesById.get(image.seriesId)?.seasonId)?.title;
    main.querySelector('#nba-caption').innerHTML = `<h2>${esc(title || image.caption)}</h2>
      ${title ? `<p>${esc(image.caption)}</p>` : ''}<p>${[image.date, season || image.season].filter(Boolean).map(esc).join(' · ')}</p>
      <p>来源：${image.sourceUrl ? link(image.sourceUrl, image.source) : esc(image.source)} · 署名：${esc(image.credit || '未记录')}</p>`;
    main.querySelector('#nba-position').textContent = (active + 1) + ' / ' + visible.length;
    main.querySelector('#nba-prev').disabled = main.querySelector('#nba-next').disabled = visible.length < 2;
    fallbacks(large);
  }
  main.addEventListener('click', event => {
    const button = event.target.closest('[data-media]');
    if (!button) return;
    visible = groups.get(button.dataset.group);
    returnFocus = button;
    show(Number(button.dataset.media));
    box.showModal();
  });
  main.querySelector('#nba-prev').onclick = () => show(active - 1);
  main.querySelector('#nba-next').onclick = () => show(active + 1);
  main.querySelector('#nba-close').onclick = () => box.close();
  box.addEventListener('close', () => returnFocus?.focus());
  box.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    show(active + (event.key === 'ArrowLeft' ? -1 : 1));
  });
  const large = main.querySelector('#nba-large');
  large.addEventListener('touchstart', e => {touchX = e.changedTouches[0].clientX;}, {passive:true});
  large.addEventListener('touchend', e => {
    const distance = e.changedTouches[0].clientX - touchX;
    if (Math.abs(distance) > 40) show(active + (distance < 0 ? 1 : -1));
  }, {passive:true});
}

start();
