'use strict';
const A=require('node:assert/strict'),E=require('./engine'),D=require('./data'),AI=require('./ai'),Echo=require('./echoes'),S=E.scaling;
const fresh=()=>{const s=E.create('dragon',812,'hard',['dragon','forest','night','royal']);Object.assign(s,{tier:6,gold:30,board:[],hand:[],shop:[],amulets:[],discover:[]});return s;};
const act=(s,t,args={})=>{const r=E.act(s,t,args);A(r.ok,r.message);};
const play=(s,id,extra={})=>{const c=E.make(s,id,extra);s.hand.push(c);act(s,'play',{uid:c.uid});return c;};
for(const golden of [false,true]){
 const s=fresh(),m=golden?2:1,food=E.offer(s,'neutral0');s.shop=[food];const a=food.attack,h=food.health;
 const weaver=play(s,'dragon15',{golden});A.equal(s.progress.tavernAttack,m);A.equal(weaver.tavernWeaves,1);
 play(s,'dragon0');play(s,'dragon2');A.equal(s.progress.tavernAttack,6*m);A.equal(food.attack,a+6*m);A.equal(food.health,h+6*m);
 play(s,'neutral0');A.equal(weaver.tavernWeaves,3);A(S.formulaText(s,weaver,D.byId.dragon15.text).includes('+'+4*m+' 攻击'));
 s.frozen=true;E.startRound(s);A.equal(weaver.tavernWeaves,3);A.equal(food.attack,a+6*m);s.gold=20;act(s,'refresh');
 for(const c of s.shop.filter(c=>D.byId[c.id].type==='minion'))A.equal(c.attack,D.byId[c.id].attack+6*m);
 A(E.validate(s));const loaded=E.normalize(E.copy(s));A.equal(loaded.board[0].tavernWeaves,3);loaded.board[0].tavernWeaves=-1;A(!E.validate(loaded));
 const empty=AI.canCycle({...s,board:[]},E.make(s,'dragon0'));A(AI.canCycle(s,E.make(s,'dragon0'))>empty);
 s.recruitEnded=true;const cache=Echo.create({getItem:()=>null,setItem:()=>{}});A(cache.capture(s));A.equal(cache.export().records[0].board[0].tavernWeaves,3);
}
{
 const s=fresh(),first=play(s,'dragon15'),second=play(s,'dragon15');A.equal(first.tavernWeaves,2);A.equal(second.tavernWeaves,1);A.equal(s.progress.tavernAttack,4);
 s.hand.push(E.make(s,'dragon15',{tavernWeaves:4}));E.triples(s);const g=s.hand.find(c=>c.id==='dragon15');A(g.golden);A.equal(g.tavernWeaves,7);A.equal(s.board.length,0);s.discover=[];act(s,'play',{uid:g.uid});A.equal(s.progress.tavernAttack,20);A.equal(g.tavernWeaves,8);A(E.validate(s));
}
for(const golden of [false,true])for(const echo of [false,true]){
 const s=fresh(),m=golden?2:1;s.board=[E.make(s,'dragon25',{golden})];s.discardEcho=echo;const food=E.offer(s,'neutral0');s.shop=[food];const a=food.attack;
 s.hand=[E.make(s,'coin')];act(s,'discard',{uid:s.hand[0].uid});A.equal(s.progress.tavernAttack,2*m);A.equal(food.attack,a+2*m);
 s.hand=Array.from({length:10},()=>E.make(s,'coin'));E.battleCards(s,s,['coin']);A.equal(s.progress.tavernAttack,4*m);A.equal(s.stats.discards,2);A.equal(s.hand.length,10);A(E.validate(s));
}
for(const golden of [false,true])for(const echo of [false,true]){
 const s=fresh(),m=golden?2:1;s.board=[E.make(s,'dragon26',{golden})];if(echo)s.board.push(E.make(s,D.cards.find(c=>c.effect==='endEcho').id));
 E.endRecruit(s);A.equal(s.hand.filter(c=>c.id==='dragon').length,m*(echo?2:1));A.equal(s.hand.filter(c=>c.id==='newDestiny').length,0);A(E.validate(s));
}
for(const golden of [false,true]){
 const s=fresh(),m=golden?2:1,c=E.make(s,'dragon10',{golden,attack:87,health:65,keywords:['cannotAttack'],dragonPings:65}),enemy=E.make(s,'neutral0',{attack:0,health:100,keywords:['cannotAttack']});
 const r=E.combat(s,[c],[enemy]);A.equal(r.progress[0].tavernAttack,10*m);A.equal(r.progress[0].tavernHealth,8*m);A(S.formulaText(s,c,D.byId.dragon10.text).includes('+'+10*m+' 攻击'));
}
A.equal(D.byId.dragon25.tier,4);A.equal(D.byId.dragon26.tier,4);A.equal(D.byId.dragon12.effect,'destinySupply');A(D.abilityIds.endRecruit.includes('dragon26'));A.equal(D.cards.filter(c=>['dragon25','dragon26'].includes(c.id)).length,2);
console.log('PASS weaver escalating current/future tavern gains, independent copies, golden/triple counters, round/save/echo persistence, AI fuel valuation; normal/overflow discard; oracle/end echo; one-eighth deathrattle. No full AI games.');
