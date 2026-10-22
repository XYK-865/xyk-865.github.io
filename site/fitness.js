(() => {
  'use strict';
  const movements = window.FITNESS_MOVEMENTS || [];
  const byId = new Map(movements.map(item => [item.id, item]));
  const aliases = {
    '杠铃平板卧推': 'pair-01',
    '传统杠铃硬拉': 'back-01',
    '硬拉': 'back-01',
    '哑铃侧平举': 'shoulder-01',
    '史密斯上斜卧推': 'pair-17',
    'T杠划船': 'back-09',
    '坐姿绳索V把划船': 'back-11',
    '器械把手侧平举': 'shoulder-11'
  };
  const categories = [
    ['all', '全部'], ['chest', '胸'], ['back', '背'], ['shoulders', '肩'],
    ['biceps', '肱二'], ['triceps', '肱三'], ['quads', '股四'], ['hamstrings', '腘绳肌']
  ];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  function resolveMovement(name) {
    return byId.get(aliases[name]) || movements.find(item => item.name === name);
  }
  function movementButton(name, className = 'movement-inline') {
    const match = resolveMovement(name);
    return match
      ? '<button type="button" class="' + className + '" data-movement-id="' + match.id + '">' + escape(name) + '</button>'
      : escape(name);
  }

  let movementDialog;
  function openMovement(id) {
    const item = byId.get(id);
    if (!item) return;
    if (!movementDialog) {
      movementDialog = document.createElement('dialog');
      movementDialog.className = 'movement-dialog';
      movementDialog.setAttribute('aria-labelledby', 'movement-dialog-title');
      document.body.append(movementDialog);
      movementDialog.addEventListener('click', event => {
        if (event.target === movementDialog || event.target.closest('.movement-dialog-close')) movementDialog.close();
      });
    }
    movementDialog.innerHTML = '<div class="movement-dialog-head"><h2 id="movement-dialog-title">' + escape(item.name) +
      '</h2><button class="movement-dialog-close" type="button">关闭</button></div>' +
      '<div class="movement-dialog-pair"><figure><a href="' + escape(item.action) + '" target="_blank" rel="noopener">' +
      '<img src="' + escape(item.action) + '" alt="' + escape(item.name) + '动作示意"></a><figcaption>动作示意 · 点击查看原尺寸</figcaption></figure>' +
      '<figure><a href="' + escape(item.muscles) + '" target="_blank" rel="noopener"><img src="' + escape(item.muscles) +
      '" alt="' + escape(item.name) + '训练部位配图"></a><figcaption>训练部位 · 素材原始标注</figcaption></figure></div>' +
      '<p class="movement-dialog-description">' + escape(item.caption) + '</p>';
    movementDialog.showModal();
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-movement-id]');
    if (button) openMovement(button.dataset.movementId);
  });

  document.querySelectorAll('[data-practice-illustration]').forEach(figure => {
    const match = resolveMovement(figure.dataset.practiceIllustration);
    if (!match) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.movementId = match.id;
    button.setAttribute('aria-label', '查看' + match.name + '动作与肌群配图');
    button.innerHTML = '<img src="' + escape(match.action) + '" alt="' + escape(match.name) + '动作示意" loading="lazy">';
    figure.prepend(button);
  });
  document.querySelectorAll('.practice-article tbody td').forEach(cell => {
    const name = cell.textContent.trim();
    if (resolveMovement(name)) cell.innerHTML = movementButton(name);
  });

  const grid = document.getElementById('movement-grid');
  if (grid) {
    const params = new URLSearchParams(location.search);
    let category = categories.some(item => item[0] === params.get('category')) ? params.get('category') : 'all';
    const search = document.getElementById('movement-search');
    const filters = document.getElementById('movement-filters');
    search.value = params.get('q') || '';
    function renderMovements() {
      const query = search.value.trim().toLowerCase();
      const aliasNames = Object.entries(aliases);
      const filtered = movements.filter(item => {
        const names = item.name + ' ' + aliasNames.filter(pair => pair[1] === item.id).map(pair => pair[0]).join(' ');
        return (category === 'all' || item.category === category) && (!query || names.toLowerCase().includes(query));
      });
      filters.innerHTML = categories.map(([id, label]) => {
        const count = id === 'all' ? movements.length : movements.filter(item => item.category === id).length;
        return '<button type="button" data-category="' + id + '" class="' + (category === id ? 'active' : '') +
          '" aria-pressed="' + (category === id) + '">' + label + ' ' + count + '</button>';
      }).join('');
      document.getElementById('movement-result-count').textContent = '显示 ' + filtered.length + ' / ' + movements.length + ' 组动作';
      grid.innerHTML = filtered.length ? filtered.map(item =>
        '<button type="button" class="movement-card" data-movement-id="' + item.id + '" aria-label="查看' + escape(item.name) + '完整配图">' +
        '<img src="' + escape(item.action) + '" alt="' + escape(item.name) + '动作示意" loading="lazy" width="640" height="360">' +
        '<span class="movement-card-copy"><small>' + escape(item.categoryLabel) + ' / 动作与肌群</small><strong>' +
        escape(item.name) + '</strong><span>' + escape(item.caption) + '</span></span></button>'
      ).join('') : '<p class="fitness-no-results">没有找到对应动作。试试缩短关键词，或切换到“全部”。</p>';
      const next = new URL(location.href);
      category === 'all' ? next.searchParams.delete('category') : next.searchParams.set('category', category);
      query ? next.searchParams.set('q', search.value.trim()) : next.searchParams.delete('q');
      history.replaceState(null, '', next);
    }
    filters.addEventListener('click', event => {
      const button = event.target.closest('[data-category]');
      if (button) { category = button.dataset.category; renderMovements(); }
    });
    search.addEventListener('input', renderMovements);
    renderMovements();
  }

  const logList = document.getElementById('fitness-log-list');
  if (logList && window.FITNESS_LOG_DATA) {
    const data = window.FITNESS_LOG_DATA;
    const sourceSessions = data.sessions;
    const sessions = sourceSessions.map((session, index) => ({ ...session, sourceIndex: index }))
      .sort((a, b) => b.date.localeCompare(a.date) || b.sourceIndex - a.sourceIndex);
    const monthSelect = document.getElementById('log-month');
    const isWarmup = set => /热|warm/i.test(String(set.setType || ''));
    const hasValue = value => value !== undefined && value !== null && value !== '';
    const completedCount = session => session.movements.reduce((total, movement) =>
      total + movement.sets.filter(set => set.done === true).length, 0);
    const statPairs = [
      [data.summary.trainingDays, '个有训练记录的日期'],
      [data.summary.sessionCount, '条训练记录'],
      [data.summary.movementNames, '个完成过的动作'],
      [data.summary.completedWorkSets, '组已完成正式组']
    ];
    document.getElementById('fitness-log-stats').innerHTML = statPairs.map(([value, label]) =>
      '<div><strong>' + escape(value) + '</strong><span>' + label + '</span></div>').join('');
    const start = data.period.start.slice(0, 7);
    const end = data.period.end.slice(0, 7);
    const months = [];
    let cursor = start;
    while (cursor <= end) {
      months.unshift(cursor);
      const [year, month] = cursor.split('-').map(Number);
      cursor = month === 12 ? String(year + 1) + '-01' : year + '-' + String(month + 1).padStart(2, '0');
    }
    months.forEach(month => {
      const option = document.createElement('option');
      option.value = month;
      option.textContent = month.replace('-', ' 年 ') + ' 月（' + sessions.filter(item => item.date.startsWith(month)).length + ' 条）';
      monthSelect.append(option);
    });
    const initialMonth = new URLSearchParams(location.search).get('month');
    if (months.includes(initialMonth)) monthSelect.value = initialMonth;

    function weightText(set) {
      let text = hasValue(set.weight) ? escape(set.weight) + (set.unit ? ' ' + escape(set.unit) : '') : '未记录';
      if (set.selfWeight) text = hasValue(set.weight) && Number(set.weight) !== 0 ? '自重；记录负重 ' + text : '自重';
      if (hasValue(set.leftWeight)) text += '<span class="set-detail">左侧记录：' + escape(set.leftWeight) + ' ' + escape(set.unit || '') + '</span>';
      return text;
    }
    function setNotes(set) {
      const notes = [];
      if (hasValue(set.rpe)) notes.push('RPE ' + set.rpe);
      if (set.note) notes.push(set.note);
      if (set.comment && set.comment !== set.note) notes.push(set.comment);
      return notes.map(note => '<span class="set-detail">' + escape(note) + '</span>').join('');
    }
    function renderSet(set, index) {
      const label = isWarmup(set) ? '热身' : (set.setType || '正式');
      let row = '<tr class="' + (set.done ? '' : 'set-incomplete') + '"><td>' + (index + 1) +
        '<span class="set-detail">' + escape(label) + '</span></td><td>' + weightText(set) + '</td><td>' +
        (hasValue(set.reps) ? escape(set.reps) + ' 次' : '未记录') + '</td><td>' + (set.done ? '已完成' : '未完成') + setNotes(set) + '</td></tr>';
      (set.dropSets || []).forEach((child, childIndex) => {
        row += '<tr class="set-drop"><td>↳ 递减 ' + (childIndex + 1) + '</td><td>' + weightText(child) + '</td><td>' +
          (hasValue(child.reps) ? escape(child.reps) + ' 次' : '未记录') + '</td><td>随原组记录<span class="set-detail">无独立完成标记，不另计组数</span>' + setNotes(child) + '</td></tr>';
      });
      return row;
    }
    function populateSession(details) {
      const body = details.querySelector('.session-body');
      if (body.dataset.rendered) return;
      const session = sourceSessions[Number(details.dataset.sessionIndex)];
      body.innerHTML = '<p class="session-note">原记录时长：' + escape(session.durationMinutes) + ' 分钟。' +
        (completedCount(session) === 0 ? '这条记录中没有标记为已完成的组。' : '') + '</p>' +
        session.movements.map(movement => '<section class="session-movement"><h3>' + movementButton(movement.name) +
          '</h3>' + (movement.singleSide ? '<p class="session-movement-note">单侧动作记录；负重按原值保留。</p>' : '') +
          (movement.note ? '<p class="session-movement-note">' + escape(movement.note) + '</p>' : '') +
          '<table><thead><tr><th scope="col">组别</th><th scope="col">负重</th><th scope="col">次数</th><th scope="col">完成与备注</th></tr></thead><tbody>' +
          movement.sets.map(renderSet).join('') + '</tbody></table></section>').join('');
      body.dataset.rendered = 'true';
    }
    function renderLogs() {
      const selected = sessions.filter(session => monthSelect.value === 'all' || session.date.startsWith(monthSelect.value));
      document.getElementById('log-result-count').textContent = selected.length + ' 条训练记录 · ' + new Set(selected.map(session => session.date)).size + ' 个有记录日期';
      logList.innerHTML = selected.length ? selected.map((session, index) => {
        const count = completedCount(session);
        return '<details class="session-card" data-session-index="' + session.sourceIndex + '"' + (index === 0 ? ' open' : '') + '><summary><time datetime="' +
          session.date + '">' + session.date + '</time><span><strong>' + escape(session.title || '训练记录') + '</strong><small>' +
          session.movements.length + ' 个动作 · ' + count + ' 个已完成组（含热身）' + (count === 0 ? ' · 未完成记录' : '') +
          '</small></span></summary><div class="session-body"></div></details>';
      }).join('') : '<p class="fitness-no-results">该月导出范围内没有训练记录，不能据此判断当天是否训练。</p>';
      logList.querySelectorAll('details').forEach(details => {
        details.addEventListener('toggle', () => { if (details.open) populateSession(details); });
        if (details.open) populateSession(details);
      });
    }
    monthSelect.addEventListener('change', renderLogs);
    renderLogs();
  }
})();
