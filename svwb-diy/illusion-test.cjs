const assert=require('node:assert/strict');
const fs=require('node:fs');
const E=require('./illusion-engine');
assert.equal(E.Data.cards.length,87);assert.equal(E.Data.leaders.length,17);
assert.equal(E.Data.cards.filter(c=>!c.token).length,77);
assert.equal(new Set(E.Data.cards.map(c=>c.name)).size,87);
const expected={neutral:15,forest:19,royal:18,dragon:18,nightmare:17};
for(const [cls,n] of Object.entries(expected))assert.equal(E.Data.cards.filter(c=>c.cls===cls).length,n);
const report={version:E.VERSION,samples:12000,classes:{},stars:{},themes:{},effects:{},events:{},superDesigns:{},evolution:0,superEvolution:0,fixtures:{}};
const structures=new Set();
const summonUpgrades={automatic:0,ordinaryEvolved:0,bequeath:0};
let selfGrowth=0;
const selfBuffExample=E.generate('随机卡牌#47555848');
assert.equal(selfBuffExample.cls,'forest');assert.equal(selfBuffExample.star,4);
assert(!selfBuffExample.pre.concat(selfBuffExample.post).some(t=>/^【(?:入场曲|三连进化入场曲)】本随从\+/.test(t)));
for(let i=0;i<report.samples;i++){
 const name='幻境核对#'+String(i).padStart(8,'0');const c=E.generate(name);
 assert.deepEqual(c,E.generate(name));assert.equal(c.kind,'follower');
 if(i<10){assert.deepEqual(c,E.generate(name,'leader'));assert.equal(E.header(name,'leader').kind,'follower');}
 assert.equal(c.cls,E.header(name).cls);assert.equal(c.star,E.header(name).star);
 assert(c.attack>=0&&c.health>=1&&c.star>=1&&c.star<=6);
 assert(c.pre.length&&c.post.length&&c.atoms.length<=2);
 for(const [field,key] of [['classes',c.cls],['stars',c.star],['themes',c.design.theme]])report[field][key]=(report[field][key]||0)+1;
 for(const a of c.atoms){
  if(a.id==='buff'&&a.event==='fanfare')assert(!a.self,'Fanfare must not disguise base stats as self-growth');
  if(a.id==='buff'&&a.self)selfGrowth++;
  report.effects[a.id]=(report.effects[a.id]||0)+1;report.events[a.event]=(report.events[a.event]||0)+1;
  const line=c.pre.find(x=>x.startsWith(E.events[a.event].label.split('{')[0]));assert(line);
  if(!E.events[a.event].manual)assert(!line.includes('选择'));
  if(a.event==='hurt'&&['coin','discount','recruit'].includes(a.id))assert(line.includes('可触发'));
  if(a.id==='revive')assert(line.includes('失去【谢幕曲】'));
  if(a.token){assert(c.tokens.some(t=>t.name===a.token.name));assert(a.token.minSourceTier<=c.star);}
 }
 for(const t of c.tokens)assert(E.Data.cards.some(x=>x.name===t.name&&x.token));
 c.atoms.forEach((a,index)=>{
  if(!['summon','bequeath'].includes(a.id))return;
  const post=c.post[c.keywords.length+index],base=a.id==='bequeath'?1:a.count;
  if(a.token.autoEvolve||a.token.star<2){
   assert(post.includes(`召唤${Math.min(6,base*2)}个『${a.token.name}』`),c.name+' must gain extra bodies');
   assert(!post.includes(`进化后的『${a.token.name}』`));
   if(a.token.autoEvolve)summonUpgrades.automatic++;
  }else{
   assert(post.includes(`召唤${base}个进化后的『${a.token.name}』`));summonUpgrades.ordinaryEvolved++;
  }
  if(a.id==='bequeath')summonUpgrades.bequeath++;
 });
 if(c.superEvolution.length){
  const p=c.superEvolutionDesign;assert(p&&p.parts.length);assert.equal(c.superEvolution[0],p.text);
  report.superDesigns[p.id]=(report.superDesigns[p.id]||0)+1;
  assert(!p.text.includes('选择'),'Super-evolution automatic effects cannot require combat selection');
  if(p.id==='formationGrowth'){
   const part=p.parts[0];assert(part.attack>=c.star+1&&part.health>=c.star+1);
   assert(!p.text.includes('随机1个其他')||p.text.includes('每个兵种'),'No isolated small stat boost as super payoff');
  }
  if(p.id==='inheritedArmy')assert(c.atoms.some(a=>a.id==='summon'&&a.token.name===p.parts[0].token));
  if(p.id==='scalingBarrage')assert(c.atoms.some(a=>a.id==='damage'));
  if(p.id==='revivalFormation')assert(p.text.includes('失去【谢幕曲】'));
  if(p.id==='evolutionChain')assert(p.text.includes('进化前随从'));
  if(['dragonSupply','woundEngine'].includes(p.id))assert.equal(c.cls,'dragon');
  if(p.id==='barrierFormation')assert.equal(c.cls,'royal');
  if(p.id==='destructionAssault')assert.equal(c.cls,'nightmare');
 }
 report.evolution+=c.evolution.length>0;report.superEvolution+=c.superEvolution.length>0;
 const text=E.toText(c);assert(!/undefined|NaN|能量点|魔力增幅|疾驰|费用/.test(text));
 structures.add(c.atoms.map(x=>[x.event,x.id,x.target,x.token?.name,x.scaling].join(':')).join('|'));
 if(!report.fixtures[c.cls]&&c.star>=4&&c.atoms.length===2)report.fixtures[c.cls]={name,text};
}
for(const theme of E.themes)assert(report.themes[theme.id]>0,theme.id+' unreachable');
for(const id of ['summon','buff','damage','grant','recruit','discount','coin','legacy','wound','revive','bequeath','evolve'])assert(report.effects[id]>0,id+' unreachable');
for(const cls of Object.keys(expected))for(let star=1;star<=6;star++){
 let found=false;for(let i=0;i<5000;i++){const h=E.header('筛选#'+i);if(E.matches(h,{cls,star})){found=true;break;}}assert(found,cls+star);
}
report.structures=structures.size;assert(structures.size>250);
assert(selfGrowth>0,'Keep meaningful self-growth outside Fanfare');report.selfGrowth=selfGrowth;
assert(summonUpgrades.automatic>0&&summonUpgrades.ordinaryEvolved>0&&summonUpgrades.bequeath>0);
report.summonUpgrades=summonUpgrades;
assert.equal(Object.keys(report.superDesigns).length,9,'Every super-evolution route should be reachable');
fs.writeFileSync(__dirname+'/illusion-validation.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,fixtures:undefined},null,2));
