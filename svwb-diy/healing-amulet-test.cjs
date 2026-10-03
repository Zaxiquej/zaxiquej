const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const amulet=(cost,abilities,extra={})=>({type:'amulet',cost,abilities,countdown:null,...extra});
const engine=(event,raw)=>({kind:'ongoing',condition:'none',ids:['amuletEngine'],raw:30,price:30,engineSpec:{eventId:event,eventRate:1,conditionFactor:1,effects:[{raw}]}});
// Paying a large nominal budget cannot disguise a weak delayed engine.
assert(!S.amuletQuality(amulet(8,[engine('start',4)])));
assert(!S.amuletQuality(amulet(8,[{kind:'effect',trigger:'入场曲',ids:['clearEmblems'],price:11,raw:11}])),'Situational utility is not eleven points of immediate tempo');
assert(!S.amuletQuality(amulet(8,[{kind:'effect',trigger:'入场曲',ids:['clearEmblems'],price:11,raw:11}])),'Situational utility is not eleven points of immediate tempo');
assert(S.amuletReadiness(amulet(6,[engine('end',6)])).score>S.amuletReadiness(amulet(6,[engine('start',6)])).score);
const activation=fee=>({kind:'activation',ids:['damage','activate'],raw:10,price:10,activation:{fee,credit:fee*2.2,breaksSelf:false}});
assert(S.amuletReadiness(amulet(6,[activation(0)])).score>S.amuletReadiness(amulet(6,[activation(3)])).score);
const death={trigger:'谢幕曲',kind:'effect',raw:15,price:10,ids:['tokenSummon']};
assert(S.amuletReadiness(amulet(6,[death],{countdown:1})).score>S.amuletReadiness(amulet(6,[death],{countdown:4})).score);
assert(!S.amuletQuality(amulet(5,[{kind:'handTrigger',scaling:{payoff:'discount',effectiveCost:3.8}}, {kind:'activation',ids:['heal'],raw:1.35,activation:{breaksSelf:true,credit:0}}])));
assert(S.amuletQuality(amulet(6,[{kind:'effect',trigger:'入场曲',price:12,raw:12,ids:['boardWipe']}]))) ;
for(let cost=1;cost<=10;cost++){
 for(let n=1;n<10;n++)assert(S.healValue(cost,n+1)>S.healValue(cost,n));
 assert(S.healValue(cost,8)>2*S.healValue(cost,4),'Large burst healing needs a premium');
}
assert(S.healValue(5,6)>.85*S.healValue(4,6),'No sudden cheap healing at five PP');
let n=0,fail=0,chaos=0;
for(let i=0;n<500;i++){
 const name='护符兑现回归'+i,h=S.header(name);if(h.type!=='amulet'||h.cost<4)continue;
 const options={chaos:n%4===0},c=S.generate(name,options);n++;if(options.chaos)chaos++;
 assert(c.spent<=c.budget+.02);require('./assert-node-effects.cjs')(c);
 if(!S.amuletQuality(c))fail++;
 if(n%100===0)assert.deepEqual(c,S.generate(name,options));
 const death=c.abilities.some(a=>a.trigger==='谢幕曲');
 assert(!death||c.countdown!=null||c.abilities.some(a=>a.activation?.breaksSelf));
 if(c.abilities.some(a=>a.ids.includes('earthSigil')))assert(!c.abilities.some(a=>a.activation?.breaksSelf));
}
// Bounded search may exhaust its attempts; track rather than conceal failures.
assert(fail/n<.01,`Weak amulets after bounded search: ${fail}/${n}`);
const before=require('./healing-amulet-before.json'),after=require('./healing-amulet-after.json');
assert.equal(after.version,S.VERSION);
assert(after.generated.high.mean<before.generated.high.mean*.8);
assert(after.generated.high.over6/after.generated.high.n<.15);
const report={version:S.VERSION,cards:n,chaos,readinessFailures:fail,healing:after.generated};
fs.writeFileSync(__dirname+'/healing-amulet-validation.json',JSON.stringify(report,null,2)+'\n');console.log('PASS',report);
