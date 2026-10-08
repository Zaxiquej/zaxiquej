'use strict';
const A=require('node:assert/strict'),E=require('./engine'),D=require('./data'),S=E.scaling,Echo=require('./echoes');let groups=0;
const test=(name,f)=>{f();console.log('PASS '+name);groups++;};
const fresh=()=>E.create('angel',72311,'hard',['forest','blood','night','royal']);
const quiet=(s,id,extra={})=>E.make(s,id,{attack:0,health:10000,keywords:['cannotAttack'],...extra});
const play=(s,id,extra={})=>{const c=E.make(s,id,extra);s.hand.push(c);const r=E.act(s,'play',{uid:c.uid});A(!r.error,JSON.stringify(r));return c;};
test('fairy growth requires an actual card source, not arbitrary played cards',()=>{
 const s=fresh();s.progress.totalPlayed=200;play(s,'coin');A.equal(S.fairy(s),0);
 play(s,'forest12');A.equal(s.board[0].attack,2);A.equal(s.board[0].health,2);A.equal(S.fairy(s),2);A.equal(s.hand.length,0);A.deepEqual(D.byId.forest12.related,[]);
 const r=E.combat(s,[E.make(s,'fairy')],[quiet(s,'neutral0')],s);A.equal(r.events[0].boards[0][0].attack,3);
 const t=fresh();play(t,'forest12',{golden:true});A.equal(S.fairy(t),4);A.equal(t.hand.length,0);const echoed=fresh();echoed.board=[quiet(echoed,'neutral14')];play(echoed,'forest12');A.equal(S.fairy(echoed),4);A.equal(echoed.hand.length,0);
});
test('Cybele grows army per spell card, with golden scaling but no battlecry or deathrattle',()=>{
 for(const golden of [false,true]){const s=fresh();s.board=[quiet(s,'neutral14')];play(s,'forest17',{golden});A.equal(S.fairy(s),0);play(s,'coin');A.equal(S.fairy(s),golden?2:1);s.heroSpellCopy=true;s.progress.spellcraft=20;play(s,'coin');A.equal(S.fairy(s),golden?4:2);play(s,'neutral0');A.equal(S.fairy(s),golden?4:2);const q=E.combat(s,[E.make(s,'forest17',{health:1})],[E.make(s,'neutral0',{attack:1000,health:10000})],s);A.equal(q.progress[0].fairy,S.fairy(s));}
 A(!D.fanfareIds.includes('forest17'));A(!D.abilityIds.lastWords.includes('forest17'));A(!D.abilityIds.lastWords.includes('forest19'));A.equal(D.byId.forest2.tier,3);A.equal(D.byId.forest2.attack,3);A.equal(D.byId.forest2.health,5);
 const s=fresh();play(s,'forest2');play(s,'fairy');A.equal(S.fairy(s),1);
});
test('early deathrattle grows army before spawning, and golden repeats scale correctly',()=>{
 for(const golden of [false,true]){const s=fresh(),c=E.make(s,'forest13',{golden,attack:1,health:1}),r=E.combat(s,[c],[E.make(s,'neutral0',{attack:1000,health:10000})],s);
 A.equal(r.progress[0].fairy,golden?2:1);A.equal(r.events.filter(e=>e.kind==='summon').length,1);A.equal(D.byId.forest13.related[0].count,1);const e=r.events.find(x=>x.kind==='summon');A(e);const fairy=e.boards[0].find(c=>c.id==='fairy');A.equal(fairy.attack,2*(golden?2:1));}
 const s=fresh(),c=E.make(s,'forest13',{health:1}),r=E.combat(s,[c,quiet(s,'neutral15')],[E.make(s,'neutral0',{attack:100000,health:100000})],s);A.equal(r.progress[0].fairy,2);
});
test('vanguard raises army before its own attack and retains its original deathrattle',()=>{
 const s=fresh(),r=E.combat(s,[E.make(s,'forest9',{attack:1,health:1}),quiet(s,'neutral0')],[E.make(s,'neutral0',{attack:1000,health:1000})],s);
 A.equal(r.progress[0].fairy,3);A(r.events.findIndex(e=>e.text.includes('先驱进军'))<r.events.findIndex(e=>e.kind==='attack'));A.equal(r.events.filter(e=>e.kind==='summon').length,1);A.equal(D.byId.forest9.related[0].count,1);
});
function assault(side=0,golden=false){const s=fresh(),producer=E.make(s,'forest13',{attack:1,health:1}),commander=quiet(s,'forest19',{golden}),board=[producer,commander],foe=[E.make(s,'neutral0',{attack:1,health:1000000})];return E.combat(s,side?foe:board,side?board:foe,side?{}:s,side?s:{});}
test('only six-star commander gives immediate fairy attacks, on either side with golden triple attacks',()=>{
 for(const side of [0,1])for(const golden of [false,true]){const r=assault(side,golden),attacks=r.events.filter(e=>e.kind==='attack'),firstFairy=attacks[1].boards[side].find(c=>c.battleId===attacks[1].from);A.equal(firstFairy.id,'fairy');A(attacks[1].text.includes('/'+(golden?3:2)));A.equal(attacks[1].from,attacks[2].from);}
 const s=fresh(),r=E.combat(s,[E.make(s,'forest13',{attack:1,health:1}),quiet(s,'forest17'),quiet(s,'forest10')],[E.make(s,'neutral0',{attack:1,health:1000000})],s);const attacks=r.events.filter(e=>e.kind==='attack');A.equal(attacks[1].boards[1][0].battleId,attacks[1].from);A(!attacks[1].text.includes('连击'));
});
test('bat deaths are a persistent mechanic without a payoff card and self-harm amplifies history',()=>{
 const s=fresh();A.equal(S.bat(s),0);const r=E.combat(s,[E.make(s,'bat')],[E.make(s,'neutral0',{attack:1000,health:10000})],s);A.equal(r.progress[0].batDeaths,1);E.settleProgress(s,r.progress[0]);A.equal(S.bat(s),1);
 s.progress.batDeaths=30;s.bloodDamage=19;A.equal(S.bat(s),49);s.bloodDamage=20;A.equal(S.bat(s),80);A.equal(S.bat({}),0);
});
test('reborn bat keeps its attack without reapplying the whole army, and returns at one health',()=>{
 const s=fresh();s.bloodDamage=20;s.progress.batDeaths=5;const r=E.combat(s,[E.make(s,'bat'),quiet(s,'blood21')],[E.make(s,'neutral0',{attack:1000,health:10000})],s);
 const e=r.events.find(e=>e.kind==='summon'&&e.text.startsWith('复生'));A(e);const c=e.boards[0].find(c=>c.id==='bat');A.equal(c.attack,33);A.equal(c.health,1);A.equal(r.progress[0].batDeaths,7);
});
test('six-star bat payoff buffs attackers only and is temporary',()=>{
 for(const golden of [false,true]){const s=fresh();s.bloodDamage=20;s.progress.batDeaths=5;const bat=E.make(s,'bat'),r=E.combat(s,[bat,quiet(s,'blood19',{golden})],[E.make(s,'neutral0',{attack:1000,health:10000})],s);
 const e=r.events.find(e=>e.text.includes('血翼进击'));A(e);A.equal(e.boards[0].find(c=>c.id==='bat').attack,31+30*(golden?2:1));A.equal(r.permanent[0][bat.uid],undefined);}
});
test('death batches count each actual bat once; non-bats and failed summons do not count',()=>{
 const s=fresh(),r=E.combat(s,[E.make(s,'bat'),E.make(s,'bat'),E.make(s,'neutral0',{health:1})],[E.make(s,'dragon7',{attack:10000,health:100000})],s);A.equal(r.progress[0].batDeaths,2);A.equal(r.progress[1].batDeaths,0);
});
test('normalization, save validation and historical capture preserve death counts',()=>{
 const s=fresh();s.progress.batDeaths=27;s.progress.fairy=13;const n=E.normalize(E.copy(s));A.equal(n.progress.batDeaths,27);A.equal(n.progress.fairy,13);A(E.validate(n));n.progress.batDeaths=-1;A(!E.validate(n));
 s.recruitEnded=true;const e=Echo.create({getItem:()=>null,setItem:()=>{}});A(e.capture(s));A.equal(e.export().records[0].progress.batDeaths,27);A(Echo.valid(e.export().records[0]));const old=E.copy(s);delete old.progress.batDeaths;A.equal(E.normalize(old).progress.batDeaths,0);
});
test('previews expose real army numbers; visible and silent combat have identical outcomes',()=>{
 const s=fresh();s.bloodDamage=20;s.progress.batDeaths=5;s.progress.fairy=12;A(S.formulaText(s,E.make(s,'blood19'),D.byId.blood19.text).includes('+30 攻击 / +30 生命'));A(S.summary(s).find(x=>x.tribe==='forest'&&x.label==='妖精军团').value.includes('12'));
 const board=[E.make(s,'forest13'),quiet(s,'forest19'),E.make(s,'bat'),quiet(s,'blood19'),quiet(s,'blood21')],foes=[E.make(s,'neutral0',{attack:1000,health:100000})],a=E.copy(s),b=E.copy(s),r=E.combat(a,board,foes,s,{}),q=E.combat(b,board,foes,s,{},{record:false});delete r.events;delete q.events;A.deepEqual(r,q);A.equal(a.seed,b.seed);
});
console.log(groups+' army rework groups passed; fixed encounters only.');
