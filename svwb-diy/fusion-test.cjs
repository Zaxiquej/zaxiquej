const S=require('./engine'),fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const app=fs.readFileSync(__dirname+'/app.js','utf8'),ctx={};vm.runInNewContext(app.slice(app.indexOf('function displayAbilities'),app.indexOf('function cardText')),ctx);
const modes={},effects={},thresholds={},examples={},structures=new Set();let fusion=0,compound=0;
for(let i=0;i<50000;i++){
 const c=S.generate('融合重组'+i);if(!c.fusion)continue;fusion++;
 assert.deepEqual(c,S.generate(c.name));assert(c.spent+c.attack+c.health<=c.budget+.011,c.name);
 const f=c.fusion,a=c.abilities.find(a=>a.kind==='fusion');assert(a&&a.condition==='fusion');
 assert(!a.text.includes('抽取2张卡牌。若已与本卡牌【融合】，则对对手'));
 modes[f.mode]=(modes[f.mode]||0)+1;structures.add(f.mode+':'+f.effects.join('+'));
 assert.equal(ctx.displayAbilities(c)[0].text,'【融合】'+f.material);
 if(f.mode==='count'){assert(f.cap>=2&&f.multiplier>=1);assert(a.text.includes('X为与本卡牌融合的卡牌张数'));assert(a.text.includes('上限'+f.cap));}
 else {thresholds[f.threshold]=(thresholds[f.threshold]||0)+1;if(f.effects.length>1)compound++;}
 for(const id of f.effects){effects[id]=(effects[id]||0)+1;examples[id]??=c.name;if(['boost','earth','crystalHandSupply','crystalHandSummon'].includes(id))assert.equal(c.class,3);}
 for(const t of a.tokens||[]){assert(c.tokens.some(s=>s.id===t.id));assert(a.text.includes(t.name));}
 assert(a.raw>0&&a.price>0);assert(!/\$TOKEN|NaN|undefined/.test(a.text));
}
assert(fusion>500&&modes.count>100&&modes.threshold>100&&compound>20&&structures.size>20);
for(const id of ['draw','damage','buff','tokenSummon','boost'])assert(effects[id]>5,'Missing '+id);
for(const n of [1,2,3])assert(thresholds[n]>0);
fs.writeFileSync(__dirname+'/fusion-validation.json',JSON.stringify({version:S.VERSION,fusion,modes,thresholds,effects,compound,structures:structures.size,examples},null,2));console.log('PASS: 50,000 seeds; modular fusion conditions and payoffs, scaled quantities, class gates, budgets, tokens and display ordering.');console.log({fusion,modes,compound,structures:structures.size,effects,examples});
