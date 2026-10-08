(() => {
  'use strict';
  const $=id=>document.getElementById(id), E=window.WBGuess, data=window.SVWB_GUESS_DATA;
  if(!data?.cards?.length||!E){$('pool-info').textContent='卡池加载失败，请检查 svwb-guess 文件夹是否完整。';$('start').disabled=true;return;}
  const engine=E.createEngine(data.cards), byId=new Map(data.cards.map(c=>[c.id,c]));
  const norm=s=>E.normalize(typeof simplized==='function'?simplized(s):s);
  const nameKeys=new Map(data.cards.map(c=>[c.id,norm(c.name)]));
  const fullText=c=>[c.text,c.evolvedText,...(c.effects||[]).map(e=>(E.effectTypes[e.type]||'')+' '+e.text)].join('\n');
  const storageKey='svwb-guess-v1', TOP_LIMIT=20;
  let game=null,pool=[],ranking=[],rankMap=new Map(),visibleCount=16,searchMatches=[];
  const el=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};
  const button=(text,fn,cls='secondary')=>{const b=el('button',text,cls);b.type='button';b.addEventListener('click',fn);return b;};
  const settings=()=>({rotation:$('rotation').checked,noTokens:$('no-tokens').checked});
  const metadata=c=>`${E.classes[c.class]} · ${E.types[c.type]} · ${c.cost} 费${c.type===1?` · ${c.attack}/${c.health}`:''}${c.token?' · 衍生卡':''}`;
  function setMessage(message){$('message').textContent=message;}
  function save(){try{localStorage.setItem(storageKey,JSON.stringify({...game,version:data.retrieved}));}catch{}}
  function updatePool(){const p=E.poolFor(data.cards,settings());$('pool-info').textContent=`本次卡池 ${p.length.toLocaleString()} 张。相同种子和选项可与朋友挑战同一道题。`;}
  for(let i=0;i<E.classes.length;i++){const o=el('option',E.classes[i]);o.value=i;$('class-filter').append(o);}
  $('data-info').textContent=`本地收录 ${data.cards.length.toLocaleString()} 张卡牌（衍生卡 ${data.cards.filter(c=>c.token).length} 张），数据获取于 ${data.retrieved.slice(0,10)}。排除异画与单独的基础系列变体。游戏与搜索使用本地数据；卡图在查看详情时从官网加载，断网不影响猜测。`;
  $('rotation').addEventListener('change',updatePool);$('no-tokens').addEventListener('change',updatePool);updatePool();
  $('daily').addEventListener('click',()=>{const d=new Date();$('seed').value=`WB-${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;});
  function start(saved){
    const options=saved?.options||settings();pool=E.poolFor(data.cards,options);
    if(!pool.length){$('pool-info').textContent='当前没有可用卡牌，请更改卡池选项。';return;}
    const seed=saved?.seed||$('seed').value.trim()||Math.random().toString(36).slice(2,10);
    const target=E.chooseTarget(pool,seed);
    game=saved||{seed,options,targetId:target.id,guesses:[],ended:false,extra:false,viewedTop:false};
    game.targetId=target.id;
    ranking=engine.rank(target,pool);rankMap=new Map(ranking.map(r=>[r.card.id,r]));
    $('start-panel').hidden=true;$('game').hidden=false;
    $('game-seed').textContent=`种子 ${seed} · ${options.rotation?'指定关联卡池':'全部卡池'} · ${options.noTokens?'无衍生卡':'含衍生卡'} · ${pool.length} 张`;
    $('benchmarks').textContent=[10,100,500].filter(n=>n<=ranking.length).map(n=>`第 ${n} 名：${ranking[n-1].score.toFixed(2)}`).join('　／　');
    $('guess-input').value='';$('advanced').open=false;setMessage('');clearFilters();render();save();$('guess-input').focus();
  }
  $('start-form').addEventListener('submit',event=>{event.preventDefault();start();});
  $('restart').addEventListener('click',()=>{
    $('game').hidden=true;$('start-panel').hidden=false;$('seed').value='';game=null;
    try{localStorage.removeItem(storageKey);}catch{}$('seed').focus();
  });
  function matchesFilters(c){
    const cls=$('class-filter').value,type=$('type-filter').value,cost=$('cost-filter').value,rarity=$('rarity-filter').value;
    if(cls!==''&&c.class!==+cls)return false;if(type==='amulet'&&![2,3].includes(c.type))return false;
    if(type&&type!=='amulet'&&c.type!==+type)return false;
    if(cost!==''){
      const comparison=$('cost-comparison').value;
      if(comparison==='greater'?c.cost<+cost:comparison==='less'?c.cost>+cost:c.cost!==+cost)return false;
    }
    if(rarity&&c.rarity!==+rarity)return false;
    const words=value=>value.split(/\s+/u).map(norm).filter(Boolean);
    const text=norm(fullText(c)),inc=words($('text-filter').value),exc=words($('exclude-filter').value),mechanic=$('mechanic-filter').value;
    if(!inc.every(word=>text.includes(word))||exc.some(word=>text.includes(word)))return false;
    if(mechanic==='进化时'){if(!fullText(c).includes('【进化时】'))return false;}
    else if(mechanic&&!text.includes(norm(mechanic)))return false;
    return true;
  }
  function updateSuggestions(reset=true){
    if(!game)return;if(reset)visibleCount=16;
    const query=norm($('guess-input').value);
    if(!query&&!filterIds.some(id=>$(id).value!=='')){
      searchMatches=[];$('suggestions').replaceChildren();$('more').hidden=true;
      $('search-status').textContent='输入部分卡名，或使用高级搜索寻找备选。';return;
    }
    searchMatches=pool.filter(matchesFilters).filter(c=>!query||nameKeys.get(c.id).includes(query));
    // Fall back to ordered character matches for a slightly incomplete name.
    if(query&&!searchMatches.length&&query.length>1)searchMatches=pool.filter(matchesFilters).filter(c=>{
      const name=nameKeys.get(c.id);let at=0;for(const ch of query){at=name.indexOf(ch,at);if(at<0)return false;at++;}return true;
    });
    searchMatches.sort((a,b)=>Number(nameKeys.get(b.id)===query)-Number(nameKeys.get(a.id)===query)||a.cost-b.cost||a.id-b.id);
    $('search-status').textContent=`找到 ${searchMatches.length} 张${searchMatches.length>visibleCount?`，先显示 ${visibleCount} 张`:''}。`;
    $('suggestions').replaceChildren();
    const guessed=new Set(game.guesses.map(g=>g.id));
    for(const c of searchMatches.slice(0,visibleCount)){
      const row=el('div',undefined,'suggestion');
      const choose=button(c.name,()=>submit(c.id,false),'');
      choose.disabled=game.ended&&!game.extra;
      choose.setAttribute('aria-label',`猜测 ${c.name}，${metadata(c)}`);choose.append(el('small',metadata(c)+(guessed.has(c.id)?' · 已猜':'')));
      row.append(choose,button('详情',()=>showCard(c),'secondary detail'));$('suggestions').append(row);
    }
    $('more').hidden=searchMatches.length<=visibleCount;
  }
  const filterIds=['class-filter','type-filter','cost-filter','rarity-filter','mechanic-filter','text-filter','exclude-filter'];
  function clearFilters(){filterIds.forEach(id=>$(id).value='');$('cost-comparison').value='equal';updateSuggestions();}
  filterIds.forEach(id=>$(id).addEventListener('input',()=>updateSuggestions()));
  $('cost-comparison').addEventListener('change',()=>updateSuggestions());
  $('clear-filters').addEventListener('click',clearFilters);
  $('guess-input').addEventListener('input',()=>updateSuggestions());
  $('more').addEventListener('click',()=>{visibleCount+=24;updateSuggestions(false);});
  $('guess-form').addEventListener('submit',event=>{
    event.preventDefault();if(event.isComposing||!game||game.ended&&!game.extra)return;
    const query=norm($('guess-input').value);
    if(!query){setMessage('先输入卡名，或点选一张备选卡。');return;}
    const exact=pool.filter(c=>nameKeys.get(c.id)===query);
    const card=exact.length===1?exact[0]:null;
    if(!card){updateSuggestions();setMessage(exact.length>1?'存在同名卡，请从备选中选择具体的一张。':'请选择备选卡，或输入完整卡名。');return;}
    submit(card.id,false);
  });
  // Do not commit a guess when Enter is being used to confirm Chinese input.
  $('guess-input').addEventListener('keydown',event=>{if(event.key==='Enter'&&(event.isComposing||event.keyCode===229))event.preventDefault();});
  function submit(id,isHint){
    if(!rankMap.has(id)||game.ended&&!game.extra)return;
    if(game.guesses.some(g=>g.id===id)){setMessage('你已经猜过这张卡牌了。');return;}
    game.guesses.push({id,hint:isHint});const r=rankMap.get(id);
    if(id===game.targetId&&!game.extra)game.ended=true;
    setMessage(isHint?`提示：「${r.card.name}」，第 ${r.rank} 名。`:`「${r.card.name}」：第 ${r.rank} 名，相似度 ${r.score.toFixed(2)}。`);
    if(game.extra&&game.guesses.filter(g=>rankMap.get(g.id).rank<=TOP_LIMIT).length===Math.min(TOP_LIMIT,pool.length)){game.extra=false;setMessage('前 20 名全部找到了！');}
    $('guess-input').value='';render();save();
  }
  function render(){
    if(game.extra&&game.guesses.filter(g=>rankMap.get(g.id).rank<=TOP_LIMIT).length===Math.min(TOP_LIMIT,pool.length))game.extra=false;
    const attempts=game.guesses.filter(g=>!g.hint),hints=game.guesses.filter(g=>g.hint);
    $('guess-count').textContent=`猜测 ${attempts.length} 次`;$('hint-count').textContent=`提示 ${hints.length} 次`;
    const best=game.guesses.length?Math.min(...game.guesses.map(g=>rankMap.get(g.id).rank)):null;
    $('best-rank').textContent=`最佳名次 ${best?'#'+best:'—'}`;
    $('game-title').textContent=game.extra?`猜前 20 名 · 已找到 ${game.guesses.filter(g=>rankMap.get(g.id).rank<=TOP_LIMIT).length}/${Math.min(TOP_LIMIT,pool.length)}`:'猜出这张卡';
    $('answer').hidden=!game.ended;$('answer').replaceChildren();
    if(game.ended){const c=byId.get(game.targetId),won=game.guesses.some(g=>g.id===c.id);
      $('answer').append(el('strong',won?'猜对了！':'答案揭晓'),el('p',`${c.name} · ${metadata(c)}`),button('查看答案卡牌',()=>showCard(c),'secondary small'));
    }
    $('guess-button').disabled=game.ended&&!game.extra;
    $('hint').hidden=game.ended;$('reveal').hidden=game.ended;$('top').hidden=!game.ended;
    $('extra').hidden=!game.ended||game.extra||game.viewedTop||game.guesses.filter(g=>rankMap.get(g.id).rank<=TOP_LIMIT).length===Math.min(TOP_LIMIT,pool.length);
    renderHistory();updateSuggestions();
  }
  function renderHistory(){
    const rows=game.guesses.map((g,i)=>({...g,...rankMap.get(g.id),index:i+1}));
    const latest=rows.pop();
    if($('sort').value==='rank')rows.sort((a,b)=>a.rank-b.rank);else rows.reverse();
    if(latest)rows.unshift(latest);
    $('history').replaceChildren();$('empty-history').hidden=rows.length>0;
    for(const r of rows){const row=el('tr');row.append(el('td',r.hint?'提示':String(game.guesses.slice(0,r.index).filter(g=>!g.hint).length)));
      const name=el('td');name.append(button(r.card.name,()=>showCard(r.card),'name-button'));
      if(r===latest){row.classList.add('highlight');name.append(el('small','最新','latest-label'));}
      row.append(name);
      row.append(el('td',r.score.toFixed(2)),el('td','#'+r.rank,r.rank<=10?'rank-good':r.rank<=TOP_LIMIT?'rank-close':''));$('history').append(row);
    }
  }
  $('sort').addEventListener('change',renderHistory);
  $('hint').addEventListener('click',()=>{const r=E.hint(ranking,game.guesses.map(g=>g.id));if(r)submit(r.card.id,true);else setMessage('已没有比目前更接近的非答案卡，最后一步靠你了。');});
  $('reveal').addEventListener('click',()=>{game.ended=true;game.extra=false;setMessage('本题已结束，可以查看答案或继续挑战前 20 名。');render();save();});
  $('extra').addEventListener('click',()=>{game.extra=true;render();save();$('guess-input').focus();setMessage('继续寻找前 20 名；提示得到的卡也计入已找到数量。');});
  $('top').addEventListener('click',()=>{
    game.extra=false;game.viewedTop=true;render();save();$('top-content').replaceChildren();
    for(const r of ranking.slice(0,TOP_LIMIT))$('top-content').append(button(`#${r.rank}　${r.card.name}　${r.score.toFixed(2)}`,()=>showCard(r.card)));
    $('top-dialog').showModal();
  });
  function showCard(c){
    $('card-title').textContent=c.name;const grid=el('div',undefined,'card-detail-grid'),imageBox=el('div'),body=el('div');
    if(c.imageHash){const img=el('img');img.alt=c.name;img.src=`https://shadowverse-wb.com/uploads/card_image/chs/card/${c.imageHash}.png`;
      img.addEventListener('error',()=>{img.hidden=true;imageBox.append(el('p','卡图暂时无法加载，卡牌文字仍可查看。','muted'));},{once:true});imageBox.append(img);}
    body.append(el('p',metadata(c)),el('h3','卡牌效果'),el('p',c.text||'无特殊能力。'));
    if(c.evolvedText&&E.normalize(c.evolvedText)!==E.normalize(c.text))body.append(el('h3','进化后效果'),el('p',c.evolvedText));
    for(const effect of c.effects||[])body.append(el('h3',E.effectTypes[effect.type]||'附属效果'),el('p',effect.text));
    if(c.tribes.length)body.append(el('p','类型：'+c.tribes.map(id=>data.tribes?.[id]||id).join('、'),'muted'));
    grid.append(imageBox,body);$('card-content').replaceChildren(grid);if(!$('card-dialog').open)$('card-dialog').showModal();
  }
  $('close-card').addEventListener('click',()=>$('card-dialog').close());$('close-top').addEventListener('click',()=>$('top-dialog').close());
  for(const id of ['card-dialog','top-dialog'])$(id).addEventListener('click',e=>{if(e.target!==$(id))return;const r=$(id).getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$(id).close();});
  try{const saved=JSON.parse(localStorage.getItem(storageKey));if(saved&&saved.version===data.retrieved&&typeof saved.seed==='string'&&saved.options&&Array.isArray(saved.guesses)){
    const savedPool=E.poolFor(data.cards,saved.options);if(savedPool.length&&saved.guesses.every(g=>savedPool.some(c=>c.id===g.id))&&new Set(saved.guesses.map(g=>g.id)).size===saved.guesses.length){$('rotation').checked=!!saved.options.rotation;$('no-tokens').checked=!!saved.options.noTokens;start(saved);updatePool();}
  }}catch{}
})();
