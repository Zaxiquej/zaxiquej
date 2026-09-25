const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine'),C=require('./calibration');
assert.equal(C.rarityPriors.spell[3],1);assert.equal(C.rarityPriors.amulet[3],0);
assert(S.healValue(2,2)+4*1.25>7.4,'Two-cost damage four plus heal two exceeds the ordinary spell allowance');
assert(S.healValue(1,4)>S.healValue(7,4));
const counts={resurrection:0,fairy:0,existing:0,evolutionTrade:0,protectedStart:0,endCycle:0,rainbow:0,identity:0},families=new Set(),resurrectionCosts=new Set();
for(let i=0;i<18000;i++){
 const opts={chaos:i>=14000},c=S.generate('结构回归499-'+i,opts);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.025,c.name+' budget');
 require('./assert-node-effects.cjs')(c);
 if(i<60)assert.deepEqual(c,S.generate(c.name,opts));
 if(c.rarity===3){counts.rainbow++;if(S.designIdentity(c))counts.identity++;}
 if(c.evolutionBodyTrade){counts.evolutionTrade++;const a=c.abilities.find(a=>a.kind==='evolutionSacrifice');assert(!a.ids.includes('buff'));a.ids.forEach(id=>families.add(id));}
 if(c.type==='follower'&&c.abilities.some(a=>a.trigger==='自己的回合开始时')){
  assert(c.abilities.some(a=>a.ids.some(id=>['潜行','威慑','屏障','damageCap','abilityDestructionImmune'].includes(id))),c.name+' vulnerable turn-start engine');counts.protectedStart++;
 }
 if(c.abilities.some(a=>a.kind==='cycle'&&a.trigger==='自己的回合结束时'))counts.endCycle++;
 for(const a of c.abilities){
  if(a.ids.includes('resurrectSelf')){
   counts.resurrection++;assert([3,5].includes(c.class));assert.equal(a.trigger,'谢幕曲');assert(!a.text.includes('失去【谢幕曲】'));
   assert(a.resurrection.finalValuation);assert(a.resurrection.amount>=2);resurrectionCosts.add(a.resurrection.material);
   const v=a.resurrection;assert(Math.abs(a.raw-(v.body+v.retained*.7+2)*v.repeats)<1e-8);
   assert(!c.abilities.some(a=>a.ids.includes('selfCopy')));
  }
  if(/妖精·随从/.test(a.text)){counts.fairy++;assert.equal(c.class,1);}
  if(/召唤.*『(?:年幼宝石兽|温厚的树精)』/.test(a.text)){counts.existing++;assert(c.tokens.some(t=>[10112130,10011130].includes(t.id)));}
  if(c.cost<=2&&a.condition==='none'&&a.kind!=='mode'&&['法术','入场曲','谢幕曲'].includes(a.trigger)){
   const heal=[...a.text.matchAll(/回复自己的主战者(\d+)点生命值/g)].map(m=>+m[1]);
   if(c.type==='amulet'&&a.trigger==='谢幕曲')assert(heal.every(n=>n<=c.cost+1),c.name+' no countdown inflation for cheap healing');
   if(c.type==='spell'&&a.trigger==='法术')assert(heal.every(n=>n<=c.cost+1));
  }
 }
}
assert(counts.resurrection>=10&&counts.fairy>=10&&counts.existing>=10);
assert(resurrectionCosts.size===3);assert(counts.evolutionTrade>0&&families.size>=4);assert(counts.endCycle>0&&counts.protectedStart>0);
assert(counts.identity/counts.rainbow>.8,'Most rainbows need a defining mechanism, not just more small effects');
const report={version:S.VERSION,samples:18000,counts,evolutionFamilies:[...families],resurrectionCosts:[...resurrectionCosts]};
fs.writeFileSync(__dirname+'/design-499-validation.json',JSON.stringify(report,null,2));console.log('PASS',report);
