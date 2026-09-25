const assert=require('node:assert/strict'),S=require('./engine'),check=require('./assert-node-effects.cjs');
const hit=n=>({type:'follower',cost:9,attack:9,health:9,abilities:[{kind:'core',trigger:'入场曲',condition:'none',ids:['coreAnchor','damage'],raw:n*1.25,text:`选择对手的战场上的1个随从，对其造成${n}点伤害。`}],emblems:[]});
assert.equal(S.highCostReadiness(hit(9)),7);
assert.equal(S.highCostReadiness(hit(99)),7);
assert(!S.lateGameQuality(hit(9)));
const reference={type:'follower',cost:7,attack:10,health:10,abilities:[{kind:'keyword',ids:['守护']},{kind:'core',trigger:'入场曲',condition:'none',ids:['destroy'],raw:7}],emblems:[]};
assert(S.lateGameQuality(reference));
const counts={late:0,unchangedCost:0,styles:{}};
for(let i=0;i<8000;i++){
 const opts={chaos:i%2===0},c=S.generate('完成形终局512-'+i,opts);check(c);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 if(c.type==='follower'&&c.cost>=7){counts.late++;assert(S.lateGameQuality(c),c.name+' weak late card: '+c.abilities.map(a=>a.text).join(' / '));}
 const p=c.progressTransform;if(!p)continue;
 counts.styles[p.style]=(counts.styles[p.style]||0)+1;if(!p.discount)counts.unchangedCost++;
 const t=c.tokens.find(t=>t.id===p.targetId);
 assert.equal(t.cost,c.cost-p.discount);
 assert(!t.text.includes(`变身为『${t.name}』`));
 assert(Math.abs(p.price-(p.discountRaw+p.bonusRaw*p.replayMultiplier)*p.factor)<1e-8);
 if(p.changedIndex!==null){
  assert(['amplify','promote'].includes(p.style));
  const base=c.abilities.filter(a=>a.kind!=='progressTransform');
  for(let j=0;j<base.length;j++)if(j!==p.changedIndex)assert.equal(base[j].text,t.abilities[j].text);
  if(p.style==='promote')assert.equal(t.abilities[p.changedIndex].trigger,'入场曲');
 }else assert(t.text.startsWith(p.baseText+'\n\n'));
 assert.deepEqual(c,S.generate(c.name,opts));
}
assert(counts.late>100);assert(counts.unchangedCost>0);assert(Object.keys(counts.styles).length>=3);
console.log({version:S.VERSION,samples:8000,counts});
