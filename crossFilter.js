// 模拟按钮信息数组
let lastPacket = 10030;

const packetNames = ["基础卡","经典卡包","暗影进化","巴哈姆特降临","诸神狂岚","梦境奇想","星神传说","时空转生","起源之光·终焉之暗","苍空骑翔","灭祸十杰","扭曲次元","钢铁的反叛者","荣耀再临","森罗咆哮","极斗之巅","那塔拉的崩坏","命运诸神","勒比卢的旋风","十天觉醒","暗黑的威尔萨","物语重归","超越灾祸者","十祸斗争","天象乐土","极天龙鸣","示天龙剑","八狱魔境·阿兹弗特","悠久学院","密斯塔尔希亚的英雄","变革的恒规"];

const cvTable = [
    "潘めぐみ",
    "钉宫理惠",
    "佐仓绫音",
    "大关英里",
    "堀江由衣",
    "日笠阳子",
    "种崎敦美",
    "井上和彦",
    "小清水亚美",
    "喜多村英梨",
    "大原さやか",
    "KENN",
    "小山刚志",
    "川澄绫子",
    "ゆかな",
    "置鲇龙太郎",
    "福原绫香",
    "米泽圆",
    "佐藤利奈",
    "安元洋贵",
    "诹访彩花",
    "三木真一郎",
    "花泽香菜",
    "伊藤静",
    "远藤绫",
    "悠木碧",
    "井上麻里奈",
    "雨宫天",
    "植田佳奈",
    "田村ゆかり",
    "石田彰",
    "茅野爱衣",
    "杉田智和",
    "鸟海浩辅",
    "水濑いのり",
    "村濑步",
    "内山夕实",
    "武内骏辅",
    "平田广明",
    "福山润",
    "户松遥",
    "柿原彻也",
    "坂本真绫",
    "广桥凉",
    "岛崎信长",
    "加藤英美里",
    "原纱友里",
    "桧山修之",
    "稻田彻",
    "三宅健太",
    "水桥かおり",
    "名冢佳织",
    "辻あゆみ",
    "明坂聪美",
    "藤村步",
    "内田真礼",
    "关智一",
    "花江夏树",
    "森久保祥太郎",
    "苍井翔太",
    "皆口裕子",
    "三泽纱千香",
    "冈本信彦",
    "田中理惠",
    "下屋则子",
    "浅川悠",
    "石原夏织",
    "柚木凉香",
    "井上喜久子",
    "内田雄马",
    "赤崎千夏",
    "小山力也",
    "白井悠介",
    "丹下樱",
    "丰永利行",
    "上田燿司",
    "千叶繁",
    "泽城みゆき",
    "井口裕香",
    "铃木达央",
    "立花理香",
    "诹访部顺一",
    "田中美海",
    "ブリドカットセーラ惠美",
    "津田健次郎",
    "清水爱",
    "浅仓杏美",
    "保村真",
    "小野坂昌也",
    "子安武人",
    "中井和哉",
    "铃村健一",
    "大久保瑠美",
    "上坂すみれ",
    "水泽史绘",
    "高木美佑",
    "内山昂辉",
    "川崎芽衣子",
    "绿川光",
    "佐藤拓也",
    "逢坂良太",
    "山本希望",
    "三森すずこ",
    "大友龙三郎",
    "中田让治",
    "大冢芳忠",
    "优木かな",
    "金田朋子",
    "麻仓もも",
    "樱井孝宏",
    "寺崎裕香",
    "石川界人",
    "生天目仁美",
    "加隈亚衣",
    "大坪由佳",
    "こやまきみこ",
    "早见沙织",
    "内田彩",
    "青木瑠璃子",
    "竹内良太",
    "小野贤章",
    "中村悠一",
    "茶风林",
    "梶裕贵",
    "佳月大人",
    "鹤冈聪",
    "兴津和幸",
    "松冈由贵",
    "佐仓薰",
    "田所あずさ",
    "小仓唯",
    "神谷浩史",
    "后藤ヒロキ",
    "伊濑茉莉也",
    "门脇舞以",
    "丰田萌绘",
    "伊藤健太郎",
    "赤羽根健治",
    "东山奈央",
    "野岛健儿",
    "能登麻美子",
    "田中凉子",
    "恒松あゆみ",
    "立花慎之介",
    "齐藤壮马",
    "安济知佳",
    "小松史法",
    "江原正士",
    "丰口めぐみ",
    "佐藤聪美",
    "中村绘里子",
    "渊上舞",
    "速水奖",
    "樫井笙人",
    "斧アツシ",
    "茅原实里"
];

const lowRules = [
    {
        id: 1,
        title: '同一费用',
        rand: ['num',1,10],
        operation: 'card.cost == rand'
    },
    {
        id: 2,
        title: '同攻击力',
        rand: ['num',0,10],
        operation: 'card.char_type == 1 && card.atk == rand'
    },
    {
        id: 3,
        title: '同生命值',
        rand: ['num',1,10],
        operation: 'card.char_type == 1 && card.life == rand'
    },
    {
        id: 4,
        title: '同基础词条',
        rand: ['str',["士兵","指挥官","土之印","自然","机械","宴乐","八狱","英雄","学园","马纳历亚","武装","雷维翁","西洋棋","创造物","财宝"]],
        operation: 'card.tribe_name.includes(rand) || (minorCard(card) && minorCard(card).tribe_name.includes(rand)) || card.tribe_name == "全部"'
    },
    {
        id: 5,
        title: '具有能力',
        rand: ['key',
        ["evolution_end_stop","rush","quick","drain","killer","guard","sneak","cant_attack"],
        ["进化后失去词条","突进","疾驰","吸血","必杀","守护","潜行","无法攻击"]],
        operation: 'generateSkills(card).includes(rand)'
    },
    {
        id: 6,
        title: '具有能力',
        rand: ['key',
        ["possess_ep_modifier","lose","update_deck","open_card","NTR","ramp","change_affiliation","oppoHeal","AOEReturn","lock","independent","permShield","damage_modifier","stack_white_ritual","handMetamorphose"],
        ["回复EP","（使）失去能力","洗入牌堆","公开","牛头人","跳/扣费","改变种族","治疗对手","全体回手","锁","不受效果英雄","受到伤害变为0","增加造成的伤害","蓄积","手牌变形"]],
        operation: 'generateSkills(card).includes(rand)'
    },
    {
        id: 7,
        title: '同条件词条',
        rand: ['key',["awake=","berserk=","wrath=","avarice=","resonance="],["觉醒","复仇","狂乱","渴望","共鸣"]],
        operation: 'card.skill_condition.includes(rand) || (minorCard(card) && minorCard(card).skill_condition.includes(rand))'
    },
    {
        id: 104,
        title: '使用时/入场曲要指定',
        rand: ['key',["me1op1"],["1个己方目标与1个敌方目标"]],
        operation: 'mustSelect(card,rand)'
    },
    {
        id: 105,
        title: '激奏使用',
        rand: ['num',0,5],
        operation: 'fixeduseKey("accelerate",card,rand)',
    },
    {
        id: 106,
        title: '结晶使用',
        rand: ['num',1,5],
        operation: 'fixeduseKey("crystallize",card,rand)',
    },
    {
        id: 107,
        title: '爆能使用',
        rand: ['num',3,10],
        operation: 'fixeduseKey("play",card,rand)',
    },
    {
        id: 108,
        title: '具有能力',
        rand: ['key',["discard","banish","destroy","cost_change","return_card","shield"],
        ["弃牌","消失敌方","破坏敌方","改变费用","回手其他卡片","下一次受到伤害转变为0"]],
        operation: 'generateSkills(card).includes(rand)'
    },
    {
        id: 109,
        title: '具有能力',
        rand: ['key',["fusion","fusion_metamorphose","type=oldest","not_be_attacked","untouchable","metamorphose","cant_evolution","attack_count"],
        ["融合","融合变身","轮流造成伤害","无法被攻击","方块膜","变形","无法进化","多次攻击/攻击次数修改"]],
        operation: 'generateSkills(card).includes(rand)'
    },
    {
        id: 110,
        title: '具有能力',
        rand: ['key',["evolve","selfDestroy","indestructible","revive","ignore_guard","invocation","obtain_self"],
        ["自动进化","自我破坏","金膜","复活","无视守护","瞬念召唤","衍生自己"]],
        operation: 'generateSkills(card).includes(rand)'
    },
    {
        id: 111,
        title: '造成伤害',
        rand: ['num',1,10],
        operation: 'findKey("damage",card,rand) || (minorCard(card) && findKey("damage",minorCard(card),rand))'
    },
    {
        id: 112,
        title: '回复生命值',
        rand: ['num',1,3],
        operation: 'findKey("heal",card,rand) || (minorCard(card) && findKey("heal",minorCard(card),rand))'
    },
    {
        id: 113,
        title: '抽牌',
        rand: ['key',[/character=me&target=deck&card_type=all&random_count=1/,/character=me&target=deck&card_type=all&random_count=2/,/character=me&target=deck&card_type=all&tribe=[^&]+/],
        ["1张","2张","检索种族"]],
        operation: 'matchKey("draw",card,rand) || (minorCard(card) && matchKey("draw",minorCard(card),rand))'
    },
    {
        id: 114,
        title: '具有能力',
        rand: ['key',["leaderPowerup","leaderPowerdown","power_down","choice","selfDamage","selfFollowerDamage"],
        ["+血上限","-血上限","扣除能力值","抉择","自残","打自己随从"]],
        operation: 'generateSkills(card).includes(rand)'
    },
    {
        id: 115,
        title: '具有能力',
        rand: ['key',["burial_rite","necromance","ritual","spell_charge"],
        ["葬送","死灵术","土之秘术","魔力增幅"]],
        operation: 'generateSkills(card).includes(rand)'
    },
    {
        id: 116,
        title: '增加能力值',
        rand: ['str',["+1/+0","+2/+0","+0/+1","+0/+2","+0/+3","+3/+0","+1/+1","+1/+2","+2/+1","+2/+2","+3/+3","+4/+4","+X/+0","+X/+X"]],
        operation: 'getTrueDesc(card).includes(rand)'
    },
    {
        id: 117,
        title: '会检查以下计数',
        rand: ['key',["selfDestroyCount","selfLeftCount","selfSummonCount","selfEvolveCount","selfDeckCount","selfHandCount","status_life","status_offense","selfStatus_life","selfInPlaySum","selfInPlayCount","selfPlaySpCardCount"],
        ["破坏数量","离场数量","入场数量","进化次数","牌库数","手牌结构","其他随从的生命值","其他随从的攻击","自己的生命值","己方随从数","己方随从结构","使用过某张牌的数量"]],
        operation: 'generateSkills(card).includes(rand)'
    },
    {
        id: 118,
        title: '具有同衍生物',
        rand: ['key',[900111010, 900811050, 900012010, 900511020, 900611010, 900011080, 900511010, 900811030, 900211010, 900311020, 900311030, 900511030, 900811010, 900214030, 900312010, 900214020, 900214040, 900312020, 900811040, 900411010, 900811020, 900012020, 900012030, 900014010, 900214010, 900111020, 900411030, 900814010, 900211020, 900511040, 900611020, 900811110, 900012040, 900211030, 900211070, 900314050, 900411020, 900711020, 900741030, 900311110, 900314040, 900422010, 900441040, 115111010, 900311090, 900311100, 900314030, 900811060, 900811090, 900831020, 900831030, 100011010, 900214050, 900311010, 900311040, 900314020, 900611030, 900711010, 900711060],['妖精', '悬丝傀儡', '那塔拉的大树', '怨灵', '丛林蝙蝠', '生产器械', '骷髅士兵', '解析的创造物', '骑士', '泥尘巨像', '守护者巨像', '僵尸', '古老的创造物', '黄金之靴', '土之魔片', '黄金之杯', '黄金首饰', '大地之魔片', '绚烂的创造物', '飞龙', '神秘的创造物', '顺从的骏马', '机动二轮车', '修复模式', '黄金短剑', '妖精萤火', '虎鲸', '典范转移', '重装骑士', '巫妖', '毒蛇', '改良型·悬丝傀儡', '魔导装甲车', '铁甲骑士', '战盾卫士', '马纳历亚防御阵', '风暴巨龙', '圣炎猛虎', '圣骑兵', '奇幻士兵', '马纳历亚魔弹', '龙武装甲', '地狱火魔龙', '密林守卫者', '式神·小纸人', '式神·暴鬼', '真理的术式', '精奥的创造物', '锋锐的创造物', '防御型巨像', '攻击型巨像', '哥布林', '闪耀的金币', '雪人', '废铁巨像', '红莲的法术', '恶魔', '神圣猎鹰', '壮丽大神隼']],
        operation: '(card.skill_option.includes(rand) || card.skill_target.includes(rand)) || (minorCard(card) && (minorCard(card).skill_option.includes(rand) || minorCard(card).skill_target.includes(rand)))'
    },
    {
        id: 119,
        title: '具有构筑卡衍生物',
        rand: ['none'],
        operation: '(card.skill_option.match(/\\b1\\d{8}\\b/g) && card.skill_option.match(/\\b1\\d{8}\\b/g).some(id => card.card_id != id && cardPool.some(cd => cd.card_id == id))) || (minorCard(card) && (minorCard(card).skill_option.match(/\\b1\\d{8}\\b/g) && minorCard(card).skill_option.match(/\\b1\\d{8}\\b/g).some(id => card.card_id != id && cardPool.some(cd => cd.card_id == id))) )'
    }
];

const highRules = [
  {
      id: 201,
      title: '同稀有度',
      rand: ['numRange',1,4,["铜","银","金","虹"]],
      operation: 'card.rarity == rand'
  },
  {
      id: 202,
      title: '非常规进化增加能力值',
      rand: ['key',[["eq",0,"eq",0],["eq",1,"eq",1],["eq",3,"eq",3],["ge",4,"ge",4],["ge",3,"le",1]],[["不增加能力值"],["+1/+1"],["+3/+3"],["+4/+4或更高"],["+3或更高攻，但仅+1或更少生命"]]],
      operation: 'card.char_type == 1 && strangeEvo(card,rand)'
  },
  {
      id: 204,
      title: '可被自己或自己衍生卡以外的其他卡衍生的构筑卡',
      rand: ['none'],
      operation: 'card.card_set_id!=90000 && isNToken(card)'
  },
  {
      id: 301,
      title: '同卡包',
      rand: ['key',Array.from({ length: lastPacket - 9999 }, (_, i) => i + 10000),packetNames],
      operation: 'card.card_set_id == rand'
  },
  {
      id: 302,
      title: '具有语音联动',
      rand: ['none'],
      operation: 'hasVoiceInteract(card)'
  },
  {
      id: 303,
      title: '能力描述中强调了',
      rand: ['key',[/上限为[0-9]+(次|张)/,/（(?:(?!能力|变身)[^)\s])+除外）/,/(随机指定|随机发动1种能力。此行动将进行X次。X为)/],["某能力的触发上限","判别除外某张/些卡片","数值的随机分配"]],
      operation: 'rand.exec(getTrueDesc(card)) !== null'
  },
  {
      id: 303.5,
      title: '具有重印卡',
      rand: ['none'],
      operation: 'hasReprint(card)'
  },
  {
      id: 304,
      title: '具有异画',
      rand: ['key',["leaderDiff","passDiff","poolDiff","activityDiff","packDiff"],["主战者异画","通行证异画","卡池非主战者异画","活动/联动异画","预组异画"]],
      operation: 'differArr[rand].includes(card.card_name)'
  },
  {
      id: 305,
      title: '进化后会更换部分语音',
      rand: ['none'],
      operation: 'card.char_type == 1 && hasSPEvolveVoice(card)'
  },
  {
      id: 306,
      title: '不具有独特爆能语音的随从',
      rand: ['none'],
      operation: 'card.char_type == 1 && generateSkills(card).includes("pp_fixeduse") && !hasEHEvolveVoice(card)'
  },
  {
      id: 307,
      title: '独一无二的身材（费用-攻击-生命）',
      rand: ['none'],
      operation: 'card.char_type == 1 && uniqueStats(card)'
  },
  {
      id: 308,
      title: '描述文字中出现了数字',
      rand: ['key',[['1','2','3','4'],['1','2','3','4','5'],['1','1','1','1','1'],['2','2','2','2','2']],[["1、2、3、4"],["1、2、3、4、5"],["至少5个1"],["至少5个2"]]],
      operation: 'isSubArray(getTrueDesc(card).match(/\\d+/g),rand)'
  },
  {
      id: 309,
      title: '同cv',
      rand: ['str',cvTable],
      operation: 'hasCV(card,rand)'
  },
  {
      id: 312,
      title: '（曾）是',
      rand: ['key',["twoPickBan","unlimitedBan","doubleClassBan"],["2p禁卡","无限禁限卡","双职业禁限卡"]],
      operation: 'changeArr[rand].includes(card.card_name)'
  },
  {
      id: 314,
      title: '经过',
      rand: ['key',["strengthen","weaken","change"],["加强（含回调）","削弱（含回调）","能力修改"]],
      operation: 'changeArr[rand].includes(card.card_name)'
  },
  {
      id: 319,
      title: '影之幻境随从',
      rand: ['none'],
      operation: 'differArr[\'phantom\'].includes(card.card_name)'
  }]
  //{
      //id: 315,
      //title: '卡面角色出现在其他法术/护符上过（自衍生除外）',
      //rand: ['none'],
      //operation: 'spellAlt.some(arr => arr.slice(1).some(item => item.includes(card.card_id)));'
  //}
  const hellRules = [
  {
      id: 310,
      title: '在某张卡的风味描述中有过发言（——XXX的形式）',
      rand: ['none'],
      operation: 'hasFlavor(card)'
  },
  {
      id: 315,
      title: '闪卡会眨眼',
      rand: ['none'],
      operation: 'differArr[\'twinkCard\'].includes(card.card_name)'
  },

  {
      id: 316,
      title: '具有演示PV',
      rand: ['none'],
      operation: 'differArr[\'displayVideo\'].includes(card.card_name)'
  },
  {
      id: 317,
      title: '抽卡界面看板',
      rand: ['none'],
      operation: 'differArr[\'drawCard\'].includes(card.card_name)'
  },
  {
      id: 318,
      title: '预览季新卡发布者',
      rand: ['key',["lutiyaCard","xybmCard"],["璐缇雅","饼"]],
      operation: 'differArr[rand].includes(card.card_name)'
  }
];
