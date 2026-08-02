(() => {
'use strict';
const D=window.ROR_WIKI_DATA;
if(!D){document.body.innerHTML='<main style="padding:40px;color:white">Wiki data is unavailable.</main>';return;}
const U={
zh:{title:'列乌尼斯的挽歌 Wiki',overview:'总览',equipment:'装备',skills:'技能',research:'研究',enemies:'敌人',statuses:'状态',globalSearch:'搜索名称、效果或获取方式…',sourceLabel:'资料来源',sourceText:'由当前游戏数据库与本地化文件生成。',archiveEyebrow:'GAME DATABASE',heroTitle:'列乌尼斯的挽歌 Wiki',heroBody:'装备、技能、研究与敌人资料库。',browseEquipment:'浏览装备',quickFind:'QUICK FIND',browseArchive:'浏览资料库',guide:'GUIDE',howToUse:'使用方法',guideOne:'搜索框只检索名称、效果、获取方式和正式敌人技能说明。',guideTwo:'使用装备格、角色、研究类型、材料和敌人分类进一步限制结果。',guideThree:'技能等级、衍生技能和研究逐级数据均在详细页面查看。',results:' 条结果',filters:'限制',sort:'排序',loadMore:'显示更多',noResults:'没有找到匹配条目',tryFilters:'尝试缩短关键词或清除限制条件。',clear:'清除',all:'全部',keyword:'搜索',slots:'装备格',source:'获取方式',actor:'使用者',type:'类型',target:'目标',material:'相关材料',category:'分类',appearance:'出现地图',idAsc:'默认顺序',idDesc:'默认逆序',nameAsc:'名称',powerDesc:'主要数值',countDesc:'关联数量',equipmentIntro:'装备效果、装备格与获取方式。',skillsIntro:'主技能与升级效果；衍生技能只在主技能详细页面中显示。',researchIntro:'研究效果、等级上限、逐级消耗、前置研究与解锁来源。',enemiesIntro:'实际出现敌人的图像、属性、正式技能说明与出现地图。',searchResults:'搜索结果',searchIntro:'装备、技能、研究与敌人的综合搜索结果。',maxLevel:'等级上限',initialCost:'消耗',unlock:'解锁方式',reward:'研究产物',effect:'效果',flavor:'说明',acquisition:'获取方式',upgrade:'升级效果',fullUpgrade:'完全升级',skillLevel:'技能等级',derived:'衍生内容',hp:'生命',atk:'攻击',def:'防御',gold:'金钱',retreatTurns:'脱战回合',abilities:'技能',noDescription:'无',base:'基础',plus:'升级',max:'完全升级',initialUnlock:'游戏开始时开放',firstObtain:'首次获得后解锁',mapEventUnlock:'在对应区域的事件中解锁',researchMilestone:'研究总等级达到 3000 时开放',unlockNotRecorded:'未记录解锁条件',relatedMaterials:'相关材料',prereqUnlock:'完成以下研究后解锁',entries:'条目',tierCount:'档',boss:'Boss',elite:'精英',common:'普通',summon:'召唤物',production:'生产',develop:'开发',exploration:'探索',creation:'创造',other:'其他',self:'自身',enemy:'敌人',empty:'空格',damage:'伤害',recover:'回复',none:'无',level:'等级',levelCost:'本级消耗',noCost:'无消耗',uses:'使用次数',range:'射程',derivedEnemies:'衍生敌人',derivedFromEnemies:'衍生来源',customEnemyModifiers:'自定义增幅',strongTrial:'强敌试炼',thornJourney:'荆棘之旅',strongTrialDesc:'所有非召唤物敌人的初始生命、攻击、防御增加10%，向下取整。',thornJourneyDesc:'所有非召唤物敌人的初始生命取1.08次方，攻击、防御取1.04次方，向下取整。',summonModifierExempt:'召唤物不受这两项增幅。',statusEyebrow:'STATE ARCHIVE',statusesIntro:'查看28种玩家状态及其效果，并检查常规存档中尚未获得的状态。',statusCountLabel:' 种状态',saveCheckEyebrow:'SAVE CHECK',saveChecker:'存档状态检查',saveCheckerIntro:'选择常规存档 fileXXX.rpgsave，检查距离获得全部28种状态还缺少哪些。',selectSave:'选择存档文件',dropSave:'或将 fileXXX.rpgsave 拖到这里',savePrivacy:'文件只在当前浏览器中读取，不会上传或保存。',statusSearch:'搜索状态名称或效果…',saveWaiting:'选择存档后将在这里显示检查结果。',invalidSave:'这不是一个合法的常规存档文件。',invalidSaveDetail:'请选择游戏 save 文件夹中的 file1–file9999.rpgsave；快速存档、自动存档及其他文件不适用。',saveReadFailed:'无法读取这个存档文件。',saveResult:'检查结果',obtainedStatuses:'已记录状态',missingStatuses:'缺少状态',allStatusesObtained:'这个存档已经获得过全部28种状态。',statusObtained:'已获得',statusMissing:'未获得',fileLabel:'文件'},
en:{title:'Requiem of Reuinis Wiki',overview:'Overview',equipment:'Equipment',skills:'Skills',research:'Research',enemies:'Enemies',statuses:'States',globalSearch:'Search names, effects, or acquisition…',sourceLabel:'DATA SOURCE',sourceText:'Generated from the current game database and localization files.',archiveEyebrow:'GAME DATABASE',heroTitle:'Requiem of Reuinis Wiki',heroBody:'Equipment, skills, research, and enemy reference.',browseEquipment:'Browse equipment',quickFind:'QUICK FIND',browseArchive:'Browse archive',guide:'GUIDE',howToUse:'How to use',guideOne:'Search only checks names, effects, acquisition notes, and official enemy skill descriptions.',guideTwo:'Narrow results by slots, caster, research type, material, or enemy category.',guideThree:'Skill tiers, derived skills, and per-level research data are available in details.',results:' results',filters:'Limits',sort:'Sort',loadMore:'Show more',noResults:'No matching entries',tryFilters:'Try a shorter query or clear a limit.',clear:'Clear',all:'All',keyword:'Search',slots:'Slots',source:'Acquisition',actor:'Caster',type:'Type',target:'Target',material:'Material',category:'Category',appearance:'Appears on',idAsc:'Default order',idDesc:'Reverse order',nameAsc:'Name',powerDesc:'Primary stat',countDesc:'Relations',equipmentIntro:'Equipment effects, slot cost, and acquisition.',skillsIntro:'Main skills and upgrade effects. Derived skills appear only in main-skill details.',researchIntro:'Effects, level caps, per-level costs, prerequisites, and unlock source.',enemiesIntro:'Correct sprites, stats, official skill descriptions, and appearances for enemies actually used in game.',searchResults:'Search results',searchIntro:'Combined results from equipment, skills, research, and enemies.',maxLevel:'Level cap',initialCost:'Cost',unlock:'Unlock',reward:'Reward',effect:'Effect',flavor:'Notes',acquisition:'Acquisition',upgrade:'Upgrade',fullUpgrade:'Full upgrade',skillLevel:'Skill tier',derived:'Derived entries',hp:'HP',atk:'ATK',def:'DEF',gold:'Money',retreatTurns:'Retreat turns',abilities:'Skills',noDescription:'None',base:'Base',plus:'Upgrade',max:'Full upgrade',initialUnlock:'Available from the start',firstObtain:'Unlocks after first obtaining',mapEventUnlock:'Unlocked by an event in the listed area',researchMilestone:'Available when total research level reaches 3000',unlockNotRecorded:'Unlock condition not recorded',relatedMaterials:'Related materials',prereqUnlock:'Unlocks after completing the following research',entries:'entries',tierCount:' tiers',boss:'Boss',elite:'Elite',common:'Common',summon:'Summon',production:'Production',develop:'Development',exploration:'Exploration',creation:'Creation',other:'Other',self:'Self',enemy:'Enemy',empty:'Empty tile',damage:'Damage',recover:'Recovery',none:'None',level:'Level',levelCost:'Cost at this level',noCost:'No cost',uses:'Uses',range:'Range',derivedEnemies:'Derived enemies',derivedFromEnemies:'Derived from',customEnemyModifiers:'Custom modifiers',strongTrial:'Trial of Might',thornJourney:'Journey of Thorns',strongTrialDesc:'All non-summoned enemies start with 10% more HP, ATK, and DEF, rounded down.',thornJourneyDesc:'For all non-summoned enemies, starting HP is raised to the power of 1.08 and ATK/DEF to 1.04, rounded down.',summonModifierExempt:'Summons are unaffected by these modifiers.',statusEyebrow:'STATE ARCHIVE',statusesIntro:'Browse all 28 player states and check which ones a regular save file has not obtained yet.',statusCountLabel:' states',saveCheckEyebrow:'SAVE CHECK',saveChecker:'Save state checker',saveCheckerIntro:'Select a regular fileXXX.rpgsave to see which of the 28 states are still missing.',selectSave:'Choose save file',dropSave:'or drop fileXXX.rpgsave here',savePrivacy:'The file is read only in this browser. It is never uploaded or stored.',statusSearch:'Search state names or effects…',saveWaiting:'Choose a save file to see the result here.',invalidSave:'This is not a valid regular save file.',invalidSaveDetail:'Choose file1–file9999.rpgsave from the game save folder. Quick saves, auto saves, and other files are not supported.',saveReadFailed:'This save file could not be read.',saveResult:'Result',obtainedStatuses:'States recorded',missingStatuses:'States missing',allStatusesObtained:'This save has obtained all 28 states.',statusObtained:'Obtained',statusMissing:'Missing',fileLabel:'File'},
ja:{title:'レウヌニウスの挽歌 Wiki',overview:'概要',equipment:'装備',skills:'スキル',research:'研究',enemies:'敵',statuses:'ステート',globalSearch:'名前・効果・入手方法を検索…',sourceLabel:'データソース',sourceText:'現在のゲームデータとローカライズファイルから生成。',archiveEyebrow:'GAME DATABASE',heroTitle:'レウヌニウスの挽歌 Wiki',heroBody:'装備、スキル、研究、敵の資料庫。',browseEquipment:'装備を見る',quickFind:'QUICK FIND',browseArchive:'資料庫を見る',guide:'GUIDE',howToUse:'使い方',guideOne:'検索対象は名前、効果、入手方法、正式な敵スキル説明のみです。',guideTwo:'装備枠、使用者、研究種類、素材、敵分類で結果を制限できます。',guideThree:'スキル段階、派生スキル、研究のレベル別データは詳細画面で確認できます。',results:' 件',filters:'制限',sort:'並び順',loadMore:'さらに表示',noResults:'一致する項目がありません',tryFilters:'検索語を短くするか、制限を解除してください。',clear:'クリア',all:'すべて',keyword:'検索',slots:'装備枠',source:'入手方法',actor:'使用者',type:'種類',target:'対象',material:'関連素材',category:'分類',appearance:'出現マップ',idAsc:'既定順',idDesc:'逆順',nameAsc:'名前',powerDesc:'主要数値',countDesc:'関連数',equipmentIntro:'装備効果、必要枠、入手方法。',skillsIntro:'メインスキルと強化効果。派生スキルはメインスキル詳細内のみ表示します。',researchIntro:'研究効果、上限、レベル別消費、前提研究、解放元。',enemiesIntro:'実際に登場する敵の画像、能力値、正式スキル説明、出現マップ。',searchResults:'検索結果',searchIntro:'装備、スキル、研究、敵の横断検索結果。',maxLevel:'レベル上限',initialCost:'消費',unlock:'解放方法',reward:'研究報酬',effect:'効果',flavor:'説明',acquisition:'入手方法',upgrade:'強化',fullUpgrade:'最大強化',skillLevel:'スキル段階',derived:'派生内容',hp:'HP',atk:'攻撃',def:'防御',gold:'お金',retreatTurns:'離脱ターン',abilities:'スキル',noDescription:'なし',base:'基本',plus:'強化',max:'最大強化',initialUnlock:'ゲーム開始時から解放',firstObtain:'初めて入手すると解放',mapEventUnlock:'記載エリアのイベントで解放',researchMilestone:'研究合計レベルが3000に達すると解放',unlockNotRecorded:'解放条件の記録なし',relatedMaterials:'関連素材',prereqUnlock:'以下の研究を完了すると解放',entries:'項目',tierCount:' 段階',boss:'ボス',elite:'エリート',common:'通常',summon:'召喚物',production:'生産',develop:'開発',exploration:'探索',creation:'創造',other:'その他',self:'自身',enemy:'敵',empty:'空きマス',damage:'ダメージ',recover:'回復',none:'なし',level:'レベル',levelCost:'このレベルの消費',noCost:'消費なし',uses:'使用回数',range:'射程',derivedEnemies:'派生する敵',derivedFromEnemies:'派生元',customEnemyModifiers:'カスタム補正',strongTrial:'試練',thornJourney:'いばらの旅',strongTrialDesc:'召喚物を除く全敵の初期HP、ATK、DEFを10%増加し、切り捨てます。',thornJourneyDesc:'召喚物を除く全敵の初期HPを1.08乗、ATKとDEFを1.04乗し、切り捨てます。',summonModifierExempt:'召喚物にはこの2つの補正が適用されません。',statusEyebrow:'STATE ARCHIVE',statusesIntro:'プレイヤーが得られる28種のステートと効果を確認し、通常セーブで未取得のものを調べられます。',statusCountLabel:' 種',saveCheckEyebrow:'SAVE CHECK',saveChecker:'セーブのステート確認',saveCheckerIntro:'通常セーブの fileXXX.rpgsave を選び、28種のうち未取得のステートを確認します。',selectSave:'セーブファイルを選択',dropSave:'または fileXXX.rpgsave をここにドロップ',savePrivacy:'ファイルはこのブラウザ内でのみ読み取られ、アップロードも保存もされません。',statusSearch:'ステート名・効果を検索…',saveWaiting:'セーブファイルを選ぶと、ここに結果が表示されます。',invalidSave:'有効な通常セーブファイルではありません。',invalidSaveDetail:'ゲームの save フォルダーにある file1～file9999.rpgsave を選んでください。クイックセーブ、自動セーブ、その他のファイルには対応していません。',saveReadFailed:'このセーブファイルを読み取れませんでした。',saveResult:'確認結果',obtainedStatuses:'取得記録',missingStatuses:'未取得',allStatusesObtained:'このセーブでは28種のステートをすべて取得済みです。',statusObtained:'取得済み',statusMissing:'未取得',fileLabel:'ファイル'}
};
const SECTIONS=['equipment','skills','research','enemies'];
const ROUTES=[...SECTIONS,'statuses'];
let savedLang='zh';try{savedLang=localStorage.getItem('rorWikiLang')||'zh';}catch(e){}
const st={lang:savedLang,route:'overview',query:'',statusQuery:'',filters:{},sort:'idAsc',page:1,pageSize:30,results:[],enemyModifiers:{strong:false,thorns:false},saveCheck:null,architectMode:false};
const UI_TEXT={
 zh:{pagination:'分页',previousPage:'上一页',nextPage:'下一页',pageNumber:'页码',beforeUpgrade:'升级前',afterUpgrade:'升级后',unlocksResearch:'完成本研究后解锁',tierUpgrades:'等级提升',saveMissingEquipment:'装备缺失检查',saveMissingSkills:'技能缺失检查',equipmentSaveIntro:'选择常规存档，检查本存档尚未持有的装备；普通版与升级版视为同一件。',skillSaveIntro:'选择常规存档，检查本存档尚未学习的技能；未明之水银不计入。',obtainedEquipment:'已持有装备',missingEquipment:'缺少装备',learnedSkills:'已学习技能',missingSkills:'缺少技能',allEquipmentObtained:'这个存档已经持有 Wiki 中的全部装备。',allSkillsLearned:'这个存档已经学习 Wiki 中除未明之水银外的全部技能。',singleCost:'单级消耗',rangeCost:'区间总消耗',currentLevel:'当前等级',targetLevel:'目标等级',totalCost:'总消耗',invalidRange:'目标等级必须高于当前等级。',architect:'建筑师',architectDesc:'你的研究等级上限翻倍（如果可行）。',architectApplied:'本研究等级上限已翻倍',architectUnaffected:'本研究不受建筑师影响'},
 en:{pagination:'Pagination',previousPage:'Previous',nextPage:'Next',pageNumber:'Page',beforeUpgrade:'Before Upgrade',afterUpgrade:'After Upgrade',unlocksResearch:'Unlocks after completing this research',tierUpgrades:'Tier Upgrades',saveMissingEquipment:'Missing Equipment',saveMissingSkills:'Missing Skills',equipmentSaveIntro:'Choose a regular save to find equipment missing from this save. Base and upgraded forms count as the same item.',skillSaveIntro:'Choose a regular save to find unlearned skills. Unmanifested Quicksilver is excluded.',obtainedEquipment:'Equipment owned',missingEquipment:'Equipment missing',learnedSkills:'Skills learned',missingSkills:'Skills missing',allEquipmentObtained:'This save has all equipment listed in the Wiki.',allSkillsLearned:'This save has learned every Wiki skill except Unmanifested Quicksilver.',singleCost:'Single Level',rangeCost:'Level Range',currentLevel:'Current Level',targetLevel:'Target Level',totalCost:'Total Cost',invalidRange:'The target level must be higher than the current level.',architect:'Architect',architectDesc:'Your research level cap is doubled (if applicable).',architectApplied:'This research level cap is doubled',architectUnaffected:'This research is unaffected by Architect'},
 ja:{pagination:'ページ切り替え',previousPage:'前へ',nextPage:'次へ',pageNumber:'ページ',beforeUpgrade:'強化前',afterUpgrade:'強化後',unlocksResearch:'この研究を完了すると解放',tierUpgrades:'段階強化',saveMissingEquipment:'未所持装備の確認',saveMissingSkills:'未習得スキルの確認',equipmentSaveIntro:'通常セーブを選び、このセーブで未所持の装備を確認します。通常版と強化版は同じ装備として扱います。',skillSaveIntro:'通常セーブを選び、このセーブで未習得のスキルを確認します。未明たる水銀は対象外です。',obtainedEquipment:'所持装備',missingEquipment:'未所持装備',learnedSkills:'習得スキル',missingSkills:'未習得スキル',allEquipmentObtained:'このセーブではWiki掲載装備をすべて所持しています。',allSkillsLearned:'このセーブでは未明たる水銀を除くWiki掲載スキルをすべて習得しています。',singleCost:'単一レベル',rangeCost:'レベル範囲',currentLevel:'現在レベル',targetLevel:'目標レベル',totalCost:'合計消費',invalidRange:'目標レベルは現在レベルより高くしてください。',architect:'アーキテクト',architectDesc:'研究項目の最大レベルを倍にする（一部除く）。',architectApplied:'この研究の最大レベルは2倍になります',architectUnaffected:'この研究はアーキテクトの対象外です'}
};
const ui=k=>(UI_TEXT[st.lang]&&UI_TEXT[st.lang][k])||k;
const $=q=>document.querySelector(q),$$=q=>[...document.querySelectorAll(q)],tr=k=>U[st.lang][k]||U.zh[k]||k,loc=v=>v&&(v[st.lang]||v.zh||v.en||v.ja)||'';
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=v=>String(v||'').replace(/\\n/g,' ').replace(/\r?\n/g,' ').replace(/\\[A-Za-z]+(?:\[[^\]]*\])?/g,' ').replace(/#\{[^}]+\}/g,'').replace(/\s+/g,' ').trim();
const COLORS=['#ffffff','#20a0d6','#ff784c','#66cc40','#99ccff','#ccc0ff','#ffffa0','#808080','#c0c0c0','#2080cc','#ff3810','#00a010','#3e9ade','#a098ff','#ffcc20','#000000','#84aaff','#ffff40','#ff2020','#dddddd','#e08040','#f0c040','#4080c0','#40c0f0','#80ff80','#c08080','#8080ff','#ff80ff','#00a040','#00e060','#a060e0','#c080ff'];
const iconStyle=(n,z)=>{n=Number(n)||0;return 'background-size:'+(16*z)+'px auto;background-position:-'+((n%16)*z)+'px -'+(Math.floor(n/16)*z)+'px';};
const ico=(n,c='card-icon',z=48)=>'<span class="'+c+'" style="'+iconStyle(n,z)+'"></span>';
const statusIco=(id,c='status-icon',z=48)=>'<span class="'+c+'" style="background-size:'+(10*z)+'px '+(10*z)+'px;background-position:-'+(((Number(id)-1)%10)*z)+'px -'+(Math.floor((Number(id)-1)/10)*z)+'px"></span>';
const chip=(x,c='')=>x?'<span class="chip '+c+'">'+esc(x)+'</span>':'';
const actorImg=(path,c='actor-avatar')=>'<img class="'+c+'" src="RequiemOfReuinis/'+esc(path)+'" alt="">';
const INITIAL_TEXT={
 zh:{able:'（已触发）',unable:'（未触发）',none:'无',enemy:'一个敌人',tile:'一格',area:'该格',dawn:'凌晨',fairy:'（不可叠加，效果取最高值）'},
 en:{able:'(Triggered)',unable:'(Untriggered)',none:'None',enemy:'an enemy',tile:'a tile',area:'nearby',dawn:'dawn',fairy:'(Non-stackable)'},
 ja:{able:'（発動中）',unable:'（未発動）',none:'なし',enemy:'敵1体',tile:'1マス',area:'そのマスの敵',dawn:'夜明け',fairy:'（重複不可、最大値のみ有効）'}
};
const INITIAL_VARIABLES={293:6000,312:1,367:20};
const INITIAL_COUNTERS={};
function collectInitialCounters(value){
 if(typeof value==='string'){
  const re=/\\[Vv]\[(\d+)\]\s*\/\s*(\d+)/g;let m;
  while((m=re.exec(value))){
   const around=value.slice(Math.max(0,m.index-36),Math.min(value.length,re.lastIndex+24));
   if(!/(剩余|残り|Uses?|remaining)/i.test(around))continue;
   const id=Number(m[1]),cap=Number(m[2]);
   if(cap>0&&cap<=99)INITIAL_COUNTERS[id]=INITIAL_COUNTERS[id]?Math.min(INITIAL_COUNTERS[id],cap):cap;
  }
  return;
 }
 if(Array.isArray(value)){value.forEach(collectInitialCounters);return}
 if(value&&typeof value==='object')Object.values(value).forEach(collectInitialCounters);
}
['equipment','skills','research','enemies','statuses'].forEach(k=>collectInitialCounters(D[k]));
const initialWord=k=>(INITIAL_TEXT[st.lang]||INITIAL_TEXT.zh)[k]||INITIAL_TEXT.zh[k]||'';
const initialVar=id=>Object.prototype.hasOwnProperty.call(INITIAL_COUNTERS,id)?INITIAL_COUNTERS[id]:(INITIAL_VARIABLES[id]||0);
const numberText=v=>{v=Number(v);if(!Number.isFinite(v))return '0';v=Math.abs(v)<1e-10?0:v;return String(Number(v.toFixed(4)))};
function evalInitialExpression(value,ctx){
 let expr=String(value==null?'0':value);
 for(let pass=0;pass<16&&expr.includes('\\');pass++){
  const next=expr.replace(/\\([A-Za-z][A-Za-z0-9]*)(?:\[([^\[\]]*)\])?/g,(all,code,arg)=>{
   const v=initialMacroValue(code,arg,ctx);
   return /^[-+]?\d+(?:\.\d+)?$/.test(String(v).trim())?String(v):'0';
  });
  if(next===expr)break;expr=next;
 }
 expr=expr
  .replace(/\$gameVariables\.value\((\d+)\)\.length/g,'0')
  .replace(/\$gameVariables\.value\((\d+)\)/g,(_,id)=>String(initialVar(Number(id))))
  .replace(/\$gameActors\.actor\(1\)\.getmhp\(\)/g,'400')
  .replace(/\$gameActors\.actor\(1\)\.getmmp\(\)/g,'0')
  .replace(/\$gameActors\.actor\(1\)\.hp\b/g,'400')
  .replace(/\$gameActors\.actor\(1\)\.mp\b/g,'0')
  .replace(/\$gameParty\.numItems\([^)]*\)/g,'0');
 if(!/^[\d\s+\-*/%().,A-Za-z]+$/.test(expr)||/\b(?:window|document|Function|eval|constructor|prototype)\b/.test(expr))return 0;
 try{return Number(Function('parseInt','parseFloat','Math','return ('+expr+')')(parseInt,parseFloat,Math))||0}catch(e){return 0}
}
function refIcon(kind,id){
 let ref=kind==='II'?D.refs.items[id]:kind==='IA'?D.refs.armors[id]:kind==='IS'?D.refs.skills[id]:null;
 if(kind==='I')return '<span class="inline-icon" style="'+iconStyle(id,22)+'"></span>';
 if(kind==='IB'){let n=D.refs.buffs[id];return '<span class="inline-buff">'+esc(loc(n)||tr('effect'))+'</span>';}
 if(!ref)return esc(tr('none'));
 return '<span class="inline-ref"><span class="inline-icon" style="'+iconStyle(ref.icon,22)+'"></span>'+esc(loc(ref.name))+'</span>';
}
function initialMacroValue(code,arg,ctx){
 const lower=String(code||'').toLowerCase(),tags=ctx&&ctx.tags||{};
 const n=()=>evalInitialExpression(arg,ctx);
 if(lower==='v')return initialVar(Number(arg)||0);
 if(lower==='lv'||lower==='vmap')return 0;
 if(lower==='upw')return ctx&&ctx.upgraded?n():0;
 if(lower==='mhpper')return 400*n()/100;
 if(lower==='mmpper'||lower==='mmpdiv')return 0;
 if(lower==='patk'||lower==='matk')return 15*n()/100;
 if(lower==='pdef')return 15*n()/100;
 if(lower==='meval'||lower==='mevalp')return Math.trunc(n());
 if(['mskillmagic','mmagic','mmagicprior','mmagicpure','mphysical','mheal','mskillmp','exrange','mfdhl','mfdhlm','mfdhlb','spike'].includes(lower))return Math.trunc(n());
 if(lower==='mshield'||lower==='mhpflow'||lower==='mmpflow'||lower==='mmiasma')return 0;
 if(lower==='mdiyr')return 3;
 if(lower==='mdiydam')return 0;
 if(lower==='mdiyn')return initialWord('none');
 if(lower==='mdiyt')return initialWord('enemy');
 if(lower==='mdiys')return initialWord('area');
 if(lower==='mbinah')return 25;
 if(lower==='mbinahmob')return initialWord('none');
 if(lower==='mmalkuth')return 3;
 if(lower==='myesod')return 50;
 if(lower==='mkether')return 20;
 if(lower==='mnetzach')return 100;
 if(lower==='morder'||lower==='mchaos')return 100;
 if(lower==='mfdlp')return 1;
 if(lower==='zhuore')return ctx&&ctx.upgraded?8:7;
 if(lower==='mkeyday')return initialWord('dawn');
 if(lower==='mdiscordqq')return 1165;
 if(lower==='mbat')return '100%';
 if(lower==='marrow')return st.lang==='en'?'(Maximum shots per exploration: 80.)':st.lang==='ja'?'（上限は80回。）':'（单次探索最多可进行80次射击。）';
 if(lower==='mfiveRing'.toLowerCase())return '(0/5)';
 if(['modd','meven','msolo','msame','msingle1','muni'].includes(lower))return initialWord('able');
 if(lower==='slayable')return initialWord('unable');
 if(lower==='mfairy')return initialWord('fairy');
 if(lower==='mfireeater')return initialWord('none');
 if(['allname','food','highlow','lastskill','mhprest'].includes(lower))return '';
 if(['active','actcur','curse','meqnum','meqnumeral','mallcounteratk','mallcounterdef','mmnum','m1num','mash','mrangenum','mrevenge','mfdl1','mnullskill','ptoa','pto13','pto26','numi'].includes(lower))return 0;
 if(lower==='slot')return 3;
 if(/^m\d+(?:p?g)?$/i.test(code))return '';
 if(arg!==undefined&&arg!=='')return numberText(n());
 return 0;
}
function gameText(value,ctx={}){
 const s=String(value||'');let out='',plainText='',colorOpen=false,i=0;
 const flush=()=>{if(plainText){out+=esc(plainText).replace(/\r?\n/g,'<br>');plainText=''}};
 while(i<s.length){
  if(s[i]!=='\\'){plainText+=s[i++];continue}
  let j=i+1;while(j<s.length&&/[A-Za-z0-9]/.test(s[j]))j++;
  if(j===i+1){plainText+=s[i++];continue}
  let code=s.slice(i+1,j),arg;
  const recognizedNewline=code==='n';
  if(!recognizedNewline&&code[0]==='n'&&!['numi'].includes(code.toLowerCase())){flush();out+='<br>';plainText+=code.slice(1);i=j;continue}
  if(s[j]==='['){let depth=1,k=j+1;while(k<s.length&&depth){if(s[k]==='[')depth++;else if(s[k]===']')depth--;k++}if(depth===0){arg=s.slice(j+1,k-1);j=k}}
  i=j;flush();
  if(code==='n'){out+='<br>';if(arg!==undefined)plainText+='['+arg+']';continue}
  if(code.toLowerCase()==='c'){if(colorOpen){out+='</span>';colorOpen=false}const cn=Number(arg)||0;if(cn!==0){out+='<span class="game-color" style="color:'+(COLORS[cn]||COLORS[0])+'">';colorOpen=true}continue}
  if(['FSM','FSP','FS','FHA','fi','fiNORMAL','CUT'].includes(code)||/^M\d+(?:P?g)?$/i.test(code))continue;
  if(['II','IA','IS','IB','I'].includes(code)){out+=refIcon(code,Number(arg)||0);continue}
  if(code==='SKC'){out+='<kbd>'+esc(({1:'Z',2:'X',3:'C',4:'V'})[arg]||arg||'')+'</kbd>';continue}
  out+=esc(numberText(initialMacroValue(code,arg,Object.assign({},ctx,{source:s,after:s.slice(i)})))).replace(/^0$/,()=>{
   const v=initialMacroValue(code,arg,Object.assign({},ctx,{source:s,after:s.slice(i)}));return esc(v);
  });
 }
 flush();if(colorOpen)out+='</span>';return out||esc(tr('noDescription'));
}
const typeName=v=>tr(v)!==v?tr(v):(v||tr('other'));
const values=(a,f)=>[...new Set(a.flatMap(x=>f(x)).filter(v=>v!==undefined&&v!==null&&v!=='')).values()].sort((a,b)=>String(a).localeCompare(String(b),st.lang));
const sectionData=k=>k==='all'?SECTIONS.flatMap(q=>D[q].map(x=>Object.assign({_kind:q},x))):(D[k]||[]);function searchable(x,k){
 const p=[loc(x.name),loc(x.description),loc(x.acquisition)];
 if(k==='equipment')p.push(...(x.derived||[]).flatMap(d=>[loc(d.name),loc(d.description),loc(d.acquisition)]));
 if(k==='skills')p.push(loc(x.actor),loc(x.flavor),...x.variants.flatMap(v=>v.derived.flatMap(d=>[loc(d.name),loc(d.description),loc(d.acquisition)])));
 if(k==='research')p.push(...(x.relatedItems||[]).map(c=>loc(c.name)),...(x.prerequisites||[]).map(v=>loc(v.name)),...(x.unlocksResearch||[]).map(v=>loc(v.name)),...(x.unlockItems||[]).map(v=>loc(v.name)),...(x.eventMaps||[]).map(v=>loc(v.name)));
 if(k==='enemies')p.push(...x.maps.map(v=>loc(v.name)),...x.abilities.flatMap(a=>[loc(a.name),loc(a.description)]));
 return plain(p.join(' ')).toLocaleLowerCase();
}
function filtered(k){
 const q=plain(st.query).toLocaleLowerCase(),f=st.filters;
 let a=sectionData(k).filter(x=>{const z=x._kind||k;if(q&&!searchable(x,z).includes(q))return false;
  if(z==='equipment'&&f.slots&&String(x.slots)!==f.slots)return false;
  if(z==='skills'&&((f.actor!==undefined&&f.actor!==''&&String(x.actorId)!==f.actor)||(f.type&&x.type!==f.type)))return false;
  if(z==='research'&&((f.type&&x.type!==f.type)||(f.material&&!(x.relatedItems||[]).some(c=>String(c.itemId)===f.material))))return false;
  if(z==='enemies'&&((f.category&&!(x.categories||[x.category]).includes(f.category))||(f.map&&!x.maps.some(m=>String(m.id)===f.map))))return false;
  return true;
 });
 const kind=x=>x._kind||k,power=(x,z)=>z==='enemies'?x.hp:z==='skills'?Math.max(...x.variants.map(v=>Number(v.tags.damage||v.tags.pdamage||v.tags.recover||0))):x.id,count=(x,z)=>z==='skills'?x.variants.reduce((n,v)=>n+v.derived.length,0):z==='research'?x.prerequisites.length:z==='enemies'?x.abilities.length:0;
 a.sort((x,y)=>st.sort==='idDesc'?y.id-x.id:st.sort==='nameAsc'?loc(x.name).localeCompare(loc(y.name),st.lang):st.sort==='powerDesc'?power(y,kind(y))-power(x,kind(x)):st.sort==='countDesc'?count(y,kind(y))-count(x,kind(x)):k==='all'&&SECTIONS.indexOf(kind(x))!==SECTIONS.indexOf(kind(y))?SECTIONS.indexOf(kind(x))-SECTIONS.indexOf(kind(y)):x.id-y.id);
 return a;
}
function applyLanguage(){
 document.documentElement.lang=st.lang==='zh'?'zh-CN':st.lang==='ja'?'ja-JP':'en';document.title=tr('title');
 $$('[data-i18n]').forEach(n=>n.textContent=tr(n.dataset.i18n));$$('[data-i18n-placeholder]').forEach(n=>n.placeholder=tr(n.dataset.i18nPlaceholder));$$('[data-lang]').forEach(n=>n.classList.toggle('active',n.dataset.lang===st.lang));
 renderOverview();if(st.route==='statuses')renderStatuses();else if(st.route!=='overview')renderSection();
}
function setRoute(k,o={}){
 if(!['overview','all',...ROUTES].includes(k))k='overview';
 st.route=k;st.page=1;st.filters=o.filters||{};if(o.query!==undefined){st.query=o.query;$('#globalSearch').value=st.query}
 $$('.view').forEach(v=>v.classList.remove('active'));if(k==='overview')$('#overviewView').classList.add('active');else if(k==='statuses'){$('#statusesView').classList.add('active');renderStatuses()}else{$('#listView').classList.add('active');renderSection()}
 $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.route===k));if(location.hash!=='#'+k)history.replaceState(null,'','#'+k);window.scrollTo({top:0,behavior:'smooth'});
}
function renderOverview(){
 const q=D.summary,a=[['equipment',q.equipment,'⚔'],['skills',q.skills,'✦'],['research',q.research,'⚗'],['enemies',q.enemies,'♞'],['statuses',q.statuses||28,'◈']];
 $('#statsGrid').innerHTML=a.map(x=>'<button class="stat-card" data-route="'+x[0]+'"><span>'+esc(tr(x[0]))+'</span><strong>'+x[1]+'</strong><small>'+esc(tr('entries'))+'</small></button>').join('');
 $('#quickLinks').innerHTML=a.map(x=>'<button class="quick-link" data-route="'+x[0]+'"><span>'+x[2]+'</span><span><strong>'+esc(tr(x[0]))+'</strong><small>'+x[1]+' '+esc(tr('entries'))+'</small></span><b>›</b></button>').join('');
 ['Equipment','Skills','Research','Enemies','Statuses'].forEach((x,i)=>$('#count'+x).textContent=a[i][1]);
 $('#generatedAt').textContent=new Date(q.generatedAt).toLocaleDateString(st.lang==='ja'?'ja-JP':st.lang==='en'?'en-US':'zh-CN');
}
const STATUS_PARAMETERS=['X','Y','Z','A','B','C','D'];
function statusText(value){return gameText(String(value||'').replace(/%v(\d+)/gi,(_,n)=>STATUS_PARAMETERS[Number(n)-1]||('P'+n)))}
function renderStatusGrid(){
 const target=$('#statusGrid');if(!target)return;
 const query=plain(st.statusQuery).toLocaleLowerCase();
 const rows=(D.statuses||[]).filter(status=>!query||plain(loc(status.name)+' '+loc(status.description)).toLocaleLowerCase().includes(query));
 target.innerHTML=rows.map(status=>'<article class="status-card" data-status-id="'+status.id+'">'+statusIco(status.id)+'<div><div class="status-card-heading"><h2>'+esc(loc(status.name))+'</h2></div><p class="game-text">'+statusText(loc(status.description))+'</p></div></article>').join('');
}
function renderSaveCheckResult(){
 const target=$('#saveCheckResult');if(!target)return;
 const result=st.saveCheck;
 if(!result){target.className='save-check-result';target.innerHTML='<p class="save-waiting">'+esc(tr('saveWaiting'))+'</p>';return}
 if(result.kind==='invalid'){target.className='save-check-result invalid';target.innerHTML='<h3>'+esc(tr('invalidSave'))+'</h3><p>'+esc(result.readFailed?tr('saveReadFailed'):tr('invalidSaveDetail'))+'</p>';return}
 const acquired=new Set(result.statusIds),missing=(D.statuses||[]).filter(status=>!acquired.has(status.id));
 target.className='save-check-result valid';
 target.innerHTML='<div class="save-result-head"><span>'+esc(tr('saveResult'))+'</span><b>'+esc(tr('fileLabel'))+': '+esc(result.fileName)+'</b></div><div class="save-result-counts"><span><small>'+esc(tr('obtainedStatuses'))+'</small><strong>'+acquired.size+' / 28</strong></span><span><small>'+esc(tr('missingStatuses'))+'</small><strong>'+missing.length+'</strong></span></div>'+(missing.length?'<div class="missing-status-list">'+missing.map(status=>'<span>'+statusIco(status.id,'status-icon-mini',28)+'<b>'+esc(loc(status.name))+'</b></span>').join('')+'</div>':'<p class="all-statuses">'+esc(tr('allStatusesObtained'))+'</p>');
}
function renderCatalogSaveChecker(route=st.route){
 const panel=$('#catalogSaveChecker'),target=$('#catalogSaveResult');if(!panel||!target)return;
 const equipment=route==='equipment';if(!equipment&&route!=='skills'){panel.hidden=true;return}
 panel.hidden=false;$('#catalogSaveTitle').textContent=ui(equipment?'saveMissingEquipment':'saveMissingSkills');$('#catalogSaveIntro').textContent=ui(equipment?'equipmentSaveIntro':'skillSaveIntro');
 const result=st.saveCheck;
 if(!result){target.className='catalog-save-result';target.innerHTML='<p class="save-waiting">'+esc(tr('saveWaiting'))+'</p>';return}
 if(result.kind==='invalid'){target.className='catalog-save-result invalid';target.innerHTML='<h3>'+esc(tr('invalidSave'))+'</h3><p>'+esc(result.readFailed?tr('saveReadFailed'):tr('invalidSaveDetail'))+'</p>';return}
 const candidates=equipment?(D.equipment||[]):(D.skills||[]).filter(skill=>skill.id!==154),owned=new Set(equipment?result.equipmentIds:result.skillIds),obtained=candidates.filter(entry=>owned.has(entry.id)).length,missing=candidates.filter(entry=>!owned.has(entry.id));
 target.className='catalog-save-result valid';
 target.innerHTML='<div class="save-result-head"><span>'+esc(tr('saveResult'))+'</span><b>'+esc(tr('fileLabel'))+': '+esc(result.fileName)+'</b></div><div class="save-result-counts"><span><small>'+esc(ui(equipment?'obtainedEquipment':'learnedSkills'))+'</small><strong>'+obtained+' / '+candidates.length+'</strong></span><span><small>'+esc(ui(equipment?'missingEquipment':'missingSkills'))+'</small><strong>'+missing.length+'</strong></span></div>'+(missing.length?'<div class="missing-entry-list">'+missing.map(entry=>'<button type="button" data-link-kind="'+route+'" data-link-id="'+entry.id+'">'+ico(entry.icon,'inline-card-icon',30)+'<b>'+esc(loc(entry.name))+'</b></button>').join('')+'</div>':'<p class="all-statuses">'+esc(ui(equipment?'allEquipmentObtained':'allSkillsLearned'))+'</p>');
}
function renderStatuses(){
 const input=$('#statusSearch');if(input)input.value=st.statusQuery;
 renderStatusGrid();renderSaveCheckResult();
}
function resolveSaveReference(value,root){
 if(!value||typeof value!=='object'||value['@r']===undefined)return value;
 const wanted=value['@r'],stack=[root],seen=new Set();
 while(stack.length){const current=stack.pop();if(!current||typeof current!=='object'||seen.has(current))continue;seen.add(current);if(current['@c']===wanted)return current;for(const key of Object.keys(current))if(key!=='@r')stack.push(current[key])}
 return null;
}
function jsonExArray(value,root){value=resolveSaveReference(value,root);if(Array.isArray(value))return value;if(value&&Array.isArray(value['@a']))return value['@a'];return null}
function normalizeArmorId(id){id=Number(id)||0;return id>500?id-500:id}
function normalizeSkillId(id){id=Number(id)||0;return id>0?((id-1)%160)+1:0}
function regularSaveArchive(fileName,raw){
 const match=/^file([1-9]\d{0,3})(?:\.rpgsave)?$/i.exec(String(fileName||''));
 if(!match||Number(match[1])>=10000||typeof LZString==='undefined')return null;
 const json=LZString.decompressFromBase64(String(raw||'').trim());if(!json)return null;
 const data=JSON.parse(json);if(!data||typeof data!=='object')return null;
 const system=resolveSaveReference(data.system,data),variableObject=resolveSaveReference(data.variables,data),actors=resolveSaveReference(data.actors,data),party=resolveSaveReference(data.party,data),map=resolveSaveReference(data.map,data),player=resolveSaveReference(data.player,data);
 if(!system||system['@']!=='Game_System'||!variableObject||variableObject['@']!=='Game_Variables'||!actors||actors['@']!=='Game_Actors'||!party||party['@']!=='Game_Party'||!map||map['@']!=='Game_Map'||!player||player['@']!=='Game_Player')return null;
 const variables=jsonExArray(variableObject._data,data);if(!variables)return null;
 let record=resolveSaveReference(variables[626],data);if(record&&Array.isArray(record['@a']))record=record['@a'];
 const statusIds=[];for(let id=1;id<=28;id++)if(record&&Object.prototype.hasOwnProperty.call(record,id)&&record[id]!==null&&record[id]!==undefined&&Number(record[id])>0)statusIds.push(id);
 const armorObject=resolveSaveReference(party._armors,data)||{},equipmentIds=[...new Set(Object.keys(armorObject).filter(key=>/^\d+$/.test(key)&&Number(armorObject[key])>0).map(normalizeArmorId).filter(Boolean))];
 const actorData=jsonExArray(actors._data,data),actor=resolveSaveReference(actorData&&actorData[1],data),learned=jsonExArray(actor&&actor._skills,data)||[],skillIds=[...new Set(learned.map(normalizeSkillId).filter(Boolean))];
 return {statusIds,equipmentIds,skillIds};
}
function renderAllSaveChecks(){renderSaveCheckResult();renderCatalogSaveChecker()}
async function inspectSaveFile(file){
 if(!file)return;st.saveCheck=null;renderAllSaveChecks();
 if(file.size>20*1024*1024){st.saveCheck={kind:'invalid',readFailed:true};renderAllSaveChecks();return}
 try{const raw=await file.text(),archive=regularSaveArchive(file.name,raw);st.saveCheck=archive?Object.assign({kind:'valid',fileName:file.name},archive):{kind:'invalid',readFailed:false};}
 catch(error){st.saveCheck={kind:'invalid',readFailed:true}}
 renderAllSaveChecks();
}
function filterSelect(k,label,a,fmt=x=>x){
 const v=st.filters[k]===undefined?'':st.filters[k];
 return '<div class="filter-group"><label for="filter-'+k+'">'+esc(label)+'</label><select id="filter-'+k+'" data-filter="'+k+'"><option value="">'+esc(tr('all'))+'</option>'+a.map(x=>'<option value="'+esc(x)+'"'+(String(v)===String(x)?' selected':'')+'>'+esc(fmt(x))+'</option>').join('')+'</select></div>';
}
function renderFilters(k){
 if(k==='all'){$('#filters').innerHTML='<div class="filter-title"><strong>'+esc(tr('searchResults'))+'</strong><button data-clear>'+esc(tr('clear'))+'</button></div><div class="filter-group"><span>'+esc(tr('keyword'))+'</span><p class="source-line">'+esc(st.query)+'</p></div>';return}
 const a=D[k];let h='<div class="filter-title"><strong>'+esc(tr('filters'))+'</strong><button data-clear>'+esc(tr('clear'))+'</button></div>';
 if(k==='equipment')h+=filterSelect('slots',tr('slots'),values(a,x=>String(x.slots)).sort((x,y)=>Number(x)-Number(y)));
 if(k==='skills'){const actors=Object.fromEntries(D.actors.map(x=>[String(x.id),loc(x.name)]));h+=filterSelect('actor',tr('actor'),Object.keys(actors),x=>actors[x]);h+=filterSelect('type',tr('type'),values(a,x=>x.type),typeName)}
 if(k==='research'){const m={};a.forEach(x=>(x.relatedItems||[]).forEach(c=>m[c.itemId]=loc(c.name)));h+=filterSelect('type',tr('type'),values(a,x=>x.type),typeName);h+=filterSelect('material',tr('material'),Object.keys(m).sort((x,y)=>Number(x)-Number(y)),x=>m[x])}
 if(k==='enemies'){const m={};a.forEach(x=>x.maps.forEach(y=>m[y.id]=loc(y.name)));h+=filterSelect('category',tr('category'),['boss','elite','common','summon'],x=>tr(x));h+=filterSelect('map',tr('appearance'),Object.keys(m).sort((x,y)=>Number(x)-Number(y)),x=>m[x])}
 $('#filters').innerHTML=h;
}
const sourceText=x=>x.sourceKnown?loc(x.acquisition):tr('none');
function card(x,k){
 if(k==='equipment')return '<article class="entry-card" data-kind="'+k+'" data-id="'+x.id+'"><div class="card-head">'+ico(x.icon)+'<div><h2>'+esc(loc(x.name))+'</h2><small>'+esc(tr('slots'))+' '+x.slots+'</small></div></div><p class="card-description">'+gameText(loc(x.description),x)+'</p><div class="source-line"><b>'+esc(tr('acquisition'))+':</b> '+esc(sourceText(x))+'</div></article>';
 if(k==='skills'){const v=x.variants[0];return '<article class="entry-card skill-entry-card" data-kind="'+k+'" data-id="'+x.id+'"><div class="card-head"><div class="skill-card-icon">'+ico(x.icon)+actorImg(x.actorImage,'actor-avatar-mini')+'</div><div><h2>'+esc(loc(x.name))+'</h2><small>'+esc(loc(x.actor))+'</small></div></div><div class="chip-row">'+chip('MP '+(Number(v.mpCost)||0),'blue')+chip(tr('uses')+' '+(Number(v.pp)||0),'gold')+'</div></article>'}
 if(k==='research')return '<article class="entry-card" data-kind="'+k+'" data-id="'+x.id+'"><div class="card-head">'+ico(x.icon)+'<div><h2>'+esc(loc(x.name))+'</h2><small>'+esc(tr('maxLevel'))+' '+x.maxLevel+'</small></div></div><p class="card-description">'+gameText(loc(x.description),x)+'</p><div class="chip-row">'+chip(typeName(x.type),'blue')+x.costs.slice(0,3).map(c=>'<span class="chip teal research-cost-chip">'+ico(c.icon,'research-cost-icon',20)+'<span>'+esc(loc(c.name))+'</span></span>').join('')+'</div></article>';
 const portrait=x.sprite?'<canvas class="enemy-sprite" data-enemy="'+x.id+'" width="128" height="128"></canvas>':'<span class="card-icon enemy-fallback">♞</span>';
 return '<article class="entry-card" data-kind="'+k+'" data-id="'+x.id+'"><div class="card-head">'+portrait+'<div><h2>'+esc(loc(x.name))+'</h2><small>'+esc((x.categories||[x.category]).map(tr).join(' · '))+'</small></div></div><div class="statline"><span>'+tr('hp')+'<b>'+x.hp+'</b></span><span>'+tr('atk')+'<b>'+x.atk+'</b></span><span>'+tr('def')+'<b>'+x.def+'</b></span></div><div class="chip-row">'+x.abilities.slice(0,4).map(a=>chip(loc(a.name),a.key==='swift'?'gold':'')).join('')+'</div><div class="source-line">'+x.maps.slice(0,3).map(m=>esc(loc(m.name))).join(' · ')+'</div></article>';
}
function renderSection(){
 const k=st.route,tk=k==='all'?'searchResults':k,ik=k==='all'?'searchIntro':k+'Intro';
 $('#sectionEyebrow').textContent=k==='all'?'SEARCH':'DATABASE / '+k.toUpperCase();$('#sectionTitle').textContent=tr(tk);$('#sectionIntro').textContent=tr(ik);renderFilters(k);renderCatalogSaveChecker(k);
 const opts=[['idAsc',tr('idAsc')],['idDesc',tr('idDesc')],['nameAsc',tr('nameAsc')],['powerDesc',tr('powerDesc')],['countDesc',tr('countDesc')]];
 $('#sortSelect').innerHTML=opts.map(o=>'<option value="'+o[0]+'"'+(st.sort===o[0]?' selected':'')+'>'+esc(o[1])+'</option>').join('');
 st.results=filtered(k);const pages=Math.max(1,Math.ceil(st.results.length/st.pageSize));st.page=Math.max(1,Math.min(st.page,pages));const start=(st.page-1)*st.pageSize;$('#resultCount').textContent=st.results.length;$('#catalog').innerHTML=st.results.slice(start,start+st.pageSize).map(x=>card(x,x._kind||k)).join('');$('#emptyState').hidden=st.results.length>0;renderPagination(pages);requestAnimationFrame(drawEnemySprites);
}
function paginationItems(page,pages){if(pages<=9)return Array.from({length:pages},(_,i)=>i+1);const keep=new Set([1,pages,page-2,page-1,page,page+1,page+2]);const nums=[...keep].filter(n=>n>=1&&n<=pages).sort((a,b)=>a-b),items=[];nums.forEach((n,i)=>{if(i&&n-nums[i-1]>1)items.push(0);items.push(n)});return items}
function paginationElement(){let nav=$('#pagination');if(nav)return nav;nav=document.createElement('nav');nav.id='pagination';nav.className='pagination';const old=$('#loadMore'),catalog=$('#catalog');if(old)old.replaceWith(nav);else if(catalog)catalog.insertAdjacentElement('afterend',nav);return nav}
function renderPagination(pages){const nav=paginationElement();if(!nav)return;nav.setAttribute('aria-label',ui('pagination'));if(st.results.length<=st.pageSize){nav.innerHTML='';nav.hidden=true;return}nav.hidden=false;const numbered=paginationItems(st.page,pages).map(n=>n?'<button type="button" class="page-button'+(n===st.page?' active':'')+'" data-page="'+n+'"'+(n===st.page?' aria-current="page"':'')+'>'+n+'</button>':'<span class="page-ellipsis" aria-hidden="true">…</span>').join(''),jump='<label class="page-jump"><span>'+esc(ui('pageNumber'))+'</span><input type="number" min="1" max="'+pages+'" value="'+st.page+'" inputmode="numeric" data-page-input aria-label="'+esc(ui('pageNumber'))+'"><span>/ '+pages+'</span></label>';nav.innerHTML='<button type="button" class="page-button page-nav" data-page="'+(st.page-1)+'"'+(st.page===1?' disabled':'')+'>'+esc(ui('previousPage'))+'</button>'+numbered+'<button type="button" class="page-button page-nav" data-page="'+(st.page+1)+'"'+(st.page===pages?' disabled':'')+'>'+esc(ui('nextPage'))+'</button>'+jump}
function setPageFromInput(input){const pages=Math.max(1,Math.ceil(st.results.length/st.pageSize)),value=Math.floor(Number(input.value));if(!Number.isFinite(value)){input.value=st.page;return}st.page=Math.max(1,Math.min(value,pages));renderSection();$('#sectionTitle').scrollIntoView({block:'start'})}
const imageCache=new Map();
function drawEnemySprites(){
 $$('canvas[data-enemy]').forEach(canvas=>{if(canvas.dataset.drawn)return;const enemy=D.enemies.find(x=>x.id===Number(canvas.dataset.enemy));if(!enemy||!enemy.sprite)return;canvas.dataset.drawn='1';const src='RequiemOfReuinis/'+enemy.sprite.file;let img=imageCache.get(src);if(!img){img=new Image();img.src=src;imageCache.set(src,img)}const draw=()=>{const s=enemy.sprite,fw=img.naturalWidth/(s.big?3:12),fh=img.naturalHeight/(s.big?4:8),row=s.direction===2?0:s.direction===4?1:s.direction===6?2:3,col=s.index%4,groupRow=Math.floor(s.index/4);let sx=s.big?s.pattern*fw:(col*3+s.pattern)*fw,sy=s.big?row*fh:(groupRow*4+row)*fh,scale=Math.min(2,108/fw,108/fh),dw=fw*scale,dh=fh*scale,ctx=canvas.getContext('2d');ctx.clearRect(0,0,128,128);ctx.imageSmoothingEnabled=false;ctx.drawImage(img,sx,sy,fw,fh,(128-dw)/2,(128-dh)/2,dw,dh)};if(img.complete)draw();else img.addEventListener('load',draw,{once:true})});
}
function detailBlock(title,body,c=''){return body?'<section class="detail-section '+c+'"><h3>'+esc(title)+'</h3><div class="detail-body">'+body+'</div></section>':''}
function metaChips(v){return chip('MP '+(Number(v.mpCost)||0),'blue')+chip('PP '+(Number(v.pp)||0),'gold')}
function skillEffectText(x,v){return gameText(loc(v&&v.description)||loc(x.description),v||x)}
function skillTierChanges(a,b){const rows=[];if(Number(a.mpCost)!==Number(b.mpCost))rows.push(chip('MP '+(Number(a.mpCost)||0)+' → '+(Number(b.mpCost)||0),'blue'));if(Number(a.pp)!==Number(b.pp))rows.push(chip(tr('uses')+' '+(Number(a.pp)||0)+' → '+(Number(b.pp)||0),'gold'));if(String(a.range||'')!==String(b.range||''))rows.push(chip(tr('range')+' '+(a.range||tr('none'))+' → '+(b.range||tr('none')),'teal'));return rows.join('')}
function skillUpgradeHtml(x){if(!x.variants||x.variants.length<2)return '';return detailBlock(ui('tierUpgrades'),'<div class="skill-upgrade-list">'+x.variants.slice(1).map((after,i)=>{const before=x.variants[i],from=Number(before.tier)+1,to=Number(after.tier)+1,official=loc(after.upgradeDescription),fallback=skillTierChanges(before,after);return '<article class="skill-upgrade-card"><div class="skill-upgrade-heading"><b>'+from+' → '+to+'</b></div>'+(official?'<p class="game-text skill-upgrade-official">'+gameText(official,after)+'</p>':'<div class="chip-row">'+fallback+'</div>')+'</article>'}).join('')+'</div>')}
function equipmentDetail(x){return '<header class="detail-header">'+ico(x.icon,'detail-icon',64)+'<div><p class="detail-eyebrow">'+esc(tr('equipment'))+'</p><h2>'+esc(loc(x.name))+'</h2><div class="chip-row">'+chip(tr('slots')+' '+x.slots,'gold')+'</div></div></header>'+detailBlock(tr('effect'),'<p class="game-text">'+gameText(loc(x.description),x)+'</p>')+detailBlock(tr('upgrade'),'<p class="game-text">'+gameText(loc(x.upgrades&&x.upgrades.plus),Object.assign({},x,{upgraded:true}))+'</p>')+detailBlock(tr('flavor'),'<p class="game-text">'+gameText(loc(x.upgrades&&x.upgrades.max))+'</p>')+derivedHtml(x)+detailBlock(tr('acquisition'),'<p>'+esc(sourceText(x))+'</p>')}
function derivedHtml(v){if(!v.derived||!v.derived.length)return '';return detailBlock(tr('derived'),'<div class="derived-grid">'+v.derived.map(d=>{const upgraded=d.kind==='equipment'?loc(d.upgradedDescription):'',toggle=upgraded?'<div class="derived-effect-toggle" role="tablist"><button type="button" class="active" data-derived-effect="base" aria-selected="true">'+esc(ui('beforeUpgrade'))+'</button><button type="button" data-derived-effect="upgraded" aria-selected="false">'+esc(ui('afterUpgrade'))+'</button></div>':'';return '<article class="derived-card"><div class="derived-title">'+ico(d.icon,'inline-card-icon',34)+'<div><small>'+esc(d.kind==='equipment'?tr('equipment'):tr('skills'))+'</small><h4>'+esc(loc(d.name))+'</h4></div></div>'+(d.kind==='equipment'&&d.slots?'<div class="chip-row">'+chip(tr('slots')+' '+d.slots,'gold')+'</div>':'')+toggle+'<p class="game-text derived-effect base">'+gameText(loc(d.description),d)+'</p>'+(upgraded?'<p class="game-text derived-effect upgraded" hidden>'+gameText(upgraded,Object.assign({},d,{upgraded:true}))+'</p>':'')+'<div class="source-line"><b>'+esc(tr('acquisition'))+':</b> '+esc(loc(d.acquisition))+'</div></article>'}).join('')+'</div>')}
function skillDetail(x,tier){tier=Math.max(0,Math.min(Number(tier)||0,x.variants.length-1));const v=x.variants[tier],tabs=x.variants.length>1?'<div class="tier-tabs" role="tablist">'+x.variants.map((z,i)=>'<button type="button" class="tier-button'+(i===tier?' active':'')+'" data-skill-tier="'+i+'" data-skill-id="'+x.id+'" aria-label="'+esc(tr('level'))+' '+(i+1)+'" aria-selected="'+(i===tier?'true':'false')+'">'+(i+1)+'</button>').join('')+'</div>':'';return '<header class="detail-header">'+ico(v.icon||x.icon,'detail-icon',64)+'<div class="detail-title-with-actor">'+actorImg(x.actorImage,'detail-actor')+'<div><p class="detail-eyebrow">'+esc(tr('skills'))+'</p><h2>'+esc(loc(x.name))+'</h2><p class="actor-name">'+esc(loc(x.actor))+'</p></div></div></header>'+tabs+detailBlock(tr('effect'),'<p class="game-text">'+skillEffectText(x,v)+'</p><div class="chip-row">'+metaChips(v)+'</div>')+skillUpgradeHtml(x)+(loc(x.flavor)?detailBlock(tr('flavor'),'<p>'+esc(loc(x.flavor))+'</p>'):'')+derivedHtml(v)+detailBlock(tr('acquisition'),'<p>'+esc(sourceText(x))+'</p>')}
function researchCostAt(x,level){const current=Math.max(0,Math.floor(Number(level)||1)-1),mult=Number(x.costMultiplier)||1,extras=new Map((x.costExtra||[]).map(v=>[Number(v[0]),Number(v[1])||0]));return (x.costs||[]).map(c=>{let cost=Number(c.amount)||0,extra=extras.get(Number(c.itemId))||0;for(let i=0;i<Math.min(current,4);i++)cost=(cost+extra)*mult;if(current>4){const extraLevel=8*Math.log(1+(current-4)/8),factor=Math.pow(mult,extraLevel);cost=Math.abs(mult-1)<1e-9?cost+extra*extraLevel:cost*factor+extra*mult*(factor-1)/(mult-1)}cost=Math.floor(cost);if(Number(x.relatedVariable)>0)cost=Math.max(1,Math.round(cost*.75));return Object.assign({},c,{amount:cost})})}
function researchCostList(costs){return costs.length?'<div class="cost-list">'+costs.map(c=>'<span>'+ico(c.icon,'inline-card-icon',30)+'<b>'+esc(loc(c.name))+'</b><em>&times; '+(Number.isFinite(c.amount)?c.amount:'∞')+'</em></span>').join('')+'</div>':'<p>'+esc(tr('noCost'))+'</p>'}
function researchLevelPanel(x,level){return '<div id="researchLevelBody">'+detailBlock(tr('levelCost'),researchCostList(researchCostAt(x,level)))+'</div>'}
function researchRangeCosts(x,fromLevel,toLevel){const totals=new Map();for(let level=fromLevel+1;level<=toLevel;level++)researchCostAt(x,level).forEach(cost=>totals.set(Number(cost.itemId),(totals.get(Number(cost.itemId))||0)+Number(cost.amount)));return (x.costs||[]).map(cost=>Object.assign({},cost,{amount:totals.get(Number(cost.itemId))||0}))}
function researchEffectiveMax(x){if(x.maxLevel==='∞'||!Number.isFinite(Number(x.maxLevel)))return Infinity;const base=Math.max(1,Number(x.maxLevel));return st.architectMode&&x.architectDoubles?base*2:base}
function researchRangeResult(x,fromLevel,toLevel){const effective=researchEffectiveMax(x),cap=Number.isFinite(effective)?effective:9999;fromLevel=Math.max(0,Math.min(Math.floor(Number(fromLevel)||0),cap));toLevel=Math.max(1,Math.min(Math.floor(Number(toLevel)||1),cap));if(toLevel<=fromLevel)return '<p class="research-range-error">'+esc(ui('invalidRange'))+'</p>';return '<p class="research-range-summary">'+esc(ui('currentLevel'))+' <b>'+fromLevel+'</b><span>→</span>'+esc(ui('targetLevel'))+' <b>'+toLevel+'</b></p>'+detailBlock(ui('totalCost'),researchCostList(researchRangeCosts(x,fromLevel,toLevel)))}
function architectControl(x){const base=x.maxLevel==='∞'?'∞':Number(x.maxLevel),effective=researchEffectiveMax(x),status=st.architectMode?'<em class="architect-result '+(x.architectDoubles?'applied':'unaffected')+'">'+esc(ui(x.architectDoubles?'architectApplied':'architectUnaffected'))+(x.architectDoubles?' · '+base+' → '+effective:'')+'</em>':'';return '<label class="architect-toggle"><input type="checkbox" data-research-architect="'+x.id+'"'+(st.architectMode?' checked':'')+'><span class="architect-switch" aria-hidden="true"></span><span><b>'+esc(ui('architect'))+'</b><small>'+esc(ui('architectDesc'))+'</small>'+status+'</span></label>'}
function updateResearchRange(){const from=$('[data-research-range-from]'),to=$('[data-research-range-to]'),target=$('#researchRangeBody');if(!from||!to||!target)return;const x=(D.research||[]).find(entry=>entry.id===Number(from.dataset.researchRangeFrom));if(x)target.innerHTML=researchRangeResult(x,from.value,to.value)}
function setResearchCostMode(mode){const root=$('.research-cost-calculator');if(!root)return;root.querySelectorAll('[data-research-cost-mode]').forEach(button=>{const active=button.dataset.researchCostMode===mode;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active))});root.querySelectorAll('[data-research-cost-panel]').forEach(panel=>panel.hidden=panel.dataset.researchCostPanel!==mode);if(mode==='range')updateResearchRange()}
function researchUnlockHtml(x){const rows=[];if(x.initialUnlock)rows.push('<div class="unlock-row">'+esc(tr('initialUnlock'))+'</div>');if(x.prerequisites&&x.prerequisites.length)rows.push('<div class="linked-list"><b>'+esc(tr('prereqUnlock'))+'</b>'+x.prerequisites.map(p=>'<button type="button" data-link-kind="research" data-link-id="'+p.id+'">'+ico(p.icon,'inline-card-icon',30)+'<span>'+esc(loc(p.name))+'</span></button>').join('')+'</div>');if(x.unlocksResearch&&x.unlocksResearch.length)rows.push('<div class="linked-list research-unlocks-list"><b>'+esc(ui('unlocksResearch'))+'</b>'+x.unlocksResearch.map(p=>'<button type="button" data-link-kind="research" data-link-id="'+p.id+'">'+ico(p.icon,'inline-card-icon',30)+'<span>'+esc(loc(p.name))+'</span></button>').join('')+'</div>');if(x.unlockItems&&x.unlockItems.length)rows.push('<div class="unlock-list">'+x.unlockItems.map(p=>'<div class="unlock-row">'+ico(p.icon,'inline-card-icon',30)+'<span><b>'+esc(loc(p.name))+'</b><small>'+esc(tr('firstObtain'))+'</small></span></div>').join('')+'</div>');if(x.eventMaps&&x.eventMaps.length)rows.push('<div class="unlock-map"><b>'+esc(tr('mapEventUnlock'))+'</b><div class="chip-row">'+x.eventMaps.map(m=>chip(loc(m.name),'teal')).join('')+'</div></div>');if(x.milestone)rows.push('<div class="unlock-row">'+esc(tr('researchMilestone'))+'</div>');if(!rows.length)rows.push('<p>'+esc(tr('unlockNotRecorded'))+'</p>');return rows.join('')}
function researchRewards(x){const a=[];if(x.rewardEquipName)a.push(ico(x.rewardEquipIcon,'inline-card-icon',30)+esc(loc(x.rewardEquipName)));if(x.rewardSkillName)a.push(ico(x.rewardSkillIcon,'inline-card-icon',30)+esc(loc(x.rewardSkillName)));if(x.rewardItemName)a.push(ico(x.rewardItemIcon,'inline-card-icon',30)+esc(loc(x.rewardItemName)));(x.gainItems||[]).forEach(g=>{const id=Number(Array.isArray(g)?g[0]:g.itemId||g.id),n=Number(Array.isArray(g)?g[1]:g.amount||1),r=D.refs.items[id];a.push((r?ico(r.icon,'inline-card-icon',30)+esc(loc(r.name)):esc(tr('none')))+' &times; '+n)});if(x.gainGold)a.push(esc(tr('gold'))+' &times; '+x.gainGold);return a.length?'<div class="reward-list">'+a.map(v=>'<span>'+v+'</span>').join('')+'</div>':''}
function relatedMaterialsHtml(x){return x.relatedItems&&x.relatedItems.length?'<div class="material-list">'+x.relatedItems.map(p=>'<span>'+ico(p.icon,'inline-card-icon',30)+'<b>'+esc(loc(p.name))+'</b></span>').join('')+'</div>':''}
function researchDetail(x,level){const finite=x.maxLevel!=='\u221e'&&Number.isFinite(Number(x.maxLevel)),baseMax=finite?Math.max(1,Number(x.maxLevel)):Infinity,max=researchEffectiveMax(x),rangeTarget=finite?max:1,rangeMax=finite?max:9999;level=Math.max(1,Math.floor(Number(level)||1));if(finite)level=Math.min(level,max);const picker=finite?'<select data-research-level="'+x.id+'">'+Array.from({length:max},(_,i)=>'<option value="'+(i+1)+'"'+(i+1===level?' selected':'')+'>'+esc(tr('level'))+' '+(i+1)+'</option>').join('')+'</select>':'<input type="number" min="1" step="1" value="'+level+'" data-research-level="'+x.id+'">',range='<div class="research-range-picker"><label><span>'+esc(ui('currentLevel'))+'</span><input type="number" min="0" max="'+Math.max(0,rangeMax-1)+'" step="1" value="0" data-research-range-from="'+x.id+'"></label><span aria-hidden="true">→</span><label><span>'+esc(ui('targetLevel'))+'</span><input type="number" min="1" max="'+rangeMax+'" step="1" value="'+rangeTarget+'" data-research-range-to="'+x.id+'"></label></div><div id="researchRangeBody">'+researchRangeResult(x,0,rangeTarget)+'</div>',maxText=st.architectMode&&x.architectDoubles?baseMax+' → '+max:(finite?max:'∞');return '<header class="detail-header research-detail-header">'+ico(x.icon,'detail-icon research-detail-icon',64)+'<div><p class="detail-eyebrow">'+esc(tr('research'))+'</p><h2>'+esc(loc(x.name))+'</h2><div class="chip-row">'+chip(typeName(x.type),'blue')+chip(tr('maxLevel')+' '+maxText,'gold')+'</div></div></header>'+architectControl(x)+'<p class="game-text research-description">'+gameText(loc(x.description),x)+'</p><div class="research-cost-calculator"><div class="research-cost-tabs" role="tablist"><button type="button" class="active" data-research-cost-mode="single" aria-selected="true">'+esc(ui('singleCost'))+'</button><button type="button" data-research-cost-mode="range" aria-selected="false">'+esc(ui('rangeCost'))+'</button></div><div data-research-cost-panel="single"><div class="level-picker"><label>'+esc(tr('level'))+'</label>'+picker+'</div>'+researchLevelPanel(x,level)+'</div><div data-research-cost-panel="range" hidden>'+range+'</div></div>'+detailBlock(tr('unlock'),researchUnlockHtml(x))+detailBlock(tr('reward'),researchRewards(x))+detailBlock(tr('relatedMaterials'),relatedMaterialsHtml(x))}
function enemyLinks(items){return items&&items.length?'<div class="linked-list">'+items.map(enemy=>'<button type="button" data-link-kind="enemies" data-link-id="'+enemy.id+'"><b>'+esc(loc(enemy.name))+'</b></button>').join('')+'</div>':''}
function enemyModifiedStats(x){let hp=Number(x.hp)||0,atk=Number(x.atk)||0,def=Number(x.def)||0;const summon=(x.categories||[x.category]).includes('summon');if(!summon&&st.enemyModifiers.strong){hp=Math.floor(hp*1.1);atk=Math.floor(atk*1.1);def=Math.floor(def*1.1)}if(!summon&&st.enemyModifiers.thorns){hp=Math.floor(Math.pow(hp,1.08));atk=Math.floor(Math.pow(atk,1.04));def=Math.floor(Math.pow(def,1.04))}return {hp,atk,def,summon,boosted:!summon&&(st.enemyModifiers.strong||st.enemyModifiers.thorns)}}
function enemyModifierControls(x,modified){const toggle=(key,label,description)=>'<label class="enemy-modifier-toggle" title="'+esc(description)+'"><input type="checkbox" data-enemy-modifier="'+key+'" data-enemy-id="'+x.id+'"'+(st.enemyModifiers[key]?' checked':'')+'><span class="enemy-switch" aria-hidden="true"></span><b>'+esc(label)+'</b></label>';return '<div class="enemy-modifiers"><span class="enemy-modifier-title">'+esc(tr('customEnemyModifiers'))+'</span>'+toggle('strong',tr('strongTrial'),tr('strongTrialDesc'))+toggle('thorns',tr('thornJourney'),tr('thornJourneyDesc'))+(modified.summon?'<small>'+esc(tr('summonModifierExempt'))+'</small>':'')+'</div>'}
function enemyDetail(x){const portrait=x.sprite?'<canvas class="enemy-sprite enemy-sprite-large" data-enemy="'+x.id+'" width="128" height="128"></canvas>':'<span class="detail-icon enemy-fallback">&#9822;</span>',modified=enemyModifiedStats(x),statValues=[['hp',modified.hp],['atk',modified.atk],['def',modified.def],['gold',x.gold]];if((x.categories||[x.category]).includes('elite')&&Number(x.escapeTurns)>0)statValues.push(['retreatTurns',x.escapeTurns]);const stats=statValues.map(v=>'<span'+(modified.boosted&&['hp','atk','def'].includes(v[0])?' class="modified-stat"':'')+'><small>'+esc(tr(v[0]))+'</small><b>'+v[1]+'</b></span>').join(''),abilities=x.abilities&&x.abilities.length?'<div class="ability-list">'+x.abilities.map(a=>'<article class="ability-card"><h4>'+esc(loc(a.name))+'</h4><p class="game-text">'+gameText(loc(a.description),{tags:{value:a.value}})+'</p></article>').join('')+'</div>':'<p>'+esc(tr('none'))+'</p>';return '<header class="detail-header">'+portrait+'<div><p class="detail-eyebrow">'+esc(tr('enemies'))+'</p><h2>'+esc(loc(x.name))+'</h2><div class="chip-row">'+(x.categories||[x.category]).map(category=>chip(tr(category),category==='boss'?'gold':category==='elite'?'orange':category==='summon'?'teal':'')).join('')+'</div></div></header>'+enemyModifierControls(x,modified)+'<div class="detail-stat-grid">'+stats+'</div>'+detailBlock(tr('abilities'),abilities)+detailBlock(tr('derivedEnemies'),enemyLinks(x.derivedEnemies))+detailBlock(tr('derivedFromEnemies'),enemyLinks(x.derivedFrom))+detailBlock(tr('appearance'),'<div class="chip-row">'+x.maps.map(m=>chip(loc(m.name),'teal')).join('')+'</div>')}
function openDetail(kind,id,option){const x=(D[kind]||[]).find(v=>v.id===Number(id));if(!x)return;const body=kind==='equipment'?equipmentDetail(x):kind==='skills'?skillDetail(x,option):kind==='research'?researchDetail(x,option):enemyDetail(x);$('#detailContent').innerHTML=body;const dlg=$('#detailDialog');if(!dlg.open)dlg.showModal();requestAnimationFrame(drawEnemySprites)}
document.addEventListener('click',e=>{const lang=e.target.closest('[data-lang]');if(lang){st.lang=lang.dataset.lang;try{localStorage.setItem('rorWikiLang',st.lang)}catch(err){}applyLanguage();return}const effect=e.target.closest('[data-derived-effect]');if(effect){const card=effect.closest('.derived-card'),mode=effect.dataset.derivedEffect;card.querySelectorAll('[data-derived-effect]').forEach(b=>{const active=b.dataset.derivedEffect===mode;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active))});card.querySelectorAll('.derived-effect').forEach(p=>p.hidden=!p.classList.contains(mode));return}const researchMode=e.target.closest('[data-research-cost-mode]');if(researchMode){setResearchCostMode(researchMode.dataset.researchCostMode);return}const page=e.target.closest('[data-page]');if(page&&!page.disabled){st.page=Number(page.dataset.page)||1;renderSection();$('#sectionTitle').scrollIntoView({block:'start'});return}const tier=e.target.closest('[data-skill-tier]');if(tier){openDetail('skills',tier.dataset.skillId,tier.dataset.skillTier);return}const link=e.target.closest('[data-link-kind]');if(link){openDetail(link.dataset.linkKind,link.dataset.linkId);return}const route=e.target.closest('[data-route]');if(route){setRoute(route.dataset.route);return}const entry=e.target.closest('.entry-card');if(entry){openDetail(entry.dataset.kind,entry.dataset.id);return}const clear=e.target.closest('[data-clear]');if(clear){st.filters={};st.query='';st.page=1;$('#globalSearch').value='';renderSection();return}if(e.target===$('#mobileFilterButton')){$('#filters').classList.toggle('mobile-open');return}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('[data-page-input]')){e.preventDefault();setPageFromInput(e.target)}});
document.addEventListener('change',e=>{if(e.target.matches('[data-page-input]')){setPageFromInput(e.target);return}if(e.target===$('#saveFileInput')||e.target===$('#catalogSaveFileInput')){inspectSaveFile(e.target.files&&e.target.files[0]);e.target.value='';return}if(e.target.matches('[data-research-architect]')){const id=e.target.dataset.researchArchitect,level=$('[data-research-level]'),active=$('[data-research-cost-mode].active'),mode=active&&active.dataset.researchCostMode;st.architectMode=e.target.checked;openDetail('research',id,level&&level.value);if(mode==='range')setResearchCostMode('range');return}if(e.target.matches('[data-research-range-from],[data-research-range-to]')){updateResearchRange();return}if(e.target.matches('[data-enemy-modifier]')){st.enemyModifiers[e.target.dataset.enemyModifier]=e.target.checked;openDetail('enemies',e.target.dataset.enemyId);return}if(e.target.matches('[data-filter]')){st.filters[e.target.dataset.filter]=e.target.value;st.page=1;renderSection();return}if(e.target===$('#sortSelect')){st.sort=e.target.value;st.page=1;renderSection();return}if(e.target.matches('[data-research-level]'))openDetail('research',e.target.dataset.researchLevel,e.target.value)});
document.addEventListener('input',e=>{if(e.target===$('#statusSearch')){st.statusQuery=e.target.value;renderStatusGrid();return}if(e.target===$('#globalSearch')){st.query=e.target.value;st.page=1;if(st.route!=='overview'&&st.route!=='statuses')renderSection();return}if(e.target.matches('[data-research-range-from],[data-research-range-to]')){updateResearchRange();return}if(e.target.matches('input[data-research-level]')){const id=e.target.dataset.researchLevel,value=e.target.value;if(value&&Number(value)>0)openDetail('research',id,value)}});
$('#globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter'&&st.query.trim())setRoute('all',{query:st.query})});
document.addEventListener('dragover',e=>{const zone=e.target.closest&&e.target.closest('#saveDropzone');if(zone){e.preventDefault();zone.classList.add('dragging')}});
document.addEventListener('dragleave',e=>{const zone=e.target.closest&&e.target.closest('#saveDropzone');if(zone)zone.classList.remove('dragging')});
document.addEventListener('drop',e=>{const zone=e.target.closest&&e.target.closest('#saveDropzone');if(zone){e.preventDefault();zone.classList.remove('dragging');inspectSaveFile(e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0])}});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target===$('#saveDropzone')){e.preventDefault();$('#saveFileInput').click()}});
$('#closeDialog').addEventListener('click',()=>$('#detailDialog').close());$('#detailDialog').addEventListener('click',e=>{if(e.target===$('#detailDialog'))$('#detailDialog').close()});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!/input|textarea|select/i.test(document.activeElement.tagName)){e.preventDefault();$('#globalSearch').focus()}if(e.key==='Escape'&&$('#detailDialog').open)$('#detailDialog').close()});
const hash=location.hash.slice(1);if(ROUTES.includes(hash))st.route=hash;applyLanguage();setRoute(st.route);
})();
