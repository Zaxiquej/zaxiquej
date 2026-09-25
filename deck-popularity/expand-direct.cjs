// Additional independent pairs/triples beyond the complete-pool bases.
const { state, save } = require('./collect.cjs');
const { availableCards, buildExpanded, query, exportExpanded } = require('./expand-small.cjs');
const E = require('./engine.js');
function plan(classId) {
  state.smallExpansion.directPlans ||= {};
  if (state.smallExpansion.directPlans[classId]) return state.smallExpansion.directPlans[classId];
  const known = new Set(buildExpanded().data.combos.map(c => c.id));
  const cards = availableCards();
  const pairs = new Map(), triples = new Map();
  const add = (map, ids) => {
    if (!E.legalClassCombination(ids,classId,cards)) return;
    const id = `${classId}:${ids.join(',')}`;
    if (known.has(id)) return;
    if (!map.has(id)) map.set(id, { cards: ids, frequency: 0 });
    map.get(id).frequency++;
  };
  for (const deck of Object.values(state.decks).filter(d => d.classId === classId)) {
    const ids = deck.cards.filter(id => cards[id]?.classId === classId || cards[id]?.classId === 0).sort((a,b)=>a-b);
    for (let i=0;i<ids.length;i++) for (let j=i+1;j<ids.length;j++) {
      add(pairs,[ids[i],ids[j]]);
      for(let k=j+1;k<ids.length;k++) add(triples,[ids[i],ids[j],ids[k]]);
    }
  }
  const selected = [];
  for (const [map,target] of [[pairs,60],[triples,40]]) {
    const candidates=[...map.values()].filter(c=>c.frequency>=5).sort((a,b)=>b.frequency-a.frequency);
    const usedCards = new Map();
    for(let i=0;i<target && candidates.length;i++) {
      // Favor observed combinations while spreading queries over different cards.
      candidates.sort((a,b)=>b.frequency/(1+b.cards.reduce((n,id)=>n+(usedCards.get(id)||0),0)*.2)-a.frequency/(1+a.cards.reduce((n,id)=>n+(usedCards.get(id)||0),0)*.2));
      const c=candidates.shift(); selected.push(c.cards);
      for(const id of c.cards) usedCards.set(id,(usedCards.get(id)||0)+1);
    }
  }
  state.smallExpansion.directPlans[classId]=selected; save(); return selected;
}
async function main() {
  for(let c=1;c<=7;c++) {
    const rows=plan(c); let done=0;
    for(const ids of rows) {
      await query(c,ids);
      if(++done%25===0) console.log(`Class ${c}: independent pair/triple queries ${done}/${rows.length}`);
    }
    exportExpanded();
  }
}
module.exports={main};
if(require.main===module)main().catch(e=>{save();console.error(e);process.exitCode=1;});
