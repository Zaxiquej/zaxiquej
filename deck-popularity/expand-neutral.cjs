// Add neutral + class combinations from complete cached evidence, never partial samples.
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const E=require('./engine.js');
const {images,buildExpanded,availableCards,query}=require('./expand-small.cjs');
const {state,save}=require('./collect.cjs');
function makeQueries(cards){
  const rows=[];
  for(let classId=1;classId<=7;classId++){
    const observed=new Map();
    for(const deck of Object.values(state.decks).filter(d=>d.classId===classId)){
      const ids=Object.keys(deck.quantities).map(Number).filter(id=>cards[id]?.classId===classId||cards[id]?.classId===0).sort((a,b)=>a-b);
      const add=combo=>{
        if(!combo.some(id=>cards[id].classId===0)||!E.legalClassCombination(combo,classId,cards))return;
        const id=`${classId}:${combo.join(',')}`;
        if(!observed.has(id))observed.set(id,{id,classId,cards:combo,frequency:0});
        observed.get(id).frequency++;
      };
      for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
        add([ids[i],ids[j]]);
        for(let k=j+1;k<ids.length;k++)add([ids[i],ids[j],ids[k]]);
      }
    }
    for(const [length,target] of [[2,20],[3,10]]){
      const candidates=[...observed.values()].filter(c=>c.cards.length===length&&c.frequency>=2),used=new Map();
      for(let i=0;i<target&&candidates.length;i++){
        const priority=c=>c.frequency/(1+c.cards.reduce((n,id)=>n+(used.get(id)||0),0)*.2);
        candidates.sort((a,b)=>priority(b)-priority(a)||a.id.localeCompare(b.id));
        const c=candidates.shift();rows.push({id:c.id,classId,cards:c.cards});
        c.cards.forEach(id=>used.set(id,(used.get(id)||0)+1));
      }
    }
  }
  return rows;
}
async function main(){
  const file=path.join(__dirname,'data.js'), ctx={window:{}};
  vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx);
  const previous=ctx.window.DECK_POPULARITY_DATA, known=new Set(previous.combos.map(c=>c.id));
  await images(0);
  if(process.argv.includes('--query')){
    state.neutralQueries ||= makeQueries(availableCards());save();
    let cursor=0,done=0,stopped=false;
    console.log(`Verifying ${state.neutralQueries.length} observed neutral/class pairs and triples; cached frequency only selects queries.`);
    const worker=async()=>{while(!stopped&&cursor<state.neutralQueries.length){const row=state.neutralQueries[cursor++];try{await query(row.classId,row.cards);if(++done%20===0)console.log(`Verified ${done}/${state.neutralQueries.length}`);}catch(error){stopped=true;throw error;}}};
    const results=await Promise.allSettled(Array.from({length:3},()=>worker()));
    const failure=results.find(r=>r.status==='rejected');if(failure)throw failure.reason;
  }
  const {data:expanded,evidence}=buildExpanded();
  const additions=expanded.combos.filter(c=>c.cards.some(id=>expanded.cards[id].classId===0)&&(!known.has(c.id)||state.neutralQueries?.some(row=>row.id===c.id)));
  for(const c of additions){
    const p=evidence[c.pool];
    if(!E.legalClassCombination(c.cards,c.classId,expanded.cards)||c.count>0&&!c.examples.length)throw Error('Invalid neutral combination: '+c.id);
    if(c.method==='search'){
      if(!state.exampleQueries[c.id]||!Number.isInteger(c.count)||c.count<0||typeof c.capped!=='boolean')throw Error('Missing direct query evidence: '+c.id);
    }else if(c.method!=='complete-subset'||!p||p.decks.length!==p.count||new Set(p.baseCards).size!==p.baseCards.length||!p.baseCards.every(id=>c.cards.includes(id))||p.decks.filter(d=>E.contains(d,c.cards)).length!==c.count)throw Error('Invalid neutral evidence: '+c.id);
  }
  const combined=new Map(previous.combos.map(c=>[c.id,c]));additions.forEach(c=>combined.set(c.id,c));
  const combos=[...combined.values()], used=new Set(combos.flatMap(c=>c.cards));
  const data={...previous,generatedAt:new Date().toISOString(),cards:Object.fromEntries([...used].map(id=>[id,expanded.cards[id]])),combos};
  if(E.buildCatalog(data).total!==combos.length)throw Error('Invalid neutral catalog');
  fs.writeFileSync(path.join(__dirname,'evidence.json'),JSON.stringify(evidence));
  fs.writeFileSync(file+'.tmp','/* Verified class and neutral combinations from complete official snapshots. */\nwindow.DECK_POPULARITY_DATA = '+JSON.stringify(data)+';\n');
  fs.renameSync(file+'.tmp',file);
  console.log(JSON.stringify({added:additions.length,total:combos.length,neutralCards:Object.values(data.cards).filter(c=>c.classId===0).length,byClass:Array.from({length:7},(_,i)=>({classId:i+1,added:additions.filter(c=>c.classId===i+1).length}))}));
}
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1;});
