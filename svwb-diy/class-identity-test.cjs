const assert=require('node:assert/strict'),I=require('./class-identity'),S=require('./engine'),C=require('./calibration'),R=require('./reference.json');
const compiled=I.compile(R);assert.deepEqual(compiled.profiles,C.classIdentityProfiles);
assert.equal(Object.keys(compiled.profiles).length,84);
for(const profile of Object.values(compiled.profiles))for(const rate of Object.values(profile))assert(rate>0&&rate<1);
assert(I.families(1,{condition:'combo'}).includes('combo'));
assert(I.families(1,{ids:['tokenHand'],tokens:[S.TOKENS.find(t=>t.name==='妖精')]}).includes('supply'));
assert(I.families(2,{ids:['teamBuff']}).includes('buff'));
assert(I.families(2,{trigger:'爆能强化'}).includes('enhance'));
assert(I.families(3,{ids:['experimentSupply']}).includes('experiment'));
assert(I.families(3,{ids:['boost']}).includes('boost'));
assert.deepEqual(I.families(0,{ids:['boost','tokenSummon']}),[]);
assert(I.families(5,{trigger:'谢幕曲',ids:['draw']}).includes('death'));
for(const cls of [1,2,3,4,5,6,7]){
 const all=R.cards.filter(c=>c.type===1&&!c.token&&c.class===cls);
 assert.equal(compiled.classes[cls].cards,all.length);
 for(const [feature,data] of Object.entries(compiled.classes[cls].features)){
  assert.deepEqual(data.cardIds,all.filter(c=>I.rules[cls][feature].test(c.text)).map(c=>c.id));
 }
}
for(const b of [0,1,2]){
 assert(C.profiles[`${b}:3:2`].effects.boost>C.profiles[`${b}:0:2`].effects.boost);
 assert(C.profiles[`${b}:2:2`].effects.tokenSummon>C.profiles[`${b}:0:2`].effects.tokenSummon);
}
const before=require('./class-identity-before-505.json'),after=require('./class-identity-after-505.json');
for(let cls=1;cls<=7;cls++){
 const key=cls+':goldRainbow',a=before.groups[key],b=after.groups[key];
 assert.equal(a.cards,b.cards);assert(b.featured>b.cards*a.featured/a.cards,'Class identity improves for gold/rainbow '+cls);
 assert(b.featured<b.cards,'Generic class followers remain possible');
}
console.log('PASS: official cohort counts, 84 class/rarity/cost priors, class rules, and eight-thousand-seed before/after audit.');
