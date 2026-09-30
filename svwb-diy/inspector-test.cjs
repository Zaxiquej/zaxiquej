const assert=require('node:assert/strict'),S=require('./engine'),Q=require('./inspector-search');
const card={abilities:[{ids:['crystalHandBuff'],text:'【超进化时】使天晶魔手+1/+1。'},{ids:['x'],text:'【守护】'}],tokens:[{text:'【疾驰】'}],emblems:[{text:'自己的回合结束时，抽取1张卡牌。'}]};
assert(Q.compile({query:'守护，超进化时'})(card));
assert(!Q.compile({query:'进化时'})(card));
assert(Q.compile({query:'疾驰，守护',mode:'any'})(card));
assert(!Q.compile({query:'疾驰'})(card));
assert(Q.compile({query:'疾驰',scope:'all'})(card));
assert(!Q.compile({query:'守护',exclude:'疾驰',scope:'all'})(card));
assert(Q.compile({query:'id:crystalHandBuff'})(card));
assert(Q.compile({query:'天晶魔手，+1/+1'})(card));
assert(!Q.compile({query:'a.*'})(card),'Plain text is not executable regex');
assert(Q.compile({query:'唤灵'})({abilities:[{text:'【唤灵 6】抽取1张卡牌。'}]}));
assert(!Q.compile({query:'疾驰',scope:'all'})({abilities:[],tokens:[{text:'【疾驰】',related:true}]}));
assert.throws(()=>Q.compile({query:''}));
for(let i=0;i<200;i++)for(const chaos of [false,true]){
 const name='后台头部检查'+i,header=S.header(name,{chaos}),c=S.generate(name,{chaos});
 for(const key of ['name','class','rarity','cost','type'])assert.equal(header[key],c[key]);
 assert(Q.filterMatches(c,{class:c.class,rarity:c.rarity,type:c.type,costBand:c.cost<=3?'0-3':c.cost<=6?'4-6':'7+'}));
 assert(!Q.filterMatches(c,{class:(c.class+1)%8}));
}
console.log('PASS: exact keywords, ALL/ANY, exclusions, scopes, literal text, IDs and 400 deterministic header checks.');
