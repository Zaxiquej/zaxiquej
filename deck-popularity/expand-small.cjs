// Expand only playable one-, two- and three-card combinations. Resumable.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const { state, request, save } = require('./collect.cjs');
const { attachExamples } = require('./examples.cjs');
const E = require('./engine.js');
const root = __dirname;
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8'), ctx);
const previous = ctx.window.DECK_POPULARITY_DATA;
const keyFor = (classId, ids) => `${classId}:${[...ids].sort((a, b) => a - b).join(',')}`;
state.smallExpansion ||= { pools: {}, plans: {} };
state.exampleQueries ||= {};
function availableCards() {
  return { ...previous.cards, ...Object.fromEntries(Object.values(state.cards).filter(c => c.classId >= 0 && c.classId <= 7 && fs.existsSync(path.join(root, `images/${c.id}.webp`))).map(({ imageHash, ...c }) => [c.id, { ...c, image: `images/${c.id}.webp` }])) };
}
async function query(classId, ids) {
  const id = keyFor(classId, ids);
  if (state.combos[id]?.method === 'search') return state.combos[id];
  const d = await request('/web/DeckSearch/index', { battle_format: 1, class_ids: String(classId), card_ids: ids.join(','), sort_order: 4, offset: 0, limit: 3 });
  if (!Number.isInteger(d.count) || typeof d.is_limit !== 'boolean' || !Array.isArray(d.deck_list) || d.deck_list.some(r => r.class_id !== classId || r.battle_format !== 1)) throw Error('Invalid count response');
  const queriedAt = new Date().toISOString();
  const combo = { id, classId, cards: [...ids].sort((a,b) => a-b), count: d.count, capped: d.is_limit, method: 'search', queriedAt };
  state.combos[id] = combo;
  state.exampleQueries[id] = { refs: d.deck_list.map(r => `1:${r.user_id}:${r.deck_id}`).slice(0, 3), queriedAt };
  save(); return combo;
}
function rememberCards(detail) {
  for (const entry of Object.values(detail.card_details || {})) {
    const c = entry.common;
    if (!c || c.is_token || c.class < 0 || c.class > 7) continue;
    state.cards[c.card_id] ||= { id: c.card_id, name: c.name, classId: c.class, cost: c.cost, image: `images/${c.card_id}.webp`, imageHash: c.card_image_hash,
      text: (c.skill_text || '').replace(/<hr\s*\/?\s*>/g, '\n').replace(/<[^>]*>/g, '').replace(/_/g, ' ') };
  }
}
async function collectSinglePool(base) {
  if (state.pools[base.id]) return true;
  const params = { battle_format: 1, class_ids: String(base.classId), card_ids: base.cards.join(','), sort_order: 4, offset: 0, limit: 20 };
  const first = await request('/web/DeckSearch/index', params);
  if (first.is_limit || first.count < 40 || first.count > 650) return false;
  const rows = [...first.deck_list];
  for (let offset = 20; offset < first.count; offset += 20) {
    const d = await request('/web/DeckSearch/index', { ...params, offset });
    if (d.count !== first.count || d.is_limit) throw Error('Pool changed during pagination; rerun to retry');
    rows.push(...d.deck_list);
  }
  const unique = new Map(rows.map(r => [`1:${r.user_id}:${r.deck_id}`, r]));
  if (unique.size !== first.count) throw Error('Incomplete pool listing');
  const deckKeys = [...unique.keys()]; let fetched = 0, cursor = 0;
  const entries = [...unique.entries()];
  async function worker() {
   while (cursor < entries.length) {
    const [key, row] = entries[cursor++];
    if (row.class_id !== base.classId || row.battle_format !== 1) throw Error('Pool filter mismatch');
    if (!state.decks[key]?.quantities) {
      const d = await request('/web/DeckBuilder/deckModal?' + new URLSearchParams({ deck_id: row.deck_id, user_id: row.user_id, battle_format: 1 }));
      if (d.class_id !== base.classId || !d.deck_card_num) throw Error('Invalid deck detail');
      rememberCards(d);
      state.decks[key] = { classId: base.classId, cards: Object.keys(d.deck_card_num).map(Number), quantities: d.deck_card_num };
      save();
      if (++fetched % 50 === 0) console.log(`Class ${base.classId}: ${fetched} new deck details (${first.count} in full query)`);
    }
    const d = state.decks[key];
    if (d.classId !== base.classId || !base.cards.every(id => d.quantities[id] > 0) || Object.values(d.quantities).reduce((a,b) => a+b,0) !== 40) throw Error('Invalid pool evidence');
   }
  }
  const results = await Promise.allSettled(Array.from({length:3}, () => worker()));
  const failed = results.find(r => r.status === 'rejected');
  if (failed) throw failed.reason;
  const last = await request('/web/DeckSearch/index', params);
  if (last.count !== first.count || last.is_limit) throw Error('Pool count changed; rerun to retry');
  state.pools[base.id] = { classId: base.classId, baseCards: base.cards, count: first.count, deckKeys, queriedAt: new Date().toISOString() };
  state.smallExpansion.pools[base.classId] ||= [];
  state.smallExpansion.pools[base.classId].push(base.id);
  save(); console.log(`Class ${base.classId}: completed single-card pool ${base.id}, ${first.count} decks`);
  return true;
}
async function addSinglePool(classId) {
  const candidates = Object.values(state.combos).filter(c => c.classId === classId && c.cards.length === 1 && c.method === 'search' && !c.capped && c.count >= 100 && c.count <= 650 && !state.pools[c.id]);
  const cached = Object.values(state.decks).filter(d => d.classId === classId);
  const cost = c => Math.abs(c.count - 180) * .6 + Math.max(0, c.count - cached.filter(d => d.quantities[c.cards[0]]).length) * .2;
  candidates.sort((a,b) => cost(a)-cost(b));
  for (const base of candidates) if (await collectSinglePool(base)) return;
  console.log(`Class ${classId}: no further eligible single-card pools`);
}
async function images(classFilter = null) {
  const manifestPath = path.join(root, 'images/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  let added = 0;
  for (const c of Object.values(state.cards).filter(c => c.classId >= 0 && c.classId <= 7 && (classFilter === null || c.classId === classFilter))) {
    const target = path.join(root, `images/${c.id}.webp`);
    if (fs.existsSync(target)) continue;
    const png = path.join(root, `.cache/png/${c.imageHash}.png`);
    if (!fs.existsSync(png)) {
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const r = await fetch(`https://shadowverse-wb.com/uploads/card_image/chs/card/${c.imageHash}.png`, { signal: AbortSignal.timeout(25000) });
          if (!r.ok) throw Error(`Image HTTP ${r.status}`);
          const bytes = Buffer.from(await r.arrayBuffer());
          if (bytes.toString('hex',0,8) !== '89504e470d0a1a0a') throw Error('Not a PNG');
          fs.writeFileSync(png, bytes); break;
        } catch(e) { if (attempt === 3) throw e; await new Promise(r => setTimeout(r, 3000 * (attempt + 1))); }
      }
    }
    execFileSync('magick', [png, '-quality', '84', target], { stdio: 'ignore' });
    manifest[c.id] = c.imageHash; added++;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
  }
  if (added) console.log(`Added ${added} local card images`);
}
async function querySingles() {
  let done = 0;
  for (const c of Object.values(availableCards()).filter(c => c.classId >= 1)) if (!state.combos[keyFor(c.classId,[c.id])]) { await query(c.classId, [c.id]); done++; }
  if (done) console.log(`Verified ${done} additional single cards`);
}
function buildExpanded() {
  const cards = availableCards();
  const combos = new Map(Object.values(state.combos).filter(c => c.method === 'search' && c.cards.length <= 3 && new Set(c.cards).size === c.cards.length && E.legalClassCombination(c.cards,c.classId,cards)).map(c => [c.id,c]));
  // Preserve already verified playable rows, including their zero results.
  for (const c of previous.combos) if (c.cards.length <= 3 && !combos.has(c.id)) combos.set(c.id, c);
  const retainedZeros = new Map();
  for (const [id,c] of combos) if (c.method === 'complete-subset' && c.count === 0 && state.pools[c.pool]?.baseCards.length === 1) {
    const n = retainedZeros.get(c.pool) || 0;
    if (n >= 25) combos.delete(id);
    else retainedZeros.set(c.pool,n+1);
  }
  for (const [poolKey,p] of Object.entries(state.pools)) {
    if (p.baseCards.length >= 3 || !E.legalClassCombination(p.baseCards,p.classId,cards)) continue;
    const deckRows = p.deckKeys.map(key => state.decks[key].quantities);
    if (deckRows.length !== p.count || !deckRows.every(d => p.baseCards.every(id => d[id] > 0))) throw Error('Incomplete evidence');
    const ids = Object.values(cards).filter(c => (c.classId === p.classId || c.classId === 0) && !p.baseCards.includes(c.id)).map(c => c.id);
    const candidates = ids.map(id => [...p.baseCards,id]);
    if (p.baseCards.length === 1) for (let i=0;i<ids.length;i++) for (let j=i+1;j<ids.length;j++) candidates.push([...p.baseCards,ids[i],ids[j]]);
    let zeros = [...combos.values()].filter(c => c.pool === poolKey && c.count === 0).length;
    for (const combo of candidates) {
      const id = keyFor(p.classId,combo);
      if (combos.has(id)) continue;
      const count = deckRows.filter(d => combo.every(id => d[id] > 0)).length;
      if (!count && zeros++ >= 25) continue;
      combos.set(id,{id,classId:p.classId,cards:combo.sort((a,b)=>a-b),count,capped:false,method:'complete-subset',pool:poolKey,queriedAt:p.queriedAt});
    }
  }
  const evidence = Object.fromEntries(Object.entries(state.pools).map(([key,p]) => [key,{...p,deckKeys:undefined,decks:p.deckKeys.map(k => state.decks[k].quantities)}]));
  const data = attachExamples({...previous,bankVersion:4,generatedAt:new Date().toISOString(),cards,combos:[...combos.values()]},state);
  return {data,evidence};
}
function exportExpanded() {
  const {data,evidence}=buildExpanded();
  if (data.combos.some(c => c.count > 0 && !c.examples.length)) throw Error('Missing example links');
  fs.writeFileSync(path.join(root,'evidence.json'),JSON.stringify(evidence));
  fs.writeFileSync(path.join(root,'data.js'),'/* Playable one-, two- and three-card official snapshots. */\nwindow.DECK_POPULARITY_DATA = '+JSON.stringify(data)+';\n');
  const stats = {total:data.combos.length,byLength:[1,2,3].map(n=>data.combos.filter(c=>c.cards.length===n).length),positive:data.combos.filter(c=>c.count>0).length,atLeast40:data.combos.filter(c=>c.count>=40).length,cards:Object.keys(data.cards).length};
  console.log(JSON.stringify(stats)); return stats;
}
async function main() {
  execFileSync('magick',['-version'],{stdio:'ignore'});
  for (let c=1;c<=7;c++) {
    if (!(state.smallExpansion.pools[c]?.length)) await addSinglePool(c);
    await images(); await querySingles(); exportExpanded();
  }
  // Add a second independent base per class when the first pass is not broad enough.
  for (let c=1;c<=7 && buildExpanded().data.combos.length<10000;c++) {
    if ((state.smallExpansion.pools[c]?.length || 0)<2) await addSinglePool(c);
    await images(); await querySingles(); exportExpanded();
  }
  exportExpanded();
}
module.exports={main,buildExpanded,exportExpanded,query,availableCards,images};
if(require.main===module) main().catch(e=>{save();console.error(e);process.exitCode=1;});
