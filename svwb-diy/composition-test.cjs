const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),S=require('./engine');
const code=fs.readFileSync(__dirname+'/app.js','utf8'),ctx={};vm.runInNewContext(code.slice(code.indexOf('function displayAbilities'),code.indexOf('function cardText')),ctx);
for(const trigger of ['入场曲','进化时','超进化时']){
 const mode={trigger,kind:'mode',text:`【${trigger}】【模式】选择1个能力发动。\n（1）抽取1张卡牌。\n（2）回复2点生命值。`};
 const c={abilities:[{trigger:'魔力增幅时',text:'【魔力增幅时】使本卡牌的费用-1。'},{trigger,text:`【${trigger}】召唤1个『守护者巨像』。`},mode,{trigger,text:`【${trigger}】使自己的战场上的土之印+1。使自己的所有手牌发动2次魔力增幅。`},{trigger,text:`【${trigger}】选择对手的战场上的1个随从，对其造成3点伤害。`}]};
 const snapshot=JSON.stringify(c),display=ctx.displayAbilities(c),matching=display.filter(a=>a.trigger===trigger);
 assert.equal(matching.length,2);assert.equal(matching.find(a=>a.kind==='mode').text,mode.text);
 const merged=matching.find(a=>a.kind!=='mode');assert(merged.text.startsWith(`【${trigger}】选择对手`));assert(merged.text.includes('土之印+1')&&merged.text.includes('发动2次魔力增幅'));
 assert.equal((merged.text.match(new RegExp(`【${trigger}】`,'g'))||[]).length,1);assert.equal(JSON.stringify(c),snapshot);
}
const seen={earthOnly:0,boostOnly:0,together:0,otherPairs:0},partners=new Set(),examples={};
for(const trigger of ['入场曲','进化时','超进化时']){
 const p=`【${trigger}】`;
 const awakened={trigger,condition:'awakening',text:p+'若为【觉醒】，则若本随从为进化前，则本随从进化。'};
 const discard={trigger,condition:'discard',text:p+'随机舍弃自己的1张手牌。若以此舍弃了1张卡牌，则抽取2张卡牌。'};
 const free={trigger,condition:'none',text:p+'本随从+1/+1。'};
 const draw={trigger,condition:'none',text:p+'抽取1张卡牌。'};
 const c={abilities:[awakened,discard,free,draw]},snapshot=JSON.stringify(c),display=ctx.displayAbilities(c);
 assert.equal(display.length,3);assert(display.some(a=>a.text===awakened.text));assert(display.some(a=>a.text===discard.text));
 assert(display.some(a=>a.text===p+'本随从+1/+1。抽取1张卡牌。'));assert.equal(JSON.stringify(c),snapshot);
 // Text-only conditions and embedded payment clauses also keep their own label.
 const target={trigger,text:p+'若自己的墓场为5或以上，则选择对手的战场上的1个随从，破坏该随从。'};
 const sorted=ctx.displayAbilities({abilities:[free,target,{...discard,condition:'none'}]});
 assert.equal(sorted.length,3);assert.equal(sorted[0].text,target.text);
 assert(sorted.every(a=>!a.text.includes('\n')));
}
for(const trigger of ['入场曲','进化时','超进化时']){
 const prefix=`【${trigger}】`,target='选择对手的战场上的1个随从，对其造成X点伤害。X为3。';
 const c={abilities:[{trigger,text:prefix+'抽取1张卡牌。'+target},{trigger,text:prefix+'选择自己的战场上的1个随从，使其+1/+1。'}]};
 const snapshot=JSON.stringify(c),text=ctx.displayAbilities(c)[0].text.replaceAll('\n','');
 assert.equal(text,prefix+target+'选择自己的战场上的1个随从，使其+1/+1。抽取1张卡牌。');assert.equal(JSON.stringify(c),snapshot);
 const condition='若自己的主战者的生命值为10或以下，则';
 const scoped=ctx.displayAbilities({abilities:[{trigger,text:prefix+condition+'抽取1张卡牌。'+target}]})[0].text.replaceAll('\n','');
 assert.equal(scoped,prefix+condition+target+'抽取1张卡牌。');
 const quoted=ctx.displayAbilities({abilities:[{trigger,text:prefix+'召唤1个『测试。随从』。'+target}]})[0].text.replaceAll('\n','');
 assert.equal(quoted,prefix+target+'召唤1个『测试。随从』。');
}
for(let i=0;i<30000;i++){
 const c=S.generate('效果拆分'+i);
 for(const a of c.abilities){
  if(!a.components)continue;
  assert(Math.abs(a.components.reduce((s,e)=>s+e.raw,0)-a.raw)<1e-8,'Every component must be included in the price');
  const earth=a.components.find(e=>e.id==='earth'),boost=a.components.find(e=>e.id==='boost');
  if(earth){assert.equal(c.class,3);assert(!earth.text.includes('魔力增幅'));assert(a.ids.includes('earth'));}
  if(boost){assert.equal(c.class,3);assert(!boost.text.includes('土之印'));assert(a.ids.includes('boost'));}
  if(earth||boost){
   const key=earth&&boost?'together':earth?'earthOnly':'boostOnly';seen[key]++;examples[key]??=c.name;
   for(const e of a.components)if(e.id&&e.id!=='earth'&&e.id!=='boost'){seen.otherPairs++;partners.add(e.id);}
  }
 }
}
assert(seen.earthOnly>0&&seen.boostOnly>0&&seen.together>0&&partners.size>=3);
const report={version:S.VERSION,seen,partners:[...partners],examples};fs.writeFileSync(__dirname+'/composition-validation.json',JSON.stringify(report,null,2));console.log('PASS: shared timing labels, separate modes, targeting first, independent earth/boost atoms, complete component pricing and varied partners.');console.log(report);
