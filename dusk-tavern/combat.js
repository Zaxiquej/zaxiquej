(function(root){
'use strict';
const D=root.TavernData||(typeof require!=='undefined'?require('./data.js'):null);
const S=root.TavernScaling||(typeof require!=='undefined'?require('./scaling.js'):null);
function run(s,left,right,metaL={},metaR={},helpers){
 const {copy,make,pick,rand,damageCap=15,record=true}=helpers,def=c=>D.byId[c.id],mult=c=>(c.golden?2:1)*(c.effectScale||1);
 const sides=[copy(left),copy(right)],meta=[metaL,metaR],progress=[S.read(metaL),S.read(metaR)],events=[],generated=[[],[]],deadCount=[0,0],grave=[metaL.grave||0,metaR.grave||0],scrap=[metaL.scrap||0,metaR.scrap||0],healing=[0,0],permanent=[{},{}],discount=[0,0],counters=new Map(),revivedOrigins=new Set(),impacts=[],voiceCues=[];let serial=100000,steps=0,retainEnabled=false,deathDepth=0,forcedRunning=false;const forcedAttacks=[];
 const growthContext=side=>({...meta[side],progress:progress[side],grave:grave[side],scrap:scrap[side]});
 const alive=i=>sides[i].filter(c=>c.health>0);
 const snap=(text,from=null,to=null,kind='effect',voices=[])=>{if(record)events.push({text,from,to,kind,voices:[...voiceCues.splice(0),...voices],impacts:impacts.splice(0),grave:[...grave],scrap:[...scrap],progress:copy(progress),boards:copy(sides)});else{voiceCues.length=0;impacts.length=0;}};
 function remember(c,a,h){if(!retainEnabled||!c.originUid)return;const sources=adjacent(c).filter(x=>def(x).effect==='memoryAura'),m=Math.max(def(c).effect==='combatMemory'?mult(c):0,...sources.map(mult));if(!m)return;const gain=permanent[c.side][c.originUid]||(permanent[c.side][c.originUid]={attack:0,health:0});gain.attack+=Math.max(0,a)*m;gain.health+=Math.max(0,h)*m;}
 const buff=(c,a,h,react=true,temporary=true)=>{if(c){if(temporary)remember(c,a,h);if(a>0||h>0)progress[c.side].buffs++;c.attack=Math.max(0,c.attack+a);c.health+=h;c.maxHealth+=h;if(react&&(a>0||h>0)&&sides[c.side].some(x=>x.battleId===c.battleId)){for(const x of alive(c.side)){if(x.battleId!==c.battleId&&def(x).effect==='buffWitness')grow(x,0,mult(x),false);if(x.battleId===c.battleId&&def(x).effect==='buffConductor')for(const y of alive(c.side))if(y.battleId!==x.battleId)grow(y,mult(x),mult(x),false);}}}};
 const adjacent=c=>{const i=sides[c.side].indexOf(c);return i<0?[]:[sides[c.side][i-1],sides[c.side][i+1]].filter(x=>x&&x.health>0);};
 const bump=(c,key)=>{const k=c.side+':'+(c.originUid||c.battleId)+':'+key,n=(counters.get(k)||0)+1;counters.set(k,n);return n;};
 const addShield=c=>{S.syncShieldAura(alive(c.side));S.addShield(c);};
 const addGuard=c=>{if(c&&!c.keywords.includes('taunt'))c.keywords.push('taunt');};
 function grow(c,a,h,react=true){if(!c)return;buff(c,a,h,react,false);if(c.originUid){const ledger=permanent[c.side][c.originUid]||(permanent[c.side][c.originUid]={attack:0,health:0});ledger.attack+=a;ledger.health+=h;}}
 sides.forEach((side,i)=>side.forEach(c=>{c.battleId=++serial;c.side=i;c.originUid=c.uid;c.maxHealth=c.health;c.startHealth=c.health;c.reborn=def(c).effect==='reborn'||!!def(c).reborn||!!c.heroReborn;c.rebornCharges=0;c.batRebirthSources=[];c.resurrected=false;c.vow=0;c.legionApplied=0;c.fairyArmyApplied=0;c.batArmyApplied=0;}));
 sides.forEach(side=>{S.syncShieldAura(side);for(const c of side)if(c.heroShield)S.addShield(c);});
 function applyLegion(c){if(!D.isTribe(c,'night'))return;const n=progress[c.side].legionAttack-(c.legionApplied||0);if(n)buff(c,n,0,true,false);c.legionApplied=progress[c.side].legionAttack;}
 function applyTokenArmy(c,original=false){
  if(!['fairy','bat'].includes(c.id))return;
  const key=c.id==='fairy'?'fairyArmyApplied':'batArmyApplied',n=c.id==='fairy'?S.fairy(growthContext(c.side)):S.bat(growthContext(c.side)),delta=Math.max(0,n-(c[key]||0));
  // A reborn unit retains its already buffed attack, but must return at 1 health.
  // Apply only the newly earned attack; never add the entire army a second time.
  if(delta)buff(c,delta,original?0:delta,true,false);c[key]=n;
 }
 function attackCount(c){return Math.max(c.heroWindfury||def(c).windfury||def(c).effect==='double'||['dragon6','forest1','dragon9'].includes(c.id)?2:1,c.id==='fairy'?Math.max(1,...alive(c.side).filter(x=>def(x).effect==='fairyCommander').map(x=>1+mult(x))):1);}
 function growLegion(side,n,source){progress[side].legionAttack+=n;alive(side).forEach(applyLegion);snap(def(source).name+' · 死灵军势永久 +'+n+' 攻击（累计 +'+progress[side].legionAttack+'）。',null,source.battleId,'grow');}
 function breakShield(c,all=false){
  if(!S.shieldCount(c))return;S.removeShieldLayer(c,all);
  if(c.id==='royal0'){grow(c,mult(c),mult(c));snap(def(c).name+' · 不屈之光：永久 +'+mult(c)+'/+'+mult(c)+'。',null,c.battleId,'grow');}
  let royalTriggers=0,royalSource=null;
  for(const x of alive(c.side)){
   if(x.id==='royal6'){const n=S.growthAmount(growthContext(c.side),'shieldBuff')*mult(x);alive(c.side).filter(y=>D.isTribe(y,'royal')).forEach(y=>grow(y,n,n));royalTriggers++;royalSource=royalSource||x;}
   if(def(x).effect==='shieldMentor'&&x.battleId!==c.battleId){const m=mult(x);grow(c,2*m,2*m);snap(def(x).name+' · 屏障援护：'+def(c).name+' 永久 +'+2*m+'/+'+2*m+'。',x.battleId,c.battleId,'grow');}
   if(def(x).effect==='shieldChampion'){const m=mult(x);grow(x,4*m,4*m);snap(def(x).name+' · 不屈战意：永久 +'+4*m+'/+'+4*m+'。',null,x.battleId,'grow');}
   if(def(x).effect==='shieldResearch'){const n=2*mult(x);S.powerGain(progress[c.side],'spellcraft',2,mult(x));snap(def(x).name+' · 魔导回收：法术研习 +'+n/2+'。',null,x.battleId,'grow');}
   if(x.id==='neutral3')adjacent(c).forEach(y=>buff(y,2*mult(x),2*mult(x)));
  }
  if(royalTriggers)snap(def(royalSource).name+' · 白银传承：'+royalTriggers+' 次皇家军团永久养成。',null,royalSource.battleId,'grow');
 }
 function damage(c,n,destroy=false){
  if(!c||c.health<=0||n<=0)return;impacts.push({target:c.battleId,amount:n,blocked:c.keywords.includes('shield')});if(c.keywords.includes('shield')){breakShield(c);return;}
  c.health-=n;if(c.health<=0)return;if(destroy){c.health=0;impacts.at(-1).destroyed=true;snap('毁灭 · '+def(c).name+' 被摧毁。',null,c.battleId,'destroy');return;}const m=mult(c);
  if(c.id==='dragon2')grow(c,D.tuning.dragonHurt*m,D.tuning.dragonHurtHealth*m);
  if(def(c).effect==='tavernFury'){progress[c.side].tavernAttack+=D.tuning.serpentAttack*m;progress[c.side].tavernHealth+=D.tuning.serpentHealth*m;snap(def(c).name+' · 赤怒培育：酒馆永久 +'+D.tuning.serpentAttack*m+'/+'+D.tuning.serpentHealth*m+'。',null,c.battleId,'grow');}if(D.isTribe(c,'dragon'))for(const x of alive(c.side).filter(x=>def(x).effect==='dragonVitality')){const n=(6+Math.floor((c.startHealth||c.maxHealth)/10))*mult(x);grow(c,n,2*n);}
  if(c.id==='dragon5'&&bump(c,'injuries')%3===0){addShield(c);snap(def(c).name+' · 深海龙鳞：重新获得屏障。',null,c.battleId,'shield');}
  let dragonTriggers=0,dragonGain=0,dragonTarget=null;
  if(D.isTribe(c,'dragon'))for(const x of alive(c.side)){
   if(x.id==='dragon4'){const target=pick(s,alive(c.side).filter(y=>y.battleId!==c.battleId&&D.isTribe(y,'dragon')));if(target){const gain=D.tuning.dragonTrainer*mult(x);grow(target,gain,gain);dragonTriggers++;dragonGain+=gain;dragonTarget=dragonTarget||target;}}
  }
  // One damage can trigger many trainers. Resolve every trigger, then store one
  // complete board frame so long growth chains remain readable and saveable.
  if(dragonTriggers)snap('龙血培育：'+dragonTriggers+' 次触发，龙族永久合计 +'+dragonGain+'/+'+dragonGain+'。',null,dragonTarget.battleId,'grow');
  else if(c.id==='dragon2')snap(def(c).name+' · 逆鳞：永久 +'+(D.tuning.dragonHurt*m)+'/+'+(D.tuning.dragonHurtHealth*m)+'。',null,c.battleId,'grow');
 }
 function grantBatRebirth(c,source){const key=source.originUid||source.battleId;c.batRebirthSources=c.batRebirthSources||[];if(c.batRebirthSources.includes(key))return;c.batRebirthSources.push(key);c.rebornCharges=(c.reborn?Math.max(1,c.rebornCharges||0):0)+mult(source);c.reborn=true;}
 function summon(side,id,a,h,index,extra={},original=null,reason='summon'){
  if(sides[side].length>=7)return null;
  const entryWitnesses=[...alive(side)];
  const c=original?copy(original):make(s,id,{attack:a,health:h});Object.assign(c,{attack:a,health:h,maxHealth:h,battleId:++serial,side,reborn:false,rebornCharges:0},extra);
  delete c.killedBy;delete c.venomSpent;if(!original){delete c.originUid;c.resurrected=false;c.vow=0;}
  if(original&&def(c).keywords?.includes('stealth')&&!c.keywords.includes('stealth'))c.keywords.push('stealth');
  if(original&&!extra.keepShield){c.keywords=c.keywords.filter(k=>k!=='shield');c.shieldLayers=0;delete c.temporaryShields;}

  applyTokenArmy(c,!!original);
  if(extra.grantShield)addShield(c);sides[side].splice(Math.min(index,sides[side].length),0,c);
  S.syncShieldAura(alive(side));progress[side].battleEntries++;applyLegion(c);
  if(['reborn','revive'].includes(reason))for(const x of entryWitnesses)if(def(x).effect==='rebornChoir')for(const y of alive(side))if(y.battleId!==c.battleId)grow(y,mult(x),2*mult(x));
  for(const x of entryWitnesses){if(def(x).effect==='legionEngine')growLegion(side,S.growthAmount(growthContext(side),'legionEngine')*mult(x),x);if(def(x).effect==='rebirthLegion'&&['reborn','revive'].includes(reason))growLegion(side,3*mult(x),x);}
  if(c.id==='fairy')for(const x of entryWitnesses){if(x.id==='forest2')progress[side].fairy+=mult(x);if(def(x).effect==='fairyRally')adjacent(x).forEach(y=>grow(y,2*mult(x),2*mult(x)));}
  if(c.id==='fairy')for(const x of entryWitnesses.filter(x=>def(x).effect==='fairyBulwark')){const n=S.fairy(growthContext(side))*mult(x);grow(x,n,n);grow(alive(side).find(y=>y.battleId!==x.battleId),n,n);snap(def(x).name+' · 军团庇护：永久 +'+n+'/+'+n+'。',null,x.battleId,'grow');}
  for(const x of entryWitnesses){if(def(x).effect==='legionHealth'&&D.isTribe(c,'night'))buff(c,0,(6+2*progress[side].legionAttack)*mult(x));if(def(x).effect==='constructUnity'&&def(c).token&&D.isTribe(c,'artifact')){const n=progress[side].constructTypes.length*(1+Math.floor(progress[side].arms/6))*mult(x);grow(c,n,n);grow(alive(side).find(y=>y.battleId!==c.battleId),n,n);}}
  if(c.id==='bat'&&!original)for(const x of entryWitnesses)if(def(x).effect==='batRebirth')grantBatRebirth(c,x);
  if(c.id==='fairy'&&!original){for(const x of entryWitnesses.filter(x=>x.id==='forest10')){const n=Math.floor(x.attack/2)*mult(x);buff(c,n,n);}if(entryWitnesses.some(x=>def(x).effect==='fairyCommander'))forcedAttacks.push(c);}
  if(!original)c.startHealth=c.maxHealth;


  snap((reason==='reborn'?'复生 ':reason==='revive'?'复活 ':'召唤 ')+def(c).name+'（'+c.attack+'/'+c.health+'）'+(def(c).effect==='mimi'?' · 谢幕曲：随机敌方受到 '+(2*mult(c))+' 点伤害':def(c).effect==='coco'?' · 谢幕曲：随机友方 +'+(2*mult(c))+'/+'+(2*mult(c)):''),null,c.battleId,'summon');return c;
 }
 const hasLastWords=c=>D.lastWordEffects.includes(def(c).effect)||c.id==='dragon1'||c.vow>0;
 function lastWords(c,index){const side=c.side,e=def(c).effect,m=mult(c);
  if(def(c).fairyLast){const n=def(c).fairyLast*m;progress[side].fairy+=n;snap(def(c).name+' · 妖精军团永久 +'+n+'/+'+n+'。',null,c.battleId,'grow');}
  if(e==='deathPulse')for(let hit=0;hit<2*m;hit++){
   const targets=[...alive(0),...alive(1)];if(!targets.length)break;
   targets.forEach(x=>damage(x,1));
   snap(def(c).name+' · 谢幕震击：所有随从受到 1 点伤害（'+(hit+1)+'/'+(2*m)+'）。',c.battleId,null,'spell');
   // Resolve each wave before selecting the next: new summons can be hit,
   // while dead units cannot take another hit or trigger surviving-injury effects.
   deaths();
  }
  if(e==='shieldLast'){const pool=alive(side).filter(x=>!S.shieldCount(x)||S.canStackShield(x));for(let i=0;i<m&&pool.length;i++){const min=Math.min(...pool.map(S.shieldCount)),x=pick(s,pool.filter(x=>S.shieldCount(x)===min));pool.splice(pool.indexOf(x),1);addShield(x);snap(def(c).name+' · 谢幕：'+def(x).name+' 获得屏障。',c.battleId,x.battleId,'shield');}}
  if(e==='spellLast'){const pool=D.spells.filter(d=>d.tier<=(meta[side].tier||1)&&(!s.activeTribes||d.tribe==='neutral'||s.activeTribes.includes(d.tribe)));for(let i=0;i<m&&pool.length;i++)generated[side].push(pick(s,pool).id);snap(def(c).name+' · 谢幕：战后获得 '+m+' 张酒馆法术。',null,c.battleId,'effect');}
  if(e==='constructCache'){const ids=[];for(let i=0;i<m;i++){const id=pick(s,D.constructCycle);generated[side].push(id);ids.push(id);}snap(def(c).name+' · 战后获得：'+ids.map(id=>D.byId[id].name).join('、')+'。',null,c.battleId,'effect');}
  if(e==='odinRevenge'&&c.killedBy){const killer=alive(1-side).find(x=>x.battleId===c.killedBy);if(killer){killer.health=0;impacts.push({target:killer.battleId,amount:0,blocked:false,destroyed:true});snap(def(c).name+' · 复仇摧毁 '+def(killer).name+'。',c.battleId,killer.battleId,'destroy');}}
  if(e==='rebornSkeleton')summon(side,'skeleton',2*m,m,index,{reborn:true});
  if(e==='guardNest')summon(side,'holyGuardian',2*m,6*m,index,{effectScale:m});
  if(e==='guardWisp')summon(side,'holyWisp',m,3*m,index);
  if(e==='tokenForge'){const n=(2+Math.floor(scrap[side]/3))*m;alive(side).filter(x=>def(x).token).forEach(x=>buff(x,n,n));}
  if(e==='legionLast')growLegion(side,3*m,c);
  if(e==='undyingHounds')for(const [i,id]of ['hound','coco'].entries())summon(side,id,4*m,4*m,index+i,{reborn:true,effectScale:m});
  if(e==='marchArmy'){const n=Math.max(1,progress[side].battleEntries*m);for(let i=0;i<2;i++)summon(side,'skeleton',n,n,index+i);}
  if(e==='bellLast'){const target=pick(s,alive(side));if(target){buff(target,2*m,2*m);snap(def(c).name+' · 余音：友方 +'+2*m+'/+'+2*m+'。',null,target.battleId,'grow');}}
  if(e==='constructPair')for(const [i,id]of ['mysticArtifact','spinariaArtifact'].entries()){const d=D.byId[id];summon(side,id,d.attack*m,d.health*m,index+i,{effectScale:m});}
  if(e==='radiantLast'){const target=pick(s,alive(1-side));if(target){const n=c.attack*m;damage(target,n);snap(def(c).name+' · 谢幕炮击：'+n+' 点伤害。',c.battleId,target.battleId,'spell');}}
  if(e==='researchLast'){progress[side].arms+=3*m;snap(def(c).name+' · 遗存研究：武装研习 +'+(3*m)+'。',null,c.battleId,'grow');}
  if(e==='battleBrood'){const b=def(c).brood;for(let i=0;i<b.count;i++)summon(side,b.id,b.attack*m,b.health*m+(b.inheritHealth?Math.floor(c.maxHealth/2):0),index+i,{effectScale:m});}
  if(e==='graveLegacy'&&grave[side]>=6){const n=S.growthAmount(growthContext(side),'graveLegacy')*m;grave[side]-=6;alive(side).filter(x=>D.isTribe(x,'night')).forEach(x=>grow(x,n,n));snap(def(c).name+' · 墓场传承：死灵永久 +'+n+'/+'+n+'。');}
  if(['fairyCrown','graveArmy','batCrown','scrapCrown'].includes(e)){
   const id=e==='fairyCrown'?'fairy':e==='graveArmy'?'skeleton':e==='batCrown'?'bat':'ancientArtifact',bonus=e==='graveArmy'?grave[side]:e==='scrapCrown'?scrap[side]:0;
   const a=(Math.floor(c.attack/(e==='fairyCrown'?1:2))+bonus)*m,h=Math.max(1,(Math.floor(c.maxHealth/2)+bonus)*m);
   for(let i=0;i<(['batCrown','fairyCrown'].includes(e)?3:2);i++)summon(side,e==='scrapCrown'?['radiantArtifact','mysticArtifact'][i]:id,a,h,index+i,e==='scrapCrown'?{effectScale:m}:{});
  }
  if(e==='graveLast'){const n=(def(c).graveYield||6)*m;grave[side]+=n;snap(def(c).name+' · 死者书页：墓场 +'+n+'。');}
  if(e==='relicSalvage'){scrap[side]+=2*m;progress[side].arms+=m;snap(def(c).name+' · 残骸 +'+2*m+'，武装研习 +'+m+'。',null,c.battleId,'grow');}
  if(e==='tavernLegacy'){const a=Math.floor(c.attack/8)*m,h=Math.floor(c.maxHealth/8)*m;progress[side].tavernAttack+=a;progress[side].tavernHealth+=h;snap(def(c).name+' · 龙骸沃土：酒馆永久 +'+a+'/+'+h+'。',null,c.battleId,'grow');}
  if(e==='batNest')for(let i=0;i<2;i++)summon(side,'bat',3*m,2*m,index+i);
  if(e==='batDeath')for(let i=0;i<2;i++)summon(side,'bat',2*m+Math.floor(c.attack/2),m+Math.floor(c.maxHealth/2),index+i);
  if(e==='analyzerDeath')summon(side,'analyzer',2*m,2*m,index,{effectScale:m});
  if(e==='artifactDeath'){const n=S.artifactBody({scrap:scrap[side]},m);for(let i=0;i<m;i++)summon(side,'ancientArtifact',n,n,index+i);}
  if(e==='analyzerLast'){const target=pick(s,alive(side).filter(x=>D.isTribe(x,'artifact')));if(target){buff(target,m,m);snap(def(c).name+' · 解析谢幕：友方造物 +'+m+'/+'+m+'。',null,target.battleId,'grow');}}
  if(e==='fairy')summon(side,'fairy',m,m,index);
  if(e==='skeleton')summon(side,'skeleton',2*m,m,index);
  if(e==='fairy2')for(let n=0;n<2;n++)summon(side,'fairy',3*m+Math.floor(c.attack/2),3*m+Math.floor(c.maxHealth/2),index+n);
  if(e==='hounds'){summon(side,'hound',2*m+Math.floor(c.attack/2),m,index,{effectScale:m});summon(side,'coco',m,2*m+Math.floor(c.maxHealth/2),index+1,{effectScale:m});}
  if(e==='mimi'){const target=pick(s,alive(1-side));damage(target,2*m);if(target)snap(def(c).name+' 的谢幕曲对 '+def(target).name+' 造成 '+(2*m)+' 点伤害。',null,target.battleId,'effect');}
  if(e==='coco'){const target=pick(s,alive(side));buff(target,2*m,2*m);if(target)snap(def(c).name+' 的谢幕曲使 '+def(target).name+' 获得 +'+(2*m)+'/+'+(2*m)+'。',null,target.battleId,'grow');}
  if(e==='deathBlast'){const victims=alive(1-side).sort((a,b)=>b.attack-a.attack).slice(0,m);victims.forEach(x=>x.health=1);snap(def(c).name+' · 魔眼终幕：最高攻击的敌方生命化为 1。',null,victims[0]?.battleId,'effect');}
  if(e==='tavernLast'){progress[side].tavernAttack+=m;progress[side].tavernHealth+=m;snap(def(c).name+' · 龙魂培育：酒馆永久 +'+m+'/+'+m+'。',null,c.battleId,'grow');}
  if(c.vow){const x=pick(s,alive(side));if(x){buff(x,Math.floor(c.attack/2)*c.vow,Math.floor(c.maxHealth/2)*c.vow);snap(def(c).name+' 的圣女遗愿强化了 '+def(x).name+'。',null,x.battleId,'grow');}}
 }
 function strike(attacker,hits=1){const side=attacker.side;
  for(let hit=0;hit<hits&&attacker.health>0&&alive(1-side).length;hit++){
   for(const source of alive(side).filter(c=>c.id==='rune7')){if(attacker.health<=0||!alive(1-side).length)break;if(source.health<=0)continue;const target=pick(s,alive(1-side)),n=(meta[side].spells||0)*mult(source);damage(target,n);snap(def(source).name+' · '+def(attacker).name+' 攻击前，秘银轰击：'+n+' 点伤害。',source.battleId,target.battleId,'spell');deaths();}
   if(attacker.health<=0||!alive(1-side).length)break;
   if(attacker.keywords.includes('stealth')){attacker.keywords=attacker.keywords.filter(k=>k!=='stealth');snap(def(attacker).name+' 发起攻击，解除潜行。',attacker.battleId,attacker.battleId,'reveal');}
   if(D.isTribe(attacker,'forest')||D.isTribe(attacker,'dragon'))for(const x of alive(side).filter(x=>x.battleId!==attacker.battleId&&def(x).effect==='fairyGuardian')){grow(x,2*mult(x),3*mult(x));snap(def(x).name+' · 妖精龙成长。',attacker.battleId,x.battleId,'grow');}
   if(def(attacker).token)for(const x of alive(side).filter(x=>x.id==='forest6')){const base=S.growthAmount(growthContext(side),'summonBuff'),n=base*mult(x),army=Math.floor(base/3)*mult(x);progress[side].fairy+=army;buff(attacker,n,n);snap(def(x).name+' · 妖精进军：攻击者本场 +'+n+'/+'+n+'，妖精军团永久 +'+army+'/+'+army+'。',x.battleId,attacker.battleId,'grow');}
   if(def(attacker).fairyAttack){const n=def(attacker).fairyAttack*mult(attacker);progress[side].fairy+=n;snap(def(attacker).name+' · 先驱进军：妖精军团永久 +'+n+'/+'+n+'。',attacker.battleId,attacker.battleId,'grow');}
   if(attacker.id==='bat')for(const x of alive(side).filter(x=>def(x).batAssault)){const n=S.bat(growthContext(side))*mult(x);buff(attacker,n,n);snap(def(x).name+' · 血翼进击：攻击者本场 +'+n+'/+'+n+'。',x.battleId,attacker.battleId,'grow');}
   for(const x of adjacent(attacker).filter(c=>def(c).effect==='ambushSupport')){buff(attacker,4*mult(x),2*mult(x));snap(def(x).name+' · 暗中支援：攻击者本场 +'+4*mult(x)+'/+'+2*mult(x)+'。',x.battleId,attacker.battleId,'grow');}
   const foes=alive(1-side),visible=foes.filter(c=>!c.keywords.includes('stealth')),pool=visible.length?visible:foes,guards=pool.filter(c=>c.keywords.includes('taunt')&&!c.keywords.includes('stealth')),target=pick(s,def(attacker).effect==='artifactHunter'?pool.filter(c=>c.attack===Math.min(...pool.map(x=>x.attack))):guards.length?guards:pool);

   // The selected guard gains its combat-only stats before attack/retaliation snapshots.
   if(target.keywords.includes('taunt'))for(const x of alive(target.side).filter(x=>x.battleId!==target.battleId&&def(x).effect==='guardWitness')){const n=S.growthAmount(growthContext(target.side),'guardWitness',x)*mult(x);buff(target,n,2*n);snap(def(x).name+' · 守护援护：'+def(target).name+' 本场 +'+n+'/+'+2*n+'。',x.battleId,target.battleId,'grow');}
   const a=attacker.attack,b=target.attack,neighbors=adjacent(target),blocked=target.keywords.includes('shield'),retaliations=target.keywords.includes('taunt')?alive(target.side).filter(x=>def(x).effect==='guardRetribution').map(x=>({source:x,n:Math.max(1,Math.floor(x.health/5))*mult(x)})):[];const poison=(c,victim,n)=>{const e=def(c).effect;if(n<=0||victim.keywords.includes('shield'))return false;if(e==='venomOnce'){if(c.venomSpent)return false;c.venomSpent=true;return true;}return c.keywords.includes('destruction');};const lethalA=poison(attacker,target,a),lethalB=poison(target,attacker,b);damage(target,a,lethalA);if(target.health<=0)target.killedBy=attacker.battleId;damage(attacker,b,lethalB);for(const r of retaliations){damage(attacker,r.n);snap(def(r.source).name+' · 守护反击：'+r.n+' 点伤害。',r.source.battleId,attacker.battleId,'spell');}if(def(attacker).effect==='cleave')neighbors.forEach(c=>damage(c,a));

   if(def(attacker).effect==='bloodEdge'&&!blocked&&a>0&&attacker.health>0){const n=2*mult(attacker);grow(attacker,n,n);snap(def(attacker).name+' · 绯色锋刃：永久 +'+n+'/+'+n+'。',null,attacker.battleId,'grow');}
   if(attacker.id==='dragon9'&&attacker.health>0){const n=(2+Math.floor(attacker.startHealth/10))*mult(attacker);grow(attacker,n,0);snap(def(attacker).name+' · 漆黑突袭：永久攻击 +'+n+'。',null,attacker.battleId,'grow');}
   if(attacker.id==='royal5'&&attacker.health>0&&target.health<=0)addShield(attacker);
   snap(def(attacker).name+' 攻击 '+def(target).name+'（'+a+' ↔ '+b+'）'+(hits>1?' · 连击 '+(hit+1)+'/'+hits:''),attacker.battleId,target.battleId,'attack',[{id:attacker.id,kind:'attack',battleId:attacker.battleId}]);
   deaths();
  }
 }
 function deaths(){deathDepth++;let safety=0;while(sides.some(a=>a.some(c=>c.health<=0))&&safety++<100){const fallen=[];
  for(let side=0;side<2;side++){sides[side].forEach((c,index)=>{if(c.health<=0)fallen.push({c,index});});sides[side]=sides[side].filter(c=>c.health>0);}
  // Record the entire simultaneous death batch once, before rebirth/last words.
  for(let side=0;side<2;side++){const n=fallen.filter(x=>x.c.side===side&&x.c.id==='bat').length;if(n){progress[side].batDeaths+=n;alive(side).filter(c=>c.id==='bat').forEach(c=>applyTokenArmy(c));}}
  voiceCues.push(...fallen.map(({c})=>({id:c.id,kind:'death',battleId:c.battleId})));
  for(const {c,index} of fallen){const side=c.side;deadCount[side]++;grave[side]++;for(const x of alive(side))if(x.battleId!==c.battleId&&def(x).effect==='graveKeeper')grave[side]+=mult(x);
   if(D.isTribe(c,'artifact'))scrap[side]++;
   // Capture live observers now; removed cards cannot observe this death.
   const witnesses=[...alive(side)];
   for(const x of witnesses){const m=mult(x);
    if(def(x).effect==='batMemorial'&&c.id==='bat')alive(side).filter(y=>D.isTribe(y,'blood')).forEach(y=>grow(y,3*m,3*m));

    if(def(x).effect==='scrapVeteran'&&D.isTribe(c,'artifact')){const n=(2+Math.floor(scrap[side]/5))*m;grow(x,n,n);}
    if(def(x).effect==='forgeLegacy'&&D.isTribe(c,'artifact')){progress[side].arms+=6*m;snap(def(x).name+' · 创造循环：武装研习 +'+(6*m)+'。',null,x.battleId,'grow');}

    if(x.id==='blood6'&&c.id==='bat'){const target=pick(s,alive(1-side));if(target){const n=c.attack*S.growthAmount(growthContext(side),'batQueen')*m;damage(target,n);snap(def(x).name+' · 血翼夜宴：蝙蝠谢幕造成 '+n+' 点伤害。',x.battleId,target.battleId,'spell');}}
    if(x.id==='night3')grow(x,2*m,2*m);
    if(x.id==='haven7'){const target=alive(side).at(-1);if(target){buff(target,Math.floor(c.attack*m/2),Math.floor(c.maxHealth*m/2));snap(def(x).name+' · 炽天使传承：'+def(target).name+' 继承阵亡者身材。',null,target.battleId,'grow');}}
   }
   const reviveKey=side+':'+(c.originUid||c.uid);if(!def(c).token&&!c.resurrected&&!revivedOrigins.has(reviveKey))for(const x of witnesses)if(x.id==='night7'&&x.health>0&&sides[side].length<7&&grave[side]>=3){grave[side]-=3;revivedOrigins.add(reviveKey);summon(side,c.id,c.attack,Math.max(1,c.maxHealth*mult(x)),index,{resurrected:true},c,'revive');break;}
   if(c.reborn){const remaining=Math.max(0,(c.rebornCharges||1)-1);summon(side,c.id,c.attack,c.id==='night10'?c.maxHealth*mult(c):c.id==='royal4'?Math.max(1,Math.ceil(c.maxHealth/2)):1,index,{grantShield:c.id==='royal4',reborn:remaining>0,rebornCharges:remaining},c,'reborn');}
   if(hasLastWords(c)){lastWords(c,index);if(c.heroDeathEcho&&bump(c,'heroDeathEcho')===1){lastWords(c,index);snap('谢幕回响：'+def(c).name+' 的首次谢幕曲额外触发。',null,c.battleId,'echo');}for(const x of witnesses)if(def(x).effect==='lastWordsEcho'&&x.health>0){snap(def(x).name+' · 冥府回声：再次触发 '+def(c).name+' 的谢幕曲。',null,x.battleId,'echo');for(let n=0;n<mult(x);n++)lastWords(c,index);}}

   for(const x of witnesses){if(x.health<=0)continue;const m=mult(x),n=bump(x,'avenge');
    if(def(x).effect==='artifactAvenger'&&n%5===0){const w=S.weapon(growthContext(side)),token=summon(side,'spinariaArtifact',(1+w.attack)*m,(3+w.health)*m,sides[side].indexOf(x)+1,{effectScale:m});if(token)forcedAttacks.push(token);}
    if(def(x).effect==='entryCannon'&&n%2===0){const target=pick(s,alive(1-side));if(target){const shot=progress[side].battleEntries*m;damage(target,shot);snap(def(x).name+' · 复仇炮击：'+shot+' 点伤害（本局战斗入场 '+progress[side].battleEntries+' 次）。',x.battleId,target.battleId,'spell');}}
    if(def(x).effect==='boneAvenger'&&n%3===0){grow(x,5*m,5*m);snap(def(x).name+' · 复仇：永久 +'+5*m+'/+'+5*m+'。',null,x.battleId,'grow');}
    if(def(x).effect==='batAvenge'&&n%2===0){const body=S.batAvengeBody(meta[side],m);summon(side,'bat',body,body,sides[side].indexOf(x)+1);}
    if(def(x).effect==='deathStudy'&&n%2===0)S.powerGain(progress[side],'spellcraft',2,m);
   if(x.id==='haven2'&&n%2===0){addShield(x);snap(def(x).name+' · 圣堂壁垒：复仇恢复屏障。',null,x.battleId,'shield');}
    if(def(x).effect==='shieldRelay'&&n%2===0){S.syncShieldAura(alive(side));const candidates=alive(side).filter(y=>y.battleId!==x.battleId&&D.isTribe(y,'royal')&&(!S.shieldCount(y)||S.canStackShield(y)));for(let i=0;i<m&&candidates.length;i++){
     const min=Math.min(...candidates.map(S.shieldCount)),target=pick(s,candidates.filter(y=>S.shieldCount(y)===min));candidates.splice(candidates.indexOf(target),1);
     addShield(target);snap(def(x).name+' · 复仇：为 '+def(target).name+' 补充屏障。',x.battleId,target.battleId,'shield');
    }}
   }
  }
  snap(fallen.map(x=>def(x.c).name).join('、')+' 退场，谢幕与复仇结算完毕。',null,null,'death');
 }
 deathDepth--;
 // Resolve forced attacks after the current death batch, before the next normal
 // turn. A queue prevents nested deaths from attacking with already-dead tokens.
 if(!deathDepth&&!forcedRunning){forcedRunning=true;while(forcedAttacks.length&&steps<160){const token=forcedAttacks.shift();if(token.health>0&&sides[token.side].includes(token)&&alive(1-token.side).length){steps++;strike(token,attackCount(token));}}forcedRunning=false;}
 }
 for(let side=0;side<2;side++)for(const c of sides[side]){applyLegion(c);applyTokenArmy(c);}
 retainEnabled=true;
 snap('双方入场，开战效果准备触发。');
 // Preemptive attacks are extra real attacks, before ordinary opening effects.
 // Snapshot original units: resurrection cannot restart an opener indefinitely.
 const openers=sides.map(side=>side.filter(c=>def(c).effect==='openingStrike'));
 if(openers.some(a=>a.length)){
  const first=openers[0].length&&openers[1].length?(rand(s)<.5?0:1):openers[0].length?0:1;
  for(let i=0;i<Math.max(...openers.map(a=>a.length));i++)for(const side of [first,1-first]){
   const c=openers[side][i];if(!c)continue;
   for(let n=0;n<mult(c)&&c.health>0&&sides[side].includes(c)&&alive(1-side).length&&steps<160;n++){
    if(c.attack<=0||c.keywords.includes('cannotAttack'))break;
    snap(def(c).name+' · 先制突袭：立即发起攻击。',c.battleId,null,'effect');steps++;strike(c,attackCount(c));
   }
  }
 }
 // Consume preparation marks once, before ordinary opening abilities. Each hit
 // resolves real shields, surviving-injury payoffs and deaths independently.
 for(let side=0;side<2;side++)for(const c of [...sides[side]]){const hits=c.dragonPings||0;delete c.dragonPings;for(let i=0;i<hits&&c.health>0&&sides[side].includes(c);i++){damage(c,1);snap('龙之翼击 · '+def(c).name+' 受到 1 点伤害（'+(i+1)+'/'+hits+'）。',null,c.battleId,'spell');deaths();}}
 for(let side=0;side<2;side++){
  for(const c of [...sides[side]]){if(c.health<=0)continue;const e=def(c).effect,m=mult(c),friends=alive(side);
   if(e==='batRebirth')for(const x of friends.filter(x=>x.id==='bat')){const before=x.rebornCharges||0;grantBatRebirth(x,c);if(x.rebornCharges!==before)snap(def(c).name+' · 不息血脉：丛林蝙蝠获得 '+m+' 次额外复生。',c.battleId,x.battleId,'reborn');}
   if(['careerVanguard','careerChorus'].includes(e)){const n=progress[side].totalPlayed*m;for(const x of e==='careerVanguard'?[c]:friends.filter(x=>x.battleId!==c.battleId))buff(x,n,n);snap(def(c).name+' · 整局出牌 '+progress[side].totalPlayed+' 张：本场 +'+n+'/+'+n+'。',null,c.battleId,'grow');}
   if(e==='healthAvatar'){const n=c.health*m;buff(c,n,0);snap(def(c).name+' · 生命化身：本场 +'+n+' 攻击。',null,c.battleId,'grow');}
   if(c.id==='night2'){const n=progress[side].battleEntries*m;buff(c,0,n);snap(def(c).name+' · 万骨之王：本场 +'+n+' 生命。',null,c.battleId,'grow');}
   if(e==='rebornGrant')for(const x of friends.filter(x=>x!==c&&!x.reborn).slice(0,m)){x.reborn=true;snap(def(c).name+' · 招魂仪式：'+def(x).name+' 获得复生。',c.battleId,x.battleId,'reborn');}
   if(e==='buffVanguard'){const n=Math.floor(progress[side].buffs/3)*m;buff(c,n,n);snap(def(c).name+' · 强化战阵：本场 +'+n+'/+'+n+'。',null,c.battleId,'grow');}
   if(c.id==='artifact9')buff(c,scrap[side]*m,0);
   if(c.id==='blood10'){const x=[...alive(1-side)].sort((a,b)=>b.attack-a.attack)[0];if(x){buff(x,-(m>=2?x.attack:x.attack-Math.floor(x.attack/2)),0);snap(def(c).name+' · 毒牙凝视：削弱 '+def(x).name+' 的攻击。',c.battleId,x.battleId,'effect');}}
   if(c.id==='forest3')buff(c,S.fairy(growthContext(side))*m,0);
   if(c.id==='blood7'){const n=(meta[side].bloodDamage||0)*2*m;friends.forEach(x=>buff(x,n,n));snap(def(c).name+' · 狂乱加冕：吸血鬼军团获得强化。',null,c.battleId,'grow');}
   if(c.id==='artifact7'){const n=S.growthAmount(growthContext(side),'artifactLord')*m,h=n;friends.forEach(x=>buff(x,n,h));snap(def(c).name+' · 创造主领域：残骸 '+scrap[side]+'，造物 +'+n+'/+'+h+'。',null,c.battleId,'grow');}
   if(e==='forestStart'){const n=(friends.filter(x=>D.isTribe(x,'forest')).length*8+S.fairy(growthContext(side))*2)*m;friends.filter(x=>x.battleId!==c.battleId).forEach(x=>buff(x,n,n));}
   if(e==='royalStart'){const n=(8+Math.floor(progress[side].buffs/10))*m;friends.filter(x=>x.battleId!==c.battleId&&D.isTribe(x,'royal')).forEach(x=>buff(x,n,n));adjacent(c).filter(x=>D.isTribe(x,'royal')).forEach(x=>{for(let i=0;i<m;i++)addShield(x);});}
   if(e==='blast'){for(let hit=0;hit<2;hit++)adjacent(c).forEach(x=>damage(x,1));snap(def(c).name+' · 炽焰点燃：相邻友方各受到两次 1 点伤害。',null,c.battleId,'effect');}
   if(e==='dragonStart'){const pool=[...alive(1-side)],targets=[];while(pool.length&&targets.length<2*m){const target=pick(s,pool);pool.splice(pool.indexOf(target),1);targets.push(target);}const amount=c.attack;targets.forEach(x=>damage(x,amount));}
   if(e==='spellBlast')for(let i=0;i<2;i++){const target=pick(s,alive(1-side));if(!target)break;const n=(2+Math.floor((meta[side].spells||0)/4))*m;damage(target,n);snap(def(c).name+' · 雷光弹幕：'+n+' 点伤害。',c.battleId,target.battleId,'spell');}
   if(c.id==='haven6')adjacent(c).forEach(x=>x.vow=(x.vow||0)+m);
   if(e==='menagerieStart'){alive(1-side).filter(x=>x.keywords.includes('shield')).forEach(x=>breakShield(x,true));const n=new Set(friends.flatMap(x=>D.tribesOf(x)).filter(t=>t!=='neutral')).size*4*m;friends.forEach(x=>buff(x,n,n));snap(def(c).name+' · 终焉降临：摧毁敌方屏障。',null,c.battleId,'shatter');}
  }
 }
 snap('开战效果结算完成。');deaths();
 let side=sides[0].length===sides[1].length?(rand(s)<.5?0:1):(sides[0].length>sides[1].length?0:1);const acted=[new Set(),new Set()];

 while(alive(0).length&&alive(1).length&&steps<160){steps++;
  let attackers=alive(side).filter(c=>c.attack>0&&!c.keywords.includes('cannotAttack')&&!acted[side].has(c.battleId));if(!attackers.length){acted[side].clear();attackers=alive(side).filter(c=>c.attack>0&&!c.keywords.includes('cannotAttack'));}const attacker=attackers[0];
  if(!attacker){if(!alive(1-side).some(c=>c.attack>0&&!c.keywords.includes('cannotAttack')))break;side=1-side;continue;}acted[side].add(attacker.battleId);const hits=attackCount(attacker);
  strike(attacker,hits);side=1-side;
 }
 const winner=sides[0].length&&!sides[1].length?0:sides[1].length&&!sides[0].length?1:-1;
 const rawDamage=winner<0?0:(meta[winner].tier||1)+sides[winner].reduce((n,c)=>n+(def(c).token?1:def(c).tier),0),damageDone=damageCap===null?rawDamage:Math.min(damageCap,rawDamage);
 return {winner,generated,damageCap,damage:damageDone,events,survivors:copy(sides),grave,scrap,healing,deadCount,steps,permanent,discount,progress,meta:meta.map(x=>({tier:x.tier||1,played:x.played||0,spells:x.spells||0,grave:x.grave||0,bloodDamage:x.bloodDamage||0,scrap:x.scrap||0,progress:S.read(x)}))};
}
root.TavernCombat={run};if(typeof module!=='undefined')module.exports={run};
})(typeof globalThis!=='undefined'?globalThis:this);
