'use strict';
// Each identity is tied to a real card ID, never inferred from an arbitrary illustration.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),ctx={};vm.runInNewContext(fs.readFileSync(path.join(root,'library/database.js'),'utf8')+';this.cards=cardData',ctx);
const byId=new Map(ctx.cards.map(c=>[c.card_id,c]));
const sets={forest:[100111010,101131020,101121080,119121010,102131010,101141010,110141030,101121060],royal:[101221080,101211070,101211080,100211040,101241020,103241010,103231020,101241010],dragon:[101411010,101411030,100411050,101411110,103411050,101421040,101431060,101441010],night:[101511120,119511040,101541020,103531030,104541010,110541010,103531020,103541010],rune:[101311020,101311010,101321010,101331010,100321030,101341020,102341010,101341010],haven:[101711020,101711030,101721010,101721020,105721010,100721010,101741030,110741010],neutral:[100011010,101011030,101031020,101031040,102041010,103041010]};
sets.blood=[113611030,101611050,102631030,104641010,103611030,105621010,101641010,103641010];
sets.artifact=[117811020,125811030,112821010,107811070,107821030,107841020,111841010,112841030];
const additions={forest:[101121020,101141020,107141010],royal:[101211130,104241010,107241020],dragon:[104441010,101441020,105441020],night:[106531020,106531010,101531050],rune:[106311030,105341010,103341010],haven:[101711010,105741010,108741010],blood:[103621020,102641010,106641010],artifact:[108821010,107831010,107841030]};
for(const [tribe,extra] of Object.entries(additions))sets[tribe].push(...extra);
sets.forest.push(106121010);sets.blood.push(106621030);
const more={
 forest:[101111040,102111020,100121020,105111010,105131020,104111030,106121020,101121010],
 royal:[100211010,101211060,102211020,106241010,102231010,108221030,104231020,108241010],
 dragon:[105411010,106411010,102411020,107431010,101431010,105421020,106441010,104431030],
 night:[101521010,103511030,104521030,105521010,107521010,106541010,108531030,109541010],
 rune:[100311010,101311060,103321040,105311010,106321030,103311030,107341010,108341010],
 haven:[100711010,101721060,108731010,103711030,104731020,103741010,107741010,102731030],
 blood:[101611010,108621020,107631010,101621020,101621030,108631020,109641010,108641010],
 artifact:[100811060,107821070,109831020,107811060,109831010,108811010,109821020,107841010]
};
for(const [tribe,extra] of Object.entries(more))sets[tribe].push(...extra);
const ids=Object.fromEntries(Object.entries(sets).flatMap(([tribe,arr])=>arr.map((id,i)=>[tribe+i,id])));
Object.assign(ids,{growth:101114010,mana:100314010,bless:101734020,guard:100214020,shield:101714010,evo:101024040,team:103134010,bones:101514010,ritual:103534010,dragon:100414010,clock:100714010,rich:900214040,garden:101113010,tomb:106512010,banner:100222010,egg:104412010,library:101333010,bell:101713020,temple:104712010,hourglass:107713020,fairy:900111010,knight:900211010,skeleton:900511010,hound:900541040,coco:900541050,ancient:900711050});
Object.assign(ids,{mysticArtifact:900811020,radiantArtifact:900811040,bifurcatingArtifact:900811070,spinariaArtifact:900841010,bat:900611010,analyzer:900811030,ancientArtifact:900811010,module:112834010,bloodPact:102614050,bloodGarden:101623010,accelerator:107813030});
Object.assign(ids,{dragon19:101431040,dragonWing:101414010,bloodContract:100614010});
Object.assign(ids,{neutral6:101021010,neutral7:101011040,neutral8:103031010,neutral9:105011010,neutral10:102041020,neutral11:102031030,neutral12:106021020,neutral13:104021030});
Object.assign(ids,{pilfer:123024010,seekCry:109014010,seekLast:120014010,seekEnd:124034010,seekAmulet:107024010,rest:114014010,unguard:122014010});
Object.assign(ids,{fairyGlade:101112010,fairyRealm:101132010,frontline:101232020,magicField:101332010,dragonCanyon:106423010,deathBanquet:102533020,boneRing:107513010,bloodMoon:104633010,ancientAmplifier:107823010,summit:107732010});
Object.assign(ids,{forest20:108131010,royal19:110231020,dragon20:118421020,rune19:101321040,dragon21:103441010,artifact19:108811030,dragonResolve:103424010,newDestiny:101034010,dragonRite:102432030});
Object.assign(ids,{"neutral14":106041010,"neutral15":101031010,"neutral16":107041010,"neutral17":103041020});
Object.assign(ids,{"smallWard":101014020,"tierBlessing":119014010,"grandBlessing":126034010,"battleChorus":101014010,"teamFeast":129024010,"menagerieBlessing":128024010,"marketMeal":114034010,"marketLegacy":121014010,"recruitNovice":116024010,"seekRecruit":125014010,"mirrorRecruit":105024010});
Object.assign(ids,{forest15:127141030,forest16:125141020,rune19:129321010,royal20:126221020,royal21:121211030,coin:900214050,coinVault:110732010,egg:113433010});
Object.assign(ids,{rune20:103331030});
Object.assign(ids,{"forest21":105141020,"royal22":121241010,"royal23":101211020,"royal24":103221030,"rune21":106341010,"night19":122521020,"night20":108511010,"night21":109541030,"haven19":102711010,"haven20":109731010,"haven21":123741010,"blood20":104611020,"blood21":101631020,"artifact20":100811070,"artifact21":116841010});
Object.assign(ids,{"forest22":101111020,"forest23":100111020,"forest24":101111070,"dragon22":102411040,"dragon23":107421010,"dragon24":106441020,"rune22":104321020,"rune23":101311040,"rune24":105341020,"night22":107531020,"night23":101511020,"night24":103521030,"haven22":105731020,"haven23":101721080,"haven24":106731010,"blood22":104621020,"blood23":101621070,"blood24":104631030,"artifact22":107811130,"artifact23":107811020,"artifact24":100821020,"neutral18":116011010,"neutral19":900041080,"neutral20":101611020,"holyGuardian":900741030,"holyWisp":900711130,"mining":126824010,"mine":900512020});
Object.assign(ids,{night25:127531030});
Object.assign(ids,{"forest23":127141020,"forest24":125141030,"night24":126541020,"haven23":124741030,"haven24":129731020,"blood24":123631020,"artifact22":120831020,"artifact23":121811020,"artifact24":125831020});
// Reforged identities
Object.assign(ids,{"forest24":101111070,"night11":121511020,"night21":123531020,"dragon8":102411010,"dragon12":107411010,"blood5":124621010,"blood24":124641030,"artifact19":127811030});
Object.assign(ids,{blood23:111641010});
Object.assign(ids,{blood21:108631010});
Object.assign(ids,{night22:120641020});
Object.assign(ids,{bloodImmunity:900644080});
const trinkets={seed:101122020,purse:900214020,bone:102533020,quill:106312010,bud:108013010,crest:104222010,worldtree:108141010,crown:101232010,mirror:115332010,relic:126713010,moon:101032010,prism:126732010};
const leaders={forest:[121141030,'亚里莎'],royal:[121241030,'艾莉卡'],dragon:[121441030,'罗文'],night:[121541030,'露娜'],rune:[121341030,'伊莎贝尔'],haven:[121741030,'伊莉丝']};
leaders.blood=[121641030,'尤里亚斯'];leaders.artifact=[113841030,'奥契丝'];
Object.assign(leaders,{aria:[107141010,'阿丽雅'],roland:[104241010,'罗兰'],forte:[101441020,'法露特'],ceres:[106531010,'赛蕾丝'],dorothy:[103341010,'桃乐丝'],snow:[105741010,'白雪公主'],medusa:[106641010,'美杜莎'],deus:[107841030,'机械降神']});
function ref(id,name){const d=byId.get(id);if(!d)throw Error('No official record '+id);return {name:name||d.card_name,sourceName:d.card_name,sourceId:id,art:`dusk-tavern/assets/${id}.webp`,sourceUrl:`https://svgdb.me/cards/${id}`,imageSource:`https://svgdb.me/assets/fullart/${id}0.png`,originalType:d.char_type,originalClan:d.clan};}
const identity={cards:Object.fromEntries(Object.entries(ids).map(([k,id])=>[k,ref(id)])),trinkets:Object.fromEntries(Object.entries(trinkets).map(([k,id])=>[k,ref(id)])),heroes:Object.fromEntries(Object.entries(leaders).map(([k,[id,name]])=>[k,ref(id,name)]))};
const dest=path.join(__dirname,'assets');fs.mkdirSync(dest,{recursive:true});
const unique=[...new Map([...Object.values(identity.cards),...Object.values(identity.trinkets),...Object.values(identity.heroes)].map(r=>[r.sourceId,r])).values()];
async function main(){let done=0;const queue=[...unique];await Promise.all(Array.from({length:5},async()=>{while(queue.length){const r=queue.shift(),file=path.join(root,r.art);if(fs.existsSync(file)){done++;continue;}let success=false;for(let attempt=0;attempt<3&&!success;attempt++){try{const response=await fetch(r.imageSource,{signal:AbortSignal.timeout(30000)});if(!response.ok||!response.headers.get('content-type')?.startsWith('image/'))throw Error('HTTP '+response.status);const data=Buffer.from(await response.arrayBuffer());await sharp(data).resize({width:500,withoutEnlargement:true}).webp({quality:84}).toFile(file);success=true;}catch(err){if(attempt===2)throw Error(r.sourceId+' '+r.name+': '+err.message);}}done++;if(done%10===0)console.log('Downloaded '+done+'/'+unique.length);}}));
 fs.writeFileSync(path.join(__dirname,'identity.js'),`(function(root){const I=${JSON.stringify(identity,null,2)};root.TavernIdentity=I;if(typeof module!=='undefined')module.exports=I;})(typeof globalThis!=='undefined'?globalThis:this);\n`);
 fs.writeFileSync(path.join(__dirname,'assets','sources.json'),JSON.stringify({source:'SVGDB full art; Chinese names verified against the project Shadowverse card database',cards:unique},null,2));console.log('Verified identities and local art: '+unique.length);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
