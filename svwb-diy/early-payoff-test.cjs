const assert=require('node:assert/strict'),S=require('./engine'),R=require('./reference.json');
const monster=R.cards.find(c=>c.id===10732110),penelope=R.cards.find(c=>c.id===10133120);
assert.deepEqual([monster.cost,monster.attack,monster.health],[3,4,2]);assert(monster.text.includes('土之印+2'));
assert.deepEqual([penelope.cost,penelope.attack,penelope.health],[2,2,2]);
assert.equal(S.earthUnitValue('follower',2,'入场曲'),.9);
assert.equal(S.earthUnitValue('follower',3,'谢幕曲'),.9);
for(const trigger of ['与本卡牌融合时','自己的回合结束时','超进化时'])assert.equal(S.earthUnitValue('follower',2,trigger),1.6);
assert.equal(S.earthUnitValue('spell',2,'法术'),1.6);
const late=(ids,raw,text)=>({type:'follower',cost:2,abilities:[{kind:'effect',trigger:'超进化时',ids,raw,text}],emblems:[]});
assert(!S.lowSuperEvolutionQuality(late(['draw'],9,'抽取3张卡牌。')));
assert(!S.lowSuperEvolutionQuality(late(['buff'],12,'本随从+6/+6。')));
assert(S.lowSuperEvolutionQuality(late(['selfCopy'],14,'召唤2个自身。')));
const early=late(['heal'],6,'回复自己的主战者3点生命值。');early.abilities.push({kind:'effect',trigger:'入场曲',ids:['earth'],raw:1.8,text:'土之印+2。'});assert(S.lowSuperEvolutionQuality(early));
let low=0,setup=0;const check=require('./assert-node-effects.cjs');
for(let i=0;i<5000;i++){
 const options={chaos:i%3===0},c=S.generate('启动校验506-'+i,options);check(c);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 if(c.type==='follower'&&c.cost>=1&&c.cost<=3){low++;assert(S.lowSuperEvolutionQuality(c),c.name+' low SEP-only quality');}
 if(c.setupBodyAllocation){setup++;assert(c.cost>=2&&c.cost<=3);assert(c.setupBodyAllocation.resourceIds.every(id=>['earth','grave'].includes(id)));assert.equal(c.setupBodyAllocation.spent,1);}
 if(i<80)assert.deepEqual(c,S.generate(c.name,options));
}
assert(low>500);console.log({version:S.VERSION,samples:5000,low,setup});
