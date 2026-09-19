const assert=require('node:assert/strict');
const {generate}=require('./engine.js');
const bands=Array.from({length:3},()=>Array.from({length:4},()=>({n:0,length:0})));
let highBronze=0,simple=0,example;
for(let i=0;i<12000;i++){
 const c=generate('稀有度结构'+i),b=bands[c.cost<=3?0:c.cost<=6?1:2][c.rarity];
 b.n++;b.length+=c.abilities.map(a=>a.text).join('').length;
 if(c.type==='follower'&&c.cost>=6&&c.rarity===0)highBronze++;
 // Evolution-sacrifice designs intentionally use a separate simple payoff.
 if(!c.simpleDesign||c.sacrificeDesign)continue;
 simple++;example||=c.name;
 assert.equal(c.type,'follower');assert.equal(c.rarity,0);assert(c.cost>=6);
 const active=c.abilities.filter(a=>a.kind!=='keyword'&&a.kind!=='handTrigger');
 assert((active.length>=1||c.handTrigger)&&active.length<=3,c.name);
 assert(active.every(a=>['入场曲','谢幕曲'].includes(a.trigger)&&a.condition==='none'),c.name);
 assert.equal(c.emblems.length+c.faiths.length+c.alternateForms.length,0);
 const storm=c.abilities.some(a=>a.ids.includes('疾驰'));
 assert((c.corePower>=8||storm)&&c.abilities.some(a=>a.major),c.name);
 assert(c.attack+c.health+c.spent<=c.budget+.01,c.name);
}
assert(simple/highBronze>.6&&simple<=highBronze);
const meanTextLength=bands.map(b=>b.map(v=>v.length/v.n));
for(const means of meanTextLength)for(let r=1;r<4;r++)assert(means[r]>means[r-1]);
console.log('PASS: 12,000 seeds; simple high-cost bronze coverage, payoff, budgets, complexity trend within cost bands.');
console.log({highBronze,simple,example,meanTextLength});
