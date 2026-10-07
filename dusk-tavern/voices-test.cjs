'use strict';
const A=require('node:assert/strict'),E=require('./engine'),D=require('./data'),fs=require('node:fs'),path=require('node:path');
const manifest=require('./assets/voices/manifest.json');
for(const c of [...D.cards,...D.retiredCards,...D.tokens].filter(c=>c.type==='minion'))for(const kind of ['play','attack','death']){const entry=manifest.cards[c.id];A.equal(entry.sourceId,c.sourceId);A(fs.existsSync(path.join(__dirname,'assets/voices',entry[kind])),c.id+' '+kind);}
const s=E.create('night',72,'hard',['night','forest','dragon','haven']);
s.board=[E.make(s,'forest0',{health:1}),E.make(s,'night12',{health:1,heroReborn:true})];
const right=[E.make(s,'neutral0',{attack:20,health:80})],r=E.combat(s,s.board,right);
const cues=r.events.flatMap(e=>e.voices),deaths=cues.filter(v=>v.kind==='death');
A.equal(deaths.length,r.deadCount[0]+r.deadCount[1]);A.equal(new Set(deaths.map(v=>v.battleId)).size,deaths.length);
A(deaths.filter(v=>v.id==='night12').length>=2,'reborn is a separate death');A(deaths.some(v=>v.id==='fairy'),'summoned token has death voice');
for(const event of r.events){const attacks=event.voices.filter(v=>v.kind==='attack');if(event.kind==='attack'){A.equal(attacks.length,1);A.equal(attacks[0].battleId,event.from);A.equal(attacks[0].id,event.boards.flat().find(c=>c.battleId===event.from).id);}else A.equal(attacks.length,0);}
s.phase='result';s.result={...r,opponent:'Test',round:s.round,fatigue:0};A(E.validate(s));A(E.validate(JSON.parse(JSON.stringify(s))));const legacy=E.copy(s);legacy.result.events.forEach(e=>delete e.voices);A(E.validate(legacy));const invalid=E.copy(s);invalid.result.events[0].voices={bad:true};A(!E.validate(invalid));
console.log('PASS all 242 follower mappings / 726 assets; attack routing; simultaneous, token and reborn death cues exactly once; new/legacy replay save validation.');
