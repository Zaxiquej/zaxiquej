// Bounded, resumable pair-only expansion. --new starts one new batch of up to 100 pairs per class.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { state, save } = require('./collect.cjs');
const { query } = require('./expand-small.cjs');
const { attachExamples } = require('./examples.cjs');
const file = path.join(__dirname, 'data.js');
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(file, 'utf8'), ctx);
const previous = ctx.window.DECK_POPULARITY_DATA;
const keyFor = (classId, ids) => `${classId}:${ids.join(',')}`;
function makeBatch() {
  const known = new Set(previous.combos.map(c => c.id));
  const classPlans = [];
  for (let classId = 1; classId <= 7; classId++) {
    const pairs = new Map();
    for (const deck of Object.values(state.decks).filter(d => d.classId === classId)) {
      const ids = deck.cards.filter(id => previous.cards[id]?.classId === classId).sort((a,b) => a-b);
      for (let i=0;i<ids.length;i++) for (let j=i+1;j<ids.length;j++) {
        const cards = [ids[i],ids[j]], id = keyFor(classId,cards);
        if (known.has(id)) continue;
        if (!pairs.has(id)) pairs.set(id,{id,classId,cards,frequency:0});
        pairs.get(id).frequency++;
      }
    }
    const candidates = [...pairs.values()].filter(c => c.frequency >= 2).sort((a,b) => b.frequency-a.frequency || a.id.localeCompare(b.id));
    // Sample frequently and less frequently observed pairs; cache frequency only
    // chooses queries and is never used as the official deck count.
    const bands = [0,1,2].map(i => candidates.slice(Math.floor(candidates.length*i/3),Math.floor(candidates.length*(i+1)/3)));
    const used = new Map(), selected = [];
    for(let i=0;i<100 && bands.some(b => b.length);i++) {
      const band = bands[i%3].length ? bands[i%3] : bands.find(b => b.length);
      const priority = c => Math.log2(c.frequency+1)/(1+c.cards.reduce((n,id)=>n+(used.get(id)||0),0)*.25);
      band.sort((a,b) => priority(b)-priority(a) || a.id.localeCompare(b.id));
      const {frequency,...c} = band.shift(); selected.push(c);
      for(const id of c.cards) used.set(id,(used.get(id)||0)+1);
    }
    classPlans.push(selected);
  }
  const rows = [];
  for(let i=0;i<100;i++) for(const plan of classPlans) if(plan[i]) rows.push(plan[i]);
  return { startedAt:new Date().toISOString(), rows, complete:false };
}
function publish(batch) {
  const additions = batch.rows.map(c => state.combos[c.id]).filter(c => c?.method === 'search');
  const enriched = attachExamples({combos:additions},state).combos;
  if(enriched.some(c => c.count>0 && !c.examples.length)) throw Error('A positive pair is missing its example deck');
  const all = new Map(previous.combos.map(c=>[c.id,c]));
  for(const c of enriched) all.set(c.id,c);
  const data = {...previous,generatedAt:new Date().toISOString(),combos:[...all.values()]};
  if(data.combos.some(c=>c.cards.length>3)) throw Error('Unplayable card count');
  fs.writeFileSync(file,'/* Official snapshot, with additional verified two-card combinations. */\nwindow.DECK_POPULARITY_DATA = '+JSON.stringify(data)+';\n');
  return {total:data.combos.length,pairs:data.combos.filter(c=>c.cards.length===2).length,verified:enriched.length,planned:batch.rows.length};
}
async function main() {
  state.pairBatches ||= [];
  let batch = state.pairBatches.at(-1);
  if(!batch || (batch.complete && process.argv.includes('--new'))) {
    batch=makeBatch(); state.pairBatches.push(batch); save();
  }
  console.log(`Pair batch: ${batch.rows.length} queries, across seven classes`);
  let cursor=0, done=0, stopped=false;
  async function worker() {
    while(!stopped && cursor<batch.rows.length) {
      const row=batch.rows[cursor++];
      try { await query(row.classId,row.cards); }
      catch(error) { stopped=true; throw error; }
      done++;
      if(done%50===0) console.log(JSON.stringify(publish(batch)));
    }
  }
  const results=await Promise.allSettled(Array.from({length:3},()=>worker()));
  const failed=results.find(r=>r.status==='rejected');
  if(!failed) batch.complete=true;
  save(); console.log(JSON.stringify(publish(batch)));
  if(failed) throw failed.reason;
}
if(require.main===module) main().catch(error=>{console.error(error);process.exitCode=1;});
