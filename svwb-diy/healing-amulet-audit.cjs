const fs=require('node:fs'),S=require('./engine'),R=require('./reference.json');
const stage=process.argv[2]||'after';
function heals(cards,text){
 const bins={low:[],mid:[],high:[]};
 for(const c of cards)for(const m of text(c).matchAll(/回复自己的主战者(\d+)点生命值/g))bins[c.cost<=2?'low':c.cost<=6?'mid':'high'].push(+m[1]);
 return Object.fromEntries(Object.entries(bins).map(([k,v])=>[k,{n:v.length,mean:v.length?v.reduce((a,b)=>a+b)/v.length:0,over4:v.filter(n=>n>4).length,over6:v.filter(n=>n>6).length,histogram:v.reduce((o,n)=>(o[n]=(o[n]||0)+1,o),{})}]));
}
const cards=[];for(let i=0;i<3500;i++)cards.push(S.generate('治疗与护符核对'+i));
const amulets=[];
for(let i=0;amulets.length<350;i++){
 const name='高费护符数值'+i,h=S.header(name);
 if(h.type==='amulet'&&h.cost>=4)amulets.push(S.generate(name));
}
const report={version:S.VERSION,method:'Fixed 3500 seeds and 350 amulets costing 4+. Healing counts printed numeric clauses, including modes/conditions, excluding token/emblem/alternate definitions. Not win rates.',official:heals(R.cards.filter(c=>!c.token),c=>c.text),generated:heals(cards,c=>c.abilities.filter(a=>a.kind!=='alternate').map(a=>a.text).join('\n')),amulets:amulets.map(c=>({name:c.name,cost:c.cost,rarity:c.rarity,budget:c.budget,spent:c.spent,readiness:S.amuletReadiness?.(c),text:c.abilities.map(a=>a.text).join('\n')}))};
fs.writeFileSync(__dirname+'/healing-amulet-'+stage+'.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({version:report.version,official:report.official,generated:report.generated,amulets:amulets.length},null,2));
