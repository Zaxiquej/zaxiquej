const assert=require('node:assert/strict');
const {buildBank,validateBank,assess}=require('./full-bank.cjs');
const {collectPool,validDeck}=require('./collect-full.cjs');
const E=require('./engine.js');
global.fetch=()=>{throw Error('Offline tests must never access the network');};
const card={id:101,classId:1,name:'Fixture'};
const source=Object.fromEntries([101,102,103].map(id=>[id,{id,classId:1,name:'Fixture '+id}]));
const blank=()=>({version:1,decks:{},pools:{},checked:{}});
function deck(i){
  const quantities={101:i%3===0?3:2,102:i%2===0?3:1,103:1};
  let left=40-Object.values(quantities).reduce((a,b)=>a+b,0),id=1000;
  while(left){quantities[id++]=Math.min(3,left);left-=quantities[id-1];}
  return {class_id:1,deck_card_num:quantities};
}
function api(options={}){
  let firstQueries=0,details=0;
  const request=async(endpoint,body)=>{
    if(body){
      assert.equal(body.card_ids,'101','Query one presence ID, never repeat it');
      assert.equal(body.class_ids,'1');
      if(body.offset===0)firstQueries++;
      const offset=options.duplicate&&body.offset?0:body.offset;
      return {count:options.capped?1000:options.changed&&firstQueries>1?26:25,is_limit:!!options.capped,deck_list:Array.from({length:Math.min(20,25-body.offset)},(_,i)=>({class_id:1,battle_format:1,user_id:999,deck_id:offset+i+1}))};
    }
    details++;
    const i=Number(new URL('https://fixture.invalid'+endpoint).searchParams.get('deck_id'))-1;
    if(options.fail&&i===4)throw Error('Simulated interruption');
    return deck(i);
  };
  return {request,get details(){return details;}};
}
async function main(){
  const state=blank(),mock=api();let saves=0;
  assert.equal(await collectPool(state,card,mock.request,()=>saves++),'complete');
  assert.equal(mock.details,25);
  assert.equal(state.pools['1:101'].count,25);
  assert.ok(saves>=25);
  assert.ok(validDeck(state.decks['1:999:1'],1,[101]));
  const data=buildBank(state,source);
  const count=ids=>data.combos.find(c=>c.cards.join(',')===ids).count;
  assert.equal(count('101'),9,'Presence count 25 must not become full count');
  assert.equal(count('101,102'),5,'Both cards must have three copies');
  assert.equal(count('101,103'),0,'Present but never three copies is a genuine zero');
  validateBank(data,state);
  assert.ok(data.combos.every(c=>c.copies===3&&!c.capped));
  const corrupt=structuredClone(data);corrupt.combos[0].count++;
  assert.throws(()=>validateBank(corrupt,state),/mismatch/);
  const duplicate=structuredClone(state);duplicate.pools['1:101'].deckKeys[1]=duplicate.pools['1:101'].deckKeys[0];
  assert.throws(()=>buildBank(duplicate,source),/Incomplete/);
  const capped=blank(),capAPI=api({capped:true});
  assert.equal(await collectPool(capped,card,capAPI.request,()=>{}),'capped');
  assert.equal(capAPI.details,0);
  assert.deepEqual(capped.pools,{});
  for(const options of [{duplicate:true},{changed:true}]){
    const invalid=blank();
    await assert.rejects(collectPool(invalid,card,api(options).request,()=>{}),/Incomplete|changed/);
    assert.deepEqual(invalid.pools,{});
  }
  const resumed=blank();
  await assert.rejects(collectPool(resumed,card,api({fail:true}).request,()=>{}),/interruption/);
  assert.deepEqual(resumed.pools,{});
  const saved=Object.keys(resumed.decks).length;
  assert.ok(saved>0&&saved<25);
  const retry=api();await collectPool(resumed,card,retry.request,()=>{});
  assert.equal(retry.details,25-saved,'Resume must reuse verified details');
  validateBank(buildBank(resumed,source),resumed);
  assert.equal(assess(data).ready,false,'Small banks must not be published');
  assert.throws(()=>E.buildCatalog({...data,copiesPerCard:1}),/3/);
  assert.equal(E.buildCatalog({...data,combos:data.combos.map(c=>({...c,copies:1}))}).total,0);
  const playable={schemaVersion:1,mode:'full',copiesPerCard:3,cards:{},combos:[]};
  for(let cl=1;cl<=7;cl++)for(let i=1;i<=12;i++){
    const id=cl*100+i;playable.cards[id]={id,classId:cl};
    playable.combos.push({id:'fixture:'+id,classId:cl,cards:[id],copies:3,count:i*60,capped:false});
  }
  const catalog=E.buildCatalog(playable);
  for(const score of [0,4,8,12,18,23,24,30,40,50,60]){
    const q=E.createQuestion(catalog,score);
    assert.equal(q.options.length,E.difficultyForScore(score).options);
    assert.equal(q.extremesOnly,score>=24);
    assert.ok(q.options.every(c=>c.copies===3&&c.cards.length===1));
    const counts=q.options.map(c=>c.count).sort((a,b)=>b-a);
    assert.ok(counts[0]-counts[1]>=50&&counts[0]>=counts[1]*1.25);
  }
  console.log('Full-mode offline tests passed: exact copies, evidence, pagination, capped queries, interrupted resume, schema and fair questions.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
