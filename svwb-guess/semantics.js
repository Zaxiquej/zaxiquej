(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.WBGuessSemantics=factory();})(typeof globalThis==='object'?globalThis:this,function(){
  'use strict';
  // Partial equivalence of outcomes, not equality of rules or card strength.
  const links=[
    ['破坏','消失',.8],['回手','消失',.55],['回手','破坏',.5],['回牌组','回手',.7],
    ['回牌组','消失',.65],['回牌组','破坏',.55],['伤害','破坏',.4],['伤害','消失',.3],['伤害','回手',.2],
    ['抽牌','检索',.85],['抽牌','生成手牌',.55],['检索','生成手牌',.5],
    ['召唤','生成手牌',.35],['召唤','亡者召还',.8],['召唤','瞬念召唤',.7],['亡者召还','瞬念召唤',.55],
    ['跳费','回费',.55],['回费','减费',.55],['跳费','减费',.35],['费用设定','减费',.65],
    ['加身材','进化',.6],['加身材','超进化',.5],['进化','超进化',.8],
    ['疾驰','突进',.6],['回复生命','屏障',.4],['屏障','减伤',.7],['回复生命','减伤',.4],
    ['潜行','灵气',.45],['潜行','威慑',.5],['守护','屏障',.25],
    ['分配伤害','伤害',.6],['分配伤害','破坏',.25],['获得进化点','获得超进化点',.65],['虹吸','回复生命',.45]
  ];
  const affinities=new Map(links.flatMap(([a,b,n])=>[[a+'|'+b,n],[b+'|'+a,n]]));
  const removal=new Set(['破坏','消失','回手','回牌组','伤害']);
  const keywordActions=['疾驰','突进','屏障','守护','潜行','灵气','威慑','毁灭','虹吸'];
  const conditionNames=['觉醒','唤灵','连击','土之秘术','协作','奥义','解放奥义','爆能强化'];
  function conditionFamilies(text){
    const value=String(text||'');
    const result=conditionNames.filter(name=>new RegExp('【'+name+(['觉醒','奥义','解放奥义'].includes(name)?'(?:\\s+[^】]*)?':'\\s+[^】]+')+'】').test(value));
    // Highlander deck requirements, not ordinary same-name references or removing duplicates.
    if(value.split(/[。\n；]/).some(sentence=>/牌组/.test(sentence)&&(
      /(?:没有|不存在|不含|不包含)[^，。,]{0,10}(?:重复|同名|相同名称|名称相同)/.test(sentence)||
      /(?:卡牌(?:的)?名称|名称)(?:均|皆|全部|都|各|互相|各自)?(?:不相同|不同)/.test(sentence)||
      /(?:同名|相同名称)[^，。,]{0,10}(?:各只有|各仅有|最多有)1张/.test(sentence)
    )))result.push('宇宙条件');
    return [...new Set(result)];
  }
  // Effect amounts differ both in absolute distance and proportion (1 vs 4 is not 10 vs 13).
  function numberSimilarity(a,b){
    if(String(a)===String(b))return 1;
    if(a===undefined||b===undefined)return .4;
    const x=Number(a),y=Number(b);
    if(!Number.isFinite(x)||!Number.isFinite(y))return .35;
    const ratio=(Math.min(Math.abs(x),Math.abs(y))+1)/(Math.max(Math.abs(x),Math.abs(y))+1);
    return Math.sqrt(ratio)/(1+Math.abs(x-y)*.55);
  }
  const effectFamily=e=>'效果:'+(e.action==='伤害'&&e.side==='己'&&e.object==='主战者'?'自伤':e.action);
  function effectNumberSimilarity(a,b,family){
    const numeric=numberSimilarity(a,b);
    // Self-damage primarily matches the life-payment mechanism; its amount is a smaller component.
    return family==='效果:自伤'&&a!==undefined&&b!==undefined?.7+.3*numeric:numeric;
  }
  function effectBody(sentence){
    let body=sentence.trim();
    // Trigger subjects and enabling conditions are not effect targets or performed actions.
    if(!body.startsWith('使')&&!body.startsWith('选择')&&/^[^「」]*?时[，,]/.test(body))body=body.replace(/^[^「」]*?时[，,]/,'');
    return body.replace(/^(?:之后[，,]\s*)?若[\s\S]*?则[，,]?/,'');
  }
  function effectSections(text,initialTiming='常驻'){
    const sections=[];
    for(const paragraph of String(text||'').split(/\n\s*\n/)){
      let timing=initialTiming,body='';
      const flush=()=>{if(body.trim())sections.push({text:body,timing});body='';};
      for(const line of paragraph.split('\n')){
        const m=line.match(/^\s*((?:费用\s*\d+\s*)?【(入场曲|谢幕曲|超进化时|进化时|攻击时|交战时|魔力增幅时|启动)】)/);
        if(m){flush();timing=m[2];sections.push({text:'',timing,trigger:m[1]});body=line.slice(m[0].length);}
        else body+=(body?'\n':'')+line;
      }
      flush();
    }
    return sections;
  }
  function isPerformedMatch(sentence,m,action){
    const record=sentenceRecords(sentence).find(r=>m.index>=r.index&&m.index<r.index+r.sentence.length);
    if(record&&(record.index||record.sentence.length!==sentence.length)){const local=Array.from(m);local.index=m.index-record.index;return isPerformedMatch(record.sentence,local,action);}
    if(/^[\s（(\d）)]*[XYZ](?:为|是|起始)/.test(sentence))return false;
    for(const quoted of sentence.matchAll(/『[^』]*』/g))if(m.index>=quoted.index&&m.index<quoted.index+quoted[0].length)return false;
    if(grantedAbilities(sentence).some(g=>m.index>=g.start&&m.index<g.end))return false;
    const body=effectBody(sentence),offset=sentence.lastIndexOf(body);
    if(m.index<offset)return false;
    const before=sentence.slice(0,m.index),after=sentence.slice(m.index+m[0].length);
    if(!['无法攻击','破坏抗性','失去能力','失去关键词'].includes(action)&&(/(?:不会|不能|无法|不被)[^，,。]{0,18}$/.test(before)||/失去[^，,。]{0,12}$/.test(before)))return false;
    if(['破坏','消失','弃牌','进化','超进化','自动进化','自动超进化'].includes(action)&&(/被$|已经$/.test(before)||/^(?:时|的|过|前|后)/.test(after)))return false;
    if(m[0].startsWith('【')&&/(?:拥有|失去|发动与)\s*$/.test(before))return false;
    return true;
  }
  function actionTargetText(sentence,m,previousSelection=''){
    const body=effectBody(sentence),offset=sentence.lastIndexOf(body),at=Math.max(0,m.index-offset);
    const start=Math.max(body.lastIndexOf('，',at),body.lastIndexOf(',',at))+1;
    const next=body.slice(at).search(/[，,]/),end=next<0?body.length:at+next;
    let local=body.slice(start,end);
    if(m[0]==='变身为')local=local.slice(0,local.indexOf('变身为')+3);
    // Resolve a pronoun only from this sentence's selected object, not its trigger or condition.
    if(/(?:其|该随从|该卡牌|这些)/.test(local)&&!/本随从|本卡牌|(?:自己|对手)的(?:战场|主战者|手牌|牌组)/.test(local)){
      const selection=body.slice(0,start).match(/(?:选择|使)(?:自己|对手|战场)[^，,]+/)?.[0]||previousSelection;
      if(selection)local=selection+'，'+local;
    }
    return local.replace(/(?:使其)?返回(?:手牌|牌组)/g,'').replace(/『[^』]*』/g,'');
  }
  function sentenceContexts(part){
    return part.split(/\n\s*\n/).flatMap(block=>{
      let selection='',event='';
      return sentenceRecords(block).map(({sentence})=>{
        if(/^\s*[（(]\d+[）)]/.test(sentence))selection='';
        event=eventOf(sentence)||event;
        const selected=effectBody(sentence).match(/选择[^，,。]+/)?.[0];
        if(selected&&/随从|卡牌|护符|手牌|主战者/.test(selected))selection=selected;
        return {sentence,inHand:block.includes('在手牌中发动'),selection,event};
      });
    });
  }
  function sentenceRecords(text){
    const result=[];let depth=0,start=0;
    for(let i=0;i<=text.length;i++){
      if(text[i]==='「')depth++;if(text[i]==='」')depth--;
      if(i===text.length||depth===0&&/[。\n；]/.test(text[i])){if(i>start)result.push({sentence:text.slice(start,i),index:start});start=i+1;}
    }
    return result;
  }
  function grantedAbilities(text){
    const grants=[];
    for(const m of text.matchAll(/「([^「」]*)」/g)){
      const before=text.slice(0,m.index).split(/[。\n；]/).pop();
      if(!/获得[^，,。]*$/.test(before))continue;
      const selection=sentenceContexts(text.slice(0,m.index)).at(-1)?.selection||'';
      const target=/(?:本随从|本卡牌)获得/.test(effectBody(before))?effectBody(before):selection||effectBody(before);
      grants.push({text:m[1],start:m.index,end:m.index+m[0].length,side:!/(?:本随从|本卡牌)获得/.test(target)&&/对手|交战对手/.test(target)?'敌':'己'});
    }
    return grants;
  }
  function evolutionEvent(sentence){
    const m=sentence.match(/(自己|对手)的([^，。；]*?)随从(超进化|进化)时/);
    if(!m)return null;
    const limit=m[2].match(/(原始费用|费用)为([\dXYZ]+)(?:或)?(以上|以下)?的/);
    return {event:(m[1]==='自己'?'己':'敌')+'方随从'+m[3]+'时',condition:limit?limit[1]+(limit[3]==='以上'?'>=':limit[3]==='以下'?'<=':'=')+limit[2]:''};
  }
  function eventOf(sentence){return evolutionEvent(sentence)?.event||sentence.match(/本(?:随从|卡牌)(?:超进化|进化|被舍弃)时|(?:自己|对手)【启动】(?:证据·)?护符时|与本卡牌【融合】时|(?:自己|对手)(?:进行)?【融合】(?:护符)?时|(?:本卡牌|本随从|(?:自己|对手)的(?:卡牌|随从))在战场上消失时|(?:自己|对手)使用(?:随从|法术|护符|卡牌)时|(?:自己|对手)发动【土之秘术】时|(?:自己的|对手的)?回合(?:开始|结束)时|进入战场时|被破坏时|离开战场时|回复时/)?.[0]||'';}
  function selfCostChange(sentence,card){
    const m=sentence.match(/(?:本卡牌|本随从)(?:的)?费用(-|变为)([\dXYZ]+)/);
    if(!m)return null;
    return {action:m[1]==='-'||Number(m[2])<Number(card.cost)?'减费':'费用设定',mode:m[1]==='-'?'减少':'设为',value:m[2],duration:/回合结束前/.test(sentence)?'本回合':'持续'};
  }
  function targetRestrictionOf(sentence,action){
    if(!removal.has(action))return '';
    // Target qualifiers are distinct from damage amounts and from conditions that enable the effect.
    const m=effectBody(sentence).match(/(生命值|攻击力|原始费用|费用)(?:为|是)?([\dXYZ]+)(?:点)?(?:或)?(以下|以上)?的(?:随从|护符|卡牌)/);
    return m?m[1]+(m[3]==='以下'?'<=':m[3]==='以上'?'>=':'=')+m[2]:'';
  }
  function targetRestrictionSimilarity(a='',b=''){
    if(a===b)return 1;
    if(!a||!b)return .55;
    const parse=s=>s.match(/^(.+?)(<=|>=|=)([\dXYZ]+)$/),x=parse(a),y=parse(b);
    if(!x||!y||x[1]!==y[1])return .4;
    if(x[2]!==y[2])return .5;
    return .5+.5*numberSimilarity(x[3],y[3]);
  }
  function generatedProducts(sentence){
    const products=[];
    for(const list of effectBody(sentence).matchAll(/([\dXYZ]+张『[^』]+』(?:(?:和|与|、|及)[\dXYZ]+张『[^』]+』)*)(?:以非公开形式)?加入(?:自己的)?手牌/g)){
      for(const m of list[1].matchAll(/([\dXYZ]+)张『([^』]+)』/g))products.push({name:m[2],amount:m[1]});
    }
    return products;
  }
  function summonedProducts(sentence){
    const products=new Map();
    // Only consume the named summon list, not later references to cards in the same sentence.
    for(const list of effectBody(sentence).matchAll(/召唤(?:随机)?([\dXYZ]+[个张]『[^』]+』(?:(?:和|与|、|及)[\dXYZ]+[个张]『[^』]+』)*)/g)){
      for(const m of list[1].matchAll(/([\dXYZ]+)[个张]『([^』]+)』/g)){
        const old=products.get(m[2]),amount=old===undefined?m[1]:Number.isFinite(+old)&&Number.isFinite(+m[1])?String(+old + +m[1]):'X';
        products.set(m[2],amount);
      }
    }
    return [...products].map(([name,amount])=>({name,amount}));
  }
  function timingSimilarity(a,b){
    if(a===b)return 1;
    if(['使用时','入场曲'].includes(a)&&['使用时','入场曲'].includes(b))return .9;
    if(['进化时','超进化时'].includes(a)&&['进化时','超进化时'].includes(b))return .8;
    return .6;
  }
  function scopeOf(sentence){
    sentence=effectBody(sentence);
    if(/所有|全体/.test(sentence))return '全体';
    if(/随机/.test(sentence))return '随机';
    if([...sentence.matchAll(/(\d+)(?:个(?:随从|护符)|张卡牌)/g)].some(m=>+m[1]>1))return '多体';
    return '单体';
  }
  function conditionOf(sentence){
    const named=sentence.match(/【(?:觉醒|连击|土之秘术|唤灵|协作|奥义|解放奥义|爆能强化)(?:\s*[^】]*)?】/);
    const explicit=sentence.match(/若(.+?)(?:，?则|，)/);
    return (named?.[0]||explicit?.[0]||'').replace(/\s+/g,'');
  }
  function isUpgrade(sentence){return !!conditionOf(sentence)&&/改为/.test(sentence);}
  const patterns=[
    ['伤害',/造成([\dXYZ]+)点伤害/g],['分配伤害',/分配([\dXYZ]+)点伤害/g],['回复生命',/回复[^。；，,]*?([\dXYZ]+)点生命值|回复至上限/g],
    ['抽牌',/抽取([\dXYZ]+)张([^。；]*)/g],['召唤',/召唤(?:随机)?(?:([\dXYZ]+)[个张种]|对应数量的复制随从|其中的所有[^。；，,「」]*随从|该随从)/g],
    ['破坏',/破坏/g],['消失',/消失/g],['回手',/返回手牌/g],['回牌组',/返回牌组/g],
    ['生成手牌',/加入(?:自己的)?手牌/g],['跳费',/能量点最大值\+([\dXYZ]+)/g],
    ['回费',/回复(?:自己|对手)?([\dXYZ]+)点能量点|回复自己的能量点至上限/g],['减费',/费用-([\dXYZ]+)/g],['费用设定',/费用变为([\dXYZ]+)/g],
    ['加身材',/\+([\dXYZ]+)\/\+([\dXYZ]+)/g],['减身材',/-([\dXYZ]+)\/-([\dXYZ]+)/g],['混合身材',/([+-][\dXYZ]+)\/([+-][\dXYZ]+)/g],
    ['超进化',/(?:使[^。；，,]*?|(?:该随从和)?本随从)超进化(?![前后时])/g],['进化',/(?:使[^。；，,]*?|(?:该随从和)?本随从)(?<!超)进化(?![前后时])/g],
    ['获得进化点',/回复自己([\dXYZ]+)点进化点|(?<!超)进化点\+([\dXYZ]+)/g],['获得超进化点',/回复自己([\dXYZ]+)点超进化点|超进化点\+([\dXYZ]+)/g],
    ['魔力增幅',/发动([\dXYZ]+)次魔力增幅/g],['增加连击',/【连击】\+([\dXYZ]+)/g],['增加土之印',/土之印\+([\dXYZ]+)/g],
    ['变身',/变身为/g],['弃牌',/舍弃/g],['攻击次数',/1回合可以攻击([\dXYZ]+)次/g],
    ['生命设定',/生命值变为([\dXYZ]+)/g],['生命上限设定',/生命值的最大值变为([\dXYZ]+)/g],['费用减半',/费用变为一半/g],['替换牌组',/牌组变为/g],
    ['证据',/【证据】/g],['消耗证据',/证据-([\dXYZ]+)/g],['增加证据',/证据\+([\dXYZ]+)/g],
    ['交换攻血',/攻击力与生命值交换/g],['身材设定',/变为攻击力([\dXYZ]+)\/生命值([\dXYZ]+)/g],
    ['生命上限减半',/生命值的最大值变为一半/g],['增加墓场',/墓场\+([\dXYZ]+)/g],
    ['增加倒计数',/倒计数\+([\dXYZ]+)/g],['减少倒计数',/倒计数-([\dXYZ]+)/g],
    ['无法攻击',/无法攻击随从或主战者/g],['破坏抗性',/不会被能力破坏/g],['失去能力',/失去所有能力/g],['失去关键词',/失去【([^】]+)】/g],
    ['亡者召还',/【亡者召还\s*([\dXYZ]+)】/g],['瞬念召唤',/【瞬念召唤】/g],
    ...keywordActions.map(k=>[k,new RegExp('【'+k+'】','g')]),
    ['减伤',/受到的伤害(?:减少|减去|变为)/g]
  ];
  const trim=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/_/g,' ').trim();
  function repeatedTriggers(text){
    return [...trim(text).matchAll(/【(入场曲|谢幕曲|超进化时|进化时|攻击时|交战时|魔力增幅时|启动)】[^【]*?发动与【([^】]+)】相同的能力。/g)]
      .map(m=>({timing:m[1],reference:m[2]}));
  }
  function expandText(text){
    const refs=[];
    const masked=trim(text).replace(/发动与【([^】]+)】相同的能力。/g,(_,name)=>`@@repeat${refs.push(name)-1}@@`);
    const bodies=new Map();
    for(const section of effectSections(masked)){
      if(section.text&&!bodies.has(section.timing))bodies.set(section.timing,section.text.replace(new RegExp('^\\s*【(?:'+keywordActions.join('|')+')】\\s*$','gm'),'').trim());
    }
    const expanded=masked.replace(/@@repeat(\d+)@@/g,(_,index)=>{
      const body=bodies.get(refs[+index]);return body&&!body.includes('@@repeat')?body:'重复触发能力。';
    });
    // Short upgrades refer to the preceding operation in the same paragraph.
    return expanded.split(/\n\s*\n/).map(block=>{
      const summon=block.match(/召唤[\dXYZ]+[个张]『([^』]+)』/);
      const repeated=block.match(/发动[\dXYZ]+次「([^「」]+)」/);
      if(summon)block=block.replace(/改为召唤([\dXYZ]+)([个张])(?=[。；])/g,`改为召唤$1$2『${summon[1]}』`);
      if(repeated)block=block.replace(/改为发动([\dXYZ]+)次(?=[。；])/g,`改为发动$1次「${repeated[1]}」`);
      if(/造成[\dXYZ]+点伤害/.test(block))block=block.replace(/改为([\dXYZ]+)点伤害/g,'改为造成$1点伤害');
      return block;
    }).join('\n\n');
  }
  function extract(card){
    const items=new Map();
    function parse(text,source='本体',weight=1,initialTiming=card.type===4?'使用时':'常驻',controller='己'){
      for(const repeat of repeatedTriggers(text)){
        const item={action:'重复触发',side:'己',object:'能力',zone:'能力',scope:'单体',...repeat,event:'',source,weight:weight*.35,numbers:[],recipient:'',condition:'',upgrade:false};
        items.set(JSON.stringify(['重复触发',source,repeat.timing,repeat.reference]),item);
      }
      for(const {text:part,timing} of effectSections(expandText(text),initialTiming)){
        if(!part)continue;
        for(const grant of grantedAbilities(part))parse(grant.text,source+'/赋予',weight*.7,'常驻',grant.side);
        const previous=new Map();
        for(const {sentence,inHand,selection,event} of sentenceContexts(part)){
          for(const [action,re]of patterns)for(const m of sentence.matchAll(re)){
            if(!isPerformedMatch(sentence,m,action))continue;
            if(action==='混合身材'&&m[1][0]===m[2][0])continue;
            const cost=['减费','费用设定'].includes(action)?selfCostChange(sentence,card):null;
            const op=cost?cost.action:action==='抽牌'&&m[2]&&!/^卡牌/.test(m[2])?'检索':action;
            // Destination words must not overwrite the selected card's location/type.
            const targetText=actionTargetText(sentence,m,selection);
            let side=/对手/.test(targetText)?'敌':'己';
            let object=/主战者/.test(targetText)&&/随从/.test(targetText)?'随从及主战者':/主战者/.test(targetText)?'主战者':/随从/.test(targetText)?'随从':/护符/.test(targetText)?'护符':/战场|卡牌/.test(targetText)?'卡牌':'随从';
            let zone=/手牌/.test(targetText)?'手牌':/牌组/.test(targetText)?'牌组':'战场';
            if(/所有主战者/.test(targetText)||/战场上的所有随从/.test(targetText)&&!/(?:自己|对手)的战场/.test(targetText))side='双方';
            if(['抽牌','检索','生成手牌'].includes(op)){side=/对手(?:抽取|的手牌)|加入对手/.test(sentence)?'敌':'己';object='资源';zone='资源';}
            if(['召唤','亡者召还','瞬念召唤'].includes(op)){side=/对手的战场/.test(sentence)?'敌':'己';object='资源';zone='资源';}
            if(['跳费','回费','减费','费用设定'].includes(op)){object='能量';zone='资源';}
            if(cost)side='己';
            if(['获得进化点','获得超进化点','增加连击'].includes(op)){side='己';object='资源';zone='资源';}
            if(['消耗证据','增加证据','证据'].includes(op)){object='护符';zone='战场';}
            if(op==='增加墓场'){object='资源';zone='墓场';}
            if(['增加倒计数','减少倒计数'].includes(op)){object=/纹章/.test(sentence)?'纹章':'护符';zone='战场';}
            if(['破坏','消失'].includes(op)&&/本纹章/.test(targetText)){object='纹章';zone='战场';}
            if(op==='弃牌'){object='卡牌';zone='手牌';}
            if(op==='魔力增幅'){object='卡牌';zone='手牌';}
            if(['无法攻击','攻击次数','破坏抗性'].includes(op))object='随从';
            let scope=scopeOf(targetText);
            const innate=keywordActions.includes(op)&&sentence.trim()===m[0];
            const effectTiming=innate?'常驻':timing;
            const recipient=cost?'本体':[...keywordActions,'加身材','减身材','混合身材','交换攻血','身材设定','证据','进化','超进化','无法攻击','攻击次数','破坏抗性'].includes(op)?innate||/本随从|本卡牌/.test(targetText)||sentence.trim()===m[0]?'本体':'对象':'';
            if(inHand&&recipient==='本体'&&!cost)zone='手牌';
            const numbers=(op==='抽牌'||op==='检索'?m.slice(1,2):m.slice(1)).filter(x=>x!==undefined&&/^[+-]?[\dXYZ]+$/.test(x)).map(String);
            const condition=[conditionOf(sentence),evolutionEvent(sentence)?.condition].filter(Boolean).join('；'),upgrade=isUpgrade(sentence);
            // "改为分配6点伤害" inherits the previous action's target, not the condition's subject.
            if(upgrade&&!/(?:自己|对手|本随从|本卡牌|主战者|随从|护符|手牌|牌组)/.test(effectBody(sentence))&&previous.has(op))({side,object,zone,scope}=previous.get(op));
            if(controller==='敌')side=side==='己'?'敌':side==='敌'?'己':side;
            const targetRestriction=targetRestrictionOf(sentence,op);
            const item={action:op,side,object,zone,scope,timing:effectTiming,event:innate?'':event,source,weight:weight*(upgrade?.5:1),numbers,recipient,condition,upgrade,targetRestriction};
            if(op==='失去关键词')item.reference=m[1];
            if(op==='回费'&&m[0].includes('至上限'))item.numbers=['上限'];
            if(op==='召唤'&&!summonedProducts(sentence).length){
              item.summonKind=/复制随从/.test(sentence)?'复制':/与本随从同名/.test(sentence)?'同名':/其中的所有/.test(m[0])?'抽取后召唤':/牌组/.test(sentence)?'牌组':/被破坏/.test(sentence)?'复活':'一般';
              if(!item.numbers.length)item.numbers=[sentence.match(/选择[^，,]*?([\dXYZ]+)[张个]/)?.[1]||'X'];
            }
            const repetition=sentence.match(/发动([\dXYZ]+)次「/);
            if(repetition&&m.index>repetition.index&&m.index<sentence.lastIndexOf('」'))item.repetitions=repetition[1];
            if(cost)Object.assign(item,{costMode:cost.mode,duration:cost.duration,activation:inHand?'手牌':'一般'});
            const products=op==='生成手牌'?generatedProducts(sentence):op==='召唤'?summonedProducts(sentence):[];
            for(const effect of products.length?products.map(p=>({...item,product:p.name,numbers:[p.amount]})):[item]){
              const key=JSON.stringify([op,side,object,zone,scope,effectTiming,event,source,effect.numbers,recipient,condition,effect.product,targetRestriction,effect.costMode,effect.duration,effect.activation,effect.summonKind,effect.repetitions]);items.set(key,effect);
            }
            previous.set(op,{side,object,zone,scope});
          }
        }
      }
    }
    parse(card.text);if(trim(card.evolvedText)!==trim(card.text))parse(card.evolvedText,'进化后',.7);
    for(const e of card.effects||[])parse(e.text,'附属'+e.type,.7,e.type===3?'使用时':'常驻');
    return [...items.values()];
  }
  function affinity(a,b,compareProducts){
    const relation=a.action===b.action?1:affinities.get(a.action+'|'+b.action)||0;
    if(!relation)return 0;
    const side=a.side===b.side?1:a.action===b.action&&['回手','回牌组'].includes(a.action)?.3:a.action===b.action&&['破坏','消失'].includes(a.action)?.12:0;
    if(!side)return 0;
    // A hand discard/banish and battlefield removal have different purposes.
    if(a.zone!==b.zone)return 0;
    if(a.action!==b.action&&(removal.has(a.action)||removal.has(b.action))&&(a.object==='主战者'||b.object==='主战者'))return 0;
    const object=a.object===b.object?1:a.object==='卡牌'||b.object==='卡牌'?.75:.25;
    // Innate and self-gained keywords have the same eventual capability; acquisition is a modest distinction.
    // Conditions, events and sources below still apply, and granting another object is not covered.
    const innateToSelfGain=keywordActions.includes(a.action)&&keywordActions.includes(b.action)&&a.recipient==='本体'&&b.recipient==='本体'&&((a.timing==='常驻')!==(b.timing==='常驻'));
    const timing=innateToSelfGain?.85:timingSimilarity(a.timing,b.timing);
    const scope=a.scope===b.scope?1:a.scope==='全体'||b.scope==='全体'?.3:a.scope==='多体'||b.scope==='多体'?.65:.75;
    const recipient=a.recipient===b.recipient?1:.5;
    const condition=a.condition===b.condition?1:!a.condition||!b.condition?.75:.85;
    const reference=a.reference===b.reference?1:.5;
    const product=a.action===b.action&&['生成手牌','召唤'].includes(a.action)?(a.product===b.product?1:!a.product||!b.product?.65:compareProducts?compareProducts(a.product,b.product):.35):1;
    const source=a.source===b.source?1:.6,event=a.event===b.event?1:a.event&&b.event&&a.event.replace('超进化','进化')===b.event.replace('超进化','进化')?.8:.7;
    const duration=a.duration===b.duration?1:.85,activation=a.activation===b.activation?1:.75;
    const summonKind=a.summonKind===b.summonKind?1:.65,repetitions=numberSimilarity(a.repetitions||'1',b.repetitions||'1');
    let amount=1;
    // Numeric values are comparable only for the same operation (damage is not a removal count).
    if(a.costMode&&b.costMode&&a.costMode!==b.costMode)amount=.85;
    else if(a.action===b.action){const length=Math.max(a.numbers.length,b.numbers.length);if(length){let sum=0;
      for(let i=0;i<length;i++)sum+=effectNumberSimilarity(a.numbers[i],b.numbers[i],effectFamily(a)===effectFamily(b)?effectFamily(a):'');amount=sum/length;
    }}
    return relation*side*object*timing*scope*source*event*amount*recipient*condition*reference*product*duration*activation*summonKind*repetitions*targetRestrictionSimilarity(a.targetRestriction,b.targetRestriction);
  }
  // Maximum-weight one-to-one matching: one effect cannot explain several different effects.
  function similarity(a,b,compareProducts){
    if(!a.length||!b.length)return 0;
    const n=Math.max(a.length,b.length),matrix=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>a[i]&&b[j]?affinity(a[i],b[j],compareProducts)*Math.min(a[i].weight,b[j].weight):0));
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
  return {extract,affinity,similarity,links,scopeOf,keywordActions,conditionOf,isUpgrade,expandText,repeatedTriggers,numberSimilarity,conditionNames,conditionFamilies,effectBody,generatedProducts,summonedProducts,timingSimilarity,targetRestrictionOf,targetRestrictionSimilarity,effectFamily,effectNumberSimilarity,sentenceContexts,evolutionEvent,eventOf,selfCostChange,effectSections,isPerformedMatch,actionTargetText,grantedAbilities};
});
