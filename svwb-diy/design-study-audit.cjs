const fs=require('node:fs'),S=require('./engine'),R=require('./reference.json');
const stage=process.argv[2]||'after',N=6000;
const features={fanfare:/【入场曲】/,evolve:/【进化时】/,super:/【超进化时】/,death:/【谢幕曲】/,attack:/【攻击时】|【交战时】/,draw:/抽取\d+张/,heal:/回复自己的主战者/,summon:/召唤/,supply:/加入手牌/,discount:/费用-\d|费用变为/,aoe:/对(?:对手的战场上的|战场上的)所有随从[^。\n]*造成/,face:/对对手的主战者造成/,emblem:/获得『纹章/,mode:/【模式】/,fusion:/【融合】/,boost:/魔力增幅/,earth:/土之/,combo:/连击/,rally:/协作/,ramp:/能量点最大值\+/,discard:/舍弃/,blood:/对自己的主战者造成|生命值为\d+或以下/,artifact:/创造物|核心/,amulet:/护符|倒计数|吟唱|启动/};
const keywords=['守护','突进','疾驰','毁灭','虹吸','潜行','威慑','灵气','屏障'];
function record(c,text){
 const kw=keywords.filter(k=>text.split('\n').some(line=>new RegExp('^(?:【(?:'+keywords.join('|')+')】\\s*)+$').test(line)&&line.includes('【'+k+'】')));
 const f=Object.keys(features).filter(k=>features[k].test(text));
 const body=c.type==='follower'?c.attack+c.health:null;
 const effects=text.split('\n').filter(t=>t.trim()&&!/^(?:【[^】]+】\s*)+$/.test(t));
 return {name:c.name,id:c.id,cost:c.cost,type:c.type,class:c.class,rarity:c.rarity,attack:c.attack,health:c.health,body,kw,f,chars:text.length,lines:effects.length,text};
}
function summarize(rows){
 const groups={};
 for(const c of rows){
  const band=c.cost<=3?'low':c.cost<=6?'mid':'high';
  for(const key of ['all',c.type,c.type+':'+band,c.type+':rarity'+c.rarity,c.type+':class'+c.class,...c.type==='follower'?['cost'+c.cost]:[]]){
   const g=groups[key]??={n:0,body:0,chars:0,lines:0,keywords:{},features:{}};g.n++;g.body+=c.body||0;g.chars+=c.chars;g.lines+=c.lines;
   for(const k of c.kw)g.keywords[k]=(g.keywords[k]||0)+1;
   for(const f of c.f)g.features[f]=(g.features[f]||0)+1;
  }
 }
 return groups;
}
const official=R.cards.filter(c=>!c.token&&c.cost<=10).map(c=>record({...c,type:c.type===1?'follower':c.type===4?'spell':'amulet',rarity:c.rarity-1},c.text));
const generated=[];
for(let i=0;i<N;i++){
 const c=S.generate('设计纵向审阅'+i);generated.push(record(c,c.abilities.filter(a=>a.kind!=='alternate').map(a=>a.text).join('\n')));
}
const a=summarize(official),b=summarize(generated),differences=[];
for(const [key,g]of Object.entries(a)){
 if(g.n<30||!b[key]||b[key].n<40)continue;
 for(const f of Object.keys(features)){const o=(g.features[f]||0)/g.n,n=(b[key].features[f]||0)/b[key].n;if(Math.abs(n-o)>.1)differences.push({group:key,feature:f,official:+o.toFixed(3),generated:+n.toFixed(3),gap:+(n-o).toFixed(3)});}
}
differences.sort((a,b)=>Math.abs(b.gap)-Math.abs(a.gap));
const report={version:S.VERSION,method:'Literal main text only; effects may overlap and mentions are not all active effects. All official non-token <=10 PP versus 6000 fixed generated seeds. No chaos. Character and line counts are descriptive, not complexity scores.',official:a,generated:b,differences,examples:generated.filter(c=>c.rarity>=2).filter((_,i)=>i%25===0).slice(0,60)};
fs.writeFileSync(__dirname+'/design-study-'+stage+'.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({version:S.VERSION,differences:differences.slice(0,35),bodies:Object.fromEntries(Object.entries(a).filter(([k])=>/^cost/.test(k)).map(([k,g])=>[k,{official:g.body/g.n,generated:b[k]?.body/b[k]?.n}]))},null,2));
