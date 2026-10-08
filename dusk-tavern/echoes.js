(function(root){
'use strict';
const D=root.TavernData||(typeof require!=='undefined'?require('./data'):null),E=root.TavernEngine||(typeof require!=='undefined'?require('./engine'):null);
const KEY='sv_tavern_echoes_v1',MAX_USES=32;
const fields=['tier','grave','spells','played','bloodDamage','scrap','progress','board'];
const reserveNumbers=['pendingGold','pendingFairies','discount','graveSearchUses','constructIndex'];
const unitFields=['id','attack','health','golden','keywords','shieldLayers','temporaryShields','heroWindfury','heroReborn','heroShield','heroDeathEcho','dragonPings','forgeUpgrades','spentGold','tavernWeaves','guardRemoved'];
const copy=x=>JSON.parse(JSON.stringify(x)),integer=(n,max=1e10)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
const compatible=version=>version===D.rulesVersion||(D.rulesVersion==='28.20'&&version==='28.19')||(D.rulesVersion==='28.23'&&version==='28.22');
function valid(r,allowLegacy=false){
 if(!r||typeof r.id!=='string'||r.id.length>140||typeof r.run!=='string'||r.run.length>100||(typeof r.version!=='string'||r.version.length>40||!allowLegacy&&!compatible(r.version))||!integer(r.round,Number.MAX_SAFE_INTEGER)||r.round<1||!integer(r.uses,MAX_USES)||!integer(r.tier,6)||r.tier<1||!D.heroes.some(h=>h.id===r.hero))return false;
 if(!Array.isArray(r.tribes)||r.tribes.length!==4||new Set(r.tribes).size!==4||!r.tribes.every(t=>D.tribeIds.includes(t)))return false;
 if(!Array.isArray(r.board)||r.board.length>7||!r.board.every(c=>D.byId[c.id]?.type==='minion'&&!D.byId[c.id].retired&&integer(c.attack)&&integer(c.health)&&c.health>0&&typeof c.golden==='boolean'&&Array.isArray(c.keywords)&&c.keywords.every(k=>['taunt','shield','stealth','destruction','cannotAttack'].includes(k))&&['shieldLayers','temporaryShields','dragonPings','forgeUpgrades','spentGold','tavernWeaves'].every(k=>c[k]===undefined||integer(c[k]))&&(c.temporaryShields===undefined||c.temporaryShields<=E.scaling.shieldCount(c))&&['heroWindfury','heroReborn','heroShield','heroDeathEcho','guardRemoved'].every(k=>c[k]===undefined||typeof c[k]==='boolean')))return false;
 if(!['grave','spells','played','bloodDamage','scrap'].every(k=>integer(r[k])))return false;
 if(reserveNumbers.some(k=>r[k]!==undefined&&!integer(r[k])))return false;
 if(r.constructIndex!==undefined&&r.constructIndex>=D.constructCycle.length)return false;
 if(r.stats!==undefined&&(!r.stats||['triples','spells','discards'].some(k=>!integer(r.stats[k]))))return false;
 const held=c=>c&&D.byId[c.id]&&!D.byId[c.id].retired&&integer(c.attack)&&integer(c.health)&&typeof c.golden==='boolean'&&Array.isArray(c.keywords)&&c.keywords.every(k=>['taunt','shield','stealth','destruction','cannotAttack'].includes(k))&&['shieldLayers','temporaryShields','dragonPings','forgeUpgrades','spentGold','tavernWeaves'].every(k=>c[k]===undefined||integer(c[k]))&&['heroWindfury','heroReborn','heroShield','heroDeathEcho','guardRemoved'].every(k=>c[k]===undefined||typeof c[k]==='boolean');
 if(r.hand!==undefined&&(!Array.isArray(r.hand)||r.hand.length>10||!r.hand.every(held)))return false;
 if(r.amulets!==undefined&&(!Array.isArray(r.amulets)||r.amulets.length>7||!r.amulets.every(c=>held(c)&&D.byId[c.id].type==='amulet'&&integer(c.count)&&c.count>0)))return false;
 const p=r.progress;if(!p||typeof p!=='object'||!Array.isArray(p.constructTypes)||!p.constructTypes.every(id=>D.constructCycle.includes(id)))return false;
 return Object.entries(p).every(([k,v])=>k==='constructTypes'||integer(v));
}
function validSeries(series,s,o){return series&&typeof series.run==='string'&&['history','ai'].includes(series.status)&&Array.isArray(series.records)&&series.records.length>0&&series.records.length<=512&&series.records.every((r,i)=>valid(r,true)&&r.run===series.run&&r.hero===o.hero&&r.round===i+1&&[...r.tribes].sort().join(',')===[...E.activeTribes(s)].sort().join(','));}
function create(storage){
 let data={enabled:false,records:[]};
 try{const raw=JSON.parse(storage.getItem(KEY));if(raw&&Array.isArray(raw.records))data={enabled:raw.enabled===true,records:raw.records.filter(r=>valid(r)).slice(-512)};}catch{}
 const persist=()=>{try{storage.setItem(KEY,JSON.stringify(data));return true;}catch{return false;}};
 function capture(s){if(!s.recruitEnded)return false;if(!s.echoRunId)s.echoRunId=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
  const id=s.echoRunId+':'+s.round;if(data.records.some(r=>r.id===id))return false;
  const r={id,run:s.echoRunId,version:D.rulesVersion,round:s.round,hero:s.hero,tribes:[...E.activeTribes(s)].sort(),uses:0,tier:s.tier,grave:s.grave,spells:s.spells,played:s.played,bloodDamage:s.bloodDamage||0,scrap:s.scrap||0,progress:E.scaling.read(s),board:s.board.map(c=>Object.fromEntries(unitFields.filter(k=>c[k]!==undefined).map(k=>[k,copy(c[k])]))) };
  r.hand=(s.hand||[]).map(c=>Object.fromEntries(unitFields.filter(k=>c[k]!==undefined).map(k=>[k,copy(c[k])])));r.amulets=(s.amulets||[]).map(c=>({...Object.fromEntries(unitFields.filter(k=>c[k]!==undefined).map(k=>[k,copy(c[k])])),count:c.count}));for(const k of reserveNumbers)r[k]=s[k]||0;r.stats={triples:s.stats?.triples||0,spells:s.stats?.spells||0,discards:s.stats?.discards||0};
  if(!valid(r))return false;data.records.push(r);data.records=data.records.slice(-512);return persist();
 }
 function take(s){if(!data.enabled)return null;const tribes=[...E.activeTribes(s)].sort().join(','),pool=data.records.filter(r=>r.uses<MAX_USES&&r.run!==s.echoRunId&&r.round===s.round&&r.tribes.join(',')===tribes&&compatible(r.version));
  if(!pool.length)return null;pool.sort((a,b)=>a.uses-b.uses||a.id.localeCompare(b.id));const r=pool[(s.seed>>>0)%pool.length];r.uses++;if(!persist()){r.uses--;return null;}return copy(r);
 }
 function apply(s,r,opponentId=s.opponent){if(!valid(r)||r.round!==s.round)return false;const o=s.opponents.find(x=>x.id===opponentId);if(!o)return false;E.repairEchoIdentities(s);
  for(const k of fields)if(k!=='board')o[k]=copy(r[k]);o.board=r.board.map(c=>({...copy(c),uid:++s.uid}));o.hand=(r.hand||[]).map(c=>({...copy(c),uid:++s.uid}));o.pendingTriples=[];o.shop=[];o.amulets=(r.amulets||[]).map(c=>({...copy(c),uid:++s.uid}));for(const k of reserveNumbers)o[k]=r[k]||0;o.stats=copy(r.stats||{triples:0,spells:0,discards:0});o.discover=[];o.feasts=[];const h=D.heroes.find(h=>h.id===o.hero);o.name=h.name+' · 历史阵容';o.echoSourceHero=r.hero;o.echoRound=s.round;o.echoRecord=r.id;o.aiSummary={routeName:'历史阵容',budget:0,bonusGold:0,goldSpent:0,cardsBought:0,spellsCast:0,triples:0,turns:s.round,actions:0,upgraded:false,bought:[],goldLeft:0,coreCount:0,tier:r.tier,refreshes:0,boardPower:r.board.reduce((n,c)=>n+c.attack+c.health,0)};return true;
 }
 function bind(s){
  if(s.echoBindingComplete)return 0;
  if(s.round!==1||(s.roundHistory||[]).length){s.echoBindingComplete=true;return 0;}
  if(!data.enabled)return 0;
  const tribes=[...E.activeTribes(s)].sort().join(','),groups=new Map();
  for(const r of data.records)if(r.run!==s.echoRunId&&r.uses<MAX_USES&&[...r.tribes].sort().join(',')===tribes&&compatible(r.version)){if(!groups.has(r.run))groups.set(r.run,[]);groups.get(r.run).push(r);}
  let candidates=[...groups.values()].map(rs=>rs.sort((a,b)=>a.round-b.round)).filter(rs=>{const h=D.heroes.find(h=>h.id===rs[0].hero);return h&&!h.challenge&&E.heroAvailable(h,s.activeTribes)&&rs.every((r,i)=>r.round===i+1&&r.hero===rs[0].hero)&&data.records.filter(r=>r.run===rs[0].run&&[...r.tribes].sort().join(',')===tribes).length===rs.length;});
  const selected=[],used=new Set([s.hero]);
  while(candidates.length&&selected.length<7){const chosen=candidates[((s.seed>>>0)+selected.length*97)%candidates.length];if(!used.has(chosen[0].hero)){selected.push(chosen);used.add(chosen[0].hero);}candidates=candidates.filter(rs=>rs[0].hero!==chosen[0].hero);}
  for(const rs of selected)for(const r of rs)r.uses++;
  if(selected.length&&!persist()){for(const rs of selected)for(const r of rs)r.uses--;return 0;}
  const assigned=new Set();for(const rs of selected){const h=D.heroes.find(h=>h.id===rs[0].hero),o=s.opponents.find(o=>!assigned.has(o.id)&&o.hero===h.id)||s.opponents.find(o=>!assigned.has(o.id));assigned.add(o.id);const tribe=h.tribe==='neutral'?o.tribe:h.tribe;Object.assign(o,{hero:h.id,tribe,initialHero:h.id,initialTribe:tribe,name:h.name+' · 历史阵容',armor:h.armor,echoSeries:{run:rs[0].run,status:'history',records:copy(rs)}});}
  for(const o of s.opponents.filter(o=>!assigned.has(o.id))){let h=D.heroes.find(h=>h.id===o.hero);if(used.has(h.id))h=D.heroes.find(h=>!h.challenge&&!used.has(h.id)&&E.heroAvailable(h,s.activeTribes)&&(h.tribe===o.tribe||h.tribe==='neutral'));if(!h)h=D.heroes.find(h=>!h.challenge&&!used.has(h.id)&&E.heroAvailable(h,s.activeTribes));used.add(h.id);const tribe=h.tribe==='neutral'?o.tribe:h.tribe;Object.assign(o,{hero:h.id,tribe,initialHero:h.id,initialTribe:tribe,name:h.name,armor:h.armor});}
  s.echoBindingComplete=true;return selected.length;
 }
 function prepare(s){
  if(!s.echoBindingComplete){bind(s);s.echoBindingComplete=true;}
  let loaded=0;for(const o of s.opponents){if(o.hp<=0||!o.echoSeries||o.echoSeries.status==='ai')continue;const series=o.echoSeries;if(o.echoRound===s.round)continue;const r=series.records[s.round-1];if(r&&r.round===s.round&&r.hero===o.hero&&apply(s,r,o.id)){loaded++;continue;}series.status='ai';delete o.echoRound;delete o.echoRecord;delete o.echoSourceHero;o.name=D.heroes.find(h=>h.id===o.hero).name+' · AI接管';}
  return loaded;
 }
 function ingest(raw){if(!raw||raw.format!=='sv-tavern-echoes-v1'||!Array.isArray(raw.records)||raw.records.length>512)throw Error('阵容文件格式不正确。');if(!raw.records.every(r=>valid(r)))throw Error('阵容版本或数据不匹配。');let added=0;for(const entry of raw.records){const r=copy(entry);r.tribes.sort();const old=data.records.find(x=>x.id===r.id);if(old){old.uses=Math.max(old.uses,r.uses);continue;}data.records.push(r);added++;}data.records=data.records.slice(-512);if(!persist())throw Error('浏览器存储空间不足。');return added;}
 return {capture,take,apply,bind,prepare,ingest,enabled:()=>data.enabled,setEnabled:value=>{data.enabled=!!value;persist();},stats:()=>({count:data.records.length,available:data.records.filter(r=>r.uses<MAX_USES).length,uses:data.records.reduce((n,r)=>n+r.uses,0)}),export:()=>({format:'sv-tavern-echoes-v1',records:copy(data.records)})};
}
const api={create,valid,validSeries,MAX_USES};root.TavernEchoes=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
