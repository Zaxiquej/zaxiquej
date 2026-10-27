const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const S=require('./engine'),P=S.PREVIEW,search=require('./inspector-search');
assert.deepEqual(P.projections(1,6,1),[{attack:1,health:6},{attack:7,health:1},{attack:2,health:7},{attack:8,health:2}]);
assert(P.effects.find(e=>e.id==='evidenceHand').price<P.effects.find(e=>e.id==='evidenceSummon').price);
assert.equal(P.affinity([{ids:['evidenceSwap']}],['evidenceSummon']),3);
assert.equal(P.affinity([{ids:['experimentSummon']}],['evidenceSummon']),1);
assert(!P.quality({attack:0,abilities:[{evidenceSwap:{gain:1}}]}));
const growth=S.scalingPlan(6,'follower','evidenceActivate','growth',1.5);
const projected=S.scalingStormValue({cost:6,attack:1,health:6,abilities:[{ids:['evidenceSwap'],price:3.5,scaling:growth,evidenceSwap:{gain:1}}]});
assert(projected.value>=S.stormCardValue(8,2,[]).value,'Swap must value high-health-to-high-attack Storm exposure');
const g={id:'evidenceReserve',factor:.8,extra:0};
assert(S.conditionTerms(g,{cost:3,trigger:'入场曲',abilities:[{condition:'evidenceReserve'}]}).factor>.8);
const consumed=S.conditionTerms({id:'evidenceConsume',amount:2},{cost:3,trigger:'入场曲',abilities:[]});
assert.equal(consumed.factor,1);assert.equal(consumed.extra,2.8);
assert.equal(projected.projectedAttack,8);
assert(search.suggestions(S).some(g=>g.items.some(i=>i.term==='『'+P.evidence.name+'』')));
const counts={},showcases={},stats={cards:4500,synergy:0,evidencePayments:0,banishRewards:{},normalEvidence:0,chaosEvidence:0};
for(let i=0;i<stats.cards;i++){
 const c=S.generate('预览抽样'+i,{chaos:i>=4000}),ids=c.abilities.flatMap(a=>a.ids);
 require('./assert-node-effects.cjs')(c);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.025,c.name+' budget');
 assert(S.boardCapacity(c).valid,c.name+' capacity');
 assert(P.quality(c),c.name+' unusable swap');
 if(i%500===0)assert.deepEqual(c,S.generate(c.name,{chaos:i>=4000}));
 if(ids.some(id=>/^evidence/.test(id)))stats[i>=4000?'chaosEvidence':'normalEvidence']++;
 if(ids.some(id=>['evidenceSwap','evidenceLink'].includes(id))&&ids.some(id=>['evidenceHand','evidenceSummon'].includes(id)))stats.synergy++;
 for(const a of c.abilities){
  if(a.condition==='evidenceConsume'){stats.evidencePayments++;assert.match(a.text,/证据-\d/);}
  for(const id of a.ids.filter(id=>/^evidence|banishedFromBoard/.test(id))){
   counts[id]=(counts[id]||0)+1;
   showcases[id]??={name:c.name,class:c.class,rarity:c.rarity,cost:c.cost,type:c.type,body:[c.attack,c.health],text:c.abilities.map(a=>a.text)};
  }
  if(a.evidenceSwap){assert.equal(c.class,2);assert(a.scaling?.growth>0);assert.equal(a.evidenceSwap.gain,1);}
  if(a.ids.includes('evidenceLink')){assert.equal(c.class,2);assert(!a.text.includes('选择'));}
  if(a.ids.includes('banishedFromBoard')){
   assert.equal(a.trigger,'本卡牌在战场上消失时');assert(!a.text.includes('选择'));
   assert(c.archetype==='evidenceAmulet');
   for(const id of a.ids.filter(id=>id!=='banishedFromBoard'))stats.banishRewards[id]=(stats.banishRewards[id]||0)+1;
  }
  if(a.ids.includes('evidenceSpend')){
   assert.equal(a.activation.fee,1);assert.equal(a.activation.evidenceAmount,1);assert(!a.activation.breaksSelf);
   assert(!a.text.includes('破坏'));assert.match(a.text,/证据-1/);
  }
  if(a.ids.some(id=>['evidenceHand','evidenceSummon'].includes(id))){
   assert(c.tokens.some(t=>t.id===P.evidence.id));
   assert(a.tokens.some(t=>t.id===90001210&&!t.preview&&!t.provisionalTranslation));
  }
 }
 if(c.archetype==='evidenceAmulet'){assert.equal(c.countdown,null);assert(S.amuletQuality(c));assert(c.effectLimit);}
}
for(const id of ['evidenceHand','evidenceSummon','evidenceSwap','evidenceLink','evidenceCarrier','evidenceSpend','banishedFromBoard'])assert(counts[id]>0,id+' unreachable');
assert(stats.synergy>0,'Evidence enablers and payoffs must be able to coexist');
assert(Object.keys(stats.banishRewards).length>=3,'Banish payoff must not always copy the official heal');
// Exercise the browser module order and actual worker imports without relying
// on Node require to silently provide a missing browser dependency.
const sandbox={console,structuredClone};sandbox.globalThis=sandbox;
vm.createContext(sandbox);
const html=fs.readFileSync(path.join(__dirname,'../svwb_diy.html'),'utf8');
for(const [,file]of html.matchAll(/<script defer src="svwb-diy\/([^"?]+)(?:\?[^"]*)?"/g)){
 if(['app.js','inspector.js','inspector-search.js'].includes(file))continue;
 vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),sandbox,{filename:file});
}
assert.equal(sandbox.SVWB.VERSION,S.VERSION);
for(const sample of Object.values(showcases))assert.equal(JSON.stringify(sandbox.SVWB.generate(sample.name)),JSON.stringify(S.generate(sample.name)));
const worker={console,structuredClone,postMessage(){}};worker.self=worker;worker.globalThis=worker;vm.createContext(worker);
worker.importScripts=(...urls)=>{for(const url of urls)vm.runInContext(fs.readFileSync(path.join(__dirname,url.split('?')[0]),'utf8'),worker);};
vm.runInContext(fs.readFileSync(path.join(__dirname,'inspector-worker.js'),'utf8'),worker);
assert.equal(worker.SVWB.VERSION,S.VERSION);assert(worker.SVWB.PREVIEW);
fs.writeFileSync(path.join(__dirname,'preview-mechanics-validation.json'),JSON.stringify({version:S.VERSION,stats,counts,showcases},null,2));
console.log({version:S.VERSION,stats,counts,browserAndWorkerParity:true});
