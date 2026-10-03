'use strict';
const A=require('node:assert/strict'),E=require('./engine'),D=require('./data'),AI=require('./ai');let passed=0;
const test=(name,f)=>{f();passed++;console.log('PASS '+name)},state=(hero='deus')=>E.create(hero,19331),add=(s,id,x={})=>{const c=E.make(s,id,x);s.board.push(c);return c;},act=(s,t,a={})=>{const r=E.act(s,t,a);A(r.ok,r.message)};
const play=(s,id,x={})=>{const c=E.make(s,id,x);s.hand.push(c);act(s,'play',{uid:c.uid});return c;},summons=(r,side,id)=>r.events.filter(e=>e.kind==='summon').map(e=>e.boards[side].find(c=>c.battleId===e.to)).filter(c=>c?.id===id);
test('six real artifact identities have distinct functions and all thirteen tokens triple without entering shops',()=>{
 A.equal(D.tokens.length,13);A.equal(D.constructCycle.length,6);A.equal(new Set(D.constructCycle.map(id=>D.byId[id].sourceId)).size,6);
 for(const id of D.constructCycle){const d=D.byId[id];A(d.sourceUrl.endsWith('/'+d.sourceId));A(!D.cards.includes(d));const s=state();s.tier=4;for(let i=0;i<3;i++)add(s,id,{attack:d.attack+3});E.triples(s);A.equal(s.board.length,1);A(s.board[0].golden);A.equal(s.board[0].attack,d.attack*2+9);A(s.discover[0].options.every(id=>!D.byId[id].token&&D.byId[id].tier===5));A(E.validate(s));}
});
test('new deathrattle pairs have exact golden bodies, shields/guards and functional token effects on both sides',()=>{
 for(const side of [0,1])for(const golden of [false,true])for(const id of ['artifact16','artifact18']){const s=state(),m=golden?2:1,c=E.make(s,id,{attack:20,health:30,golden}),enemy=E.make(s,'neutral0',{attack:1000,health:100000}),meta={scrap:9},r=side?E.combat(s,[enemy],[c],{},meta):E.combat(s,[c],[enemy],meta,{}),ids=id==='artifact16'?['mysticArtifact','spinariaArtifact']:['radiantArtifact','mysticArtifact'];
  for(const token of ids){const spawned=summons(r,side,token);A.equal(spawned.length,1);const t=spawned[0];A.equal(t.attack,(id==='artifact18'?20:D.byId[token].attack)*m);A.equal(t.maxHealth,(id==='artifact18'?25:D.byId[token].health)*m);A.equal(t.effectScale,m);if(token==='mysticArtifact')A(t.keywords.includes('taunt'));}
  if(id==='artifact16')A.equal(r.progress[side].arms,3*m);else A(r.events.some(e=>e.text.includes('谢幕炮击：'+(20*m*m)+' 点')));A.equal(s.hand.length,0);A.equal(r.progress[1-side].arms,0);
 }
});
test('reborn token returns once at one health and ancient token attacks twice without mutating recruits',()=>{
 const s=state(),c=E.make(s,'bifurcatingArtifact',{attack:3,health:20}),r=E.combat(s,[c],[E.make(s,'neutral0',{attack:100,health:1000})]);A.equal(summons(r,0,c.id).length,1);A.equal(summons(r,0,c.id)[0].health,1);A.equal(c.health,20);
 const a=E.make(s,'ancientArtifact',{attack:2,health:1000}),b=E.combat(s,[a],[E.make(s,'neutral0',{attack:1,health:1000})]);A(b.events.some(e=>e.kind==='attack'&&e.from===100001&&e.text.includes('连击 2/2')));
});
test('Miriam gives recruitable replicas and golden battlecry repetition respects hand and triple rules',()=>{
 for(const golden of [false,true]){const s=state();const c=play(s,'artifact8',{golden});A.equal(s.scrap,0);A.equal(s.hand.length,golden?2:1);A(s.hand.every(c=>c.id==='bifurcatingArtifact'));A.equal(c.attack,D.byId.artifact8.attack);}
 const s=state();add(s,'royal3');play(s,'artifact8',{golden:true});A.equal(s.hand.filter(c=>c.golden).length,1);A.equal(s.discover.length,1);A.equal(s.hand.length,2);
});
test('Erika reserves exactly one extra battlecry, stacks additively with General and expires unused next round',()=>{
 const s=state('royal');s.gold=10;add(s,'royal3');const target=add(s,'royal14'),a=target.attack;act(s,'power');A(s.heroCry);play(s,'bones');A(s.heroCry);play(s,'royal0');A(s.heroCry);play(s,'royal11');A(!s.heroCry);A.equal(target.attack,a+12);A.equal(s.hand.filter(c=>c.id==='knight'&&c.golden).length,1);A.equal(s.discover.length,1);
 const t=state('royal');act(t,'power');A(E.validate(E.copy(t)));t.round++;E.startRound(t);A(!t.heroCry);
});
test('Forte and Snow are temporary, reject redundant targets without payment, and survive triples and saves',()=>{
 for(const hero of ['forte','snow']){const s=state(hero),key=hero==='forte'?'heroWindfury':'heroReborn',c=add(s,'neutral1',{attack:4,health:50});s.gold=10;act(s,'power',{target:c.uid});A(c[key]);A.equal(c.attack,4);A(E.validate(E.copy(s)));const before=JSON.stringify(s);A(!E.act(s,'power',{target:c.uid}).ok);A.equal(JSON.stringify(s),before);
  const r=E.combat(s,[c],[E.make(s,'neutral0',{attack:10,health:1000})]);if(hero==='snow'){A.equal(summons(r,0,c.id).length,1);A.equal(summons(r,0,c.id)[0].health,1);}else A(r.events.some(e=>e.from===100001&&e.text.includes('连击 2/2')));
  add(s,'neutral1');add(s,'neutral1');E.triples(s);A(s.board[0][key]);s.discover=[];s.round++;E.startRound(s);A(!s.board[0][key]);
  const p=state(hero),d=add(p,hero==='snow'?'bifurcatingArtifact':'ancientArtifact'),snap=JSON.stringify(p);A(!E.act(p,'power',{target:d.uid}).ok);A.equal(JSON.stringify(p),snap);
 }
});
test('Roland gives guard; Angel separates healing from armor and spends real gold',()=>{
 const s=state('roland'),c=add(s,'neutral0'),h=c.health;act(s,'power',{target:c.uid});A.equal(c.health,h+4);A(c.keywords.includes('taunt'));A(!c.keywords.includes('shield'));
 for(const hp of [35,39,40]){const p=state('angel');p.hp=hp;const armor=p.armor;act(p,'power');A.equal(p.gold,2);A.equal(p.hp,Math.min(40,hp+4));A.equal(p.armor,armor+(hp===40?2:0));}
});
test('Deus cycles all six tokens deterministically, persists through saves and rejects full hands transactionally',()=>{
 const s=state();for(let i=0;i<12;i++){s.hand=[];s.gold=10;s.powerUsed=false;act(s,'power');A.equal(s.hand[0].id,D.constructCycle[i%6]);A.equal(s.constructIndex,(i+1)%6);A.equal(s.progress.arms,0);A(E.validate(E.normalize(E.copy(s))));}
 s.powerUsed=false;s.hand=Array.from({length:10},()=>E.make(s,'bones'));const before=JSON.stringify(s);A(!E.act(s,'power').ok);A.equal(JSON.stringify(s),before);
 for(const key of ['heroReborn','heroWindfury']){const bad=E.copy(s);bad.hand[0][key]='yes';A(!E.validate(bad));}for(const x of [-1,6,1.2]){const bad=E.copy(s);bad.constructIndex=x;A(!E.validate(bad));}
});
test('AI carries hero state across turns and selects legal temporary combat targets',()=>{
 for(const hero of ['deus','royal','forte','snow','angel','roland']){const s=state(hero),h=D.heroes.find(h=>h.id===hero),o=s.opponents[0];Object.assign(o,{hero,tribe:h.tribe==='neutral'?s.activeTribes[0]:h.tribe,tier:4,route:0,gold:10,hp:40,board:['neutral0','ancientArtifact','bifurcatingArtifact'].map(id=>E.make(s,id)),hand:[],shop:[],powerUsed:false,constructIndex:3});s.round=7;AI.prepare(s,o,E,{started:true,deferEnd:true,bonusGold:false});A(E.validate(s));if(hero==='deus')A.equal(o.constructIndex,4);if(hero==='forte')A(o.board.some(c=>c.heroWindfury));if(hero==='snow')A(o.board.some(c=>c.heroReborn));}
});
console.log(passed+' construct and hero groups passed.');
