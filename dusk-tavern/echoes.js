(function(root){
'use strict';
const D=root.TavernData||(typeof require!=='undefined'?require('./data'):null),E=root.TavernEngine||(typeof require!=='undefined'?require('./engine'):null);
const KEY='sv_tavern_echoes_v1',MAX_USES=32;
const fields=['tier','grave','spells','played','bloodDamage','scrap','progress','board'];
const unitFields=['id','attack','health','golden','keywords','shieldLayers','heroWindfury','heroReborn','dragonPings','guardRemoved'];
const copy=x=>JSON.parse(JSON.stringify(x)),integer=(n,max=1e10)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
function valid(r){
 if(!r||typeof r.id!=='string'||r.id.length>140||typeof r.run!=='string'||r.run.length>100||r.version!==D.rulesVersion||!integer(r.round,Number.MAX_SAFE_INTEGER)||r.round<1||!integer(r.uses,MAX_USES)||!integer(r.tier,6)||r.tier<1||!D.heroes.some(h=>h.id===r.hero))return false;
 if(!Array.isArray(r.tribes)||r.tribes.length!==4||new Set(r.tribes).size!==4||!r.tribes.every(t=>D.tribeIds.includes(t)))return false;
 if(!Array.isArray(r.board)||!r.board.length||r.board.length>7||!r.board.every(c=>D.byId[c.id]?.type==='minion'&&!D.byId[c.id].retired&&integer(c.attack)&&integer(c.health)&&c.health>0&&typeof c.golden==='boolean'&&Array.isArray(c.keywords)&&c.keywords.every(k=>['taunt','shield','stealth','destruction','cannotAttack'].includes(k))&&['shieldLayers','dragonPings'].every(k=>c[k]===undefined||integer(c[k]))&&['heroWindfury','heroReborn','guardRemoved'].every(k=>c[k]===undefined||typeof c[k]==='boolean')))return false;
 if(!['grave','spells','played','bloodDamage','scrap'].every(k=>integer(r[k])))return false;
 const p=r.progress;if(!p||typeof p!=='object'||!Array.isArray(p.constructTypes)||!p.constructTypes.every(id=>D.constructCycle.includes(id)))return false;
 return Object.entries(p).every(([k,v])=>k==='constructTypes'||integer(v));
}
function create(storage){
 let data={enabled:false,records:[]};
 try{const raw=JSON.parse(storage.getItem(KEY));if(raw&&Array.isArray(raw.records))data={enabled:raw.enabled===true,records:raw.records.filter(valid).slice(-512)};}catch{}
 const persist=()=>{try{storage.setItem(KEY,JSON.stringify(data));return true;}catch{return false;}};
 function capture(s){if(!s.board.length||!s.recruitEnded)return false;if(!s.echoRunId)s.echoRunId=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
  const id=s.echoRunId+':'+s.round;if(data.records.some(r=>r.id===id))return false;
  const r={id,run:s.echoRunId,version:D.rulesVersion,round:s.round,hero:s.hero,tribes:[...E.activeTribes(s)].sort(),uses:0,tier:s.tier,grave:s.grave,spells:s.spells,played:s.played,bloodDamage:s.bloodDamage||0,scrap:s.scrap||0,progress:E.scaling.read(s),board:s.board.map(c=>Object.fromEntries(unitFields.filter(k=>c[k]!==undefined).map(k=>[k,copy(c[k])]))) };
  if(!valid(r))return false;data.records.push(r);data.records=data.records.slice(-512);return persist();
 }
 function take(s){if(!data.enabled)return null;const tribes=[...E.activeTribes(s)].sort().join(','),pool=data.records.filter(r=>r.uses<MAX_USES&&r.run!==s.echoRunId&&r.round===s.round&&r.tribes.join(',')===tribes&&r.version===D.rulesVersion);
  if(!pool.length)return null;pool.sort((a,b)=>a.uses-b.uses||a.id.localeCompare(b.id));const r=pool[(s.seed>>>0)%pool.length];r.uses++;if(!persist()){r.uses--;return null;}return copy(r);
 }
 function apply(s,r){if(!valid(r)||r.round!==s.round)return false;const o=s.opponents.find(x=>x.id===s.opponent);if(!o)return false;
  for(const k of fields)if(k!=='board')o[k]=copy(r[k]);o.board=r.board.map(c=>({...copy(c),uid:++s.uid}));o.hand=[];o.shop=[];o.amulets=[];o.discover=[];o.feasts=[];o.hero=r.hero;const h=D.heroes.find(h=>h.id===r.hero);o.tribe=h.tribe==='neutral'?r.tribes[0]:h.tribe;o.name=h.name+' · 历史阵容';o.echoRound=s.round;o.echoRecord=r.id;o.aiSummary={routeName:'历史阵容',budget:0,bonusGold:0,goldSpent:0,cardsBought:0,spellsCast:0,triples:0,turns:s.round,actions:0,upgraded:false,bought:[],goldLeft:0,coreCount:0,tier:r.tier,refreshes:0,boardPower:r.board.reduce((n,c)=>n+c.attack+c.health,0)};return true;
 }
 function ingest(raw){if(!raw||raw.format!=='sv-tavern-echoes-v1'||!Array.isArray(raw.records)||raw.records.length>512)throw Error('阵容文件格式不正确。');if(!raw.records.every(valid))throw Error('阵容版本或数据不匹配。');let added=0;for(const entry of raw.records){const r=copy(entry);r.tribes.sort();const old=data.records.find(x=>x.id===r.id);if(old){old.uses=Math.max(old.uses,r.uses);continue;}data.records.push(r);added++;}data.records=data.records.slice(-512);if(!persist())throw Error('浏览器存储空间不足。');return added;}
 return {capture,take,apply,ingest,enabled:()=>data.enabled,setEnabled:value=>{data.enabled=!!value;persist();},stats:()=>({count:data.records.length,available:data.records.filter(r=>r.uses<MAX_USES).length,uses:data.records.reduce((n,r)=>n+r.uses,0)}),export:()=>({format:'sv-tavern-echoes-v1',records:copy(data.records)})};
}
const api={create,valid,MAX_USES};root.TavernEchoes=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
