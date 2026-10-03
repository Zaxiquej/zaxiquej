const fs=require('node:fs'),assert=require('node:assert/strict'),S=require('./engine'),R=require('./reference-latest.json');
const stage=process.argv[2]||'after',type=c=>typeof c.type==='string'?c.type:c.type===1?'follower':c.type===4?'spell':'amulet';
const patterns={draw:/抽取\d+张/,heal:/回复自己的主战者/,summon:/召唤/,aoe:/对(?:对手的战场上的|战场上的)所有随从[^。\n]*造成/,pp:/回复自己\d+点能量点/,emblem:/获得『纹章/,reanimate:/亡者召还/,evolution:/【进化时】/,superEvolution:/【超进化时】/,lastWords:/【谢幕曲】/,fanfare:/【入场曲】/,boost:/魔力增幅/,earth:/土之/,ramp:/能量点最大值\+/,rally:/协作/,combo:/连击/,grave:/墓场|唤灵/};
const kw=/^(?:【(?:守护|突进|疾驰|毁灭|虹吸|潜行|威慑|灵气|屏障)】\s*)+$/;
function summary(cards,getText){
 const out={n:cards.length,classes:Array(8).fill(0),types:{},rarities:Array(4).fill(0),costs:Array(11).fill(0),groups:{}};
 for(const c of cards){out.classes[c.class]++;out.types[type(c)]=(out.types[type(c)]||0)+1;out.rarities[c.rarity]++;if(c.cost<=10)out.costs[c.cost]++;
  if(!getText)continue;const text=getText(c),keys=['all',type(c),...c.class===0?['neutral']:[],...(type(c)==='follower'?['followers'+(c.cost<=3?'Low':c.cost<=6?'Mid':'High')]:[])];
  for(const key of keys){const g=out.groups[key]??={n:0};g.n++;for(const [id,re]of Object.entries(patterns))if(re.test(text))g[id]=(g[id]||0)+1;if(text.split('\n').some(t=>kw.test(t)))g.keyword=(g.keyword||0)+1;}
 }
 return out;
}
const official=summary(R.cards.filter(c=>!c.token).map(c=>({...c,rarity:c.rarity-1})),c=>c.text),headers=[],cards=[],neutral=[];
for(let i=0;i<80000;i++){const name='官方分布核对'+i,h=S.header(name);headers.push(h);if(i<4000||h.class===0&&neutral.length<600){const c=S.generate(name);assert(c.spent+(c.type==='follower'?c.attack+c.health:0)<=c.budget+.02,c.name);assert(c.type!=='follower'||Number.isInteger(c.attack)&&Number.isInteger(c.health));if(i<4000)cards.push(c);if(h.class===0&&neutral.length<600)neutral.push(c);}}
const body=c=>c.abilities.filter(a=>a.kind!=='alternate').map(a=>a.text).join('\n');
const report={version:S.VERSION,source:R.source,retrieved:R.retrieved,method:'All non-token official cards, no alternate starter duplication. Generated text excludes alternate forms and attached token reference text. Feature flags overlap and describe text occurrence, not power or win rate.',official,headers:summary(headers),generated:summary(cards,body),neutral:summary(neutral,body),neutralExamples:neutral.filter(c=>/亡者召还|墓场|土之|魔力增幅|觉醒|协作|连击/.test(body(c))).slice(0,10).map(c=>({name:c.name,text:body(c)}))};
fs.writeFileSync(__dirname+'/official-distribution-'+stage+'.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({version:S.VERSION,official:official.groups,generated:report.generated.groups,neutralExamples:report.neutralExamples,headers:{n:headers.length,types:report.headers.types,classes:report.headers.classes,rarities:report.headers.rarities}},null,2));
