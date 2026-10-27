const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine'),check=require('./assert-node-effects.cjs');
const node=(trigger,text,extra={})=>({trigger,text,ids:['tokenSummon'],...extra});
const card=(type,abilities)=>({type,abilities});
assert(!S.boardCapacity(card('follower',[node('入场曲','召唤5个『妖精』。')])).valid);
assert(S.boardCapacity(card('spell',[node('法术','召唤5个『妖精』。')])).valid);
assert(!S.boardCapacity(card('follower',[node('入场曲','召唤3个『骑士』。'),node('入场曲','召唤2个『铁甲骑士』。')])).valid);
assert(S.boardCapacity(card('follower',[node('谢幕曲','召唤5个『妖精』。')])).valid);
assert(S.boardCapacity(card('amulet',[node('启动','破坏本卡牌。召唤5个『妖精』。',{activation:{breaksSelf:true}})])).valid);
assert(!S.boardCapacity(card('follower',[node('进化时','召唤3个『妖精』。'),node('超进化时','召唤2个『妖精』。')])).valid);
assert(!S.boardCapacity(card('follower',[node('入场曲','召唤3个『妖精』。'),node('爆能强化','召唤2个『妖精』。')])).valid);
assert(S.boardCapacity(card('follower',[node('入场曲','召唤3个『妖精』。'),node('进化时','发动与【入场曲】相同的能力。',{ids:['replay']})])).valid,'Entry and later evolution can refill a depleted board');
assert.equal(S.summonSlots(node('入场曲','召唤2个『骑士』。【模式】选择1个能力发动。（1）召唤2个『骑士』。（2）召唤1个『铁甲骑士』。')),4);
assert.equal(S.summonSlots(node('入场曲','召唤2个『骑士』。使这些随从获得「【谢幕曲】召唤1个『骑士』。」。')),2);
assert.equal(S.summonSlots(node('入场曲','发动【亡者召还 8】。')),1);
assert.equal(S.summonSlots(node('入场曲','召唤自己的手牌中的随机2张费用为5或以下的创造物·随从的复制随从。')),2);
assert.equal(S.summonSlots(node('入场曲','X至多为4。召唤X个『妖精』。')),4);
const spec={material:'selfDamage',amount:2,credit:1.3,repeats:1.35};
const ward={health:7,abilities:[{kind:'keyword',ids:['守护']}]};
const terms=S.resurrectionTerms(ward,spec);assert.equal(terms.material,'necromancy');assert(terms.amount>=6&&terms.credit<=spec.credit&&terms.wardPremium>0&&terms.repeats>spec.repeats);
assert(S.resurrectionTerms(ward,{...spec,material:'earth'}).amount>=3);
assert.equal(S.resurrectionTerms({health:7,abilities:[]},spec).material,'selfDamage');
const counts={cards:4000,wardLoops:0,loops:0,oneShotWard:0,alternates:0},examples={};let index=0;
for(let i=0;i<counts.cards;i++){
 let name,h;do{name='五格与复活回归'+index++;h=S.header(name);}while(i>=3000&&!(h.type==='follower'&&[3,5].includes(h.class)&&h.cost>=4));
 const opts={chaos:i%4===0},c=S.generate(name,opts);check(c);
 assert(S.boardCapacity(c).valid,c.name+' '+JSON.stringify(S.boardCapacity(c).nodes));
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.025,c.name+' budget');
 if(i%400===0)assert.deepEqual(c,S.generate(name,opts));
 for(const t of c.tokens.filter(t=>t.upgrade))assert(S.boardCapacity(t).valid);
 for(const f of c.alternateForms.filter(f=>f.abilities)){counts.alternates++;assert(S.boardCapacity({...f,type:f.kind==='结晶'?'amulet':'spell'}).valid);}
 const a=c.abilities.find(a=>a.ids.includes('resurrectSelf'));
 if(a){
  counts.loops++;const p=a.resurrection;assert(p.finalValuation);
  if(c.abilities.some(a=>a.kind==='keyword'&&a.ids.includes('守护'))){
   counts.wardLoops++;assert(p.ward&&['earth','necromancy'].includes(p.material));assert(p.amount>=(p.material==='earth'?3:6));
   assert(a.text.includes(String(p.amount))&&a.resourceCost===p.amount);
   assert(p.wardPremium>0&&p.repeats===1.75);examples.ward??=c;
  }
 }
 if(c.abilities.some(a=>a.kind==='keyword'&&a.ids.includes('守护'))&&c.abilities.some(a=>a.trigger==='谢幕曲'&&a.text.includes('失去【谢幕曲】')))counts.oneShotWard++;
}
assert(counts.loops>0&&counts.wardLoops>0&&counts.alternates>0);
fs.writeFileSync(__dirname+'/board-resurrection-validation.json',JSON.stringify({version:S.VERSION,counts,examples},null,2)+'\n');
console.log({version:S.VERSION,counts});
