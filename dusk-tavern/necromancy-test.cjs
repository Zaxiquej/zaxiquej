'use strict';
const A=require('node:assert/strict'),E=require('./engine'),D=require('./data'),S=E.scaling;let groups=0;
const test=(name,fn)=>{fn();groups++;console.log('PASS '+name);};
const state=()=>E.create('night',91273,'normal',['night','forest','royal','dragon']);
const card=(s,id,x={})=>E.make(s,id,x),foe=s=>card(s,'neutral0',{attack:10000,health:10000});
const summons=(r,side=0)=>r.events.filter(e=>e.kind==='summon'&&e.boards[side].some(c=>c.battleId===e.to));
const summoned=(r,side=0)=>summons(r,side).map(e=>e.boards[side].find(c=>c.battleId===e.to));
const opening=r=>r.events.find(e=>e.text==='开战效果结算完成。');

test('names, roles, identities and legal pools are consistent',()=>{
 A.equal(D.rulesVersion,'18.0');A.equal(D.tribes.night.name,'死灵');A.equal(D.cards.filter(c=>c.tribe==='night').length,19);
 A(!JSON.stringify([D.cards,D.heroes,D.archetypes]).includes('梦魇'));for(const id of ['night2','night5','night12','night13','night15','night17','night18']){const d=D.byId[id];A(d.sourceId&&d.art&&d.goldenText);}
 A.equal(D.byId.night13.tier,4);A.equal(D.byId.night17.tier,5);A.equal(D.byId.night18.tier,6);
});
test('initial boards and recruitment do not count as battle entries',()=>{
 const s=state();s.hand=[card(s,'night11')];A(E.act(s,'play',{uid:s.hand[0].uid}).ok);A.equal(S.read(s).battleEntries,0);const r=E.combat(s,s.board,[],s);A.equal(r.progress[0].battleEntries,0);A.equal(r.progress[1].battleEntries,0);
});
test('actual summons count once, independently on either side and for golden sources',()=>{
 for(const side of [0,1])for(const golden of [false,true]){const s=state(),b=[card(s,'night0',{golden})],enemy=[foe(s)],r=side?E.combat(s,enemy,b,{progress:{battleEntries:7}},{progress:{battleEntries:20}}):E.combat(s,b,enemy,{progress:{battleEntries:20}},{progress:{battleEntries:7}});A.equal(r.progress[side].battleEntries,21);A.equal(r.progress[1-side].battleEntries,7);A.equal(summons(r,side).length,1);}
});
test('failed summons at seven slots grant neither a counter nor army growth',()=>{
 const s=state(),walls=Array.from({length:6},()=>card(s,'neutral11',{attack:0,health:100000,keywords:['cannotAttack']})),c=card(s,'night14',{keywords:['taunt']});const r=E.combat(s,[c,...walls],[foe(s)]);A.equal(summons(r).length,1);A.equal(r.progress[0].battleEntries,1);
});
test('Cerberus creates two visible reborn tokens with real last words',()=>{
 for(const golden of [false,true]){const s=state(),m=golden?2:1,r=E.combat(s,[card(s,'night5',{golden})],[foe(s)]),born=summoned(r);A.equal(born.length,4);A.equal(r.progress[0].battleEntries,4);for(const id of ['hound','coco']){const copies=born.filter(c=>c.id===id);A.equal(copies.length,2);A.equal(copies[0].attack,4*m);A.equal(copies[0].health,4*m);A(copies[0].reborn);A.equal(copies[1].reborn,false);}A(r.events.some(e=>e.text.includes('造成 '+2*m+' 点伤害')));}
});
test('reborn retains exactly one army bonus and never permanently copies it to the board',()=>{
 const s=state(),c=card(s,'night12'),before=E.copy(c),meta={progress:{legionAttack:17,battleEntries:8}};const r=E.combat(s,[c],[foe(s)],meta);A.equal(opening(r).boards[0][0].attack,c.attack+17);A.equal(summoned(r)[0].attack,c.attack+17);A.equal(summoned(r)[0].health,1);A.equal(r.progress[0].battleEntries,9);A.deepEqual(c,before);A.deepEqual(r.permanent[0],{});const next=E.combat(s,[c],[],{progress:r.progress[0]});A.equal(opening(next).boards[0][0].attack,c.attack+17);A.equal(next.progress[0].battleEntries,9);
});
test('one-time grave resurrection counts and does not refill reborn or army bonuses',()=>{
 const s=state(),unit=card(s,'night12',{keywords:['taunt']}),neph=card(s,'night7',{keywords:['stealth'],health:100000,attack:0}),r=E.combat(s,[unit,neph],[foe(s)],{grave:50,progress:{legionAttack:13}});const copies=summoned(r).filter(c=>c.id==='night12');A.equal(copies.length,2);A(copies.every(c=>c.attack===unit.attack+13));A(copies.every(c=>!c.reborn));A.equal(r.progress[0].battleEntries,2);A.equal(r.events.filter(e=>e.text.startsWith('复活 怪犬')).length,1);
});
test('bone prince upgrades the persistent faction army, including through deathrattle echo',()=>{
 for(const golden of [false,true]){const s=state(),m=golden?2:1,prince=card(s,'night13',{golden,keywords:['taunt']}),mint=card(s,'night4',{attack:0,health:100000,keywords:['stealth']}),neutral=card(s,'neutral11',{attack:0,health:100000,keywords:['cannotAttack','stealth']});const r=E.combat(s,[prince,mint,neutral],[foe(s)],{progress:{legionAttack:7}});A.equal(r.progress[0].legionAttack,7+6*m);const grows=r.events.filter(e=>e.text.includes('死灵军势永久'));A.equal(grows.length,2);const frame=grows.at(-1);A.equal(frame.boards[0].find(c=>c.uid===mint.uid).attack,7+6*m);A.equal(frame.boards[0].find(c=>c.uid===neutral.uid).attack,0);A.deepEqual(r.permanent[0],{});}
});
test('legion engine responds to every tribe, but buffs only necromancers',()=>{
 for(const golden of [false,true]){const s=state(),m=golden?2:1,lord=card(s,'night17',{golden,attack:0,health:100000,keywords:['stealth']}),elf=card(s,'forest0',{keywords:['taunt']}),r=E.combat(s,[elf,lord],[foe(s)],{progress:{legionAttack:10}});A.equal(r.progress[0].battleEntries,1);A.equal(r.progress[0].legionAttack,10+m);A.equal(summoned(r)[0].attack,1);A.equal(r.events.find(e=>e.text.includes('死灵军势永久')).boards[0].find(c=>c.id==='night17').attack,10+m);}
});
test('reborn lord cannot witness its own entry; existing lords can',()=>{
 const s=state(),lord=card(s,'night17',{heroReborn:true,keywords:['taunt']}),r=E.combat(s,[lord],[foe(s)]);A.equal(r.progress[0].battleEntries,1);A.equal(r.progress[0].legionAttack,0);
 const second=card(s,'night17',{attack:0,health:100000,keywords:['stealth']}),v=E.combat(s,[lord,second],[foe(s)]);A.equal(v.progress[0].battleEntries,1);A.equal(v.progress[0].legionAttack,1);
});
test('bone king converts historical entries to temporary health, gold doubles the payoff',()=>{
 for(const golden of [false,true]){const s=state(),c=card(s,'night2',{golden}),m=golden?2:1,r=E.combat(s,[c],[],{progress:{battleEntries:37,legionAttack:9}}),x=opening(r).boards[0][0];A.equal(x.health,c.health+37*m);A.equal(x.attack,c.attack+9);A(x.reborn);A.deepEqual(r.permanent[0],{});A.equal(r.progress[0].battleEntries,37);}
});
test('soulcaller grants distinct leftmost eligible allies reborn, never herself or neutral units',()=>{
 for(const golden of [false,true]){const s=state(),team=['neutral0','night12','night0','night13','night15'].map(id=>card(s,id));team[4].golden=golden;const r=E.combat(s,team,[]),b=opening(r).boards[0];A(!b[0].reborn);A(b[1].reborn);A(b[2].reborn);A.equal(b[3].reborn,golden);A(!b[4].reborn);A.equal(r.progress[0].battleEntries,0);}
});
test('Ferry snapshots the count once per deathrattle; army is added once without golden doubling',()=>{
 for(const golden of [false,true])for(const entries of [0,19]){const s=state(),m=golden?2:1,r=E.combat(s,[card(s,'night18',{golden})],[foe(s)],{progress:{battleEntries:entries,legionAttack:11}}),born=summoned(r);A.equal(born.length,2);for(const c of born){A.equal(c.attack,Math.max(1,entries*m)+11);A.equal(c.health,Math.max(1,entries*m));}A.equal(r.progress[0].battleEntries,entries+2);}
});
test('grave spending and permanent body growth remain separate from the new army',()=>{
 const s=state();s.grave=10;s.progress.legionAttack=12;s.progress.battleEntries=31;s.board=['night9','night12'].map(id=>card(s,id));const before=E.copy(s.board);E.endRecruit(s);A.equal(s.grave,7);A.equal(s.progress.legionAttack,12);A.equal(s.progress.battleEntries,31);s.board.forEach((c,i)=>{A.equal(c.attack,before[i].attack+4);A.equal(c.health,before[i].health+4);});
});
test('settling, next round, old saves and opponent progress preserve exact counters',()=>{
 const s=state();delete s.progress;delete s.opponents[0].progress;A(E.validate(s));E.normalize(s);A.equal(s.progress.battleEntries,0);A.equal(s.opponents[0].progress.legionAttack,0);const r=E.combat(s,[card(s,'night13'),card(s,'night12')],[foe(s)],s);E.settleProgress(s,r.progress[0]);E.settleProgress(s.opponents[0],r.progress[1]);const count=s.progress.battleEntries,army=s.progress.legionAttack;A(army>0);E.startRound(s);A.equal(s.progress.battleEntries,count);A.equal(s.progress.legionAttack,army);const copy=JSON.parse(JSON.stringify(s));A(E.validate(copy));E.normalize(copy);A.deepEqual(copy.progress,s.progress);copy.progress.battleEntries=-1;A(!E.validate(copy));copy.progress.battleEntries=0;copy.opponents[0].progress.legionAttack=-1;A(!E.validate(copy));
});
test('tripling and selling neither multiply nor erase global army and entry records',()=>{
 const s=state();s.progress.legionAttack=30;s.progress.battleEntries=100;s.board=[card(s,'night12'),card(s,'night12')];s.hand=[card(s,'night12')];E.triples(s);const c=s.board[0];A(c.golden);A.equal(c.attack,D.byId.night12.attack*2);const r=E.combat(s,[c],[],s);A.equal(opening(r).boards[0][0].attack,c.attack+30);A(E.act(s,'choose',{id:s.discover[0].options[0]}).ok);A(E.act(s,'sell',{uid:c.uid}).ok);A.equal(s.progress.legionAttack,30);A.equal(s.progress.battleEntries,100);
});
console.log(groups+' focused necromancy groups passed; no AI games or random battle simulations.');
