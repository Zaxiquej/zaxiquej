const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
assert(S.splitDamageValue(6)>S.splitDamageValue(3)*2,'Multi-target flexibility is not linear');
const counts={cards:5000,combat:0,stationary:0,cheapSplit:0,gatedSplit:0,alternates:0},examples={},payoffs=new Set();
const before=JSON.parse(fs.readFileSync(__dirname+'/model-boundaries-before.json','utf8'));
let sameCombat=0,sameStationary=0;
function inspect(c){
  assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.025,c.name+' budget');
  assert(S.boardCapacity(c).valid,c.name+' capacity');
  for(const a of c.abilities){
    if(a.condition!=='none'||!['法术','入场曲','启动'].includes(a.trigger)||a.activation?.fee>0)continue;
    for(const m of (a.bodyText||a.text).matchAll(/分配(\d+)点伤害/g)){
      if(a.ids.length===1)assert(a.raw+.001>=S.splitDamageValue(+m[1]),c.name+' split valuation '+a.text);
      if(c.cost<=2)counts.cheapSplit++;
    }
    // X / spellboost and persistent emblem payloads have their own setup cost.
  }
}
for(let i=0;i<counts.cards;i++){
  const c=S.generate('模型边界复核'+i);inspect(c);
  const combat=c.abilities.some(a=>a.trigger==='交战时'&&a.ids.includes('destroy'));
  if(combat){counts.combat++;if(i<2500)sameCombat++;}
  if(c.stationaryDesign){
    counts.stationary++;if(i<2500)sameStationary++;
    const d=c.stationaryDesign;
    assert(d.payoffRaw>=d.minPayoff&&d.payoffRaw>=3,c.name+' weak stationary payoff');
    assert(d.payoffRaw*d.multiplier<=d.credit+d.spare+.001);
    assert(d.credit<=9&&d.bodyBonus===0);
    const a=c.abilities.find(a=>a.trigger==='自己的回合结束时'&&a.raw===d.payoffRaw&&a.price===d.payoffRaw*d.multiplier);assert(a);
    a.ids.forEach(id=>payoffs.add(id));
    assert(!c.abilities.some(a=>['攻击时','交战时'].includes(a.trigger)));
    (examples.stationary??=[]).length<5&&examples.stationary.push({name:c.name,cost:c.cost,attack:c.attack,health:c.health,text:c.abilities.map(a=>a.text),model:d});
  }
  for(const a of c.abilities)if(c.cost<=2&&a.condition!=='none'&&/分配[6-9]点/.test(a.text)){
    counts.gatedSplit++;examples.gatedSplit??={name:c.name,cost:c.cost,text:a.text};
  }
  for(const f of c.alternateForms||[])if(f.abilities){counts.alternates++;inspect(f);}
  if(i%250===0)assert.deepEqual(c,S.generate(c.name));
}
assert(counts.cheapSplit>0&&counts.gatedSplit>0&&counts.stationary>0);
assert(payoffs.size>=3,'Stationary rewards must not collapse to a fixed package');
assert(sameCombat<before.stats.combat*.65,'Combat destruction should become rarer');
const report={version:S.VERSION,counts,comparison:{sample:2500,combatBefore:before.stats.combat,combatAfter:sameCombat,stationaryBefore:before.stats.stationary,stationaryAfter:sameStationary},payoffs:[...payoffs],examples};
fs.writeFileSync(__dirname+'/model-boundaries-validation.json',JSON.stringify(report,null,2));console.log(report);
