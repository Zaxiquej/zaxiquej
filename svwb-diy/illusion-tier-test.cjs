const assert=require('node:assert/strict'),fs=require('node:fs'),E=require('./illusion-engine');
const tiers=Object.fromEntries([1,2,3,4,5,6].map(t=>[t,{cards:0,value:0,group:0,scaling:0,super:0,advanced:0,fixtures:[]}])) ,effects=new Set();
for(let i=0;i<12000;i++){
 const c=E.generate('星级核对#'+i),row=tiers[c.star];
 row.cards++;row.value+=c.design.estimatedEngineValue;row.super+=!!c.superEvolution.length;
 assert.equal(c.design.tierRole,E.tierRules[c.star].role);
 assert(c.design.referenceCards.every(name=>E.Data.cards.some(d=>d.name===name&&d.star===c.star&&d.cls===c.cls)));
 if(c.star<=2){assert.equal(c.atoms.length,1);assert.equal(c.superEvolution.length,0);}
 if(c.star<=4)assert.equal(c.superEvolution.length,0,'Low-tier host cannot bypass tier gates through super-evolution');
 for(const p of [...c.atoms,...(c.atomsSupport||[])]){
  effects.add(p.id);
  if(c.star<=2&&p.id==='buff'){assert(!p.group&&!p.scaling);assert(p.a<=1&&p.b<=1);}
  if(p.id==='buff'&&p.group)row.group++;
  if(p.scaling||p.damageScaling||p.inherit)row.scaling++;
  if(p.id==='buff'&&p.event==='fanfare')assert(!p.self);
  if(p.event==='shieldLost')assert(c.star>=5);
  if(p.keyword==='屏障'||p.extraKeyword==='屏障')assert(c.star>=5);
  if(p.keyword==='毁灭')assert(c.star>=5&&c.cls==='nightmare');
  if(p.id==='wound')assert(c.star>=4);
  if(p.id==='bequeath'||['amplify','inherit'].includes(p.id))assert(c.star>=6);
  if(p.id==='amplify')assert.equal(p.event,'aura');
  if(p.id==='inherit')assert.equal(p.event,'enter');
  if(p.id==='shopGrowth')assert(c.star>=4&&['fanfare','prepare','purchase'].includes(p.event));
  if(p.id==='recruit'&&['hurt','purchase','round'].includes(p.event))assert(c.star>=5);
  if(p.id==='recruit'&&p.event==='prepare')assert(c.star>=4);
  if(p.id==='evolve'&&p.event==='prepare')assert(c.star>=6);
  if(p.token){
   assert(p.token.minSourceTier<=c.star);
   if(/米米|可可/.test(p.token.name))assert(c.star>=5);
   if(/霸道之/.test(p.token.name))assert(c.star>=6);
  }
 }
 if(c.star>=5)assert(!['discount','coin'].includes(c.atoms[0].id),'High-tier main payoff cannot be a small economic rebate');
 if(c.atoms.some(p=>p.inherit||p.scaling||p.damageScaling||['amplify','inherit','bequeath','shopGrowth'].includes(p.id)))row.advanced++;
 if(row.fixtures.length<2)row.fixtures.push({name:c.name,text:E.toText(c)});
 assert(!/酒馆|战吼|亡语|圣盾|嘲讽|金色|法力|能量点/.test(E.toText(c)),'Use current illusion wording');
}
for(const row of Object.values(tiers)){assert(row.cards>500);row.meanValue=+(row.value/row.cards).toFixed(2);delete row.value;}
assert(tiers[5].meanValue>tiers[3].meanValue*1.8&&tiers[6].meanValue>tiers[4].meanValue*1.8,'High tiers must gain engine power, not only body stats');
assert(tiers[5].advanced/tiers[5].cards>.35&&tiers[6].advanced/tiers[6].cards>.5);
for(const id of ['inherit','amplify','shopGrowth'])assert(effects.has(id));
const report={version:E.VERSION,samples:12000,tiers};fs.writeFileSync(__dirname+'/illusion-tier-validation.json',JSON.stringify(report,null,2)+'\n');
console.log('PASS: tier access, source-token gates, scaling, wording and high-tier identity.');
console.log(Object.fromEntries(Object.entries(tiers).map(([t,{fixtures,...r}])=>[t,r])));
