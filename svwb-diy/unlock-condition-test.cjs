const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const counts={superUnlocked:0,evolutionUnlocked:0,modifier:0,evolutionHistory:0,overflow:0,ppFull:0},types=new Set(),payoffs=new Set(),examples={};
for(let i=0;i<15000;i++){
 const c=S.generate('解禁条件'+i,{chaos:i%4===0});
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 for(const a of [...c.abilities,...c.alternateForms.flatMap(f=>f.abilities||[])]){
  if(['evolutionHistory','overflow','ppFull'].includes(a.condition))counts[a.condition]++;
  if(['overflow','ppFull'].includes(a.condition))assert.equal(c.class,4);
  const id=a.condition;
  if(['superUnlocked','evolutionUnlocked'].includes(id)){
   counts[id]++;types.add(c.type);a.ids.forEach(v=>payoffs.add(v));
   assert(a.text.includes(`若为${id==='superUnlocked'?'超进化':'进化'}已解禁的回合，则`));
   assert.notEqual(a.trigger,'超进化时');
   if(id==='evolutionUnlocked')assert.notEqual(a.trigger,'进化时');
   assert(c.cost<(id==='superUnlocked'?6:4));
   assert(!/剩余.*进化点|至少.*进化点/.test(a.bodyText));
   examples[id]??={name:c.name,chaos:!!c.chaos,text:a.text};
   examples[c.type]??={name:c.name,chaos:!!c.chaos,text:a.text};
  }
  const d=a.acquisitionDiscount;
  if(d&&['superUnlocked','evolutionUnlocked'].includes(d.condition)){
   counts.modifier++;assert(d.factor>=.5&&d.factor<1);
   assert.notEqual(d.condition,id);assert.notEqual(a.trigger,'超进化时');
   if(d.condition==='evolutionUnlocked'){assert.notEqual(id,'superUnlocked');assert.notEqual(a.trigger,'进化时');}
   assert.equal(d.extraRaw,d.count*d.discount*1.25*d.factor);
  }
 }
 if(i<50)assert.deepEqual(c,S.generate(c.name,{chaos:i%4===0}));
}
for(const [id,n]of Object.entries(counts))assert(n>0,id+' unreachable');
assert.equal(types.size,3);assert(payoffs.size>=5,'Unlock gates must compose with varied effects');
const report={version:S.VERSION,samples:15000,counts,types:[...types],payoffs:[...payoffs],examples};
fs.writeFileSync(__dirname+'/unlock-condition-validation.json',JSON.stringify(report,null,2)+'\n');console.log(report);
