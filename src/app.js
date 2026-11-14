import { CARDS, EXAMPLES, drawCards, validateIdea, generatePlan, toMarkdown, toPrompt, normalizeHistory } from './engine.js';

const $ = selector => document.querySelector(selector);
const STORE_KEY = 'dsh-idea-mutator:v1';
let storageAvailable = true;
let stored = {};
try { stored = JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}; } catch { storageAvailable = false; }
const state = {
  history: normalizeHistory(stored.history),
  idea: typeof stored.idea === 'string' ? stored.idea.slice(0, 1600) : '',
  currentId: typeof stored.currentId === 'string' ? stored.currentId : null,
  selected: drawCards(3), locked: [], count: 3,
  total: Number.isSafeInteger(stored.total) && stored.total >= 0 ? stored.total : 0,
  view: 'lab', filter: 'saved', busy: false, embedded: false,
};
let toastTimer;
let saveTimer;
let bridgeTimer;
let requestId = null;
function notify(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3200);
}
function persist() {
  clearTimeout(saveTimer);
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ history: state.history, idea: state.idea, currentId: state.currentId, total: state.total }));
    storageAvailable = true;
  } catch {
    if (storageAvailable) notify('本地保存失败，请先导出方案，避免关闭后丢失。');
    storageAvailable = false;
  }
  $('#autosave').textContent = storageAvailable ? '修改自动保存在当前浏览器' : '本地保存不可用，请复制或导出方案';
}
function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(persist, 250); }
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function currentPlan() { return state.history.find(plan => plan.id === state.currentId); }
function updateCounts() {
  const saved = state.history.filter(plan => plan.saved).length;
  $('#saved-count').textContent = saved;
  $('#collection-count').textContent = saved;
  $('#history-count').textContent = state.history.length;
  $('#mutation-count').textContent = state.total;
}
function updateIdea(value) {
  state.idea = value;
  $('#idea').value = value;
  $('#char-count').textContent = value.length;
  $('#input-error').hidden = true;
  $('#idea').removeAttribute('aria-invalid');
  scheduleSave();
}
function animateCards() {
  const container = $('#cards');
  container.classList.remove('drawing');
  void container.offsetWidth;
  container.classList.add('drawing');
}
function renderCards() {
  $('#cards').replaceChildren();
  state.selected.forEach(id => {
    const card = CARDS.find(item => item.id === id);
    const locked = state.locked.includes(id);
    const button = element('button', `mutation-card ${card.color}${locked ? ' locked' : ''}`);
    button.setAttribute('aria-pressed', String(locked));
    button.setAttribute('aria-label', `${card.name}，${card.desc}，${locked ? '已锁定，点击解锁' : '点击锁定'}`);
    button.append(element('span', 'card-en', card.en), element('span', `card-mark${card.mark.length > 2 ? ' small-mark' : ''}`, card.mark), element('span', 'card-name', card.name), element('span', 'card-desc', card.desc));
    const tag = element('span', 'card-tag');
    tag.append(element('span', '', card.tag), element('span', 'card-lock', locked ? '已锁定' : '＋'));
    button.append(tag);
    button.addEventListener('click', () => {
      state.locked = locked ? state.locked.filter(key => key !== id) : [...state.locked, id];
      renderCards();
      notify(locked ? `已解锁「${card.name}」` : `已锁定「${card.name}」，换牌时会保留`);
    });
    $('#cards').append(button);
  });
  $('#card-count').textContent = `${state.count} 张配方${state.locked.length ? ` · ${state.locked.length} 张锁定` : ''}`;
  renderDeck();
}
function renderDeck() {
  $('#deck').replaceChildren();
  CARDS.forEach(card => {
    const chosen = state.selected.includes(card.id);
    const button = element('button', `deck-choice ${card.color}`, `${card.mark} ${card.name}`);
    button.setAttribute('aria-pressed', String(chosen));
    button.title = card.desc;
    button.addEventListener('click', () => {
      if (chosen) {
        if (state.selected.length === 1) return notify('至少留一张卡，让想法有个变异方向。');
        state.selected = state.selected.filter(id => id !== card.id);
        state.locked = state.locked.filter(id => id !== card.id);
      } else {
        if (state.selected.length >= 3) return notify('一次最多组合 3 张卡，先取消一张再选。');
        state.selected.push(card.id);
        state.locked.push(card.id);
      }
      state.count = state.selected.length;
      updateStrength();
      renderCards();
    });
    $('#deck').append(button);
  });
}
function updateStrength() {
  document.querySelectorAll('[data-count]').forEach(button => {
    const active = Number(button.dataset.count) === state.count;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  $('#strength-description').textContent = ['沿着一条新思路，轻轻推开一点。', '让两种不同的思路，交叉生长。', '三种思路碰撞，看看会发生什么。'][state.count - 1];
}
function recipeNodes(plan) {
  const nodes = [];
  plan.cardIds.forEach((id, index) => {
    const card = CARDS.find(item => item.id === id);
    if (index) nodes.push(element('span', '', '×'));
    nodes.push(element('span', `recipe-chip ${card.color}`, `${card.mark} ${card.name}`));
  });
  return nodes;
}
function resizeEditor(node) {
  node.style.height = 'auto';
  node.style.height = `${node.scrollHeight + 2}px`;
}
function updateSaveButton() {
  const saved = currentPlan()?.saved === true;
  $('#save').textContent = saved ? '★ 已收藏' : '☆ 收藏方案';
  $('#save').setAttribute('aria-pressed', String(saved));
}
function renderResult(scroll = false) {
  const plan = currentPlan();
  $('#result').hidden = !plan;
  if (!plan) return;
  $('#result-title').value = plan.title;
  $('#result-recipe').replaceChildren(...recipeNodes(plan));
  $('#result-fields').replaceChildren();
  plan.sections.forEach((section, index) => {
    const wrap = element('div', 'result-field');
    const label = element('label', 'field-label', section.label);
    label.htmlFor = `section-${index}`;
    const textarea = element('textarea', 'field-text');
    textarea.id = `section-${index}`;
    textarea.maxLength = 10000;
    textarea.value = section.value;
    textarea.addEventListener('input', () => { section.value = textarea.value; resizeEditor(textarea); scheduleSave(); });
    wrap.append(label, textarea);
    $('#result-fields').append(wrap);
    resizeEditor(textarea);
  });
  updateSaveButton();
  if (scroll) $('#result').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
}
function setView(view) {
  persist();
  state.view = view;
  $('#lab-view').hidden = view !== 'lab';
  $('#collection-view').hidden = view !== 'collection';
  $('#page-label').textContent = view === 'lab' ? '变异实验室' : '灵感收藏夹';
  document.querySelectorAll('[data-view]').forEach(button => {
    const active = button.dataset.view === view;
    button.classList.toggle('active', active);
    button.setAttribute('aria-current', active ? 'page' : 'false');
  });
  if (view === 'collection') renderHistory();
  if (view === 'lab') document.querySelectorAll('.field-text').forEach(resizeEditor);
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function renderHistory() {
  const list = $('#history-list');
  list.replaceChildren();
  const records = state.history.filter(plan => state.filter === 'all' || plan.saved);
  if (!records.length) {
    const empty = element('div', 'empty-state');
    empty.append(element('div', 'empty-mark', '✳'), element('h2', '', state.filter === 'saved' ? '还没有留下来的意外' : '实验室正在等第一个想法'), element('p', '', '从一个小念头开始，喜欢的方案随时可以收藏。'));
    const button = element('button', 'dark-button', '去做一次实验 ↗');
    button.addEventListener('click', () => { setView('lab'); $('#idea').focus(); });
    empty.append(button);
    list.append(empty);
    return;
  }
  records.forEach(plan => {
    const card = element('article', 'history-card');
    const recipe = element('div', 'result-recipe');
    recipe.append(...recipeNodes(plan));
    card.append(recipe, element('h2', '', plan.title || '未命名实验'), element('p', '', plan.idea));
    const bottom = element('div', 'history-bottom');
    bottom.append(element('span', 'history-date', new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(plan.createdAt)));
    const remove = element('button', 'history-delete', '删除');
    remove.setAttribute('aria-label', `删除实验：${plan.title}`);
    remove.addEventListener('click', () => {
      state.history = state.history.filter(item => item.id !== plan.id);
      if (state.currentId === plan.id) { state.currentId = null; renderResult(); }
      persist(); updateCounts(); renderHistory();
      notify('已删除这次实验');
    });
    const save = element('button', 'secondary', plan.saved ? '★ 已收藏' : '☆ 收藏');
    save.setAttribute('aria-pressed', String(plan.saved));
    save.addEventListener('click', () => { plan.saved = !plan.saved; persist(); updateCounts(); updateSaveButton(); renderHistory(); });
    const open = element('button', 'dark-button', '继续编辑 ↗');
    open.addEventListener('click', () => {
      state.currentId = plan.id;
      updateIdea(plan.idea);
      state.selected = [...plan.cardIds]; state.count = plan.cardIds.length; state.locked = [];
      setView('lab'); renderCards(); updateStrength(); renderResult(true); persist();
    });
    bottom.append(remove, save, open);
    card.append(bottom);
    list.append(card);
  });
}
async function mutate() {
  if (state.busy) return;
  let idea;
  try { idea = validateIdea(state.idea); } catch (error) {
    $('#input-error').textContent = error.message;
    $('#input-error').hidden = false;
    $('#idea').setAttribute('aria-invalid', 'true');
    $('#idea').focus();
    return;
  }
  if (state.history.length >= 60 && state.history.every(plan => plan.saved)) return notify('60 个位置都已收藏。请先导出并移除一份，再做新实验。');
  const selected = [...state.selected];
  state.busy = true;
  $('#mutate').disabled = true;
  $('#mutate-label').textContent = '让思路碰撞一下…';
  $('#mutate').classList.add('processing');
  animateCards();
  try {
    await new Promise(resolve => setTimeout(resolve, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 550));
    const plan = generatePlan(idea, selected, { variant: state.total });
    if (state.history.length >= 60) {
      const evict = state.history.findLastIndex(item => !item.saved);
      state.history.splice(evict, 1);
    }
    state.history.unshift(plan); state.currentId = plan.id; state.total++;
    persist(); updateCounts(); renderResult(true);
    notify('新可能已就位，点进文字就能继续改。');
  } catch (error) { notify(error.message || '这次变异没有完成，请再试一次。'); }
  finally { state.busy = false; $('#mutate').disabled = false; $('#mutate-label').textContent = '再变异一次'; $('#mutate').classList.remove('processing'); }
}
async function copyText(text, message) {
  try { await navigator.clipboard.writeText(text); notify(message); }
  catch {
    $('#copy-fallback').value = text;
    $('#copy-dialog').showModal();
    $('#copy-fallback').focus(); $('#copy-fallback').select();
  }
}
function exportPlan(plan) {
  const url = URL.createObjectURL(new Blob([toMarkdown(plan)], { type: 'text/markdown;charset=utf-8' }));
  const link = element('a');
  link.href = url;
  link.download = `${(plan.title || '灵感变异方案').replace(/[<>:"/\\|?*\x00-\x1f]/g, '').slice(0, 70)}.md`;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify('方案已导出为 Markdown');
}

$('#idea').value = state.idea;
$('#char-count').textContent = state.idea.length;
EXAMPLES.forEach(example => {
  const button = element('button', 'example', example.label);
  button.addEventListener('click', () => { updateIdea(example.text); $('#idea').focus(); });
  $('#examples').append(button);
});
$('#idea').addEventListener('input', event => updateIdea(event.target.value));
$('#mutate').addEventListener('click', mutate);
$('#shuffle').addEventListener('click', () => {
  if (state.locked.length >= state.count) return notify('这手牌都锁住了，先解锁一张再换。');
  const previous = state.selected.join(',');
  for (let attempt = 0; attempt < 12; attempt++) {
    state.selected = drawCards(state.count, state.locked);
    if (state.selected.join(',') !== previous) break;
  }
  renderCards(); animateCards();
});
$('#deck-toggle').addEventListener('click', () => {
  const expanded = $('#deck-toggle').getAttribute('aria-expanded') !== 'true';
  $('#deck-toggle').setAttribute('aria-expanded', String(expanded));
  $('#deck-toggle').lastElementChild.textContent = expanded ? '−' : '＋';
  $('#deck').hidden = !expanded;
});
document.querySelectorAll('[data-count]').forEach(button => button.addEventListener('click', () => {
  state.count = Number(button.dataset.count);
  state.locked = state.locked.slice(0, state.count);
  state.selected = drawCards(state.count, state.locked);
  updateStrength(); renderCards(); animateCards();
}));
document.querySelectorAll('[data-view]').forEach(button => {
  button.setAttribute('aria-label', button.dataset.view === 'lab' ? '变异实验室' : '灵感收藏夹');
  button.addEventListener('click', () => setView(button.dataset.view));
});
$('.brand').addEventListener('click', event => { event.preventDefault(); setView('lab'); });
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  state.filter = button.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
  renderHistory();
}));
$('#result-title').addEventListener('input', event => { const plan = currentPlan(); if (plan) { plan.title = event.target.value; scheduleSave(); } });
$('#save').addEventListener('click', () => { const plan = currentPlan(); if (plan) { plan.saved = !plan.saved; persist(); updateCounts(); updateSaveButton(); notify(plan.saved ? '这个可能，已经替你留下了。' : '已取消收藏，实验记录仍在。'); } });
$('#copy').addEventListener('click', () => { const plan = currentPlan(); if (plan) void copyText(toMarkdown(plan), '方案已复制，随时继续生长。'); });
$('#export').addEventListener('click', () => { const plan = currentPlan(); if (plan) exportPlan(plan); });
$('#deepen').addEventListener('click', () => {
  const plan = currentPlan(); if (!plan) return;
  const prompt = toPrompt(plan);
  if (!state.embedded) { void copyText(prompt, '深化提示词已复制，粘贴到 DSH 就能继续。'); return; }
  if (requestId) return;
  requestId = crypto.randomUUID();
  $('#deepen').disabled = true;
  window.parent.postMessage({ source: 'idea-mutator', type: 'insert-prompt', id: requestId, text: prompt }, '*');
  bridgeTimer = setTimeout(() => {
    requestId = null; $('#deepen').disabled = false;
    notify('DSH 没有响应，已保留方案。请使用复制方案按钮。');
  }, 4000);
});
window.addEventListener('message', event => {
  if (event.source !== window.parent || window.parent === window || event.data?.source !== 'idea-mutator-host') return;
  if (event.data.type === 'init') {
    state.embedded = event.data.canInsert === true;
    $('#environment').textContent = 'DSH 插件模式';
    $('#deepen').textContent = state.embedded ? '交给 DSH 深化 ↗' : '复制 DSH 深化提示词 ↗';
  }
  if (event.data.type === 'insert-result' && requestId && event.data.id === requestId) {
    clearTimeout(bridgeTimer); requestId = null; $('#deepen').disabled = false;
    notify(event.data.ok ? '提示词已放进 DSH 草稿，检查后发送即可。' : '当前草稿已变化或不可编辑。请复制方案后粘贴到 DSH。');
  }
});
if (window.parent !== window) window.parent.postMessage({ source: 'idea-mutator', type: 'ready' }, '*');

const dropzone = $('#dropzone');
let dragDepth = 0;
dropzone.addEventListener('dragenter', event => { event.preventDefault(); dragDepth++; dropzone.classList.add('dragging'); });
dropzone.addEventListener('dragover', event => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; });
dropzone.addEventListener('dragleave', () => { dragDepth--; if (dragDepth <= 0) dropzone.classList.remove('dragging'); });
dropzone.addEventListener('drop', async event => {
  event.preventDefault(); dragDepth = 0; dropzone.classList.remove('dragging');
  try {
    let text;
    if (event.dataTransfer.files.length) {
      if (event.dataTransfer.files.length > 1) throw new Error('一次先放进一个文件，让想法保持专注。');
      const file = event.dataTransfer.files[0];
      if (!/\.(txt|md|markdown)$/i.test(file.name)) throw new Error('请拖入 .txt 或 .md 文字文件。');
      if (file.size > 32768) throw new Error('文件太大了，请先提炼成 1600 字以内的想法。');
      text = await file.text();
    } else text = event.dataTransfer.getData('text/plain');
    updateIdea(validateIdea(text));
    notify('想法已放入实验室');
  } catch (error) { notify(error.message || '文件没有读进来，请再试一次。'); }
});
document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && !event.isComposing && state.view === 'lab' && !$('#copy-dialog').open) { event.preventDefault(); void mutate(); }
});
window.addEventListener('pagehide', persist);
document.addEventListener('visibilitychange', () => { if (document.hidden) persist(); });
renderCards(); updateCounts(); renderResult();
if (!storageAvailable) $('#autosave').textContent = '本地保存不可用，请复制或导出方案';
