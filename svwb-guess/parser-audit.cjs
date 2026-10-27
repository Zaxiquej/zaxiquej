const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('./engine.js'),S=require('./semantics.js');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/data.js','utf8'),ctx);
const cards=JSON.parse(JSON.stringify(ctx.window.SVWB_GUESS_DATA.cards));
const byName=new Map(cards.map(c=>[c.name.trim(),c])),parsed=new Map(cards.map(c=>[c.id,S.extract(c)]));
const get=name=>{assert(byName.has(name),name);return byName.get(name);};
const effects=name=>parsed.get(get(name).id);
const has=(name,action)=>assert(effects(name).some(e=>e.action===action),`${name}: missing ${action}`);
const lacks=(name,action)=>assert(!effects(name).some(e=>e.action===action),`${name}: false ${action}`);
const keys=name=>[...E.features(get(name)).keys()];
for(const [name,action] of [
  ['混沌赤焰','分配伤害'],['利牙','分配伤害'],['无尽旅途·蕾娜','获得进化点'],['高洁的黑翼·奥莉薇','获得超进化点'],
  ['亲爱的搭档·碧','进化'],['伊甸之猴','进化'],['平平无奇的女孩·梅格','超进化'],['逆向变化','混合身材'],
  ['驱逐的死矢','减身材'],['彩虹奇迹','魔力增幅'],['流浪兽人','增加连击'],['大地之魔片','增加土之印'],
  ['蝙蝠','虹吸'],['心灵屠戮者·菲亚','毁灭'],['心灵屠戮者·菲亚','变身'],['宏大的回归','攻击次数'],
  ['阿斯塔罗特的宣判','生命上限设定'],['绚丽凤凰·小凤','费用减半'],['终极之罪·深渊之主','替换牌组'],
  ['雪人觉醒','生命设定'],['超越次元','回费'],['精神武艺·迦尔拉','召唤'],['水镜的信赖','召唤']
])has(name,action);
lacks('梅格的挚友·玛丽亲','超进化');
lacks('煌枪魔兔·萨莉沙','破坏');lacks('煌枪魔兔·萨莉沙','守护');
lacks('屈辱流放','毁灭');lacks('侦探的放大镜','守护');has('侦探的放大镜','失去关键词');
assert(!keys('奏绝的显现·莉洁纳').includes('作用:破坏'),'Negated destruction must also be absent from exact features');
assert(!keys('屈辱流放').includes('能力:毁灭'));
assert(!keys('彩虹奇迹').includes('时点:魔力增幅时'),'A searched-for trigger is not this spell’s own trigger');
assert(!keys('神圣狮鹫').includes('时点:启动'),'Triggering when another amulet activates is not an activated ability');
assert(effects('神圣狮鹫').find(e=>e.action==='疾驰').event.includes('启动'));
assert.equal(effects('混沌赤焰').find(e=>e.action==='分配伤害').timing,'使用时');
assert.equal(effects('刀线客').find(e=>e.action==='伤害').timing,'常驻');
assert.equal(effects('被侵略的世界').find(e=>e.action==='变身').side,'己');
assert.equal(effects('被侵略的世界').find(e=>e.action==='变身').zone,'手牌');
assert.equal(effects('雪人觉醒').find(e=>e.action==='无法攻击').side,'敌','Granted restriction follows the selected enemy across sentences');
assert.equal(effects('利牙').find(e=>e.numbers.includes('6')).side,'敌');
assert.equal(effects('利牙').find(e=>e.numbers.includes('6')).scope,'全体');
assert(effects('疯狂的创造者·历亚姆').filter(e=>e.action==='伤害').every(e=>e.source.includes('/赋予')));
assert(effects('缠绕密林·丽梅格').filter(e=>e.action==='伤害').every(e=>e.source.includes('/赋予')&&e.side==='敌'));
assert.equal(effects('身无长物唯有石').find(e=>e.action==='伤害').repetitions,'6');
assert.deepEqual(S.generatedProducts('召唤1张『甲』，将1张『乙』加入手牌。'),[{name:'乙',amount:'1'}]);
assert(!S.conditionFamilies('X为自己的【连击】。').includes('连击'));
assert.equal(E.singleModeTexts(get('出发的憧憬·苇剑&武津御').text).length,0);
const sample=text=>({id:-1,name:'规则测试',type:4,class:0,cost:1,rarity:1,text,evolvedText:text,effects:[],tribes:[]});
const restricted=S.extract(sample('若对手的随从已经被破坏，则回复自己的主战者2点生命值。'));
assert.deepEqual(restricted.map(e=>e.action),['回复生命']);assert.equal(restricted[0].side,'己');
assert(!E.features(sample('若对手的随从已经被破坏，则回复自己的主战者2点生命值。')).has('作用:破坏'));
const separated=S.extract(sample('对对手的主战者造成2点伤害，回复自己的主战者2点生命值。'));
assert.equal(separated.find(e=>e.action==='伤害').side,'敌');assert.equal(separated.find(e=>e.action==='回复生命').side,'己');
const distributed=S.extract(sample('对对手的战场上的所有随从分配4点伤害。'));
const aoe=S.extract(sample('对对手的战场上的所有随从造成4点伤害。'));
assert(S.similarity(distributed,aoe)>0&&S.similarity(distributed,aoe)<1,'Shared total damage is not damage to each target');
const repeated=S.extract(sample('发动6次「对对手的战场上的随机1个随从造成1点伤害」。'));
assert(S.similarity(repeated,S.extract(sample('对对手的战场上的随机1个随从造成1点伤害。')))<.5);

// Whole-snapshot checks cover original, evolved and attached texts, not just selected ranking examples.
const coverage=[
  ['分配伤害',/分配[\dXYZ]+点伤害/],['获得进化点',/回复自己[\dXYZ]+点进化点/],
  ['获得超进化点',/回复自己[\dXYZ]+点超进化点/],['魔力增幅',/发动[\dXYZ]+次魔力增幅/],
  ['进化',/本随从进化[。；]/],['超进化',/本随从超进化[。；]/],
  ['证据',/【证据】/],['消耗证据',/证据-[\dXYZ]+/],['交换攻血',/攻击力与生命值交换/],
  ['身材设定',/变为攻击力[\dXYZ]+\/生命值[\dXYZ]+/],['生命上限减半',/生命值的最大值变为一半/],
  ['增加墓场',/墓场\+[\dXYZ]+/],['增加倒计数',/倒计数\+[\dXYZ]+/],['减少倒计数',/倒计数-[\dXYZ]+/]
].map(([action,pattern])=>{
  const matching=cards.filter(c=>[c.text,c.evolvedText,...(c.effects||[]).map(e=>e.text)].some(t=>pattern.test(t)));
  for(const c of matching)assert(parsed.get(c.id).some(e=>e.action===action),`${c.name}: corpus coverage missing ${action}`);
  return {action,cards:matching.length};
});
for(const c of cards){
  const es=parsed.get(c.id);
  for(const e of es){assert(Number.isFinite(e.weight)&&e.weight>0);assert(Array.isArray(e.numbers));assert(['己','敌','双方'].includes(e.side));}
  for(const f of E.features(c).values())assert(Number.isFinite(f.w)&&f.w>0);
}
const review=[];
for(const c of cards){
  if((c.text.match(/【模式】/g)||[]).length>1||/改为发动所有能力/.test(c.text))review.push({id:c.id,name:c.name,reason:'多个模式组或条件下发动所有模式：保留完整文本，未构造完整分支组合'});
  if([c.text,...(c.effects||[]).map(e=>e.text)].some(t=>/按顺序发动以下/.test(t)))review.push({id:c.id,name:c.name,reason:'依次发动的多阶段能力：保留各阶段效果及触发事件，不模拟当前执行阶段'});
  if(/X为|Y为|Z为/.test(c.text))review.push({id:c.id,name:c.name,reason:'变量依赖对局状态：保留变量，未求实际数值'});
}
if(cards.some(c=>c.set===10010))require('./new-pack-test.cjs');
const engine=E.createEngine(cards);let comparisons=0;
if(process.argv.includes('--pairs')){
  for(let i=0;i<cards.length;i++){
    assert.equal(engine.compare(cards[i],cards[i]).score,100);
    for(let j=i+1;j<cards.length;j++){
      const a=engine.compare(cards[i],cards[j]).score,b=engine.compare(cards[j],cards[i]).score;
      assert(Number.isFinite(a)&&a>=0&&a<100);assert(Math.abs(a-b)<1e-8,`${cards[i].name} / ${cards[j].name}: asymmetric`);comparisons++;
    }
    if(i%150===0)console.log(`Pair audit: ${i}/${cards.length}, ${comparisons} unordered pairs`);
  }
}
const report={cards:cards.length,nonToken:cards.filter(c=>!c.token).length,coverage,unorderedPairsChecked:comparisons,
  nonemptyTextWithoutEffects:cards.filter(c=>c.text.trim()&&!parsed.get(c.id).length).map(c=>({id:c.id,name:c.name})),
  review,limitations:['复杂跨句条件的完整作用域、跨句代词及动态目标还不是完整规则引擎；命中规则覆盖检查不等于整张卡全部解析正确。']};
const baselinePath=__dirname+'/qa/parser-audit-baseline.json';
if(fs.existsSync(baselinePath)){
  const baseline=JSON.parse(fs.readFileSync(baselinePath,'utf8'));
  report.before={nonemptyTextWithoutEffects:baseline.entries.filter(x=>get(x.name.trim()).text.trim()&&!x.semantic.length).map(x=>({id:x.id,name:x.name}))};
  report.changedCardCount=baseline.entries.filter(x=>JSON.stringify(x.semantic)!==JSON.stringify(parsed.get(x.id))).length;
}
if(process.argv.includes('--report'))fs.writeFileSync(__dirname+'/qa/parser-audit.json',JSON.stringify(report,null,2)+'\n');
console.log('PASS: parser audit',JSON.stringify({...report,review:review.length,before:report.before?.nonemptyTextWithoutEffects.length}));
if(report.nonemptyTextWithoutEffects.length){console.error('Parser audit needs review: nonempty card text produced no effects.');process.exitCode=1;}
