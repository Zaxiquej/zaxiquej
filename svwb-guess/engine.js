(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./semantics.js'));else root.WBGuess=factory(root.WBGuessSemantics);})(typeof globalThis==='object'?globalThis:this,function(Semantics){
  'use strict';
  const classes=['中立','精灵','皇家护卫','巫师','龙族','梦魇','主教','超越者'];
  const types={1:'随从',2:'护符',3:'吟唱护符',4:'法术'};
  const effectTypes={1:'纹章',2:'结晶',3:'激奏',4:'信仰'};
  const clean=s=>String(s||'').normalize('NFKC').replace(/<hr\s*\/?\s*>/gi,'\n').replace(/<[^>]*>/g,'').replace(/_/g,' ').trim();
  const normalize=s=>clean(s).toLowerCase().replace(/[\s·・‧，。！？、：；「」『』【】()（）\-]/g,'');
  const near=(a,b)=>1/(1+Math.abs(Number(a)-Number(b))*.55);
  const trigger=/((?:费用\s*\d+\s*)?【(?:入场曲|谢幕曲|超进化时|进化时|攻击时|交战时|魔力增幅时|启动)】)/g;
  const effectTiming=timing=>timing.replace(/^(?:使用时|入场曲)(?=>|$)/,'打出时');
  const restrictionKey=value=>value?':目标限制:'+value:'';
  const actions=[
    ['伤害',/造成([\dXYZ]+)点伤害/g],['回复生命',/回复[^。]*?([\dXYZ]+)点生命值/g],
    ['抽牌',/抽取([\dXYZ]+)张/g],['召唤',/召唤([\dXYZ]+)个/g],
    ['破坏',/破坏/g],['消失',/消失/g],['回手',/返回手牌/g],['回牌组',/返回牌组/g],
    ['生成手牌',/加入手牌/g],['弃牌',/舍弃/g],['复制',/复制/g],['变身',/变身/g],
    ['加身材',/\+([\dXYZ]+)\/\+([\dXYZ]+)/g],['减身材',/-([\dXYZ]+)\/-([\dXYZ]+)/g],
    ['跳费',/能量点最大值\+([\dXYZ]+)/g],['扣费上限',/能量点最大值-([\dXYZ]+)/g],
    ['回费',/回复(?:自己|对手)?([\dXYZ]+)点能量点/g],['减费',/费用-([\dXYZ]+)/g],['加费',/费用\+([\dXYZ]+)/g],
    ['获得进化点',/进化点\+([\dXYZ]+)/g],['自动超进化',/使[^。]*?超进化/g],
    ['自动进化',/使[^。]*?(?<!超)进化/g],['获胜',/对战胜利/g]
  ];
  function targetOf(s){
    if(/所有主战者|战场上的所有随从/.test(s)&&!s.includes('对手的战场')&&!s.includes('自己的战场'))return '双方';
    const side=/对手/.test(s)?'敌':/自己|本随从|本卡牌/.test(s)?'己':'未指定';
    return side+(/主战者/.test(s)?'主战者':/手牌/.test(s)?'手牌':/随从|本随从/.test(s)?'随从':/护符/.test(s)?'护符':'卡牌');
  }
  function features(card){
    const result=new Map();
    function put(k,w,values=[],numberKind='',family=''){const old=result.get(k);if(!old||old.w<w)result.set(k,{w,values,numberKind,family});}
    function parse(text,prefix='',factor=1,initialTiming=card.type===4?'使用时':'常驻'){
      let timing=initialTiming;
      if(timing==='使用时'&&clean(text))put(prefix+'时点:使用时',1.5*factor);
      for(const name of Semantics.conditionFamilies(text)){
        const value=String(text||'').match(new RegExp('【'+name+'\\s+([\\dXYZ]+)】'))?.[1];
        put(prefix+'条件类别:'+name,2*factor,value?[value]:[],'','条件:'+name);
      }
      for(const part of Semantics.expandText(clean(text)).split(trigger).filter(Boolean)){
        if(/^(?:费用\s*\d+\s*)?【(?:入场曲|谢幕曲|超进化时|进化时|攻击时|交战时|魔力增幅时|启动)】$/.test(part)){
          timing=part.match(/【([^】]+)】/)[1];put(prefix+'时点:'+timing,1.5*factor);
          if(timing==='启动')put(prefix+'启动费用',2*factor,[Number(part.match(/费用\s*(\d+)/)?.[1]||0)]);
          continue;
        }
        for(const m of part.matchAll(/【([^】\d\s]+)(?:\s*([\dXYZ]+))?】/g)){
          // Named conditions already have a canonical feature; do not count their label again as an ability.
          if(Semantics.conditionNames.includes(m[1]))continue;
          const granted=/获得|拥有/.test(part.slice(Math.max(0,m.index-9),m.index))?'赋予或指定:':'能力:';
          const line=part.slice(0,m.index).split('\n').pop()+part.slice(m.index).split('\n')[0];
          const keywordTiming=Semantics.keywordActions.includes(m[1])&&line.trim()===m[0]?'常驻':timing;
          const family=(Semantics.conditionNames.includes(m[1])?'条件:':'效果:')+m[1];
          // Gaining a keyword on this card shares its base ability with an innate keyword.
          // Keep the original granted/innate distinction in the timed feature below.
          const selfGranted=Semantics.keywordActions.includes(m[1])&&/(?:本随从|本卡牌)(?:获得|拥有)[^，。；\n]*$/.test(part.slice(0,m.index));
          put(prefix+(selfGranted?'能力:':granted)+m[1],2*factor,m[2]?[m[2]]:[],'',family);
          put(prefix+effectTiming(keywordTiming)+':'+granted+m[1],1.4*factor,m[2]?[m[2]]:[],'',family);
        }
        for(const term of ['纹章','信仰','超进化','进化','土之印','魔力增幅','连击','协作','融合','奥义槽','创造物','人偶','妖精','亡者','葬送']){
          // Ordinary evolution must not be inferred from the substring in super-evolution.
          const content=term==='进化'?part.replace(/超进化/g,''):part;
          if(content.includes(term))put(prefix+'体系:'+term,1.4*factor);
        }
        for(const sentence of part.split(/[。\n；]/).filter(Boolean)){
          let context=timing;
          const effectFactor=factor*(Semantics.isUpgrade(sentence)?.5:1);
          const condition=Semantics.conditionOf(sentence);
          if(condition&&!Semantics.conditionFamilies(sentence).length)put(prefix+'条件:'+condition,1.5*effectFactor);
          const event=sentence.match(/(?:自己的|对手的)?回合(?:开始|结束)时|进入战场时|被破坏时|离开战场时|回复时/);
          if(event){context+='>'+event[0];put(prefix+'事件:'+event[0],2*factor);}
          for(const [action,regex]of actions){
            for(const m of sentence.matchAll(regex)){
              const body=Semantics.effectBody(sentence);
              const target=targetOf(['回手','回牌组'].includes(action)?body.replace(/(?:使其)?返回(?:手牌|牌组)/g,''):body);
              const values=m.slice(1).filter(v=>v!==undefined);
              const products=action==='生成手牌'?Semantics.generatedProducts(sentence):[];
              if(products.length){
                put(prefix+'作用:生成手牌',2*effectFactor,[],'','效果:生成手牌');
                for(const product of products){
                  put(prefix+effectTiming(context)+':'+target+':生成手牌:'+product.name,3*effectFactor,[product.amount],'','效果:生成手牌');
                  put(prefix+'产物:生成手牌:'+product.name,3*effectFactor,[product.amount],'','效果:生成手牌');
                }
                continue;
              }
              const restriction=restrictionKey(Semantics.targetRestrictionOf(sentence,action));
              const family=action==='伤害'&&target==='己主战者'?'效果:自伤':'效果:'+action;
              put(prefix+'作用:'+(family==='效果:自伤'?'自伤':action)+restriction,2*effectFactor,values,'',family);
              const scoped=['伤害','破坏','消失','回手','回牌组','加身材','减身材','自动进化','自动超进化'].includes(action);
              const scope=scoped?':'+Semantics.scopeOf(sentence):'';
              const location=['加身材','减身材','自动进化','自动超进化'].includes(action)?':'+(/本随从|本卡牌/.test(body)?'本体':/手牌/.test(body)?'手牌':/牌组/.test(body)?'牌组':'其他对象'):'';
              put(prefix+effectTiming(context)+':'+target+scope+location+':'+action+restriction,3*effectFactor*(condition?.75:1),values,'',family);
            }
          }
          if(/所有|随机|选择/.test(sentence))put(prefix+effectTiming(context)+':范围:'+Semantics.scopeOf(sentence),.8*effectFactor);
          for(const m of sentence.matchAll(/『([^』]+)』/g)){
            if(!m[1].startsWith('纹章')&&!m[1].includes(card.name)&&!Semantics.generatedProducts(sentence).some(p=>p.name===m[1]))put(prefix+'关联对象:'+m[1],1.2*factor);
          }
        }
      }
    }
    parse(card.text);
    // Most WB evo text repeats base text; do not double-count it.
    if(normalize(card.evolvedText)!==normalize(card.text))parse(card.evolvedText,'进化后/',.7);
    for(const e of card.effects||[]){const label=effectTypes[e.type]||'附属效果';put('附属:'+label,3);parse(e.text,label+'/',.7,e.type===3?'使用时':'常驻');}
    // Recognize the resulting ability without erasing how or when it is obtained.
    const semantic=Semantics.extract(card),generated=new Map();
    for(const e of semantic){
      if(e.action==='生成手牌'&&e.product){
        const amount=Number(e.numbers[0]),old=generated.get(e.source)||{amount:0,weight:e.weight};
        old.amount=Number.isFinite(old.amount)&&Number.isFinite(amount)?old.amount+amount:NaN;generated.set(e.source,old);
      }
      if(e.action==='重复触发')put(e.source+':重复触发:'+e.timing+':'+e.reference,e.weight*2);
      if(Semantics.keywordActions.includes(e.action))put(e.source+':能力结果:'+e.side+':'+e.object+':'+e.recipient+':'+e.action,2*e.weight,[],'','效果:'+e.action);
      if(['进化时','超进化时'].includes(e.timing))put(e.source+':进化类触发:'+e.side+':'+e.object+':'+e.scope+':'+e.recipient+':'+e.action+restrictionKey(e.targetRestriction),2*e.weight,e.numbers,'',Semantics.effectFamily(e));
      if(e.side==='敌'&&e.zone==='战场'&&e.object!=='主战者'&&['伤害','破坏','消失','回手','回牌组'].includes(e.action)){
        // Damage is conditional removal; direct removal retains the higher weight.
        if(e.action==='伤害'&&e.numbers[0]==='0')continue;
        const object=e.object==='卡牌'?'随从':e.object;
        put(e.source+':目的:敌方解场:'+object+':'+e.scope+restrictionKey(e.targetRestriction),(e.action==='伤害'?2:3)*e.weight,e.action==='伤害'?e.numbers:[],e.action,'用途:敌方解场');
      }
    }
    // Match the amount described across stages, not only the first individual generation clause.
    for(const [source,total]of generated)put(source+':资源:生成手牌份数',3*total.weight,[Number.isFinite(total.amount)?total.amount:'X'],'','效果:生成手牌');
    return result;
  }
  function featureSimilarity(a,b){
    let shared=0,total=0,extra=0;
    for(const k of new Set([...a.keys(),...b.keys()])){
      const x=a.get(k),y=b.get(k);total+=Math.max(x?.w||0,y?.w||0);
      if(!x||!y)extra+=(x||y).w;
      if(x&&y){let numerical=1;
        // Damage amounts affect shared removal purpose, but cannot be compared to a banish/destroy count.
        const comparable=!x.numberKind||!y.numberKind||x.numberKind===y.numberKind;
        const length=comparable?Math.max(x.values.length,y.values.length):0;
        if(length)numerical=Array.from({length},(_,i)=>{
          return Semantics.effectNumberSimilarity(x.values[i],y.values[i],x.family===y.family?x.family:'');
        }).reduce((s,n)=>s+n,0)/length;
        shared+=Math.min(x.w,y.w)*numerical;
      }
    }
    // Extra abilities count at 75%; mismatched amounts on shared abilities retain their full penalty.
    return total?shared/(total-.25*extra):1;
  }
  function textTokens(card){
    const texts=[clean(card.text)];
    if(normalize(card.text)!==normalize(card.evolvedText))texts.push(clean(card.evolvedText));
    texts.push(...(card.effects||[]).map(e=>clean(e.text)));
    const products=new Set(texts.flatMap(text=>text.split(/[。\n；]/).flatMap(Semantics.generatedProducts)).map(p=>p.name));
    const text=texts.join('\n').split(card.name).join('本卡牌').replace(/『([^』]+)』/g,(_,name)=>products.has(name)?'产物'+name:'关联卡牌').replace(/[XYZ]/g,'变量').replace(/[^\p{L}\p{N}]/gu,'');
    const grams=new Set();for(let i=0;i<text.length-1;i++)grams.add(text.slice(i,i+2));return grams;
  }
  function singleModeTexts(text){
    const value=clean(text),header='【模式】选择1个能力发动。',at=value.indexOf(header);
    if(at<0)return [];
    const body=value.slice(at+header.length),markers=[...body.matchAll(/(?:^|\n)\s*\((\d+)\)/g)];
    if(markers.length<2||markers.length>6)return [];
    const last=markers[markers.length-1],lastBody=body.slice(last.index+last[0].length);
    const tailAt=lastBody.search(/\n\s*\n(?=【(?:入场曲|谢幕曲|进化时|超进化时|攻击时|交战时|启动)】)/);
    const tail=tailAt<0?'':lastBody.slice(tailAt);
    return markers.map((m,i)=>({label:'模式 '+m[1],text:value.slice(0,at)+body.slice(m.index+m[0].length,i+1<markers.length?markers[i+1].index:tailAt<0?body.length:last.index+last[0].length+tailAt).trim()+tail}));
  }
  function basic(a,b){
    const follower=a.type===1&&b.type===1;
    const kind=t=>t===2||t===3?2:t;
    let score=3*(kind(a.type)===kind(b.type)?1:0)+2*(a.class===b.class?1:0)+2*near(a.cost,b.cost)+near(a.rarity,b.rarity),max=8;
    if(follower){score+=near(a.attack,b.attack)+near(a.health,b.health);max+=2;}
    const tribes=new Set([...(a.tribes||[]),...(b.tribes||[])]);tribes.delete(0);
    if(tribes.size){score+=[...tribes].filter(t=>a.tribes.includes(t)&&b.tribes.includes(t)).length/tribes.size;max++;}
    return score/max;
  }
  function createEngine(cards){
    const prepare=c=>({features:features(c),text:textTokens(c),semantic:Semantics.extract(c)});
    const prepared=new Map(cards.map(c=>[c.id,prepare(c)]));
    // Count mechanism families once per card; never treat each numeric/target phrasing as rare.
    const corpus=cards.some(c=>!c.token)?cards.filter(c=>!c.token):cards,mechanismCounts=new Map();
    for(const c of corpus){const p=prepared.get(c.id),families=new Set([...p.features.values()].map(f=>f.family).filter(Boolean));
      for(const e of p.semantic)if(e.action!=='重复触发')families.add(Semantics.effectFamily(e));
      for(const family of families)mechanismCounts.set(family,(mechanismCounts.get(family)||0)+1);
    }
    const rarityFor=family=>({family,count:mechanismCounts.get(family)||0,total:corpus.length,multiplier:family?Math.min(3.5,1+.45*Math.log((corpus.length+5)/((mechanismCounts.get(family)||0)+5))):1});
    function applyRarity(p){
      for(const f of p.features.values()){f.baseWeight=f.w;f.multiplier=rarityFor(f.family).multiplier;f.w*=f.multiplier;}
      for(const e of p.semantic){e.baseWeight=e.weight;e.family=Semantics.effectFamily(e);e.multiplier=e.action==='重复触发'?1:rarityFor(e.family).multiplier;e.weight*=e.multiplier;}
    }
    for(const c of cards){const p=prepared.get(c.id);applyRarity(p);
      p.variants=singleModeTexts(c.text).map(mode=>{
        const evolvedSame=!c.evolvedText||normalize(c.evolvedText)===normalize(c.text);
        const variant=prepare({...c,text:mode.text,evolvedText:evolvedSame?mode.text:c.evolvedText});
        applyRarity(variant);return {...variant,label:mode.label};
      });
    }
    const df=new Map();for(const p of prepared.values())for(const k of p.text)df.set(k,(df.get(k)||0)+1);
    const weight=k=>1+Math.log((cards.length+1)/((df.get(k)||0)+1));
    const productsByName=new Map(),productCache=new Map();
    for(const card of cards)if(!productsByName.has(card.name)||card.token)productsByName.set(card.name,card);
    function productSimilarity(left,right){
      if(left===right)return 1;
      const key=JSON.stringify([left,right].sort());if(productCache.has(key))return productCache.get(key);
      const a=productsByName.get(left),b=productsByName.get(right);
      // One level only: generated cards may themselves generate cards, including each other.
      const value=a&&b ? .25+.65*comparePrepared(a,b,prepared.get(a.id),prepared.get(b.id),false).score/100 : .35;
      productCache.set(key,value);return value;
    }
    function comparePrepared(a,b,p,q,includeProducts=true){let total=0,shared=0;
      for(const k of new Set([...p.text,...q.text])){const w=weight(k);total+=w;if(p.text.has(k)&&q.text.has(k))shared+=w;}
      const bs=basic(a,b),exact=featureSimilarity(p.features,q.features),related=Semantics.similarity(p.semantic,q.semantic,includeProducts?productSimilarity:undefined),text=total?shared/total:1;
      const skill=exact+(1-exact)*.35*related;
      return {score:Math.min(99.99,100*(bs*.2+skill*.6+text*.2)),basic:bs*100,skill:skill*100,text:text*100,related:related*100};
    }
    function compare(a,b){
      if(a.id===b.id)return {score:100,basic:100,skill:100,text:100};
      const p=prepared.get(a.id),q=prepared.get(b.id),whole=comparePrepared(a,b,p,q);
      if(!p.variants.length&&!q.variants.length)return whole;
      let best=null;
      for(const left of p.variants.length?p.variants:[p])for(const right of q.variants.length?q.variants:[q]){
        const candidate=comparePrepared(a,b,left,right);
        if(!best||candidate.score>best.score)best={...candidate,modeMatch:{left:left.label||'完整卡牌',right:right.label||'完整卡牌'}};
      }
      // Compare a legal single choice, retaining a small contribution from the card's complete structure.
      return {...Object.fromEntries(['score','basic','skill','text','related'].map(k=>[k,best[k]*.9+whole[k]*.1])),modeMatch:best.modeMatch};
    }
    function rank(target,pool=cards){return pool.map(card=>({card,...compare(target,card)})).sort((a,b)=>b.score-a.score||a.card.id-b.card.id).map((row,i)=>({...row,rank:i+1}));}
    function explain(card,mode){const whole=prepared.get(card.id),p=whole.variants.find(v=>v.label===mode)||whole;return {features:[...p.features].map(([key,f])=>({key,...f})),semantic:p.semantic.map(e=>({...e})),modes:whole.variants.map(v=>v.label)};}
    return {compare,rank,rarityFor,explain,productSimilarity};
  }
  function poolFor(cards,{rotation=false,noTokens=true}={}){
    let ids=null;
    if(rotation){ids=new Set(cards.filter(c=>c.rotation&&!c.token).map(c=>c.id));const byId=new Map(cards.map(c=>[c.id,c]));
      for(const id of ids)for(const r of byId.get(id)?.related||[])if(byId.has(r))ids.add(r);
    }
    return cards.filter(c=>(!noTokens||!c.token)&&(!ids||ids.has(c.id))).sort((a,b)=>a.id-b.id);
  }
  function hash(seed){let h=2166136261;for(const c of String(seed)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
  function chooseTarget(pool,seed){return pool[hash(seed)%pool.length];}
  function hint(ranking,guessed){const used=new Set(guessed);const best=Math.min(ranking.length,...ranking.filter(r=>used.has(r.card.id)).map(r=>r.rank));
    const candidates=ranking.filter(r=>r.rank>1&&r.rank<best&&!used.has(r.card.id));
    return candidates.length?candidates[Math.floor(candidates.length*.55)]:null;
  }
  return {classes,types,effectTypes,clean,normalize,features,featureSimilarity,createEngine,poolFor,hash,chooseTarget,hint,singleModeTexts};
});
