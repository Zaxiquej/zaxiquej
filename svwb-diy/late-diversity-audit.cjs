const fs=require('node:fs'),S=require('./engine'),R=require('./reference.json');
const file=__dirname+'/late-diversity-validation.json',baseline=process.argv.includes('--baseline');
function flags(c,text){
 const self=text.split(/\n/).filter(line=>/召唤/.test(line)&&line.includes(`『${c.name}』`));
 return {
  aoe:/对(?:对手的战场上的|战场上的)所有随从[^。\n]*造成/.test(text),
  split:/所有随从分配/.test(text),
  selfCopy:self.length>0,
  selfRevive:self.some(line=>/谢幕曲/.test(line)),
  storm:/【疾驰】/.test(text),
  ward:/【守护】/.test(text),
  heal:/回复自己的主战者/.test(text),
  face:/对对手的主战者造成/.test(text),
  singleRemoval:/选择对手的战场上的[12]个随从|对手的战场上的随机[12]个随从/.test(text),
  emblem:/获得『纹章/.test(text),
  pp:/回复自己[1-9]点能量点/.test(text),
  summon:/召唤/.test(text),
  discount:/使本卡牌的费用-|本卡牌的费用变为/.test(text)
 };
}
function summarize(cards,getText){
 const counts={},byClass={},examples={};
 for(const c of cards){
  const f=flags(c,getText(c));(byClass[c.class]??={n:0}).n++;
  for(const [id,yes]of Object.entries(f))if(yes){counts[id]=(counts[id]||0)+1;byClass[c.class][id]=(byClass[c.class][id]||0)+1;(examples[id]??=[]).length<4&&examples[id].push(c.name);}
 }
 return {n:cards.length,counts,byClass,examples};
}
const official=R.cards.filter(c=>!c.token&&c.type===1&&c.cost>=7);
const cards=[];
for(let i=0;cards.length<600;i++){
 const name='高费多样性核对'+i,h=S.header(name);
 if(h.type==='follower'&&h.cost>=7)cards.push(S.generate(name));
}
const sample=summarize(cards,c=>c.abilities.filter(a=>a.kind!=='alternate').map(a=>a.text).join('\n'));
let prior=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};
const report={source:R.source,retrieved:R.retrieved,note:'Printed-cost >=7 non-token followers. Categories overlap; conditional and evolution text count. Generated alternate-play text excluded. Not win-rate data.',official:summarize(official,c=>c.text),...(!baseline?{before:prior.before}:{}),[baseline?'before':'after']:{version:S.VERSION,...sample},samples:cards.slice(0,8).map(c=>({name:c.name,class:c.class,cost:c.cost,body:[c.attack,c.health],text:c.abilities.map(a=>a.text).join('\n')}))};
fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({official:report.official.counts,nOfficial:official.length,before:report.before?.counts,after:report.after?.counts,n:cards.length},null,2));
