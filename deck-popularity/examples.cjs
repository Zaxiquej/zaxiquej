// Attach up to three real published decks to each combination. No player names retained.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function cachedExamples(combo, state) {
  if (!combo.count) return [];
  const keys = combo.method === 'complete-subset' ? state.pools[combo.pool]?.deckKeys || [] : Object.keys(state.decks);
  return keys.filter(key => {
    const d = state.decks[key];
    return d?.classId === combo.classId && combo.cards.every(id => d.quantities?.[id] > 0);
  }).slice(0, Math.min(3, combo.count));
}
function attachExamples(data, state) {
  return { ...data, combos: data.combos.map(c => ({ ...c, examples: c.count ? [...new Set([
    ...(state.exampleQueries?.[c.id]?.refs || []), ...cachedExamples(c, state)
  ])].slice(0, Math.min(3, c.count)) : [] })) };
}
async function main() {
  const { state, request, save } = require('./collect.cjs');
  const context = { window: {} };
  const file = path.join(__dirname, 'data.js');
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), context);
  const data = context.window.DECK_POPULARITY_DATA;
  state.exampleQueries ||= {};
  if (process.argv.includes('--collect')) {
    const pending = data.combos.filter(c => c.count > 0 && c.method === 'search' && !state.exampleQueries[c.id] && cachedExamples(c, state).length < Math.min(3, c.count));
    console.log(`Fetching example decks for ${pending.length} combinations`);
    for (let i = 0; i < pending.length; i++) {
      const c = pending[i];
      const d = await request('/web/DeckSearch/index', { battle_format: 1, class_ids: String(c.classId), card_ids: c.cards.join(','), sort_order: 4, offset: 0, limit: 3 });
      if (!Array.isArray(d.deck_list) || d.deck_list.some(row => row.class_id !== c.classId || row.battle_format !== 1 || !Number.isSafeInteger(row.user_id) || !Number.isSafeInteger(row.deck_id))) throw Error('Invalid example response');
      state.exampleQueries[c.id] = { refs: d.deck_list.map(row => `1:${row.user_id}:${row.deck_id}`).slice(0, 3), queriedAt: new Date().toISOString() };
      save();
      if ((i + 1) % 25 === 0) console.log(`Examples: ${i + 1}/${pending.length}`);
    }
  }
  const output = attachExamples(data, state);
  fs.writeFileSync(file, '/* Official count snapshot with published example decks. */\nwindow.DECK_POPULARITY_DATA = ' + JSON.stringify(output) + ';\n');
  console.log(JSON.stringify({ total: output.combos.length, withExamples: output.combos.filter(c => c.examples.length).length, missing: output.combos.filter(c => c.count > 0 && !c.examples.length).length }));
}
module.exports = { cachedExamples, attachExamples };
if (require.main === module) main().catch(error => { console.error(error); process.exitCode = 1; });
