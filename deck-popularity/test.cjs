const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const E = require('./engine');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8'), context);
const data = JSON.parse(JSON.stringify(context.window.DECK_POPULARITY_DATA));
const evidence = JSON.parse(fs.readFileSync(path.join(__dirname, 'evidence.json'), 'utf8'));
let seed = 19790715;
const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const catalog = E.buildCatalog(data);
assert.equal(catalog.total, data.combos.length, 'Every active combination must validate');
for (const c of data.combos) {
  assert(c.cards.length >= 1 && c.cards.length <= 3, 'Only currently playable one-, two- and three-card combinations are shipped');
  assert.equal(new Set(c.cards).size, c.cards.length, 'No duplicate copies in the active bank');
  assert(Array.isArray(c.examples), 'Example links are included in the offline snapshot');
  assert(c.examples.length <= Math.min(3, c.count));
  assert.equal(new Set(c.examples).size, c.examples.length, 'No repeated example deck');
  assert(c.examples.every(ref => /^1:\d+:\d+$/.test(ref)), 'Only designated-format deck references');
  assert(c.count === 0 || c.examples.length > 0, 'Every nonzero combination has a real example');
  assert(c.cards.every(id => data.cards[id]?.classId === c.classId));
  if (c.method === 'complete-subset') {
    const p = evidence[c.pool];
    assert(p && !c.capped);
    assert.equal(p.decks.length, p.count);
    assert(p.baseCards.every(id => c.cards.includes(id)), 'Base pool covers all matches of this stricter query');
    assert(p.decks.every(d => E.contains(d, p.baseCards)));
    assert.equal(p.decks.filter(d => E.contains(d, c.cards)).length, c.count, 'Recount every derived result, including zero');
  }
}
for (let i = 1; i < E.LEVELS.length; i++) {
  const a = E.LEVELS[i - 1], b = E.LEVELS[i];
  assert(!(b.options > a.options && b.maxCards > a.maxCards), 'Never increase option count and card limit together');
  assert(b.minRatio >= 1.25);
}
for (const [score, options, maxCards, crossClass] of [[0,2,1,false],[2,2,1,false],[3,2,2,false],[5,2,2,false],[6,3,2,false],[9,3,2,false],[10,3,2,true],[14,3,2,true],[15,3,3,true],[19,3,3,true],[20,4,3,true],[29,4,3,true],[30,5,3,true],[39,5,3,true],[40,6,3,true],[50,7,3,true],[100,12,3,true]]) {
  const d = E.difficultyForScore(score);
  assert.deepEqual([d.options, d.maxCards, d.crossClass], [options, maxCards, crossClass]);
}
assert.equal(E.optionLabel(5), 'F');
assert.equal(E.optionLabel(26), 'AA');
for (const [score, threshold] of [[0,100],[4,100],[5,90],[9,90],[10,80],[15,70],[20,60],[24,60],[25,50],[29,50],[30,40],[100,40],[1000,40]]) {
  assert.equal(E.difficultyForScore(score).commonCount, threshold, 'Rarity threshold gradually falls and stops at 40');
}
let generated = 0, capped = 0, zeros = 0, mixedLengths = 0, singles = 0, crossClassQuestions = 0;
function validateQuestion(q, score) {
  const level = E.difficultyForScore(score);
  assert.equal(q.options.length, level.options);
  assert.equal(new Set(q.options.map(c => c.id)).size, q.options.length);
  assert(q.options.every(c => (level.crossClass || c.classId === q.classId) && c.cards.length >= 1 && c.cards.length <= level.maxCards));
  if (!q.classId) { assert(level.crossClass); assert(new Set(q.options.map(c => c.classId)).size > 1); crossClassQuestions++; }
  const allCards = q.options.flatMap(c => c.cards);
  assert.equal(new Set(allCards).size, allCards.length, 'No repeated card within or between options');
  assert(q.options.filter(c => c.capped).length <= 1);
  assert(q.options.filter(c => c.count === 0).length <= 1);
  const winner = q.options.find(c => c.id === q.winnerId);
  assert(winner);
  const top = winner.capped ? 1001 : winner.count;
  assert(top >= level.commonCount, 'Never produce a question consisting entirely of rare combinations at the current threshold');
  for (const other of q.options.filter(c => c.id !== winner.id)) {
    assert(!other.capped);
    assert(top >= other.count * level.minRatio, 'Respect the relative gap for this stage');
    assert(top - other.count >= 50, 'Even late rounds need a substantial absolute gap');
  }
  if (winner.capped) capped++;
  if (q.options.some(c => c.count === 0)) zeros++;
  if (q.options.some(c => c.cards.length === 1)) singles++;
  if (new Set(q.options.map(c => c.cards.length)).size > 1) mixedLengths++;
  generated++;
}
for (let classId = 1; classId <= 7; classId++) {
  assert(data.combos.some(c => c.classId === classId && c.cards.length === 1), `Single-card coverage: ${classId}`);
  for (const level of E.LEVELS) {
    const used = new Set();
    for (let i = 0; i < 30; i++) {
      const q = E.createQuestion(catalog, level.from, classId, used, [], random);
      validateQuestion(q, level.from);
      if (!level.crossClass) assert.equal(q.classId, classId);
      assert(!used.has(q.signature));
      used.add(q.signature);
    }
  }
}
for (const score of [29, 30, 39, 40, 50, 70, 100, 240]) validateQuestion(E.createQuestion(catalog, score, 0, new Set(), [], random), score);
// Concrete fairness examples: allow 400 versus 300, never 360 versus 355.
function fixture(counts) {
  return E.buildCatalog({ schemaVersion: 1, cards: Object.fromEntries(counts.map((_, i) => [i + 1, { classId: 1 }])), combos: counts.map((count, i) => ({ id: `1:${i + 1}`, cards: [i + 1], classId: 1, count, capped: false })) });
}
const fair = E.createQuestion(fixture([400, 300, 200, 100]), 20, 0, new Set(), [], random);
assert.equal(fair.options.find(c => c.id === fair.winnerId).count, 400);
assert(fair.options.some(c => c.count === 300));
assert.throws(() => E.createQuestion(fixture([360, 355, 200, 100]), 20), /题目不足/);
assert.throws(() => E.createQuestion(fixture([900, 840, 200, 100]), 20), /题目不足/);
assert.throws(() => E.createQuestion(fixture([99, 20]), 0), /题目不足/);
const thresholdBank = fixture([90, 40]);
assert.throws(() => E.createQuestion(thresholdBank, 4), /题目不足/);
validateQuestion(E.createQuestion(thresholdBank, 5, 0, new Set(), [], random), 5);
const distributions = [];
for (const score of [0, 10, 20, 40]) {
  const ratios = []; let commonRunner = 0;
  for (let i = 0; i < 200; i++) {
    const q = E.createQuestion(catalog, score, 0, new Set(), [], random);
    validateQuestion(q, score);
    const winner = q.options.find(c => c.id === q.winnerId);
    const runner = Math.max(...q.options.filter(c => c.id !== winner.id).map(c => c.count));
    if (runner >= E.difficultyForScore(score).commonCount) commonRunner++;
    if (!winner.capped) ratios.push(winner.count / runner);
  }
  ratios.sort((a, b) => a - b);
  distributions.push({ score, medianRatio: ratios[Math.floor(ratios.length / 2)], commonRunner });
}
assert(distributions[3].medianRatio < distributions[0].medianRatio, 'Late leading pairs must actually get closer');
assert(distributions[3].medianRatio >= 1.25 && distributions[3].medianRatio <= 1.5);
assert(distributions[3].commonRunner >= 180, 'Late rounds should usually have at least two nonrare options');
console.log('Leading-pair distribution:', JSON.stringify(distributions));
assert(zeros > 0 && mixedLengths > 0 && singles > 0 && crossClassQuestions > 0);
for (const boundary of [3, 6, 10, 15, 20, 30, 40]) {
  const retry = E.newGame(7);
  retry.score = boundary - 1; retry.round = boundary - 1;
  E.nextQuestion(retry, catalog, random);
  const wrong = retry.question.options.find(c => c.id !== retry.question.winnerId);
  E.answer(retry, wrong.id);
  E.nextQuestion(retry, catalog, random);
  assert.equal(retry.round, boundary);
  validateQuestion(retry.question, boundary - 1);
  E.answer(retry, retry.question.winnerId);
  E.nextQuestion(retry, catalog, random);
  assert.equal(retry.round, boundary + 1);
  validateQuestion(retry.question, boundary);
}
const state = E.newGame();
assert.equal(state.lives, 5);
for (let i = 0; i < 70; i++) {
  assert(E.nextQuestion(state, catalog, random));
  assert.equal(state.round, i + 1);
  assert.equal(E.nextQuestion(state, catalog, random), false);
  validateQuestion(state.question, state.score);
  assert.equal(E.answer(state, 'invalid'), null);
  if (i === 12) {
    const oldSignature = state.question.signature;
    const wrong = state.question.options.find(c => c.id !== state.question.winnerId);
    assert(!E.answer(state, wrong.id).correct);
    assert.equal(state.score, 12);
    assert.equal(state.lives, 4);
    assert.equal(E.answer(state, wrong.id), null);
    assert(E.nextQuestion(state, catalog, random));
    assert.equal(state.round, 13, 'A mistake retries the same round');
    assert.equal(state.question.stage, E.levelForScore(12));
    assert.notEqual(state.question.signature, oldSignature, 'Retry draws a new question');
  }
  assert(E.answer(state, state.question.winnerId).correct);
  assert.equal(E.answer(state, state.question.winnerId), null);
}
assert.equal(state.score, 70);
for (let i = 0; i < 4; i++) {
  E.nextQuestion(state, catalog, random);
  assert.equal(state.round, 71, 'Repeated mistakes must never advance the round');
  E.answer(state, state.question.options.find(c => c.id !== state.question.winnerId).id);
  assert.equal(state.lives, 3 - i);
  assert.equal(state.score, 70);
}
assert(state.over);
assert.equal(E.nextQuestion(state, catalog, random), false);
assert.equal(E.answer(state, state.question.winnerId), null);
for (const card of Object.values(data.cards)) {
  assert(data.combos.some(c => c.classId === card.classId && c.cards.length === 1 && c.cards[0] === card.id), 'Every collected card has a single-card query');
  const file = path.join(__dirname, card.image);
  assert(fs.existsSync(file), `Missing image: ${card.image}`);
  const bytes = fs.readFileSync(file);
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
}
console.log(JSON.stringify({ combinations: data.combos.length, generatedQuestions: generated, cappedQuestions: capped, zeroQuestions: zeros, mixedLengthQuestions: mixedLengths, singleCardQuestions: singles }, null, 2));
console.log('PASS: evidence counts, examples, no all-rare questions, progressively closer leading pairs, 25% / 50-deck minimum gap, five lives and same-round retries.');
