const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const atom=(trigger,...ids)=>({trigger,ids});
const setup=atom('入场曲','setHealth'),hit=atom('进化时','damage'),sweep=atom('超进化时','aoe');
for(const payoff of [hit,sweep]){
 assert(S.interactionWeight([setup],payoff)>1);
 assert.equal(S.interactionWeight([setup],payoff),S.interactionWeight([payoff],setup));
}
assert.equal(S.interactionWeight([atom('进化时','setHealth')],atom('入场曲','damage')),1);
assert.equal(S.interactionWeight([setup],atom('进化时','face')),1);
assert.equal(S.interactionWeight([{...setup,kind:'mode'}],hit),1);
const activationCard=S.generate('随机卡牌#17363269');
assert(activationCard.abilities.some(a=>a.ids.includes('activeAmuletSearch')));
assert(activationCard.abilities.some(a=>a.trigger.includes('自己【启动】护符')));
assert(activationCard.attack+activationCard.health+activationCard.spent<=activationCard.budget+.02);
const engine=atom('自己【启动】护符时','heal');
for(const id of ['activeAmuletRecruit','activeAmuletSearch']){
 const supply=atom('进化时',id);
 assert(S.interactionWeight([engine],supply)>1);
 assert.equal(S.interactionWeight([engine],supply),S.interactionWeight([supply],engine));
 assert.equal(S.interactionWeight([atom('自己的护符被破坏时','heal')],supply),1);
}
const baseline=require('./interaction-baseline.json');
const stats={pairs:0,setHealth:0,weakEvo:0,aura:0,body02:0,body03:0,activationSupply:0,activationPair:0},examples={};
for(let i=0;i<24000;i++){
 const c=S.generate('能力呼应'+i),a=c.abilities;
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 assert(a.length<=5);require('./assert-node-effects.cjs')(c);
 if(a.some(x=>x.ids.some(id=>['activeAmuletSearch','activeAmuletRecruit'].includes(id)))){
  stats.activationSupply++;assert.equal(c.class,6);examples.activationSupply??=c.name;
  if(a.some(x=>x.trigger?.includes('自己【启动】护符'))){stats.activationPair++;examples.activationPair??=c.name;}
 }
 if(c.type!=='follower')continue;
 if(i<baseline.samples){
  if(a.some(x=>x.ids.includes('setHealth'))){
   stats.setHealth++;
   if(a.some(x=>x.trigger==='入场曲'&&x.kind!=='mode'&&x.ids.includes('setHealth'))&&a.some(x=>['进化时','超进化时'].includes(x.trigger)&&x.kind!=='mode'&&x.ids.some(id=>['damage','aoe'].includes(id)))){stats.pairs++;examples.pair??=c.name;}
  }
  if(c.cost===2&&c.attack===1&&c.health===1&&a.some(x=>['进化时','超进化时'].includes(x.trigger))&&a.every(x=>['进化时','超进化时'].includes(x.trigger)||x.kind==='keyword'&&x.ids.every(id=>id==='突进')))stats.weakEvo++;
 }
 if(c.supportBody){
  assert.equal(c.cost,1);assert.equal(c.attack,0);assert([2,3].includes(c.health));
  assert.equal(c.zeroAttackTrade.reason,'supportEngine');stats.aura++;stats['body0'+c.health]++;examples['body0'+c.health]??=c.name;
 }
 if(i%100===0)assert.deepEqual(c,S.generate(c.name));
}
assert(stats.weakEvo<baseline.stats.weakEvo*.5,'Reduce weak evolution-only bodies');
assert(stats.activationSupply>0);assert(stats.body02>0);assert(stats.body03>0);
const report={version:S.VERSION,samples:24000,comparisonSamples:baseline.samples,before:baseline.stats,stats,examples};
fs.writeFileSync(__dirname+'/interaction-validation.json',JSON.stringify(report,null,2)+'\n');console.log(report);
