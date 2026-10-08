(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.WBGuessSemantics=factory();})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  // Partial equivalence of outcomes, not equality of rules or card strength.
  const links=[
    ['破坏','消失',.8],['回手','消失',.55],['回手','破坏',.5],['回牌组','回手',.7],
    ['回牌组','消失',.65],['回牌组','破坏',.55],['伤害','破坏',.4],['伤害','消失',.3],['伤害','回手',.2],
    ['抽牌','检索',.85],['抽牌','生成手牌',.55],['检索','生成手牌',.5],
    ['召唤','生成手牌',.35],['召唤','亡者召还',.8],['召唤','瞬念召唤',.7],['亡者召还','瞬念召唤',.55],
    ['跳费','回费',.55],['回费','减费',.55],['跳费','减费',.35],
    ['加身材','进化',.6],['加身材','超进化',.5],['进化','超进化',.8],
    ['疾驰','突进',.6],['回复生命','屏障',.4],['屏障','减伤',.7],['回复生命','减伤',.4],
    ['潜行','灵气',.45],['潜行','威慑',.5],['守护','屏障',.25]
  ];
  const affinities=new Map(links.flatMap(([a,b,n])=>[[a+'|'+b,n],[b+'|'+a,n]]));
  const removal=new Set(['破坏','消失','回手','回牌组','伤害']);
  const keywordActions=['疾驰','突进','屏障','守护','潜行','灵气','威慑'];
  // Effect amounts differ both in absolute distance and proportion (1 vs 4 is not 10 vs 13).
  function numberSimilarity(a,b){
    if(String(a)===String(b))return 1;
    if(a===undefined||b===undefined)return .4;
    const x=Number(a),y=Number(b);
    if(!Number.isFinite(x)||!Number.isFinite(y))return .35;
    const ratio=(Math.min(Math.abs(x),Math.abs(y))+1)/(Math.max(Math.abs(x),Math.abs(y))+1);
    return Math.sqrt(ratio)/(1+Math.abs(x-y)*.55);
  }
  function scopeOf(sentence){
    if(/所有|全体/.test(sentence))return '全体';
    if(/随机/.test(sentence))return '随机';
    if([...sentence.matchAll(/(\d+)(?:个(?:随从|护符)|张卡牌)/g)].some(m=>+m[1]>1))return '多体';
    return '单体';
  }
  function conditionOf(sentence){
    const named=sentence.match(/【(?:连击|土之秘术|唤灵|协作|奥义|解放奥义)(?:\s*[^】]*)?】/);
    const explicit=sentence.match(/若(.+?)(?:，?则|，)/);
    return (named?.[0]||explicit?.[0]||'').replace(/\s+/g,'');
  }
  function isUpgrade(sentence){return !!conditionOf(sentence)&&/改为/.test(sentence);}
  const patterns=[
    ['伤害',/造成([\dXYZ]+)点伤害/g],['回复生命',/回复[^。；]*?([\dXYZ]+)点生命值|回复至上限/g],
    ['抽牌',/抽取([\dXYZ]+)张([^。；]*)/g],['召唤',/召唤([\dXYZ]+)个/g],
    ['破坏',/破坏/g],['消失',/消失/g],['回手',/返回手牌/g],['回牌组',/返回牌组/g],
    ['生成手牌',/加入(?:自己的)?手牌/g],['跳费',/能量点最大值\+([\dXYZ]+)/g],
    ['回费',/回复(?:自己|对手)?([\dXYZ]+)点能量点/g],['减费',/费用-([\dXYZ]+)/g],
    ['加身材',/\+([\dXYZ]+)\/\+([\dXYZ]+)/g],['超进化',/使[^。；]*?超进化/g],['进化',/使[^。；]*?(?<!超)进化/g],
    ['亡者召还',/【亡者召还\s*([\dXYZ]+)】/g],['瞬念召唤',/【瞬念召唤】/g],
    ...keywordActions.map(k=>[k,new RegExp('【'+k+'】','g')]),
    ['减伤',/受到的伤害(?:减少|减去|变为)/g]
  ];
  const triggers=/((?:费用\s*\d+\s*)?【(?:入场曲|谢幕曲|超进化时|进化时|攻击时|交战时|魔力增幅时|启动)】)/g;
  const trim=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/_/g,' ').trim();
  function repeatedTriggers(text){
    return [...trim(text).matchAll(/【(入场曲|谢幕曲|超进化时|进化时|攻击时|交战时|魔力增幅时|启动)】[^【]*?发动与【([^】]+)】相同的能力。/g)]
      .map(m=>({timing:m[1],reference:m[2]}));
  }
  function expandText(text){
    const refs=[];
    const masked=trim(text).replace(/发动与【([^】]+)】相同的能力。/g,(_,name)=>`@@repeat${refs.push(name)-1}@@`);
    const bodies=new Map();let phase='';
    for(const part of masked.split(triggers).filter(Boolean)){
      if(/^(?:费用\s*\d+\s*)?【[^】]+】$/.test(part))phase=part.match(/【([^】]+)】/)[1];
      else if(phase&&!bodies.has(phase))bodies.set(phase,part.replace(new RegExp('^\\s*【(?:'+keywordActions.join('|')+')】\\s*$','gm'),'').trim());
    }
    return masked.replace(/@@repeat(\d+)@@/g,(_,index)=>{
      const body=bodies.get(refs[+index]);return body&&!body.includes('@@repeat')?body:'重复触发能力。';
    });
  }
  function extract(card){
    const items=new Map();
    function parse(text,source='本体',weight=1){
      for(const repeat of repeatedTriggers(text)){
        const item={action:'重复触发',side:'己',object:'能力',zone:'能力',scope:'单体',...repeat,event:'',source,weight:weight*.35,numbers:[],recipient:'',condition:'',upgrade:false};
        items.set(JSON.stringify(['重复触发',source,repeat.timing,repeat.reference]),item);
      }
      let timing='常驻';
      for(const part of expandText(text).split(triggers).filter(Boolean)){
        if(/^(?:费用\s*\d+\s*)?【(?:入场曲|谢幕曲|超进化时|进化时|攻击时|交战时|魔力增幅时|启动)】$/.test(part)){timing=part.match(/【([^】]+)】/)[1];continue;}
        for(const sentence of part.split(/[。\n；]/).filter(Boolean)){
          const event=sentence.match(/(?:自己的|对手的)?回合(?:开始|结束)时|进入战场时|被破坏时|离开战场时|回复时/)?.[0]||'';
          for(const [action,re]of patterns)for(const m of sentence.matchAll(re)){
            const before=sentence.slice(0,m.index),after=sentence.slice(m.index+m[0].length);
            // References to a keyword, negated actions and trigger conditions are not performed effects.
            if(/(?:不会|不能|无法|没有|不被)[^，]{0,12}$/.test(before)||/失去[^，]{0,8}$/.test(before))continue;
            if(['破坏','消失'].includes(action)&&(/被$|已经$/.test(before)||/^(?:时|的|过)/.test(after)))continue;
            if(m[0].startsWith('【')&&/拥有\s*$/.test(before))continue;
            if(action==='进化'&&m[0].includes('超进化'))continue;
            const op=action==='抽牌'&&m[2]&&!/^卡牌/.test(m[2])?'检索':action;
            // Destination words must not overwrite the selected card's location/type.
            const targetText=sentence.replace(/(?:使其)?返回(?:手牌|牌组)/g,'').replace(/『[^』]*』/g,'');
            let side=/对手/.test(targetText)?'敌':'己';
            let object=/主战者/.test(targetText)?'主战者':/随从/.test(targetText)?'随从':/护符/.test(targetText)?'护符':/战场|卡牌/.test(targetText)?'卡牌':'随从';
            let zone=/手牌/.test(targetText)?'手牌':/牌组/.test(targetText)?'牌组':'战场';
            if(/所有主战者/.test(targetText)||/战场上的所有随从/.test(targetText)&&!/(?:自己|对手)的战场/.test(targetText))side='双方';
            if(['抽牌','检索','生成手牌'].includes(op)){side=/对手(?:抽取|的手牌)|加入对手/.test(sentence)?'敌':'己';object='资源';zone='资源';}
            if(['召唤','亡者召还','瞬念召唤'].includes(op)){side=/对手的战场/.test(sentence)?'敌':'己';object='资源';zone='资源';}
            if(['跳费','回费','减费'].includes(op)){object='能量';zone='资源';}
            const scope=scopeOf(sentence);
            const innate=keywordActions.includes(op)&&sentence.trim()===m[0];
            const effectTiming=innate?'常驻':timing;
            const recipient=[...keywordActions,'加身材','进化','超进化'].includes(op)?innate||/本随从|本卡牌/.test(targetText)?'本体':'对象':'';
            const numbers=(op==='抽牌'||op==='检索'?m.slice(1,2):m.slice(1)).filter(x=>x!==undefined&&/^[\dXYZ]+$/.test(x)).map(String);
            const condition=conditionOf(sentence),upgrade=isUpgrade(sentence);
            const item={action:op,side,object,zone,scope,timing:effectTiming,event,source,weight:weight*(upgrade?.5:1),numbers,recipient,condition,upgrade};
            const key=JSON.stringify([op,side,object,zone,scope,effectTiming,event,source,numbers,recipient,condition]);items.set(key,item);
          }
        }
      }
    }
    parse(card.text);if(trim(card.evolvedText)!==trim(card.text))parse(card.evolvedText,'进化后',.7);
    for(const e of card.effects||[])parse(e.text,'附属'+e.type,.7);
    return [...items.values()];
  }
  function affinity(a,b){
    const relation=a.action===b.action?1:affinities.get(a.action+'|'+b.action)||0;
    if(!relation)return 0;
    const side=a.side===b.side?1:a.action===b.action&&['回手','回牌组'].includes(a.action)?.3:a.action===b.action&&['破坏','消失'].includes(a.action)?.12:0;
    if(!side)return 0;
    // A hand discard/banish and battlefield removal have different purposes.
    if(a.zone!==b.zone)return 0;
    if(a.action!==b.action&&(removal.has(a.action)||removal.has(b.action))&&(a.object==='主战者'||b.object==='主战者'))return 0;
    const object=a.object===b.object?1:a.object==='卡牌'||b.object==='卡牌'?.75:.25;
    const timing=a.timing===b.timing?1:['进化时','超进化时'].includes(a.timing)&&['进化时','超进化时'].includes(b.timing)?.8:.6;
    const scope=a.scope===b.scope?1:a.scope==='全体'||b.scope==='全体'?.3:a.scope==='多体'||b.scope==='多体'?.65:.75;
    const recipient=a.recipient===b.recipient?1:.5;
    const condition=a.condition===b.condition?1:!a.condition||!b.condition?.75:.85;
    const reference=a.reference===b.reference?1:.5;
    const source=a.source===b.source?1:.6,event=a.event===b.event?1:.7;
    let amount=1;
    // Numeric values are comparable only for the same operation (damage is not a removal count).
    if(a.action===b.action){const length=Math.max(a.numbers.length,b.numbers.length);if(length){let sum=0;
      for(let i=0;i<length;i++)sum+=numberSimilarity(a.numbers[i],b.numbers[i]);amount=sum/length;
    }}
    return relation*side*object*timing*scope*source*event*amount*recipient*condition*reference;
  }
  // Maximum-weight one-to-one matching: one effect cannot explain several different effects.
  function similarity(a,b){
    if(!a.length||!b.length)return 0;
    const n=Math.max(a.length,b.length),matrix=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>a[i]&&b[j]?affinity(a[i],b[j])*Math.min(a[i].weight,b[j].weight):0));
    const u=Array(n+1).fill(0),v=Array(n+1).fill(0),p=Array(n+1).fill(0),way=Array(n+1).fill(0);
    for(let i=1;i<=n;i++){
      p[0]=i;let j0=0;const min=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);
      do{used[j0]=true;const i0=p[j0];let delta=Infinity,j1=0;
        for(let j=1;j<=n;j++)if(!used[j]){const cur=-matrix[i0-1][j-1]-u[i0]-v[j];if(cur<min[j]){min[j]=cur;way[j]=j0;}if(min[j]<delta){delta=min[j];j1=j;}}
        for(let j=0;j<=n;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta;}else min[j]-=delta;j0=j1;
      }while(p[j0]!==0);
      do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0);
    }
    let matched=0;for(let j=1;j<=n;j++)matched+=matrix[p[j]-1][j-1];
    return Math.max(0,Math.min(1,2*matched/(a.reduce((s,x)=>s+x.weight,0)+b.reduce((s,x)=>s+x.weight,0))));
  }
  return {extract,affinity,similarity,links,scopeOf,keywordActions,conditionOf,isUpgrade,expandText,repeatedTriggers,numberSimilarity};
});
