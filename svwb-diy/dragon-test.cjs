const S=require('./engine'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const app=fs.readFileSync(__dirname+'/app.js','utf8'),ctx={};vm.runInNewContext(app.slice(app.indexOf('function displayAbilities'),app.indexOf('function cardText')),ctx);
let dragons=0,ramp=0,discard=0,early=0;const discardIds=new Set(),types=new Set(),examples={};
for(let i=0;i<30000;i++){
 const c=S.generate('龙族校准'+i);if(c.class===4)dragons++;
 for(const a of c.abilities){
  if(a.ids.includes('ramp')){
   assert.equal(c.class,4);assert(c.cost>=3||a.trigger==='爆能强化');assert.notEqual(a.condition,'ppFull');assert(a.raw>=9);
   ramp++;if(c.cost<=6)early++;examples.ramp??=c.name;
   if(c.type==='follower'&&c.cost<=5&&a.trigger==='入场曲'&&a.condition==='none'){
    assert(c.attack+c.health<=({3:1,4:2,5:4})[c.cost],c.name+' immediate ramp gives too much body');
    assert(c.rampBodyTrade); // A safety ceiling, not a required generated body.
   }
  }
  if(a.condition!=='discard')continue;discard++;types.add(c.type);a.ids.forEach(id=>discardIds.add(id));examples.discard??=c.name;
  assert.equal(c.class,4);const n=a.resourceCost;assert([1,2].includes(n));assert(c.cost>=4||n===1);
  assert(a.text.includes(`随机舍弃自己的${n}张手牌。若以此舍弃了${n}张卡牌，则`));assert(a.raw+1e-8>=a.minPayoff);assert(a.minPayoff>=n*3+1);
  if(a.trigger==='谢幕曲')assert(!a.text.includes('选择')&&!a.text.includes('【模式】'));
 }
}
const trigger='入场曲',cost='随机舍弃自己的1张手牌。',payoff='若以此舍弃了1张卡牌，则选择对手的战场上的1个随从，破坏该随从。';
const text=ctx.displayAbilities({abilities:[{trigger,text:'【入场曲】抽取1张卡牌。'+cost+payoff}]})[0].text;
assert.equal(text,'【入场曲】'+cost+payoff+'抽取1张卡牌。');
assert(ramp/dragons>.05&&ramp/dragons<.2);assert(discard>100&&early>ramp*.7&&discardIds.size>=8&&types.has('follower')&&types.has('spell'));
const report={version:S.VERSION,dragons,ramp,discard,early,discardEffects:[...discardIds],types:[...types],examples};fs.writeFileSync(__dirname+'/dragon-validation.json',JSON.stringify(report,null,2));console.log('PASS: ramp availability/class/cost gates, varied compensated discard, full-payment conditions and payment-before-payoff display.');console.log(report);
