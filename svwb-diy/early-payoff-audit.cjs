const S=require('./engine'),fs=require('node:fs');
const counts={low:0,superOnly:0,earth:0,earth2:0,earthBody:0},examples={};
for(let i=0;i<8000;i++){
 const c=S.generate('低费启动506-'+i,{chaos:i%3===0});if(c.type!=='follower'||c.cost<1||c.cost>3)continue;counts.low++;
 const active=c.abilities.filter(a=>a.kind!=='keyword'&&a.kind!=='alternate');
 if(active.length&&active.every(a=>a.trigger==='超进化时')){counts.superOnly++;examples.superOnly??=c.name;}
 if(c.abilities.some(a=>['入场曲','谢幕曲'].includes(a.trigger)&&a.ids.includes('earth'))){counts.earth++;counts.earthBody+=c.attack+c.health;}
 if(c.abilities.some(a=>['入场曲','谢幕曲'].includes(a.trigger)&&/土之印\+2/.test(a.text))){counts.earth2++;examples.earth2??=c.name;}
}
const report={version:S.VERSION,samples:8000,counts,examples};if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n');console.log(report);
