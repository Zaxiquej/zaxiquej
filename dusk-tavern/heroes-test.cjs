'use strict';
const A=require('node:assert/strict'),E=require('./engine.js'),D=require('./data.js'),AI=require('./ai.js');
let groups=0;const test=(name,fn)=>{fn();groups++;console.log('PASS '+name);};
const act=(s,type,arg={})=>{const r=E.act(s,type,arg);A(r.ok,r.message);};
const neutral=D.heroes.filter(h=>h.tribe==='neutral');
test('four deterministic unique eligible offers; all six flexible heroes can occur with every pool',()=>{
 const seen=new Set();for(let seed=1;seed<=300;seed++){const ts=E.rollTribes(seed*7919),offers=E.rollHeroes(seed,ts);A.equal(offers.length,4);A.equal(new Set(offers).size,4);A.deepEqual(offers,E.rollHeroes(seed,ts));for(const id of offers){seen.add(id);A(E.heroAvailable(D.heroes.find(h=>h.id===id),ts));}for(const h of neutral)A(E.heroAvailable(h,ts));}A.equal(seen.size,22);
});
test('all heroes and seven AI start with assigned armor; neutral never occupies a tribe slot',()=>{
 A.equal(neutral.length,6);for(const h of D.heroes){A(Number.isInteger(h.armor)&&h.armor>=0);const s=E.create(h.id,78217);A.equal(s.hp,40);A.equal(s.armor,h.armor);A.equal(s.activeTribes.length,4);A(s.activeTribes.every(t=>D.tribeIds.includes(t)));A.equal(new Set([s.hero,...s.opponents.map(o=>o.hero)]).size,8);for(const o of s.opponents){A(s.activeTribes.includes(o.tribe));A.equal(o.armor,D.heroes.find(x=>x.id===o.hero).armor);}A(E.validate(s));}A(D.heroes.find(h=>h.id==='angel').armor>D.heroes.find(h=>h.id==='olivia').armor);
});
test('neutral powers pay real costs, work across tribes, persist gains and cannot be reused',()=>{
 for(const h of neutral){const s=E.create(h.id,711);s.gold=10;s.tier=4;s.board=['forest0','dragon0','neutral0'].map(id=>E.make(s,id));const before=E.copy(s.board);act(s,'power',{target:s.board[0].uid});A.equal(s.gold,10-h.cost);A(s.powerUsed);
 if(h.id==='goblin'){A.equal(s.pendingGold,2);A.equal(s.gold,9);s.round++;E.startRound(s);A.equal(s.gold,6);A.equal(s.pendingGold,0);s.round++;E.startRound(s);A.equal(s.gold,5);continue;}
 if(h.id==='angel'){A.deepEqual(s.board,before);A.equal(s.armor,h.armor+2);}
 if(h.id==='windgod')s.board.forEach((c,i)=>{A.equal(c.attack,before[i].attack+2);A.equal(c.health,before[i].health);});
 if(h.id==='athena'){A(s.board[0].keywords.includes('shield'));A.equal(s.board[0].health,before[0].health+4);A(!s.board[1].keywords.includes('shield'));}
 if(h.id==='bahamut'){A.equal(s.board[0].attack,before[0].attack+8);A.equal(s.board[0].health,before[0].health+4);}
 if(h.id==='olivia'){A.equal(s.progress.spellcraft,1);const c=E.make(s,'growth');s.hand.push(c);act(s,'play',{uid:c.uid,target:s.board[0].uid});A.equal(s.board[0].attack,before[0].attack+3);A.equal(s.board[0].health,before[0].health+3);}
 const used=JSON.stringify(s);A(!E.act(s,'power',{target:s.board[0].uid}).ok);A.equal(JSON.stringify(s),used);A.deepEqual(E.normalize(E.copy(s)).board,s.board);
 }
});
test('invalid hero targeting or empty wind board does not consume gold or activation',()=>{
 for(const h of neutral.filter(h=>h.target||h.id==='windgod')){const s=E.create(h.id,911),before=JSON.stringify(s);A(!E.act(s,'power',{target:999999}).ok);A.equal(JSON.stringify(s),before);}
 for(const h of neutral){const s=E.create(h.id,912);s.gold=0;s.board=[E.make(s,'neutral0')];const before=JSON.stringify(s);A(!E.act(s,'power',{target:s.board[0].uid}).ok);A.equal(JSON.stringify(s),before);}
});
test('armor absorbs repeated losses, overflows to health and cannot prevent lethal after depletion',()=>{
 const p={hp:8,armor:10};A.deepEqual(E.heroDamage(p,6),{armor:6,health:0});A.deepEqual(p,{hp:8,armor:4});A.deepEqual(E.heroDamage(p,7),{armor:4,health:3});A.deepEqual(p,{hp:5,armor:0});A.deepEqual(E.heroDamage(p,6),{armor:0,health:6});A.equal(p.hp,-1);
});
test('real player loss and real AI loss use armor and expose exact result breakdown',()=>{
 for(const win of [false,true]){const s=E.create('angel',7112,'normal',['royal','forest','dragon','artifact']);s.board=win?[E.make(s,'neutral0',{attack:9999,health:9999})]:[];act(s,'fight');A.equal(s.result.winner,win?0:1);const victim=win?s.opponents.find(o=>o.id===s.lastOpponent):s;A.equal(victim.hp,40);A.equal(victim.armor,D.heroes.find(h=>h.id===(win?victim.hero:s.hero)).armor-s.result.damage);A.deepEqual(s.result.heroDamage,{armor:s.result.damage,health:0});A(E.validate(s));}
 const s=E.create('angel',7112,'normal',['royal','forest','dragon','artifact']);s.armor=1;act(s,'fight');A(s.result.damage>1);A.equal(s.armor,0);A.equal(s.hp,40-(s.result.damage-1));A.deepEqual(s.result.heroDamage,{armor:1,health:s.result.damage-1});
});
test('AI-vs-AI damage also consumes armor rather than health',()=>{
 const s=E.create('angel',751,'normal',['royal','forest','dragon','artifact']);for(const o of s.opponents)o.armor=100;act(s,'fight');const peers=s.opponents.filter(o=>o.id!==s.lastOpponent);A(peers.some(o=>o.armor<100));A(peers.every(o=>o.hp===40));
});
test('blood purchase self-harm bypasses armor and healing does not refill it',()=>{
 const s=E.create('blood',7321);s.armor=7;s.hp=30;s.board=[E.make(s,'blood11')];s.shop=[E.make(s,'bloodPact')];act(s,'buy',{uid:s.shop[0].uid});A.equal(s.bloodDamage,1);A.equal(s.hp,30);A.equal(s.armor,7);s.board=[];s.powerUsed=false;act(s,'power');A.equal(s.hp,29);A.equal(s.armor,7);
});
test('fatigue bypasses armor on player and AI',()=>{
 const s=E.create('angel',333,'normal',['royal','forest','dragon','artifact']);s.round=16;s.armor=100;for(const o of s.opponents){o.armor=100;o.hero='angel';}act(s,'fight');A.equal(s.result.fatigue,2);A.equal(s.hp,38);A(s.armor>0);A(s.opponents.every(o=>o.hp===38&&o.armor>0));
});
test('legacy saves start at zero armor, depleted saves never refill, malformed values are rejected',()=>{
 const s=E.create('angel',923);delete s.armor;for(const o of s.opponents)delete o.armor;A(E.validate(s));E.normalize(s);A.equal(s.armor,0);A(s.opponents.every(o=>o.armor===0));E.normalize(s);A.equal(s.armor,0);s.armor=3;A.equal(E.normalize(E.copy(s)).armor,3);
 for(const bad of [-1,1.5,'12',null,NaN]){const x=E.copy(s);x.armor=bad;A(!E.validate(x));const y=E.copy(s);y.opponents[0].armor=bad;A(!E.validate(y));}
 act(s,'fight');const x=E.copy(s);x.result.heroDamage.armor='broken';A(!E.validate(x));delete s.result.heroDamage;A(E.validate(s));
});
test('AI retains each flexible hero and spent armor across recruitment and uses its power',()=>{
 for(const h of neutral){const s=E.create('royal',9021),o=s.opponents[0];o.hero=h.id;o.name=h.name;o.armor=3;o.gold=10;o.shop=[];o.board=['neutral0','royal0','royal2'].map(id=>E.make(s,id));s.round=8;const tribe=o.tribe;AI.prepare(s,o,E,{started:true,bonusGold:false,deferEnd:true});A.equal(o.hero,h.id);A.equal(o.tribe,tribe);A.equal(o.armor,h.id==='angel'?5:3);A(o.powerUsed,h.id);if(h.id==='goblin')A.equal(o.pendingGold,2);if(h.id==='olivia')A(o.progress.spellcraft>=1);A(E.validate(s));}
});
console.log('\n'+groups+' hero draft and armor groups passed.');
