'use strict';
const A=require('node:assert/strict'),E=require('./engine'),D=require('./data'),AI=require('./ai');
const fresh=()=>E.create('dragon',72,'hard',['dragon','forest','night','royal']);
const quiet=(s,id,extra={})=>E.make(s,id,{attack:0,health:100,keywords:['cannotAttack'],...extra});
const waves=r=>r.events.filter(e=>e.text.includes('谢幕震击'));
A.equal(D.byId.dragon16.tier,4);A.equal(D.byId.dragon16.attack,6);A.equal(D.byId.dragon16.health,7);
A(D.abilityIds.lastWords.includes('dragon16'));const discovery=fresh();discovery.tier=4;A(D.discoveryPool(discovery,D.byId.seekLast).some(c=>c.id==='dragon16'));
for(const golden of [false,true]){
 const s=fresh(),source=quiet(s,'dragon16',{health:1,dragonPings:1,golden}),hurt=quiet(s,'dragon2'),ally=quiet(s,'neutral0',{keywords:['cannotAttack','shield']}),enemy=quiet(s,'neutral0',{keywords:['cannotAttack','shield']});
 const r=E.combat(s,[source,hurt,ally],[enemy]),n=golden?4:2;
 A.equal(waves(r).length,n);A.equal(r.permanent[0][hurt.uid].attack,D.tuning.dragonHurt*n);A.equal(r.permanent[0][hurt.uid].health,D.tuning.dragonHurtHealth*n);
 for(const uid of [ally.uid,enemy.uid]){const final=r.survivors.flat().find(c=>c.uid===uid);A.equal(final.health,100-(n-1));A(!final.keywords.includes('shield'));const bid=r.events[0].boards.flat().find(c=>c.uid===uid).battleId,hits=r.events.flatMap(e=>e.impacts).filter(i=>i.target===bid);A.equal(hits.length,n);A.equal(hits[0].blocked,true);A(hits.slice(1).every(i=>i.amount===1&&!i.blocked));}
 A.equal(s.hp,40);A.equal(source.health,1,'combat copies preserve recruitment board');
}
{
 const s=fresh(),r=E.combat(s,[quiet(s,'dragon16',{health:1,dragonPings:1}),quiet(s,'forest0',{health:1}),quiet(s,'neutral0',{health:1,heroReborn:true})],[quiet(s,'neutral0')]);
 A.equal(waves(r).length,2);const first=r.events.indexOf(waves(r)[0]),second=r.events.indexOf(waves(r)[1]);
 const summon=r.events.findIndex(e=>e.kind==='summon'&&e.text.includes('妖精'));A(summon>first&&summon<second);A(r.events.slice(second).flatMap(e=>e.voices).some(v=>v.kind==='death'&&v.id==='fairy'));
 A.equal(r.deadCount[0],5,'source, original fairy spawner, token, original and reborn neutral');
}
{
 const s=fresh(),echo=D.cards.find(c=>c.effect==='lastWordsEcho');const r=E.combat(s,[quiet(s,'dragon16',{health:1,dragonPings:1}),quiet(s,echo.id)],[quiet(s,'neutral0')]);A.equal(waves(r).length,4);
 s.board=[quiet(s,'dragon16'),quiet(s,'dragon2')];s.amulets=[];A(Number.isFinite(AI.synergyValue(s,s.board[0])));
}
console.log('PASS normal/golden sequential waves, shields on both sides, permanent injury growth, inter-wave death/summon/rebirth, deathrattle echo, discovery registration and AI valuation.');
