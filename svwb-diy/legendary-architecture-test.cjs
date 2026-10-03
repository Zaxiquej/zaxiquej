const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine'),check=require('./assert-node-effects.cjs');
let acceptedPlain=0;
for(let i=0;i<100;i++){
 const c={name:'平凡虹卡审阅'+i,type:'follower',cost:5,abilities:[{kind:'effect',trigger:'入场曲',condition:'none',ids:['damage'],raw:5,text:'造成4点伤害。'},{kind:'emblem',trigger:'进化时',condition:'none',ids:['emblem'],raw:4,text:'获得纹章。'}],emblems:[{effects:[{id:'heal'}]}]};
 if(S.designIdentity(c))acceptedPlain++;
}
assert.equal(acceptedPlain,0,'Structure classification is descriptive, not a generation requirement');
const counts={cards:5000,scope:0,stance:0,legendary:0,identity:0},families=new Set(),examples=[];
for(let i=0;i<counts.cards;i++){
 const options={chaos:i%4===0},c=S.generate('虹卡架构回归'+i,options);check(c);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.025,c.name+' budget');
 if(c.rarity===3){counts.legendary++;if(S.designIdentity(c))counts.identity++;}
 if(i%400===0)assert.deepEqual(c,S.generate(c.name,options));
 if(c.scopeDesign){
  counts.scope++;families.add(c.scopeDesign.effectId);
  const upgrade=c.abilities.find(a=>a.ids.includes('scopeUpgrade')),p=upgrade.scopeUpgrade;
  assert.equal(c.rarity,3);assert(c.scopeDesign.fee>c.cost&&c.scopeDesign.fee<=10);
  assert(p.replacesBase&&p.expandedRaw>=p.baseRaw);assert(!c.progressTransform);
  assert(Math.abs(upgrade.price-(.8+Math.max(0,p.expandedRaw-p.baseRaw-p.credit)*.4))<1e-8);
  const bases=c.abilities.filter(a=>a.trigger==='入场曲');assert.equal(bases.length,1,c.name+' ambiguous scope');
  assert.equal(bases[0].bodyText,p.base);assert(!/随机/.test(p.base));
  const replay=c.abilities.find(a=>a.ids.includes('replay'));
  if(replay){assert(replay.text.includes('爆能强化除外'));assert.equal(replay.raw,p.baseRaw);}
  if(!examples.some(e=>e.scopeDesign?.effectId===p.effectId))examples.push(c);
 }
 if(c.stanceDesign){
  counts.stance++;const p=c.stanceDesign,a=c.abilities.find(a=>a.ids.includes('phaseSwitch'));
  assert(p.exclusive);assert(p.before.ids.every(id=>!p.after.ids.includes(id)));
  assert(p.after.ids.some(id=>['face','tokenSummon','teamBuff'].includes(id)),'Changing stance must change tactical purpose, not merely increase removal damage');
  assert(!/选择/.test(a.bodyText),'Automatic end of turn cannot choose targets');
  assert(Math.abs(a.price-(Math.max(p.before.raw,p.after.raw)*1.25+.8))<1e-8);
  if(examples.filter(e=>e.stanceDesign).length<3)examples.push(c);
 }
}
assert(counts.scope>10&&families.size>=4,'Scope changes must cover multiple effect families');
assert(counts.stance>0,'Stance designs must remain reachable');
assert(counts.legendary-counts.identity>counts.legendary*.15,'Ordinary legendary designs must coexist with unusual ones');
const report={version:S.VERSION,counts,acceptedPlain,families:[...families],examples};
fs.writeFileSync(__dirname+'/legendary-architecture-validation.json',JSON.stringify(report,null,2)+'\n');
console.log({version:S.VERSION,counts,acceptedPlain,families:[...families]});
