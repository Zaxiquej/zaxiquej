'use strict';
const A=require('node:assert/strict'),E=require('./engine');
const s=E.create('forest',4812,'hard',['forest','royal','haven','rune']);s.board=[E.make(s,'royal13',{attack:34,health:87})];s.amulets=[E.make(s,'bell',{count:2})];
E.captureRound(s);A.equal(s.roundHistory[0].players.length,8);const first=JSON.stringify(s.roundHistory[0]);s.board[0].attack=900;s.progress.fairy=99;E.captureRound(s);A.equal(s.roundHistory.length,1);A.equal(JSON.stringify(s.roundHistory[0]),first);
s.round=2;s.opponents[0].hp=0;E.captureRound(s);A.equal(s.roundHistory[1].players.length,7);A.equal(s.roundHistory[1].players[0].board[0].attack,900);A(E.validate(s));A.deepEqual(E.normalize(E.copy(s)).roundHistory,s.roundHistory);
const bad=E.copy(s);bad.roundHistory[0].players[0].board[0].id='missing';A.equal(E.validate(bad),false);
const old=E.copy(s);delete old.roundHistory;A(E.validate(old));
// One fixed battle: all AI recruitment is stubbed, so this is not a simulated AI game.
const AI=require('./ai'),prepare=AI.prepare;try{AI.prepare=()=>{};const b=E.create('forest',17,'hard',['forest','royal','haven','rune']);b.board=[E.make(b,'forest1',{attack:10,health:10})];A(E.act(b,'fight').ok);A.equal(b.roundHistory.length,1);A.equal(b.roundHistory[0].players.length,8);A.equal(b.roundHistory[0].players[0].board[0].attack,10);A.equal(b.roundHistory[0].players[0].hpAfter,b.hp);A(E.validate(b));}finally{AI.prepare=prepare;}
console.log('PASS history snapshots, immutable copies, eliminated players, save migration/validation, battle capture timing.');
