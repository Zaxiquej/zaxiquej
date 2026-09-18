const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),{createRequire}=require('node:module'),S=require('./engine');
const baselinePath=process.env.SVWB_BODY_BASELINE;
let old;
if(baselinePath){const context={module:{exports:{}},require:createRequire(__filename)};vm.runInNewContext(fs.readFileSync(baselinePath,'utf8'),context);old=context.module.exports;}
const counts={2:0,3:0,4:0},losses={},examples={};let doubled=0,checkedStable=0;
const strip=c=>JSON.parse(JSON.stringify(c,(key,value)=>['version','boardValue','boardBodyTrade','bodyAllowance','attack','health'].includes(key)?undefined:value));
for(let i=0;i<40000;i++){
 const c=S.generate('低费身材'+i);
 if(old&&i<2500){
  const before=old.generate(c.name);assert.deepEqual(strip(c),strip(before),'Only body correction, not reshuffled abilities');
  if(!c.boardBodyTrade)assert.deepEqual([c.attack,c.health],[before.attack,before.health]);
  else assert.equal(before.attack+before.health-c.attack-c.health,c.boardBodyTrade.lost);
  checkedStable++;
 }
 if(c.type!=='follower')continue;
 assert(c.attack>=0&&c.health>=1&&c.attack+c.health+c.spent<=c.budget+.011);if(c.attack===0)assert(c.zeroAttackTrade&&c.cost<=3);
 const fans=c.abilities.filter(a=>a.trigger==='入场曲'&&(a.boardValue||0)>0);
 if(c.boardBodyTrade){
  const t=c.boardBodyTrade;assert(c.cost>=2&&c.cost<=4&&fans.length>0);assert(t.lost<= (c.cost===4?1:2));
  assert(!c.bodyTrade,'Existing substantial body trades must not pay twice');
  counts[c.cost]++;losses[c.cost+':'+t.lost]=(losses[c.cost+':'+t.lost]||0)+1;examples[c.cost]??=c.name;
 }
 if(c.cost>=5||!fans.length)assert(!c.boardBodyTrade);
 // Two unconditional, modest immediate board effects at 2 PP must pay two stats.
 if(c.cost===2&&fans.length>=2&&fans.every(a=>a.condition==='none'&&a.kind!=='mode')&&fans.reduce((n,a)=>n+a.boardValue,0)>=3.3){
  assert.deepEqual([c.attack,c.health],[1,1]);doubled++;examples.double??=c.name;
 }
}
assert(counts[2]>30&&counts[3]>30&&counts[4]>10&&doubled>0);
const report={version:S.VERSION,counts,losses,doubled,checkedStable,examples};fs.writeFileSync(__dirname+'/body-validation.json',JSON.stringify(report,null,2));
console.log('PASS: restrained low-cost board trades, 2 PP double payoff becomes 1/1, no repeated body penalty, high costs unchanged.');console.log(report);
