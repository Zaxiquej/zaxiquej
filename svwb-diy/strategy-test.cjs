const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const tags=(ids,tokens=[])=>S.strategyTags({abilities:[{ids,tokens}]});
assert.deepEqual(tags(['tokenSummon'],[S.TOKENS.find(t=>t.name==='天晶魔手')]),['crystalHands']);
assert.deepEqual(tags(['experimentBuff']),['experiment']);
assert.deepEqual(S.strategyTags({abilities:[{kind:'alternate',ids:['experimentSupply']}],tokens:[{id:10931110}]}),[],'Reference/alternate tokens must not define the main body theme');
assert.equal(S.strategyAffinity(['experiment'],[]),1,'Utility stays available');
assert(S.strategyAffinity(['experiment'],['experiment'])>1);
assert(S.strategyAffinity(['earth'],['spellboost'])>1,'Connected second plan stays available');
assert(S.strategyAffinity(['experiment'],['crystalHands'],true)<.05);
assert(S.strategyAffinity(['earth'],['experiment'])>0,'Second themes are weighted, not forbidden');
assert(S.strategyAffinity(['earth','spellboost'],['experiment'])<S.strategyAffinity(['earth'],['experiment']));
const counts={alternate:0,themed:0,shared:0,utility:0,disconnected:0,tokenConflict:0,multiPlan:0},examples={};
for(let i=0;i<20000;i++){
 const c=S.generate('体系衔接'+i,{chaos:i%3===0}),context=S.strategyTags(c);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 if(context.length>=2)counts.multiPlan++;
 for(const f of c.alternateForms.filter(f=>f.kind==='激奏')){
  counts.alternate++;assert.deepEqual(f.strategyContext,context,'Alternate must see final main-body abilities');
  assert.equal(f.budget,f.cost*2.4+.4);assert(f.spent<=f.budget+.01);
  const own=S.strategyTags({abilities:f.abilities}),affinity=S.strategyAffinity(context,own,true);
  if(!context.length)continue;counts.themed++;
  const kind=!own.length?'utility':affinity>=1?'shared':'disconnected';counts[kind]++;examples[kind]??=c.name;
  if(context.includes('experiment')&&own.includes('crystalHands')||context.includes('crystalHands')&&own.includes('experiment'))counts.tokenConflict++;
 }
 if(i<80)assert.deepEqual(c,S.generate(c.name,{chaos:i%3===0}));
}
assert(counts.themed>50&&counts.shared>5&&counts.utility>20&&counts.multiPlan>100);
assert(counts.disconnected/counts.themed<.2,'Alternate forms should mostly share/support the main plan or provide utility');
assert(counts.tokenConflict/counts.themed<.02);
const report={version:S.VERSION,samples:20000,counts,examples};fs.writeFileSync(__dirname+'/strategy-validation.json',JSON.stringify(report,null,2)+'\n');console.log(report);
