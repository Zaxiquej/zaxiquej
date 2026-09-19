const assert=require('node:assert/strict'),S=require('./engine');
let followers=0,zero=0,draw=0,other=0;const examples={};
for(let i=0;i<12000;i++){
 const c=S.generate('零攻估值'+i);if(c.type!=='follower')continue;followers++;
 assert(c.attack>=0&&c.health>=1);
 if(c.attack!==0)continue;zero++;
 assert(c.cost<=3&&c.zeroAttackTrade&&c.zeroAttackTrade.lost>0);
 assert.equal(c.bodyAllowance,c.health);
 assert(c.attack+c.health+c.spent<=c.budget+.011);
 assert(c.supportBody||c.abilities.some(a=>a.ids.includes('守护'))||c.abilities.length===5);
 assert(!c.abilities.some(a=>a.kind==='keyword'&&a.ids.some(id=>['疾驰','虹吸','潜行'].includes(id))));
 if(c.abilities.some(a=>a.ids.includes('突进')))assert(c.abilities.some(a=>['攻击时','交战时'].includes(a.trigger)||a.ids.includes('毁灭')));
 if(c.cost===1&&c.abilities.some(a=>a.trigger==='谢幕曲'&&a.condition==='none'&&a.ids.includes('draw'))){draw++;assert.equal(c.health,1);examples.draw??=c.name;}
 if(c.zeroAttackTrade.reason==='strongUtility'){other++;examples.other??=c.name;}
}
assert(zero/followers>.005&&zero/followers<.02,'Zero attack must remain a rare low-cost utility body');
assert(zero<183*.8,'Reduce zero attack from the 4.83 baseline on the same 12,000 seeds');
assert(draw>20&&other>0);
console.log('PASS: rare zero-attack utility followers, 0/1 Ward Last Words draw, health floor, no wasted combat keywords, legal budgets.');console.log({followers,zero,rate:zero/followers,draw,other,examples});
