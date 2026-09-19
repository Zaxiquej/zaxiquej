const fs=require('node:fs'),R=require('./reference.json'),S=require('./engine');
const pool=new Map(S.TOKENS.map(t=>[t.id,t])),support=new Map(S.SUPPORT_CARDS.map(t=>[t.id,t])),related=new Map(S.RELATED_CARDS.map(t=>[t.id,t]));
const rows=R.cards.filter(c=>c.token).map(c=>{
 const sources=R.cards.filter(p=>!p.token&&p.text.includes('『'+c.name+'』')).map(p=>({id:p.id,name:p.name}));
 const dependencies=[...c.text.matchAll(/『([^』]+)』/g)].map(m=>m[1]).filter(n=>n!==c.name);
 let status,reason;
 if(pool.has(c.id)){status='follower-pool';reason='职业随从 token 池；手牌和召唤分别估值';}
 else if(support.get(c.id)?.commonSupply){status='common-supply';reason='独立获得卡牌效果，只加入手牌';}
 else if(support.has(c.id)){status='special-route';reason='财宝／核心／变身等已有专门路径';}
 else if(related.has(c.id)){status='related-definition';reason='由关联 token 的融合等能力到达';}
 else{status='deferred';reason=c.class===0&&sources.length===0?'特殊牌组衍生，遵照用户要求不接入牌组改写':/信仰/.test(c.text)?'需要专门的信仰关联':dependencies.length?'依赖指定原卡或连锁衍生，需要专门路径':'专属奖励；未混入通用池，待单独估值接入';}
 return {id:c.id,name:c.name,class:c.class,type:c.type,sources,dependencies,status,reason,url:`https://shadowverse-wb.com/chs/deck/cardslist/card/?card_id=${c.id}`};
});
const counts=rows.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{});
const report={version:S.VERSION,source:R.source,snapshotRetrieved:R.retrieved,totalCards:R.cards.length,totalTokens:rows.length,counts,rows};
fs.writeFileSync(__dirname+'/token-coverage-audit.json',JSON.stringify(report,null,2));
fs.writeFileSync(__dirname+'/token-coverage-audit.md',`# 官方衍生卡接入核对\n\n官方快照：${R.retrieved}；共 ${R.cards.length} 张卡，${rows.length} 张标记为 token。定义已收录不等于进入通用随机池，状态逐项列出。\n\n| 卡牌 | 接入状态 | 说明 |\n| --- | --- | --- |\n`+rows.map(r=>`| [${r.name}](${r.url}) | ${r.status} | ${r.reason} |`).join('\n')+'\n');
console.log({totalTokens:rows.length,counts});
