const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const ctx=(cost,abilities=[])=>({cost,trigger:'入场曲',abilities});
const gate=(id,extra={})=>({id,factor:.5,extra:3,...extra});
const pay=(raw,g)=>Math.max(.4,(raw-g.extra)*g.factor);
// Actual PP gates cannot be sold again as a drawback at their natural turn.
assert.equal(S.conditionTerms(gate('overflow'),ctx(7)).factor,1);
assert.equal(S.conditionTerms(gate('ppFull'),ctx(10)).factor,1);
assert(S.conditionTerms(gate('overflow'),ctx(8,[{scaling:{payoff:'discount',expected:4}}])).factor<1,'Discounted expensive cards may arrive before overflow');
assert(S.conditionTerms(gate('overflow'),ctx(1)).factor<.6);
// Spending the same finite resource cannot buy more discount merely because
// the reward is larger. Strong rewards still remain possible by investing PP.
for(const id of ['earth','necromancy']){
  const g=S.conditionTerms(gate(id,{amount:id==='earth'?2:6}),ctx(3));
  assert.equal(g.factor,1);assert(Math.abs((16-pay(16,g))-(10-pay(10,g)))<1e-8);
  const bigger=S.conditionTerms(gate(id,{amount:id==='earth'?3:10}),ctx(3));
  assert(bigger.extra>g.extra);
}
const earth3=S.conditionTerms(gate('earth',{amount:3}),ctx(3));
assert(pay(4*3.8,earth3)<9,'理光的证明: 3 PP + soil 3 can still support 4 AOE');
const overflow=S.conditionTerms(gate('overflow'),ctx(1));
assert(pay(4*1.25,overflow)<3,'龙人碎击: late 1 PP removal remains worthwhile');
const singleton=S.conditionTerms(gate('singleton'),ctx(1));
assert.equal(singleton.extra,0);
assert(S.conditionTerms(gate('singleton'),ctx(1,[{condition:'singleton'}])).factor>singleton.factor);
assert(S.conditionTerms(gate('costChanged'),ctx(3,[{ids:['handDiscount']}])).factor>.9);
assert(S.bloodDrawValue(2,2)>S.bloodDrawValue(2,1)*2,'Self-damage cannot bypass multi-draw pricing');
assert(S.splitDamageValue(6)>S.splitDamageValue(3)*2);
const old=require('./condition-value-before.json'),oldNames=new Set(old.map(c=>c.name));
const counts={},after=[],showcases={},stats={cards:4000,bloodDraw:0,cheapFourSplit:0,cheapSixSplit:0};
for(let i=0;i<stats.cards;i++){
  const c=S.generate('条件价值审阅'+i);
  require('./assert-node-effects.cjs')(c);
  assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.025,c.name+' budget');
  assert(S.boardCapacity(c).valid,c.name+' board');
  for(const a of c.abilities){
    if(a.condition&&a.condition!=='none')counts[a.condition]=(counts[a.condition]||0)+1;
    // Coalesced timings retain atom accounting. Do not require a whole node
    // to consist solely of bloodDraw to exercise its value invariant.
    const blood=(a.components||[]).filter(p=>p.id==='bloodDraw');
    if(!blood.length&&a.ids.length===1&&a.ids[0]==='bloodDraw')blood.push(a);
    for(const p of blood){
      stats.bloodDraw++;const n=Number(p.text.match(/抽取(\d+)张/)[1]);
      assert(p.raw+.001>=S.bloodDrawValue(a.enhanceCost||c.cost,n),c.name+' self damage draw');
    }
    if(a.ids.length===1&&a.ids[0]==='draw'&&c.cost<=2&&a.condition!=='none'&&!['爆能强化','启动'].includes(a.trigger)){
      const n=Number(a.text.match(/抽取(\d+)张/)[1]);
      assert(a.raw+.001>=2.8*n+1.5*n*(n-1),c.name+' gate double discount');
    }
    if(c.cost===2&&a.condition==='none'&&['法术','入场曲'].includes(a.trigger)){
      if(/分配4点/.test(a.text)){stats.cheapFourSplit++;showcases.flexibleSplit??={name:c.name,text:c.abilities.map(a=>a.text)};}
      if(/分配6点/.test(a.text))stats.cheapSixSplit++;
    }
  }
  if(oldNames.has(c.name))after.push({name:c.name,cost:c.cost,type:c.type,body:[c.attack,c.health],abilities:c.abilities.map(a=>({condition:a.condition,raw:a.raw,price:a.price,text:a.text}))});
  if(i%500===0)assert.deepEqual(c,S.generate(c.name));
}
// A new official distribution can omit a rare class-only atom in an unfiltered
// sample. Probe its actual class separately; retain the invariant and require
// reachability instead of increasing production weights to satisfy a seed set.
stats.targetedCards=0;
for(let i=0;stats.bloodDraw===0&&i<30000;i++){
 const name='自伤抽牌可达性'+i,h=S.header(name);
 if(h.class!==5||h.cost>6)continue;
 const c=S.generate(name);stats.targetedCards++;
 for(const a of c.abilities){
  const parts=(a.components||[]).filter(p=>p.id==='bloodDraw');
  if(!parts.length&&a.ids.length===1&&a.ids[0]==='bloodDraw')parts.push(a);
  for(const p of parts){const n=Number(p.text.match(/抽取(\d+)张/)[1]);assert(p.raw+.001>=S.bloodDrawValue(a.enhanceCost||c.cost,n));stats.bloodDraw++;showcases.bloodDraw={name,text:c.abilities.map(a=>a.text)};}
 }
}
assert(stats.bloodDraw>0);assert(stats.cheapFourSplit>0,'A flexible valuation must allow 2 PP split 4, not reinstate a hard cap');
for(const id of ['earth','necromancy','combo','overflow','discard','lowHealth'])assert(counts[id]>0,id+' remains reachable');
fs.writeFileSync(__dirname+'/condition-value-after.json',JSON.stringify(after,null,2));
const reference=require('./reference.json');
const reviewed=[10031110,10032110,10032310,10132310,10133130,10231310,10234110,10234120,10432120,10532310,10051130,10153120,10154110,10454110,10651310,10654120,10753310,10754120,10041310,10141120,10141150,10142120,10142140,10142310,10143120,10241120,10241310,10244110,10842120,10911110,10912110,10912310,10913110,10913310,10914110,10971110,10972110,10972310,10973110,10973310,10974110,10151150,10432310,10651110];
const report={version:S.VERSION,stats,counts,showcases,referenceDate:reference.retrieved,officialSource:reference.source,reviewed:reference.cards.filter(c=>reviewed.includes(c.id)).map(c=>({id:c.id,name:c.name,cost:c.cost,attack:c.attack,health:c.health,text:c.text}))};
fs.writeFileSync(__dirname+'/condition-value-validation.json',JSON.stringify(report,null,2));console.log({version:S.VERSION,stats,counts,showcases,officialExamples:report.reviewed.length});
