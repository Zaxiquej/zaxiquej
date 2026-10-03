const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),S=require('./engine'),check=require('./assert-node-effects.cjs');
const app=fs.readFileSync(__dirname+'/app.js','utf8'),ui={};vm.runInNewContext(app.slice(app.indexOf('function displayAbilities'),app.indexOf('function cardText')),ui);
const xDefinition={kind:'static',trigger:'魔力增幅时',ids:['spellboostCounter'],text:'X起始为2。\n【魔力增幅时】使本卡牌的X+1。'},xDamage={kind:'effect',trigger:'法术',ids:['damage'],text:'对一个随从造成X点伤害。'};
assert.equal(ui.displayAbilities({abilities:[xDamage,xDefinition]})[0].text,xDefinition.text);
const counts={cards:6000,counter:0,counterSingle:0,counterSplit:0,reserved:0,reservationReturned:0,bodyReallocated:0,bronzeReplay:0,super:0};
const examples={};
for(let i=0;i<counts.cards;i++){
 const opts={chaos:i%4===0},c=S.generate('纵向设计回归'+i,opts);check(c);
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.025,c.name+' budget');
 if(c.type==='follower')assert(Number.isInteger(c.attack)&&Number.isInteger(c.health)&&c.attack>=0&&c.health>0);
 if(i%500===0)assert.deepEqual(c,S.generate(c.name,opts));
 const reserve=c.effectBodyReservation;
 if(reserve){counts.reserved++;assert(Number.isInteger(reserve.offered)&&Number.isInteger(reserve.restored));assert(reserve.restored>=0&&reserve.restored<=reserve.offered);if(reserve.restored)counts.reservationReturned++;}
 const trade=c.bodyCoreReallocation;
 if(trade){counts.bodyReallocated++;assert(trade.lost>=1&&trade.rawAfter>trade.rawBefore);assert(c.abilities.some(a=>a.trigger==='入场曲'&&a.ids.some(id=>trade.ids.includes(id))));examples.body??=c.name;}
 if(c.rarity===0&&c.abilities.some(a=>a.ids.includes('replay'))){counts.bronzeReplay++;examples.bronzeReplay??=c.name;assert(c.abilities.some(a=>a.trigger==='入场曲'));}
 if(c.abilities.some(a=>a.trigger==='超进化时'))counts.super++;
 if(c.spellboostCounter){
   counts.counter++;const p=c.spellboostCounter;assert.equal(c.class,3);assert.equal(c.type,'spell');assert(c.cost>=1&&c.cost<=5);assert.equal(p.increment,1);assert(c.cost>=3||c.rarity<=1,'A cheap gold/legendary must not consist only of a basic X-damage counter');
   const growth=c.abilities.filter(a=>a.ids.includes('spellboostCounter')),payoff=c.abilities.filter(a=>a.scalesWith==='spellboostCounter');
   assert.equal(growth.length,1);assert.equal(payoff.length,1);assert(growth[0].text.includes('X起始为'+p.initial));assert(!/主战者/.test(payoff[0].text));
   assert(!c.progressTransform&&!c.handTrigger);assert(c.cost<3||c.spent>=c.cost*2);
   counts[p.effectId==='damage'?'counterSingle':'counterSplit']++;examples[p.effectId]??=c.name;
 }
}
for(const key of ['counter','counterSingle','counterSplit','reserved','reservationReturned','bodyReallocated','bronzeReplay'])assert(counts[key]>0,key+' unreachable');
const before=require('./design-study-before.json'),after=require('./design-study-'+(process.argv[2]||'after')+'.json');assert.equal(after.version,S.VERSION);
const rate=(r,g,f)=>(r.generated[g].features[f]||0)/r.generated[g].n;
assert(rate(after,'follower:rarity1','fusion')<rate(before,'follower:rarity1','fusion')*.6);
assert(rate(after,'follower:rarity2','emblem')<rate(before,'follower:rarity2','emblem'));
assert(rate(after,'follower:rarity3','super')>rate(before,'follower:rarity3','super'));
assert(rate(after,'spell:class3','boost')>rate(before,'spell:class3','boost'));
assert(rate(after,'amulet','death')<rate(before,'amulet','death'));
const report={version:S.VERSION,counts,examples};fs.writeFileSync(__dirname+'/design-study-validation.json',JSON.stringify(report,null,2)+'\n');console.log('PASS',report);
