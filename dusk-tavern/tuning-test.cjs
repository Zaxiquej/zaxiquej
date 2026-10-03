'use strict';
const A=require('node:assert/strict'),E=require('./engine.js'),D=require('./data.js');let groups=0;
const test=(name,fn)=>{fn();groups++;console.log('PASS '+name);},state=()=>E.create('angel',91237,'normal',['dragon','royal','rune','haven']);
const add=(s,id,x={})=>{const c=E.make(s,id,x);s.board.push(c);return c;};
const act=(s,t,a={})=>{const r=E.act(s,t,a);A(r.ok,r.message);};
const play=(s,id,target,x={})=>{const c=E.make(s,id,x);s.hand.push(c);act(s,'play',{uid:c.uid,target:target?.uid});return c;};
test('tier gates separate starter resources, persistent economy and five-star multipliers',()=>{
 for(const [id,tier]of Object.entries({dragon1:2,dragon2:2,forest1:3,forest2:4,forest4:5,forest11:4,rune11:4,royal2:4,royal3:5,night4:5,dragon13:5,blood2:4,blood4:4,artifact4:4,haven8:2,night10:5}))A.equal(D.byId[id].tier,tier,id);
 for(const t of D.tribeIds)A.deepEqual([...new Set(D.cards.filter(c=>c.tribe===t).map(c=>c.tier))].sort(),[1,2,3,4,5,6]);
 A(!D.fanfareIds.includes('dragon1'));A(!D.fanfareIds.includes('rune11'));for(const d of D.cards)A(d.text&&d.goldenText&&!/undefined|NaN/.test(d.text+d.goldenText));
});
test('Brave Knight requires outside fuel and has no battlecry or generated-card preview',()=>{
 A.deepEqual([D.byId.royal1.tier,D.byId.royal1.attack,D.byId.royal1.health],[2,2,3]);A(!D.fanfareIds.includes('royal1'));A.deepEqual(D.byId.royal1.related,[]);
 for(const golden of [false,true]){const s=state(),m=golden?2:1;add(s,'royal3',{golden:true});const champion=add(s,'royal14'),before=E.copy(champion),c=play(s,'royal1',null,{golden,attack:2*m,health:3*m});A.equal(s.hand.length,0);A.deepEqual(champion,before);A.deepEqual([c.attack,c.health],[2*m,3*m]);
 play(s,'fairy');A.deepEqual([c.attack,c.health],[2*m,3*m]);act(s,'sell',{uid:s.board.at(-1).uid});
 for(let i=0;i<5;i++){const token=play(s,'knight');act(s,'sell',{uid:token.uid});}A.deepEqual([c.attack,c.health],[7*m,8*m]);A.equal(s.hand.length,0);
 const p=state();play(p,'royal11');A.equal(p.hand.length,1);A.equal(p.hand[0].id,'knight');}
});

test('Aiela has no entry income; actual death grants permanent tavern growth',()=>{
 for(const golden of [false,true]){const s=state(),m=golden?2:1;add(s,'royal3',{golden:true});const before=s.discount,c=play(s,'dragon1',null,{golden,health:1});A.equal(s.discount,before);const r=E.combat(s,[c],[E.make(s,'neutral0',{attack:100,health:100})]);A.equal(r.discount[0],0);A.equal(r.progress[0].tavernAttack,m);A.equal(r.progress[0].tavernHealth,m);A.equal(r.discount[1],0);A.equal(s.discount,before);}
});
test('flyer gains exactly one per surviving hit, preserves the gain, and cannot shrug off equal-tier attacks',()=>{
 for(const side of [0,1])for(const golden of [false,true]){const s=state(),m=golden?2:1,c=E.make(s,'dragon2',{golden}),burn=E.make(s,'dragon3');const team=[c,burn],r=side?E.combat(s,[],team,{},{}):E.combat(s,team,[],{},{});A.deepEqual(r.permanent[side][c.uid],{attack:2*m,health:2*m});const f=r.events.find(e=>e.text==='开战效果结算完成。').boards[side].find(x=>x.uid===c.uid);A.equal(f.health,c.health-2+2*m);A.equal(f.attack,c.attack+2*m);A.equal(c.attack,3);}
 const s=state(),r=E.combat(s,[E.make(s,'dragon2')],[E.make(s,'neutral0',{attack:3,health:4})]);A.notEqual(r.winner,0);
 const lethal=E.make(s,'dragon2',{health:1}),x=E.combat(s,[lethal],[E.make(s,'neutral0',{attack:10,health:10})]);A(!x.permanent[0][lethal.uid]);
});
test('starter growth has smaller exact normal and golden payoffs',()=>{
 for(const golden of [false,true]){const m=golden?2:1,s=state(),mage=add(s,'rune0',{golden}),golem=add(s,'rune2',{golden}),owl=add(s,'rune8',{golden}),low=add(s,'neutral0',{attack:0});const a=mage.attack,h=golem.health;play(s,'bones');A.equal(mage.attack,a+m);A.equal(golem.health,h+m);A(golem.keywords.includes('shield'));A.equal(low.attack,2*m);
 const p=state(),wolf=add(p,'blood1',{golden});const wa=wolf.attack,wh=wolf.health;p.shop=[E.make(p,'bloodPact')];act(p,'buy',{uid:p.shop[0].uid});A.equal(wolf.attack,wa+m);A.equal(wolf.health,wh+m);A.equal(p.hp,39);
 const w=state(),guard=add(w,'artifact2',{golden}),ga=guard.attack,gh=guard.health;play(w,'module',guard);A.equal(guard.attack,ga+1+m);A.equal(guard.health,gh+2+m);}
});
test('dancer is a one-shot supplier and no longer amplifies every token played',()=>{
 const s=state(),ally=add(s,'neutral0'),before=E.copy(ally),dancer=play(s,'forest8');A.equal(s.hand.length,2);for(const c of [...s.hand])act(s,'play',{uid:c.uid});A.deepEqual(ally,before);A.equal(dancer.attack,3);A.equal(dancer.health,3);
});
test('five-star red serpent turns surviving hits into golden-scaled tavern growth',()=>{
 for(const golden of [false,true]){const s=state(),m=golden?2:1,c=E.make(s,'dragon13',{golden}),burn=E.make(s,'dragon3');const r=E.combat(s,[c,burn],[],{tier:5});A.equal(r.permanent[0][c.uid],undefined);A.equal(r.progress[0].tavernAttack,4*m);A.equal(r.progress[0].tavernHealth,6*m);}
});
test('low-tier buff and high-tier buff have different budgets; Craig gives four/eight actual spells',()=>{
 for(const golden of [false,true]){const s=state(),m=golden?2:1,ally=add(s,'neutral0');let a=ally.attack,h=ally.health;play(s,'neutral1',null,{golden});A.equal(ally.attack,a+m);A.equal(ally.health,h+m);a=ally.attack;h=ally.health;play(s,'neutral4',null,{golden});A.equal(ally.attack,a+6*m);A.equal(ally.health,h+6*m);const p=state();play(p,'rune16',null,{golden});A.equal(p.hand.length,4*m);A(p.hand.every(c=>c.id==='mana'));}
});
test('Brodia scales on resolved amulet resonance, on the strongest health target only',()=>{
 for(const golden of [false,true]){const s=state(),m=golden?2:1,b=add(s,'haven10',{golden}),carry=add(s,'neutral0',{health:100}),other=add(s,'neutral0');s.progress.devotion=10;s.progress.prayers=2;s.amulets=[{...E.make(s,'tomb'),count:1}];play(s,'clock');A.equal(E.scaling.prayer(s),11);A.equal(carry.attack,2+17*m);A.equal(carry.health,100+34*m);A.equal(other.health,D.byId.neutral0.health);A.equal(b.attack,D.byId.haven10.attack);}
});
test('Medusa halves an enemy carry instead of subtracting a negligible fixed body; golden sets zero',()=>{
 for(const side of [0,1])for(const golden of [false,true]){const s=state(),c=E.make(s,'blood10',{golden}),carry=E.make(s,'neutral0',{attack:101,health:300}),other=E.make(s,'neutral0',{attack:30,health:300});const r=side?E.combat(s,[carry,other],[c]):E.combat(s,[c],[carry,other]);const start=r.events.find(e=>e.text==='开战效果结算完成。').boards[1-side];A.equal(start.find(x=>x.uid===carry.uid).attack,golden?0:50);A.equal(start.find(x=>x.uid===other.uid).attack,30);}
});
test('high-tier resource engines cannot leak into low-tier shops or discoveries',()=>{
 const s=state();for(let tier=1;tier<=6;tier++){s.tier=tier;for(let n=0;n<60;n++){s.gold=100;act(s,'refresh');A(s.shop.every(c=>D.byId[c.id].tier<=tier));}}
 s.tier=1;s.board=[];s.hand=[];for(let i=0;i<3;i++)add(s,'neutral0');E.triples(s);A(s.discover[0].options.every(id=>D.byId[id].tier===2));A(!s.discover[0].options.includes('royal3'));
});
console.log(groups+' tier balance groups passed.');
