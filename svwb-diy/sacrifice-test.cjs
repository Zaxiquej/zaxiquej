const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),S=require('./engine');
const ui=vm.createContext({});
vm.runInContext(fs.readFileSync(__dirname+'/app.js','utf8').split('const tokenType=')[0],ui);
const counts={evolution:0,discardAll:0,lowBody:0,growth:0,otherEvolution:0,largeDraw:0,largeDiscount:0},examples={},families=new Set();
for(let i=0;i<15000;i++){
 const options={chaos:i%3===0},c=S.generate('代价重组'+i,options);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 if(!c.sacrificeDesign)continue;
 counts[c.sacrificeDesign]++;assert.equal(c.type,'follower');assert(c.abilities.length<=5);
 assert.deepEqual(c,S.generate(c.name,options));
 const example=key=>{examples[key]??={name:c.name,chaos:options.chaos,cost:c.cost,attack:c.attack,health:c.health,text:c.abilities.map(a=>a.text)};};
 if(c.evolutionBodyTrade){
  const b=c.evolutionBodyTrade,a=c.abilities.find(a=>a.kind==='evolutionSacrifice');
  assert(b.lost>=2);assert(c.attack+c.health<=b.target,c.name+' body trade paid');
  assert(!c.evolutionFocusBonus);assert.equal(a.raw,b.payoffRaw);assert(a.raw>=8);
  assert(Math.abs(a.price-a.raw*b.timing)<1e-8);
  assert(!c.abilities.some(a=>a.ids.some(id=>['selfEvolve','selfSuperEvolve'].includes(id))));
  if(c.cost<=3){counts.lowBody++;example('lowBody');}
  const key=a.ids.includes('buff')?'growth':'otherEvolution';counts[key]++;example(key);
 }else{
  const b=c.discardAllTrade,a=c.abilities.find(a=>a.kind==='sacrificePayoff');
  assert(b.credit<=5);assert(b.payoffRaw>=12);assert(Math.abs(a.price-Math.max(.4,a.raw-b.credit))<1e-8);
  assert(a.text.startsWith('【入场曲】舍弃自己的所有手牌。'));
  assert(!a.text.includes('若以此舍弃'));assert(a.orderedEffects);
  assert(ui.displayAbilities(c).some(v=>v.text===a.text),'Do not sort payment after its payoff');
  a.ids.filter(id=>id!=='discardAllCost').forEach(id=>families.add(id));
  if(/抽取[4-8]张卡牌/.test(a.text)){counts.largeDraw++;example('largeDraw');}
  if(a.acquisitionDiscount?.discount>3){counts.largeDiscount++;example('largeDiscount');}
  example('discardAll');
 }
}
for(const [key,n]of Object.entries(counts))assert(n>0,key+' unreachable');
assert(families.size>=4,'Payoffs must use several effect families');
const report={version:S.VERSION,samples:15000,counts,families:[...families],examples};
fs.writeFileSync(__dirname+'/sacrifice-validation.json',JSON.stringify(report,null,2)+'\n');console.log(report);
