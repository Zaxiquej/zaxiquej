(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DeckPopularity = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const CLASSES = ['', '精灵', '皇家护卫', '巫师', '龙族', '梦魇', '主教', '复仇者'];
  const INITIAL_LIVES = 5;
  const MIN_DIFFERENCE = 50;
  const MIN_COMMON_COUNT = 40;
  const commonCountForScore = score => Math.max(MIN_COMMON_COUNT, 100 - Math.floor(Math.max(0, score) / 5) * 10);
  // Rarity describes distractors; it must not also pull the winning count down.
  const winnerMinimumForScore = score => score < 8 ? 500 : score < 12 ? 400 : score < 18 ? 300 : score < 30 ? 250 : score < 50 ? 200 : score < 70 ? 150 : 100;
  // Increase either the number of options or the length cap, never both at once.
  const LEVELS = [
    { from: 0, options: 2, maxCards: 1, minRatio: 2.5, targetMin: 3, targetMax: 6, crossClass: false },
    { from: 4, options: 2, maxCards: 2, minRatio: 2, targetMin: 2.5, targetMax: 4.5, crossClass: false },
    { from: 8, options: 3, maxCards: 2, minRatio: 1.6, targetMin: 2, targetMax: 3.5, crossClass: false },
    { from: 12, options: 3, maxCards: 2, minRatio: 1.4, targetMin: 1.6, targetMax: 2.8, crossClass: true },
    { from: 18, options: 3, maxCards: 3, minRatio: 4 / 3, targetMin: 1.4, targetMax: 2, crossClass: true },
    { from: 24, options: 3, maxCards: 3, minRatio: 1.25, targetMin: 1.3, targetMax: 1.9, crossClass: true },
    { from: 30, options: 4, maxCards: 3, minRatio: 1.25, targetMin: 1.25, targetMax: 1.8, crossClass: true }
  ];
  const requirements = cards => cards.reduce((result, id) => { result[id] = (result[id] || 0) + 1; return result; }, {});
  const contains = (deck, cards) => Object.entries(requirements(cards)).every(([id, count]) => (deck[id] || 0) >= count);
  const legalClassCombination = (cards, classId, cardData) => Number.isInteger(classId) && classId >= 1 && classId <= 7
    && cards.some(id => cardData[id]?.classId === classId)
    && cards.every(id => cardData[id]?.classId === classId || cardData[id]?.classId === 0);
  const levelForScore = score => LEVELS.reduce((current, level, index) => score >= level.from ? index : current, 0);
  const difficultyForScore = score => ({ ...LEVELS[levelForScore(score)], commonCount: commonCountForScore(score), winnerMinimum: winnerMinimumForScore(score), extremesOnly: score >= 24, ...(score >= 30 ? { options: 4 + Math.floor((score - 30) / 10), targetMax: score >= 50 ? 1.5 : score >= 40 ? 1.65 : 1.8 } : {}) });
  // Sorted anonymous totals give clues without identifying which option wins.
  const countHints = question => [...question.options]
    .sort((a, b) => (b.capped ? 1001 : b.count) - (a.capped ? 1001 : a.count))
    .map((combo, index, sorted) => question.extremesOnly && index > 0 && index < sorted.length - 1 ? null : { count: combo.count, capped: combo.capped });
  function optionLabel(index) {
    let label = '';
    for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) label = String.fromCharCode(65 + (n - 1) % 26) + label;
    return label;
  }
  // Entirely different cards make options identifiable and rule out subset giveaways.
  const distinct = (a, b) => !a.cards.some(id => b.cards.includes(id));
  function upperBound(sorted, count) {
    let lo = 0, hi = sorted.length;
    while (lo < hi) { const mid = (lo + hi) >>> 1; if (sorted[mid].count <= count) lo = mid + 1; else hi = mid; }
    return lo;
  }
  function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
    return result;
  }
  function buildCatalog(data) {
    if (!data || data.schemaVersion !== 1 || !Array.isArray(data.combos)) throw Error('题库没有正确加载。');
    if (data.mode === 'full' && data.copiesPerCard !== 3) throw Error('满编题库必须要求每种卡 3 张。');
    const groups = new Map();
    const unique = new Set();
    for (const combo of data.combos) {
      if (data.mode === 'full' && (combo.copies !== 3 || combo.capped)) continue;
      if (!Array.isArray(combo.cards) || combo.cards.length < 1 || combo.cards.length > 4 || new Set(combo.cards).size !== combo.cards.length) continue;
      if (!Number.isInteger(combo.count) || combo.count < 0 || typeof combo.capped !== 'boolean') continue;
      if (combo.capped && combo.count !== 1000) continue;
      if (!legalClassCombination(combo.cards, combo.classId, data.cards)) continue;
      const signature = `${combo.classId}:${[...combo.cards].sort((a, b) => a - b)}`;
      if (unique.has(signature)) continue;
      unique.add(signature);
      if (!groups.has(combo.classId)) groups.set(combo.classId, []);
      groups.get(combo.classId).push(combo);
    }
    const stages = LEVELS.map(level => {
      const templates = [];
      const globalCombos = [...groups.values()].flat().filter(c => c.cards.length <= level.maxCards);
      const makePool = combos => ({ positive: combos.filter(c => !c.capped && c.count > 0).sort((a, b) => a.count - b.count), zero: combos.filter(c => !c.capped && c.count === 0) });
      const globalPool = level.crossClass ? makePool(globalCombos) : null;
      for (const [classId, all] of groups) {
        const combos = all.filter(c => c.cards.length <= level.maxCards);
        // Share sorted pools across winners instead of storing a quadratic number of references.
        const pool = globalPool || makePool(combos);
        for (const winner of combos) {
          const top = winner.capped ? 1001 : winner.count;
          if (top < MIN_COMMON_COUNT) continue;
          const positiveEnd = upperBound(pool.positive, Math.min(top - MIN_DIFFERENCE, Math.floor(top / level.minRatio)));
          if (positiveEnd >= level.options - 2 && positiveEnd + Math.min(1, pool.zero.length) >= level.options - 1) templates.push({ classId, winner, pool, positiveEnd });
        }
      }
      return templates;
    });
    return { stages, groups, total: unique.size };
  }
  function pickDistractors(candidates, count, random, lengthCounts = null) {
    // Randomized bounded backtracking: all cards disjoint; at most one zero option.
    let budget = 400;
    function search(remaining, chosen) {
      if (chosen.length === count) return chosen;
      if (--budget <= 0 || remaining.length < count - chosen.length) return null;
      for (let i = 0; i < remaining.length && budget > 0; i++) {
        const c = remaining[i];
        if (lengthCounts && chosen.filter(x => x.cards.length === c.cards.length).length >= (lengthCounts[c.cards.length] || 0)) continue;
        if (c.count === 0 && chosen.some(x => x.count === 0)) continue;
        const compatible = remaining.slice(i + 1).filter(other => distinct(c, other));
        const result = search(compatible, [...chosen, c]);
        if (result) return result;
      }
      return null;
    }
    return search(shuffle(candidates, random), []);
  }
  function createQuestion(catalog, score, classId = 0, used = new Set(), recent = [], random = Math.random) {
    const stage = levelForScore(score);
    const level = difficultyForScore(score);
    const templates = catalog.stages[stage].filter(t => (level.crossClass || !classId || t.classId === classId) && (t.winner.capped || t.winner.count >= level.winnerMinimum) && t.positiveEnd + Math.min(1, t.pool.zero.length) >= level.options - 1);
    if (!templates.length) throw Error('这个职业当前可用题目不足，请切换为随机职业。');
    const classes = [...new Set(templates.map(t => t.classId))];
    // Choose a composition for the whole question, not independently per option.
    const oneDifferent = level.options >= 3 && random() < 0.25;
    const sameLength = !oneDifferent && (level.options >= 3 || level.maxCards === 1 || random() < 0.9);
    const lengthRoll = random();
    const preferredLength = level.maxCards === 1 ? 1 : score < 8 ? (lengthRoll < 0.7 ? 2 : 1)
      : level.maxCards === 2 ? (lengthRoll < 0.95 ? 2 : 1) : lengthRoll < 0.03 ? 1 : lengthRoll < 0.58 ? 2 : 3;
    const baseLength = Math.max(2, preferredLength);
    const alternateLengths = [baseLength - 1, baseLength + 1].filter(n => n >= 1 && n <= level.maxCards);
    const alternateLength = alternateLengths[Math.floor(random() * alternateLengths.length)];
    for (let attempt = 0; attempt < 1200; attempt++) {
      const chosenClass = classes[Math.floor(random() * classes.length)];
      let candidates = templates.filter(t => t.classId === chosenClass);
      const variantActive = oneDifferent && attempt < 900;
      const allowedLength = c => !variantActive || c.cards.length === baseLength || c.cards.length === alternateLength;
      if (variantActive) candidates = candidates.filter(t => allowedLength(t.winner));
      // If a requested length cannot form a fair question, try other multi-card
      // lengths before relaxing composition. Never relax count/fairness floors.
      const length = sameLength && attempt < 900 ? (attempt < 400 ? preferredLength : score >= 8 ? 2 + Math.floor(random() * (level.maxCards - 1)) : preferredLength) : 0;
      if (length) candidates = candidates.filter(t => t.winner.cards.length === length);
      if (!candidates.length) continue;
      const fresh = candidates.filter(t => !recent.includes(t.winner.id));
      if (fresh.length && attempt < 900) candidates = fresh;
      const exact = candidates.filter(t => !t.winner.capped);
      // A capped value cannot establish how close two real totals are.
      if (exact.length && ((level.crossClass && attempt < 900) || random() < 0.75)) candidates = exact;
      const template = candidates[Math.floor(random() * candidates.length)];
      const top = template.winner.capped ? 1001 : template.winner.count;
      const lower = template.pool.positive.slice(0, template.positiveEnd).filter(c => allowedLength(c) && (!length || c.cards.length === length) && distinct(template.winner, c));
      // Select the runner-up deliberately instead of letting numerous rare rows
      // dominate uniform sampling. Later rounds target narrower, still readable gaps.
      const common = lower.filter(c => c.count >= level.commonCount);
      const challengers = score >= 8 && common.length ? common : lower;
      const preferred = challengers.filter(c => top / c.count >= level.targetMin && top / c.count <= level.targetMax);
      if (!preferred.length && attempt < 300) continue;
      const choices = preferred.length ? preferred : challengers;
      if (!choices.length) continue;
      const challenger = choices[Math.floor(random() * choices.length)];
      const lengthCounts = variantActive ? { [baseLength]: level.options - 1, [alternateLength]: 1 } : null;
      if (lengthCounts) {
        lengthCounts[template.winner.cards.length]--;
        lengthCounts[challenger.cards.length]--;
        if (Object.values(lengthCounts).some(n => n < 0)) continue;
      }
      // A larger collection of verified zeros should not make every round a zero-count quiz.
      if (lower.length < level.options - 1 || random() < 0.25) lower.push(...template.pool.zero.filter(c => allowedLength(c) && (!length || c.cards.length === length) && distinct(template.winner, c)));
      const compatible = lower.filter(c => c.id !== challenger.id && c.count <= challenger.count && distinct(challenger, c));
      const preferCommon = score >= 8 && random() < 0.8;
      const others = (preferCommon ? pickDistractors(compatible.filter(c => c.count >= level.commonCount), level.options - 2, random, lengthCounts) : null)
        || pickDistractors(compatible, level.options - 2, random, lengthCounts);
      const remaining = others && [challenger, ...others];
      if (!remaining) continue;
      const options = shuffle([template.winner, ...remaining], random);
      // Most options keep the same size; just one differs by exactly one card.
      // Apply this to the whole question, allowing that option to win or lose.
      if (oneDifferent && attempt < 900 && (options.filter(c => c.cards.length === baseLength).length !== options.length - 1 || options.filter(c => c.cards.length === alternateLength).length !== 1)) continue;
      if (score >= 8 && length !== 1 && attempt < 1000 && options.filter(c => c.cards.length === 1).length >= options.length / 2) continue;
      const signature = options.map(c => c.id).sort().join('|');
      if (used.has(signature)) continue;
      return { stage, extremesOnly: level.extremesOnly, classId: options.every(c => c.classId === chosenClass) ? chosenClass : 0, options, winnerId: template.winner.id, signature };
    }
    throw Error('这一局已用完当前难度下差异足够明显的题目，可以结算后再开一局。');
  }
  function newGame(classId = 0) { return { classId, score: 0, lives: INITIAL_LIVES, round: 0, answered: false, over: false, selectedId: null, question: null, used: new Set(), recent: [], history: [] }; }
  function nextQuestion(state, catalog, random = Math.random) {
    if (state.over || (state.question && !state.answered)) return false;
    const question = createQuestion(catalog, state.score, state.classId, state.used, state.recent, random);
    const advance = !state.question || state.selectedId === state.question.winnerId;
    state.question = question;
    state.used.add(question.signature);
    state.recent.push(...question.options.map(c => c.id));
    state.recent = state.recent.slice(-30);
    if (advance) state.round++;
    state.answered = false;
    state.selectedId = null;
    return true;
  }
  function answer(state, id) {
    if (state.over || state.answered || !state.question?.options.some(c => c.id === id)) return null;
    const correct = id === state.question.winnerId;
    state.answered = true;
    state.selectedId = id;
    if (correct) state.score++;
    else state.lives--;
    state.over = state.lives === 0;
    state.history.push({ question: state.question, selectedId: id, correct, round: state.round });
    return { correct, over: state.over };
  }
  return { CLASSES, INITIAL_LIVES, MIN_DIFFERENCE, MIN_COMMON_COUNT, commonCountForScore, LEVELS, requirements, contains, legalClassCombination, distinct, levelForScore, difficultyForScore, countHints, optionLabel, shuffle, buildCatalog, createQuestion, newGame, nextQuestion, answer };
});
