'use strict';
const A=require('node:assert/strict'),fs=require('node:fs'),E=require('./engine'),D=require('./data');let groups=0;
const test=(name,fn)=>{fn();groups++;console.log('PASS '+name);},state=()=>E.create('angel',725193,'normal',['night','forest','royal','haven']);
const play=(s,id,target)=>{const c=E.make(s,id);s.hand.push(c);const r=E.act(s,'play',{uid:c.uid,target});A(r.ok,r.message);return c;};
test('ten functional neutral spells have matching art, prices and common availability',()=>{
 A.equal(D.rulesVersion,'19.0');A.equal(D.spells.length,33);A.equal(D.functionalSpellIds.length,10);for(const id of D.functionalSpellIds){const d=D.byId[id];A.equal(d.type,'spell');A.equal(d.originalType,4);A.equal(d.originalClan,0);A.equal(d.name,d.sourceName);A(fs.existsSync(d.art));A(d.cost>=1);for(const tribes of [['forest','royal','rune','dragon'],['night','blood','artifact','haven']])A(E.available({...state(),activeTribes:tribes},d));}
});
test('stealing moves the actual offer, keeps all enhancements and pays no extra purchase cost',()=>{
 const s=state(),c=E.make(s,'royal0',{attack:80,health:90,shieldLayers:4}),spell=E.make(s,'pilfer'),other=E.make(s,'clock');s.shop=[c,spell,other];s.gold=2;s.frozen=true;s.progress.spellcraft=100;const before=E.copy(c);A(E.act(s,'buyPlay',{uid:spell.uid}).ok);A.equal(s.gold,0);A.deepEqual(s.hand,[before]);A.deepEqual(s.shop,[other]);A.equal(s.frozen,true);A.equal(s.spells,1);A.equal(s.played,1);A.equal(s.stats.triples,0);
});
test('steal selects only minions, adds no new UID, and can complete an ordinary triple',()=>{
 const s=state();s.board=[E.make(s,'royal0'),E.make(s,'royal0')];s.shop=[E.make(s,'royal0',{attack:20,health:30}),E.make(s,'bell')];const oldUid=s.uid;play(s,'pilfer');A.equal(s.uid,oldUid+2);A(s.board[0].golden);A.equal(s.board.length,1);A.equal(s.discover.length,1);A.equal(s.discover[0].source,undefined);A.equal(s.stats.triples,0);A(E.act(s,'choose',{id:s.discover[0].options[0]}).ok);A.equal(s.stats.triples,1);
});
test('empty-shop play and buy-and-play fail atomically without consuming gold, cards or RNG',()=>{
 for(const direct of [false,true]){const s=state(),spell=E.make(s,'pilfer');s.shop=[E.make(s,'bell')];if(direct)s.shop.push(spell);else s.hand.push(spell);s.gold=5;const before=E.copy(s);A(!E.act(s,direct?'buyPlay':'play',{uid:spell.uid}).ok);A.deepEqual(s,before);}
});
test('a full hand can cast steal by freeing its own slot, but cannot buy an eleventh card',()=>{
 const s=state();s.hand=Array.from({length:9},()=>E.make(s,'clock'));const c=E.make(s,'pilfer');s.hand.push(c);s.shop=[E.make(s,'night0')];A(E.act(s,'play',{uid:c.uid}).ok);A.equal(s.hand.length,10);A(s.hand.some(c=>c.id==='night0'));s.shop=[E.make(s,'pilfer'),E.make(s,'night0')];const before=E.copy(s);A(!E.act(s,'buyPlay',{uid:s.shop[0].uid}).ok);A.deepEqual(s,before);
});
test('all discover pools honor real abilities, current tier, active tribes and non-token status',()=>{
 for(const tribes of [['forest','royal','rune','dragon'],['night','blood','artifact','haven']])for(const tier of [1,3,6])for(const id of ['seekCry','seekLast','seekEnd','seekAmulet']){const s=state();s.activeTribes=tribes;s.tier=tier;const d=D.byId[id],pool=D.discoveryPool(s,d);for(const c of pool){A(E.available(s,c));A(c.tier<=tier);A(!c.token);A(d.discoverKind==='amulet'?c.type==='amulet':D.abilityIds[d.discoverKind].includes(c.id));}if(!pool.length)continue;play(s,id);const q=s.discover[0];A(q.options.length>0&&q.options.length<=3);A.equal(new Set(q.options).size,q.options.length);A(q.options.every(id=>pool.some(c=>c.id===id)));A.equal(q.source,'spell');A.equal(q.spell,id);A.equal(s.stats.triples,0);}
 A(D.abilityIds.lastWords.includes('night5'));A(D.abilityIds.lastWords.includes('night13'));A(!D.abilityIds.lastWords.includes('night12'));A(D.abilityIds.endRecruit.includes('night9'));A(!D.abilityIds.endRecruit.includes('night17'));A(D.abilityIds.fanfare.includes('neutral8'));
});
test('no-match discovery is atomic, and small pools never duplicate choices',()=>{
 const s=state();s.activeTribes=['night','forest','artifact','haven'];s.tier=1;const c=E.make(s,'seekEnd');s.hand=[c];A.equal(D.discoveryPool(s,D.byId.seekEnd).length,0);const before=E.copy(s);A(!E.act(s,'play',{uid:c.uid}).ok);A.deepEqual(s,before);
 s.tier=1;play(s,'seekLast');A.equal(s.discover[0].options.length,Math.min(3,D.discoveryPool(s,D.byId.seekLast).length));
});
test('discovery uses the tier when cast, awards one base card and does not grant tavern growth',()=>{
 const s=state();s.tier=6;s.progress.tavernAttack=100;s.progress.tavernHealth=200;s.progress.spellcraft=500;play(s,'seekCry');const q=s.discover[0],id=q.options[0];A(E.act(s,'choose',{id}).ok);const c=s.hand[0];A.equal(c.attack,D.byId[id].attack);A.equal(c.health,D.byId[id].health);A.equal(s.hand.length,1);A.equal(s.stats.triples,0);A.equal(s.spells,1);A.equal(s.played,1);A.equal(s.discover.length,0);
});
test('a discovered third copy causes exactly one genuine triple reward, not two',()=>{
 const s=state();s.tier=3;play(s,'seekCry');const id=s.discover[0].options[0];s.board=[E.make(s,id),E.make(s,id)];A(E.act(s,'choose',{id}).ok);A(s.board[0].golden);A.equal(s.discover.length,1);A.equal(s.stats.triples,0);A(E.act(s,'choose',{id:s.discover[0].options[0]}).ok);A.equal(s.stats.triples,1);
});
test('amulet discovery can be saved pending, chosen with full slots, then placed normally',()=>{
 const s=state();s.tier=4;s.amulets=['bell','garden'].map(id=>({...E.make(s,id),count:1}));play(s,'seekAmulet');A.equal(s.discover[0].type,'amulet');A(E.validate(s));const saved=JSON.parse(JSON.stringify(s));E.normalize(saved);A(E.validate(saved));const id=saved.discover[0].options[0];A(E.act(saved,'choose',{id}).ok);A.equal(saved.stats.triples,0);const c=saved.hand[0];A.equal(c.id,id);A(!E.act(saved,'play',{uid:c.uid}).ok);A(E.act(saved,'removeAmulet',{uid:saved.amulets[0].uid}).ok);A(E.act(saved,'play',{uid:c.uid}).ok);A.equal(saved.amulets.at(-1).count,D.byId[id].count);
});
test('pending discovery supports discard when spell responses refill the hand',()=>{
 for(const id of ['seekCry','seekAmulet']){const s=state();s.tier=4;play(s,id);s.hand=Array.from({length:10},()=>E.make(s,'clock'));const option=s.discover[0].options[0],before=E.copy(s);A(!E.act(s,'choose',{id:option}).ok);A.deepEqual(s,before);A(E.act(s,'discard',{uid:s.hand[0].uid}).ok);A(E.act(s,'choose',{id:option}).ok);A.equal(s.hand.length,10);A.equal(s.stats.triples,0);A(E.validate(s));}
});
test('functional spells trigger ordinary spell responses once without research multiplying resources',()=>{
 const s=state();s.tier=4;s.progress.spellcraft=100;s.board=[E.make(s,'rune0')];const a=s.board[0].attack;play(s,'seekAmulet');A.equal(s.spells,1);A.equal(s.played,1);A.equal(s.stats.spells,1);A.equal(s.board[0].attack,a+D.tuning.starterSpell);A.equal(s.discover.length,1);A.equal(s.discover[0].options.length,3);A.equal(E.scaling.spellView(s,D.byId.seekAmulet).short,'发现护符 · ≤4★');
});
test('rest strengthens a minion with spell research, without healing the hero',()=>{
 for(const hp of [10,38,40]){const s=state();s.hp=hp;s.armor=3;s.progress.spellcraft=100;s.board=[E.make(s,'haven4')];const c=s.board[0],h=c.health,a=c.attack;play(s,'rest',c.uid);A.equal(s.hp,hp);A.equal(s.armor,3);A.equal(s.spells,1);A.equal(c.health,h+105);A.equal(c.attack,a);A.equal(E.scaling.spellView(s,D.byId.rest).short,'+105 生命');}
});
test('spell previews and pending reward validation reflect current functional semantics',()=>{
 const s=state();s.tier=5;A(E.scaling.spellView(s,D.byId.seekEnd).text.includes('最高 5 星'));A(E.scaling.spellView(s,D.byId.pilfer).short.includes('×1'));play(s,'seekAmulet');A(E.validate(s));s.discover[0].options=['forest0'];A(!E.validate(s));s.discover[0].options=['bell'];s.discover[0].spell='growth';A(!E.validate(s));
});
console.log(groups+' focused functional spell groups passed; no AI games or random battle simulations.');
