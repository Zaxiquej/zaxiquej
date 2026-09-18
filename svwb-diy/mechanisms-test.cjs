const assert=require('node:assert/strict');
const {generate,TOKENS}=require('./engine.js');
const audit=require('./mechanisms-audit.json');
const classes={wardSearch:6,wardBuff:6,amuletSearch:6,amuletRecruit:6,amuletRevive:6,amuletBreak:6,artifactCopy:7,artifactBuff:7,bloodDraw:5,missingHealthDamage:5,spellboostGrowth:3,spellboostDiscount:3,wardLink:6,amuletLink:6,artifactLink:7,rallyLink:2,ramp:4};
const gates={rally:[2],lowHealth:[4,5],singleton:[0,7],wardBoard:[6],amuletHistory:[6],artifactKinds:[7],ppFull:[4]};
const seen={},examples={},earth=new Set(),artifacts=new Set();
for(const [id,entry]of Object.entries(audit.mechanisms))assert(entry.cards.length>0,'Missing official evidence: '+id);
// Rare expensive artifact rewards need a larger sample after adding more card types.
for(let i=0;i<60000;i++){
 const c=generate('体系验证'+i);if(c.type!=='follower')continue;
 for(const a of c.abilities){
  for(const id of a.ids){
   if(Object.hasOwn(classes,id)){assert.equal(c.class,classes[id],id);seen[id]=(seen[id]||0)+1;examples[id]||=c.name;}
   if(id==='artifactCopy'){
    assert(a.text.includes('复制随从')&&a.text.includes('费用为5或以下'));
    assert(!a.text.includes('舍弃')&&!a.text.includes('移出手牌'));
    assert((a.enhanceCost||c.cost)>=4||['进化时','超进化时'].includes(a.trigger)||a.condition==='singleton');
   }
   if(id==='missingHealthDamage')assert(/已损失的生命值（上限\d+）/.test(a.text));
   if(id==='spellboostDiscount')assert(c.cost>=5&&c.attack+c.health<=10);
   if(id==='artifact'){
    const supplied=a.tokens.filter(t=>t.name.includes('创造物')&&a.text.includes(`『${t.name}』加入手牌`));
    assert(supplied.length>0);supplied.forEach(t=>artifacts.add(t.id));
   }
  }
  if(Object.hasOwn(gates,a.condition)){assert(gates[a.condition].includes(c.class));seen[a.condition]=(seen[a.condition]||0)+1;examples[a.condition]||=c.name;}
  for(const m of a.text.matchAll(/【土之秘术 (\d+)】/g))earth.add(+m[1]);
  if(a.trigger.includes('进入战场时'))assert(!a.ids.some(id=>['tokenSummon','crystalHandSummon','reanimate','artifactCopy','amuletRecruit','amuletRevive'].includes(id)),'Recursive enter trigger');
  if(a.trigger==='谢幕曲')assert(!a.text.includes('选择')&&!a.text.includes('【模式】'));
  if(a.condition==='ppFull')assert(!a.ids.includes('ramp'),'Ramp should not be its own full-PP reward');
 }
}
for(const id of [...Object.keys(classes),...Object.keys(gates)])assert(seen[id]>=5,'Insufficient generated coverage: '+id);
assert.deepEqual([...earth].sort(),[1,2,3]);
assert(artifacts.size>=5,'Artifact supply should have varied official rewards');
console.log('PASS: 60,000 seeds; all requested systems reachable, class restrictions, no recursive summon or Last Words choices.');
console.log({seen,examples,earth:[...earth],artifactTypes:artifacts.size,officialAttachedCards:TOKENS.length});
