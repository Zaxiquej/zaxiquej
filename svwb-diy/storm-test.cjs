const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const effects=[{ids:['face','draw'],trigger:'入场曲',condition:'none',text:'对对手的主战者造成3点伤害。抽取2张卡牌。',price:12.5}];
assert(Math.abs(S.stormCardValue(7,5,[]).value-8)<1e-8);
assert(S.stormCardValue(7,5,effects).value>8);
assert(S.stormCardValue(3,5,effects).value<=8);
assert(S.stormCardValue(7,5,effects).value-S.stormCardValue(6,5,effects).value>S.stormCardValue(3,5,effects).value-S.stormCardValue(2,5,effects).value);
let followers=0,storm=0,high=0,paid=0,rejected=0;const examples={};
for(let i=0;i<20000;i++){
 const c=S.generate('疾驰整卡'+i);if(c.type!=='follower')continue;followers++;
 const ability=c.abilities.find(a=>a.ids.includes('疾驰'));
 if(c.stormRejected){rejected++;assert(!ability);assert(c.abilities.some(a=>a.ids.includes('突进')));assert(!c.stormBodyTrade);examples.rejected??=c.name;}
 if(!ability)continue;storm++;
 assert(c.attack>=1&&c.health>=1);assert(c.attack+c.health+c.spent<=c.budget+.011);
 assert(ability.price+1e-8>=S.keywordPrice('疾驰',c.attack,c.health));
 if(c.cost<5)continue;high++;
 const value=S.stormCardValue(c.attack,c.health,c.abilities);assert(value.value<=c.cost+1e-8,c.name+' Storm package exceeds cost');
 assert(c.stormPackageTrade);const t=c.stormPackageTrade;
 assert.equal(t.beforeAttack-c.attack,t.attackLost);assert.equal(t.beforeHealth-c.health,t.healthLost);
 if(t.attackLost+t.healthLost>0){paid++;examples.reduced??=c.name;}
 if(c.cost===8&&c.attack>=7&&c.health>=5)assert(value.effectValue<1e-8,'8 PP 7/5 Storm cannot carry free bonus effects');
}
assert(storm/followers>.045&&storm/followers<.11);
assert(high>100&&paid>50&&rejected>0);
const report={version:S.VERSION,followers,storm,high,paid,rejected,examples};
fs.writeFileSync(__dirname+'/storm-validation.json',JSON.stringify(report,null,2));
console.log('PASS: 8 PP 7/5 benchmark, nonlinear attack/burn value, shared body/effect limit, no health conversion, unaffordable Storm rejected.');console.log(report);
