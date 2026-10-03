'use strict';
const A=require('node:assert/strict'),E=require('./engine'),D=require('./data'),S=E.scaling,AI=require('./ai');let passed=0;
const test=(n,f)=>{f();passed++;console.log('PASS '+n);},state=()=>E.create('angel',67719,'normal',['royal','forest','haven','dragon']);
const add=(s,id,x={})=>{const c=E.make(s,id,x);s.board.push(c);return c;};
const play=(s,id,target,x={})=>{const c=E.make(s,id,x);s.hand.push(c);const r=E.act(s,'play',{uid:c.uid,target:target?.uid});A(r.ok,r.message);return c;};
const body=c=>[c.attack,c.health],open=r=>r.events.find(e=>e.text==='开战效果结算完成。');
test('eight neutral tools and shield retirement are reflected in every random pool',()=>{
 A.equal(D.rulesVersion,'15.0');A.equal(D.cards.length,169);A.equal(D.cards.filter(c=>c.tribe==='neutral').length,14);A.equal(D.spells.length,19);A(!D.spells.some(c=>c.effect==='shield'));A(D.retiredSpells.some(c=>c.id==='shield'));
 const s=state();s.gold=1000;s.tier=6;for(let n=0;n<60;n++){A(E.act(s,'refresh').ok);A(!s.shop.some(c=>c.id==='shield'));}for(let n=6;n<14;n++){const d=D.byId['neutral'+n];A(d.sourceId&&d.art&&d.text&&d.goldenText);A(require('fs').existsSync(d.art));A(E.available(s,d));}A.equal(D.heroes.find(h=>h.id==='athena').armor,6);
});
test('legacy shield hands migrate to guard spells, shop removes them, existing shield stacks survive',()=>{
 const s=state(),c=add(s,'royal0',{shieldLayers:4});s.hand=[E.make(s,'shield')];s.shop=[E.make(s,'shield')];s.opponents[0].hand=[E.make(s,'shield')];s.opponents[0].shop=[E.make(s,'shield')];A(E.validate(s));E.normalize(s);A.equal(s.hand[0].id,'guard');A.equal(s.shop.length,0);A.equal(s.opponents[0].hand[0].id,'guard');A.equal(s.opponents[0].shop.length,0);A.equal(S.shieldCount(c),4);A(E.validate(s));
 s.hand=[E.make(s,'shield')];const before=E.copy(s);A(!E.act(s,'play',{uid:s.hand[0].uid,target:c.uid}).ok);A.deepEqual(s,before);
});
test('flag bearer gives guard instead of shields; banner buffs both stats without shields',()=>{
 for(const golden of [false,true]){const s=state(),m=golden?2:1;add(s,'royal13',{golden});const c=add(s,'royal11');E.endRecruit(s);A.equal(s.hand.length,m);A(s.hand.every(c=>c.id==='guard'));A(E.act(s,'play',{uid:s.hand[0].uid,target:c.uid}).ok);A(c.keywords.includes('taunt'));A(!c.keywords.includes('shield'));}
 const s=state(),c=add(s,'neutral0'),old=body(c);s.amulets=[{...E.make(s,'banner'),count:1}];E.endRecruit(s);A.deepEqual(body(c),old.map(v=>v+3));A(!c.keywords.includes('shield'));
});
test('Otohime shields only adjacent royal allies on either side and in both qualities',()=>{
 for(const side of [0,1])for(const golden of [false,true]){const s=state(),m=golden?2:1,team=['royal11','royal12','royal7','neutral0','royal14'].map(id=>E.make(s,id,{attack:0}));team[2].golden=golden;const r=side?E.combat(s,[],team):E.combat(s,team,[]),b=open(r).boards[side];A.equal(S.shieldCount(b[0]),0);A.equal(S.shieldCount(b[1]),m);A.equal(S.shieldCount(b[2]),1);A.equal(S.shieldCount(b[3]),0);A.equal(S.shieldCount(b[4]),0);for(const i of [0,1,4])A.equal(b[i].health,team[i].health+8*m);}
});
test('forest opener gives larger stats without shields; surviving guardian grows neighbor health',()=>{
 const s=state(),a=E.make(s,'forest0'),b=E.make(s,'forest7'),r=E.combat(s,[a,b],[],{progress:{fairy:10}});A.equal(open(r).boards[0][0].health,a.health+18);A.equal(S.shieldCount(open(r).boards[0][0]),0);
 const ally=E.make(s,'royal11',{attack:0,health:100}),guard=E.make(s,'royal2',{attack:0,health:10}),enemy=E.make(s,'neutral0',{attack:1,health:100}),v=E.combat(s,[guard,ally],[enemy]);A(v.events.some(e=>e.text.includes('近卫掩护')));A(v.permanent[0][ally.uid].health>0);A(!v.events.some(e=>e.kind==='shield'));
});
test('healing battlecry normal/golden, overflow cap and hero repetition',()=>{
 for(const golden of [false,true]){const s=state();s.hp=20;s.heroCry=true;play(s,'neutral7',null,{golden});A.equal(s.hp,golden?36:28);A(!s.heroCry);s.hp=39;play(s,'neutral7');A.equal(s.hp,40);}
});
test('neutral spell/amulet gifts obey tier and four-tribe pools with golden quantity',()=>{
 for(const id of ['neutral8','neutral12'])for(const golden of [false,true]){const s=state();s.tier=4;play(s,id,null,{golden});A.equal(s.hand.length,golden?2:1);for(const c of s.hand){const d=D.byId[c.id];A(E.available(s,d));A.equal(d.type,id==='neutral8'?'amulet':'spell');A(d.tier<=(id==='neutral8'?4:2));A(!d.retired);}A(E.validate(s));}
});
test('neutral countdown battlecry resolves expiring amulets once per expiry',()=>{
 for(const golden of [false,true]){const s=state();s.amulets=[{...E.make(s,'tomb'),count:2}];play(s,'neutral13',null,{golden});if(golden){A.equal(s.amulets.length,0);A.equal(s.progress.prayers,1);A.equal(s.grave,6);A.equal(s.hand.filter(c=>c.id==='skeleton').length,1);}else{A.equal(s.amulets[0].count,1);A.equal(s.progress.prayers,0);}}
});
test('cannot-attack units never initiate even buffed with windfury, but retaliate',()=>{
 const s=state(),c=E.make(s,'neutral11',{attack:25,health:100,heroWindfury:true}),foe=E.make(s,'neutral0',{attack:1,health:20}),r=E.combat(s,[c],[foe]);A(r.events.filter(e=>e.kind==='attack').every(e=>e.from!==open(r).boards[0][0].battleId));A.equal(r.winner,0);A.equal(r.survivors[0][0].health,99);
 const b=E.make(s,'neutral6',{attack:10,health:10}),v=E.combat(s,[b],[E.make(s,'neutral11',{attack:10})]);A.equal(v.winner,-1);A(v.steps<=2);A(!v.events.some(e=>e.kind==='attack'));
});
test('Dingdong death buff is battle-only and repeats through last-word support',()=>{
 for(const golden of [false,true]){const s=state(),m=golden?2:1,c=E.make(s,'neutral6',{golden,health:1}),ally=E.make(s,'neutral11',{attack:0,health:100}),r=E.combat(s,[c,ally],[E.make(s,'neutral0',{attack:1,health:3})]);const frame=r.events.find(e=>e.text.includes('余音'));A(frame);const a=frame.boards[0].find(x=>x.uid===ally.uid);A.equal(a.attack,2*m);A.equal(a.maxHealth,100+2*m);A.deepEqual(r.permanent[0],{});A.equal(ally.attack,0);}
});
test('stealth avoids attack targeting and suppresses its guard until all targets are hidden',()=>{
 const s=state(),hidden=E.make(s,'neutral9',{attack:0,health:10,keywords:['stealth','taunt','cannotAttack']}),visible=E.make(s,'neutral0',{attack:0,health:1}),actor=E.make(s,'neutral0',{attack:20,health:100}),r=E.combat(s,[actor],[hidden,visible]),attacks=r.events.filter(e=>e.kind==='attack');A.equal(attacks[0].boards[1].find(c=>c.battleId===attacks[0].to).uid,visible.uid);A.equal(attacks[1].boards[1].find(c=>c.battleId===attacks[1].to).uid,hidden.uid);A.equal(r.winner,0);A(hidden.keywords.includes('stealth'));
});
test('stealth reveals at attack, random/AOE effects still hit it, original state is untouched',()=>{
 const s=state(),c=E.make(s,'neutral9',{attack:1,health:20}),foe=E.make(s,'neutral11',{attack:0,health:20}),r=E.combat(s,[c],[foe]);const reveal=r.events.find(e=>e.kind==='reveal');A(reveal);A(!reveal.boards[0][0].keywords.includes('stealth'));A(c.keywords.includes('stealth'));
 const v=E.combat(s,[E.make(s,'neutral9',{health:2})],[E.make(s,'dragon7',{attack:5})]);A.equal(v.deadCount[0],1);A(!v.events.some(e=>e.kind==='reveal'));
});
test('stealth support buffs adjacent attacks including windfury, never itself or recruitment stats',()=>{
 for(const golden of [false,true]){const s=state(),m=golden?2:1,actor=E.make(s,'neutral0',{attack:1,health:100,heroWindfury:true}),support=E.make(s,'neutral9',{golden,attack:0,health:100}),r=E.combat(s,[actor,support],[E.make(s,'neutral11',{attack:0,health:12})]);const hits=r.events.filter(e=>e.kind==='attack');A(hits.length>=2);A.equal(hits[0].boards[0].find(c=>c.uid===actor.uid).attack,1+4*m);A.equal(hits[1].boards[0].find(c=>c.uid===actor.uid).attack,1+8*m);A.equal(actor.attack,1);A.deepEqual(r.permanent[0],{});}
});
test('destruction kills huge health, still takes simultaneous retaliation, both sides and qualities',()=>{
 for(const side of [0,1])for(const golden of [false,true]){const s=state(),c=E.make(s,'neutral10',{golden,attack:golden?2:1,health:4}),f=E.make(s,'neutral0',{attack:100,health:1000000}),idle=E.make(s,'neutral11',{attack:0}),r=side?E.combat(s,[f],[c,idle]):E.combat(s,[c,idle],[f]);A(r.events.some(e=>e.kind==='destroy'));A.equal(r.deadCount[side],1);A.equal(r.deadCount[1-side],1);A(!r.survivors[side].some(x=>x.uid===c.uid));A.equal(c.health,4);}
});
test('shields block destruction; destroyed dragon never triggers survived-injury growth',()=>{
 const s=state(),c=E.make(s,'neutral10',{attack:1,health:100}),f=E.make(s,'dragon13',{attack:0,health:1000000,keywords:['shield'],shieldLayers:2}),r=E.combat(s,[c],[f]);const attacks=r.events.filter(e=>e.kind==='attack');A.equal(attacks.length,3);A.equal(r.events.filter(e=>e.kind==='destroy').length,1);A.equal(r.progress[1].tavernAttack,0);A.equal(r.events.flatMap(e=>e.impacts||[]).filter(i=>i.blocked).length,2);
});
test('destruction still triggers last words and reborn rather than banishing',()=>{
 const s=state(),c=E.make(s,'neutral10',{attack:1,health:100}),f=E.make(s,'night0',{attack:0,health:100000,heroReborn:true}),r=E.combat(s,[c],[f]);A(r.events.some(e=>e.kind==='summon'&&e.text.startsWith('复生')));A(r.events.some(e=>e.kind==='summon'&&e.boards[1].some(c=>c.id==='skeleton')));A(r.grave[1]>=3);
});
test('destruction does not apply to retaliation, zero damage or cleave neighbors',()=>{
 const s=state(),a=E.make(s,'neutral0',{attack:1,health:200}),b=E.make(s,'neutral10',{attack:1,health:10,keywords:['destruction','cannotAttack']}),r=E.combat(s,[a],[b]);A(!r.events.some(e=>e.kind==='destroy'));
 const cleave=E.make(s,'dragon6',{attack:1,health:100,keywords:['destruction']}),foes=[E.make(s,'neutral11',{attack:0,health:100}),E.make(s,'neutral11',{attack:0,health:100}),E.make(s,'neutral11',{attack:0,health:100})];foes[0].keywords=['cannotAttack'];foes[2].keywords=['cannotAttack'];const v=E.combat(s,[cleave,...Array.from({length:3},()=>E.make(s,'neutral6'))],foes),first=v.events.find(e=>e.kind==='attack');A.equal(first.boards[1][0].health,99);A.equal(first.boards[1][1].health,0);A.equal(first.boards[1][2].health,99);
});
test('spell preview equals actual stat payload across research, weapons and grave values',()=>{
 for(const amp of [0,7,100])for(const grave of [0,9])for(const id of ['growth','mana','bless','guard','bloodPact','dragonWing','module','ritual']){const s=state();s.progress.spellcraft=amp;s.progress.arms=12;s.grave=grave;const c=add(s,'analyzer'),old=body(c),v=S.spellView(s,D.byId[id]);play(s,id,c);A.deepEqual(body(c),[old[0]+v.attack,old[1]+v.health],id);A(!v.text.includes('undefined'));}
 const s=state();s.progress.spellcraft=9;s.shop=[E.make(s,'neutral0')];const v=S.spellView(s,D.byId.dragon),old=body(s.shop[0]);play(s,'dragon');A.deepEqual(body(s.shop[0]),[old[0]+v.attack,old[1]+v.health]);A.equal(S.spellView(s,D.byId.rich).short,'下回合金币 +2');A.equal(S.spellView(s,D.byId.bones).short,'墓场 +5');
});
test('new keywords survive golden merge, save validation and native stealth after reborn',()=>{
 const s=state();s.hand=Array.from({length:3},()=>E.make(s,'neutral9'));E.triples(s);A(s.hand[0].golden);A(s.hand[0].keywords.includes('stealth'));A(E.validate(s));const restored=E.normalize(E.copy(s));A(restored.hand[0].keywords.includes('stealth'));restored.hand[0].keywords.push('unrecognized');A(!E.validate(restored));
 const c=E.make(s,'neutral9',{attack:1,health:1,heroReborn:true}),r=E.combat(s,[c],[E.make(s,'neutral11',{attack:1,health:100})]),frame=r.events.find(e=>e.kind==='summon'&&e.text.startsWith('复生'));A(frame);A(frame.boards[0].find(c=>c.battleId===frame.to).keywords.includes('stealth'));
});
test('AI can deploy healing and support tools without inventing income or attacks',()=>{
 const s=state(),o=s.opponents[0];Object.assign(o,{hero:'angel',tribe:'royal',route:1,hp:10,gold:0,powerUsed:true,tier:4,board:[E.make(s,'royal0')],hand:[E.make(s,'neutral7'),E.make(s,'neutral12'),E.make(s,'neutral9')],shop:[],progress:S.read()});s.round=8;AI.prepare(s,o,E,{started:true,bonusGold:false,deferEnd:true});A(o.hp>=14);A(o.board.some(c=>c.id==='neutral9'));A(!o.hand.some(c=>c.id==='shield'));A(E.validate(s));
 const t=state(),f=t.opponents[0];t.round=7;Object.assign(f,{hero:'forte',tribe:'dragon',route:0,tier:6,gold:1,powerUsed:false,board:[E.make(t,'neutral11')],hand:[],shop:[]});AI.prepare(t,f,E,{started:true,bonusGold:false,deferEnd:true});A(!f.powerUsed,'AI should not give windfury to a unit that cannot attack');
});
test('500 new-roster combats are deterministic, preserve inputs, bounded and valid to save',()=>{
 let largest=0;for(let seed=1;seed<=500;seed++){const s=state();s.seed=seed;const team=()=>Array.from({length:7},()=>{const d=E.pick(s,D.cards),golden=E.rand(s)<.3,m=golden?2:1;return E.make(s,d.id,{attack:d.attack*m+Math.floor(E.rand(s)*40),health:d.health*m+Math.floor(E.rand(s)*80),golden});}),left=team(),right=team(),before=E.copy([left,right]),copy=E.copy(s),meta={tier:6,grave:80,spells:60,bloodDamage:30,scrap:30,progress:{fairy:20,spellcraft:10}},r=E.combat(s,left,right,meta,meta);if(seed<=20)A.deepEqual(r,E.combat(copy,left,right,meta,meta));A.deepEqual([left,right],before);largest=Math.max(largest,r.events.length);A(r.events.length<=1000);s.phase='result';s.result={...r,fatigue:0,opponent:'Test'};A(E.validate(s),'invalid combat seed '+seed);}console.log('  random combats: 500, max frames: '+largest);
});
console.log(passed+' utility groups passed.');
