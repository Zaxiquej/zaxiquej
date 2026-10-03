const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const S=require('./engine'),R=require('./reference.json'),C=require('./calibration');
assert.equal(R.cards.length,R.listedCount);assert.equal(new Set(R.cards.map(c=>c.id)).size,R.listedCount);
assert(C.draftPriors);assert.equal(C.draftPriors.classes.reduce((a,b)=>a+b),R.cards.filter(c=>!c.token).length);
// Validate header proportions independently of card power/quality rejection.
const counts={types:{},classes:Array(8).fill(0),rarities:Array(4).fill(0)},chaos=Array(4).fill(0),n=60000;
for(let i=0;i<n;i++){
 const name='官方联合分布回归'+i,h=S.header(name),ch=S.header(name,{chaos:true});
 counts.types[h.type]=(counts.types[h.type]||0)+1;counts.classes[h.class]++;counts.rarities[h.rarity]++;chaos[ch.rarity]++;
 assert.equal(h.class,ch.class);assert.equal(h.cost,ch.cost);assert.equal(h.type,ch.type);
}
const official=R.cards.filter(c=>!c.token),types={follower:1,spell:4};
for(const [type,total]of Object.entries(counts.types)){
 const actual=official.filter(c=>type==='amulet'?[2,3].includes(c.type):c.type===types[type]).length/official.length;
 assert(Math.abs(total/n-actual)<.012,type+' prevalence');
}
for(let cls=0;cls<8;cls++)assert(Math.abs(counts.classes[cls]/n-C.draftPriors.classes[cls]/official.length)<.008,'class prevalence');
for(let r=0;r<4;r++)assert(Math.abs(counts.rarities[r]/n-official.filter(c=>c.rarity===r+1).length/official.length)<.025,'rarity prevalence');
assert(chaos[3]>counts.rarities[3]*1.4);assert(chaos[0]<counts.rarities[0]);
let state=522;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
let amulets=0,neutral=0,withDeath=0,underfilled=0,neutralSummon=0;
const check=c=>{
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 require('./assert-node-effects.cjs')(c);
 if(c.type==='follower'){assert(Number.isInteger(c.attack)&&Number.isInteger(c.health));assert(c.attack>=0&&c.health>0);}
 const parts=[...c.abilities,...c.emblems,...c.alternateForms.flatMap(f=>f.abilities||[])];
 for(const a of parts){
  if(a.condition==='singleton')assert([0,7].includes(c.class),c.name);
  if(a.condition==='lowHealth'||a.conditionId==='lowHealth')assert([4,5].includes(c.class),c.name);
  if(c.class===0)assert(!/【(?:连击|协作|土之秘术|唤灵)|魔力增幅|土之印|能量点最大值\+/.test(a.text),c.name+' neutral class resource');
 }
 if(c.type==='amulet'){
  amulets++;assert(c.abilities.some(a=>a.trigger));
  const death=c.abilities.find(a=>a.trigger==='谢幕曲');
  if(death){withDeath++;assert(c.countdown!=null||c.abilities.some(a=>a.activation?.breaksSelf),'Reachable Last Words');if(c.spent<c.budget*.55)underfilled++;}
  if(c.abilities.some(a=>a.ids.includes('earthSigil')))assert(!c.abilities.some(a=>a.activation?.breaksSelf));
 }
 if(c.class===0){neutral++;if(c.abilities.some(a=>/召唤/.test(a.text)))neutralSummon++;}
};
for(let i=0;i<2200;i++){
 const opts={chaos:i%3===0},c=S.generate('官方机制回归'+i,opts);check(c);
 if(i%200===0)assert.deepEqual(c,S.generate(c.name,opts));
}
for(let i=0;i<650;i++)check(S.generate(S.randomMatchingName({type:'amulet',costBand:'0-3'},{random})));
assert(underfilled/Math.max(1,withDeath)<.04,'Countdown cards must still deliver a payoff without Fanfare filler');
const sandbox={self:{},setTimeout,clearTimeout,performance};vm.createContext(sandbox);
sandbox.importScripts=(...files)=>files.forEach(f=>vm.runInContext(fs.readFileSync(path.join(__dirname,f.split('?')[0]),'utf8'),sandbox));
vm.runInContext(fs.readFileSync(path.join(__dirname,'inspector-worker.js'),'utf8'),sandbox);assert.equal(sandbox.SVWB.VERSION,S.VERSION);
assert.equal(sandbox.SVWB.generate('后台加载核对').name,'后台加载核对');
const report={version:S.VERSION,headers:n,cards:2850,counts,chaos,amulets,withDeath,underfilled,neutral,neutralSummon};
fs.writeFileSync(__dirname+'/official-distribution-validation.json',JSON.stringify(report,null,2)+'\n');console.log('PASS',report);
