const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine');
const file=__dirname+'/high-cost-comparison.json',previous=JSON.parse(fs.readFileSync(file,'utf8'));
const m={n:0,storm:0,guard:0,threat:0,impact:0,protection:0,body:0,trade:0,stormAttacks:{}};
let cheapStorm=0;
for(let i=0;i<12000;i++){
 const c=S.generate('高费方向'+i),ids=c.abilities.flatMap(a=>a.ids);
 if(c.type!=='follower')continue;
 if(ids.includes('疾驰')&&c.attack===1){cheapStorm++;assert.equal(c.stormBodyTrade.targetLoss,0);}
 if(c.cost<7)continue;
 m.n++;
 for(const [k,id]of [['storm','疾驰'],['guard','守护'],['threat','威慑']])m[k]+=ids.includes(id);
 m.impact+=c.abilities.some(a=>['入场曲','自己的回合结束时'].includes(a.trigger)&&a.raw>=5&&a.ids.some(id=>['damage','face','aoe','destroy','banish','heal'].includes(id)));
 m.protection+=ids.some(id=>['damageCap','reduceDamage','abilityDestructionImmune'].includes(id));
 m.body+=c.attack+c.health;m.trade+=!!c.bodyTrade;
 if(ids.includes('疾驰')){
  m.stormAttacks[c.attack]=(m.stormAttacks[c.attack]||0)+1;
  assert(S.stormCardValue(c.attack,c.health,c.abilities).value<=c.cost+1e-8);
  assert(c.attack>=Math.max(2,Math.floor(c.cost*.4)));
 }
 if(c.rarity===0)assert(c.simpleDesign,'High-cost bronze retains a simple design');
 assert(c.spent+c.attack+c.health<=c.budget+.02);
}
assert(cheapStorm>10&&m.n>1000);
assert(m.storm/m.n>.10&&m.storm/m.n<.30,'Storm remains present without dominating high-cost designs');
assert(m.impact/m.n>.6&&m.guard/m.n>.2&&m.protection>30);
assert(Object.keys(m.stormAttacks).length>=5,'Storm should retain several viable attack bands');
const ref=require('./reference.json'),official=ref.cards.filter(c=>!c.token&&c.type===1&&c.cost>=7);
const report={version:S.VERSION,samples:12000,seedPrefix:'高费方向',baselineVersion:previous.baselineVersion,
 note:'before为修改前v4.61固定种子快照；after由本脚本重算。统计文本与印刷身材，不是对局胜率。官方样本的疾驰计数包含条件赋予。',
 officialHighCost:{n:official.length,mentionsStorm:official.filter(c=>/【疾驰】/.test(c.text)).length},stats:{before:previous.stats.before,after:m}};
fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
