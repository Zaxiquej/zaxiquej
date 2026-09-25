const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const counts={ahead:0,behind:0,highest:0,lowest:0,transforms:0,spellTransform:0,spellboost:0,earth:0,paidDraw2:0,plainCheapSpells:0},examples={},events=new Set();
const eventClasses={evolutions:0,play:1,rally:2,enhance:2,spellboost:3,earth:3,hurt:4,discard:4,leaderHurt:5,deaths:5,amuletDeath:6,artifacts:7,fusion:7};
for(let i=0;i<18000;i++){
 const c=S.generate('新机制核对'+i),sample=key=>{examples[key]??={name:c.name,chaos:false};};
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 assert(c.abilities.length<=5);require('./assert-node-effects.cjs')(c);
 if(c.type==='spell'&&c.cost<=2)counts.plainCheapSpells++;
 for(const a of c.abilities){
  if(['leaderHealthAhead','leaderHealthBehind'].includes(a.condition)){
   assert([4,5].includes(c.class));const key=a.condition==='leaderHealthAhead'?'ahead':'behind';counts[key]++;sample(key);
   assert(a.text.includes(`主战者的生命值${key==='ahead'?'大于':'小于'}对手的主战者的生命值`));
   assert(!a.ids.includes(key==='ahead'?'highestLeaderDamage':'lowestLeaderDamage'));
  }
  for(const [id,key,word]of [['highestLeaderDamage','highest','最大'],['lowestLeaderDamage','lowest','最小']])if(a.ids.includes(id)){
   counts[key]++;sample(key);assert([4,5].includes(c.class));assert(a.text.includes(`生命值${word}的所有主战者`));
  }
  if(c.type==='spell'&&c.cost<=2&&a.trigger==='法术'&&a.condition==='none'&&a.ids.includes('draw')&&/抽取[2-9]张卡牌/.test(a.text)){
   assert(a.ids.includes('handCostUp')||a.drawback,c.name+' unconditional cheap draw2');counts.paidDraw2++;
  }
 }
 const p=c.progressTransform;if(!p)continue;
 counts.transforms++;events.add(p.eventId);assert.equal(c.class,eventClasses[p.eventId]);
 if(c.type==='spell'){counts.spellTransform++;sample('spellTransform');}
 if(['earth','spellboost'].includes(p.eventId)){counts[p.eventId]++;sample(p.eventId);}
 const a=c.abilities.find(a=>a.kind==='progressTransform'),t=c.tokens.find(t=>t.id===p.targetId);
 assert(t?.upgrade&&t.custom);assert.equal(t.class,c.class);assert.equal(t.type,c.type);assert.equal(t.cost,c.cost-p.discount);assert(t.cost>=1);
 assert.equal(p.baseText,c.abilities.filter(a=>a.kind!=='progressTransform').map(a=>a.text).join('\n\n'));
 assert.equal(t.text,t.abilities.map(a=>a.text).join('\n\n'));assert(['augment','amplify','promote','engine'].includes(p.style));assert(!t.text.includes(`变身为『${t.name}』`),'No transformation loop');
 if(c.type==='follower')assert.deepEqual([t.attack,t.health],[c.attack,c.health]);
 assert(Math.abs(a.price-(p.discountRaw+p.bonusRaw*p.replayMultiplier)*p.factor)<1e-8);
 assert(a.text.includes('X起始为0。'));assert(a.text.includes(`若X为${p.threshold}或以上`));
 assert.deepEqual(c,S.generate(c.name));
}
for(const key of ['ahead','behind','highest','lowest','transforms','spellTransform','spellboost','earth','plainCheapSpells'])assert(counts[key]>0,key+' unreachable');
assert(events.size>=8);
const report={version:S.VERSION,samples:18000,counts,events:[...events],examples};fs.writeFileSync(__dirname+'/health-transform-validation.json',JSON.stringify(report,null,2)+'\n');console.log(report);
