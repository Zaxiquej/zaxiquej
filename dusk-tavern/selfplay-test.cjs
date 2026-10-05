'use strict';
const A=require('node:assert/strict'),E=require('./engine'),S=require('./selfplay'),AI=require('./ai');
{
 const state=E.create('dragon',811,'hard',['dragon','haven','night','royal']);state.board=['dragon13','dragon2','night12','haven16','haven20'].map(id=>E.make(state,id,{health:80,dragonPings:id==='dragon13'?3:0}));const enemy=['royal0','neutral0','night7'].map(id=>E.make(state,id,{attack:70,health:50})),a=E.copy(state),b=E.copy(state),recorded=E.combat(a,a.board,enemy,a,{}, {record:true}),fast=E.combat(b,b.board,enemy,b,{}, {record:false});A(recorded.events.length>0);A.equal(fast.events.length,0);delete recorded.events;delete fast.events;A.deepEqual(fast,recorded);A.equal(a.seed,b.seed);A.equal(a.uid,b.uid);
}
{
 const a=S.create({seed:48120}),b=S.create({seed:48120});A.equal(new Set(a.state.opponents.map(p=>p.hero)).size,8);A.equal(a.state.activeTribes.length,4);A.deepEqual(S.step(a),S.step(b));A(a.history[0].players.every(p=>p.aiSummary.bonusGold===0&&p.aiSummary.luckyRefreshes===0));A.equal(new Set(a.history[0].battles.flatMap(b=>[b.a,b.b])).size,8);
 A(a.history[0].players.every(p=>p.aiSummary.decisions.length>0));const before=E.copy(a.history[0]);S.step(a);A.deepEqual(a.history[0],before);
}
{
 const s=S.create({seed:48120,maxRounds:1}),row=S.step(s);A.equal(s.status,'round-limit');A.equal(S.report(s).players.filter(p=>p.rank===1).length,0);A.equal(S.step(s),null);A.deepEqual(S.aggregate([S.report(s)]),[]);
}
{
 const r=S.create({seed:14}),s=r.state;S.step(r);s.opponents[7].hp=0;s.opponents[7].eliminatedRound=1;const row=S.step(r),real=row.battles.flatMap(b=>b.ghost?[b.a]:[b.a,b.b]);A.equal(row.battles.length,4);A.equal(row.battles.filter(b=>b.ghost).length,1);A.equal(new Set(real).size,7);A.equal(s.opponents[7].hp,0);A.equal(row.damageCap,15);
 s.opponents.slice(4).forEach(p=>{p.hp=0;p.eliminatedRound=2;});A.equal(S.step(r).damageCap,null);
}
{
 const r=S.create({seed:14});for(const p of r.state.opponents)p.lastOpponent=p.id^1;const pairs=S.pair(r.state,r.state.opponents,[]);A(pairs.every(([a,b])=>a.lastOpponent!==b.id));
}
{
 const a=E.create('rune',97,'hard',['rune','royal','dragon','artifact']);Object.assign(a,{tribe:'rune',route:1,buildId:'royal-rally',tier:6,board:[E.make(a,'rune6'),E.make(a,'royal10')]});A.equal(AI.spellTarget(a,{effect:'copyRecruit'}).id,'royal10');
 const r=S.create({seed:51,mode:'challenge'});r.state.round=6;A(S.step(r).players.every(p=>p.aiSummary.bonusGold===4));
}
console.log('PASS silent/recorded combat parity, deterministic eight heroes/four tribes, history/decision traces, fair economy, no false winner at round limit, ghost pairing, four-player cap, repeat avoidance and current-build copy targeting.');
