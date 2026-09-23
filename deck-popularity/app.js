(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const E = window.DeckPopularity;
  const banks = { presence: window.DECK_POPULARITY_DATA, full: window.DECK_POPULARITY_FULL_DATA };
  let mode = 'presence', data = banks.presence;
  let catalog, state;
  const letterFor = E.optionLabel;
  const questionClass = q => q.classId ? E.CLASSES[q.classId] : '跨职业';
  const number = value => value.toLocaleString('zh-CN');
  const countText = combo => combo.capped ? '1000+' : number(combo.count);
  const scoreKey = classId => mode === 'full' ? 'wb-full-playset-v1-best' : `wb-reasonableness-v2-best-${classId}`;
  const el = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  function bestScore(classId) {
    try { return Math.max(0, Number(localStorage.getItem(scoreKey(classId))) || 0); }
    catch { return 0; }
  }
  function saveBest() {
    const best = Math.max(state.score, bestScore(state.classId));
    try { localStorage.setItem(scoreKey(state.classId), String(best)); } catch { /* file:// or private mode */ }
    return best;
  }
  function showError(error) { $('error').textContent = error.message || String(error); $('error').hidden = false; }
  function clearError() { $('error').hidden = true; }
  function fullName(combo) {
    return combo.cards.map(id => data.cards[id].name + (mode === 'full' ? ' ×3' : '')).join(' ＋ ');
  }
  function exampleLinks(combo) {
    const section = el('div', 'deck-examples');
    if (!combo.count) {
      section.append(el('span', 'muted', '暂无卡组（记录为 0 套）'));
      return section;
    }
    section.append(el('span', 'muted', '卡组示例：'));
    const links = el('div', 'deck-example-links');
    (combo.examples || []).slice(0, 3).forEach((ref, index) => {
      if (!/^1:\d+:\d+$/.test(ref)) return;
      const [format, userId, deckId] = ref.split(':');
      const link = el('a', '', `卡组 ${index + 1}`);
      link.href = `https://shadowverse-wb.com/chs/deck/detail/?battle_format=${format}&deck_id=${deckId}&user_id=${userId}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', `${fullName(combo)}：查看卡组 ${index + 1}（新标签页）`);
      links.append(link);
    });
    if (!links.childElementCount) links.append(el('span', 'muted', '暂无已收录示例'));
    section.append(links);
    return section;
  }
  function updateBestIntro() {
    $('best-intro').textContent = `本机最高分：${bestScore(0)} 分`;
  }
  function showCard(id) {
    const card = data.cards[id];
    $('dialog-title').textContent = `${card.name} · ${card.cost} 费`;
    $('dialog-image').src = `deck-popularity/${card.image}`;
    $('dialog-image').alt = card.name;
    $('dialog-text').textContent = card.text;
    $('card-dialog').showModal();
  }
  function renderScore() {
    $('score').textContent = state.score;
    $('best').textContent = Math.max(state.score, bestScore(state.classId));
    $('lives').replaceChildren();
    for (let i = 0; i < E.INITIAL_LIVES; i++) $('lives').append(el('span', i < state.lives ? '' : 'lost', '♥'));
    $('lives').setAttribute('aria-label', `剩余 ${state.lives} 血`);
  }
  function renderQuestion() {
    const q = state.question;
    renderScore();
    $('round-title').textContent = `第 ${state.round} 轮${q.classId ? ' · ' + E.CLASSES[q.classId] : ''}`;
    $('round-hint').textContent = '哪组出现在最多有记录的指定卡组中？' + (mode === 'full' ? '每种卡均需 3 张。' : '') + '点卡图可放大。';
    $('options').classList.toggle('many', q.options.length >= 3);
    $('options').replaceChildren();
    q.options.forEach((combo, index) => {
      const option = el('article', 'option');
      option.dataset.comboId = combo.id;
      const heading = el('div', 'option-head');
      heading.append(el('span', 'option-label', `组合 ${letterFor(index)}${q.classId ? '' : ' · ' + E.CLASSES[combo.classId]}`), el('span', 'answer-count', '？套'));
      const row = el('div', 'card-row');
      const quantities = Object.entries(E.requirements(combo.cards)).map(([id, qty]) => [id, qty * (mode === 'full' ? 3 : 1)]);
      row.style.setProperty('--cards', quantities.length);
      for (const [id, qty] of quantities) {
        const card = data.cards[id];
        const tile = el('div', 'card-tile');
        const zoom = el('button', 'card-image-button');
        zoom.type = 'button';
        zoom.setAttribute('aria-label', `查看${card.name}，此组合需要 ${qty} 张`);
        zoom.addEventListener('click', () => showCard(id));
        const image = el('img', 'card-image');
        image.src = `deck-popularity/${card.image}`;
        image.alt = card.name;
        image.decoding = 'async';
        image.addEventListener('error', () => { image.alt = `${card.name}（卡图未加载）`; });
        zoom.append(image);
        if (qty > 1) zoom.append(el('span', 'card-quantity', `×${qty}`));
        tile.append(zoom, el('p', 'card-name', card.name));
        row.append(tile);
      }
      const choose = el('button', 'choose', `选 ${letterFor(index)}`);
      choose.type = 'button';
      choose.setAttribute('aria-label', `选择组合 ${letterFor(index)}：${fullName(combo)}`);
      choose.addEventListener('click', () => submit(combo.id));
      const label = el('div', 'answer-label');
      label.hidden = true;
      option.append(heading, row, choose, label);
      $('options').append(option);
    });
    $('feedback').hidden = true;
    $('round-title').focus({ preventScroll: true });
    $('game').scrollIntoView({ block: 'start' });
  }
  function submit(id) {
    const result = E.answer(state, id);
    if (!result) return;
    saveBest();
    renderScore();
    const q = state.question;
    [...$('options').children].forEach((option, index) => {
      const combo = q.options[index];
      const winner = combo.id === q.winnerId;
      const chosen = combo.id === id;
      option.classList.toggle('correct', winner);
      option.classList.toggle('wrong', chosen && !winner);
      option.querySelector('.answer-count').textContent = E.showCount(q, combo) ? `${countText(combo)} 套` : '？套';
      const button = option.querySelector('.choose');
      button.disabled = true;
      button.textContent = chosen ? `已选 ${letterFor(index)}` : `组合 ${letterFor(index)}`;
      const label = option.querySelector('.answer-label');
      label.hidden = false;
      label.textContent = winner ? (chosen ? '✓ 选对了 · 数量最多' : '✓ 正确答案 · 数量最多') : chosen ? '✕ 选错了 · 扣 1 血' : '';
      option.append(exampleLinks(combo));
    });
    const winner = q.options.find(c => c.id === q.winnerId);
    const letter = letterFor(q.options.indexOf(winner));
    $('feedback-title').textContent = result.correct ? '答对了！+1 分' : `答错了，−1 血${result.over ? '。本局结束' : ''}`;
    let explanation = `组合 ${letter} 最多，共 ${countText(winner)} 套。`;
    if (winner.capped) explanation += '其他选项均有精确数量且不超过 1000，因此仍能确定答案。';
    else if (!q.extremesOnly) {
      const runner = Math.max(...q.options.filter(c => c.id !== winner.id).map(c => c.count));
      explanation += `比第二名多 ${number(winner.count - runner)} 套。`;
    }
    if (q.extremesOnly) explanation += ' 本阶段仅显示最大和最小数量，其余保留「？」。';
    if (!result.correct && !result.over) explanation += ' 本轮重新出题，分数和轮次不变。';
    $('feedback-text').textContent = explanation;
    $('next').textContent = result.over ? '查看结算' : result.correct ? '下一轮' : '重新挑战本轮';
    $('feedback').hidden = false;
    $('next').focus({ preventScroll: true });
  }
  function start() {
    if (!catalog) return;
    clearError();
    state = E.newGame();
    try { E.nextQuestion(state, catalog); }
    catch (error) { showError(error); return; }
    $('intro').hidden = true;
    $('summary').hidden = true;
    $('game').hidden = false;
    renderQuestion();
  }
  function summary(exhausted = false) {
    state.over = true;
    $('game').hidden = true;
    $('summary').hidden = false;
    $('summary-title').textContent = exhausted ? '本轮题库已完成' : '挑战结束';
    $('final-score').textContent = state.score;
    $('summary-text').textContent = `通过 ${state.score} 轮，共作答 ${state.history.length} 次。本机最高 ${saveBest()} 分。`;
    $('history').open = false;
    $('history-list').replaceChildren();
    for (const item of state.history) {
      const entry = el('div', 'history-item');
      entry.append(el('b', item.correct ? '' : 'history-wrong', `第 ${item.round} 轮 · ${questionClass(item.question)} · ${item.correct ? '答对' : '答错'}`));
      item.question.options.forEach((combo, index) => {
        const mark = combo.id === item.question.winnerId ? ' ✓ 最多' : '';
        const chosen = combo.id === item.selectedId ? '（你的选择）' : '';
        entry.append(el('p', '', `${letterFor(index)}. ${E.CLASSES[combo.classId]} · ${fullName(combo)}：${countText(combo)} 套${mark}${chosen}`));
        entry.append(exampleLinks(combo));
      });
      $('history-list').append(entry);
    }
    $('restart').focus({ preventScroll: true });
    $('summary').scrollIntoView({ block: 'start' });
  }
  $('start').addEventListener('click', start);
  $('restart').addEventListener('click', start);
  $('home').addEventListener('click', () => {
    $('summary').hidden = true;
    $('intro').hidden = false;
    clearError();
    updateBestIntro();
    $('start').focus();
  });
  $('next').addEventListener('click', () => {
    if (!state?.answered) return;
    if (state.over) { summary(); return; }
    try { if (E.nextQuestion(state, catalog)) renderQuestion(); }
    catch (error) { summary(true); showError(error); }
  });
  $('close-card').addEventListener('click', () => $('card-dialog').close());
  $('card-dialog').addEventListener('click', event => { if (event.target === $('card-dialog')) { const r = event.target.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) event.target.close(); } });
  document.addEventListener('keydown', event => {
    if (event.repeat || $('card-dialog').open || $('game').hidden || /^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName)) return;
    if (/^[1-9]$/.test(event.key) && !state.answered) {
      const option = state.question.options[Number(event.key) - 1];
      if (option) { event.preventDefault(); submit(option.id); }
    }
  });
  function selectMode() {
   mode = $('mode-select').value === 'full' ? 'full' : 'presence';
   data = banks[mode]; catalog = null;
   clearError();
   $('start').disabled = true;
   $('mode-status').hidden = true;
   $('mode-description').textContent = mode === 'full' ? '满编模式：每种卡都要带满 3 张，题库与最高分单独统计。' : '普通模式：每种卡至少携带 1 张。';
   $('copy-rule').textContent = mode === 'full' ? '满编模式按实际卡组张数统计：组合中的每一种卡都至少携带 3 张。' : '普通模式每种卡只要求至少携带 1 张。';
   updateBestIntro();
   if (!data) {
     $('start').textContent = '满编题库未就绪';
     $('mode-status').textContent = '请双击网页同目录的 fetch-full-playset.bat 自动采集满编题库，完成后刷新本页。';
     $('mode-status').hidden = false;
     $('bank-summary').textContent = '满编题库尚未生成。';
     $('data-description').textContent = '采集程序会完整核对卡组中每种卡的张数，生成独立的本地满编题库。';
     return;
   }
   try {
    if (!E) throw Error('游戏脚本未能加载，请保留 deck-popularity 文件夹。');
    if (mode === 'full' && (data.mode !== 'full' || data.copiesPerCard !== 3)) throw Error('满编题库格式不正确，请重新运行采集 BAT。');
    catalog = E.buildCatalog(data);
    if (catalog.stages.some(stage => !stage.length)) throw Error('题库不完整，暂时无法开始游戏。');
    const dates = data.combos.map(c => c.queriedAt).sort();
    const startDate = dates[0].slice(0, 10);
    const endDate = dates.at(-1).slice(0, 10);
    const maxCards = Math.max(...E.LEVELS.map(level => level.maxCards));
    const playable = [...catalog.groups.values()].flat().filter(combo => combo.cards.length <= maxCards).length;
    $('bank-summary').textContent = playable === catalog.total
      ? `本地题库：${number(playable)} 个可用组合，每轮随机配成题目。`
      : `当前规则可用 ${number(playable)} 个组合，本地共收录 ${number(catalog.total)} 个组合；每轮随机配成题目。`;
    $('data-description').textContent = `数据快照：${startDate}${startDate !== endDate ? ' 至 ' + endDate : ''}（UTC）。已收录 ${number(catalog.total)} 个组合、${number(Object.keys(data.cards).length)} 张卡牌；当前只使用最多 ${maxCards} 张不同卡的组合。这是组合数量，不是固定题目数量；每轮会重新搭配选项，卡图也保存在本地。`;
    $('start').disabled = false;
    $('start').textContent = '开始游戏';
    updateBestIntro();
   } catch (error) { $('start').textContent = '题库未就绪'; catalog = null; showError(error); }
  }
  $('mode-select').addEventListener('change', selectMode);
  selectMode();
})();
