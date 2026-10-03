'use strict';
const A=require('node:assert/strict'),E=require('./engine.js'),D=require('./data.js');
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}
const state=()=>E.create('haven',815721,'normal',['haven','royal','dragon','rune']);
const add=(s,id,extra={})=>{const c=E.make(s,id,extra);s.board.push(c);return c;};
function act(s,type,args){const r=E.act(s,type,args);A.equal(r.ok,true,r.message);return r;}
function play(s,id,extra={},index){const c=E.make(s,id,extra);s.hand.push(c);act(s,'play',{uid:c.uid,index});return c;}
function allCards(s){return [...s.board,...s.hand,...s.shop,...s.amulets,...s.opponents.flatMap(o=>o.board),...(s.result?.events||[]).flatMap(e=>e.boards.flat()),...(s.result?.survivors||[]).flat()];}
function assertNoEvolution(s){A(!Object.hasOwn(s,'evo'));A(!Object.hasOwn(s.stats,'evolutions'));for(const c of allCards(s))A(!Object.hasOwn(c,'evolved'),c.id+' retains evolved');}
function stripLegacyKeys(value){if(Array.isArray(value))return value.map(stripLegacyKeys);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([key])=>!['evo','evolved','evolutions'].includes(key)).map(([key,v])=>[key,stripLegacyKeys(v)]));return value;}

test('new games and golden merges contain no evolution state and retain existing bonuses',()=>{
 const s=state();assertNoEvolution(s);A(E.validate(s));
 const d=D.byId.neutral0;add(s,'neutral0',{attack:d.attack+4,health:d.health+7});add(s,'neutral0');s.hand.push(E.make(s,'neutral0'));E.triples(s);
 A.equal(s.board.length,1);A(s.board[0].golden);A.equal(s.board[0].attack,d.attack*2+4);A.equal(s.board[0].health,d.health*2+7);A.equal(s.discover.length,1);assertNoEvolution(s);A(E.validate(s));
});

test('retired evolve action is rejected without spending or modifying any state',()=>{
 const s=state(),c=add(s,'neutral0');s.evo=3;c.evolved=false;s.stats.evolutions=4;
 const before=E.copy(s);A.equal(E.act(s,'evolve',{uid:c.uid}).ok,false);A.deepEqual(s,before);
});

test('normalization preserves legacy recruit stats, cards, and progress and is idempotent',()=>{
 const s=state();s.evo=3;s.stats.evolutions=9;s.round=7;s.grave=12;s.spells=4;s.stats.spells=4;
 const c=add(s,'neutral0',{attack:44,health:61});s.hand=[E.make(s,'evo')];s.amulets=[{...E.make(s,'bell'),count:2}];s.opponents[0].board=[E.make(s,'royal0',{attack:37,health:48})];
 for(const card of allCards(s))card.evolved=true;
 const before=E.copy(s);A(E.validate(s),'legacy recruit save must be accepted');E.normalize(s);
 A.equal(s.board[0],c,'normalization must not replace active card objects');A.deepEqual(s,stripLegacyKeys(before));A(E.validate(s));assertNoEvolution(s);
 const clean=E.copy(s);E.normalize(s);A.deepEqual(s,clean);A.equal(s.hand[0].id,'evo');
});

test('normalization reaches AI cards, every battle replay frame, and survivors without altering combat',()=>{
 const s=state();add(s,'neutral0',{attack:300,health:500});act(s,'fight');A(s.result.events.length>1);A(s.result.survivors.flat().length>0);
 s.evo=2;s.stats.evolutions=6;for(const card of allCards(s))card.evolved=true;
 const before=E.copy(s);A(E.validate(s),'legacy battle result must be accepted');E.normalize(s);
 A.deepEqual(s,stripLegacyKeys(before));assertNoEvolution(s);A(E.validate(s));
 const restored=JSON.parse(JSON.stringify(s));A(E.validate(restored));act(restored,'continue');assertNoEvolution(restored);A.equal(restored.board[0].attack,300);A.equal(restored.board[0].health,500);
});

test('round transitions and AI preparation through round twelve never restore evolution',()=>{
 const s=state();s.hp=s.maxHp=10000;s.opponents.forEach(o=>o.hp=10000);
 while(s.round<12){while(s.discover.length)act(s,'choose',{id:s.discover[0].options[0]});act(s,'fight');assertNoEvolution(s);A(E.validate(s));act(s,'continue');assertNoEvolution(s);}
 A.equal(s.round,12);A(s.opponents.every(o=>o.board.length>0));A(E.validate(s));
});

test('the old Light path card id now buffs the whole board without a target or energy',()=>{
 const s=state(),a=add(s,'neutral0'),b=add(s,'forest0'),before=[a,b].map(c=>[c.attack,c.health]);
 A.equal(D.byId.evo.name,'光明之路');A.equal(D.byId.evo.effect,'fortify');A.equal(D.byId.evo.target,false);play(s,'evo');
 [a,b].forEach((c,i)=>{A.equal(c.attack,before[i][0]+1);A.equal(c.health,before[i][1]+2);});A.equal(s.spells,1);A.equal(s.stats.spells,1);assertNoEvolution(s);
 const empty=state();play(empty,'evo');A.equal(empty.spells,1);assertNoEvolution(empty);A(E.validate(empty));
});

test('Olivia buffs other allies on entry and no longer has a separate end trigger',()=>{
 for(const golden of [false,true]){
  const s=state(),m=golden?2:1,left=add(s,'neutral0'),right=add(s,'forest0'),far=add(s,'rune1');
  const before=[left,right,far].map(c=>[c.attack,c.health]),d=D.byId.neutral4;
  A.equal(d.effect,'rally');const olivia=play(s,'neutral4',{golden,attack:d.attack*m,health:d.health*m},1);
  [left,right,far].forEach((c,i)=>{A.equal(c.attack,before[i][0]+6*m);A.equal(c.health,before[i][1]+6*m);});A.equal(olivia.attack,d.attack*m);A.equal(olivia.health,d.health*m);
  act(s,'fight');[left,right,far].forEach((c,i)=>{const gain=6*m;A.equal(c.attack,before[i][0]+gain);A.equal(c.health,before[i][1]+gain);});A.equal(olivia.attack,d.attack*m);A.equal(olivia.health,d.health*m);assertNoEvolution(s);
 }
});

test('Olivia remains a useful repeatable royal battlecry without granting evolution resources',()=>{
 const s=state(),general=add(s,'royal3'),other=add(s,'neutral0');const ga=general.attack,gh=general.health,oa=other.attack,oh=other.health;
 play(s,'neutral4');A.equal(general.attack,ga+12);A.equal(general.health,gh+12);A.equal(other.attack,oa+12);A.equal(other.health,oh+12);assertNoEvolution(s);
});

test('initiates give blessing and immediately expire only the lowest countdown amulet',()=>{
 for(const golden of [false,true]){
  const s=state(),m=golden?2:1;s.amulets=[{...E.make(s,'garden'),count:3},{...E.make(s,'tomb'),count:1}];
  play(s,'haven1',{golden});A.equal(s.amulets.length,1);A.equal(s.amulets[0].id,'garden');A.equal(s.amulets[0].count,3,'golden acceleration must not spill onto another amulet');A.equal(s.grave,6);A.equal(s.hand.filter(c=>c.id==='bless').length,m);A.equal(s.hand.filter(c=>c.id==='skeleton').length,1);assertNoEvolution(s);A(E.validate(s));
 }
});

test('golden initiate applies its full reduction to one surviving target and empty racks remain playable',()=>{
 const s=state();s.amulets=[{...E.make(s,'garden'),count:4},{...E.make(s,'bell'),count:3}];play(s,'haven1',{golden:true});A.deepEqual(s.amulets.map(c=>c.count),[4,1]);A.equal(s.hand.filter(c=>c.id==='bless').length,2);
 const empty=state();play(empty,'haven1');A.equal(empty.hand.filter(c=>c.id==='bless').length,1);A(E.validate(empty));
});

test('current rules and normal/golden card descriptions never advertise retired evolution',()=>{
 for(const c of [...D.cards,...D.spells,...D.amulets])A(!/进化/.test([c.text,c.goldenText,c.signature].filter(Boolean).join(' ')),c.id);
 A(!/进化/.test(JSON.stringify(D.builds)));A(!/进化/.test(JSON.stringify(D.archetypes)));
});

console.log('\n'+passed+' no-evolution regression groups passed.');
