const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('./engine.js'),S=require('./semantics.js');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/data.js','utf8'),ctx);
const cards=JSON.parse(JSON.stringify(ctx.window.SVWB_GUESS_DATA.cards));
const get=name=>{const c=cards.find(c=>c.name===name);assert(c,name);return c;};
const effects=name=>S.extract(get(name));
const find=(name,action)=>{const e=effects(name).find(e=>e.action===action);assert(e,`${name}: ${action}`);return e;};
assert.equal(cards.filter(c=>c.set===10010&&!c.token).length,76);
for(const name of ['神域的物证','理想国·涅格尔赫亚']){
  assert.equal(find(name,'证据').object,'护符');
  const consumed=find(name,'消耗证据');assert.equal(consumed.numbers[0],'1');assert.equal(consumed.timing,'启动');
  assert(!effects(name).some(e=>e.action==='消失'),'Banish trigger is not a performed removal');
}
assert.equal(find('理想国·涅格尔赫亚','回复生命').event,'本卡牌在战场上消失时');
for(const name of ['纯真卖报人','俏皮设计师','安逸爱好家','表里侦探·诺·莱芙']){
  for(const action of ['交换攻血','加身材']){
    const e=find(name,action);assert.equal(e.zone,'手牌');assert.equal(e.event,'自己【启动】证据·护符时');assert.equal(e.recipient,'本体');
  }
  assert(!E.features(get(name)).has('时点:启动'),'Responding to evidence is not its own activated ability');
}
assert.deepEqual(find('安逸爱好家','身材设定').numbers,['X','Y']);
assert.equal(find('最凶恶的收容','消耗证据').numbers[0],'2');
assert.equal(find('人灭三恶·兰佩吉','生命上限减半').side,'敌');
assert.equal(find('末日变换·格莫瑞','增加墓场').source,'附属1');
assert.equal(find('千金大参谋·阿尔梅莉洁','增加倒计数').object,'纹章');
assert.equal(find('次元异客','减少倒计数').event,'自己进行【融合】时');
assert.equal(find('人灭绅士','回复生命').event,'自己【融合】护符时','A second sentence shares the preceding event');
assert.equal(find('人灭绅士','守护').event,'','An innate keyword is not conditional on the preceding event');
assert.equal(find('残思侦探·诺克坦','加身材').event,'自己的卡牌在战场上消失时');
assert.equal(find('亚教偶像','召唤').event,'对手的随从在战场上消失时');
assert.equal(find('播撒生命的异形','召唤').summonKind,'抽取后召唤');
assert.equal(find('理想国之神·列加尔','召唤').summonKind,'同名');
for(const name of ['毁灭怪腕','最凶恶的收容','人灭三恶·兰佩吉']){
  assert.equal(find(name,'召唤').event,'与本卡牌【融合】时');
  assert(E.features(get(name)).has('能力:融合'));
}
for(const [name,amount] of [['表里的现场验证','10'],['毁灭怪腕','8']]){
  const e=effects(name).find(e=>e.action==='伤害'&&e.numbers[0]===amount);assert(e);assert(e.upgrade);assert.equal(e.side,'敌');
}
assert(effects('冰锥蜥蜴').some(e=>e.action==='伤害'&&e.repetitions==='3'&&e.upgrade));
assert(effects('荒废的繁殖').some(e=>e.action==='召唤'&&e.product==='地害之兔'&&e.numbers[0]==='4'&&e.upgrade));
const branches=E.singleModeTexts(get('俯瞰的目光').text);
assert.equal(branches.length,6);assert.equal(new Set(branches.map(b=>b.label)).size,6);
for(const b of branches)assert.equal(S.extract({...get('俯瞰的目光'),text:b.text}).length,2,'Choose two of four effects, not one or all four');
for(const c of cards.filter(c=>c.set===10010)){
  assert(S.extract(c).length,`${c.name}: parsed effects`);
  for(const e of S.extract(c))assert(Number.isFinite(e.weight)&&e.weight>0);
}
assert(fs.readFileSync(__dirname+'/../guessWB.html','utf8').includes('<option>证据</option>'));
console.log('PASS: pack 10, evidence, stat exchange, fusion/banish events, counters, short upgrades and choose-two modes.');
