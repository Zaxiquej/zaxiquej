const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine'),check=require('./assert-node-effects.cjs');
// Independent package examples: an 8-PP 7/5 Storm anchor cannot simply
// acquire a repeatable discount. A small late Storm body still can.
const storm={kind:'keyword',trigger:'',condition:'none',ids:['疾驰'],price:0,raw:0,text:'【疾驰】'};
const engine=(cost,payoff)=>({ids:[payoff==='growth'?'spellboostGrowth':'spellboostDiscount'],price:4,raw:7,text:'',scaling:S.scalingPlan(cost,'follower','spellboost',payoff)});
const packageAt=(cost,a,h,payoff)=>S.scalingStormValue({cost,attack:a,health:h,abilities:[storm,engine(cost,payoff)]});
let p=packageAt(8,7,5,'discount');assert(p.value>p.limit);
p=packageAt(8,2,2,'discount');assert(p.value<p.limit);
p=packageAt(3,2,2,'growth');assert(p.value>p.limit);
const fastTen=S.scalingPlan(10,'follower','spellboost','discount');
assert(fastTen.rapid&&fastTen.landingCost<=5,'Rapid 10-PP discount is evaluated as an early play');
p=packageAt(10,5,5,'discount');assert(p.value>p.limit,'Large Storm cannot use the 10-PP allowance when played much earlier');
assert.equal(p.limit,fastTen.landingCost+1,'Pressure check uses attainable PP, not the more generous setup-adjusted budget');
assert(S.keywordPrice('疾驰',7,5)>S.keywordPrice('疾驰',2,2)*3);
// Slow conditional end-step discounts must not receive the fast-engine cap.
assert.equal(S.scalingPlan(8,'follower','lowHealth','discount',2).budgetCap,null);
assert(S.scalingPlan(8,'follower','leave','discount',4).budgetCap<S.scalingPlan(8,'follower','leave','discount',2).budgetCap);
// Official anchors from the 2026-09-24 snapshot: acquisition has a setup cost;
// this is not valuation at zero PP, nor the full printed-PP budget.
const official=JSON.parse(fs.readFileSync(__dirname+'/reference.json','utf8'));
const refs=[10132120,10532120,10032120,10434110,10914120,10634120,10954120].map(id=>official.cards.find(c=>Number(c.id)===id));
assert(refs.every(Boolean));
assert.equal(refs[0].attack,2);assert.equal(refs[0].health,2);
assert.equal(refs[3].attack,0);assert.equal(refs[3].health,1);
const large=S.scalingPlan(10,'follower','spellboost','discount');
assert(S.scalingBodyCap(large,large.budgetCap-(2+large.expected*.6))>=14,'Official 10-PP 8/6 discount vanilla remains feasible');
assert(S.scalingBodyCap(large,large.budgetCap-(2+large.expected*.6)-9)<14,'Large discount body cannot retain a second full payoff');
const counts={engines:0,growth:0,discount:0,slow:0,storm:0,types:{},events:{}};
const examples={};
for(let i=0;i<12000;i++){
 const opts={chaos:i>=9000},c=S.generate('减费复核516-'+i,opts);check(c);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.025,c.name+' budget');
 const engines=c.abilities.filter(a=>a.scaling);
 assert(engines.length<=1,c.name+' duplicate repeat engine');
 if(!engines.length)continue;
 counts.engines++;counts.types[c.type]=(counts.types[c.type]||0)+1;
 const e=engines[0],s=e.scaling;counts[s.payoff]++;if(s.slow)counts.slow++;
 counts.events[s.eventId]=(counts.events[s.eventId]||0)+1;
 if(s.budgetCap!=null)assert(c.budget<=s.budgetCap+.025,c.name+' engine budget bypass');
 if(c.type==='follower'&&s.bodyCap!=null)assert(c.attack+c.health<=s.bodyCap,c.name+' body reserve bypass');
 if(c.type==='follower'&&s.bodySoftCap!=null)assert(c.attack+c.health<=S.scalingBodyCap(s,c.budget-c.spent+.025),c.name+' discounted body/payload trade');
 if(c.abilities.some(a=>a.ids.some(id=>['疾驰','handStorm'].includes(id)))){
   counts.storm++;const v=S.scalingStormValue(c);assert(v.value<=v.limit+1e-8,c.name+' scaled Storm package');
 }
 if(!examples[s.eventId+':'+s.payoff])examples[s.eventId+':'+s.payoff]={name:c.name,cost:c.cost,body:[c.attack,c.health],abilities:c.abilities.map(a=>a.text),chaos:!!opts.chaos};
 if(i%19===0)assert.deepEqual(c,S.generate(c.name,opts));
}
assert(counts.growth>20);assert(counts.discount>40);assert(counts.storm>0);assert(counts.slow>10);
assert(counts.events.leave>0&&counts.events.play>0&&counts.events.crystalHands>0&&counts.events.hurt>0);
fs.writeFileSync(__dirname+'/discount-validation.json',JSON.stringify({version:S.VERSION,seeds:12000,counts,examples,officialReferences:refs},null,2));
console.log({version:S.VERSION,seeds:12000,counts,examples});
