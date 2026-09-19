// Inventory, not a semantic proof: every original clause remains visible for review.
const fs=require('node:fs'),ref=require('./reference.json'),engine=require('./engine');
const includeGold=process.argv.includes('--all');
const modules=[
 ['stationary',/^无法攻击随从或主战者。/m,'新增攻击限制换持续收益模块，排除主动攻击组件并封顶补偿'],
 ['mixedStats',/使其\+\d+\/-\d+/,'新增双方可选的攻升血降原子；自动触发只能随机'],
 ['enemyEntry',/对手的随从进入战场时/,'新增皇家敌方进场反应与敌方骑士供给；按重复收益和敌方场面共同收费'],
 ['amuletReviveHighest',/被破坏的原始费用最大的自己的护符/,'新增历史最高费用护符复活，包括可实际生成的谢幕曲；不允许护符自身谢幕复活循环'],
 ['boardTransform',/战场上[^。\n]*变身/,'新增己方／敌方／双方可选的单体变身，目标token独立抽取并估值；主动指定、自动随机；不代表群体变身或任意牌组复制已覆盖'],
 ['drawCostLuck',/自己抽到费用为/,'主教抽牌费用集合／奇偶／阈值／区间与命中、未命中收益独立重组；未命中可为空、己方收益或负面，排除立即抽牌回环'],
 ['handCostLuck',/费用相同/,'梦魇洗回重抽后检查同费用张数或费用种类，独立抽取阈值、重复次数和收益'],
 ['experiment',/沉溺的实验体/,'实验体原卡、独立供给／召唤／强化／赋予词条、进场历史、融合时付费召唤与进场纹章'],
 ['abilityDestructionImmune',/不会被能力破坏/,'普通随从独立常驻模块'],
 ['combatDestroy',/【交战时】破坏交战对手/,'独立交战模块，重复收益计价'],
 ['tripleAttack',/1回合可以攻击3次/,'部分：7费以上虹卡超进化赋予；暂不与疾驰组合'],
 ['damageCap',/受到的超过3的伤害变为3/,'普通随从独立常驻模块'],
 ['reduceDamage',/受到的伤害-\d/,'普通随从独立常驻模块'],
 ['doubleAttack',/1回合可以攻击2次/,'独立常驻模块'],
 ['spellboostCombat',/【交战时】使自己的所有手牌发动\d次魔力增幅/,'独立时点与收益组合']
];
const gaps=[
 ['奥义／解放奥义',/【(?:解放)?奥义/,'已接入10／15奥义槽条件与独立收益；另有奥义槽增量效果'],
 ['牌组整体改写',/牌组[^。\n]*(?:替换|变更|变身|变为)|将自己的牌组|牌组中的所有.*费用/,'整副牌组替换已按用户要求关闭；巫师牌组随从减费保留'],
 ['手牌批量变身',/手牌[^。\n]*(?:变身|替换)/,'已接入妖精低费手牌随机变为蔷薇之闪击、巫师随机手牌法术变为绝尽的伪证；不代表任意变身的完整支持'],
 ['敌方纹章',/对手获得『纹章/,'已接入有限期限的独立时点／负面收益组合，持有者为对手'],
 ['融合发生时',/(?:进行了?【融合】|与本卡牌【融合】时)/,'部分：皇家使用／融合财宝、巫师融合卡牌时付费召唤实验体已接入；不是所有融合事件的完整支持'],
 ['被舍弃时',/被舍弃时/,'已接入独立自动收益、法术减费返还和按最终本体估值的弃后召唤自身'],
 ['永久追加能力',/永久|获得「[^」]*(?:时|每)/,'需逐条核对；现有赋予能力不能代表永久信仰改写'],
 ['无重复效果轮转',/未发动|尚未发动|依序|依次/,'已接入三项独立收益的无放回随机轮转，全部发动后停止；未覆盖依序轮转及重置'],
 ['忽略守护',/无视【守护】/,'已接入龙族高费金虹的独立常驻能力'],
 ['消除能力',/失去所有能力|消除.*能力/,'已接入巫师／超越者的独立效果，主动指定或自动随机'],
 ['纹章移除／延长',/(?:消失|破坏)[^。\n]*纹章|纹章[^。\n]*(?:消失|吟唱.*\+)/,'已接入中立高费全纹章消失，以及龙族／主教已有非谢幕有限纹章延长；未覆盖任意敌方纹章指定移除'],
 ['数值历史计数',/X为|X是|X等于/,'部分：有历史门槛，尚无通用任意历史数值表达式']
];
const knownTokens=new Set([...engine.TOKENS,...engine.SUPPORT_CARDS,...engine.RELATED_CARDS].map(c=>c.name));
const officialTokens=new Set(ref.cards.filter(c=>c.token).map(c=>c.name));
const cards=ref.cards.filter(c=>!c.token&&c.rarity>=(includeGold?3:4)).map(c=>{
 const linked=ref.specialEffects.filter(e=>e.sourceCardIds.includes(c.id));
 const faces=[...new Set([c.text,c.evolvedText].filter(Boolean))];
 const text=[...faces,...linked.map(e=>e.text)].join('\n');
 const missingTokens=[...new Set([...text.matchAll(/『([^』]+)』/g)].map(m=>m[1]).filter(n=>officialTokens.has(n)&&!knownTokens.has(n)))];
 return {id:c.id,name:c.name,cost:c.cost,rarity:c.rarity,url:`https://shadowverse-wb.com/chs/deck/cardslist/card/?card_id=${c.id}`,
  sourceTexts:faces,linkedSpecialEffects:linked,
  clauses:text.split(/\n|(?<=。)/u).filter(Boolean),
  identifiedModules:modules.filter(([,re])=>re.test(text)).map(([id,,scope])=>({id,scope})),
  reviewFlags:gaps.filter(([,re])=>re.test(text)).map(([family,,scope])=>({family,scope})),missingTokens,
  status:c.id===10654110?'四个主要组件已逐条核对；随机组合不保证复现原卡身材和整套效果':'已扫描原文与关联纹章／信仰；不声明整卡完整支持'};
});
const report={version:engine.VERSION,source:ref.source,retrieved:ref.retrieved,count:cards.length,
 note:`冻结快照的${cards.length}张非token${includeGold?'金／虹':'虹'}卡，不是实时全量保证。原文分句仅用于检查，绝不直接作为随机池。正则只能标记候选缺口，未命中也不能认定已覆盖。`,
 manuallyCompared:[10444110,10464120,10544110,10143110,10204110,10654110,10754120,10804110,10433110,10474120,10113110,10364110,10574110,10744120,10453310,10944110,10444120,10114120,10334120,10974110,10273110],
 inspectedExample:{id:10654110,components:['灵气','不会被能力破坏','交战时破坏交战对手','超进化时获得三次攻击']},
 gapFamilies:gaps.map(([family,,scope])=>({family,scope,cards:cards.filter(c=>c.reviewFlags.some(f=>f.family===family)).map(c=>({id:c.id,name:c.name}))})),cards};
fs.writeFileSync(__dirname+(includeGold?'/high-rarity-audit.json':'/legendary-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({count:cards.length,linkedSpecialEffects:cards.reduce((n,c)=>n+c.linkedSpecialEffects.length,0),cardsWithMissingNamedTokens:cards.filter(c=>c.missingTokens.length).length,reviewFlags:report.gapFamilies.map(f=>({family:f.family,count:f.cards.length}))},null,2));
