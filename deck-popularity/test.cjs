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
  assert(E.legalClassCombination(c.cards,c.classId,data.cards));
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
for (const [score, options, maxCards, crossClass] of [[0,2,1,false],[3,2,1,false],[4,2,2,false],[7,2,2,false],[8,3,2,false],[11,3,2,false],[12,3,2,true],[17,3,2,true],[18,3,3,true],[23,3,3,true],[24,3,3,true],[29,3,3,true],[30,4,3,true],[39,4,3,true],[40,5,3,true],[49,5,3,true],[50,6,3,true],[100,11,3,true]]) {
  const d = E.difficultyForScore(score);
  assert.deepEqual([d.options, d.maxCards, d.crossClass], [options, maxCards, crossClass]);
  assert.equal(d.extremesOnly, score >= 24);
}
assert.equal(E.optionLabel(5), 'F');
assert.equal(E.optionLabel(26), 'AA');
for (const [score, threshold] of [[0,100],[4,100],[5,90],[9,90],[10,80],[15,70],[20,60],[24,60],[25,50],[29,50],[30,40],[100,40],[1000,40]]) {
  assert.equal(E.difficultyForScore(score).commonCount, threshold, 'Rarity threshold gradually falls and stops at 40');
}
for (const [score, minimum] of [[0,500],[7,500],[8,400],[11,400],[12,300],[17,300],[18,250],[29,250],[30,200],[49,200],[50,150],[69,150],[70,100],[1000,100]]) {
  assert.equal(E.difficultyForScore(score).winnerMinimum, minimum, 'Winning-count floor is independent of the rarity threshold');
}
let generated = 0, capped = 0, zeros = 0, mixedLengths = 0, singles = 0, crossClassQuestions = 0, neutralQuestions = 0, neutralWinners = 0;
function validateQuestion(q, score) {
  const level = E.difficultyForScore(score);
  assert.equal(q.extremesOnly, score >= 24);
  const originalOrder = q.options.map(c => c.id);
  const sorted = [...q.options].sort((a,b)=>(b.capped?1001:b.count)-(a.capped?1001:a.count));
  const hints = E.countHints(q);
  assert.equal(hints.length, q.options.length);
  for (let i = 0; i < hints.length; i++) assert.deepEqual(hints[i], score >= 24 && i > 0 && i < hints.length - 1 ? null : {count:sorted[i].count,capped:sorted[i].capped});
  assert.deepEqual(q.options.map(c => c.id), originalOrder, 'Sorting hints must not reorder the answer options');
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
  const hasNeutral = c => c.cards.some(id => data.cards[id]?.classId === 0);
  if (q.options.some(hasNeutral)) {
    neutralQuestions++;
    assert(score >= 4, 'Neutral cards must never appear in single-card opening rounds');
    assert(q.options.filter(hasNeutral).every(c=>E.legalClassCombination(c.cards,c.classId,data.cards)));
  }
  if (hasNeutral(winner)) neutralWinners++;
  const top = winner.capped ? 1001 : winner.count;
  assert(top >= level.commonCount, 'Never produce a question consisting entirely of rare combinations at the current threshold');
  assert(top >= level.winnerMinimum, 'Respect the winning-count minimum for this round');
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
const fair = E.createQuestion(fixture([400, 300, 200, 100]), 30, 0, new Set(), [], random);
assert.equal(fair.options.find(c => c.id === fair.winnerId).count, 400);
assert(fair.options.some(c => c.count === 300));
assert.throws(() => E.createQuestion(fixture([360, 355, 200, 100]), 30), /题目不足/);
assert.throws(() => E.createQuestion(fixture([900, 840, 200, 100]), 30), /题目不足/);
assert.throws(() => E.createQuestion(fixture([500, 250]), 0), /题目不足/, 'Early questions require at least a 2.5-fold gap');
validateQuestion(E.createQuestion(fixture([500, 100]), 0), 0);
assert.throws(() => E.createQuestion(fixture([99, 20]), 0), /题目不足/);
const thresholdBank = fixture([400, 150, 100]);
assert.throws(() => E.createQuestion(thresholdBank, 7), /题目不足/);
validateQuestion(E.createQuestion(thresholdBank, 8, 0, new Set(), [], random), 8);
const distributions = [];
for (const score of [0, 12, 30, 50]) {
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
assert(distributions[0].medianRatio >= 3, 'Opening questions should favor much larger gaps');
assert(distributions[3].medianRatio >= 1.25 && distributions[3].medianRatio <= 1.5);
assert(distributions[3].commonRunner >= 180, 'Late rounds should usually have at least two nonrare options');
console.log('Leading-pair distribution:', JSON.stringify(distributions));
const compositionProfiles = [];
for (const score of [4,8,12,18,24,30,50]) {
  let sameLength = 0, singleMajority = 0, triples = 0, oneDifferent = 0;
  const winningCounts = [], used = new Set();
  let recent = [];
  for (let i = 0; i < 200; i++) {
    const q = E.createQuestion(catalog, score, 0, used, recent, random);
    validateQuestion(q, score);
    used.add(q.signature);
    recent = [...recent, ...q.options.map(c=>c.id)].slice(-30);
    if (new Set(q.options.map(c=>c.cards.length)).size === 1) sameLength++;
    const lengths = q.options.map(c=>c.cards.length);
    if ([1,2,3].some(n => lengths.filter(v=>v===n).length === lengths.length-1 && lengths.filter(v=>Math.abs(v-n)===1).length===1)) oneDifferent++;
    if (q.options.filter(c=>c.cards.length===1).length >= q.options.length / 2) singleMajority++;
    if (q.options.some(c=>c.cards.length===3)) triples++;
    const winner = q.options.find(c=>c.id===q.winnerId);
    winningCounts.push(winner.capped?1001:winner.count);
  }
  winningCounts.sort((a,b)=>a-b);
  assert(sameLength >= (score < 8 ? 160 : 130), 'Equal card counts should remain the majority');
  if (score >= 8) assert(oneDifferent >= 30 && oneDifferent <= 70, '15–35% of sampled questions should have exactly one option differing by one card');
  if (score >= 8) assert(singleMajority <= 24, 'Midgame single-card majorities should stay below 12%');
  if (score >= 18) assert(triples >= 40, 'Three-card combinations must remain meaningfully represented');
  compositionProfiles.push({score,sameLength,oneDifferent,singleMajority,triples,minimumWinner:winningCounts[0],medianWinner:winningCounts[100]});
}
console.log('Composition profiles (200 questions each):', JSON.stringify(compositionProfiles));
assert.throws(() => E.createQuestion(fixture([100,50,20]), 12), /题目不足/, 'Do not silently fall back to 100-deck midgame winners');
assert(zeros > 0 && mixedLengths > 0 && singles > 0 && crossClassQuestions > 0);
assert(neutralQuestions > 0 && neutralWinners > 0, 'Neutral/class combinations must actually appear and can be winners');
for (const boundary of [4, 8, 12, 18, 24, 30, 40, 50, 70]) {
  const retry = E.newGame(7);
  retry.score = boundary - 1; retry.round = boundary - 1;
  E.nextQuestion(retry, catalog, random);
  const wrong = retry.question.options.find(c => c.id !== retry.question.winnerId);
  E.answer(retry, wrong.id);
  E.nextQuestion(retry, catalog, random);
  assert.equal(retry.round, boundary);
  validateQuestion(retry.question, boundary - 1);
  E.answer(retry, retry.question.winnerId);
  assert.equal(retry.question.extremesOnly, boundary - 1 >= 24, 'Answering must not change the current hint rule at the boundary');
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
  if (card.classId === 0) {
    assert(data.combos.some(c=>c.cards.includes(card.id)&&c.cards.length>=2), 'Every neutral is used with class cards');
    assert(!data.combos.some(c=>c.cards.length===1&&c.cards[0]===card.id), 'Never offer a neutral single');
  } else assert(data.combos.some(c => c.classId === card.classId && c.cards.length === 1 && c.cards[0] === card.id), 'Every class card has a single-card query');
  const file = path.join(__dirname, card.image);
  assert(fs.existsSync(file), `Missing image: ${card.image}`);
  const bytes = fs.readFileSync(file);
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
}
console.log(JSON.stringify({ combinations: data.combos.length, generatedQuestions: generated, cappedQuestions: capped, zeroQuestions: zeros, mixedLengthQuestions: mixedLengths, singleCardQuestions: singles, neutralQuestions, neutralWinners }, null, 2));
console.log('PASS: evidence counts, examples, no all-rare questions, progressively closer leading pairs, 25% / 50-deck minimum gap, five lives and same-round retries.');
