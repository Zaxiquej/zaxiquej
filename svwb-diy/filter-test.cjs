const assert=require('node:assert/strict');
const {generate,randomMatchingName}=require('./engine.js');
const bands={ '0-3':[0,3], '4-6':[4,6], '7+':[7,Infinity] };
let combinations=0;
let exhausted=0;
for(const type of [null,'follower','spell','amulet'])for(const cls of [null,0,1,2,3,4,5,6,7])for(const rarity of [null,0,1,2,3])for(const costBand of [null,'0-3','4-6','7+']){
 const filters={type,class:cls,rarity,costBand};
 for(const variantOf of [undefined,'固定名称#0000']){
  let name;
  try{name=randomMatchingName(filters,{variantOf,random:()=>0});}
  catch(e){assert(variantOf&&e.message.includes('没有符合条件'));exhausted++;continue;}
  const c=generate(name);
  assert.match(name,variantOf?/^固定名称#\d{6}$/:/^随机卡牌#\d{8}$/);
  assert.notEqual(name,variantOf);
  if(cls!==null)assert.equal(c.class,cls);
  if(type!==null)assert.equal(c.type,type);
  if(rarity!==null)assert.equal(c.rarity,rarity);
  if(costBand){const [min,max]=bands[costBand];assert(c.cost>=min&&c.cost<=max);}
  assert.equal(name,randomMatchingName(filters,{variantOf,random:()=>0}));
 }
 combinations++;
}
assert.equal(randomMatchingName({}, {random:()=>0}),'随机卡牌#00000000');
assert.equal(randomMatchingName({}, {random:()=>0,excludeName:'随机卡牌#00000000'}),'随机卡牌#00000001');
assert.match(randomMatchingName({}, {variantOf:'随机卡牌#00000000',random:()=>0}),/^随机卡牌#\d{8}$/);
const long=randomMatchingName({class:0,rarity:3,costBand:'7+'},{variantOf:'😀'.repeat(24),random:()=>.999999});
assert(long.length<=48&&long.isWellFormed());
assert.throws(()=>randomMatchingName({class:8}));
assert.throws(()=>randomMatchingName({rarity:4}));
assert.throws(()=>randomMatchingName({costBand:'bad'}));
assert.throws(()=>randomMatchingName({type:'bad'}));
console.log(`PASS: ${combinations} filter combinations, random/variant suffixes, repeat exclusion and validation; ${exhausted} valid empty six-digit searches.`);
