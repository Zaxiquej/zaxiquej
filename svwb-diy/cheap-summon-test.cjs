const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const counts={oneCost:0,immediateFollower:0,deathFollower:0,fullTokenSpell:0,handSupply:0,conditional:0},examples={};
for(let i=0;i<20000;i++){
 const c=S.generate('低费铺场'+i);if(c.cost!==1)continue;counts.oneCost++;
 assert((c.type==='follower'?c.attack+c.health:0)+c.spent<=c.budget+.02,c.name+' budget');
 for(const a of c.abilities){
  if(a.ids.includes('tokenHand'))counts.handSupply++;
  if(!a.ids.some(id=>['tokenSummon','crystalHandSummon'].includes(id)))continue;
  if(a.condition!=='none'||!['法术','入场曲','谢幕曲'].includes(a.trigger)){counts.conditional++;continue;}
  if(c.type==='follower'){
   assert.equal(c.attack,0,c.name);assert.equal(c.health,1,c.name);
   assert(c.zeroAttackTrade?.reason==='cheapSummon');
   if(a.trigger==='入场曲'){
    counts.immediateFollower++;examples.immediateFollower??=c.name;
    for(const t of a.tokens)assert(t.attack+t.health<=2,c.name+' immediate full token');
   }else {counts.deathFollower++;examples.deathFollower??=c.name;}
  }else if(['法术','入场曲'].includes(a.trigger)){
   for(const t of a.tokens){
    assert(t.attack+t.health<=3,c.name+' oversized token');
    if(t.attack+t.health===3){
     counts.fullTokenSpell++;examples.fullTokenSpell??=c.name;
     assert(Math.abs(a.price-c.budget)<1e-8,c.name+' token consumes base budget');
     assert.equal(c.abilities.filter(x=>x.price>0).length,1,c.name+' extra free payoff');
    }
   }
  }
 }
}
for(const [key,count]of Object.entries(counts))assert(count>0,key+' not covered');
const oldSpell=S.generate('低费铺场3'),oldFollower=S.generate('低费铺场1766');
assert(!oldSpell.abilities.some(a=>a.ids.includes('tokenSummon'))||oldSpell.abilities.filter(a=>a.price>0).length===1);
assert(oldFollower.attack===0&&oldFollower.health===1&&oldFollower.abilities.some(a=>a.trigger==='谢幕曲'&&a.ids.includes('tokenSummon')));
assert.deepEqual(S.generate('低费铺场1766'),oldFollower);
fs.writeFileSync(__dirname+'/cheap-summon-validation.json',JSON.stringify({version:S.VERSION,seeds:20000,counts,examples},null,2));console.log('PASS',counts,examples);
