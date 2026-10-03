'use strict';
const A=require('node:assert/strict'),E=require('./engine'),D=require('./data'),AI=require('./ai');let passed=0;
const test=(n,f)=>{f();passed++;console.log('PASS '+n);},state=()=>E.create('dragon',61731,'normal',['dragon','blood','royal','rune']);
const add=(s,id,x={})=>{const c=E.make(s,id,x);s.board.push(c);return c;};
function play(s,id,target,x={}){const c=E.make(s,id,x);s.hand.push(c);const r=E.act(s,'play',{uid:c.uid,target:target?.uid});A(r.ok,r.message);return c;}
const body=c=>[c.attack,c.health],market=s=>[s.progress.tavernAttack,s.progress.tavernHealth],open=r=>r.events.find(e=>e.text==='开战效果结算完成。');
test('dragon roster replaces star-scaled gains and only dragon/blood get tavern engines',()=>{
 A.equal(D.rulesVersion,'15.0');A(D.cards.filter(c=>c.tribe==='dragon').every(c=>!c.text.includes('酒馆星级')&&!c.text.includes('酒馆达到')&&!c.text.includes('升级')));const engines=D.cards.filter(c=>/tavern|shopCry|dragonFeast|bloodFeast/i.test(c.effect));A(engines.every(c=>['dragon','blood'].includes(c.tribe)));A.equal(D.cards.length,169);A.equal(D.byId.blood9.tier,5);A.equal(D.byId.dragon12.tier,3);A.equal(D.byId.blood13.tier,3);
});
test('hero updates current offers of every tribe, not spells/hand/board; refresh applies exactly once',()=>{
 const s=state(),own=add(s,'royal0');s.hand=[E.make(s,'dragon6')];s.shop=['dragon2','royal0','rune0','mana','banner'].map(id=>E.make(s,id));const before=s.shop.map(body),kept=body(own),hand=body(s.hand[0]),cost=E.upgradeCost(s);A(E.act(s,'power').ok);A.deepEqual(market(s),[1,1]);s.shop.forEach((c,i)=>A.deepEqual(body(c),before[i].map(n=>n+(i<3?1:0))));A.deepEqual(body(own),kept);A.deepEqual(body(s.hand[0]),hand);A.equal(E.upgradeCost(s),cost);A.equal(s.progress.buffs,3);s.gold=10;A(E.act(s,'refresh').ok);for(const c of s.shop.filter(c=>D.byId[c.id].type==='minion'))A.deepEqual(body(c),[D.byId[c.id].attack+1,D.byId[c.id].health+1]);A.equal(s.progress.buffs,3);A(E.validate(s));
});
test('temporary shop cry survives freeze but resets on refresh, permanent bonus does not duplicate',()=>{
 const s=state();s.gold=30;A(E.act(s,'power').ok);const ids=s.shop.map(c=>c.uid);play(s,'dragon11');const before=E.copy(s.shop);s.frozen=true;E.startRound(s);A.deepEqual(s.shop,before);A.deepEqual(s.shop.map(c=>c.uid),ids);s.gold=5;A(E.act(s,'refresh').ok);for(const c of s.shop.filter(c=>D.byId[c.id].type==='minion'))A.deepEqual(body(c),[D.byId[c.id].attack+1,D.byId[c.id].health+1]);
});
test('research amplifies tavern spell once; gold and normal permanent entry scale and generals repeat',()=>{
 for(const golden of [false,true]){const s=state(),m=golden?2:1;add(s,'royal3');play(s,'dragon14',null,{golden});A.deepEqual(market(s),[4*m,4*m]);A.equal(s.discount,0);}
 const s=state();s.progress.spellcraft=7;play(s,'dragon');A.deepEqual(market(s),[9,9]);A.equal(s.spells,1);A(!D.byId.dragon.target);
});
test('dropping a non-targeted tavern spell on a follower cannot invent Dorothy or Merlin target triggers',()=>{
 const s=state(),a=add(s,'rune10'),b=add(s,'rune5'),target=add(s,'neutral0');const before=s.board.map(body);play(s,'dragon',target);A.deepEqual(s.board.map(body),before);A.deepEqual(market(s),[2,2]);A.equal(s.spells,1);
});
test('play engine includes itself, counts dragon plays once and ignores repeated cries/non-dragons',()=>{
 const s=state();add(s,'royal3');play(s,'dragon15',null,{golden:true});A.deepEqual(market(s),[4,4]);play(s,'dragon11');A.deepEqual(market(s),[8,8]);play(s,'rune12');A.deepEqual(market(s),[8,8]);
});
test('purchased stats survive deployment and triples; generating and discovering never use tavern bonuses',()=>{
 const s=state();s.gold=30;s.progress.tavernAttack=20;s.progress.tavernHealth=30;A(E.act(s,'refresh').ok);const bought=s.shop.find(c=>D.byId[c.id].type==='minion'),base=body(bought);A(E.act(s,'buyPlay',{uid:bought.uid}).ok);A.deepEqual(body(s.board.find(c=>c.uid===bought.uid)),base);A(E.act(s,'power').ok);A.deepEqual(body(s.board.find(c=>c.uid===bought.uid)),base);const normal=E.make(s,'dragon6');A.deepEqual(body(normal),[9,7]);
 const t=state();t.tier=4;t.board=[E.make(t,'dragon2',{attack:13,health:24})];t.hand=[E.make(t,'dragon2',{attack:13,health:24}),E.make(t,'dragon2',{attack:13,health:24})];t.progress.tavernAttack=100;t.progress.tavernHealth=100;E.triples(t);A.deepEqual(body(t.board[0]),[36,68]);const id=t.discover[0].options[0];A(E.act(t,'choose',{id}).ok);A.deepEqual(body(t.hand[0]),[D.byId[id].attack,D.byId[id].health]);
});
test('death and surviving-injury growth are side-local, golden, and do not directly buff the fighter',()=>{
 for(const side of [0,1])for(const golden of [false,true]){const s=state(),m=golden?2:1,c=E.make(s,'dragon1',{golden,attack:0,health:1}),foe=E.make(s,'neutral0',{attack:1,health:10000}),r=side?E.combat(s,[foe],[c]):E.combat(s,[c],[foe]);A.deepEqual([r.progress[side].tavernAttack,r.progress[side].tavernHealth],[m,m]);A.equal(r.progress[1-side].tavernAttack,0);A.equal(r.discount[side],0);}
 const s=state(),c=E.make(s,'dragon13',{health:3,attack:0}),r=E.combat(s,[c],[E.make(s,'neutral0',{attack:1,health:10000})]);A.deepEqual([r.progress[0].tavernAttack,r.progress[0].tavernHealth],[4,6]);A.deepEqual(r.permanent[0],{});A.equal(c.health,3);
});
test('combat updates frozen offers once and stores history for future refreshes',()=>{
 const s=state();s.shop=[E.make(s,'royal0'),E.make(s,'mana')];s.frozen=true;s.progress.tavernAttack=4;s.progress.tavernHealth=6;s.shop[0].attack+=4;s.shop[0].health+=6;const before=body(s.shop[0]),p={...s.progress,tavernAttack:7,tavernHealth:11};E.settleProgress(s,p);A.deepEqual(body(s.shop[0]),[before[0]+3,before[1]+5]);const buffs=s.progress.buffs;E.settleProgress(s,s.progress);A.deepEqual(body(s.shop[0]),[before[0]+3,before[1]+5]);A.equal(s.progress.buffs,buffs);E.startRound(s);A.deepEqual(body(s.shop[0]),[before[0]+3,before[1]+5]);
});
test('dragon feeder removes highest-health offer, buffs neighbors only, never gets resources/keywords',()=>{
 for(const golden of [false,true]){const s=state(),m=golden?2:1,a=add(s,'dragon6'),f=add(s,'dragon17',{golden}),b=add(s,'dragon7');s.shop=[E.make(s,'royal0',{attack:80,health:8}),E.make(s,'rune1',{attack:9,health:50}),E.make(s,'dragon')];const before=[body(a),body(f),body(b)],gold=s.gold;E.endRecruit(s);A.deepEqual(body(a),[before[0][0]+9*m,before[0][1]+50*m]);A.deepEqual(body(b),[before[2][0]+9*m,before[2][1]+50*m]);A.deepEqual(body(f),before[1]);A.equal(s.shop.length,2);A.equal(s.hand.length,0);A.equal(s.gold,gold);A.equal(s.feasts.length,1);A.equal(s.feasts[0].food.id,'rune1');A(!a.keywords.includes('shield'));A(E.validate(s));}
});
test('empty/no-recipient feasts are no-ops; duplicate feeders cannot eat the same offer twice',()=>{
 const s=state();add(s,'dragon17');s.shop=[E.make(s,'rune1')];E.endRecruit(s);A.equal(s.shop.length,1);A.equal(s.feasts.length,0);add(s,'dragon6');add(s,'dragon17');const bodyBefore=s.board[1].attack;E.endRecruit(s);A.equal(s.shop.length,0);A.equal(s.feasts.length,1);A.equal(s.board[1].attack,bodyBefore+D.byId.rune1.attack);
 const t=state();add(t,'blood9');t.shop=[];const hp=t.hp;E.endRecruit(t);A.equal(t.hp,hp);A.equal(t.bloodDamage,0);
});
test('blood feeds after self-harm and its tavern triggers; sheep can heal but one hp cannot cheat',()=>{
 for(const hp of [1,20]){const s=state();s.hp=hp;const eater=add(s,'blood9');add(s,'blood13');add(s,'blood11');s.shop=[E.make(s,'royal0',{attack:10,health:3}),E.make(s,'dragon2',{attack:5,health:20})];const before=body(eater);E.endRecruit(s);if(hp===1){A.equal(s.shop.length,2);A.deepEqual(body(eater),before);A.deepEqual(market(s),[0,0]);}else{A.equal(s.hp,19);A.equal(s.bloodDamage,2);A.deepEqual(market(s),[1,1]);A.deepEqual(body(eater),[before[0]+11,before[1]+4]);A.equal(s.feasts[0].food.id,'royal0');A(!eater.keywords.includes('shield'));}}
});
test('body payoffs use entry-health snapshot rather than tavern tier; healer uses own health',()=>{
 for(const tier of [1,6]){const s=state(),c=E.make(s,'dragon9',{attack:1,health:30}),r=E.combat(s,[c],[E.make(s,'neutral0',{attack:1,health:10000})],{tier});const frames=r.events.filter(e=>e.text.includes('漆黑突袭'));A(frames.length>0);A(frames.every(e=>e.text.includes('永久攻击 +5')));}
 for(const health of [9,10]){const s=state();s.tier=1;s.hp=20;add(s,'dragon8',{health});E.endRecruit(s);A.equal(s.hp,health===10?24:20);}
});
test('old save history defaults to zero and current-state imports reject invalid tavern counters',()=>{
 const s=state();delete s.progress.tavernAttack;delete s.progress.tavernHealth;const before=E.copy(s.shop);A(E.validate(s));E.normalize(s);A.deepEqual(market(s),[0,0]);A.deepEqual(s.shop,before);for(const n of [-1,1.2,Infinity]){const bad=E.copy(s);bad.progress.tavernHealth=n;A(!E.validate(bad));}A(E.validate(E.normalize(E.copy(s))));
});
test('AI preserves real food, positions dragon receivers and uses Rowan at six stars',()=>{
 const s=state(),o=s.opponents[0];s.round=12;Object.assign(o,{hero:'dragon',tribe:'dragon',route:1,tier:6,gold:1,powerUsed:false,board:['dragon6','dragon17','dragon7'].map(id=>E.make(s,id)),hand:[],shop:[E.make(s,'rune1',{attack:40,health:60})],progress:E.scaling.read()});AI.prepare(s,o,E,{started:true,bonusGold:false});A(o.powerUsed);A.deepEqual(market(o),[1,1]);A.equal(o.feasts.length,1);A(o.board.find(c=>c.id==='dragon6').attack>=50);A(o.board.find(c=>c.id==='dragon7').attack>=53);A.equal(o.shop.length,0);A.equal(o.aiSummary.cardsBought,0);A(E.validate(s));
});
test('blood AI reserves health for its mandatory end-turn feast before buying optional self-harm',()=>{
 const s=state(),o=s.opponents[0];s.round=8;Object.assign(o,{hero:'blood',tribe:'blood',route:0,hp:8,tier:5,gold:D.byId.bloodPact.cost,powerUsed:true,board:[E.make(s,'blood9')],hand:[],shop:[E.make(s,'neutral0',{attack:100,health:100}),E.make(s,'bloodPact')]});AI.prepare(s,o,E,{started:true,bonusGold:false});A(!o.aiSummary.bought.includes('bloodPact'));A(o.hp>=6);A(E.validate(s));
});
test('actual fight records visible feasts and applies enemy and player shop growth with valid saves',()=>{
 const s=state();s.board=['dragon6','dragon17','dragon1'].map(id=>E.make(s,id));s.shop=[E.make(s,'neutral0',{attack:10,health:15}),E.make(s,'mana')];A(E.act(s,'fight').ok);A(s.result.events[0].food);A.equal(s.result.events[0].food.id,'neutral0');A(s.progress.tavernAttack>=0);A(E.validate(s));const saved=E.normalize(E.copy(s));A(E.validate(saved));A(E.act(saved,'continue').ok);A.equal(saved.feasts.length,0);
});
console.log(passed+' market groups passed.');
