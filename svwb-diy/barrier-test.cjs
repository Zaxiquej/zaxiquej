const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
assert(S.keywordPrice('屏障',2,2)>1.8);
assert(S.keywordPrice('屏障',8,8)>S.keywordPrice('屏障',2,2));
assert(S.keywordPrice('屏障',2,2,{ward:true})>S.keywordPrice('屏障',2,2));
assert.equal(S.keywordPrice('守护',2,2),0);assert.equal(S.keywordPrice('突进',2,2),0);
const counts={barrier:0,cheap:0,twoCost:0,paidBody:0,extraPayoff:0,chaos:0},examples={};
for(let i=0;i<12000;i++){
 const c=S.generate('屏障定价'+i,{chaos:i%3===0});
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 const shield=c.abilities.find(a=>a.kind==='keyword'&&a.ids.includes('屏障'));if(!shield)continue;
 counts.barrier++;if(c.chaos)counts.chaos++;assert(shield.price>=1.8);assert(c.attack>=0&&c.health>=1);
 const b=c.barrierBodyTrade;assert(b);assert(c.attack+c.health<=b.cap);if(b.lost)counts.paidBody++;
 if(c.cost<=3)counts.cheap++;
 if(c.cost===2){counts.twoCost++;assert(c.attack+c.health<=3);examples.twoCost??=c.name;if(b.extra){counts.extraPayoff++;assert(c.attack+c.health<=2);}}
 if(c.attack===0)assert(c.zeroAttackTrade&&c.cost<=3);
 if(i<3000)assert.deepEqual(c,S.generate(c.name,{chaos:i%3===0}));
}
assert(counts.barrier>30&&counts.twoCost>0&&counts.paidBody>10&&counts.chaos>0);
const report={version:S.VERSION,samples:12000,counts,examples};fs.writeFileSync(__dirname+'/barrier-validation.json',JSON.stringify(report,null,2)+'\n');console.log(report);
