const S=require('./engine'),R=require('./reference.json'),assert=require('node:assert/strict'),fs=require('node:fs');
const tribes={2:'士兵',3:'巨像',4:'海洋',5:'亡者'},byClass={},coverage={},examples={},crestEffects=new Set();let total=0,related=0;
for(const t of S.TOKENS.filter(t=>t.tribe))assert(R.cards.find(c=>c.id===t.id).tribes.includes(t.tribeId));
assert(!S.TOKENS.find(t=>t.name==='天晶魔手').tribe);
for(let i=0;i<40000;i++){
 const c=S.generate('种族联动'+i);total++;let hit=false;
 for(const a of c.abilities){
  if(!a.ids.some(id=>id.startsWith('tribe')))continue;hit=true;
  assert.equal(c.tribalTheme,tribes[c.class]);assert(a.text.includes(c.tribalTheme+'·随从')||a.ids.includes('tribeSupply')&&a.tokens.some(t=>t.tribe===c.tribalTheme&&a.text.includes(t.name)));assert(!a.text.includes('$TRIBE'));
  for(const id of a.ids.filter(id=>id.startsWith('tribe'))){coverage[id]=(coverage[id]||0)+1;examples[id]??=c.name;}
  if(a.trigger==='谢幕曲')assert(!a.text.includes('选择'));
 }
 for(const e of c.emblems.filter(e=>['tribeEnter','tribeAttack'].includes(e.eventId))){hit=true;assert.equal(c.tribalTheme,tribes[c.class]);assert(e.text.includes(c.tribalTheme+'·随从'));if(e.eventId==='tribeEnter')assert(!e.effects.some(p=>p.produces.includes('enter')));e.effects.forEach(p=>crestEffects.add(p.id));coverage[e.eventId]=(coverage[e.eventId]||0)+1;examples[e.eventId]??=c.name;}
 if(hit){related++;byClass[c.class]=(byClass[c.class]||0)+1;assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.011,c.name);}
}
for(const id of ['tribeEngine','tribeSupply','tribeBuff','tribeEvolve','tribeCountDamage','tribeEnter','tribeAttack'])assert(coverage[id]>0,id);
assert(Object.keys(byClass).length===4&&related/total<.06&&crestEffects.size>=4);
const report={version:S.VERSION,total,related,byClass,coverage,crestEffects:[...crestEffects],examples};fs.writeFileSync(__dirname+'/tribal-validation.json',JSON.stringify(report,null,2));console.log('PASS: official token tribes, rare class-specific tribal effects, modular crest payoffs, loop guards and budgets.');console.log(report);
