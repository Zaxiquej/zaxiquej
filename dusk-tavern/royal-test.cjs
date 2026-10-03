'use strict';
const A=require('node:assert/strict'),E=require('./engine'),D=require('./data'),AI=require('./ai'),S=E.scaling;let passed=0;
const test=(n,f)=>{f();passed++;console.log('PASS '+n);},state=()=>E.create('royal',19371,'normal',['royal','rune','dragon','haven']);
const add=(s,id,x={})=>{const c=E.make(s,id,x);s.board.push(c);return c;};
function play(s,id,target){const c=E.make(s,id);s.hand.push(c);A(E.act(s,'play',{uid:c.uid,target:target?.uid}).ok);}
const opening=r=>r.events.find(e=>e.text==='开战效果结算完成。');
test('royal shields stack without increasing low-tier body; other tribes refresh one layer',()=>{
 const s=state(),a=add(s,'royal0'),b=add(s,'neutral0');for(let i=0;i<3;i++){S.addShield(a,true);S.addShield(b,false);}A.equal(S.shieldCount(a),4);A.equal(S.shieldCount(b),1);A.equal(s.progress.buffs,0);A.deepEqual([a.attack,a.health],[2,2]);E.startRound(s);A.equal(S.shieldCount(a),4);A(E.validate(s));
});
test('each hit spends exactly one layer and triggers growth once on either side',()=>{
 for(const side of [0,1]){const s=state(),c=E.make(s,'royal0',{attack:0,health:100,shieldLayers:3}),enemy=E.make(s,'neutral0',{attack:10,health:10000}),r=side?E.combat(s,[enemy],[c]):E.combat(s,[c],[enemy]);const frames=r.events.filter(e=>e.text.includes('不屈之光'));A.equal(frames.length,3);A.deepEqual(frames.map(e=>S.shieldCount(e.boards[side][0])),[2,1,0]);A.deepEqual(frames.map(e=>e.boards[side][0].health),[101,102,103]);A.deepEqual(r.permanent[side][c.uid],{attack:3,health:3});A.equal(r.progress[side].buffs,3);A.equal(r.events.flatMap(e=>e.impacts).filter(i=>i.blocked).length,3);A.equal(S.shieldCount(c),3);}
});
test('royal triples sum saved layers without inventing new base shields or buff events',()=>{
 const s=state(),c=add(s,'royal0');S.addShield(c,true);s.hand=[E.make(s,'royal0'),E.make(s,'royal0')];E.triples(s);A.equal(S.shieldCount(s.board[0]),4);A(s.board[0].golden);A.equal(s.progress.buffs,0);A(E.validate(s));
});
test('banner grants stats and never creates shields',()=>{
 for(const id of ['royal11','haven11']){const s=state(),c=add(s,id,{golden:true,shieldLayers:0});s.amulets=[{...E.make(s,'banner'),count:1}];E.endRecruit(s);A.equal(S.shieldCount(c),0);A(E.validate(s));s.amulets=[{...E.make(s,'banner'),count:1}];E.endRecruit(s);A.equal(S.shieldCount(c),0);A(E.validate(s));}
});
test('golden Otohime adds two temporary layers and does not change recruitment shields',()=>{
 for(const side of [0,1])for(const golden of [false,true]){const s=state(),a=E.make(s,'royal7',{golden}),b=E.make(s,'royal0',{shieldLayers:3}),team=[a,b],enemy=[E.make(s,'neutral0',{attack:1000,health:10000})],r=side?E.combat(s,enemy,team):E.combat(s,team,enemy);A.equal(S.shieldCount(opening(r).boards[side][1]),golden?5:4);A.equal(S.shieldCount(b),3);}
});
test('relay can add to shielded allies, prioritizes lowest layers, golden targets are distinct',()=>{
 const s=state(),relay=E.make(s,'royal15',{attack:0,health:10000,golden:true}),a=E.make(s,'royal0',{attack:0,health:10000,shieldLayers:5}),b=E.make(s,'royal11',{attack:0,health:10000,keywords:['shield'],shieldLayers:3}),r=E.combat(s,[relay,a,b,...[0,1].map(()=>E.make(s,'neutral0',{attack:0,health:1}))],[E.make(s,'dragon7',{attack:2,health:100000})]);const ev=r.events.filter(e=>e.text.includes('复仇：')&&e.text.includes('补充屏障'));A.equal(ev.length,2);A.equal(ev[0].boards[0].find(c=>c.battleId===ev[0].to).uid,b.uid);A.equal(new Set(ev.map(e=>e.to)).size,2);
});
test('rebirth discards saved stacks and gains only its explicit fresh shield',()=>{
 const s=state(),c=E.make(s,'royal4',{attack:0,health:2,keywords:['shield'],shieldLayers:3}),r=E.combat(s,[c],[E.make(s,'neutral0',{attack:100,health:10000})]);const reborn=r.events.find(e=>e.kind==='summon'&&e.text.startsWith('复生'));A(reborn);A.equal(S.shieldCount(reborn.boards[0][0]),1);A.equal(S.shieldCount(c),3);
});
test('Bahamut removes every layer but triggers each target once',()=>{
 const s=state(),c=E.make(s,'royal0',{attack:0,health:10,shieldLayers:30}),r=E.combat(s,[c],[E.make(s,'neutral5',{attack:0,health:10000})]);A.equal(S.shieldCount(opening(r).boards[0][0]),0);A.deepEqual(r.permanent[0][c.uid],{attack:1,health:1});A(D.byId.neutral5.text.includes('每名随从触发一次'));
});
test('buff counter counts recipients and effects, never stat magnitude or zero payload',()=>{
 const s=state(),a=add(s,'neutral0'),b=add(s,'neutral0');play(s,'growth',a);A.equal(s.progress.buffs,1);s.progress.spellcraft=200;play(s,'growth',a);A.equal(s.progress.buffs,2);play(s,'team');A.equal(s.progress.buffs,4);s.progress.spellcraft=0;play(s,'ritual',b);A.equal(s.progress.buffs,4);S.addShield(b,false);A.equal(s.progress.buffs,4);
});
test('marshal counts layers; commander snapshots its threshold before buffing recipients',()=>{
 for(const golden of [false,true]){const s=state(),m=golden?2:1,commander=add(s,'royal18',{golden}),a=add(s,'royal11'),b=add(s,'royal12');s.progress.buffs=39;const before=[a.attack,b.attack,commander.attack];E.endRecruit(s);A.deepEqual([a.attack,b.attack,commander.attack],[before[0]+m,before[1]+m,before[2]]);A.equal(s.progress.buffs,41);}
 const s=state(),a=add(s,'royal0',{shieldLayers:3}),b=add(s,'royal17');const before=[a.attack,b.attack];E.endRecruit(s);A.deepEqual([a.attack,b.attack],before.map(n=>n+6));A.equal(s.progress.buffs,2);
});
test('Roland payoff uses each side history, scales gold, remains temporary and counts once',()=>{
 for(const side of [0,1])for(const golden of [false,true]){const s=state(),c=E.make(s,'royal9',{golden}),foe=E.make(s,'neutral0',{attack:1000,health:10000}),meta={progress:{buffs:49}},r=side?E.combat(s,[foe],[c],{},meta):E.combat(s,[c],[foe],meta,{}),o=opening(r).boards[side][0],n=9*(golden?2:1);A.equal(o.attack,c.attack+n);A.equal(o.health,c.health+n);A.equal(r.progress[side].buffs,50);A.equal(r.progress[1-side].buffs,0);A.deepEqual(r.permanent[side],{});}
});
test('old saves migrate from zero history; new layers/history survive reload and reject invalid values',()=>{
 const s=state();delete s.progress.buffs;const c=add(s,'royal0');A(E.validate(s));E.normalize(s);A.equal(s.progress.buffs,0);A.equal(S.shieldCount(c),1);S.addShield(c,true);play(s,'growth',c);const saved=E.normalize(E.copy(s));A.equal(saved.progress.buffs,1);A.equal(S.shieldCount(saved.board[0]),2);A(E.validate(saved));for(const value of [-1,1.5,Infinity]){const bad=E.copy(s);bad.progress.buffs=value;A(!E.validate(bad));bad.progress.buffs=0;bad.board[0].shieldLayers=value;A(!E.validate(bad));}
});
test('battle settlement does not recount the permanent ledger and AI uses the scarce Athena shield power',()=>{
 const s=state();s.board=[E.make(s,'royal0',{attack:0,health:50,shieldLayers:3}),E.make(s,'royal6')];A(E.act(s,'fight').ok);A.equal(s.progress.buffs,s.result.progress[0].buffs);A(E.validate(s));
 const t=state(),o=t.opponents[0];t.round=4;Object.assign(o,{tier:3,tribe:'royal',hero:'athena',route:0,gold:2,powerUsed:false,board:[E.make(t,'royal0')],hand:[],shop:[]});AI.prepare(t,o,E,{started:true,deferEnd:true,bonusGold:false});A.equal(o.hand.length,0);A.equal(S.shieldCount(o.board[0]),2);A(E.validate(t));
});
console.log(passed+' royal groups passed.');
