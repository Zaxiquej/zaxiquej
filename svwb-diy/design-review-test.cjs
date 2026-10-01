const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine'),check=require('./assert-node-effects.cjs');
const a=(ids,extra={})=>({ids,trigger:'入场曲',condition:'none',raw:8,price:8,...extra});
assert(S.focusWeight([a(['tokenSummon'])],a(['teamBuff']))>S.focusWeight([a(['tokenSummon'])],a(['heal'])));
assert(S.focusWeight([a(['tokenSummon']),a(['damage'])],a(['heal']))<1);
assert.equal(S.focusWeight([a(['tokenSummon'])],a(['draw'])),1);
const disconnected={abilities:[a(['tokenSummon']),a(['damage']),a(['face']),a(['heal'])]};
assert(!S.focusedDesignQuality(disconnected));
assert(S.focusedDesignQuality({abilities:[a(['tokenSummon']),a(['damage']),a(['face','heal'],{mode:true,modeBranches:[a(['face']),a(['heal'])]})]}),'Mode alternatives are not mandatory unrelated payoffs');
const diff=require('./balance-changes-517.json');
assert.equal(diff.changes.find(c=>c.id===10633310).diff.cost.after,4);
assert.equal(diff.changes.find(c=>c.id===10423110).diff.cost.after,6);
assert(diff.changes.find(c=>c.id===10972310).diff.text.after.includes('毁灭'));
const counts={high:0,aoe:0,aoeOnly:0,unfocused:0,roles:{},anchors:{},keywordsOnly:0,advancedCores:0},examples=[];
for(let i=0;i<8000;i++){
 const opts={chaos:i%4===0},c=S.generate('设计审阅517-'+i,opts);check(c);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.025,c.name+' budget');
 assert.equal(c.abilities.length<=5,true,c.name+' ability count');
 if(!S.focusedDesignQuality(c))counts.unfocused++;
 if(i<150)assert.deepEqual(c,S.generate(c.name,opts));
 const meaningful=c.abilities.filter(a=>a.kind!=='keyword'&&a.kind!=='alternate');
 if(i<4000){
   if(!meaningful.length)counts.keywordsOnly++;
   if(c.type==='follower'&&c.cost>=7){
     counts.high++;const ids=meaningful.flatMap(a=>a.ids);
     if(ids.includes('aoe'))counts.aoe++;
     if(ids.includes('aoe')&&ids.every(id=>['aoe','coreAnchor','coreSupport','highCostFloor'].includes(id)))counts.aoeOnly++;
     for(const role of new Set(meaningful.flatMap(S.designRoles)))counts.roles[role]=(counts.roles[role]||0)+1;
     for(const node of c.abilities.filter(a=>a.ids.includes('coreAnchor')))for(const id of node.ids.filter(id=>!['coreAnchor','highCostFloor'].includes(id)))counts.anchors[id]=(counts.anchors[id]||0)+1;
   }
 }
 for(const node of c.abilities){
   if(node.ids.includes('coreAnchor')&&node.ids.some(id=>['splitDamage','massDebuff','teamEvolve','artifactCopy','selfCopy','amuletRecruit','amuletRevive','experimentSummon','crystalHandSummon'].includes(id))){
     counts.advancedCores++;
     if(examples.length<12)examples.push({name:c.name,chaos:!!opts.chaos,cost:c.cost,class:c.class,body:[c.attack,c.health],text:c.abilities.map(a=>a.text)});
   }
   const grants=node.summonGrants;
   if(grants?.grants.some(g=>g.id==='summonStorm')){
     const value=grants.grants.find(g=>g.id==='summonStorm').raw;
     const old=grants.count*(S.keywordPrice('疾驰',grants.attack,grants.health,{attacks:grants.attacks})+grants.attack*grants.attacks*.75);
     assert(value>old,'Buffed/multiple summoned Storm pays combined pressure');
   }
 }
}
const before=require('./design-before-517.json');
assert(counts.high>300&&counts.advancedCores>15);
assert(counts.aoe/counts.high<before.counts.aoe/before.counts.high,'High-cost AoE dominance should decrease');
assert(counts.aoeOnly/counts.high<before.counts.aoeOnly/before.counts.high,'Fewer plain bodies plus AoE');
assert(counts.unfocused<8);
fs.writeFileSync(__dirname+'/design-validation-517.json',JSON.stringify({version:S.VERSION,samples:8000,comparisonSamples:4000,counts,before:before.counts,examples},null,2));
console.log({version:S.VERSION,counts,before:before.counts});
