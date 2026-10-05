'use strict';
const A=require('node:assert/strict'),E=require('./engine'),D=require('./data');
const fresh=()=>{const s=E.create('forest',487,'hard',['forest','dragon','rune','haven']);Object.assign(s,{hand:[],board:[],shop:[],amulets:[],discover:[],tier:4});return s;};
const fill=s=>s.hand=Array.from({length:10},()=>E.make(s,'coin'));
const act=(s,t,a)=>{const r=E.act(s,t,a);A(r.ok,r.message);A(E.validate(s));};
{
 let s=fresh();fill(s);s.board=Array.from({length:3},()=>E.make(s,'fairy',{attack:2,health:3}));E.triples(s);A.equal(s.board.length,0);A.equal(s.hand.length,10);A.equal(s.pendingTriples.length,1);A.equal(s.stats.discards||0,0);A.equal(s.discover.length,0);const g=s.pendingTriples[0].card,reward=s.pendingTriples[0].reward;A(g.golden);A.equal(g.attack,5);A.equal(g.health,8);A(E.validate(s));s=E.normalize(JSON.parse(JSON.stringify(s)));s.tier=6;act(s,'play',{uid:s.hand[0].uid});A.equal(s.hand.length,10);A(s.hand.some(c=>c.uid===g.uid));A.equal(s.pendingTriples.length,0);A.deepEqual(s.discover[0].options,reward);A(reward.every(id=>D.byId[id].tier===5));
 const id=reward[0];act(s,'choose',{id});A.equal(s.pendingTriples.length,1);A.equal(s.pendingTriples[0].card.id,id);A.equal(s.stats.discards||0,0);act(s,'play',{uid:s.hand.find(c=>c.id==='coin').uid});A.equal(s.pendingTriples.length,0);A(s.hand.some(c=>c.id===id));
}
{
 const s=fresh();fill(s);s.board=[E.make(s,'fairy'),E.make(s,'fairy')];E.battleCards(s,s,['fairy']);A.equal(s.board.length,2);A.equal(s.hand.length,10);A.equal(s.pendingTriples.length,1);A(!s.pendingTriples[0].card.golden);A.equal(s.stats.discards||0,0);E.triples(s);A.equal(s.board.length,2);s.round++;E.startRound(s);A.equal(s.board.length,0);A(s.pendingTriples[0].card.golden);A.equal(s.hand.length,10);A(E.validate(s));
}
{
 const s=fresh();fill(s);s.board=Array.from({length:3},()=>E.make(s,'fairy'));E.endRecruit(s);A.equal(s.board.length,3);A.equal(s.pendingTriples.length,0);s.round++;E.startRound(s);A.equal(s.board.length,0);A.equal(s.pendingTriples.length,1);
}
{
 const s=fresh();fill(s);s.board=Array.from({length:3},()=>E.make(s,'fairy'));E.triples(s);const golden=s.pendingTriples[0].card;s.hand[0]=E.make(s,'forest12');act(s,'play',{uid:s.hand[0].uid});A(s.hand.some(c=>c.uid===golden.uid));A.equal(s.stats.discards,1,'ordinary generated fairy loses the slot to the waiting triple');A.equal(s.hand.length,10);
}
{
 const s=fresh();fill(s);s.board=['fairy','fairy','fairy','skeleton','skeleton','skeleton'].map(id=>E.make(s,id));E.triples(s);A.equal(s.pendingTriples.length,2);const uids=s.pendingTriples.map(x=>x.card.uid);act(s,'play',{uid:s.hand[0].uid});A(s.hand.some(c=>c.uid===uids[0]));act(s,'choose',{id:s.discover[0].options[0]});act(s,'play',{uid:s.hand.find(c=>c.id==='coin').uid});A(s.hand.some(c=>c.uid===uids[1]));A.equal(s.stats.discards||0,0);
}
{
 const s=fresh();fill(s);E.battleCards(s,s,['skeleton']);A.equal(s.stats.discards,1);A.equal(s.pendingTriples.length,0);const old=E.copy(s);delete old.pendingTriples;A(E.validate(old));A.deepEqual(E.normalize(old).pendingTriples,[]);const invalid=E.copy(s);invalid.pendingTriples=[{card:E.make(invalid,'coin'),reward:null}];A(!E.validate(invalid));const duplicate=E.copy(s);duplicate.pendingTriples=[{card:duplicate.hand[0],reward:null}];A(!E.validate(duplicate));
}
console.log('PASS full-hand golden/reward protection, generated third-copy protection, no end-of-turn merges, FIFO slot priority, inherited buffs, saved reward tier, ordinary overflow and save validation.');
