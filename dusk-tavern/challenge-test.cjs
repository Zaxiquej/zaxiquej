'use strict';
const A=require('node:assert/strict'),E=require('./engine'),D=require('./data'),S=require('./selfplay');
const h=D.heroes.find(h=>h.id==='challenge');A.equal(h.armor,0);A(h.passive&&h.challenge);A.equal(h.leaderId,'105');A(require('fs').existsSync(h.art));
for(let seed=1;seed<=70;seed++){
 const tribes=E.rollTribes(seed),s=E.create('challenge',seed,'hard',tribes);A.equal(s.hp,40);A.equal(s.armor,0);A(E.validate(s));A(s.opponents.every(p=>p.hero!=='challenge'));const offered=E.rollHeroes(seed,tribes);A.equal(offered.length,4);A(!offered.includes('challenge'));A(S.create({seed}).state.opponents.every(p=>p.hero!=='challenge'));
}
for(let tier=1;tier<=5;tier++)for(const discount of [-1,0,2,20]){
 const s=E.create('challenge',812,'hard',['royal','dragon','forest','night']);s.tier=tier;s.discount=discount;const normal={...s,hero:'angel'},price=E.upgradeCost(normal)+1;A.equal(E.upgradeCost(s),price);s.gold=price-1;A(!E.act(s,'upgrade').ok);s.gold=price;A(E.act(s,'upgrade').ok);A.equal(s.gold,0);A.equal(s.tier,tier+1);A(E.validate(s));
}
{
 const s=E.create('challenge',19);const original=E.copy(s);A(!E.act(s,'power').ok);A.deepEqual(s,original);s.tier=6;A.equal(E.upgradeCost(s),0);A(!E.act(s,'upgrade').ok);const loaded=E.normalize(E.copy(s));A(E.validate(loaded));A.equal(loaded.hero,'challenge');A.equal(loaded.armor,0);
}
console.log('PASS fixed-only official challenge hero, 40 HP/0 armor, four ordinary offers, no AI selection, all-tier exact +1 pricing including zero-cost floor, real payment, passive rejection and save reload.');
