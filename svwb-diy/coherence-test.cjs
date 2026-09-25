const assert=require('node:assert/strict'),S=require('./engine');
const tags=a=>S.strategyTags({abilities:[a]});
assert.deepEqual(tags({trigger:'自己的『天晶魔手』进入战场时',ids:['damage']}),['crystalHands']);
assert.deepEqual(tags({engineSpec:{eventId:'experiment'},ids:['amuletEngine']}),['amulet','experiment']);
assert.deepEqual(tags({progression:{eventId:'spellboost'},ids:['progressTransform']}),['spellboost']);
assert.deepEqual(tags({ids:['fusionEvent:experimentSummon']}),['experiment']);
assert(S.strategyAffinity(['experiment'],['experiment','crystalHands'])<.05,'Sharing one tag must not hide an unrelated second engine');
assert(S.strategyAffinity(['crystalHands'],['experiment'])<.05);
assert(S.strategyAffinity(['experiment'],['earth'])>0,'Cross-engine cards remain possible');
assert(S.strategyAffinity(['earth'],['spellboost'])>1,'Compatible mechanics remain connected');
assert.equal(S.strategyAffinity(['experiment'],[]),1,'Draw/removal utility has no unrelated deck requirement');
const check=require('./assert-node-effects.cjs');
for(let i=0;i<4000;i++){
 const opts={chaos:i%2===0},c=S.generate('体系节点503-'+i,opts);
 check(c);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 for(const a of c.abilities)if(a.trigger==='本卡牌被舍弃时'&&!a.ids.some(id=>['discardSelfSummon','discardReturn'].includes(id)))assert(a.raw<=3.5);
 if(i<100)assert.deepEqual(c,S.generate(c.name,opts),'Pending context must not leak between cards');
}
console.log('Coherence metadata, budgets, target rules and deterministic replay: 4000 passed.');
