'use strict';
const A=require('node:assert/strict'),E=require('./engine.js'),D=require('./data.js'),AI=require('./ai.js');let passed=0;
const test=(name,fn)=>{fn();passed++;console.log('PASS '+name);};
const state=(tribe='dragon')=>E.create(tribe,83171,'normal'),add=(s,id,x={})=>{const c=E.make(s,id,x);s.board.push(c);return c;};
const act=(s,t,arg)=>{const r=E.act(s,t,arg);A(r.ok,r.message);};
function play(s,id,target,x={}){const c=E.make(s,id,x);s.hand.push(c);act(s,'play',{uid:c.uid,target:target?.uid});return c;}
const body=c=>[c.attack,c.health],ledger=(r,side,c)=>r.permanent[side][c.uid]||{attack:0,health:0};
test('169 verified followers: eight added per tribe, no duplicate identity or accidental effect collision',()=>{
 A.equal(D.cards.length,169);A.equal(D.cards.filter(c=>c.synergy).length,65);A.equal(new Set(D.cards.map(c=>c.sourceId)).size,169);
 for(const t of D.tribeIds){const cs=D.cards.filter(c=>c.tribe===t);A.equal(cs.length,['forest','blood','dragon'].includes(t)?20:19);A.deepEqual([...new Set(cs.map(c=>c.tier))].sort((a,b)=>a-b),[1,2,3,4,5,6]);for(const c of cs){A(c.sourceUrl.endsWith('/'+c.sourceId));A(c.goldenText);}}
 for(const c of D.cards.filter(c=>c.synergy&&!['knightGift','spellGift','battleBrood'].includes(c.effect)))A(!D.cards.some(x=>!x.synergy&&x.effect===c.effect),c.effect);
});
test('every token triples across hand and board, preserves buffs and keywords, discovers legal next-tier minions',()=>{
 for(const d of D.tokens){const s=state(d.tribe==='neutral'?'dragon':d.tribe);s.tier=4;
  const a=add(s,d.id,{attack:d.attack+7,health:d.health+11,keywords:['taunt']}),b=E.make(s,d.id,{attack:d.attack+3,keywords:['shield']}),c=E.make(s,d.id);s.hand=[b,c];E.triples(s);
  A.equal(s.board.length,1);const g=s.board[0];A(g.golden);A.deepEqual(body(g),[d.attack*2+10,d.health*2+11]);A.deepEqual(new Set(g.keywords),new Set(['taunt','shield']));A.equal(s.hand.length,0);A.equal(s.discover.length,1);A(s.discover[0].options.every(id=>D.byId[id].tier===5&&E.available(s,D.byId[id])&&!D.byId[id].token));A(E.validate(s));
  act(s,'choose',{id:s.discover[0].options[0]});A.equal(s.stats.triples,1);
  s.hand=[E.make(s,d.id),E.make(s,d.id)];E.triples(s);A.equal(s.discover.length,0,'golden is not a fourth normal copy');
 }
});
test('large token gifts merge repeatedly without burning reward slots or mutating combat summons',()=>{
 const s=state('forest');add(s,'royal3',{golden:true});play(s,'forest8',null,{golden:true});A.equal(s.hand.filter(c=>c.id==='fairy'&&c.golden).length,4);A.equal(s.discover.length,4);A.equal(s.board.length,2);A(E.validate(s));
 const t=state(),l=Array.from({length:3},()=>E.make(t,'fairy',{health:100})),before=JSON.stringify(l),r=E.combat(t,l,[E.make(t,'neutral0',{attack:1,health:1000})]);A.equal(r.events[0].boards[0].length,3);A(r.events[0].boards[0].every(c=>!c.golden));A.equal(JSON.stringify(l),before);A.equal(t.discover.length,0);
});
test('tier-one shield knight has 2/2 stats and gains one permanent attack and health per broken shield',()=>{
 A.deepEqual([D.byId.royal0.attack,D.byId.royal0.health],[2,2]);for(const golden of [false,true]){const s=state(),c=E.make(s,'royal0',{golden}),r=E.combat(s,[c],[E.make(s,'neutral0',{attack:20,health:100})]);A.deepEqual(ledger(r,0,c),{attack:golden?2:1,health:golden?2:1});A(r.events.flatMap(e=>e.impacts).some(i=>i.blocked));}
});
test('spell research buffs only nonzero spell attributes and does not create free coins, shields or resources',()=>{
 for(const id of ['growth','mana','bless','guard','bloodPact','ritual','module']){const s=state(),target=add(s,'artifact0');s.progress.spellcraft=9;s.grave=12;const before=body(target),d=D.byId[id],base=id==='growth'?[2,2]:id==='mana'?[2,0]:id==='bless'?[0,3]:id==='guard'?[1,3]:id==='bloodPact'?[3,3]:id==='dragon'?[4,4]:id==='ritual'?[12,12]:[1,2];
  play(s,id,target);A.deepEqual(body(target),before.map((v,i)=>v+base[i]+(base[i]?9:0)),id);
 }
 const s=state(),c=add(s,'neutral0'),before=body(c);s.progress.spellcraft=100;const retired=E.make(s,'shield');s.hand.push(retired);A(!E.act(s,'play',{uid:retired.uid,target:c.uid}).ok);s.hand=[];A.deepEqual(body(c),before);play(s,'rich');A.equal(s.pendingGold,2);play(s,'bones');A.equal(s.grave,5);s.grave=0;play(s,'ritual',c);A.deepEqual(body(c),before);
});
test('research applies once before Merlin spreads the actual boosted payload',()=>{
 const s=state(),a=add(s,'neutral0'),b=add(s,'artifact6'),c=add(s,'neutral1');add(s,'rune5');s.progress.spellcraft=7;const before=s.board.map(body);play(s,'growth',b);[a,b,c].forEach((x,i)=>A.deepEqual(body(x),before[i].map(v=>v+9)));
});
test('research entry is repeatable and golden; cries train followers and research entry repeats; commander no longer adds spell research',()=>{
 for(const golden of [false,true]){const s=state(),m=golden?2:1;add(s,'royal3');const champion=add(s,'royal14'),academy=add(s,'royal18'),before=body(champion);play(s,'rune12',null,{golden});A.equal(s.progress.spellcraft,2*m);A.deepEqual(body(champion),before.map(v=>v+8));A.equal(academy.attack,D.byId.royal18.attack);}
});
test('third-spell research and payoff counters persist through end turn and save/load',()=>{
 const s=state('rune'),a=add(s,'rune13'),b=add(s,'rune18'),target=add(s,'neutral0');s.progress.spellcraft=5;
 play(s,'bones');play(s,'bones');A.equal(a.spellTicks,2);E.endRecruit(s);E.normalize(s);A.equal(a.spellTicks,2);const before=body(target);play(s,'bones');A.equal(s.progress.spellcraft,7);A.equal(a.spellTicks,0);A.equal(b.spellTicks,0);A.deepEqual(body(target),before.map(v=>v+7));A(E.validate(JSON.parse(JSON.stringify(s))));
});
test('combo research and adjacent fairy rally do not turn the new combat summoner into recruitment resources',()=>{
 const s=state(),research=add(s,'forest14'),rally=add(s,'forest16'),other=add(s,'forest18');s.played=2;const before=body(other);const fairy=play(s,'fairy');A.equal(s.progress.spellcraft,1);A.deepEqual(body(other),[before[0]+2,before[1]+2]);A.deepEqual(body(rally),[D.byId.forest16.attack,D.byId.forest16.health]);act(s,'sell',{uid:fairy.uid});const trader=play(s,'forest13');act(s,'sell',{uid:trader.uid});A.equal(s.hand.length,0);A.equal(research.health,D.byId.forest14.health+2);
});
test('high-tier dragon brood consumes actual shop stats without depending on tavern tier',()=>{
 const s=state(),study=add(s,'dragon15',{golden:true}),brood=add(s,'dragon17',{attack:80}),other=add(s,'dragon11');s.tier=1;s.shop=[E.make(s,'neutral0',{attack:22,health:30})];const before=body(other);E.endRecruit(s);A.equal(s.progress.spellcraft,0);A.deepEqual(body(other),[before[0]+22,before[1]+30]);A.equal(brood.attack,80);A.equal(study.attack,D.byId.dragon15.attack+22);A.equal(s.shop.length,0);
});
test('Ceres spends grave for team growth while battle entry engines no longer spend it',()=>{
 const s=state('night');add(s,'night9');add(s,'night15');const lord=add(s,'night17'),before=body(lord);s.grave=42;E.endRecruit(s);A.equal(s.grave,39);A.equal(s.progress.spellcraft,0);A.deepEqual(body(lord),before.map(v=>v+4));const p=state('night');add(p,'night9');p.grave=2;E.endRecruit(p);A.equal(p.grave,2);
});
test('amulet cultivation and echo scale payloads, but count expiration and copies only once',()=>{
 for(const golden of [false,true]){const s=state('haven'),m=golden?2:1,target=add(s,'haven0'),study=add(s,'haven13'),echo=add(s,'haven18',{golden}),copy=add(s,'haven5');s.progress.devotion=4;s.progress.prayers=2;const before=body(target);s.amulets=[{...E.make(s,'temple'),count:1}];play(s,'clock');A.equal(s.progress.prayers,3);A.equal(s.progress.devotion,5);A.equal(s.hand.filter(c=>c.id==='temple').length,1);A.deepEqual(body(target),[before[0]+8*(1+m),before[1]+10*(1+m)]);A.equal(E.scaling.prayer(s),6);A(!target.keywords.includes('taunt'));}
 const s=state('haven');add(s,'haven18',{golden:true});s.progress.devotion=100;s.amulets=[{...E.make(s,'library'),count:1}];play(s,'clock');A.equal(s.hand.length,9);A.equal(s.progress.prayers,1);
});
test('paid self-harm trains spells and health, even with healing; zero actual damage cannot trigger it',()=>{
 const s=state('blood'),study=add(s,'blood15'),vein=add(s,'blood18'),mender=add(s,'blood11');s.hp=40;s.gold=10;const before=vein.health,c=E.make(s,'bloodPact');s.shop=[c];act(s,'buy',{uid:c.uid});A.equal(s.hp,40);A.equal(s.bloodDamage,1);A.equal(s.progress.spellcraft,1);A.equal(vein.health,before+2);act(s,'play',{uid:c.uid,target:vein.uid});A.equal(vein.health,before+6);A.equal(s.progress.spellcraft,1);s.hp=1;add(s,'blood14');E.endRecruit(s);A.equal(s.hp,1);A.equal(s.progress.spellcraft,1);
});
test('module research has separate shared spell and weapon axes, with a scrap payoff',()=>{
 const s=state('artifact'),research=add(s,'artifact13'),rally=add(s,'artifact17'),target=add(s,'artifact0');s.scrap=30;s.progress.spellcraft=4;const before=body(target);play(s,'module',target);A.equal(s.progress.arms,3);A.deepEqual(body(target),[before[0]+5+4,before[1]+6+4]);const next=body(target);play(s,'module',target);A.equal(s.progress.arms,6);A.deepEqual(body(target),[next[0]+6+4,next[1]+7+4]);A.equal(rally.attack,D.byId.artifact17.attack);
});
test('damage records raw simultaneous hits, shield blocks, injury-growth and overkill without mutating inputs',()=>{
 const s=state(),c=E.make(s,'dragon2',{attack:1,health:100}),x=E.make(s,'neutral0',{attack:2,health:6}),before=E.copy([c,x]);const r=E.combat(s,[c,E.make(s,'dragon18')],[x],{tier:6});const event=r.events.find(e=>e.impacts.some(i=>i.target===100001));A(event);A(event.impacts.some(i=>i.target===100001&&i.amount===2&&!i.blocked));A(event.boards[0][0].health>100,'growth exceeds damage but still records 2 damage');A.deepEqual([c,x],before);
 const over=E.combat(s,[E.make(s,'neutral0',{attack:100,health:100})],[E.make(s,'neutral0',{attack:2,health:1})]);A(over.events.flatMap(e=>e.impacts).some(i=>i.amount===100));
});
test('new combat engines apply equally on both sides and golden deathrattles show inherited bodies',()=>{
 for(const side of [0,1])for(const golden of [false,true]){const m=golden?2:1,s=state(),enemy=E.make(s,'neutral0',{attack:10000,health:1000000});
  for(const [id,token,n,bonus] of [['forest19','fairy',3,0],['night18','skeleton',2,21],['blood19','bat',3,0],['artifact18','radiantArtifact',1,21]]){const c=E.make(s,id,{attack:40,health:60,golden}),meta={grave:20,scrap:20,progress:{battleEntries:20}},r=side?E.combat(s,[enemy],[c],{},meta):E.combat(s,[c],[enemy],meta,{}),summons=r.events.filter(e=>e.kind==='summon').map(e=>e.boards[side].find(x=>x.battleId===e.to)).filter(x=>x?.id===token);A.equal(summons.length,n);for(const x of summons){A.equal(x.attack,id==='night18'?20*m:((id==='forest19'?40:20)+bonus)*m);A.equal(x.health,id==='night18'?20*m:(30+bonus)*m);}}
  const research=E.make(s,'night13',{health:1000000,golden}),fodder=Array.from({length:4},()=>E.make(s,'knight',{health:1,keywords:['taunt']})),team=[research,...fodder],r=side?E.combat(s,[enemy],team):E.combat(s,team,[enemy]);A.equal(r.progress[side].spellcraft,0);A.equal(r.progress[side].legionAttack,3*m);A.equal(r.progress[1-side].legionAttack,0);
 }
});
test('dragon injury mentor, attack trainer and token-death growth create permanent ledgers',()=>{
 const s=state(),mentor=E.make(s,'dragon18',{attack:0,health:10000}),hurt=E.make(s,'dragon13',{attack:1,health:30,keywords:['taunt']}),foe=E.make(s,'neutral0',{attack:1,health:8}),r=E.combat(s,[mentor,hurt],[foe],{tier:6});A(ledger(r,0,hurt).health>=12);A(ledger(r,0,hurt).health>ledger(r,0,hurt).attack);
 for(const [engine,token,tribe,gain] of [['forest17','fairy','forest0',[2,2]],['blood17','bat','blood0',[3,2]]]){const a=E.make(s,engine,{attack:0,health:10000}),b=E.make(s,tribe,{attack:0,health:10000}),t=E.make(s,token,{health:1,keywords:['taunt']}),x=E.combat(s,[a,b,t],[E.make(s,'neutral0',{attack:2,health:2})]);A.deepEqual(ledger(x,0,b),{attack:gain[0],health:gain[1]});}
});
test('AI uses real research cards and persists new counters with no special stats',()=>{
 const s=state('rune'),o=s.opponents.find(o=>o.tribe==='rune');Object.assign(o,{tier:6,hp:40,board:['rune13','rune15','rune17','rune18'].map(id=>E.make(s,id)),hand:[E.make(s,'mana'),E.make(s,'growth'),E.make(s,'bless')],gold:0,progress:{spellcraft:7},route:0});s.round=10;AI.prepare(s,o,E,{started:true,bonusGold:false});A(o.spells>=3);A(o.progress.spellcraft>=12);A(o.board.some(c=>c.id==='rune13'));A(o.board.filter(c=>c.spellTicks!==undefined).every(c=>c.spellTicks<3));
});
test('legacy progress migrates and new corrupted research/replay counters are rejected',()=>{
 const s=state();s.progress={fairy:2,arms:3,prayers:4};E.normalize(s);A.deepEqual(s.progress,{fairy:2,arms:3,prayers:4,spellcraft:0,devotion:0,buffs:0,battleEntries:0,legionAttack:0,tavernAttack:0,tavernHealth:0});for(const k of ['spellcraft','devotion']){const x=E.copy(s);x.progress[k]=-1;A(!E.validate(x));}const c=add(s,'rune13',{spellTicks:3});A(!E.validate(s));c.spellTicks=2;A(E.validate(s));act(s,'fight');A(E.validate(s));s.result.events[0].impacts=[{target:100001,amount:-1,blocked:false}];A(!E.validate(s));
});
console.log(passed+' v7 rules groups passed.');
