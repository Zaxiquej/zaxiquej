'use strict';
const A=require('node:assert/strict'),E=require('./engine.js'),D=require('./data.js');let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}
const state=()=>E.create('royal',88771,'normal',['royal','haven','night','dragon']);
const relayEvents=r=>r.events.filter(e=>e.kind==='shield'&&e.text.includes('补充屏障'));
test('shield spell is retired in every tribe pool',()=>{
 for(const [tribes,want] of [[['royal','forest','dragon','blood'],true],[['haven','forest','dragon','blood'],true],[['royal','haven','dragon','blood'],true],[['artifact','forest','dragon','blood'],false]]){const s=E.create(tribes[0],177,'normal',tribes);A.equal(E.available(s,D.byId.shield),false);A(E.pool(s,D.cards).every(c=>c.tribe==='neutral'||tribes.includes(c.tribe)));}
});
test('flag bearer gives guard spells, with golden quantity and correct preview',()=>{
 for(const golden of [false,true]){const s=state(),m=golden?2:1,c=E.make(s,'royal13',{golden}),target=E.make(s,'royal11');s.board=[c,target];E.endRecruit(s);A.equal(s.hand.length,m);A(s.hand.every(x=>x.id==='guard'));A.equal(D.byId.royal13.related[0].id,'guard');const before=[target.attack,target.health];A(E.act(s,'play',{uid:s.hand[0].uid,target:target.uid}).ok);A(target.keywords.includes('taunt'));A(!target.keywords.includes('shield'));A.deepEqual([target.attack,target.health],[before[0]+1,before[1]+3]);A(E.validate(s));}
});
test('avenge shields only living other royal allies without shields, normal one / golden two on both sides',()=>{
 for(const side of [0,1])for(const golden of [false,true]){const s=state(),white=E.make(s,'royal15',{golden,attack:0,health:10000}),knight=E.make(s,'royal0',{attack:0,health:10000}),other=E.make(s,'royal11',{attack:0,health:10000}),foreign=E.make(s,'neutral0',{attack:0,health:10000}),fodder=[E.make(s,'neutral0',{attack:0,health:1}),E.make(s,'neutral0',{attack:0,health:1})],team=[white,knight,other,foreign,...fodder],foes=[E.make(s,'dragon7',{attack:2,health:100000})],before=E.copy(team),r=side?E.combat(s,foes,team):E.combat(s,team,foes),events=relayEvents(r);
  A.equal(events.length,golden?2:1);A.equal(new Set(events.map(e=>e.to)).size,events.length);for(const e of events){const target=e.boards[side].find(x=>x.battleId===e.to);A(['royal0','royal11'].includes(target.id));A(target.keywords.includes('shield'));A.equal(e.from,e.boards[side].find(x=>x.uid===white.uid).battleId);}A.deepEqual(team,before);
 }
});
test('replacement shields can break again and trigger knight plus Emilia permanent growth',()=>{
 const s=state(),white=E.make(s,'royal15',{attack:0,health:10000}),knight=E.make(s,'royal0',{attack:1,health:10000}),emilia=E.make(s,'royal6',{attack:0,health:10000});
 // A golden relay shields both eligible recipients after the opening breaks the knight's shield.
 white.golden=true;const team=[white,knight,emilia,E.make(s,'neutral0',{attack:0,health:1}),E.make(s,'neutral0',{attack:0,health:1})],r=E.combat(s,team,[E.make(s,'dragon7',{attack:2,health:100000})]);
 A.equal(relayEvents(r).length,2);const breaks=r.events.filter(e=>e.text.includes('不屈之光')).length;A.equal(breaks,2);const army=r.events.filter(e=>e.text.includes('白银传承')).length;A(army>=3);A.deepEqual(r.permanent[0][knight.uid],{attack:breaks+army*2,health:breaks+army*2});A(knight.keywords.includes('shield'));A(!white.keywords.includes('shield'),'combat shields never write back into original keywords');
});
test('no-target avenge is a no-op and a dead relay cannot observe simultaneous deaths',()=>{
 for(const die of [false,true]){const s=state(),white=E.make(s,'royal15',{attack:0,health:die?1:10000}),team=[white,E.make(s,'neutral0',{attack:0,health:1}),E.make(s,'neutral0',{attack:0,health:1}),E.make(s,'neutral0',{attack:0,health:10000})],r=E.combat(s,team,[E.make(s,'dragon7',{attack:2,health:100000})]);A.equal(relayEvents(r).length,0);}
});
test('relay can replenish multiple times across successive death waves',()=>{
 let found=false;for(let seed=1;seed<=20&&!found;seed++){const s=state();s.seed=seed;const team=[E.make(s,'royal0',{attack:0,health:10000}),...Array.from({length:3},()=>E.make(s,'night0',{attack:0,health:1,keywords:['taunt']})),E.make(s,'royal15',{attack:0,health:10000})],r=E.combat(s,team,[E.make(s,'dragon6',{attack:2,health:100000})]);if(relayEvents(r).length>=2)found=true;}A(found,'successive avenge activations must restore a shield that broke again');
});
console.log(passed+' shield support groups passed.');
