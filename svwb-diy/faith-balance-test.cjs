const assert=require('node:assert/strict'),S=require('./engine');
const oneAttack=[{eventId:'attack',every:1,amount:1}];
const profile=(extra={})=>S.faithEngineProfile({eventId:'attack',gainRules:oneAttack,rewardRaw:8.1,faceDamage:3,cost:6,trigger:'超进化时',baseUnlock:6,...extra});
const attack=profile();
assert(attack.cadence>=3,'Repeated face damage must not pay a 3-damage spell for each cheap attack');
assert(attack.unlock>6,'The old six-attack quest was already complete before deployment');
assert(attack.raw*attack.priceFactor>20,'A permanent face engine must not cost only 6.48 points');
assert(attack.priceFactor>=.9,'Super-evolution does not make a permanent engine disposable');
const slow=profile({gainRules:[{eventId:'attack',every:3,amount:1}]});
assert(slow.expectedUnlockTurn>attack.expectedUnlockTurn);
const compound=profile({gainRules:[...oneAttack,{eventId:'play',every:1,amount:1}]});
assert(compound.unlock>attack.unlock,'Two gain routes must not make the same strong unlock almost free');
for(const eventId of ['play','draw','enter','attack','spell','death','crystalHands','selfDamage','fairy','return','heal']){
 const p=profile({eventId,gainRules:[{eventId,every:1,amount:1}]});assert(p.cadence>=3);assert(p.priceFactor>=.72);assert(p.repeats>=3);
}
const c=S.generate('随机卡牌#32258289');
assert(!c.faiths.some(f=>f.upgrade?.effects.includes('face')&&f.upgrade.cadence===1));
assert(c.spent<=c.budget+.011);
console.log('PASS: persistent pricing, face cadence, acquisition difficulty, compound routes and reported seed.',attack);
