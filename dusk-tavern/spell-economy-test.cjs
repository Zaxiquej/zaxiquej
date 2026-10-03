'use strict';
const A=require('node:assert/strict'),D=require('./data.js'),E=require('./engine.js'),AI=require('./ai.js');
let n=0;const test=(name,fn)=>{fn();n++;console.log('PASS '+name);};
const state=()=>E.create('rune',83273,'normal',['rune','royal','forest','artifact']);
const act=(s,t,a={})=>{const r=E.act(s,t,a);A(r.ok,r.message);};
const add=(s,id,extra={})=>{const c=E.make(s,id,extra);s.board.push(c);return c;};
const play=(s,id,extra={})=>{const c=E.make(s,id,extra);s.hand.push(c);act(s,'play',{uid:c.uid});return c;};
test('Sammy is a four-star 4/6 sale engine, not a repeatable battlecry',()=>{
 const s=state(),general=add(s,'royal3'),arthur=add(s,'royal10'),champ=add(s,'royal14'),before=E.copy(s.board);
 const sammy=play(s,'rune11');A.equal(s.hand.length,0);A.equal(sammy.attack,4);A.equal(sammy.health,6);A.equal(D.byId.rune11.tier,4);A(!D.fanfareIds.includes('rune11'));A.deepEqual(s.board.slice(0,3),before);A.equal(D.byId.rune11.related[0].when,'每出售另一个随从时加入手牌');
});
test('Sammy cannot be bought at tiers one through three; three-star triples may discover it early',()=>{
 const s=state();for(let tier=1;tier<=3;tier++){s.tier=tier;for(let i=0;i<80;i++){s.gold=100;act(s,'refresh');A(s.shop.every(c=>c.id!=='rune11'));}}
 s.tier=4;let offered=false;for(let i=0;i<200;i++){s.gold=100;act(s,'refresh');if(s.shop.some(c=>c.id==='rune11')){offered=true;break;}}A(offered);
 const early=state();early.tier=2;for(let i=0;i<3;i++)add(early,'knight');E.triples(early);A(early.discover[0].options.every(id=>D.byId[id].tier===3&&id!=='rune11'));
 const four=state();four.tier=3;let discovered=false;for(let i=0;i<80;i++){four.board=[];four.hand=[];four.discover=[];for(let j=0;j<3;j++)add(four,'knight');E.triples(four);A(four.discover[0].options.every(id=>D.byId[id].tier===4));if(four.discover[0].options.includes('rune11')){discovered=true;break;}}A(discovered);
});
test('Penguin alone retains immediate entry and sale spells; Sammy turns it into a three-spell cycle',()=>{
 for(const sammy of [false,true]){const s=state();if(sammy)add(s,'rune11');const penguin=play(s,'rune1');A.equal(s.hand.length,1);act(s,'sell',{uid:penguin.uid});A.equal(s.hand.filter(c=>c.id==='mana').length,sammy?3:2);A.equal(D.byId.rune1.attack,3);A.equal(D.byId.rune1.health,2);}
});
test('all tribes and tokens trigger sales, normal/golden copies stack and no per-round quota exists',()=>{
 const s=state();add(s,'rune11');add(s,'rune11',{golden:true});for(let i=0;i<12;i++){s.hand=[];const c=add(s,['knight','fairy','analyzer','neutral0'][i%4]);act(s,'sell',{uid:c.uid});A.equal(s.hand.length,3);A(s.hand.every(c=>c.id==='mana'));}A(s.log.some(t=>t.includes('魔法交换')));
});
test('self-sale, discard, merge and combat death never fabricate sale rewards',()=>{
 const s=state(),sammy=add(s,'rune11');act(s,'sell',{uid:sammy.uid});A.equal(s.hand.length,0);add(s,'rune11');const c=E.make(s,'rune1');s.hand.push(c);act(s,'discard',{uid:c.uid});A.equal(s.hand.length,0);add(s,'rune11');add(s,'rune11');E.triples(s);A.equal(s.board.length,1);A(s.board[0].golden);A.equal(s.hand.length,0);A.equal(s.discover.length,1);A.equal(s.board[0].health,12);
 const before=JSON.stringify(s);E.combat(E.copy(s),s.board,[E.make({...s},'neutral0',{attack:99,health:99})]);A.equal(JSON.stringify(s),before);
});
test('full hands cap generation; invalid sale cannot trigger a resource or spend gold',()=>{
 const s=state();add(s,'rune11',{golden:true});const c=add(s,'knight');s.hand=Array.from({length:9},()=>E.make(s,'growth'));act(s,'sell',{uid:c.uid});A.equal(s.hand.length,10);A.equal(s.hand.filter(c=>c.id==='mana').length,1);A(s.log.some(t=>t.includes('魔法交换：获得 1 张')));const before=JSON.stringify(s);A(!E.act(s,'sell',{uid:c.uid}).ok);A.equal(JSON.stringify(s),before);
});
test('generated spells really trigger growth, combo and research without counting generation as casts',()=>{
 const s=state(),sammy=add(s,'rune11'),mage=add(s,'rune0'),study=add(s,'rune13');s.progress.spellcraft=4;const penguin=play(s,'rune1');act(s,'sell',{uid:penguin.uid});A.equal(s.spells,0);A.equal(s.played,1);const a=mage.attack,h=mage.health;for(const c of [...s.hand])act(s,'play',{uid:c.uid,target:mage.uid});A.equal(s.spells,3);A.equal(s.played,4);A.equal(s.progress.spellcraft,6);A.equal(mage.attack,a+3*(6+1));A.equal(mage.health,h+3);A.equal(study.spellTicks,0);const copy=E.normalize(E.copy(s));A(E.validate(copy));act(copy,'sell',{uid:copy.board.find(c=>c.id==='rune0').uid});A.equal(copy.hand.length,1);
});
test('alchemist produces three/six casts; dessert wizard produces two/four dual-stat spells',()=>{
 for(const golden of [false,true])for(const [id,spell,qty]of [['rune3','mana',3],['rune14','growth',2]]){const s=state();add(s,id,{golden});E.endRecruit(s);A.equal(s.hand.length,qty*(golden?2:1));A(s.hand.every(c=>c.id===spell));A.equal(D.byId[id].related[0].count,qty);A(D.byId[id][golden?'goldenText':'text'].includes(String(qty*(golden?2:1))));}
});
test('AI retains a useful Sammy and plays its sale-generated spells during recruitment',()=>{
 const s=state(),o=s.opponents[0];o.hero='rune';o.tribe='rune';o.route=0;o.tier=6;o.gold=0;o.shop=[];o.powerUsed=true;o.board=['rune11','rune6','rune5','rune13','rune15','rune17'].map(id=>E.make(s,id));o.hand=[E.make(s,'rune1')];s.round=10;o.played=9;o.progress={fairy:0,arms:0,prayers:0,spellcraft:10,devotion:0};AI.prepare(s,o,E,{started:true,bonusGold:false,deferEnd:true});A(o.board.some(c=>c.id==='rune11'));A(o.spells>=3);A(o.aiSummary.spellsCast>=3);A(E.validate(s));
});
console.log(n+' spell-economy groups passed.');
