const assert=require('node:assert/strict'),S=require('./engine');
for(const id of Object.keys(S.HISTORY_TASKS))for(const cost of [1,3,6,10]){
  const values=S.HISTORY_TASKS[id].values;
  const gates=values.map(n=>S.historyTaskGate(id,n,cost));
  for(let i=1;i<gates.length;i++){
    assert(gates[i].factor<=gates[i-1].factor,'Harder milestone cannot buy less payoff');
    assert(gates[i].minRaw>=gates[i-1].minRaw,'Harder milestone must retain a meaningful reward floor');
  }
  assert(gates.every(g=>g.extra===0),'History is not a paid resource');
  const seen=new Set();for(let i=0;i<1000;i++)seen.add(S.rollHistoryTask(()=>(i+.5)/1000,id,cost).requirement);
  assert.deepEqual([...seen],values);
  assert(S.historyTaskGate(id,values[0],10).factor>=gates[0].factor,'Easy late-game gates earn less credit');
}
for(const base of [2,3,4,5]){
  const seen=new Set();for(let i=0;i<1000;i++)seen.add(S.rollProgressThreshold(()=>(i+.5)/1000,base));
  assert(seen.size>=3,'Transformation tasks must have more than a fixed threshold and +1');
  for(const event of ['play','earth','rally','evolutions','deaths','artifacts']){
    let previous=null;
    for(const n of seen){
      const value=S.transformationTaskValue(event,n,4,2);
      if(previous){assert(value.minimumGain>=previous.minimumGain);assert(value.factor<=previous.factor);}
      previous=value;
    }
  }
}
assert(S.TOKENS.find(t=>t.name==='沉溺的实验体').text.includes('5张或以上'),'Official token text is unchanged');
const found=Object.fromEntries(Object.keys(S.HISTORY_TASKS).map(id=>[id,{}]));let tested=0;
for(let i=0;tested<10000;i++){
  const name='任务门槛回归'+i;
  const c=S.generate(name);tested++;
  assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,name);
  for(const a of c.abilities)if(found[a.condition]&&a.conditionAmount){
    const amount=a.conditionAmount;
    found[a.condition][amount]=(found[a.condition][amount]||0)+1;
    assert(amount>0);assert(a.text.includes(String(amount)));
  }
  if(tested%300===0)assert.deepEqual(c,S.generate(name));
}
console.log(JSON.stringify({version:S.VERSION,tested,found}));
assert(found.experimentHistory[2]&&found.experimentHistory[3],'Small experimental milestones occur in actual cards');
assert(found.rally[3]&&found.rally[5]&&found.rally[7],'Intermediate Rally milestones occur in actual cards');
for(const id of ['spells','amuletHistory','artifact','artifactKinds','evolutionHistory','board','amulet'])assert(Object.keys(found[id]).length>=2,id+' varies in generated cards');
