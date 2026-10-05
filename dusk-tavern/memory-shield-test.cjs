'use strict';
const A=require('node:assert/strict'),E=require('./engine'),D=require('./data'),AI=require('./ai'),S=E.scaling;
const fresh=()=>E.create('rune',812,'hard',['rune','haven','forest','royal']);
const cast=s=>{const c=E.make(s,'coin');s.hand.push(c);A(E.act(s,'play',{uid:c.uid}).ok);};
for(const golden of [false,true]){
 const s=fresh(),g=E.make(s,'rune2',{golden});s.board=[g];const hp=g.health;cast(s);cast(s);A.equal(g.health,hp+2*(golden?2:1));A.equal(S.shieldCount(g),1);A.equal(g.temporaryShields,1);A(E.validate(s));const loaded=E.normalize(E.copy(s));E.startRound(loaded);A.equal(S.shieldCount(loaded.board[0]),0);A.equal(loaded.board[0].health,g.health);A((golden?D.byId.rune2.goldenText:D.byId.rune2.text).includes('下回合开始'));
}
{
 const s=fresh(),g=E.make(s,'rune2'),aura=E.make(s,'royal22');s.board=[g,aura];S.syncShieldAura(s.board);S.addShield(g);cast(s);cast(s);A.equal(S.shieldCount(g),3);A.equal(g.temporaryShields,2);E.startRound(s);A.equal(S.shieldCount(g),1);A.equal(g.temporaryShields,undefined);
 const plain=E.make(s,'rune2');S.addShield(plain,true);S.addShield(plain);S.expireShields(plain);A.equal(S.shieldCount(plain),1,'permanent grant replaces a nonstacking temporary layer');
 S.addShield(g,true);S.removeShieldLayer(g);A.equal(g.temporaryShields,undefined);A.equal(S.shieldCount(g),1);S.expireShields(g);A.equal(S.shieldCount(g),1);
}
for(const permanent of [false,true]){
 const s=fresh();s.board=Array.from({length:3},()=>E.make(s,'rune2'));s.board.forEach(c=>S.addShield(c,true));if(permanent)S.addShield(s.board[0]);E.triples(s);const gold=s.hand.find(c=>c.golden);A(gold);A.equal(gold.temporaryShields||0,permanent?0:1);E.startRound(s);A.equal(S.shieldCount(gold),permanent?1:0);A(E.validate(s));
}
{
 const s=fresh();s.board=[E.make(s,'rune2'),E.make(s,'rune2')];s.hand=Array.from({length:10},()=>E.make(s,'coin'));s.pendingTriples=[{card:E.make(s,'rune2'),reward:null}];for(const c of [...s.board,s.pendingTriples[0].card])S.addShield(c,true);E.triples(s);A.equal(s.pendingTriples[0].card.temporaryShields,1);E.startRound(s);A.equal(S.shieldCount(s.pendingTriples[0].card),0);A(E.validate(s));
}
{
 const s=fresh(),g=E.make(s,'rune2',{attack:0,health:10,keywords:['cannotAttack']}),enemy=E.make(s,'neutral0',{attack:0,health:10,keywords:['cannotAttack']});s.board=[g];cast(s);const r=E.combat(s,s.board,[enemy]);A.equal(S.shieldCount(r.events[0].boards[0][0]),1);A.equal(S.shieldCount(g),1);E.startRound(s);A.equal(S.shieldCount(g),0,'expiration does not depend on shield being broken in combat');
}
{
 const s=fresh();Object.assign(s,{round:14,tribe:'rune',route:0,buildId:'rune-casting',tier:6,gold:0});s.board=['haven20','haven16','rune2','rune6','rune3','rune7','royal10'].map(id=>E.make(s,id,{attack:id==='haven20'?4:id==='royal10'?1500:1000,health:id==='haven20'?6:id==='royal10'?1500:1000,...(id==='rune2'?{keywords:['taunt','shield']}: {})}));const plan=AI.currentPlan(s),incoming=E.make(s,'neutral0',{attack:1500,health:1500}),choice=AI.replacement(s,incoming,plan);A.equal(choice.old.id,'rune2');
 const o=s.opponents[0];Object.assign(o,{hero:'rune',tribe:'rune',route:0,buildId:'rune-casting',tier:6,hp:40,armor:0,gold:0,board:s.board,hand:[incoming],shop:[],amulets:[],powerUsed:true});s.board=[];AI.prepare(s,o,E,{started:true,bonusGold:false,shopLuck:false,deferEnd:true});A(o.board.some(c=>c.id==='haven20'));A(o.board.some(c=>c.id==='haven16'));A(!o.board.some(c=>c.id==='rune2'));A.equal(Math.abs(o.board.findIndex(c=>c.id==='haven20')-o.board.findIndex(c=>c.id==='haven16')),1);A(E.validate(s));
}
console.log('PASS normal/golden temporary shields, independent permanent layers, shield consumption, hand/pending triple inheritance, save reload, combat lifetime; AI retains and places Lorena/avatar together over a shielded gem golem.');
