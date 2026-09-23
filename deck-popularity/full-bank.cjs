const E = require('./engine.js');
const keyFor = (classId, cards) => `full3:${classId}:${[...cards].sort((a,b)=>a-b).join(',')}`;
const fullMatch = (quantities, cards) => cards.every(id => quantities[id] >= 3);
function buildBank(state, sourceCards) {
  const combos = new Map();
  const pools = Object.entries(state.pools).sort((a,b)=>b[1].queriedAt.localeCompare(a[1].queriedAt));
  for (const [key,p] of pools) {
    if (!p.baseCards.length || p.baseCards.length > 3 || new Set(p.baseCards).size!==p.baseCards.length || p.baseCards.some(id=>sourceCards[id]?.classId!==p.classId)) continue;
    const decks = p.deckKeys.map(ref=>state.decks[ref]?.quantities);
    if(!Number.isInteger(p.count) || p.count<0 || decks.length!==p.count || new Set(p.deckKeys).size!==p.count || !decks.every(q=>q && p.baseCards.every(id=>q[id]>=1))) throw Error('Incomplete source pool: '+key);
    const extra = Object.values(sourceCards).filter(c=>c.classId===p.classId && !p.baseCards.includes(c.id)).map(c=>c.id);
    const candidates = [[...p.baseCards]];
    if(p.baseCards.length<=2) for(const id of extra) candidates.push([...p.baseCards,id]);
    if(p.baseCards.length===1) for(let i=0;i<extra.length;i++) for(let j=i+1;j<extra.length;j++) candidates.push([...p.baseCards,extra[i],extra[j]]);
    let zeros=0;
    for(const cards of candidates) {
      const id=keyFor(p.classId,cards);
      if(combos.has(id)) continue;
      const matches=p.deckKeys.filter((ref,i)=>fullMatch(decks[i],cards));
      if(!matches.length && zeros++>=8) continue;
      combos.set(id,{id,classId:p.classId,cards:cards.sort((a,b)=>a-b),copies:3,count:matches.length,capped:false,method:'full-complete-subset',pool:key,queriedAt:p.queriedAt,examples:matches.slice(0,3)});
    }
  }
  const rows=[...combos.values()];
  const used=new Set(rows.flatMap(c=>c.cards));
  return {schemaVersion:1,mode:'full',copiesPerCard:3,format:1,generatedAt:new Date().toISOString(),source:'https://shadowverse-wb.com/chs/deck/search/',cards:Object.fromEntries([...used].map(id=>[id,sourceCards[id]])),combos:rows};
}
function validateBank(data,state) {
  if(data.mode!=='full'||data.copiesPerCard!==3) throw Error('Wrong full-playset schema');
  const ids=new Set();
  for(const c of data.combos) {
    if(ids.has(c.id)||c.copies!==3||c.capped||c.cards.length<1||c.cards.length>3||new Set(c.cards).size!==c.cards.length||c.cards.some(id=>data.cards[id]?.classId!==c.classId)) throw Error('Invalid full combination');
    ids.add(c.id);
    const p=state.pools[c.pool];
    if(!p||p.classId!==c.classId||!p.baseCards.length||p.deckKeys.length!==p.count||new Set(p.deckKeys).size!==p.count||!p.baseCards.every(id=>c.cards.includes(id))||!p.deckKeys.every(ref=>state.decks[ref]?.classId===p.classId&&p.baseCards.every(id=>state.decks[ref].quantities[id]>=1))) throw Error('Missing complete evidence');
    const matches=p.deckKeys.filter(ref=>fullMatch(state.decks[ref].quantities,c.cards));
    if(matches.length!==c.count||c.examples.length>3||(c.count>0&&!c.examples.length)||c.examples.some(ref=>!matches.includes(ref))) throw Error('Full-count/example mismatch');
  }
}
function assess(data,target=6000) {
  const classes=Array.from({length:7},(_,i)=>{
    const rows=data.combos.filter(c=>c.classId===i+1&&c.count>0);
    return {classId:i+1,singles:rows.filter(c=>c.cards.length===1).length,pairs:rows.filter(c=>c.cards.length===2).length,triples:rows.filter(c=>c.cards.length===3).length};
  });
  const issues=[];
  if(data.combos.length<target) issues.push(`Total ${data.combos.length}/${target}`);
  const positive=data.combos.filter(c=>c.count>0).length;
  if(positive<Math.ceil(target*.75)) issues.push(`Nonzero ${positive}/${Math.ceil(target*.75)}`);
  for(const c of classes) if(c.singles<8||c.pairs<100||c.triples<200) issues.push(`Class ${c.classId}: ${c.singles}/8 singles, ${c.pairs}/100 pairs, ${c.triples}/200 triples`);
  let seed=230927;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const catalog=E.buildCatalog(data);
  if(catalog.total!==data.combos.length) issues.push('Invalid catalog rows');
  for(const c of classes) {
    if(c.singles<8||c.pairs<100||c.triples<200) continue;
    for(const score of [0,4,8]) {
      const used=new Set();
      try { for(let i=0;i<8;i++) {const q=E.createQuestion(catalog,score,c.classId,used,[],random);used.add(q.signature);} }
      catch {issues.push(`Class ${c.classId}: not enough fair questions at score ${score}`);break;}
    }
  }
  if(!issues.length) for(const score of [12,18,24,30,40,50,60]) {
    const used=new Set();
    try {for(let i=0;i<12;i++){const q=E.createQuestion(catalog,score,0,used,[],random);used.add(q.signature);}}
    catch {issues.push(`Not enough fair mixed-class questions at score ${score}`);break;}
  }
  return {ready:issues.length===0,total:data.combos.length,positive,classes,issues};
}
module.exports={buildBank,validateBank,assess,fullMatch};
