'use strict';
const A=require('node:assert/strict'),E=require('./engine.js'),D=require('./data.js');let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}
const state=(hero='dragon')=>E.create(hero,814729,'normal');
const add=(s,id,extra={})=>{const c=E.make(s,id,extra);s.board.push(c);return c;};
const act=(s,type,args={})=>{const r=E.act(s,type,args);A(r.ok,r.message);};
function play(s,id,target=null,extra={}){const c=E.make(s,id,extra);s.hand.push(c);act(s,'play',{uid:c.uid,target:target?.uid});return c;}
test('all final minion texts shed arbitrary quotas and preserve explicit golden effects',()=>{
 A.equal(D.rulesVersion,'15.0');A.equal(D.cards.length,169);
 for(const d of D.cards){A(d.text&&d.goldenText,d.id);A(!/每场至多|每场前|每回合前|每回合首|至多增加|最多计算|undefined|NaN/.test(d.text+d.goldenText),d.id);}
 A(!D.fanfareIds.includes('royal3'));A(!D.fanfareIds.includes('blood2'));
});
test('fairy trade trains the army on every token without generating gold',()=>{
 const s=state();add(s,'forest2',{golden:true});s.gold=0;
 for(let i=0;i<6;i++){const c=play(s,'fairy');act(s,'sell',{uid:c.uid});}A.equal(s.gold,6);A.equal(s.progress.fairy,12);
});
test('Cynthia has one combo trigger and no end-of-turn extra ability',()=>{
 const s=state(),c=add(s,'forest4'),r=add(s,'forest1');s.progress.fairy=6;s.played=2;
 const before=[c.attack,c.health,r.attack,r.health];play(s,'bones');A.equal(s.progress.fairy,6);A.equal(r.attack,before[2]+3+8);A.equal(r.health,before[3]+3+8);
 const snapshot=E.copy(s.board);E.endRecruit(s);A.deepEqual(s.board,snapshot);
});
test('unlimited general repeats each battlecry but is not itself a battlecry',()=>{
 const s=state(),g=add(s,'royal3',{golden:true}),ally=add(s,'neutral0');const start=[g.attack,ally.attack];
 for(let i=0;i<4;i++){const c=play(s,'neutral4');act(s,'sell',{uid:c.uid});}
 A.equal(g.attack,start[0]+72);A.equal(ally.attack,start[1]+72);A(!g.triggers);
 const p=state(),before=add(p,'royal0').attack;play(p,'royal3');A.equal(p.board[0].attack,before);
});
test('royal recruitment grows both stats and Olivia only rewards entry',()=>{
 const s=state(),r=add(s,'royal1'),old=[r.attack,r.health];play(s,'royal0');A.equal(r.attack,old[0]+1);A.equal(r.health,old[1]+1);
 play(s,'neutral4');const snapshot=E.copy(s.board);E.endRecruit(s);A.deepEqual(s.board,snapshot);
});
test('dragon hatchling grants only starter growth independent of tavern tier',()=>{
 for(const tier of [1,3,6]){const s=state(),c=add(s,'dragon0',{golden:true});s.tier=tier;s.gold=50;const b=[c.attack,c.health];E.endRecruit(s);A.deepEqual([c.attack,c.health],[b[0]+2,b[1]+2]);if(tier<6){const snapshot=E.copy(c);act(s,'upgrade');A.deepEqual(c,snapshot);}}
});
test('grave producers and ritual have a real unrestricted resource exchange',()=>{
 const s=state(),c=add(s,'neutral0');play(s,'night1');A.equal(s.grave,4);s.grave=57;const before=[c.attack,c.health];play(s,'ritual',c);A.equal(s.grave,0);A.deepEqual([c.attack,c.health],[before[0]+57,before[1]+57]);
});
test('Merlin spreads every actual targeted spell without copying resource triggers',()=>{
 const s=state(),left=add(s,'neutral0'),target=add(s,'neutral1'),right=add(s,'dragon0');add(s,'rune5',{golden:true});
 const before=[left.attack,target.attack,right.attack];for(let i=0;i<5;i++)play(s,'growth',target);
 A.deepEqual([left.attack,target.attack,right.attack],[before[0]+20,before[1]+10,before[2]+20]);A.equal(s.spells,5);
});
test('Pamela and the apprentice use one consistent spell trigger, with no third-spell exception',()=>{
 const s=state(),p=add(s,'rune6'),r=add(s,'rune0');const old=[p.attack,p.health,r.attack,r.health];
 for(let i=0;i<6;i++)play(s,'bones');A.deepEqual([p.attack,p.health,r.attack,r.health],[old[0]+12,old[1]+12,old[2]+18,old[3]+18]);
});
test('golem charges every spell and the alchemist generates three at turn end',()=>{
 const s=state(),g=add(s,'rune2'),a=add(s,'rune3');const hp=g.health;
 for(let i=0;i<5;i++){g.keywords=[];play(s,'bones');A(g.keywords.includes('shield'));}A.equal(g.health,hp+5);A.equal(s.hand.length,0);
 E.endRecruit(s);A.equal(s.hand.filter(c=>c.id==='mana').length,3);A.equal(a.attack,D.byId.rune3.attack);
});
test('every amulet expiration is copied and advances resonance once with retired relic ignored',()=>{
 const s=state(),priest=add(s,'haven5');s.trinkets=['relic'];
 for(let i=0;i<4;i++){s.amulets=[{...E.make(s,'bell'),count:1}];play(s,'clock');}
 A.equal(s.progress.prayers,4);A.equal(s.hand.filter(c=>c.id==='bell').length,4);A(s.hand.every(c=>c.initialCount===undefined));A.equal(priest.attack,D.byId.haven5.attack);
});
test('abbess only grows on placement; priest strengthens only the leftmost friend without forced guard',()=>{
 const s=state(),nun=add(s,'haven0'),priest=add(s,'haven3'),other=add(s,'neutral0');const before=[nun.attack,nun.health,priest.health,other.health];
 play(s,'tomb');A.deepEqual([nun.attack,nun.health],[before[0]+2,before[1]+2]);play(s,'clock');play(s,'clock');
 A.equal(nun.attack,before[0]+6);A.equal(nun.health,before[1]+8);A.equal(priest.health,before[2]);A.equal(other.health,before[3]);A(s.board.every(c=>!c.keywords.includes('taunt')));
});
test('Tenko needs outside healing and buffs only haven allies',()=>{
 const s=state(),c=add(s,'haven4'),x=add(s,'neutral0'),y=add(s,'haven0');const hp=x.health,old=E.copy(y);
 s.amulets=[{...E.make(s,'bell'),count:1}];play(s,'clock');A.equal(x.health,hp+2);A.equal(y.attack,old.attack+5);A.equal(y.health,old.health+7);const before=E.copy(s.board);E.endRecruit(s);A.deepEqual(s.board,before);A.equal(c.attack,D.byId.haven4.attack+5);
});
test('blood team growth does not stop at the sixth self-harm and payment remains real',()=>{
 const s=state(),wolf=add(s,'blood1'),duke=add(s,'blood4');s.hp=40;const before=[wolf.attack,wolf.health,duke.attack];for(let i=0;i<8;i++){s.gold=10;const c=E.make(s,'bloodPact');s.shop=[c];act(s,'buyPlay',{uid:c.uid,target:wolf.uid});}
 A.equal(s.hp,32);A.equal(s.bloodDamage,8);A.equal(duke.attack,before[2]+16);A.equal(wolf.attack,before[0]+8*4+16);A.equal(wolf.health,before[1]+8*4+16);
 s.hp=1;const b=E.copy(s.board);play(s,'bloodPact',wolf);A.equal(wolf.attack,b[0].attack+3);A.equal(wolf.health,b[0].health+3);A.equal(s.bloodDamage,8);
});
test('Vampy has no recruitment self-harm, while Belphegor exchanges life for deferred gold income',()=>{
 const s=state();play(s,'blood2');A.equal(s.hp,40);const gold=s.gold;play(s,'blood3',null,{golden:true});A.equal(s.gold,gold);A.equal(s.pendingGold,6);A.equal(s.hp,38);
});
test('weapon quality and full-strength echoes grow together without a two-use cutoff',()=>{
 const s=state(),left=add(s,'artifact0'),dyne=add(s,'artifact6',{golden:true}),right=add(s,'artifact2'),before=[left.attack,left.health,right.attack,right.health];
 for(let i=0;i<6;i++)play(s,'module',dyne);A.equal(s.progress.arms,6);A.deepEqual([left.attack,left.health,right.attack,right.health],[before[0]+18,before[1]+30,before[2]+18,before[3]+30]);
 const b=[right.attack,right.health];play(s,'module',right);A.deepEqual([right.attack,right.health],[b[0]+4,b[1]+5]);A(!right.keywords.includes('shield'));
});
test('smith generates two modules immediately from tier one and has no hidden cast bonus',()=>{
 const s=state(),smith=add(s,'artifact3'),target=add(s,'artifact0'),before=[target.attack,target.health];play(s,'module',target);A.deepEqual([target.attack,target.health],[before[0]+1,before[1]+2]);E.endRecruit(s);A.equal(s.hand.filter(c=>c.id==='module').length,2);A.equal(smith.attack,D.byId.artifact3.attack);
});
test('neutral support has focused adjacency and tribe growth, without old extra triggers',()=>{
 const s=state(),l=add(s,'forest0'),r=add(s,'royal0'),b=[l.attack,l.health,r.attack,r.health];const n=E.make(s,'neutral1');s.hand.push(n);act(s,'play',{uid:n.uid,index:1});A.deepEqual([l.attack,l.health,r.attack,r.health],[b[0]+1,b[1]+1,b[2]+1,b[3]+1]);
 add(s,'neutral2');const dragon=play(s,'dragon6');A.equal(dragon.attack,D.byId.dragon6.attack);const before=E.copy(s.board);E.endRecruit(s);A.equal(l.attack,before[0].attack+3);A.equal(dragon.attack,D.byId.dragon6.attack+3);
});
test('invalid plays remain transactional and optional self-harm cannot pay with zero life',()=>{
 const s=state(),x=add(s,'royal0'),c=E.make(s,'module');s.hand=[c];const before=JSON.stringify(s);A.equal(E.act(s,'play',{uid:c.uid,target:x.uid}).ok,false);A.equal(JSON.stringify(s),before);
});
console.log('\n'+passed+' focused recruitment groups passed.');
