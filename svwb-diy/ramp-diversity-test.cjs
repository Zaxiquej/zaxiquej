const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const result={version:S.VERSION,dragons:0,ramp:0,immediate3:0,ward301:0,timings:{},bodies:{},conditions:{}};
for(let i=0;i<16000;i++){
 const chaos=i>=12000,c=S.generate('跳费去模板'+i,{chaos});
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 require('./assert-node-effects.cjs')(c);
 if(c.type!=='follower'||c.class!==4)continue;
 const ramps=c.abilities.filter(a=>a.ids.includes('ramp'));
 for(const a of ramps){
  assert(a.raw>=9,c.name+' ramp still costs a full spell');assert.notEqual(a.condition,'ppFull');
  if(c.cost<=5&&a.trigger==='入场曲'&&a.condition==='none'){
   assert(c.attack+c.health<=({3:1,4:2,5:4})[c.cost],c.name+' immediate ramp body budget');
  }
 }
 if(chaos)continue;result.dragons++;
 const a=ramps[0];if(!a)continue;result.ramp++;
 result.timings[a.trigger]=(result.timings[a.trigger]||0)+1;
 result.conditions[a.condition]=(result.conditions[a.condition]||0)+1;
 const key=c.cost+':'+c.attack+'/'+c.health;result.bodies[key]=(result.bodies[key]||0)+1;
 if(c.cost===3&&a.trigger==='入场曲'&&a.condition==='none'){
  result.immediate3++;
  if(c.attack===0&&c.health===1&&c.abilities.some(a=>a.ids.includes('守护')))result.ward301++;
 }
}
const before=require('./ramp-baseline.json');
assert(before.ward301>0,'Baseline must exercise the reported repeated pattern');
assert(result.ward301<before.ward301*.3,'Remove the common forced 3 PP 0/1 Ward ramp');
assert(result.ramp>=15,'Ramp remains reachable through the ordinary pool');
assert(Object.keys(result.timings).length>=3&&Object.keys(result.bodies).length>=8,'Different timings and bodies remain reachable');
assert(Object.keys(result.conditions).some(c=>c!=='none'),'Paid or conditional ramp remains reachable');
result.before={ramp:before.ramp,immediate3:before.immediate3,ward301:before.ward301};
fs.writeFileSync(__dirname+'/ramp-diversity-validation.json',JSON.stringify(result,null,2));console.log('PASS',result);
