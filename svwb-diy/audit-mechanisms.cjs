// Counts come from the frozen official response, coverage labels are manual
// implementation assessments: mentioning a keyword is not proof of coverage.
const fs=require('node:fs'),d=require('./reference.json');
const cards=d.cards.filter(c=>!c.token),counts={};
for(const c of cards)for(const name of new Set([...c.text.matchAll(/【([^】\d]+)(?:\s*\d+)?】/g)].map(m=>m[1].trim()))){
 (counts[name]??=[]).push({id:c.id,name:c.name});
}
const supported=['入场曲','谢幕曲','进化时','超进化时','爆能强化','启动','攻击时','交战时','吟唱','守护','突进','疾驰','毁灭','虹吸','潜行','屏障','威慑','灵气','模式','连击','土之秘术','土之印','魔力增幅时','觉醒','唤灵','亡者召还','融合','协作','瞬念召唤'];
const families=[
 ['本局进化次数',/本次对战中自己的随从的进化次数/,'新增：独立条件模块；收益从通用池组合'],
 ['回复进化点',/回复自己\d+点进化点/,'新增：入场／法术／爆能收益；不放入可循环被动'],
 ['回复超进化点',/回复自己\d+点超进化点/,'新增：高费金虹的稀有收益'],
 ['累计使用原始费用种类',/原始费用包含1到8/,'部分：用于瞬念召唤门槛'],
 ['费用发生变化',/费用不为|费用发生变化/,'已有：手牌加费、手牌强化、费用变化条件／事件'],
 ['受伤幸存',/受到伤害且没被破坏/,'已有：龙族受伤幸存事件及自身伤害促成'],
 ['牌组整体替换',/牌组.*替换|牌组.*变更|牌组.*变身/,'待专项设计；不声称已有完整支持']
].map(([name,re,status])=>({name,status,cards:cards.filter(c=>re.test(c.text)).map(c=>({id:c.id,name:c.name}))}));
const report={version:require('./engine').VERSION,source:d.source,retrieved:d.retrieved,nonTokenCards:cards.length,
 note:'仅扫描快照的卡文，不等于涵盖后续新卡或所有自然语言机制；已接入指有可组合模块，不等于复现每张官方卡。奥义／解放奥义尚未接入，需核对完整 WB 规则后再设计预算。',
 keywords:Object.entries(counts).map(([name,list])=>({name,count:list.length,status:supported.includes(name)?'已接入模块':'待核对／未接入',cards:list})),families};
fs.writeFileSync(__dirname+'/mechanism-audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({nonTokenCards:cards.length,keywords:report.keywords.map(({name,count,status})=>({name,count,status})),families:families.map(({name,status,cards})=>({name,status,count:cards.length}))},null,2));
