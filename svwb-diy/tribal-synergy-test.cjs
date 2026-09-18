const fs=require('node:fs'),assert=require('node:assert/strict'),{createRequire}=require('node:module');
const path=require.resolve('./engine'),source=fs.readFileSync(path,'utf8'),moduleBaseline={exports:{}};
new Function('require','module','exports',source.replace('const TRIBAL_SYNERGY = 3;','const TRIBAL_SYNERGY = 1;'))(createRequire(path),moduleBaseline,moduleBaseline.exports);
const active=require('./engine'),baseline=moduleBaseline.exports,stats={baseline:{eligible:0,paired:0},active:{eligible:0,paired:0}},examples={},tokens=new Set();let shared=0,before=0,after=0,aoe=0;
const consumer=c=>c.abilities.some(a=>a.ids.some(id=>['tribeEngine','tribeBuff','tribeEvolve','tribeCountDamage'].includes(id)))||c.emblems.some(e=>['tribeEnter','tribeAttack'].includes(e.eventId));
const producer=c=>c.abilities.some(a=>a.ids.some(id=>['summon','tokenSummon'].includes(id))&&a.tokens?.some(t=>t.tribe===c.tribalTheme)&&!a.trigger.includes('谢幕')&&!a.trigger.includes('被舍弃'));
for(let i=0;i<16000;i++){
 const name='种族配合'+i,cards={baseline:baseline.generate(name),active:active.generate(name)};
 for(const [key,c] of Object.entries(cards)){
  assert((c.type==='follower'?c.attack+c.health:0)+c.spent<=c.budget+.02,c.name);assert(c.abilities.length<=5);
  if(!consumer(c))continue;stats[key].eligible++;
  if(producer(c)){stats[key].paired++;if(key==='active'){examples[c.tribalTheme]??=c.name;for(const a of c.abilities.filter(a=>a.ids.some(id=>['summon','tokenSummon'].includes(id))))for(const t of a.tokens||[])if(t.tribe===c.tribalTheme)tokens.add(t.name);}}
  if(key==='active'&&c.abilities.some(a=>a.tribeEffect==='aoe')){aoe++;assert(c.abilities.find(a=>a.tribeEffect==='aoe').price>=8);}
 }
 if(consumer(cards.baseline)&&consumer(cards.active)){shared++;before+=Number(producer(cards.baseline));after+=Number(producer(cards.active));}
}
assert(shared>100);assert(after>before*1.15,JSON.stringify({before,after}));assert(after<shared,'A synergy remains a preference, not a fixed package');
assert(aoe>0);for(const tribe of ['士兵','海洋','巨像','亡者'])assert(examples[tribe]);
assert(tokens.has('乙姬近卫队'));assert(tokens.has('大海虎鲸'));
console.log(JSON.stringify({stats,shared,before,after,aoe,examples,tokens:[...tokens]},null,2));
