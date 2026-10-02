const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),S=require('./engine'),C=require('./combinations');
const node=(trigger,ids,extra={})=>({trigger,ids,text:'',...extra});
const fairy=S.TOKENS.find(t=>t.name==='妖精'),artifact=S.TOKENS.find(t=>t.name==='古老的创造物');
const hand=node('入场曲',['tokenHand'],{text:'将1张『妖精』加入手牌。',tokens:[fairy]});
const army=node('入场曲',['tokenSummon'],{text:'召唤1个『妖精』。',tokens:[fairy]});
const combo=node('进化时',['damage'],{condition:'combo'});
assert(C.links(hand,combo).includes('cheapCardsCombo'));
assert(!C.links(army,combo).length,'Summoning is not playing a card');
assert(!C.links({...hand,trigger:'超进化时'},combo).length,'A later source does not fund an earlier condition');
assert(!C.links({...hand,text:'',ids:['crystalHandBuff']},combo).length,'A related token definition is not production');
assert(!C.links({...hand,kind:'mode'},combo).length);
assert(!C.links({...hand,modeBranches:[hand]},combo).length);
const pairs=[
 ['healingEngine',node('入场曲',['heal']),node('自己的主战者回复生命值时',['destroy'])],
 ['damageSurvival',node('进化时',['allBoardDamage']),node('本随从受到伤害且没被破坏时',['face'])],
 ['earthReserve',node('入场曲',['earth']),node('进化时',['draw'],{condition:'earth'})],
 ['graveReserve',node('入场曲',['grave']),node('超进化时',['reanimate'],{condition:'necromancy'})],
 ['armyThenBuff',army,node('进化时',['teamBuff'])],
 ['spellSupplyBoost',node('入场曲',['treasureSupply'],{text:'将1张卡牌加入手牌。',tokens:[{type:'spell',cost:1}]}),node('魔力增幅时',['spellboostDiscount'])],
 ['handArtifactDeploy',{...hand,tokens:[artifact]},node('进化时',['artifactCopy'])],
 ['matchingEntryEngine',{...army,tokens:[artifact]},node('自己的创造物·随从进入战场时',['destroy'])],
 ['returnCombo',node('入场曲',['bounce']),combo]
];
for(const [id,a,b]of pairs){assert(C.links(a,b).includes(id),id);assert.deepEqual(C.links(a,b),C.links(b,a));assert(S.interactionWeight([a],b)>1);}
assert(!C.links(army,node('自己的创造物·随从进入战场时',['destroy'])).length,'Wrong token tribe cannot feed the engine');
const html=fs.readFileSync(path.join(__dirname,'../svwb_diy.html'),'utf8');
assert(!/illusion|designer-tabs|tabpanel|standard-tab/.test(html),'Retired mode is not loaded or exposed');
assert(html.indexOf('combinations.js')<html.indexOf('engine.js'));
// Exercise classic-worker imports in an isolated JS realm, without browser automation.
const sandbox={self:{},setTimeout,clearTimeout,performance};vm.createContext(sandbox);
sandbox.importScripts=(...files)=>files.forEach(file=>vm.runInContext(fs.readFileSync(path.join(__dirname,file.split('?')[0]),'utf8'),sandbox));
vm.runInContext(fs.readFileSync(path.join(__dirname,'inspector-worker.js'),'utf8'),sandbox);
assert.equal(sandbox.SVWB.VERSION,S.VERSION);assert.equal(sandbox.SVWB.generate('设计师您辛苦了').name,'设计师您辛苦了');
for(let i=0;i<1200;i++){
 const options={chaos:i%3===0},c=S.generate('组合语义回归'+i,options);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name);
 assert(c.abilities.length<=5);require('./assert-node-effects.cjs')(c);
 if(i%150===0)assert.deepEqual(c,S.generate(c.name,options));
}
console.log('PASS: ten semantic links, negative/ordered/modal cases, 1,200 budget and determinism checks, retired UI and worker imports.');
