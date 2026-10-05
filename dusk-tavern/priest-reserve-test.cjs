'use strict';
const A=require('node:assert/strict'),E=require('./engine'),D=require('./data'),AI=require('./ai');
const fresh=()=>{const s=E.create('haven',182,'hard',['haven','dragon','forest','rune']);Object.assign(s,{board:[],hand:[],amulets:[],tier:3});return s;};
A.equal(D.byId.haven5.tier,3);A.equal(D.byId.haven5.effect,'amuletReserve');A(D.abilityIds.endRecruit.includes('haven5'));
for(const golden of [false,true])for(const echo of [false,true]){
 const s=fresh();s.board=[E.make(s,'haven5',{golden})];if(echo)s.board.push(E.make(s,'neutral16'));
 const n=(golden?2:1)*(echo?2:1);E.endRecruit(s);A.equal(s.hand.length,n);A(s.hand.every(c=>D.byId[c.id].type==='amulet'&&E.pool(s,D.amulets).some(d=>d.id===c.id)));E.endRecruit(s);A.equal(s.hand.length,n);A(E.validate(s));A(Number.isFinite(AI.synergyValue(s,s.board[0])));
}
// Resolving amulets during recruitment must never create the former return loop.
{const s=fresh();s.board=[E.make(s,'haven5',{golden:true})];for(let i=0;i<3;i++){s.amulets=[{...E.make(s,'mine'),count:1}];const c=E.make(s,'clock');s.hand.push(c);A(E.act(s,'play',{uid:c.uid}).ok);A.equal(s.hand.length,0);}A.equal(s.progress.prayers,3);E.endRecruit(s);A.equal(s.hand.length,2);}
// Generated cards obey overflow discard, with no extra copy on the same expiry.
{const s=fresh();s.board=[E.make(s,'haven5',{golden:true})];s.hand=Array.from({length:10},()=>E.make(s,'coin'));s.amulets=[{...E.make(s,'mine'),count:1}];const n=s.stats.discards||0;E.endRecruit(s);A.equal(s.hand.length,10);A.equal(s.stats.discards,n+2);A.equal(s.progress.prayers,1);A(E.validate(s));}
for(let seed=1;seed<=30;seed++){const s=fresh();s.seed=seed;E.startRound(s);s.board=[E.make(s,'haven5')];s.hand=[];s.amulets=[];E.endRecruit(s);A(s.hand.every(c=>E.pool(s,D.amulets).some(d=>d.id===c.id)));}
console.log('PASS 3-star priest generates random amulets once per preparation trigger, golden/end-echo counts, no expiry returns, legal pools, overflow and save validation.');
