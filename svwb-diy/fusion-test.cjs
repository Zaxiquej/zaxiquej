const S=require('./engine'),fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const app=fs.readFileSync(__dirname+'/app.js','utf8'),ctx={};vm.runInNewContext(app.slice(app.indexOf('function displayAbilities'),app.indexOf('function cardText')),ctx);
const modes={},effects={},thresholds={},examples={},structures=new Set();let fusion=0,compound=0;
let generated=0;
for(let i=0;i<18000;i++){
 const name='融合重组'+i,h=S.header(name);if(h.type!=='follower'||h.rarity<1||h.cost<3)continue;
 const c=S.generate(name);generated++;if(!c.fusion)continue;fusion++;
 assert.deepEqual(c,S.generate(c.name));assert(c.spent+c.attack+c.health<=c.budget+.011,c.name);
 const f=c.fusion,a=c.abilities.find(a=>a.kind==='fusion');assert(a&&(f.mode==='event'?['none','fusionPP'].includes(a.condition):a.condition==='fusion'));
 assert(!a.text.includes('抽取2张卡牌。若已与本卡牌【融合】，则对对手'));
 modes[f.mode]=(modes[f.mode]||0)+1;structures.add(f.mode+':'+f.effects.join('+'));
 assert.equal(ctx.displayAbilities(c)[0].text,'【融合】'+f.material);
 if(f.mode==='count'){
  assert(f.cap>=2&&f.multiplier>=1);assert(a.text.includes('X为与本卡牌融合的卡牌张数'));assert(a.text.includes('上限'+f.cap));
  assert(f.curve.firstRaw>=3.2&&f.curve.materials>=2);assert.equal(f.curve.maxRaw,a.raw);
  assert.equal(f.curve.first,Math.min(f.cap,f.multiplier+f.offset));
  assert.equal(f.curve.materials,Math.ceil((f.cap-f.offset)/f.multiplier));
  assert(f.curve.maxRaw>=f.curve.materials*2.6);
  if(f.effects.some(id=>['damage','heal','splitDamage'].includes(id))){
   assert(f.multiplier>=3);assert(f.curve.maxRaw-f.curve.firstRaw>=(f.curve.materials-1)*2.2);
   const previous=(f.curve.materials-1)*f.multiplier+f.offset;
   const priorRaw=f.effects.includes('heal')?S.healValue(c.cost,previous):previous*(f.effects.includes('damage')?1.25:1.1);
   assert(f.curve.maxRaw-priorRaw>=2.2,'The last material must not buy a token +1 at the cap');
  }
 }
 else if(f.mode==='threshold'){thresholds[f.threshold]=(thresholds[f.threshold]||0)+1;if(f.effects.length>1)compound++;assert(a.raw>=f.minimum&&f.minimum>=f.threshold*2.6);}
 else {assert.equal(f.mode,'event');assert(a.fusionEvent);assert([0,1,2].includes(f.ppCost));}
 for(const id of f.effects){effects[id]=(effects[id]||0)+1;examples[id]??=c.name;if(['boost','earth','crystalHandSupply','crystalHandSummon'].includes(id))assert.equal(c.class,3);}
 for(const t of a.tokens||[]){assert(c.tokens.some(s=>s.id===t.id));assert(a.text.includes(t.name));}
 assert(a.raw>0&&a.price>0);assert(!/\$TOKEN|NaN|undefined/.test(a.text));
 if(f.mode!=='event'){
  assert(Math.abs(a.price-Math.max(.8,a.raw*f.factor-f.materialCredit))<1e-8);
  assert(a.raw<=f.limit+1e-8,c.name+' fusion exceeds payoff allowance');
  assert((a.boardValue||0)<=f.boardLimit+1e-8,c.name+' fusion bypasses board limit');
  assert(f.materialCredit<=1.8&&f.factor>=.72);
  if(c.cost<=3){assert(f.factor>=.9);assert((a.boardValue||0)<=c.cost*2+1e-8);}
 }
}
assert(fusion>100&&modes.count>20&&modes.threshold>40&&compound>5&&structures.size>20);
for(const id of ['draw','damage','buff','tokenSummon','boost','aoe'])assert(effects[id]>0,'Missing '+id);
for(const n of [1,2,3])assert(thresholds[n]>0);
fs.writeFileSync(__dirname+'/fusion-validation.json',JSON.stringify({version:S.VERSION,headers:18000,generated,fusion,modes,thresholds,effects,compound,structures:structures.size,examples},null,2));console.log('PASS: fusion materials buy useful initial and scaling payoffs; class gates, full payoff budgets, tokens and display ordering.');console.log({generated,fusion,modes,compound,structures:structures.size,effects,examples});
