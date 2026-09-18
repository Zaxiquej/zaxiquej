(function(root){
  'use strict';
  function build(ctx){
    const {card,cost,cls,rarity,r,pick,weighted,profile,makeEffect,gate,composeEmblem,add,used,calibration,canChooseTarget}=ctx;
    const spell=card.type==='spell',remaining=()=>card.budget-card.spent-(ctx.reserveProgress||0);
    const alternate=!!ctx.alternate,spellLimit=Math.min(alternate?2:5,[2,3,4,5][rarity]);
    const effectLimit=Math.min(alternate?2:5,[2,3,4,5][rarity]);
    const helpers=new Set(['enhance','activate','lastWordsAct','countdownAct','discardTrigger','exhaustibleCycle','handLuck']);
    const atoms=a=>a.kind==='keyword'?0:a.kind==='handTrigger'?1:Math.max(a.kind==='emblem'||a.kind==='ongoing'?1:0,(a.ids||[]).filter(id=>!helpers.has(id)).length);
    const effectCount=()=>card.abilities.reduce((n,a)=>n+atoms(a),0);
    card.effectLimit=effectLimit;
    const temp=(ids,fn)=>{const before=new Set(used);ids.forEach(id=>used.add(id));try{return fn();}finally{used.clear();before.forEach(id=>used.add(id));}};
    // Effects are independent atoms; a mode buys its strongest branch, not both.
    function payload(limit,trigger,minimum=0,condition='none',effectiveCost=cost,modes=true,valuation={multiplier:1,credit:0}){
      const reserve=!spell&&card.countdown===null&&trigger==='入场曲'&&!card.abilities.some(a=>['启动','谢幕曲','持续触发','自己的回合开始时','自己的回合结束时'].includes(a.trigger))?1:0;
      const slots=effectLimit-effectCount()-reserve;if(slots<=0)return null;
      const required=cost>=7?Math.max(0,(card.budget*.55-card.spent)/valuation.multiplier+valuation.credit):0;
      if(slots===1)minimum=Math.max(minimum,required);
      const complexity={simple:rarity===0,maxAtoms:rarity===0?1:slots};
      let e=makeEffect(limit,trigger,condition,minimum,true,effectiveCost,false,complexity);
      if(!e)return null;
      if(e.ids.length===slots&&e.raw<required){
        e=makeEffect(limit,trigger,condition,required,true,effectiveCost,false,complexity);
        if(!e)return null;
      }
      if(modes&&canChooseTarget(trigger)&&rarity>=1&&e.ids.length<slots&&r()<[0,.15,.25,.35][rarity]){
        const other=temp(e.ids,()=>makeEffect(limit-.55,trigger,condition,minimum,true,effectiveCost,false,{...complexity,maxAtoms:slots-e.ids.length}));
        if(other&&Math.max(e.raw,other.raw)+.55<=limit&&(e.ids.length+other.ids.length<slots||Math.max(e.raw,other.raw)+.55>=required)){
          e={ids:[...e.ids,...other.ids],raw:Math.max(e.raw,other.raw)+.55,text:`【模式】选择1个能力发动。\n（1）${e.text}\n（2）${other.text}`,tokens:[...e.tokens,...other.tokens],mode:true};
        }
      }
      return e;
    }
    function emit(e,trigger,price,extra={}){
      if(!e||card.abilities.length>=5||price>remaining()+1e-8||effectCount()+atoms(e)>effectLimit)return false;
      if(cost>=7&&effectCount()+atoms(e)===effectLimit&&card.spent+price<card.budget*.55)return false;
      const prefix=trigger==='法术'?'':`【${trigger}】`;
      add({...e,kind:e.mode?'mode':'effect',trigger,condition:'none',price,bodyText:e.text,text:prefix+e.text,...extra});
      return true;
    }
    function crest(){
      if(alternate)return;
      if(cost<2||rarity===0||r()>[0,.05,.13,.24][rarity])return;
      const duration=weighted(r,[[null,30],[2,24],[3,24],[4,14],[5,8]]),c=composeEmblem(duration,true);
      const raw=c.raw*(c.oneShot?1/(1+duration*.18):duration===null?1.4:({2:.82,3:1,4:1.12,5:1.22})[duration])+c.enabler.raw;
      if(raw>remaining()*.72)return;
      const emblem={id:(alternate?'accelerate-emblem-':'emblem-')+cls,name:`纹章：${card.name}${alternate?'的余辉':''}`,class:cls,kind:'emblem',custom:true,duration,engine:c.engine,eventId:c.eventId,conditionId:c.conditionId,limit:c.limit,effects:c.effects,supportTags:c.supportTags,text:(duration===null?'':`【吟唱 ${duration}】\n`)+c.text};
      const text=`使自己获得『${emblem.name}』。${c.enabler.text}`;
      if(emit({text,raw,ids:['emblemGrant'],tokens:c.tokens},spell?'法术':'入场曲',raw,{kind:'emblem',emblemIds:[emblem.id]}))card.emblems.push(emblem);
    }
    function enhancement(){
      if(alternate||rarity===0||effectCount()>=effectLimit)return;
      if(cost>=10||remaining()<.4||r()>(cls===2?.25:.1)||used.has('enhance'))return;
      const g=gate('爆能强化'),room=remaining();
      const e=payload(Math.min(28,room+g.extra),'爆能强化',g.minRaw,'enhance',g.fee,false,{multiplier:1,credit:g.extra});
      if(!e)return;
      const price=Math.max(.4,e.raw-g.extra);
      emit(e,'爆能强化',price,{condition:'enhance',enhanceCost:g.fee,minPayoff:g.minRaw,text:g.text+e.text,bodyText:e.text,ids:[...e.ids,'enhance']});
    }
    function extraConditional(trigger,preparedGate=null){
      if(alternate)return false;
      if(rarity===0||effectCount()>=effectLimit)return false;
      const g=preparedGate||gate(trigger);
      if(g.id==='none')return false;
      const room=remaining(),limit=Math.min(26,room/g.factor+g.extra);
      const e=payload(limit,trigger,Math.max(g.minRaw||0,g.amount||0),g.id,Math.min(10,cost+(g.effectBoost||0)),false,{multiplier:g.factor,credit:g.extra});
      if(!e)return false;
      const price=Math.max(.4,(e.raw-g.extra)*g.factor);
      return emit(e,trigger,price,{condition:g.id,resourceCost:g.amount||0,conditionAmount:g.requirement||g.amount||0,minPayoff:Math.max(g.minRaw||0,g.amount||0),text:(trigger==='法术'?'':`【${trigger}】`)+g.text+e.text,bodyText:g.text+e.text});
    }
    if(spell){
      card.archetype='modularSpell';
      // Spellboost changes only future use of this spell; it is not an evolution.
      if(!used.has('handDiscount')&&!used.has('spellboostDiscount')&&!alternate&&cls===3&&cost>=5&&remaining()>=3&&(cost>=8||r()<.22)){
        add({kind:'static',trigger:'魔力增幅时',condition:'none',text:'【魔力增幅时】使本卡牌的费用-1。',raw:5,price:3,ids:['spellboostDiscount']});
      }
      crest();
      const prepared=cost<=2&&rarity>=1&&!alternate&&r()<.4?gate('法术'):null;
      const reservedGate=prepared?.id!=='none'?prepared:null;
      const room=remaining(),desired=reservedGate?room*.52:rarity===0?room:cost>=6?room*.72:room*.84;
      let main=payload(desired,'法术',rarity===0?desired*.6:Math.min(desired*.6,cost>=6?10:6));
      if(!main)main=payload(room,'法术');
      if(main)emit(main,'法术',main.raw);
      enhancement();
      if(remaining()>=.7&&card.abilities.length<spellLimit&&(reservedGate||r()<.6))extraConditional('法术',reservedGate);
      // Expensive spells should spend their allowance on another useful effect.
      for(let i=0;i<3&&remaining()>=1.2&&card.abilities.length<spellLimit;i++){
        const extra=payload(remaining(),'法术',Math.min(remaining()*.55,6),'none',cost,false);
        if(!extra)break;emit(extra,'法术',extra.raw);
      }
      if(!card.abilities.some(a=>a.trigger==='法术')){
        const raw=cost<=3?2.8:2.2;
        emit({text:'抽取1张卡牌。',raw,ids:['draw'],tokens:[]},'法术',raw);
      }
    }else{
      const official=calibration.typeStats.amulets;
      const soil=cls===3&&cost>=1&&r()<.2&&remaining()>=.6;
      const countdown=cost>0&&!soil&&!used.has('exhaustibleCycle')&&r()<(cls===6?.58:official.countdown/calibration.typeStats.counts.amulet);
      card.countdown=countdown?weighted(r,[[1,8],[2,30],[3,32],[4,23],[5,7]]):null;
      card.archetype=countdown?'countdownAmulet':'persistentAmulet';
      if(countdown)add({kind:'keyword',trigger:'',condition:'none',text:`【吟唱 ${card.countdown}】`,raw:0,price:0,ids:['countdown']});
      if(soil)add({kind:'keyword',trigger:'',condition:'none',text:'【土之印】',raw:1,price:.6,ids:['earthSigil']});
      const delay=countdown?1/(1+card.countdown*.3):.8;
      let death=null;
      if(cost>0&&!soil&&r()<(countdown?.8:.2)){
        const limit=Math.min(28,remaining()*.8/delay);
        death=payload(limit,'谢幕曲',cost>=6?Math.min(12,limit*.6):Math.min(4,cost+1),'none',cost+(countdown?Math.min(3,card.countdown):1),false,{multiplier:delay,credit:0});
        if(death){
          emit(death,'谢幕曲',death.raw*delay,{delayFactor:delay});
          if(!countdown){
            // Reserve an independent way to trigger Last Words before spending
            // the remaining allowance on optional Fanfare effects.
            const fee=1,raw=death.raw*(1-delay),price=Math.max(0,raw-fee*2.2);
            add({kind:'activation',trigger:'启动',condition:'none',text:'费用1【启动】破坏本卡牌。',bodyText:'破坏本卡牌。',raw,price,ids:['lastWordsAct'],activation:{fee,oncePerTurn:true,breaksSelf:true,repeats:1,credit:fee*2.2}});
          }
        }
      }
      // An on-board engine is removable and its duration is priced separately.
      if(!death&&cost>0&&r()<.45){
        const c=composeEmblem(card.countdown,false,rarity===0);
        const price=c.raw*(countdown?.4+.12*card.countdown:1.05);
        if(price<=remaining()*.85){
          add({kind:'ongoing',trigger:c.eventId==='start'?'自己的回合开始时':c.eventId==='end'?'自己的回合结束时':'持续触发',condition:c.conditionId,text:c.text,bodyText:c.text,raw:c.raw,price,ids:['amuletEngine'],tokens:c.tokens.filter(t=>c.text.includes(`『${t.name}』`)),engineSpec:{eventId:c.eventId,limit:c.limit,effects:c.effects}});
        }
      }
      if(cost>0&&remaining()>2.2&&r()<.42){
        const limit=remaining()*(rarity===0&&cost>=6?1:.45);
        const fan=payload(limit,'入场曲',cost>=6?limit*.6:0,'none',cost,true);
        if(fan)emit(fan,'入场曲',fan.raw);
      }
      // Countdown acceleration pays for removing part of the Last Words delay.
      if(death&&countdown&&card.abilities.length<5&&r()<.7){
        const steps=pick([1,Math.min(2,card.countdown),Math.min(3,card.countdown)]),fee=Math.max(1,Math.ceil(steps*.8));
        const benefit=death.raw*(1-delay)*Math.min(1,steps/card.countdown);
        const price=Math.max(.25,benefit-fee*2.2);
        if(price<=remaining())add({kind:'activation',trigger:'启动',condition:'none',text:`费用${fee}【启动】本护符的倒计数-${steps}。`,bodyText:`本护符的倒计数-${steps}。`,raw:benefit,price,ids:['countdownAct'],activation:{fee,oncePerTurn:true,breaksSelf:false,countdownReduction:steps,credit:fee*2.2}});
      }
      const needsActivation=cost===0||(!death&&!used.has('amuletEngine'));
      if(card.abilities.length<5&&effectCount()<effectLimit&&!card.abilities.some(a=>a.trigger==='启动')&&(needsActivation||r()<(countdown?.25:.4))&&(remaining()>=.4||!card.abilities.some(a=>a.trigger))){
        const rolledBreak=cost===0||(!countdown&&!death&&r()<.6);
        // Earth Sigils are consumed by Earth Rite, never an activation self-break.
        // A surviving activation must pay the recurring-effect price instead.
        const breaksSelf=!soil&&rolledBreak;
        const fee=cost===0?pick([1,2]):weighted(r,[[0,breaksSelf?5:1],[1,4],[2,2],[3,1]]);
        const repeats=breaksSelf?1:countdown?Math.min(3,card.countdown):3.5;
        const limit=Math.min(18,remaining()/repeats+fee*2.2);
        const effectiveCost=Math.max(1,cost+fee);
        const fanfares=card.abilities.filter(a=>a.trigger==='入场曲');
        const fanRaw=fanfares.reduce((s,a)=>s+a.raw,0);
        const replay=breaksSelf&&fanfares.length>0&&(card.spent+Math.max(.4,fanRaw-fee*2.2))>=card.budget*.7&&r()<.16;
        let e=replay?{text:'发动与【入场曲】相同的能力。',raw:fanRaw,ids:['activationReplay'],tokens:[]}:payload(limit,'启动',cost>=6?limit*.5:0,'none',effectiveCost,true,{multiplier:repeats,credit:fee*2.2});
        if(e){
          const price=Math.max(.4,(e.raw-fee*2.2)*repeats);
          const body=(breaksSelf?'破坏本卡牌。':'')+e.text;
          if(price<=remaining())add({...e,kind:'activation',trigger:'启动',condition:'none',text:(fee?`费用${fee}`:'')+'【启动】'+body,bodyText:body,price,activation:{fee,oncePerTurn:true,breaksSelf,repeats,credit:fee*2.2},ids:[...e.ids,'activate']});
        }
      }
      // Permanent Last Words amulets already reserve their own destruction above.
      if(!soil&&!card.abilities.some(a=>['启动','谢幕曲','持续触发','自己的回合开始时','自己的回合结束时'].includes(a.trigger))&&!countdown){
        const fee=1,raw=2.2,price=Math.max(0,Math.min(.4,remaining()));
        add({kind:'activation',trigger:'启动',condition:'none',text:'费用1【启动】破坏本卡牌。抽取1张卡牌。',bodyText:'破坏本卡牌。抽取1张卡牌。',raw,price,ids:['fallbackAct'],activation:{fee,oncePerTurn:true,breaksSelf:true,repeats:1,credit:2.2}});
      }
      if(countdown&&!card.abilities.some(a=>a.trigger)){
        const e=payload(remaining()/delay,'谢幕曲',0,'none',cost+2,false,{multiplier:delay,credit:0});
        if(e)emit(e,'谢幕曲',e.raw*delay,{delayFactor:delay});
      }
      if(remaining()>=1&&card.abilities.length<5&&!used.has('activationReplay')&&r()<.4)extraConditional('入场曲');
      for(let i=0;i<2&&remaining()>=1&&card.abilities.length<5&&!used.has('activationReplay');i++){
        const e=payload(remaining(),'入场曲',Math.min(remaining()*.55,8),'none',cost,false);
        if(e)emit(e,'入场曲',e.raw);else break;
      }
      if(card.abilities.length<5)enhancement();
    }
    card.spent=+card.spent.toFixed(2);card.vanilla=false;
    return card;
  }
  const api={build};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SVWBNonfollowers=api;
})(typeof globalThis!=='undefined'?globalThis:this);
