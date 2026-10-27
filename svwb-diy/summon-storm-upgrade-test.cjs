const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine'),check=require('./assert-node-effects.cjs');
const effect=(trigger,id,raw,text='')=>({kind:'effect',trigger,condition:'none',ids:[id],raw,price:raw,text});
const body={type:'follower',cost:6,attack:2,health:2,abilities:[]};
const fan=effect('入场曲','damage',20,'选择对手的战场上的1个随从，对其造成16点伤害。');
assert.deepEqual(S.summonedFollowerValue(body),S.summonedFollowerValue({...body,abilities:[fan]}));
const evo=effect('超进化时','damage',20);
assert.deepEqual(S.summonedFollowerValue(body),S.summonedFollowerValue({...body,abilities:[evo]}));
const death=effect('谢幕曲','draw',3);
assert(S.summonedFollowerValue({...body,abilities:[death]}).summonValue>S.summonedFollowerValue(body).summonValue);
assert.deepEqual(S.summonedFollowerValue({...body,abilities:[death]},true),S.summonedFollowerValue(body));
assert(!S.selfSummonQuality({...body,abilities:[fan,effect('超进化时','selfCopy',15,'召唤1个『自己』。')]}));
assert(!S.selfSummonQuality({...body,name:'本体',attack:3,health:3,abilities:[effect('超进化时','selfCopy',8,'召唤2个『妖精』。召唤1个『本体』。')]}),'Other summons must not multiply the self-copy value');
assert(S.stormCardValue(2,4,[effect('入场曲','damage',5,'选择对手的战场上的1个随从，对其造成4点伤害。')]).value>3);
assert(S.stormCardValue(2,4,[effect('入场曲','face',8,'对对手的主战者造成4点伤害。')]).value>3);
assert.equal(S.stormCardValue(7,5,[]).value,8);
assert.equal(S.transformationGain([effect('入场曲','damage',10)],[effect('入场曲','damage',20)]),0,'Overkill is not a meaningful upgrade');
assert.equal(S.transformationGain([effect('入场曲','damage',10)],[effect('入场曲','damage',20)],1),2.4);
const counts={cards:4000,storm:0,cheapStorm:0,copies:0,incubate:0,shorter:0,cheaper:0,transforms:0,discounted:0},examples={};
for(let i=0;i<counts.cards;i++){
 const options={chaos:i%4===0},c=S.generate('召唤疾驰完成形回归'+i,options);check(c);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.025,c.name+' budget');
 if(i%400===0)assert.deepEqual(c,S.generate(c.name,options));
 if(c.type==='follower'&&c.abilities.some(a=>a.kind==='keyword'&&a.ids.includes('疾驰'))){
  counts.storm++;if(c.cost<5)counts.cheapStorm++;
  assert(S.stormCardValue(c.attack,c.health,c.abilities).value<=c.cost*(c.chaos?1.15:1)+1e-8,c.name+' storm');
 }
 if(c.abilities.some(a=>a.ids.includes('selfCopy')&&['进化时','超进化时'].includes(a.trigger))){counts.copies++;assert(S.selfSummonQuality(c),c.name+' copied body');examples.copy??=c;}
 for(const f of c.alternateForms.filter(f=>f.route==='incubate')){
  counts.incubate++;const v=S.summonedFollowerValue(c);assert.equal(f.valuation.summonValue,v.summonValue);
  assert(f.cost*2.8+2<=v.summonValue+1e-8);assert(v.summonValue<=f.cost*2.8+f.countdown*3.5+1e-8);
  assert(!v.retainedIds.includes('replay'));
  if(f.valuation.delayReduced){counts.shorter++;examples.shorter??=c;}
  if(f.cost<f.valuation.originalCost){counts.cheaper++;examples.cheaper??=c;}
 }
 if(c.progressTransform){
  counts.transforms++;const p=c.progressTransform,t=c.tokens.find(t=>t.id===p.targetId);
  if(p.discount)counts.discounted++;
  assert(t&&t.cost===c.cost-p.discount);assert(p.deliveredGain+1e-8>=p.minimumDelivered);
  const base=c.abilities.filter(a=>a.kind!=='progressTransform');
  assert(Math.abs(S.transformationGain(base,t.abilities,p.discount)-p.deliveredGain)<1e-8);
  assert(p.price<=c.budget+1e-8);examples.upgrade??=c;
 }
}
for(const k of ['cheapStorm','copies','incubate','shorter','transforms','discounted'])assert(counts[k]>0,k+' unreachable');
fs.writeFileSync(__dirname+'/summon-storm-upgrade-validation.json',JSON.stringify({version:S.VERSION,counts,examples},null,2)+'\n');
console.log({version:S.VERSION,counts});
