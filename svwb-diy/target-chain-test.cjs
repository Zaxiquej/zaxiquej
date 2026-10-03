const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('./combinations'),S=require('./engine'),check=require('./assert-node-effects.cjs');
const destroy={ids:['destroy'],text:'选择对手的战场上的1个随从，破坏该随从。',raw:7,boardValue:0,tokens:[]};
const silence={...destroy,ids:['silence'],text:'选择对手的战场上的1个随从，使其失去所有能力。',raw:3.8};
const context={cls:5,rarity:3,trigger:'入场曲',effectCost:7,maxPrice:20};
const capture=C.targetFollowups(destroy,context);
assert.equal(capture.length,2);assert.equal(capture[0].raw,10.4);assert.equal(capture[1].raw,12.9);
assert.equal(C.targetFollowups(destroy,{...context,maxPrice:10.39}).length,0);
assert.equal(C.targetFollowups(destroy,{...context,maxAtoms:2}).length,1);
assert.equal(C.targetFollowups(destroy,{...context,available:id=>id!=='capturedCopy'}).length,0);
for(const cls of [0,1,2,3,4,6,7])assert.equal(C.targetFollowups(destroy,{...context,cls}).length,0);
for(const trigger of ['谢幕曲','攻击时','自己的回合结束时','交战时','自己的其他随从进入战场时'])
 assert.equal(C.targetFollowups(destroy,{...context,trigger}).length,0);
for(const rarity of [0,1])assert.equal(C.targetFollowups(destroy,{...context,rarity}).length,0);
assert.equal(C.targetFollowups(destroy,{...context,simple:true}).length,0);
const silentDamage=C.targetFollowups(silence,{...context,cls:7});
assert(silentDamage.length>1);assert.equal(C.targetFollowups(silence,{...context,cls:7,available:id=>id!=='damage'}).length,0);
assert(C.targetFollowups(silence,{...context,cls:7,trigger:'超进化时',effectCost:6}).every(v=>v.targetChain.damage>=7));
for(const v of [...capture,...silentDamage]){
 assert.equal((v.text.match(/选择/g)||[]).length,1);
 assert.equal((v.text.match(/。/g)||[]).length,1,'The reference must remain in one clause');
 assert(Math.abs(v.raw-v.components.reduce((n,p)=>n+p.raw,0))<1e-8);
 assert.equal(new Set(v.ids).size,v.ids.length);
}
const app=fs.readFileSync(__dirname+'/app.js','utf8'),ui={};
vm.runInNewContext(app.slice(app.indexOf('function displayAbilities'),app.indexOf('function cardText')),ui);
const format=v=>ui.displayAbilities({abilities:[
 {kind:'effect',trigger:'入场曲',condition:'none',ids:['draw'],text:'【入场曲】抽取1张卡牌。'},
 {...v,kind:'effect',trigger:'入场曲',condition:'none',text:'【入场曲】'+v.text}
]}).map(a=>a.text).join('\n');
assert.equal(format(capture[0]),'【入场曲】'+capture[0].text+'抽取1张卡牌。');
assert.equal(format(silentDamage[0]),'【入场曲】'+silentDamage[0].text+'抽取1张卡牌。');
const counts={cards:3000,capture:0,silentDamage:0},examples={};
// Header-only filtering avoids spending time generating irrelevant cards.
let index=0;
for(let sample=0;sample<counts.cards;sample++){
 let name,h;do{name='关联目标回归'+index++;h=S.header(name);}while(h.rarity<2||![3,5,7].includes(h.class));
 const c=S.generate(name,{chaos:sample%4===0});check(c);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.025,name+' budget');
 if(sample%500===0)assert.deepEqual(c,S.generate(name,{chaos:sample%4===0}));
 for(const a of c.abilities){
  if(!a.targetChain)continue;
  const p=a.targetChain,key=p.followupId==='capturedCopy'?'capture':'silentDamage';counts[key]++;examples[key]??=c;
  assert.equal(p.targetCount,1);assert(c.rarity>=2);
  assert(['入场曲','法术','进化时','超进化时','爆能强化','启动'].includes(a.trigger));
  assert(p.baseRaw+p.extraRaw<=a.components.reduce((sum,part)=>sum+Math.max(0,part.raw),0)+1e-8);
  assert.equal(c.class===5,key==='capture');
 }
}
assert(counts.capture>0&&counts.silentDamage>0,'Both linked structures must be reachable');
fs.writeFileSync(__dirname+'/target-chain-validation.json',JSON.stringify({version:S.VERSION,counts,examples},null,2)+'\n');
console.log({version:S.VERSION,counts});
