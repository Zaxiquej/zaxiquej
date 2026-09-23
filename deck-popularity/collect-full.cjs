// Run only from the user's BAT/CLI. Never modify the ordinary bank or its cache.
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {buildBank,validateBank,assess}=require('./full-bank.cjs');
const root=__dirname, cacheFile=path.join(root,'.cache/full-snapshot.json');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function writeJSON(file,value){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file+'.tmp',JSON.stringify(value));fs.renameSync(file+'.tmp',file);}
function validDeck(d,classId,baseCards){return d?.classId===classId && d.quantities && baseCards.every(id=>d.quantities[id]>=1) && Object.values(d.quantities).every(n=>Number.isInteger(n)&&n>=1&&n<=3) && Object.values(d.quantities).reduce((a,b)=>a+b,0)===40;}
function makeRequest(){
  let nextStart=0;
  return async function request(endpoint,body){
    for(let attempt=0;attempt<4;attempt++){
      const start=Math.max(Date.now(),nextStart);nextStart=start+800;await sleep(start-Date.now()>0?start-Date.now():0);
      try{
        const r=await fetch('https://shadowverse-wb.com'+endpoint,{method:body?'POST':'GET',headers:{Lang:'chs',...(body?{'Content-Type':'application/json','X-Requested-With':'XMLHttpRequest'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(30000)});
        if(!r.ok)throw Error('HTTP '+r.status);
        const json=await r.json();
        if(json.data_headers?.result_code!==1||!json.data||json.data.result_error_code)throw Error('Invalid API response');
        return json.data;
      }catch(error){console.log(`Retry ${attempt+1}/4: ${error.message}`);if(attempt===3)throw error;await sleep((attempt+1)*4000);}
    }
  };
}
async function collectPool(state,card,request,save){
  const key=`${card.classId}:${card.id}`;
  if(state.pools[key])return 'cached';
  const body={battle_format:1,class_ids:String(card.classId),card_ids:String(card.id),sort_order:4,offset:0,limit:20};
  const first=await request('/web/DeckSearch/index',body);
  if(!Number.isInteger(first.count)||first.count<0||typeof first.is_limit!=='boolean'||!Array.isArray(first.deck_list))throw Error('Invalid search count');
  if(first.is_limit){state.checked[key]={capped:true,queriedAt:new Date().toISOString()};save();return 'capped';}
  if(first.count>1000)throw Error('Unexpected uncapped count');
  const rows=[...first.deck_list];
  for(let offset=20;offset<first.count;offset+=20){
    const d=await request('/web/DeckSearch/index',{...body,offset});
    if(d.count!==first.count||d.is_limit||!Array.isArray(d.deck_list))throw Error('Query changed during pagination; rerun to resume');
    rows.push(...d.deck_list);
  }
  if(rows.some(r=>r.class_id!==card.classId||r.battle_format!==1||!Number.isSafeInteger(r.user_id)||!Number.isSafeInteger(r.deck_id)))throw Error('Search filter mismatch');
  const unique=new Map(rows.map(r=>[`1:${r.user_id}:${r.deck_id}`,r]));
  if(unique.size!==first.count)throw Error('Incomplete listing; refusing to estimate');
  const keys=[...unique.keys()], entries=[...unique.entries()];let cursor=0,done=0,stopped=false;
  async function worker(){while(!stopped&&cursor<entries.length){
    const [ref,row]=entries[cursor++];
    try{
      if(!validDeck(state.decks[ref],card.classId,[card.id])){
        const d=await request('/web/DeckBuilder/deckModal?'+new URLSearchParams({deck_id:row.deck_id,user_id:row.user_id,battle_format:1}));
        const deck={classId:d.class_id,quantities:d.deck_card_num};
        if(!validDeck(deck,card.classId,[card.id]))throw Error('Invalid deck quantities');
        state.decks[ref]=deck;save();
      }
      if(++done%50===0)console.log(`  Class ${card.classId}, card ${card.id}: ${done}/${keys.length} verified decks`);
    }catch(error){stopped=true;throw error;}
  }}
  const results=await Promise.allSettled(Array.from({length:3},()=>worker()));
  const failure=results.find(r=>r.status==='rejected');if(failure)throw failure.reason;
  const last=await request('/web/DeckSearch/index',body);
  if(last.count!==first.count||last.is_limit)throw Error('Count changed while reading decks; pool was not accepted');
  state.pools[key]={classId:card.classId,baseCards:[card.id],count:first.count,deckKeys:keys,queriedAt:new Date().toISOString()};
  state.checked[key]={capped:false};save();return 'complete';
}
function seedState(){
  const state={version:1,startedAt:new Date().toISOString(),decks:{},pools:{},checked:{}};
  const oldFile=path.join(root,'.cache/snapshot.json');
  if(!fs.existsSync(oldFile))return state;
  const old=JSON.parse(fs.readFileSync(oldFile,'utf8'));
  for(const [ref,d] of Object.entries(old.decks||{}))if(/^1:\d+:\d+$/.test(ref)&&validDeck(d,d.classId,[]))state.decks[ref]={classId:d.classId,quantities:d.quantities};
  for(const [key,p] of Object.entries(old.pools||{}))if(p.baseCards?.length>=1&&p.baseCards.length<=3&&p.deckKeys?.length===p.count&&new Set(p.deckKeys).size===p.count&&p.deckKeys.every(ref=>validDeck(state.decks[ref],p.classId,p.baseCards)))state.pools[key]=p;
  return state;
}
async function main(){
  let target=6000;
  for(let i=2;i<process.argv.length;i++){if(process.argv[i]==='--target')target=Number(process.argv[++i]);else throw Error('Unknown argument: '+process.argv[i]);}
  if(!Number.isInteger(target)||target<6000)throw Error('--target must be an integer of at least 6000');
  const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),ctx);
  const source=ctx.window.DECK_POPULARITY_DATA;
  const state=fs.existsSync(cacheFile)?JSON.parse(fs.readFileSync(cacheFile,'utf8')):seedState();
  if(state.version!==1)throw Error('Unsupported full-mode cache version');
  const save=()=>writeJSON(cacheFile,state);save();
  const request=makeRequest();
  const singles=new Map(source.combos.filter(c=>c.cards.length===1).map(c=>[c.cards[0],c]));
  const rank=c=>{const s=singles.get(c.id);return s?.capped?10000:s?Math.abs(s.count-400):20000;};
  const plans=Array.from({length:7},(_,i)=>Object.values(source.cards).filter(c=>c.classId===i+1).sort((a,b)=>rank(a)-rank(b)||a.id-b.id));
  console.log(`Target: ${target} playable full-playset combinations; every card must occur three times.`);
  console.log('Ordinary data is read-only. Complete cached evidence may be reused. Ctrl+C and rerun to resume.');
  let data=buildBank(state,source.cards),report=assess(data,target);
  console.log(JSON.stringify(report));
  while(!report.ready){
    let progress=false;
    for(let classId=1;classId<=7&&!report.ready;classId++){
      const candidate=plans[classId-1].find(c=>!state.pools[`${classId}:${c.id}`]&&!state.checked[`${classId}:${c.id}`]);
      if(!candidate)continue;
      progress=true;console.log(`Checking class ${classId}: ${candidate.name} (${candidate.id})`);
      const outcome=await collectPool(state,candidate,request,save);
      console.log(`  ${outcome}`);
      if(outcome==='complete'){data=buildBank(state,source.cards);report=assess(data,target);console.log(JSON.stringify(report));}
    }
    if(!progress)throw Error('All available uncapped sources exhausted before quality targets were met. Cache retained; no insufficient bank was published. '+report.issues.join('; '));
  }
  validateBank(data,state);
  for(const card of Object.values(data.cards))if(!fs.existsSync(path.join(root,card.image)))throw Error('Missing local card image: '+card.id);
  writeJSON(path.join(root,'full-evidence.json'),{mode:'full',copiesPerCard:3,pools:state.pools,decks:state.decks});
  writeJSON(path.join(root,'full-report.json'),report);
  const dest=path.join(root,'full-data.js');
  fs.writeFileSync(dest+'.tmp','/* Verified full-playset snapshots. Generated by collect-full.cjs. */\nwindow.DECK_POPULARITY_FULL_DATA = '+JSON.stringify(data)+';\n');fs.renameSync(dest+'.tmp',dest);
  console.log(`SUCCESS: ${data.combos.length} full-playset combinations. Refresh the page and select full mode.`);
}
module.exports={collectPool,validDeck,makeRequest};
if(require.main===module)main().catch(error=>{console.error('STOPPED: '+error.message);console.error('Saved progress remains in .cache/full-snapshot.json. Rerun the BAT to resume.');process.exitCode=1;});
