'use strict';
const A=require('node:assert/strict'),E=require('./engine.js'),D=require('./data.js'),AI=require('./ai.js');let groups=0;
const test=(n,f)=>{f();groups++;console.log('PASS '+n);},state=()=>E.create('aria',871,'normal',['forest','blood','royal','rune']);
const add=(s,id,x={})=>{const c=E.make(s,id,x);s.board.push(c);return c;},act=(s,t,a={})=>{const r=E.act(s,t,a);A(r.ok,r.message);},play=(s,id,x={})=>{const c=E.make(s,id,x);s.hand.push(c);act(s,'play',{uid:c.uid});return c;};
test('six real gold reserves one fairy, golden two; purchase, refresh, power and upgrade count',()=>{
 for(const golden of [false,true]){const s=state(),m=golden?2:1,b=add(s,'forest11',{golden});s.gold=30;s.shop=[E.make(s,'neutral1')];act(s,'buy',{uid:s.shop[0].uid});act(s,'refresh');act(s,'power');A.equal(b.spentGold,5);A.equal(s.pendingFairies,0);act(s,'refresh');A.equal(s.pendingFairies,m);A.equal(b.spentGold,0);A.equal(s.hand.length,1);s.discount=0;const cost=E.upgradeCost(s);act(s,'upgrade');A.equal(b.spentGold,cost);A.equal(s.pendingFairies,m);A.equal(s.hand.filter(c=>c.id==='fairy').length,0);}
});
test('seven golden bards cannot turn six gold of refreshes into same-turn resources',()=>{
 const s=state();s.gold=6;for(let i=0;i<7;i++)add(s,'forest11',{golden:true});for(let i=0;i<6;i++)act(s,'refresh');A.equal(s.gold,0);A.equal(s.hand.length,0);A.equal(s.pendingFairies,14);A.equal(E.act(s,'refresh').ok,false);A.equal(s.pendingFairies,14);
});
test('princess trains the fairy army, never grants gold or an entry spell',()=>{
 for(const golden of [false,true]){const s=state(),m=golden?2:1;add(s,'royal3',{golden:true});const c=play(s,'forest2',{golden});A.equal(s.hand.length,0);A(!D.fanfareIds.includes('forest2'));A.deepEqual(D.byId.forest2.related,[]);const gold=s.gold;
 for(const id of ['fairy','knight','skeleton','analyzer']){const token=play(s,id);A.equal(s.gold,gold+(s.progress.fairy/m-1));act(s,'sell',{uid:token.uid});}A.equal(s.progress.fairy,4*m);A.equal(s.gold,gold+4);A.equal(c.attack,D.byId.forest2.attack);}
});
test('banked fairies survive selling the source and reload, pay next round once and can triple',()=>{
 const s=state(),b=add(s,'forest11',{spentGold:5});s.gold=1;act(s,'refresh');A.equal(s.pendingFairies,1);act(s,'sell',{uid:b.uid});s.hand=[E.make(s,'fairy'),E.make(s,'fairy')];A(E.validate(s));const saved=E.normalize(E.copy(s));E.endRecruit(saved);A.equal(saved.hand.length,2);A.equal(saved.pendingFairies,1);saved.round++;E.startRound(saved);A.equal(saved.pendingFairies,0);A.equal(saved.hand.length,1);A(saved.hand[0].golden);A.equal(saved.discover.length,1);const count=saved.hand.length;E.startRound(saved);A.equal(saved.hand.length,count);
});
test('full hand loses unpaid overflow without an unbounded delivery loop',()=>{
 const s=state();s.hand=Array.from({length:10},()=>E.make(s,'mana'));s.pendingFairies=999999;const uid=s.uid;E.startRound(s);A.equal(s.hand.length,10);A.equal(s.pendingFairies,0);A.equal(s.uid-uid,s.shop.length+1);A(s.log.some(x=>x.includes('999999 张因手牌已满')));
});
test('healing plus repeated blood battlecries cannot pay back same-turn purchases',()=>{
 for(const golden of [false,true]){const s=state(),m=golden?2:1;add(s,'royal3',{golden:true});add(s,'blood11',{golden:true});s.gold=10;const hp=s.hp,c=play(s,'blood3',{golden});A.equal(s.hp,hp);A.equal(s.bloodDamage,6);A.equal(s.gold,10);A.equal(s.pendingGold,9*m);act(s,'sell',{uid:c.uid});A.equal(s.gold,11);s.round=2;E.startRound(s);A.equal(s.gold,4+9*m);A.equal(s.pendingGold,0);}
 const s=state();s.hp=1;play(s,'blood3');A.equal(s.pendingGold||0,0);
});
test('pending counters migrate and reject invalid player or AI data',()=>{
 const s=state();delete s.pendingFairies;A(E.validate(s));A.equal(E.normalize(s).pendingFairies,0);for(const n of [-1,1.5,Infinity])for(const side of ['player','ai']){const copy=E.copy(s);(side==='player'?copy:copy.opponents[0]).pendingFairies=n;A(!E.validate(copy));}const b=add(s,'forest11',{spentGold:5});A(E.validate(s));b.spentGold=6;A(!E.validate(s));
});
test('AI retains deferred fairies across recruitment and receives them only next round',()=>{
 const s=state(),o=s.opponents.find(x=>x.tribe==='forest');o.hero='aria';o.route=0;o.tier=6;o.gold=1;o.board=[E.make(s,'forest11',{spentGold:5})];o.hand=[];o.shop=[];o.pendingFairies=0;o.powerUsed=true;s.round=10;AI.prepare(s,o,E,{started:true,deferEnd:true,bonusGold:false});A.equal(o.pendingFairies,1);A.equal(o.hand.filter(c=>c.id==='fairy').length,0);A(o.aiSummary.goldSpent>=1);const next={...s,...o,maxHp:40,opponents:s.opponents,log:[]};E.startRound(next);A.equal(next.pendingFairies,0);A.equal(next.hand.filter(c=>c.id==='fairy').length,1);
});
console.log(groups+' economy loop groups passed.');
