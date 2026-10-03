'use strict';
const A=require('node:assert/strict'),E=require('./engine'),D=require('./data'),AI=require('./ai');let passed=0;
const test=(name,f)=>{f();passed++;console.log('PASS '+name);};
const state=()=>E.create('angel',992731,'normal',['dragon','blood','forest','rune']);
const add=(s,id,x={})=>{const c=E.make(s,id,x);s.board.push(c);return c;};
function play(s,id,target,x={}){const c=E.make(s,id,x);s.hand.push(c);const r=E.act(s,'play',{uid:c.uid,target:target?.uid});A(r.ok,r.message);return c;}
const body=c=>[c.attack,c.health],gain=(r,side,c)=>r.permanent[side][c.uid]||{attack:0,health:0};
test('new identities, pool restrictions, art and exact rules',()=>{
 A.equal(D.rulesVersion,'15.0');A.equal(D.cards.length,169);A.equal(D.spells.length,19);A.equal(D.cynthiaCombo,8);
 for(const [id,source]of Object.entries({dragon19:101431040,dragonWing:101414010,bloodContract:100614010})){const d=D.byId[id];A.equal(d.sourceId,source);A(require('fs').existsSync(d.art));A(d.text);}
 const s=state();A(E.pool(s,D.cards).some(c=>c.id==='dragon19'));A(E.pool(s,D.spells).some(c=>c.id==='bloodContract'));s.activeTribes=['forest','royal','haven','artifact'];A(!E.pool(s,D.cards).some(c=>c.id==='dragon19'));A(!E.pool(s,D.spells).some(c=>['dragonWing','bloodContract'].includes(c.id)));
});
test('Cynthia grants 8/8 or 16/16 each combo, no army/resource/end reward',()=>{
 for(const golden of [false,true]){const s=state(),c=add(s,'forest4',{golden}),ally=add(s,'forest0'),foreign=add(s,'blood0'),old=s.board.map(body),m=golden?2:1;s.played=2;play(s,'bones');A.deepEqual(body(ally),old[1].map(n=>n+8*m));A.deepEqual(body(c),old[0]);A.deepEqual(body(foreign),old[2]);A.equal(s.progress.fairy,0);A.equal(s.hand.length,0);s.played=5;play(s,'bones');A.deepEqual(body(ally),old[1].map(n=>n+16*m));const b=E.copy(s.board);E.endRecruit(s);A.deepEqual(s.board,b);}
});
test('wing spell buffs now, queues three hits; research and Merlin do not multiply markers',()=>{
 const s=state(),left=add(s,'dragon0'),c=add(s,'dragon13'),right=add(s,'rune5');s.progress.spellcraft=7;const old=s.board.map(body);play(s,'dragonWing',c);A.deepEqual(body(c),old[1].map(n=>n+9));A.equal(c.dragonPings,3);A.deepEqual(body(left),old[0].map(n=>n+9));A.deepEqual(body(right),old[2].map(n=>n+9));A(!left.dragonPings&&!right.dragonPings);A.equal(s.progress.tavernAttack,0);play(s,'dragonWing',c);A.equal(c.dragonPings,6);A(E.validate(s));
 const d=E.make(s,'dragonWing');s.shop=[d];s.gold=4;const snap=E.copy(s);A(!E.act(s,'buyPlay',{uid:d.uid}).ok);A.deepEqual(s,snap);
});
test('wing resolves exact surviving injuries on both sides without mutating recruitment board',()=>{
 for(const side of [0,1])for(const shield of [false,true]){const s=state(),c=E.make(s,'dragon2',{health:10,attack:0,dragonPings:3,keywords:shield?['shield']:[]}),before=E.copy(c),r=side?E.combat(s,[],[c]):E.combat(s,[c],[]);A.deepEqual(c,before);const n=shield?2:3;A.deepEqual(gain(r,side,c),{attack:n,health:n});A.equal(r.events.filter(e=>e.text.startsWith('龙之翼击')).length,3);A.equal(r.events.flatMap(e=>e.impacts||[]).length,3);A.equal(r.events.flatMap(e=>e.impacts||[]).filter(i=>i.blocked).length,shield?1:0);A(!r.survivors[side][0].dragonPings);}
});
test('lethal pings stop; no injury growth on death, no repeats on reborn',()=>{
 const s=state(),c=E.make(s,'dragon13',{health:1,attack:0,dragonPings:6,heroReborn:true}),r=E.combat(s,[c],[]);A.equal(r.progress[0].tavernAttack,0);A.equal(r.events.filter(e=>e.text.startsWith('龙之翼击')).length,1);A.equal(r.events.filter(e=>e.kind==='summon'&&e.text.startsWith('复生')).length,1);A.equal(r.survivors[0][0].health,1);A(!r.survivors[0][0].dragonPings);
});
test('queued red-serpent growth feeds current/future shop only after settlement',()=>{
 const s=state(),c=add(s,'dragon13',{attack:0,health:10});s.shop=[E.make(s,'royal0')];const old=body(s.shop[0]);play(s,'dragonWing',c);const r=E.combat(s,s.board,[],s);A.equal(r.progress[0].tavernAttack,6);A.equal(r.progress[0].tavernHealth,9);A.deepEqual(body(s.shop[0]),old);E.settleProgress(s,r.progress[0]);A.deepEqual(body(s.shop[0]),[old[0]+6,old[1]+9]);E.settleProgress(s,r.progress[0]);A.deepEqual(body(s.shop[0]),[old[0]+6,old[1]+9]);
});
test('three hits use entry health for Lehab and every third injury restores Leviathan shield',()=>{
 const s=state(),c=E.make(s,'dragon13',{health:20,attack:0,dragonPings:3}),core=E.make(s,'dragon18',{attack:0}),r=E.combat(s,[c,core],[]);A.deepEqual(gain(r,0,c),{attack:24,health:48});A.equal(r.progress[0].tavernAttack,6);
 const l=E.make(s,'dragon5',{attack:0,health:20,dragonPings:4,keywords:[]}),v=E.combat(s,[l],[]),hits=v.events.flatMap(e=>e.impacts||[]);A.equal(hits.length,4);A.deepEqual(hits.map(i=>i.blocked),[false,false,false,true]);
});
test('wing markers survive save/triple, sum instead of doubling; clear from hand and board next round',()=>{
 const s=state(),a=add(s,'fairy',{dragonPings:3}),b=add(s,'fairy',{dragonPings:6}),c=E.make(s,'fairy');s.hand=[c];E.triples(s);const g=[...s.hand,...s.board].find(x=>x.id==='fairy');A(g.golden);A.equal(g.dragonPings,9);A(E.validate(s));const restored=E.normalize(E.copy(s));A.equal([...restored.hand,...restored.board].find(x=>x.id==='fairy').dragonPings,9);for(const n of [-1,1.5,Infinity]){const bad=E.copy(s);[...bad.hand,...bad.board].find(x=>x.id==='fairy').dragonPings=n;A(!E.validate(bad));}add(s,'dragon0',{dragonPings:3});E.startRound(s);A([...s.hand,...s.board].every(x=>!x.dragonPings));
});
test('dragon mage supplies one/two genuine spells; battlecry repeat pays no gold',()=>{
 for(const golden of [false,true]){const s=state();s.heroCry=true;const gold=s.gold;play(s,'dragon19',null,{golden});A.equal(s.hand.filter(c=>c.id==='dragonWing').length,golden?4:2);A.equal(s.gold,gold);A(!s.heroCry);A(D.fanfareIds.includes('dragon19'));}
});
test('dragon master buffs adjacent dragons then actually damages them, including golden triggers',()=>{
 for(const side of [0,1])for(const golden of [false,true]){const s=state(),m=golden?2:1,a=E.make(s,'dragon2',{attack:0,health:10,keywords:[]}),c=E.make(s,'dragon16',{attack:1,health:100,golden}),b=E.make(s,'dragon13',{attack:0,health:10}),foe=E.make(s,'neutral0',{attack:0,health:1}),r=side?E.combat(s,[foe],[a,c,b]):E.combat(s,[a,c,b],[foe]);A.deepEqual(gain(r,side,a),{attack:4*m,health:7*m});A.deepEqual(gain(r,side,b),{attack:3*m,health:6*m});A.equal(r.progress[side].tavernAttack,2*m);A.equal(r.progress[side].tavernHealth,3*m);A.equal(r.events.filter(e=>e.text.includes('龙技锤炼')).length,2);}
});
test('dead dragon master and foreign neighbors do not receive or generate training',()=>{
 const s=state(),a=E.make(s,'blood0',{attack:0,health:10}),c=E.make(s,'dragon16',{attack:1,health:1}),f=E.make(s,'neutral0',{attack:100,health:1}),r=E.combat(s,[a,c],[f]);A.deepEqual(r.permanent[0],{});A(!r.events.some(e=>e.text.includes('龙技锤炼')));
});
test('blood contract harms at purchase, heals after actual loss, no cast harm or immediate economy',()=>{
 const s=state();s.hp=20;s.gold=10;const core=add(s,'blood4');add(s,'blood11');add(s,'blood13');const c=E.make(s,'bloodContract');s.shop=[c];const old=body(core);A(E.act(s,'buy',{uid:c.uid}).ok);A.equal(s.gold,8);A.equal(s.hp,19);A.equal(s.bloodDamage,2);A.deepEqual(body(core),old.map(n=>n+2));A.equal(s.progress.tavernAttack,1);A(E.act(s,'play',{uid:c.uid}).ok);A.deepEqual(s.hand.map(x=>x.id),['bloodPact','bloodPact']);A.equal(s.hp,19);A.equal(s.bloodDamage,2);for(const x of [...s.hand])A(E.act(s,'play',{uid:x.uid,target:core.uid}).ok);A.equal(s.hp,19);A.equal(s.bloodDamage,2);A.equal(s.gold,8);A.equal(s.spells,3);
});
test('one hp cannot buy self-harm contracts or trigger Lilim, full hand purchase is atomic',()=>{
 const s=state();s.hp=1;s.gold=10;add(s,'blood11');const c=E.make(s,'bloodContract');s.shop=[c];const before=E.copy(s);A(!E.act(s,'buy',{uid:c.uid}).ok);A.deepEqual(s,before);play(s,'blood12');A.equal(s.hp,1);A.equal(s.bloodDamage,0);A.equal(s.hand.length,0);
 s.hp=20;s.hand=Array.from({length:10},()=>E.make(s,'bones'));const snapshot=E.copy(s);A(!E.act(s,'buy',{uid:c.uid}).ok);A.deepEqual(s,snapshot);
});
test('Lilim actual self-harm, golden resource multiplier and healing; repeats never print coins',()=>{
 for(const golden of [false,true]){const s=state();s.hp=10;add(s,'blood11');add(s,'blood4');s.heroCry=true;const gold=s.gold;play(s,'blood12',null,{golden});A.equal(s.bloodDamage,2);A.equal(s.hp,10);A.equal(s.hand.length,golden?4:2);A(s.hand.every(c=>c.id==='bloodPact'));A.equal(s.gold,gold);}
 const s=state();s.hp=2;s.shop=[E.make(s,'bloodContract')];s.gold=2;A(E.act(s,'buy',{uid:s.shop[0].uid}).ok);A.equal(s.hp,1);A.equal(s.bloodDamage,1);
});
test('AI targets injury payoffs, uses new supply, and reserves health for purchases',()=>{
 const s=state(),o=s.opponents[0];s.round=10;Object.assign(o,{hero:'dragon',tribe:'dragon',route:0,hp:30,tier:5,gold:0,powerUsed:true,board:['dragon13','dragon4','dragon18','dragon2'].map(id=>E.make(s,id)),hand:[E.make(s,'dragonWing'),E.make(s,'dragon19')],shop:[],progress:E.scaling.read()});AI.prepare(s,o,E,{started:true,bonusGold:false,deferEnd:true});A(o.board.find(c=>c.id==='dragon13').dragonPings>=3);A(!o.hand.some(c=>c.id==='dragonWing'));A(o.board.some(c=>c.id==='dragon19'));A(E.validate(s));
 for(const hp of [1,6,20]){const t=state(),p=t.opponents[0];t.round=8;Object.assign(p,{hero:'blood',tribe:'blood',route:0,hp,tier:4,gold:2,powerUsed:true,board:['blood4','blood11','blood13'].map(id=>E.make(t,id)),hand:[],shop:[E.make(t,'bloodContract')],progress:E.scaling.read()});AI.prepare(t,p,E,{started:true,bonusGold:false,deferEnd:true});if(hp<=6)A.equal(p.bloodDamage,0);else A(p.bloodDamage>=2);A(p.hp>0);A(E.validate(t));}
});
console.log('Passed '+passed+' injury and combo groups.');
