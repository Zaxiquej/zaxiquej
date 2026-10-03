'use strict';
const A=require('node:assert/strict'),fs=require('fs'),E=require('./engine'),D=require('./data'),AI=require('./ai'),S=E.scaling;let passed=0;
const test=(label,fn)=>{fn();passed++;console.log('PASS '+label);};
const state=()=>{const s=E.create('angel',91761,'normal',['forest','dragon','night','haven']);s.tier=6;s.shop=[];s.hand=[];s.board=[];return s;};
const cast=(s,id)=>{const c=E.make(s,id);s.hand.push(c);const r=E.act(s,'play',{uid:c.uid});A(r.ok,r.message);};
const expire=(s,id)=>{s.amulets.push({...E.make(s,id),count:1});cast(s,'clock');};
test('21 amulets have real identities, art, four-tribe availability and discover coverage',()=>{
 A.equal(D.rulesVersion,'19.0');A.equal(D.amulets.length,21);A.equal(new Set(D.amulets.map(d=>d.id)).size,21);for(const d of D.amulets){A(fs.existsSync(d.art));A.equal(d.name,d.sourceName);A([2,3].includes(d.originalType));A(d.count>0&&d.cost>0);const s=state();A.equal(D.discoveryPool(s,D.byId.seekAmulet).includes(d),E.available(s,d));A.equal(D.byId[d.id],d);}A.equal(D.byId.egg.related.length,0);A.equal(D.byId.egg.count,2);
});
test('dragon egg grows current/future offers, not existing hand, and resonance applies once',()=>{
 const s=state();s.progress.prayers=2;s.progress.devotion=2;s.shop=[E.make(s,'neutral0'),E.make(s,'bell')];s.hand=[E.make(s,'neutral1')];const a=s.shop[0].attack,h=s.hand[0].attack;A(S.amuletView(s,D.byId.egg).short.includes('+9/+9'));expire(s,'egg');A.equal(s.progress.tavernAttack,9);A.equal(s.shop[0].attack,a+9);A.equal(s.shop[1].attack,0);A.equal(s.hand[0].attack,h);A(!s.hand.some(c=>c.id==='ancient'));A.equal(s.progress.prayers,3);E.startRound(s);A(s.shop.filter(c=>D.byId[c.id].type==='minion').every(c=>c.attack===D.byId[c.id].attack+9));
});
test('research room gives fixed resources; temple uses its newly grown resonance',()=>{
 const s=state();s.progress.devotion=20;expire(s,'library');A.equal(s.progress.spellcraft,4);A.deepEqual(s.hand.map(c=>c.id),['mana','mana']);s.board=[E.make(s,'neutral0')];const a=s.board[0].attack,h=s.board[0].health;A(S.amuletView(s,D.byId.temple).short.includes('+27/+29'));expire(s,'temple');A.equal(s.progress.devotion,23);A.equal(s.board[0].attack-a,27);A.equal(s.board[0].health-h,29);
});
test('fairy resources can triple but do not increase army until the dedicated army amulet',()=>{
 const s=state();s.hand=[E.make(s,'fairy')];s.progress.devotion=2;expire(s,'fairyGlade');A.equal(s.hand.length,1);A(s.hand[0].golden);A.equal(s.hand[0].attack,6);A.equal(s.discover.length,1);A.equal(s.progress.fairy,0);A(E.act(s,'choose',{id:s.discover[0].options[0]}).ok);expire(s,'fairyRealm');A.equal(s.progress.fairy,6);A.equal(s.stats.triples,1);
});
test('royal frontline counts each of two enhancements per royal and grants no barrier',()=>{
 const s=state();s.board=['royal1','royal8','neutral0'].map(id=>E.make(s,id));const before=E.copy(s.board);s.progress.devotion=2;expire(s,'frontline');A.equal(s.progress.buffs,4);for(let i=0;i<2;i++){A.equal(s.board[i].attack-before[i].attack,8);A.equal(s.board[i].health-before[i].health,10);A.equal(S.shieldCount(s.board[i]),S.shieldCount(before[i]));}A.deepEqual(s.board[2],before[2]);
});
test('spellcraft and scrap payoffs read their respective progress and only buff their tribes',()=>{
 for(const [amulet,id,other,n]of [['magicField','rune1','forest0',18],['ancientAmplifier','artifact0','royal0',8]]){const s=state();s.progress.spellcraft=10;s.scrap=11;s.progress.devotion=3;s.board=[E.make(s,id),E.make(s,other)];const before=E.copy(s.board);expire(s,amulet);A.equal(s.board[0].attack-before[0].attack,n+3);A.equal(s.board[0].health-before[0].health,(amulet==='magicField'?9:n)+3);A.deepEqual(s.board[1],before[1]);A.equal(s.scrap,11);}
});
test('dragon canyon counts board dragons, adds resonance once, and does nothing without dragons',()=>{
 for(const count of [0,3]){const s=state();s.board=Array.from({length:count},()=>E.make(s,'dragon0'));s.progress.devotion=5;expire(s,'dragonCanyon');A.equal(s.progress.tavernAttack,count?14:0);A.equal(s.progress.tavernHealth,count?14:0);}
});
test('necromancy separates permanent army from an entry-scaled leftmost body',()=>{
 const s=state();s.progress.battleEntries=51;s.progress.devotion=5;s.board=['neutral0','night2','night0'].map(id=>E.make(s,id));const before=E.copy(s.board);expire(s,'deathBanquet');A.equal(s.progress.legionAttack,6);A.deepEqual(s.board,before);expire(s,'boneRing');A.equal(s.board[1].attack-before[1].attack,30);A.equal(s.board[1].health-before[1].health,30);A.deepEqual(s.board[2],before[2]);A.equal(s.progress.battleEntries,51);
});
test('blood moon pays independent self-harm and only sheep can recover hero health',()=>{
 for(const hp of [1,2,40]){const s=state();s.hp=hp;s.armor=5;s.progress.devotion=100;s.board=[E.make(s,'blood1')];const a=s.board[0].attack;expire(s,'bloodMoon');const n=Math.min(3,hp-1);A.equal(s.hp,hp-n);A.equal(s.armor,5);A.equal(s.bloodDamage,n);A.equal(s.board[0].attack-a,n*D.tuning.bloodStarter);}
 const s=state();s.hp=10;s.board=[E.make(s,'blood11')];expire(s,'bloodMoon');A.equal(s.hp,10);A.equal(s.bloodDamage,3);
});
test('summit converts leftmost haven health to attack once per payload, without health or barrier',()=>{
 const s=state();s.board=['neutral0','haven8','haven9'].map(id=>E.make(s,id));s.board[1].health=50;s.progress.devotion=4;const before=E.copy(s.board);A(S.amuletView(s,D.byId.summit).short.includes('+54'));expire(s,'summit');A.equal(s.board[1].attack-before[1].attack,54);A.equal(s.board[1].health,50);A.equal(S.shieldCount(s.board[1]),0);A.deepEqual(s.board[2],before[2]);
});
test('Sahaquiel repeats payload, not expiry triggers; returned copies reset countdown and stay in hand',()=>{
 const s=state();s.board=['neutral17','haven5','haven13'].map(id=>E.make(s,id));expire(s,'library');A.equal(s.progress.prayers,1);A.equal(s.progress.devotion,2);A.equal(s.progress.spellcraft,8);A.equal(s.hand.filter(c=>c.id==='mana').length,4);A.equal(s.hand.filter(c=>c.id==='library').length,1);A.equal(s.amulets.length,0);const c=s.hand.find(c=>c.id==='library');A(E.act(s,'play',{uid:c.uid}).ok);A.equal(s.amulets[0].count,2);A.equal(s.progress.prayers,1);
});
test('slots expire in order so new cultivation influences later payloads without extra completion',()=>{
 const s=state();s.progress.prayers=1;s.amulets=['temple','egg'].map(id=>({...E.make(s,id),count:1}));cast(s,'clock');A.equal(s.progress.prayers,3);A.equal(s.progress.devotion,3);A.equal(s.progress.tavernAttack,10);A.equal(s.amulets.length,0);
});
test('full hand burns overflow resources, gives no gold, and does not recursively place returned copies',()=>{
 const s=state();s.hand=Array.from({length:10},()=>E.make(s,'guard'));s.board=[E.make(s,'neutral17'),E.make(s,'haven5')];s.amulets=[{...E.make(s,'fairyGlade'),count:1}];const gold=s.gold;E.endRecruit(s);A.equal(s.hand.length,10);A.equal(s.gold,gold);A.equal(s.progress.prayers,1);A.equal(s.amulets.length,0);
});
test('manual removal gives no reward, legacy active egg saves remain valid, copied countdown uses new rules',()=>{
 const s=state();s.amulets=[{...E.make(s,'egg'),count:3}];A(E.validate(s));E.normalize(s);A.equal(s.amulets[0].count,3);A(E.act(s,'removeAmulet',{uid:s.amulets[0].uid}).ok);A.equal(s.progress.prayers,0);A.equal(s.progress.tavernAttack,0);cast(s,'egg');A.equal(s.amulets[0].count,2);A(E.validate(s));
});
test('all new previews and static AI valuations are finite; no AI game simulation',()=>{
 const s=state();s.tribe='haven';s.board=['forest0','royal1','rune0','dragon0','night0','artifact0','haven0'].map(id=>E.make(s,id));for(const d of D.amulets){A(S.amuletView(s,d).short.length>0);A(!/undefined|NaN/.test(S.amuletView(s,d).short));A(Number.isFinite(AI.amuletValue(s,d)));}s.board=[];for(const id of ['frontline','magicField','dragonCanyon','boneRing','ancientAmplifier','summit'])A(AI.amuletValue(s,D.byId[id])<0);
});
console.log(passed+' targeted amulet groups passed; no AI games or random battles.');

