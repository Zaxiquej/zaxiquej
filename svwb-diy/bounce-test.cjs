const S=require('./engine'),assert=require('node:assert/strict'),fs=require('node:fs');
let elves=0,bounce=0,cheap=0,pure=0,automatic=0,spell=0,mixed=0;const examples={};
for(let i=0;i<20000;i++){
 const c=S.generate('回手核查'+i);if(c.class===1)elves++;
 const found=c.abilities.filter(a=>a.ids.includes('bounce'));
 if(found.length){bounce++;if(c.cost<=3)cheap++;assert.equal(c.class,1);assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.011);}
 for(const a of found){
  assert(a.text.includes('返回手牌'));assert.notEqual(a.trigger,'谢幕曲');
  const manual=['入场曲','进化时','超进化时','爆能强化','法术','启动'].includes(a.trigger);
  if(!manual){automatic++;assert(a.text.includes('随机1张')&&!a.text.includes('选择')&&!a.text.includes('【模式】'));}
  if(c.type==='spell'){spell++;assert(!a.text.includes('1张其他卡牌'));}
  else assert(a.text.includes('1张其他卡牌'));
  if(a.ids.length===1){pure++;assert(!a.text.includes('抽取'));assert.equal(a.raw,1);examples.pure??=c.name;}
  else{mixed++;examples.mixed??=c.name;}
 }
}
assert(bounce>31&&bounce/elves<.08);assert(cheap>15&&pure>10&&automatic>0&&spell>0&&mixed>0);
const report={version:S.VERSION,elves,bounce,rate:bounce/elves,cheap,pure,automatic,spell,mixed,examples};fs.writeFileSync(__dirname+'/bounce-validation.json',JSON.stringify(report,null,2));console.log('PASS: accessible rare Forest bounce, independent payoff, manual/automatic targets, spell wording, source budgets.');console.log(report);
