const S=require('./engine'),assert=require('node:assert/strict'),fs=require('node:fs');
const roles=new Set(),events=new Set(),bodies=new Set(),texts=new Set(),examples={};let custom=0,withTokens=0,temporary=0,hand=0;
for(let i=0;i<30000;i++){
 const c=S.generate('原创附属卡'+i);if(c.tokens.length)withTokens++;
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
assert(custom>30&&custom/withTokens<.04);assert(temporary>0&&hand>10);assert.equal(roles.size,4);assert.equal(events.size,4);assert(bodies.size>15&&texts.size>35);
const report={version:S.VERSION,total:30000,custom,withTokens,share:custom/withTokens,temporary,hand,roles:[...roles],events:[...events],bodies:bodies.size,texts:texts.size,examples};
fs.writeFileSync(__dirname+'/custom-token-validation.json',JSON.stringify(report,null,2));console.log('PASS: rare, varied modular rewards; meaningful abilities, pricing, timing and source budgets.');console.log(report);
