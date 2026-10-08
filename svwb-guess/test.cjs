const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('./engine.js'),ctx={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/data.js','utf8'),ctx);
const data=JSON.parse(JSON.stringify(ctx.window.SVWB_GUESS_DATA)),cards=data.cards;
assert.equal(new Set(cards.map(c=>c.id)).size,cards.length);
assert(cards.length>=900);assert(cards.some(c=>c.token));assert(cards.some(c=>c.effects.some(e=>e.type===1)));
assert.equal(E.types[cards.find(c=>c.name==='智慧光辉').type],'法术');
assert.equal(E.types[cards.find(c=>c.name==='侦探的放大镜').type],'护符');
const base={id:1,name:'测试卡',type:1,class:3,cost:3,rarity:2,attack:2,health:2,tribes:[],effects:[]};
const card=(id,text,extra={})=>({...base,id,text,evolvedText:text,...extra});
const suite=[
  card(1,'【超进化时】抽取2张卡牌。'),card(2,'【超进化时】抽取3张卡牌。'),card(3,'【进化时】抽取2张卡牌。'),
  card(4,'费用2【启动】抽取2张卡牌。',{type:2}),card(5,'费用3【启动】抽取2张卡牌。',{type:2}),card(6,'费用8【启动】抽取2张卡牌。',{type:2}),
  card(7,'【入场曲】对对手的主战者造成2点伤害。'),card(8,'【入场曲】对自己的主战者造成2点伤害。'),card(9,'【入场曲】对对手的主战者造成3点伤害。'),
  card(10,'【入场曲】使自己获得『纹章：测试卡』。',{effects:[{type:1,text:'自己的回合结束时，抽取1张卡牌。'}]}),
  card(11,'【入场曲】使自己获得『纹章：测试卡』。',{effects:[{type:1,text:'自己的回合结束时，抽取2张卡牌。'}]}),
  card(12,'【入场曲】使自己获得『纹章：测试卡』。',{effects:[{type:1,text:'自己的回合结束时，对自己的主战者造成2点伤害。'}]}),
  card(13,'【入场曲】抽取2张卡牌。'),card(14,'【谢幕曲】抽取2张卡牌。')
];
const engine=E.createEngine(suite),score=(a,b)=>engine.compare(suite[a-1],suite[b-1]).score;
assert(score(1,2)>score(1,3),'Super evolution is distinct from ordinary evolution');
assert(!E.features(suite[0]).has('时点:进化时'));
assert(score(4,5)>score(4,6),'Activation costs affect similarity');
assert(score(7,9)>score(7,8),'Enemy damage must differ from self damage');
assert(score(10,11)>score(10,12),'Attached emblem effects affect similarity');
assert(score(13,2)>score(13,8));
assert.deepEqual([...E.features(card(99,'【守护】'))],[...E.features(card(99,'【守护】',{evolvedText:''}))],'Repeated evolution text is counted once');
for(const c of suite)for(const d of suite){const v=engine.compare(c,d).score;assert(v>=0&&v<=100&&Number.isFinite(v));assert(Math.abs(v-engine.compare(d,c).score)<1e-9);}
const ordinary=E.poolFor(cards),withTokens=E.poolFor(cards,{noTokens:false});assert(ordinary.every(c=>!c.token));assert(withTokens.length>ordinary.length);
const toy=[{id:1,rotation:true,token:false,related:[2]},{id:2,rotation:false,token:true,related:[3]},{id:3,rotation:false,token:true},{id:4,rotation:false,token:false}];
assert.deepEqual(E.poolFor(toy,{rotation:true,noTokens:false}).map(c=>c.id),[1,2,3]);
assert.deepEqual(E.poolFor(toy,{rotation:true,noTokens:true}).map(c=>c.id),[1]);
assert.equal(E.chooseTarget(ordinary,'同一个种子').id,E.chooseTarget([...ordinary],'同一个种子').id);
const start=performance.now(),real=E.createEngine(cards);
for(const c of cards.filter((_,i)=>i%37===0)){
  const ranking=real.rank(c);assert.equal(ranking[0].card.id,c.id);assert.equal(ranking[0].score,100);
  assert(ranking.slice(1).every(r=>r.score<100));assert(ranking.every((r,i)=>r.rank===i+1&&Number.isFinite(r.score)));
  let used=[],lastRank=cards.length+1;
  for(let i=0;i<30;i++){const h=E.hint(ranking,used);if(!h)break;assert(h.rank>1&&h.rank<lastRank);assert(!used.includes(h.card.id));used.push(h.card.id);lastRank=h.rank;}
}
console.log(`PASS: ${cards.length} cards; WB types, activation costs, super evolution, targeting, attached emblems, seed/pools, ranking and hints. ${Math.round(performance.now()-start)}ms`);
const target=cards.find(c=>c.name==='自然妖精公主·阿丽雅');console.log('Sample nearest cards:',real.rank(target).slice(0,8).map(r=>`${r.rank}. ${r.card.name}: ${r.score.toFixed(2)}`).join('\n'));
