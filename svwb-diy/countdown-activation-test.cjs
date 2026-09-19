const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
let state=479;
const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
const byClass=Array(8).fill(0),pairs={},examples={};let soil=0;
for(let cls=0;cls<8;cls++)for(let i=0;i<400;i++){
 const name=S.randomMatchingName({class:cls,type:'amulet'},{random}),c=S.generate(name);
 assert.equal(c.class,cls);assert.equal(c.type,'amulet');
 assert(c.spent<=c.budget+.02,name+' budget');assert(c.abilities.length<=5);
 const a=c.abilities.find(a=>a.ids.includes('countdownAct'));
 if(c.abilities.some(a=>a.ids.includes('earthSigil'))){soil++;assert(!a);}
 if(!a)continue;
 byClass[cls]++;const {fee,countdownReduction:y,credit,oncePerTurn}=a.activation;
 assert(oncePerTurn);assert(fee>=1&&fee<=3);assert(y>=1&&y<=3&&y<=c.countdown);
 assert(c.abilities.some(a=>a.trigger==='谢幕曲'));assert.equal(credit,fee*2.2);
 assert.equal(a.price,Math.max(.25,a.raw-credit));
 assert.equal(a.text,`费用${fee}【启动】本护符的倒计数-${y}。`);
 const key=fee+':'+y;pairs[key]=(pairs[key]||0)+1;examples[key]??=name;
 assert.deepEqual(c,S.generate(name));
}
assert(soil>0);assert(byClass[6]>byClass.reduce((s,n,i)=>s+(i===6?0:n),0));
assert(pairs['1:2']>0&&pairs['2:3']>0&&pairs['1:1']>0);
const report={version:S.VERSION,samples:3200,byClass,pairs,examples};
fs.writeFileSync(__dirname+'/countdown-activation-validation.json',JSON.stringify(report,null,2)+'\n');console.log(report);
