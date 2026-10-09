const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine'),N=require('./nonfollowers'),check=require('./assert-node-effects.cjs');
const skeleton={type:'amulet',cost:3,countdown:null,abilities:[{kind:'activation',trigger:'启动',ids:['tokenSummon','activate'],raw:1.4,price:1.4,activation:{breaksSelf:true,credit:0}}]};
assert(!N.quality(skeleton),'Three PP for one 1/1 must fail even below four PP');
assert(N.quality({...skeleton,abilities:[{...skeleton.abilities[0],raw:6.6,price:6.6}]}));
assert(!N.quality({...skeleton,abilities:[{...skeleton.abilities[0],raw:6.6,price:.4,activation:{breaksSelf:true,credit:6.6}}]}),'Extra activation PP is not free');
function counter(cost,initial,effectId='damage',extra=[]){return {type:'spell',cost,spent:cost*3,spellboostCounter:{initial,effectId},abilities:[{ids:['spellboostCounter'],raw:5},{ids:[effectId],scalesWith:'spellboostCounter',raw:initial*1.25},...extra]};}
assert(!N.quality(counter(1,1)));assert(N.quality(counter(1,2)));
assert(!N.quality(counter(2,2)));assert(N.quality(counter(2,4)));
assert(N.quality(counter(2,2,'damage',[{ids:['draw'],trigger:'法术',raw:3}])),'Additional useful effects may pay for lower starting damage');
assert(N.quality(counter(2,1,'splitDamage')),'Distributed damage has a different purpose');
const reported=S.generate('真卡#437213');
assert.equal(reported.cost,8);assert.equal(reported.attack,8);assert.equal(reported.health,8);
assert(!reported.alternateForms.some(f=>f.text==='【启动】破坏本卡牌。召唤1个『骸骨士兵』。'));
const counts={followers:0,spells:0,amulets:0,alternate:0,crystallize:0,accelerate:0,retried:0,counters:0,singleCounter:0,splitCounter:0};
const examples={reported};let index=0;
while(counts.followers<1500||counts.spells<650||counts.amulets<350){
 const name='低费兑现回归'+index++,h=S.header(name);
 const group=h.type==='follower'&&h.cost>=5?'followers':h.type==='spell'&&h.class===3&&h.cost<=5?'spells':h.type==='amulet'&&h.cost<=3?'amulets':null;
 if(!group||counts[group]>={followers:1500,spells:650,amulets:350}[group])continue;
 counts[group]++;const options={chaos:counts[group]%4===0},c=S.generate(name,options);check(c);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.025,c.name+' budget');
 assert(N.quality(c),c.name+' nonfollower quality');
 if(counts[group]%200===0)assert.deepEqual(c,S.generate(name,options));
 if(c.spellboostCounter){
  counts.counters++;const p=c.spellboostCounter;counts[p.effectId==='damage'?'singleCounter':'splitCounter']++;
  if(p.effectId==='damage')assert(p.initial>=2);
  examples[p.effectId]??=c;
 }
 for(const f of c.alternateForms){
  if(f.route==='incubate')continue;
  counts.alternate++;counts[f.kind==='结晶'?'crystallize':'accelerate']++;
  if(f.qualityAttempt>0)counts.retried++;
  check(f);assert(f.spent<=f.budget+.025);assert(f.abilities.some(a=>a.trigger));
  assert(N.quality({...f,type:f.kind==='结晶'?'amulet':'spell'}),name+' alternate quality');
  assert.equal(f.text,f.abilities.map(a=>a.text).join('\n\n'));
  assert(c.abilities.some(a=>a.kind==='alternate'&&a.trigger===f.kind));
  for(const t of f.tokens)assert(c.tokens.some(x=>x.id===t.id),'Missing alternate token');
  for(const a of f.abilities)if(a.activation?.breaksSelf)assert(!f.abilities.some(x=>x.ids.includes('earthSigil')));
 }
}
for(const key of ['crystallize','accelerate','singleCounter','splitCounter'])assert(counts[key]>0,key+' unreachable');
fs.writeFileSync(__dirname+'/alternate-floor-validation.json',JSON.stringify({version:S.VERSION,counts,examples},null,2)+'\n');
console.log({version:S.VERSION,counts});
