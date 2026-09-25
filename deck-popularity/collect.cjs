// Node 18+. Run from any directory: node deck-popularity/collect.cjs
// Only reads public Deck Portal data. Resumable cache; --fresh refreshes counts.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const E = require('./engine.js');
const root = __dirname;
const cacheDir = path.join(root, '.cache');
const imageDir = path.join(root, 'images');
const pngDir = path.join(cacheDir, 'png');
fs.mkdirSync(cacheDir, { recursive: true });
fs.mkdirSync(imageDir, { recursive: true });
fs.mkdirSync(pngDir, { recursive: true });
const cacheFile = path.join(cacheDir, 'snapshot.json');
const fresh = process.argv.includes('--fresh');
const state = !fresh && fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile, 'utf8')) :
  { startedAt: new Date().toISOString(), decks: {}, cards: {}, combos: {}, lists: {}, pools: {} };
state.pools ||= {};
const save = () => fs.writeFileSync(cacheFile, JSON.stringify(state));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let lastRequest = 0;
async function request(endpoint, body) {
  for (let attempt = 0; attempt < 4; attempt++) {
    // Reserve start times before awaiting, so independent reads can overlap
    // without exceeding the same one-request-per-800ms rate.
    const startAt = Math.max(Date.now(), lastRequest + 800);
    lastRequest = startAt;
    await sleep(Math.max(0, startAt - Date.now()));
    try {
      const response = await fetch('https://shadowverse-wb.com' + endpoint, {
        method: body ? 'POST' : 'GET',
        headers: { Lang: 'chs', ...(body ? { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(25000)
      });
      if (!response.ok) throw Error(`HTTP ${response.status}`);
      const json = await response.json();
      if (json.data_headers?.result_code !== 1 || json.data?.result_error_code) throw Error('API error: ' + JSON.stringify(json));
      if (!json.data) throw Error('Missing data');
      return json.data;
    } catch (error) {
      console.error('Retry', attempt + 1, endpoint, error.message.slice(0, 160));
      if (attempt === 3) throw error;
      await sleep(4000 * (attempt + 1));
    }
  }
}
let seed = 20260923;
function random() { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }
function shuffle(list) {
  list = [...list];
  for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
  return list;
}
async function collectClass(classId) {
  const sources = [];
  for (const order of [4, 2]) {
    const key = `${classId}:${order}`;
    if (!state.lists[key]) {
      const data = await request('/web/DeckSearch/index', { battle_format: 1, class_ids: String(classId), sort_order: order, offset: 0, limit: 20 });
      if (!data.deck_list?.length || data.deck_list.some(d => d.class_id !== classId || d.battle_format !== 1)) throw Error('Search filter mismatch');
      state.lists[key] = data.deck_list.map(d => ({ deck_id: d.deck_id, user_id: d.user_id, battle_format: d.battle_format }));
      save();
    }
    for (const index of [0, 6, 13]) {
      const d = state.lists[key][index];
      if (!d) continue;
      const deckKey = `${d.battle_format}:${d.user_id}:${d.deck_id}`;
      if (!state.decks[deckKey]) {
        const params = new URLSearchParams(d);
        const detail = await request('/web/DeckBuilder/deckModal?' + params);
        if (!detail.deck_card_num || detail.class_id !== classId) throw Error('Invalid deck detail');
        for (const { common: c } of Object.values(detail.card_details)) {
          if (!c.is_token) state.cards[c.card_id] = { id: c.card_id, name: c.name, classId: c.class, cost: c.cost,
            image: `images/${c.card_id}.png`, imageHash: c.card_image_hash,
            text: (c.skill_text || '').replace(/<hr\s*\/?\s*>/g, '\n').replace(/<[^>]*>/g, '').replace(/_/g, ' ') };
        }
        // Do not retain usernames or deck names; only the actual deck composition is needed.
        state.decks[deckKey] = { classId, cards: Object.keys(detail.deck_card_num).map(Number), quantities: detail.deck_card_num };
        save();
      }
      sources.push(state.decks[deckKey]);
    }
  }
  // Include neutral main-deck cards, but every combination needs a class card.
  const classDecks = sources.map(d => d.cards.filter(id => state.cards[id]?.classId === classId || state.cards[id]?.classId === 0));
  for (const size of [2, 3]) {
    const candidates = new Map();
    for (let pass = 0; pass < 500 && candidates.size < (size === 2 ? 32 : 24); pass++) {
      const deck = classDecks[pass % classDecks.length];
      if (deck.length < size) continue;
      const ids = shuffle(deck).slice(0, size).sort((a, b) => a - b);
      if (!E.legalClassCombination(ids,classId,state.cards)) continue;
      const key = `${classId}:${ids.join(',')}`;
      candidates.set(key, ids);
    }
    let done = 0;
    for (const [key, ids] of candidates) {
      if (!state.combos[key]) {
        const data = await request('/web/DeckSearch/index', { battle_format: 1, class_ids: String(classId), card_ids: ids.join(','), sort_order: 4, offset: 0, limit: 20 });
        if (!Number.isInteger(data.count) || typeof data.is_limit !== 'boolean') throw Error('Invalid count');
        if (data.deck_list?.some(d => d.class_id !== classId || d.battle_format !== 1)) throw Error('Combination filter mismatch');
        state.combos[key] = { id: key, classId, cards: ids, count: data.count, capped: data.is_limit, method: 'search', queriedAt: new Date().toISOString() };
        save();
      }
      done++;
      if (done % 12 === 0) console.log(`Class ${classId} / ${size} cards: ${done}/${candidates.size}; total ${Object.keys(state.combos).length}`);
    }
  }
  const rows = Object.values(state.combos).filter(c => c.classId === classId);
  console.log(`Class ${classId} complete: ${rows.filter(c => !c.capped).length} exact, ${rows.filter(c => c.capped).length} capped`);
}
async function collectCopies(classId) {
  let candidates = Object.values(state.combos).filter(c => c.classId === classId && c.method === 'search' && !c.capped && c.count >= 12 && c.count <= 65)
    .sort((a, b) => a.cards.length - b.cards.length || a.count - b.count);
  if (!candidates.length) candidates = Object.values(state.combos)
    .filter(c => c.classId === classId && c.method === 'search' && !c.capped && c.count >= 12 && c.count <= 220)
    .sort((a, b) => a.count - b.count).slice(0, 1);
  const selected = [];
  for (const c of candidates) {
    if (selected.length >= 2) break;
    // Prefer different anchors to avoid every multi-copy question sharing the same cards.
    if (selected.some(a => a.cards.join() === c.cards.join())) continue;
    selected.push(c);
  }
  for (const base of selected) {
    const poolKey = base.id;
    if (!state.pools[poolKey]) {
      const query = { battle_format: 1, class_ids: String(classId), card_ids: base.cards.join(','), sort_order: 4, offset: 0, limit: 20 };
      const first = await request('/web/DeckSearch/index', query);
      if (first.is_limit || first.count > 220 || first.count < 1) continue;
      let listings = [...first.deck_list];
      let stable = true;
      for (let offset = 20; offset < first.count; offset += 20) {
        const page = await request('/web/DeckSearch/index', { ...query, offset });
        if (page.is_limit || page.count !== first.count) { stable = false; break; }
        listings.push(...page.deck_list);
      }
      const unique = [...new Map(listings.map(d => [`${d.battle_format}:${d.user_id}:${d.deck_id}`, d])).entries()];
      if (!stable || unique.length !== first.count) { console.log('Skipped changing pool', poolKey); continue; }
      const deckKeys = [];
      for (const [key, d] of unique) {
        if (!state.decks[key]?.quantities) {
          const detail = await request('/web/DeckBuilder/deckModal?' + new URLSearchParams({ deck_id: d.deck_id, user_id: d.user_id, battle_format: 1 }));
          if (!detail.deck_card_num || detail.class_id !== classId) { stable = false; break; }
          for (const { common: c } of Object.values(detail.card_details)) {
            if (!c.is_token) state.cards[c.card_id] = { id: c.card_id, name: c.name, classId: c.class, cost: c.cost,
              image: `images/${c.card_id}.png`, imageHash: c.card_image_hash,
              text: (c.skill_text || '').replace(/<hr\s*\/?\s*>/g, '\n').replace(/<[^>]*>/g, '').replace(/_/g, ' ') };
          }
          state.decks[key] = { classId, cards: Object.keys(detail.deck_card_num).map(Number), quantities: detail.deck_card_num };
          save();
        }
        const quantities = state.decks[key].quantities;
        if (!base.cards.every(id => quantities[id] >= 1) || Object.values(quantities).reduce((a, b) => a + b, 0) !== 40) { stable = false; break; }
        deckKeys.push(key);
      }
      const check = await request('/web/DeckSearch/index', query);
      if (!stable || check.count !== first.count || check.is_limit || deckKeys.length !== first.count) { console.log('Skipped incomplete pool', poolKey); continue; }
      state.pools[poolKey] = { classId, baseCards: base.cards, count: first.count, deckKeys, queriedAt: new Date().toISOString() };
      save();
    }
    const pool = state.pools[poolKey];
    const decks = pool.deckKeys.map(key => state.decks[key].quantities);
    const ids = [...new Set(decks.flatMap(d => Object.keys(d).map(Number)))].filter(id => state.cards[id]?.classId === classId);
    const generated = new Map();
    const maxCards = pool.baseCards.length + 2;
    function extend(cards) {
      if (cards.length > maxCards) return;
      const requirements = {};
      for (const id of cards) requirements[id] = (requirements[id] || 0) + 1;
      if (Object.values(requirements).some(n => n > 3)) return;
      if (cards.length >= 3 && Object.values(requirements).some(n => n > 1)) {
        const sorted = [...cards].sort((a, b) => a - b);
        const key = `${classId}:${sorted.join(',')}`;
        if (!generated.has(key)) {
          const count = decks.filter(d => Object.entries(requirements).every(([id, qty]) => d[id] >= qty)).length;
          if (count > 0) generated.set(key, { id: key, classId, cards: sorted, count, capped: false, method: 'complete-subset', pool: poolKey, queriedAt: pool.queriedAt });
        }
      }
      if (cards.length < maxCards) for (const id of ids) extend([...cards, id]);
    }
    extend(pool.baseCards);
    for (const [key, value] of generated) state.combos[key] ||= value;
    save();
    console.log(`Class ${classId} copy-aware pool: ${pool.count} complete decks, ${generated.size} combinations`);
  }
}
function exportData() {
  const combos = Object.values(state.combos);
  const used = new Set(combos.flatMap(c => c.cards));
  const cards = Object.fromEntries([...used].map(id => { const { imageHash, ...card } = state.cards[id]; return [id, { ...card, image: `images/${id}.webp` }]; }));
  const data = { schemaVersion: 1, format: 1, startedAt: state.startedAt, generatedAt: new Date().toISOString(),
    source: 'https://shadowverse-wb.com/chs/deck/search/', cards, combos };
  fs.writeFileSync(path.join(root, 'data.js'), '/* Public Deck Portal count snapshot. Generated by collect.cjs. */\nwindow.DECK_POPULARITY_DATA = ' + JSON.stringify(data) + ';\n');
  const evidence = Object.fromEntries(Object.entries(state.pools).map(([key, p]) => [key, { ...p, deckKeys: undefined, decks: p.deckKeys.map(k => state.decks[k].quantities) }]));
  fs.writeFileSync(path.join(root, 'evidence.json'), JSON.stringify(evidence));
  return used;
}
async function main() {
  execFileSync('magick', ['-version'], { stdio: 'ignore' });
  for (let classId = 1; classId <= 7; classId++) { await collectClass(classId); await collectCopies(classId); }
  const used = new Set(Object.values(state.combos).flatMap(c => c.cards));
  const manifestFile = path.join(imageDir, 'manifest.json');
  const hashes = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : {};
  let done = 0;
  for (const id of used) {
    const c = state.cards[id];
    const target = path.join(imageDir, `${id}.webp`);
    const source = path.join(pngDir, `${c.imageHash}.png`);
    const legacy = path.join(imageDir, `${id}.png`);
    if (!fs.existsSync(source) && fs.existsSync(legacy)) fs.copyFileSync(legacy, source);
    if (!fs.existsSync(target) || hashes[id] !== c.imageHash) {
      if (!fs.existsSync(source)) {
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          await sleep(150);
          const r = await fetch(`https://shadowverse-wb.com/uploads/card_image/chs/card/${c.imageHash}.png`, { signal: AbortSignal.timeout(25000) });
          if (!r.ok) throw Error(`Card image HTTP ${r.status}`);
          const bytes = Buffer.from(await r.arrayBuffer());
          if (bytes.toString('hex', 0, 8) !== '89504e470d0a1a0a') throw Error('Not a PNG');
          fs.writeFileSync(source, bytes);
          break;
        } catch (error) { if (attempt === 3) throw error; await sleep(3000 * (attempt + 1)); }
      }
      }
      execFileSync('magick', [source, '-quality', '84', target], { stdio: 'ignore' });
      hashes[id] = c.imageHash;
      fs.writeFileSync(manifestFile, JSON.stringify(hashes));
    }
    if (++done % 30 === 0) console.log(`Images ${done}/${used.size}`);
  }
  exportData();
  console.log(`Done: ${Object.keys(state.combos).length} combinations; ${used.size} local card images.`);
}
module.exports = { state, request, save };
if (require.main === module) main().catch(error => { save(); console.error(error); process.exitCode = 1; });
