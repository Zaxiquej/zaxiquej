const assert=require('node:assert/strict'),fs=require('node:fs'),S=require('./engine'),R=require('./reference.json');
const checked={
  10042310:'跳费按增加最大能量点独立收费，不能与回复当前能量点混为一谈。',
  10113110:'生命变1与进化伤害是独立原子，已有前后节点配合权重。',
  10104110:'抽牌、治疗、回复能量点分别收费；效果进化不视为消耗EP触发。',
  10423310:'回复能量点并非龙族或中立专属，补入皇家；模式只支付较强分支及选择溢价。',
  10854110:'梦魇也有回复能量点；补入可跨节点重组的独立模块。',
  10803110:'补入被破坏随从的同名卡回收，和抽牌、牌库检索、亡者召还分别处理。',
  10871130:'补入创造物限定回收；有历史要求，按手牌资源估值而非立即召唤。',
  10572310:'弃牌与回收分别重组；不把回收强制绑定到成功弃牌。',
  10801120:'回复进化点本身并不复杂，解除铜卡简单效果白名单的误拦截。',
  10804120:'已有高费回复超进化点；不能仅因本体身材较小就判定亏模。',
  10664110:'已有低费护符复活，并补入独立的历史最高费用护符复活；两者分开估值。',
  10162130:'已接入历史最高费用护符复活，要求较高费用并支付独立价格；不允许护符以自己的谢幕曲循环复活。',
  10464110:'已接入自身永久无法攻击，换取有限额的持续收益与身材补偿；排除疾驰、攻击时等冲突结构。',
  10523110:'已接入攻击限制与持续召唤、治疗、伤害、增幅等独立收益组合，不绑定原卡整套效果。',
  10304120:'已接入双方可选的攻升血降原子；自动时点改随机，数值随费用变化并独立计价。',
  10224120:'已接入敌方进场的伤害、治疗、攻击锁独立组合，向敌方召唤骑士获得更高联动权重；额外触发收益与敌方身材一起估值。'
};
const counts={recoverFollower:0,artifactRecover:0,copperEP:0,pp:{}},examples={},cohorts={};
let state=494;const random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
for(let i=0;i<12000;i++){
 const cls=i%8,c=S.generate(S.randomMatchingName({class:cls},{random}));
 assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name+' budget');
 require('./assert-node-effects.cjs')(c);
 if(c.type==='follower')(cohorts[c.cost]??=[]).push(c.attack+c.health);
 for(const a of [...c.abilities.filter(a=>a.kind!=='alternate'),...c.alternateForms.flatMap(f=>f.abilities||[])]){
  for(const id of ['recoverFollower','artifactRecover'])if(a.ids.includes(id)){
   counts[id]++;examples[id]??=c.name;
   assert((id==='artifactRecover'?[7]:[0,7]).includes(c.class),c.name+' recovery class');
   assert(a.text.includes('被破坏')&&a.text.includes('加入手牌')&&a.text.includes('非公开'),c.name+' recovery semantics');
   if(c.cost<=3&&a.condition==='none'&&['入场曲','法术'].includes(a.trigger))assert(!/将随机2种与本次/.test(a.text),c.name+' cheap recovery quantity');
   if(c.type==='follower'&&c.cost===2&&a.condition==='none'&&['入场曲','谢幕曲'].includes(a.trigger))assert(c.attack+c.health<=3,c.name+' recovery body payment');
  }
  if(a.ids.includes('restoreEP')&&c.rarity===0){counts.copperEP++;examples.copperEP??=c.name;}
  if(a.ids.includes('pp')){
   counts.pp[c.class]=(counts.pp[c.class]||0)+1;examples['pp'+c.class]??=c.name;
   assert([0,2,4,5].includes(c.class));
   assert(['入场曲','进化时','超进化时','法术','爆能强化'].includes(a.trigger),c.name+' PP loop safety');
  }
 }
}
for(const key of ['recoverFollower','artifactRecover','copperEP'])assert(counts[key]>0,'Unreachable '+key);
for(const cls of [0,2,4,5])assert(counts.pp[cls]>0,'Missing PP class '+cls);
for(const name of Object.values(examples))assert.deepEqual(S.generate(name),S.generate(name));
const median=a=>a.slice().sort((a,b)=>a-b)[Math.floor(a.length/2)];
const comparison=Array.from({length:10},(_,i)=>{
 const cost=i+1,official=R.cards.filter(c=>!c.token&&c.type===1&&c.cost===cost),generated=cohorts[cost]||[];
 return {cost,officialCount:official.length,generatedCount:generated.length,officialMedianBody:median(official.map(c=>c.attack+c.health)),generatedMedianBody:median(generated)};
});
const cards=Object.entries(checked).map(([id,assessment])=>{const c=R.cards.find(c=>c.id===+id);assert(c);return {...c,assessment,url:`https://shadowverse-wb.com/chs/deck/cardslist/card/?card_id=${id}`};});
const report={version:S.VERSION,snapshot:R.retrieved,source:R.source,seeds:12000,counts,examples,comparison,cards,
 limitation:'官方网页已检索，部分动态页面不返回卡文，数值与原文使用2026-09-18官方接口快照。此处16张人工结构核对，非904张完整语义审核。费用分组身材中位数仅用于发现异常，不控制效果、稀有度、职业，不能据此断言平衡。已知缺口如实保留；不复制整张官方设计。'};
fs.writeFileSync(__dirname+'/official-comparison.json',JSON.stringify(report,null,2));
fs.writeFileSync(__dirname+'/official-comparison.md',`# 官方结构对照 v${S.VERSION}\n\n${report.limitation}\n\n## 已核对结构\n\n| 官方卡 | 费用／身材 | 核对结论 |\n|---|---|---|\n`+cards.map(c=>`| [${c.name}](${c.url}) | ${c.cost}${c.type===1?' / '+c.attack+'/'+c.health:''} | ${c.assessment} |`).join('\n')+'\n\n## 费用分组身材（攻击＋生命）\n\n| 费用 | 官方样本 | 生成样本 | 官方中位数 | 生成中位数 |\n|---|---|---|---|---|\n'+comparison.map(c=>`| ${c.cost} | ${c.officialCount} | ${c.generatedCount} | ${c.officialMedianBody} | ${c.generatedMedianBody} |`).join('\n')+'\n');
console.log('PASS',counts,examples,comparison);
