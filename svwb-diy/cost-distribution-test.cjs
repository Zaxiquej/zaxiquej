const S=require('./engine'),C=require('./calibration'),R=require('./reference.json'),assert=require('node:assert/strict'),fs=require('node:fs');
const official={follower:Array(11).fill(0),spell:Array(11).fill(0),amulet:Array(11).fill(0)};
for(const c of R.cards.filter(c=>!c.token&&c.cost<=10))official[c.type===1?'follower':c.type===4?'spell':'amulet'][c.cost]++;
assert.deepEqual(C.costPriors,official);
const counts={follower:Array(11).fill(0),spell:Array(11).fill(0),amulet:Array(11).fill(0)};let highDiscount=0;
for(let i=0;i<20000;i++){
 const c=S.generate('费用分布'+i);counts[c.type][c.cost]++;
 assert(official[c.type][c.cost]>0);
 if(c.type==='spell'&&c.cost>=8){highDiscount++;assert.equal(c.class,3);assert(c.abilities.some(a=>a.ids.includes('spellboostDiscount')));}
}
for(const type of Object.keys(counts)){
 const total=counts[type].reduce((a,b)=>a+b,0),expected=Array(11).fill(0);
 for(let cls=0;cls<8;cls++){
  const weights=official[type].map((w,cost)=>w*(type==='spell'&&cost>=8?(cls===3?8:0):1)),sum=weights.reduce((a,b)=>a+b,0);
  weights.forEach((w,cost)=>expected[cost]+=w/sum/8);
 }
 counts[type].forEach((n,cost)=>assert(Math.abs(n/total-expected[cost])<.008+4*Math.sqrt(expected[cost]*(1-expected[cost])/total),type+' '+cost));
}
assert(highDiscount>5);
for(const type of ['follower','spell','amulet'])for(const costBand of ['0-3','4-6','7+']){
 const name=S.randomMatchingName({type,costBand},{random:()=>.23456}),c=S.generate(name);assert.equal(c.type,type);assert(costBand==='0-3'?c.cost<=3:costBand==='4-6'?c.cost>=4&&c.cost<=6:c.cost>=7);
}
const high=Object.fromEntries(Object.entries(counts).map(([t,ns])=>[t,ns.slice(7).reduce((a,b)=>a+b,0)]));
assert(high.follower/(high.follower+high.spell+high.amulet)>.85);
const report={version:S.VERSION,official,counts,high,highDiscount,excludedCosts:C.excludedCosts};fs.writeFileSync(__dirname+'/cost-distribution-validation.json',JSON.stringify(report,null,2));console.log('PASS: official non-token cost counts, empirical sampling, rare discounted high-cost spells, reachable filters.');console.log(report);
