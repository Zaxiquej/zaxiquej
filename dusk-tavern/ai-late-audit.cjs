'use strict';
// Two deterministic recruitment turns; no combat or full AI games.
const E=require('./engine'),AI=require('./ai'),D=require('./data'),fs=require('node:fs'),path=require('node:path');
const results=[];
for(const grown of [false,true]){
 const s=E.create('forest',9182,'hard',['forest','royal','rune','haven']);s.round=14;const o=s.opponents[0];
 Object.assign(o,{hero:'forest',tribe:'forest',route:0,buildId:'forest-combo',tier:6,hp:40,armor:0,gold:0,hand:[],shop:[],amulets:[],board:['forest4','forest18','forest1','forest2','forest15','forest23'].map(id=>E.make(s,id,{attack:100,health:100})),powerUsed:true,progress:E.scaling.read(),stats:{triples:0,spells:0,discards:0}});
 o.hand=[E.make(s,'forest12',grown?{attack:100,health:100}:{}),E.make(s,'forest20')];
 const before={board:o.board.map(c=>({id:c.id,attack:c.attack,health:c.health})),hand:o.hand.map(c=>({id:c.id,attack:c.attack,health:c.health})),cycleValue:AI.canCycle(o,o.hand[0])};
 AI.prepare(s,o,E,{started:true,bonusGold:false,shopLuck:false,deferEnd:true});
 results.push({case:grown?'grown_fuel':'base_fuel',before,played:o.aiSummary.played,actions:o.aiSummary.actions,phase:o.aiSummary.buildPhase,remainingHand:o.hand.map(c=>({id:c.id,name:D.byId[c.id].name})),summary:o.aiSummary});
}
fs.writeFileSync(path.join(__dirname,'qa/ai-late-audit.json'),JSON.stringify({version:D.rulesVersion,scope:'Two fixed recruitment turns; all cores present; only initial forest12 body differs. No full matches.',results},null,2));
console.log(JSON.stringify(results.map(({case:label,played,actions,phase,remainingHand})=>({case:label,played,actions,phase,remainingHand})),null,2));
