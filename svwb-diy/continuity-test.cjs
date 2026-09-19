const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine'),checkNodes=require('./assert-node-effects.cjs');
const a=(trigger,...ids)=>({trigger,ids});
assert.equal(S.continuityWeight([a('入场曲','draw')],['draw'],'进化时'),2.2);
assert.equal(S.continuityWeight([a('进化时','draw')],['draw'],'入场曲'),2.2);
assert.equal(S.continuityWeight([a('入场曲','damage')],['aoe'],'进化时'),1.6);
assert.equal(S.continuityWeight([a('入场曲','draw')],['draw'],'入场曲'),1);
assert.equal(S.continuityWeight([a('入场曲','damage')],['heal'],'进化时'),1);
assert.equal(S.continuityWeight([{trigger:'与本卡牌融合时',ids:['fusionEvent:experimentSummon'],fusionEvent:{effects:['experimentSummon']}}],['experimentSummon'],'入场曲'),2.2);
const repriced=S.generate('校验种子20001');assert(repriced.attack+repriced.health+repriced.spent<=repriced.budget+.02);
const counts={cards:0,repeated:0},pairs={},examples={};
for(let i=0;i<10000;i++){
 const c=S.generate('思路贯通'+i);counts.cards++;checkNodes(c);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 assert(c.abilities.length<=5);
 const seen=new Map();let repeated=false;
 for(const a of c.abilities)for(const id of a.fusionEvent?.effects||a.ids){
  if(seen.has(id)&&seen.get(id)!==a.trigger){
   repeated=true;const pair=id+':'+seen.get(id)+'→'+a.trigger;pairs[pair]=(pairs[pair]||0)+1;examples[pair]??=c.name;
  }
  seen.set(id,a.trigger);
 }
 if(repeated)counts.repeated++;
 if(i%100===0)assert.deepEqual(c,S.generate(c.name));
}
assert(counts.repeated>50);assert(Object.keys(pairs).some(k=>k.startsWith('draw:')));assert(Object.keys(pairs).some(k=>k.startsWith('tokenSummon:')||k.startsWith('summon:')));
const report={version:S.VERSION,counts,pairs,examples};fs.writeFileSync(__dirname+'/continuity-validation.json',JSON.stringify(report,null,2)+'\n');console.log({version:S.VERSION,counts,pairTypes:Object.keys(pairs).length,examples:Object.entries(examples).slice(0,10)});
