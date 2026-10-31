(() => {
  'use strict';
  const storageKey = 'spike-diet-journal-v1';
  const form = document.querySelector('#diet-journal-form');
  if (!form) return;
  const list = document.querySelector('#diet-journal-list');
  const status = document.querySelector('#diet-journal-status');
  const saveButton = document.querySelector('#diet-save');
  const cancelButton = document.querySelector('#diet-cancel');
  const exportButton = document.querySelector('#diet-export');
  const fields = ['date', 'meal', 'time', 'food', 'portion', 'hunger', 'fullness', 'observation'];
  let entries = [];
  let storageReadable = true;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(saved) || saved.some(entry => !entry || typeof entry.id !== 'string' || fields.some(field => typeof entry[field] !== 'string'))) throw new Error('Invalid journal data');
    entries = saved;
  } catch {
    storageReadable = false;
    status.textContent = '已有日志暂时无法读取。为保护已有数据，已暂停保存；请保留当前浏览器数据。';
    saveButton.disabled = true;
  }
  function today() {
    const now = new Date();
    return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  }
  function resetForm() {
    form.reset();
    form.elements.entryId.value = '';
    form.elements.date.value = today();
    saveButton.textContent = '保存这一餐';
    cancelButton.hidden = true;
  }
  function persist(nextEntries) {
    if (!storageReadable) return false;
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextEntries));
      entries = nextEntries;
      return true;
    } catch {
      status.textContent = '保存失败：浏览器存储不可用或空间不足。表单内容仍保留，请复制备份后重试。';
      return false;
    }
  }
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function render() {
    list.replaceChildren();
    document.querySelector('#diet-journal-count').textContent = String(entries.length);
    exportButton.disabled = entries.length === 0;
    if (!entries.length) {
      list.append(element('p', storageReadable ? '还没有记录。从今天的一餐开始，实际保存后会显示在这里。' : '日志暂时无法读取；已有浏览器数据未被覆盖。', 'diet-journal-empty'));
      return;
    }
    [...entries].sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)).forEach(entry => {
      const article = element('article', '', 'diet-entry');
      const header = element('header');
      header.append(element('h4', `${entry.date} · ${entry.meal}${entry.time ? ' · ' + entry.time : ''}`));
      const controls = element('div', '', 'diet-entry-controls');
      for (const [action, label] of [['edit', '编辑'], ['delete', '删除']]) {
        const button = element('button', label);
        button.type = 'button';
        button.dataset.action = action;
        button.dataset.id = entry.id;
        button.setAttribute('aria-label', `${label} ${entry.date} ${entry.meal} 的记录`);
        controls.append(button);
      }
      header.append(controls);
      article.append(header, element('p', entry.food));
      const details = element('dl');
      for (const [field, label] of [['portion', '份量与做法'], ['hunger', '餐前饥饿'], ['fullness', '餐后饱腹'], ['observation', '观察与调整']]) {
        if (entry[field]) details.append(element('dt', label), element('dd', entry[field]));
      }
      if (details.children.length) article.append(details);
      list.append(article);
    });
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity() || !storageReadable) return;
    const entry = Object.fromEntries(fields.map(field => [field, form.elements[field].value.trim()]));
    if (!entry.food) {
      form.elements.food.setCustomValidity('请写下实际吃了什么。');
      form.elements.food.reportValidity();
      return;
    }
    const editingId = form.elements.entryId.value;
    entry.id = editingId || globalThis.crypto?.randomUUID?.() || String(Date.now()) + '-' + Math.random().toString(36).slice(2);
    const nextEntries = editingId ? entries.map(item => item.id === editingId ? entry : item) : [...entries, entry];
    if (persist(nextEntries)) {
      resetForm();
      render();
      status.textContent = editingId ? '这条记录已更新。' : '这一餐已保存在当前浏览器。';
    }
  });
  form.elements.food.addEventListener('input', () => form.elements.food.setCustomValidity(''));
  cancelButton.addEventListener('click', () => {
    resetForm();
    status.textContent = '已取消编辑，原记录未改动。';
  });
  list.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const entry = entries.find(item => item.id === button.dataset.id);
    if (!entry) return;
    if (button.dataset.action === 'edit') {
      fields.forEach(field => { form.elements[field].value = entry[field]; });
      form.elements.entryId.value = entry.id;
      saveButton.textContent = '保存修改';
      cancelButton.hidden = false;
      status.textContent = '正在编辑已有记录。';
      form.elements.food.focus();
      return;
    }
    if (confirm(`删除 ${entry.date} ${entry.meal} 的这条记录？`)) {
      if (persist(entries.filter(item => item.id !== entry.id))) {
        if (form.elements.entryId.value === entry.id) resetForm();
        render();
        status.textContent = '这条记录已删除。';
      }
    }
  });
  exportButton.addEventListener('click', () => {
    const data = {version: 1, exportedAt: new Date().toISOString(), entries};
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {type: 'application/json;charset=utf-8'}));
    const link = element('a');
    link.href = url;
    link.download = `饮食日志-${today()}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = '已生成 JSON 导出文件，请保管好下载的备份。';
  });
  resetForm();
  render();
})();
