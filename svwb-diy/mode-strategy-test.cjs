const assert=require('node:assert/strict'),S=require('./engine');
const mode=(a,b,extra={})=>({kind:'mode',ids:[...a.ids,...b.ids],tokens:[...(a.tokens||[]),...(b.tokens||[])],modeBranches:[a,b],...extra});
const tags=a=>S.strategyTags({abilities:[a]});
const experiment={ids:['experimentSummon']},hands={ids:['crystalHandSupply']};
assert.deepEqual(tags(mode(experiment,hands)),[],'Choices do not require both token engines');
assert.deepEqual(tags(mode(experiment,{ids:['experimentBuff']})),['experiment']);
assert.deepEqual(tags(mode(experiment,hands,{condition:'earth'})),['earth'],'A shared paid condition still matters');
assert.deepEqual(tags({ids:['experimentSummon','crystalHandSupply']}),['crystalHands','experiment'],'Mandatory combined effects still have both strategies');
assert(S.strategyAffinity(['experiment'],tags(hands))<.05,'Non-modal mismatch suppression remains active');
const example=S.generate('随机卡牌#94855805');
assert.equal(example.cost,1);
// Official-prior updates may change a named card between engine versions.
// Preserve the optional-versus-mandatory rule, not one version's random roll.
assert.deepEqual(tags(mode({ids:['boost']},hands)),[],'Spellboost or hand-token supply is flexible utility');
assert.deepEqual(example,S.generate('随机卡牌#94855805'));
let modes=0,cross=0;const check=require('./assert-node-effects.cjs');
for(let i=0;i<6000;i++){
 const opts={chaos:i%3===0},c=S.generate('模式润滑504-'+i,opts);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');check(c);
 for(const a of c.abilities.filter(a=>a.modeBranches)){
  modes++;assert.equal(a.modeBranches.length,2);
  const [x,y]=a.modeBranches;
  const premium=c.type==='follower'?.65:.55;
  assert(Math.abs(a.raw-Math.max(x.raw,y.raw)-premium)<1e-8,c.name+' flexibility price');
  const tx=tags(x),ty=tags(y);
  if(tx.length&&ty.length&&S.strategyAffinity(tx,ty)<1)cross++;
 }
 if(i<100)assert.deepEqual(c,S.generate(c.name,opts),'Choice context must be restored after generation');
}
assert(modes>30);assert(cross>0,'Distinct optional strategies remain reachable');
console.log({version:S.VERSION,samples:6000,modes,cross,example:example.abilities[0].text});
