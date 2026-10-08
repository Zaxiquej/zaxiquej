'use strict';
const A=require('node:assert/strict'),E=require('./engine'),D=require('./data');let groups=0;
const test=(n,f)=>{f();groups++;console.log('PASS '+n);};
const fresh=()=>E.create('angel',135791,'hard',['forest','blood','haven','royal']);
const quiet=(s,id='neutral0',extra={})=>E.make(s,id,{attack:0,health:100,keywords:['cannotAttack'],...extra});
const strikes=r=>r.events.filter(e=>e.text.includes('先制突袭'));
test('four-star redesign removes poison while three-star one-shot poison remains',()=>{
 A.equal(D.byId.neutral20.tier,4);A.equal(D.byId.neutral20.attack,6);A.equal(D.byId.neutral20.health,4);A.deepEqual(D.byId.neutral20.keywords,[]);A.equal(D.byId.neutral19.effect,'venomOnce');A.equal(D.byId.neutral19.tier,3);
 const s=fresh(),r=E.combat(s,[E.make(s,'neutral20')],[quiet(s)]);const hit=r.events.find(e=>e.kind==='attack');A.equal(hit.boards[1][0].health,94);A(!r.events.some(e=>e.kind==='destroy'));
});
test('either side preempts and can kill an opening effect before it resolves',()=>{
 for(const side of [0,1]){const s=fresh(),cobra=[E.make(s,'neutral20')],foe=[E.make(s,'haven16',{attack:0,health:4,keywords:[]})],r=E.combat(s,side?foe:cobra,side?cobra:foe);A.equal(strikes(r).length,1);A(!r.events.some(e=>e.text.includes('生命化身')));A.equal(r.winner,side);}
});
test('golden opens twice, normal once; opening attacks do not replace normal turns',()=>{
 for(const golden of [false,true]){const s=fresh(),c=E.make(s,'neutral20',{golden,attack:golden?12:6,health:golden?8:4}),r=E.combat(s,[c],[quiet(s)]);A.equal(strikes(r).length,golden?2:1);const opening=r.events.findIndex(e=>e.text==='开战效果结算完成。');A.equal(r.events.slice(0,opening).filter(e=>e.kind==='attack').length,golden?2:1);A(r.events.slice(opening).some(e=>e.kind==='attack'&&e.boards[0].some(x=>x.uid===c.uid&&x.battleId===e.from)));}
});
test('preemptive targeting respects guard, shield and stealth',()=>{
 const s=fresh(),core=quiet(s,'haven16',{health:3,keywords:['stealth','cannotAttack']}),guard=quiet(s,'neutral0',{keywords:['taunt','shield','cannotAttack']}),r=E.combat(s,[E.make(s,'neutral20')],[core,guard]);const first=r.events.find(e=>e.kind==='attack'),target=first.boards[1].find(c=>c.battleId===first.to);A.equal(target.uid,guard.uid);A.equal(target.health,100);A(!target.keywords.includes('shield'));A(first.boards[1].some(c=>c.uid===core.uid));
});
test('lethal retaliation stops golden repeats; reborn does not restart opening effect',()=>{
 const s=fresh(),c=E.make(s,'neutral20',{golden:true,attack:12,health:1,heroReborn:true}),r=E.combat(s,[c],[E.make(s,'neutral0',{attack:1000,health:10000})]);A.equal(strikes(r).length,1);A.equal(r.events.filter(e=>e.kind==='summon'&&e.text.startsWith('复生')).length,1);
});
test('cannot-attack and zero-attack units do not initiate opening attacks',()=>{
 for(const extra of [{keywords:['cannotAttack']},{attack:0}]){const s=fresh(),r=E.combat(s,[E.make(s,'neutral20',extra)],[quiet(s)]);A.equal(strikes(r).length,0);}
});
test('both-side ordering is randomized, while each side follows board order',()=>{
 const observed=new Set();for(const seed of [1,2147483648,123456789,4000000000]){const s=fresh();s.seed=seed;const board=()=>[E.make(s,'neutral20',{attack:1,health:10}),E.make(s,'neutral20',{attack:1,health:10})],r=E.combat(s,board(),board()),e=strikes(r),order=e.map(e=>e.boards.flat().find(c=>c.battleId===e.from).side);A.equal(e.length,4);A.deepEqual(order,[order[0],1-order[0],order[0],1-order[0]]);observed.add(order[0]);}A.equal(observed.size,2);
});
test('legacy poison removed from all live zones without losing buffs or other keywords',()=>{
 const s=fresh();delete s.preemptiveRulesVersion;const old=()=>E.make(s,'neutral20',{attack:100,health:200,keywords:['destruction','taunt']});s.board=[old()];s.hand=[old()];s.shop=[old()];s.pendingTriples=[{card:old()}];s.dormant=[{card:old()}];s.opponents[0].board=[old()];E.normalize(s);for(const c of [...s.board,...s.hand,...s.shop,s.pendingTriples[0].card,s.dormant[0].card,s.opponents[0].board[0]]){A.deepEqual(c.keywords,['taunt']);A.equal(c.attack,100);A.equal(c.health,200);}const before=E.copy(s);E.normalize(s);A.deepEqual(s,before);
});
test('visible replay and silent battle resolve identically',()=>{
 const s=fresh(),board=[E.make(s,'neutral20'),E.make(s,'forest13'),quiet(s,'forest19')],foe=[E.make(s,'neutral20'),E.make(s,'blood19')],a=E.copy(s),b=E.copy(s),r=E.combat(a,board,foe,s,{}),q=E.combat(b,board,foe,s,{},{record:false});delete r.events;delete q.events;A.deepEqual(r,q);A.equal(a.seed,b.seed);
});
console.log(groups+' preemptive groups passed; fixed encounters only.');
