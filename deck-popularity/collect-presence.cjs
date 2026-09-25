// Add real single-card / unrelated-card queries, then export the presence-only game bank.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { state, request, save } = require('./collect.cjs');
const E = require('./engine.js');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8'), context);
const previous = context.window.DECK_POPULARITY_DATA;
let seed = 230923;
function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }
function shuffle(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const keyFor = (classId, ids) => `${classId}:${[...ids].sort((a, b) => a - b).join(',')}`;
async function main() {
  for (let classId = 1; classId <= 7; classId++) {
    const ids = Object.values(previous.cards).filter(c => c.classId === classId).map(c => c.id);
    const queries = shuffle(ids).slice(0, 12).map(id => [id]);
    const pairs = new Set();
    while (pairs.size < 20) {
      const cards = shuffle(ids).slice(0, 2).sort((a, b) => a - b);
      if (pairs.has(cards.join(','))) continue;
      pairs.add(cards.join(',')); queries.push(cards);
    }
    for (const cards of queries) {
      const key = keyFor(classId, cards);
      if (!state.combos[key]) {
        const data = await request('/web/DeckSearch/index', { battle_format: 1, class_ids: String(classId), card_ids: cards.join(','), sort_order: 4, offset: 0, limit: 20 });
        if (!Number.isInteger(data.count) || typeof data.is_limit !== 'boolean') throw Error('Invalid count');
        if (data.deck_list.some(d => d.class_id !== classId || d.battle_format !== 1)) throw Error('Filter mismatch');
        state.combos[key] = { id: key, classId, cards, count: data.count, capped: data.is_limit, method: 'search', queriedAt: new Date().toISOString() };
        save();
      }
    }
    console.log(`Class ${classId}: single-card and mixed-pair queries ready`);
  }
  // If broad pairs still all exist, try unrelated four-card combinations for genuine zero results.
  state.presenceZeroProbes ||= {};
  for (let classId = 1; classId <= 7; classId++) {
    if (state.presenceZeroProbes[classId]) continue;
    if (Object.values(state.combos).some(c => c.classId === classId && c.count === 0)) continue;
    const ids = Object.values(previous.cards).filter(c => c.classId === classId).map(c => c.id);
    for (let i = 0; i < 20; i++) {
      const cards = shuffle(ids).slice(0, 4).sort((a, b) => a - b);
      const key = keyFor(classId, cards);
      if (!state.combos[key]) {
        const d = await request('/web/DeckSearch/index', { battle_format: 1, class_ids: String(classId), card_ids: cards.join(','), sort_order: 4, offset: 0, limit: 20 });
        if (!Number.isInteger(d.count) || typeof d.is_limit !== 'boolean') throw Error('Invalid count');
        state.combos[key] = { id: key, classId, cards, count: d.count, capped: d.is_limit, method: 'search', queriedAt: new Date().toISOString() };
        save();
      }
      if (state.combos[key].count === 0) break;
    }
    state.presenceZeroProbes[classId] = true;
    save();
  }
  const combos = new Map(Object.values(state.combos)
    .filter(c => c.method === 'search' && new Set(c.cards).size === c.cards.length && E.legalClassCombination(c.cards,c.classId,previous.cards))
    .map(c => [c.id, c]));
  for (const [poolKey, pool] of Object.entries(state.pools)) {
    const ids = Object.values(previous.cards).filter(c => (c.classId === pool.classId || c.classId === 0) && !pool.baseCards.includes(c.id)).map(c => c.id);
    const decks = pool.deckKeys.map(key => state.decks[key].quantities);
    if (decks.length !== pool.count || !decks.every(d => pool.baseCards.every(id => d[id] >= 1))) throw Error('Incomplete evidence pool');
    let positive = 0, zero = 0;
    const candidates = [];
    for (const id of ids) candidates.push([...pool.baseCards, id]);
    if (pool.baseCards.length === 2) for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) candidates.push([...pool.baseCards, ids[i], ids[j]]);
    for (const cards of shuffle(candidates)) {
      if (!E.legalClassCombination(cards,pool.classId,previous.cards)) continue;
      const count = decks.filter(d => cards.every(id => d[id] >= 1)).length;
      if ((count === 0 && zero >= 20) || (count > 0 && positive >= 100)) continue;
      const key = keyFor(pool.classId, cards);
      if (combos.has(key)) continue;
      combos.set(key, { id: key, classId: pool.classId, cards: cards.sort((a, b) => a - b), count, capped: false, method: 'complete-subset', pool: poolKey, queriedAt: pool.queriedAt });
      if (count === 0) zero++; else positive++;
    }
  }
  const rows = [...combos.values()];
  const used = new Set(rows.flatMap(c => c.cards));
  const cards = Object.fromEntries([...used].map(id => [id, previous.cards[id]]));
  const data = { schemaVersion: 1, rulesVersion: 2, format: 1, startedAt: state.startedAt, generatedAt: new Date().toISOString(), source: previous.source, cards, combos: rows };
  fs.writeFileSync(path.join(__dirname, 'data.js'), '/* Presence-only Deck Portal snapshot. Generated by collect-presence.cjs. */\nwindow.DECK_POPULARITY_DATA = ' + JSON.stringify(data) + ';\n');
  console.log(`Saved ${rows.length} combinations; ${rows.filter(c => c.cards.length === 1).length} singles; ${rows.filter(c => c.count === 0).length} verified zero counts.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
