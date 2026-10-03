'use strict';
const A=require('node:assert/strict'),E=require('./engine'),D=require('./data');let passed=0;
const test=(name,f)=>{f();passed++;console.log('PASS '+name)},state=()=>E.create('angel',71931,'normal',['forest','royal','haven','artifact']);
const add=(s,id,x={})=>{const c=E.make(s,id,x);s.board.push(c);return c;};
function play(s,id,target){const c=E.make(s,id);s.hand.push(c);const r=E.act(s,'play',{uid:c.uid,target:target?.uid});A(r.ok,r.message);return c;}
const stats=c=>[c.attack,c.health],summons=(r,side,id)=>r.events.filter(e=>e.kind==='summon').map(e=>e.boards[side].find(c=>c.battleId===e.to)).filter(c=>c?.id===id);
test('Cynthia is five-star fixed team growth; army, supply and combat payoff use other cards',()=>{
 A.equal(D.byId.forest4.tier,5);A.deepEqual(D.byId.forest4.keywords,[]);
 for(const golden of [false,true])for(const army of [0,1000]){const s=state(),m=golden?2:1,c=add(s,'forest4',{golden}),r=add(s,'forest1'),old=stats(r),self=stats(c);s.progress.fairy=army;s.played=2;play(s,'bones');A.equal(s.progress.fairy,army);A.deepEqual(stats(r),old.map(v=>v+8*m+3));A.deepEqual(stats(c),self);A.equal(s.hand.length,0);}
});
test('five reworked brood cards summon exact ordinary/golden tokens on either side without hand income',()=>{
 for(const side of [0,1])for(const golden of [false,true])for(const id of ['forest13','forest9','night14','blood16']){
  const s=state(),m=golden?2:1,d=D.byId[id],c=E.make(s,id,{attack:0,health:20,golden}),foe=E.make(s,'neutral0',{attack:1000,health:100000});
  const r=side?E.combat(s,[foe],[c]):E.combat(s,[c],[foe]),sp=summons(r,side,d.brood.id);A.equal(sp.length,d.brood.count,id);
  for(const t of sp){A.equal(t.attack,d.brood.attack*m,id);A.equal(t.maxHealth,d.brood.health*m+(d.brood.inheritHealth?10:0),id);A.equal(t.effectScale,m);}
  A.equal(s.hand.length,0);A(!D.fanfareIds.includes(id));A.equal(d.related[0].count,d.brood.count);A(!r.events.some(e=>e.boards.some(b=>b.length>7)));
 }
});
test('brood echoes honor seven spaces and token deaths never write permanent growth to a recruitment card',()=>{
 const s=state(),c=E.make(s,'forest13',{health:1,attack:0,keywords:['taunt']}),m=E.make(s,'night4',{health:10000,attack:0,golden:true}),foe=E.make(s,'neutral0',{attack:100,health:10000});
 const r=E.combat(s,[m,c],[foe]);A.equal(summons(r,0,'fairy').length,6);A.deepEqual(r.permanent[0],{});A(r.events.every(e=>e.boards[0].length<=7));
});
test('guardian requires surviving attacks and grows only royal neighbor health',()=>{
 for(const side of [0,1])for(const golden of [false,true])for(const lethal of [false,true]){
  const s=state(),c=E.make(s,'royal2',{attack:0,health:lethal?1:10000,golden}),team=[E.make(s,'royal11',{attack:0,health:10000}),c,E.make(s,'royal12',{attack:0,health:10000})],foe=E.make(s,'neutral0',{attack:1,health:10000});
  const r=side?E.combat(s,[foe],team):E.combat(s,team,[foe]),ev=r.events.filter(e=>e.text.includes('近卫掩护'));
  if(lethal){A.equal(ev.length,0);A.deepEqual(r.permanent[side],{});}else{A(ev.length>2);A.equal(new Set(ev.map(e=>e.to)).size,2);A.equal(Object.values(r.permanent[side]).reduce((n,g)=>n+g.health,0),ev.length*3*(golden?2:1));A(!r.events.some(e=>e.kind==='shield'));}
 }
 const s=state(),r=E.combat(s,[E.make(s,'neutral0',{attack:0,health:10000}),E.make(s,'royal2',{attack:0,health:10000}),E.make(s,'neutral0',{attack:0,health:10000})],[E.make(s,'neutral0',{attack:1,health:10000})]);A(!r.events.some(e=>e.text.includes('近卫掩护')));A(!D.byId.royal5.keywords.includes('shield'));
});
test('twilight queen pays six graves on each last-word repetition; insufficient graves give no buff',()=>{
 for(const golden of [false,true])for(const grave of [0,5,11]){const s=state(),m=golden?2:1,c=E.make(s,'night16',{health:1,attack:0,golden,keywords:['taunt']}),watch=E.make(s,'night4',{attack:0,health:10000}),r=E.combat(s,[watch,c],[E.make(s,'neutral0',{attack:1,health:10000})],{grave});const triggers=Math.floor((grave+1)/6);A.deepEqual(r.permanent[0][watch.uid]||{attack:0,health:0},{attack:triggers*12*m,health:triggers*12*m});A.equal(r.grave[0],grave+1-triggers*6);}
});
test('Fellow rounds research half up; Lune retains full research on every third spell',()=>{
 for(const golden of [false,true]){const s=state(),m=golden?2:1,left=add(s,'neutral0'),f=add(s,'rune15',{golden}),right=add(s,'neutral1'),far=add(s,'neutral2'),l=add(s,'rune18');s.progress.spellcraft=7;const old=s.board.map(stats);play(s,'bones');A.deepEqual(stats(left),old[0].map(v=>v+4*m));A.deepEqual(stats(right),old[2].map(v=>v+4*m));A.deepEqual(stats(far),old[3]);play(s,'bones');play(s,'bones');A.deepEqual(stats(left),old[0].map(v=>v+12*m+7));A.deepEqual(stats(l),old[4].map(v=>v+7));A.deepEqual(stats(f),old[1].map(v=>v+7));}
});
test('healing and overflow are separate roles; copies have printed countdown rather than one',()=>{
 const s=state(),tenko=add(s,'haven4'),rabbit=add(s,'haven8'),other=add(s,'haven0',{health:100}),foreign=add(s,'neutral0'),before=s.board.map(stats);E.endRecruit(s);A.deepEqual(stats(tenko),before[0].map(v=>v+3));A.deepEqual(stats(rabbit),before[1].map(v=>v+3));A.deepEqual(stats(other),before[2].map(v=>v+3));A.deepEqual(stats(foreign),before[3]);A.equal(s.hand.length,0);
 s.hp=35;const b=s.board.map(stats);E.endRecruit(s);A.equal(s.hp,38);A.deepEqual(s.board.map(stats),b);
 const p=state();add(p,'haven5');p.amulets=[{...E.make(p,'temple'),count:1}];play(p,'clock');const copy=p.hand.find(c=>c.id==='temple');A(copy);A.equal(copy.initialCount,undefined);play(p,'bones');A(E.act(p,'play',{uid:copy.uid}).ok);A.equal(p.amulets[0].count,D.byId.temple.count);
});
test('weapon rally has fixed growth independent of scrap; echo and cleave are different cards',()=>{
 for(const scrap of [0,900]){const s=state(),r=add(s,'artifact17'),t=add(s,'artifact0'),old=stats(t);s.scrap=scrap;play(s,'module',t);A.deepEqual(stats(t),[old[0]+5,old[1]+6]);A.deepEqual(stats(r),[D.byId.artifact17.attack,D.byId.artifact17.health]);}
 A.equal(D.byId.artifact6.effect,'moduleEcho');A.equal(D.byId.artifact9.effect,'cleave');A.equal(D.byId.artifact9.tier,5);
 const s=state(),c=E.make(s,'artifact9',{health:1000,attack:1}),r=E.combat(s,[c],[E.make(s,'neutral0',{attack:1,health:1000})]);A(r.events.filter(e=>e.kind==='attack'&&e.from===100001).every(e=>!e.text.includes('连击')));
});
test('five-star healing carry converts grown attack once per turn and needs Tenko for team growth',()=>{
 for(const golden of [false,true])for(const hasTenko of [false,true]){const s=state(),m=golden?2:1,c=add(s,'haven16',{attack:103,golden}),ally=add(s,'haven9');if(hasTenko)add(s,'haven4');s.hp=35;const old=s.board.map(stats);E.endRecruit(s);A.equal(s.hp,40);const n=hasTenko?22*m-5:0;A.deepEqual(stats(c),old[0].map(v=>v+n));A.deepEqual(stats(ally),old[1].map(v=>v+n));A.equal(s.hand.length,0);}
});
test('four-star injury trainer gives exactly four per surviving hit, not per tier or damage point',()=>{
 for(const side of [0,1])for(const golden of [false,true])for(const tier of [2,6]){const s=state(),m=golden?2:1,hurt=E.make(s,'dragon0',{attack:0,health:100}),burn=E.make(s,'dragon3'),trainer=E.make(s,'dragon4',{attack:0,health:100,golden});const team=[hurt,burn,trainer],r=side?E.combat(s,[],team,{}, {tier}):E.combat(s,team,[],{tier},{});const gains=Object.values(r.permanent[side]);A.equal(gains.reduce((n,g)=>n+g.attack,0),16*m);A.equal(gains.reduce((n,g)=>n+g.health,0),16*m);A.equal(r.permanent[1-side][hurt.uid],undefined);}
});
test('all eight two-route guides point to current cards and every tribe retains tiers one through six',()=>{
 for(const t of D.tribeIds){A.equal(D.archetypes[t].routes.length,2);for(const [name,text,ids]of D.archetypes[t].routes){A(name&&text);A(ids.every(id=>D.byId[id]));}A.deepEqual([...new Set(D.cards.filter(c=>c.tribe===t).map(c=>c.tier))].sort(),[1,2,3,4,5,6]);}
 A(D.archetypeChanges.length>=35);A.equal(D.cards.length,169);A.equal(D.rulesVersion,'15.0');
});
console.log(passed+' archetype rebalance groups passed.');
