'use strict';
const A=require('node:assert/strict'),E=require('./engine.js'),D=require('./data.js');
let passed=0;const failures=[];
const test=(name,fn)=>{try{fn();passed++;console.log('PASS '+name);}catch(error){failures.push({name,error});console.error('FAIL '+name+'\n'+error.stack);}};
const state=(seed=815721)=>E.create('dragon',seed,'normal',['dragon','forest','artifact','haven']);
const unit=(s,id,extra={})=>E.make(s,id,{attack:1,health:1000000,keywords:[],...extra});
const enemy=(s,extra={})=>unit(s,'neutral0',{attack:1000,...extra});
const battle=(s,team,foes,meta={},side=0,other={})=>side?E.combat(s,foes,team,other,meta):E.combat(s,team,foes,meta,other);
const opening=r=>r.events.find(e=>e.text==='开战效果结算完成。');
const total=(r,side,key)=>Object.values(r.permanent[side]).reduce((n,v)=>n+v[key],0);
const summons=(r,id,side=0,reason='')=>r.events.filter(e=>e.kind==='summon'&&(!reason||e.text.startsWith(reason))&&e.boards[side].some(c=>c.battleId===e.to&&c.id===id)).map(e=>({event:e,card:e.boards[side].find(c=>c.battleId===e.to)}));
const act=(s,type,args)=>{const r=E.act(s,type,args);A.equal(r.ok,true,r.message);return r;};

test('fairy and bat armies are isolated by side and leave original formations unchanged',()=>{
 const s=state(),left=['fairy','bat'].map(id=>E.make(s,id)),right=['fairy','bat'].map(id=>E.make(s,id)),before=E.copy([left,right]);
 const lm={progress:{fairy:20,arms:3,prayers:6},bloodDamage:30},rm={progress:{fairy:3,arms:9,prayers:0},bloodDamage:4},r=E.combat(s,left,right,lm,rm),frame=opening(r);
 A.deepEqual(frame.boards.map(b=>b.map(c=>[c.attack,c.health])),[[[21,21],[16,16]],[[4,4],[3,3]]]);A.deepEqual([left,right],before);A.deepEqual(r.progress,[{...E.scaling.read(lm),buffs:2},{...E.scaling.read(rm),buffs:2}]);A.equal(total(r,0,'attack'),0);A.deepEqual(r.meta.map(m=>m.progress),[E.scaling.read(lm),E.scaling.read(rm)]);
});

test('Roach has windfury without a play threshold; ranger attack uses the full army multiplier',()=>{
 for(const side of [0,1])for(const golden of [false,true]){
  const s=state(),m=golden?2:1,c=unit(s,'forest1',{golden}),r=battle(s,[c],[enemy(s,{attack:1})],{played:0},side);A(r.events.some(e=>e.kind==='attack'&&e.text.includes('连击 2/2')));
  const ranger=unit(s,'forest3',{attack:5,golden}),x=battle(s,[ranger],[],{played:30,progress:{fairy:20}},side);A.equal(opening(x).boards[side][0].attack,5+20*m);A.equal(ranger.attack,5);
 }
});

test('fairy princess has one inheriting last word, without an extra avenge summon',()=>{
 for(const side of [0,1])for(const golden of [false,true]){
  const s=state(),m=golden?2:1,c=unit(s,'forest5',{attack:40,health:60,golden}),r=battle(s,[c],[enemy(s)],{progress:{fairy:9}},side),spawn=summons(r,'fairy',side);A.equal(spawn.length,2);A(spawn.every(({card})=>card.attack===3*m+20+9&&card.health===3*m+30+9));A.equal(c.attack,40);A.equal(c.health,60);
 }
 const s=state(),c=unit(s,'forest5'),r=E.combat(s,[c,...Array.from({length:6},()=>unit(s,'neutral0',{health:1}))],[enemy(s)]);A.equal(summons(r,'fairy').length,0,'the surviving princess must not generate an avenge fairy');
});

test('Liza grows only army quality; each new fairy uses the previous quality',()=>{
 for(const golden of [false,true]){
  const s=state(),m=golden?2:1,queen=unit(s,'forest6',{golden}),c=unit(s,'forest5',{attack:20,health:20,keywords:['taunt']}),r=E.combat(s,[queen,c],[enemy(s)],{progress:{fairy:7,arms:2,prayers:3}}),spawn=summons(r,'fairy');A.equal(spawn.length,2);
  A.equal(spawn[0].card.attack,13+7);A.equal(spawn[1].card.attack,13+7+3*m);A.equal(r.progress[0].fairy,7+6*m);A.equal(r.events[0].progress[0].fairy,7);A.equal(total(r,0,'attack'),0);A.equal(total(r,0,'health'),0);
 }
});

test('Liza and the blood queen trigger on more than six and eight summons/deaths respectively',()=>{
 for(const side of [0,1])for(const golden of [false,true])for(const tribe of ['forest','blood']){
  const s=E.create('dragon',1),m=golden?2:1,queen=unit(s,tribe==='forest'?'forest6':'blood6',{golden}),team=[queen,...Array.from({length:6},()=>unit(s,tribe==='forest'?'forest5':'blood2',{health:1}))],r=battle(s,team,[enemy(s)],{progress:{fairy:0}},side);
  if(tribe==='forest'){const spawned=summons(r,'fairy',side).length;A(spawned>6);A.equal(r.progress[side].fairy,spawned*3*m);A.equal(total(r,side,'attack'),0);}else A(r.events.filter(e=>e.text.includes('血翼夜宴')).length>8);
 }
});

test('ancient tree strengthens other starting forest minions without shields',()=>{
 for(const side of [0,1])for(const golden of [false,true]){
  const s=state(),m=golden?2:1,tree=unit(s,'forest7',{golden}),c=unit(s,'forest0',{health:1,keywords:['taunt']}),other=unit(s,'neutral0'),r=battle(s,[tree,c,other],[enemy(s)],{progress:{fairy:10},tier:6},side),start=opening(r),n=18*m;
  A.equal(start.boards[side][0].attack,tree.attack);A.equal(start.boards[side][1].attack,c.attack+n);A.equal(start.boards[side][1].health,c.health+n);A(!start.boards[side][1].keywords.includes('shield'));A.equal(start.boards[side][2].attack,other.attack);
  const fairy=summons(r,'fairy',side)[0].card;A.equal(fairy.attack,11);A.equal(fairy.health,11);A(!fairy.keywords.includes('shield'),'tree has no summon shield or attack aura');
 }
});

test('knight shield breaks permanently grow both attributes, with exact golden scaling',()=>{
 for(const side of [0,1])for(const golden of [false,true]){const s=state(),m=golden?2:1,c=unit(s,'royal0',{golden,keywords:['shield']}),before=E.copy(c),r=battle(s,[c],[enemy(s,{attack:1})],{},side);A.deepEqual(r.permanent[side][c.uid],{attack:m,health:m});A.deepEqual(c,before);}
});

test('guardian grows adjacent royal health after surviving attacks',()=>{
 for(const side of [0,1]){const s=state(),team=[unit(s,'royal11'),unit(s,'royal2',{keywords:['taunt']}),unit(s,'royal11')],r=battle(s,team,[enemy(s,{attack:1})],{},side),events=r.events.filter(e=>e.text.includes('近卫掩护'));A(events.length>8);A(events.every(e=>!e.boards[side].find(c=>c.battleId===e.to)?.keywords.includes('shield')));A.equal(total(r,side,'health'),events.length*3);}
});

test('Albert restores a shield after every kill beyond normal and golden historical limits',()=>{
 for(const side of [0,1])for(const golden of [false,true]){
  const s=state(),c=unit(s,'royal5',{attack:10000,health:10000,golden}),r=battle(s,[c],Array.from({length:7},()=>unit(s,'forest5',{attack:1,health:1})),{},side),attacks=r.events.filter(e=>e.kind==='attack'&&e.from===opening(r).boards[side][0].battleId);A(attacks.length>4);A(attacks.every(e=>e.boards[side].find(x=>x.uid===c.uid).keywords.includes('shield')));
 }
});

test('Emilia trains every living royal on every shield break beyond six triggers',()=>{
 for(const golden of [false,true]){
  const s=state(),m=golden?2:1,emilia=unit(s,'royal6',{golden}),team=[unit(s,'royal0',{keywords:['shield'],shieldLayers:10}),unit(s,'neutral0',{keywords:[]}),unit(s,'royal0',{keywords:['shield'],shieldLayers:10}),emilia],r=E.combat(s,team,[enemy(s,{attack:1})]);
  const events=r.events.filter(e=>e.text.includes('白银传承'));A(events.length>6);A.deepEqual(r.permanent[0][emilia.uid],{attack:events.length*2*m,health:events.length*2*m});A(!r.events.some(e=>e.text.includes('白银接力')));
 }
});

test('Otohime has one starting royal shield buff and no avenge knight generation',()=>{
 for(const golden of [false,true]){
  const s=state(),m=golden?2:1,c=unit(s,'royal7',{golden}),other=unit(s,'royal1',{health:1}),outsider=unit(s,'neutral0',{health:1}),r=E.combat(s,[c,other,outsider],[enemy(s)]),frame=opening(r);A.equal(frame.boards[0][1].attack,other.attack+8*m);A.equal(frame.boards[0][1].health,other.health+8*m);A(frame.boards[0][1].keywords.includes('shield'));A.equal(frame.boards[0][0].attack,c.attack);A.equal(frame.boards[0][2].attack,outsider.attack);A.equal(summons(r,'knight').length,0);
 }
});

test('injury dragons grow permanently and Leviathan regenerates shields beyond the old cap',()=>{
 for(const side of [0,1])for(const golden of [false,true]){
  const s=state(),m=golden?2:1,c=unit(s,'dragon2',{golden}),r=battle(s,[c],[enemy(s,{attack:1})],{},side);A(r.permanent[side][c.uid].attack>24*m);A.equal(r.permanent[side][c.uid].attack,r.permanent[side][c.uid].health);
  const levi=unit(s,'dragon5',{golden}),x=battle(s,[levi],[enemy(s,{attack:1})],{},side);A(x.events.filter(e=>e.text.includes('深海龙鳞')).length>2);A.equal(opening(x).boards[side][0].attack,1);A.equal(total(x,side,'attack'),0);A(x.survivors[side].every(c=>c.attack===1),'old temporary rage is removed');
 }
});

test('fire lizard only hurts neighbors twice; Fafnir uses its entire attack for the opening',()=>{
 for(const golden of [false,true]){
  const s=state(),m=golden?2:1,team=[unit(s,'dragon0'),unit(s,'dragon3',{golden}),unit(s,'dragon1')],r=E.combat(s,team,[enemy(s,{attack:0})]),frame=opening(r);A.equal(frame.boards[0][0].health,999998);A.equal(frame.boards[0][2].health,999998);A.equal(frame.boards[1][0].health,1000000);
  const fafnir=unit(s,'dragon7',{attack:81,golden}),x=E.combat(s,[fafnir],[enemy(s,{attack:1}),enemy(s,{attack:1})],{tier:6});A(opening(x).boards[1].every(c=>c.health===1000000-81*m));A.equal(total(x,0,'attack'),0,'Fafnir no longer grows on allied injuries');
 }
});

test('many trainers fully resolve beyond eight triggers while sharing compact replay frames',()=>{
 const s=state(),ids=['dragon2',...Array(6).fill('dragon4')],left=ids.map(id=>unit(s,id)),right=ids.map(id=>unit(s,id)),before=E.copy([left,right]),r=E.combat(s,left,right);A.equal(r.steps,160);A(r.events.length<=1000);A(total(r,0,'attack')>6*8*3);A(r.events.some(e=>e.text.includes('6 次触发')));A.deepEqual([left,right],before);
 s.board=left;s.phase='result';s.result={...r,opponent:'持久战测试',fatigue:0,round:s.round};A(E.validate(s),'extreme legal replay must be saveable');const loaded=JSON.parse(JSON.stringify(s));A(E.validate(loaded));A.deepEqual(loaded.result.permanent,r.permanent);A.deepEqual(loaded.board,left);
});

test('skeleton beast has no grave opening buff; spirit guide has no recurring reborn income',()=>{
 for(const side of [0,1])for(const golden of [false,true]){
  const s=state(),m=golden?2:1,beast=unit(s,'night0'),start=battle(s,[beast],[],{grave:100},side);A.equal(opening(start).boards[side][0].attack,beast.attack);A.equal(start.grave[side],100);
  const guide=unit(s,'night1',{golden}),aurelia=unit(s,'royal4',{health:3,keywords:['taunt']}),r=battle(s,[guide,aurelia],[enemy(s)],{},side);A.equal(summons(r,'royal4',side,'复生').length,1);A.equal(r.grave[side],r.deadCount[side]);
 }
});

test('bone king no longer has permanent avenge; reaper keeps all death growth permanently',()=>{
 for(const id of ['night2','night3'])for(const golden of [false,true]){
  const s=state(),m=golden?2:1,c=unit(s,id,{golden}),team=[c,...Array.from({length:6},()=>unit(s,'forest5',{health:1}))],r=E.combat(s,team,[enemy(s)]),g=r.permanent[0][c.uid];A(r.deadCount[0]>=8);
  if(id==='night2'){A.equal(g,undefined);}else{A(g);A.equal(g.attack,2*m*r.deadCount[0]);A(!r.survivors[0].find(x=>x.uid===c.uid).keywords.includes('shield'));A.equal(g.health,g.attack);}
 }
});

test('Minthe repeats every allied last word beyond two and doubles the extra repetitions when gold',()=>{
 for(const golden of [false,true]){
  const s=state(),c=unit(s,'night4',{golden}),team=[c,...Array.from({length:4},()=>unit(s,'night0',{health:1}))],r=E.combat(s,team,[enemy(s)]),echoes=r.events.filter(e=>e.kind==='echo');A.equal(echoes.length,4);A(summons(r,'skeleton').length>=6);
  const isolated=E.combat(s,[unit(s,'night4',{golden}),unit(s,'night0',{health:1,keywords:['taunt']})],[enemy(s)]);A.equal(summons(isolated,'skeleton').length,golden?3:2);
 }
});

test('Nephthys revives more than two originals, spends their tiers, and cannot reset an origin',()=>{
 for(const side of [0,1])for(const golden of [false,true]){
  const s=state(),m=golden?2:1,neph=unit(s,'night7',{golden}),team=[neph,...Array.from({length:6},()=>unit(s,'neutral0',{health:3}))],r=battle(s,team,[enemy(s)],{grave:100},side),revives=summons(r,'neutral0',side,'复活');A.equal(revives.length,6);A.equal(new Set(revives.map(x=>x.card.originUid)).size,6);A(revives.every(({card})=>card.health===3*m&&card.resurrected&&!card.reborn));A.equal(r.grave[side],100+r.deadCount[side]-6);A.equal(opening(r).boards[side][0].attack,neph.attack,'old grave team buff is gone');
 }
 const s=state(),team=[unit(s,'night7'),unit(s,'night7',{health:1,keywords:['taunt']}),...Array.from({length:5},()=>unit(s,'neutral0',{health:1}))],r=E.combat(s,team,[enemy(s)],{grave:100}),revives=r.events.filter(e=>e.kind==='summon'&&e.text.startsWith('复活')).map(e=>e.boards[0].find(c=>c.battleId===e.to));A.equal(new Set(revives.map(c=>c.originUid)).size,revives.length);A(revives.length<=6);A(r.steps<=160);
});

test('Nephthys pays no grave when the tier is unaffordable or last words fill the board',()=>{
 const s=state(),low=E.combat(s,[unit(s,'night7'),unit(s,'dragon7',{attack:0,health:1,keywords:['taunt']})],[enemy(s)],{grave:0});A.equal(summons(low,'dragon7',0,'复活').length,0);A.equal(low.grave[0],1);
 const team=[unit(s,'night7'),unit(s,'forest5',{health:1,keywords:['taunt']}),...Array.from({length:5},()=>unit(s,'neutral0',{attack:0}))],r=E.combat(s,team,[enemy(s)],{grave:100});A.equal(summons(r,'forest5',0,'复活').length,0);A.equal(r.grave[0],100+r.deadCount[0]);
});

test('rune volley scales two beams by spell count and stops when no target remains',()=>{
 for(const side of [0,1])for(const golden of [false,true]){
  const s=state(),m=golden?2:1,c=unit(s,'rune4',{golden}),r=battle(s,[c],[enemy(s,{attack:0})],{spells:100},side),shots=r.events.filter(e=>e.text.includes('雷光弹幕'));A.equal(shots.length,2);A.equal(opening(r).boards[1-side][0].health,1000000-2*27*m);
  const empty=battle(s,[c],[],{spells:1000000},side);A.equal(empty.events.filter(e=>e.kind==='spell').length,0);A.equal(empty.steps,0);
 }
});

test('Mithril has one uncapped pre-attack beam and no opening team attack buff',()=>{
 for(const side of [0,1])for(const golden of [false,true]){
  const s=state(),m=golden?2:1,c=unit(s,'rune7',{golden}),ally=unit(s,'neutral0'),r=battle(s,[c,ally],[enemy(s,{attack:0})],{spells:90},side),frame=opening(r),shot=r.events.find(e=>e.text.includes('秘银轰击'));A.equal(frame.boards[side][0].attack,1);A.equal(frame.boards[side][1].attack,1);A(shot);A.equal(frame.boards[1-side][0].health-shot.boards[1-side][0].health,90*m);
 }
});

test('haven guardian keeps recovering shields after the second avenge trigger',()=>{
 const s=state(),c=unit(s,'haven2'),team=[c,...Array.from({length:6},()=>unit(s,'forest5',{health:1}))],r=E.combat(s,team,[enemy(s)]);A(r.events.filter(e=>e.text.includes('圣堂壁垒')).length>=4);A.equal(total(r,0,'attack'),0);
});

test('Jeanne grants adjacent inheriting vows and has no separate self last word',()=>{
 for(const golden of [false,true]){
  const s=state(),m=golden?2:1,dead=unit(s,'neutral0',{attack:41,health:21,keywords:['taunt']}),jeanne=unit(s,'haven6',{attack:0,golden}),r=E.combat(s,[dead,jeanne],[enemy(s)]),event=r.events.find(e=>e.text.includes('圣女遗愿'));A(event);const c=event.boards[0].find(c=>c.id==='haven6');A.equal(c.attack,20*m);A.equal(c.maxHealth,1000000+10*m);A(!c.keywords.includes('taunt'));
  const x=E.combat(s,[unit(s,'haven6',{health:1,keywords:['taunt'],golden}),unit(s,'neutral0',{attack:0})],[enemy(s)]);A(x.events.every(e=>e.boards[0].filter(c=>c.id==='neutral0').every(c=>c.maxHealth===1000000&&!c.keywords.includes('shield'))));
 }
});

test('Lapis transfers every other death with exact half/full bodies, without old opening buffs',()=>{
 for(const golden of [false,true]){
  const s=state(),m=golden?2:1,receiver=unit(s,'neutral0',{attack:1}),team=[unit(s,'haven7',{golden}),...Array.from({length:4},()=>unit(s,'neutral0',{attack:21,health:11,keywords:['taunt']})),receiver],r=E.combat(s,team,[enemy(s)]),events=r.events.filter(e=>e.text.includes('炽天使传承'));A.equal(events.length,4);A.equal(opening(r).boards[0][1].health,11);A(!opening(r).boards[0][1].keywords.includes('shield'));const last=events.at(-1).boards[0].find(c=>c.uid===receiver.uid);A.equal(last.attack,1+4*Math.floor(21*m/2));A.equal(last.maxHealth,1000000+4*Math.floor(11*m/2));A.equal(total(r,0,'attack'),0);
 }
});

test('Vampy inherits its body into bats; the queen has no extra summon aura',()=>{
 for(const side of [0,1])for(const golden of [false,true]){
  const s=state(),m=golden?2:1,c=unit(s,'blood2',{attack:40,health:60,golden,keywords:['taunt']}),r=battle(s,[c,unit(s,'blood6')],[enemy(s)],{bloodDamage:20},side),bats=summons(r,'bat',side);A.equal(bats.length,2);A(bats.every(({card})=>card.attack===2*m+20+10&&card.health===m+30+10));
 }
});

test('blood queen fires the full bat attack, including zero, and gold multiplies damage once',()=>{
 for(const side of [0,1])for(const golden of [false,true])for(const attack of [0,31]){
  const s=state(),m=golden?2:1,r=battle(s,[unit(s,'blood6',{attack:0,golden}),unit(s,'bat',{attack,health:1,keywords:['taunt']})],[enemy(s)],{},side),events=r.events.filter(e=>e.text.includes('血翼夜宴'));A.equal(events.length,1);A(events[0].text.includes(String(attack*m)+' 点伤害'));
 }
});

test('lifesteal has no six-heal cap and requires an unblocked damaging attack',()=>{
 for(const side of [0,1])for(const golden of [false,true]){
  const s=state(),m=golden?2:1,c=unit(s,'blood5',{golden}),r=battle(s,[c,unit(s,'neutral0',{attack:0})],[enemy(s,{attack:1,keywords:['shield']})],{bloodDamage:100},side);A(r.healing[side]>6*m);A.equal(r.healing[1-side],0);A.equal(opening(r).boards[side][0].attack,1);A(!opening(r).boards[side][0].keywords.includes('shield'));const first=r.events.find(e=>e.kind==='attack'&&e.from===opening(r).boards[side][0].battleId);A(!r.events.slice(0,r.events.indexOf(first)).some(e=>e.kind==='heal'));A.equal(s.hp,40);
 }
});

test('blood empress uses all self damage for one team buff and no longer has windfury',()=>{
 for(const golden of [false,true])for(const bloodDamage of [0,5,27]){
  const s=state(),m=golden?2:1,c=unit(s,'blood7',{golden}),ally=unit(s,'blood0'),r=E.combat(s,[c,ally],[enemy(s,{attack:1})],{bloodDamage}),frame=opening(r);A.equal(frame.boards[0][0].attack,c.attack+bloodDamage*m);A.equal(frame.boards[0][1].health,ally.health+bloodDamage*m);A(r.events.filter(e=>e.kind==='attack'&&e.from===frame.boards[0][0].battleId).every(e=>!e.text.includes('连击')));
 }
});

test('artifact reconstruction consumes the full current scrap value, including its own death',()=>{
 for(const side of [0,1])for(const golden of [false,true]){
  const s=state(),m=golden?2:1,c=unit(s,'artifact4',{health:1,golden}),r=battle(s,[c],[enemy(s)],{scrap:100},side),tokens=summons(r,'ancientArtifact',side);A.equal(tokens.length,2);A(tokens.every(({card})=>card.attack===104*m&&card.health===104*m));A.equal(r.scrap[side],103);A.equal(r.scrap[1-side],0);
 }
});

test('Spinaria grows original artifacts after more than six deaths without affecting original inputs',()=>{
 for(const golden of [false,true]){
  const s=state(),m=golden?2:1,spinner=unit(s,'artifact5',{golden}),team=[spinner,...Array.from({length:5},()=>unit(s,'artifact1',{health:1})),unit(s,'artifact0')],before=E.copy(team),r=E.combat(s,team,[enemy(s)]);A(r.deadCount[0]>6);A.equal(total(r,0,'attack'),r.deadCount[0]*3*m);A.equal(total(r,0,'health'),r.deadCount[0]*3*m);A(!r.permanent[0][spinner.uid]);A.deepEqual(team,before);
 }
});

test('artifact lord has only its full-scrap opening team buff and no summon aura',()=>{
 for(const golden of [false,true]){
  const s=state(),m=golden?2:1,lord=unit(s,'artifact7',{golden}),c=unit(s,'artifact4',{health:1,keywords:['taunt']}),r=E.combat(s,[lord,c],[enemy(s)],{scrap:100}),start=opening(r),token=summons(r,'ancientArtifact')[0].card;A.equal(start.boards[0][0].attack,lord.attack+100*m);A.equal(start.boards[0][1].health,1+100*m);A.equal(token.attack,104);A.equal(token.health,104);
 }
});

test('Bahamut breaks shields and gives four stats per real tribe, without four-tribe windfury',()=>{
 for(const golden of [false,true]){
  const s=state(),m=golden?2:1,bahamut=unit(s,'neutral5',{golden}),team=[bahamut,...['forest0','royal1','dragon0','night0'].map(id=>unit(s,id))],target=unit(s,'royal0',{keywords:['shield']}),r=E.combat(s,team,[target]),start=opening(r);A.equal(start.boards[0][0].attack,1+16*m);A(!start.boards[1][0].keywords.includes('shield'));A.deepEqual(r.permanent[1][target.uid],{attack:1,health:1});A(r.events.filter(e=>e.kind==='attack'&&e.from===start.boards[0][0].battleId).every(e=>!e.text.includes('连击')));
 }
});

test('fight applies permanent combat growth exactly once across replay and save continuation',()=>{
 const s=state(),c=E.make(s,'royal0',{attack:200,health:200});s.board=[c];act(s,'fight');A.equal(c.attack,201);A.equal(c.health,201);const json=JSON.stringify(s);A.equal(E.act(s,'fight').ok,false);A.equal(JSON.stringify(s),json);const loaded=JSON.parse(json);E.normalize(loaded);A(E.validate(loaded));act(loaded,'continue');A.equal(loaded.board[0].attack,201);A.equal(loaded.board[0].health,201);
});

test('mixed golden combat fuzz preserves determinism, original stats, board bounds, and save-size limits',()=>{
 let largest=0,longest=0;for(let seed=1;seed<=500;seed++){
  const s=state(seed),makeSide=()=>Array.from({length:7},()=>{const d=E.pick(s,D.cards),golden=E.rand(s)<.35,m=golden?2:1;return E.make(s,d.id,{golden,attack:d.attack*m+Math.floor(E.rand(s)*80),health:d.health*m+Math.floor(E.rand(s)*160)});}),left=makeSide(),right=makeSide(),before=E.copy([left,right]),meta={tier:6,grave:100,spells:100,played:15,bloodDamage:50,scrap:100,progress:{fairy:30,arms:30,prayers:30},trinkets:['moon','worldtree']},copy=E.copy(s),r=E.combat(s,left,right,meta,meta);
  if(seed<=20)A.deepEqual(r,E.combat(copy,left,right,meta,meta));A.deepEqual([left,right],before);A(r.steps<=160);A(r.events.length<=1000);largest=Math.max(largest,r.events.length);longest=Math.max(longest,r.steps);
  for(const e of r.events)for(const side of e.boards){A(side.length<=7);A.equal(new Set(side.map(c=>c.battleId)).size,side.length);for(const c of side){A(Number.isSafeInteger(c.attack)&&c.attack>=0);A(Number.isSafeInteger(c.health));A(Number.isSafeInteger(c.maxHealth)&&c.maxHealth>=1);}}
 }console.log('  500 combats: maximum '+largest+' replay frames, '+longest+' attack steps');
});

console.log('\n'+passed+' v5 combat groups passed; '+failures.length+' failed.');if(failures.length)process.exitCode=1;
