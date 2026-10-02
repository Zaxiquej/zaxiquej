const S=require('./engine'),assert=require('node:assert/strict'),fs=require('node:fs');
const roles=new Set(),events=new Set(),bodies=new Set(),texts=new Set(),examples={};let custom=0,withTokens=0,temporary=0,hand=0;
let aftermath=0;
function checkTokenRules(c){
 assert.notEqual(c.archetype,'assembled-transmute');
 assert(!c.abilities.some(a=>a.ids.some(id=>['createBase','transformBound'].includes(id))));
 for(const t of c.tokens){
  assert(!['assembly-base','assembly-evolved'].includes(t.id));
  if(!t.custom||t.upgrade)continue;
  assert(t.design,'Original follower tokens must use the shared valuation');
  assert(!/选择/.test(t.text.replace('对手能力只能选择本卡牌。','')),'No manual targets in token passive effects');
  if(t.design.role==='damageCap')assert(t.health>3,'Damage cap must be meaningful');
  if(t.id==='assembly-return'){
   aftermath++;assert(t.design.parts.every(p=>p.id.startsWith('lastWords:')));
   const a=c.abilities.find(a=>a.ids.includes('deathPayload'));assert(a);
   assert(Math.abs(a.raw-S.tokenValue(t))<1e-8);
  }
 }
}
for(const name of ['获牌减费2061','疾驰降模3796','疾驰降模4178'])for(const chaos of [false,true])checkTokenRules(S.generate(name,{chaos}));
for(let i=0;i<30000;i++){
 const c=S.generate('原创附属卡'+i);if(c.tokens.length)withTokens++;
 checkTokenRules(c);
 for(const t of c.tokens.filter(t=>t.id==='custom')){
  custom++;assert(t.design&&t.design.parts.length);assert(t.attack>=1&&t.health>=1);
  assert(!t.text.includes('选择')||t.text.includes('对手能力只能选择本卡牌。'));
  assert(!/【入场曲】|【模式】/.test(t.text));
  assert(t.attack+t.health>t.cost*2);assert(S.tokenValue(t)>S.tokenValue(t,'hand'));
  const ordinary={...t,attack:Math.min(t.attack,t.cost),health:t.cost*2-Math.min(t.attack,t.cost)};assert(S.tokenValue(t)>S.tokenValue(ordinary));
  assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.011,c.name);
  assert.deepEqual(c,S.generate(c.name));
  if(t.design.temporary){temporary++;assert(t.text.includes('对手的回合结束时，破坏本卡牌。'));}
  for(const p of t.design.parts){if(p.id.includes(':'))events.add(p.id.split(':')[0]);else roles.add(p.id);examples[p.id]??=c.name;assert(p.value>0);}
  if(t.design.parts.some(p=>p.id==='intercept'))assert(t.text.includes('【守护】'));
  if(t.design.parts.some(p=>p.id==='doubleAttack'||p.id.startsWith('attack:')))assert(t.text.includes('【突进】'));
  assert(!t.design.parts.some(p=>p.id==='lastWords:grow'));
  bodies.add(`${t.cost}/${t.attack}/${t.health}`);texts.add(t.text);
  if(c.abilities.some(a=>a.text.includes(`『${t.name}』加入手牌`)))hand++;
 }
}
assert(custom>30&&custom/withTokens<.04);assert(temporary>0&&hand>10&&aftermath>0);assert.equal(roles.size,4);assert.equal(events.size,4);assert(bodies.size>15&&texts.size>35);
const report={version:S.VERSION,total:30000,custom,withTokens,share:custom/withTokens,temporary,hand,aftermath,roles:[...roles],events:[...events],bodies:bodies.size,texts:texts.size,examples};
fs.writeFileSync(__dirname+'/custom-token-validation.json',JSON.stringify(report,null,2));console.log('PASS: rare, varied modular rewards; meaningful abilities, pricing, timing and source budgets.');console.log(report);
