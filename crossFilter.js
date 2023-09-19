// 模拟按钮信息数组
let lastPacket = 10029;
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
        title: '重印卡',
        rand: ['none'],
        operation: 'card.base_card_id != card.card_id && card.card_set_id != 90000'
    },
    {
        id: 6,
        title: '具有能力',
        rand: ['key',
        ["possess_ep_modifier","lose","update_deck","open_card","NTR","ramp","change_affiliation","oppoHeal","AOEReturn","lock","independent","permShield","damage_modifier","stack_white_ritual","handMetamorphose"],
        ["回复EP","（使）失去能力","洗入牌堆","公开","牛头人","跳/扣费","改变种族","治疗对手","全体回手","锁","不受效果英雄","受到伤害变为0","增加造成的伤害","蓄积","手牌变形"]],
        operation: 'generateSkills(card).includes(rand) || (minorCard(card) && generateSkills(minorCard(card)).includes(rand))'
    },
    {
        id: 7,
        title: '同条件词条',
        rand: ['key',["awake=true","berserk=true","wrath=true","avarice=true","resonance=true"],["觉醒","复仇","狂乱","渴望","共鸣"]],
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
        ["弃牌","消失","破坏","改变费用","回手其他卡片","下一次受到伤害转变为0"]],
        operation: 'generateSkills(card).includes(rand) || (minorCard(card) && generateSkills(minorCard(card)).includes(rand))'
    },
    {
        id: 109,
        title: '具有能力',
        rand: ['key',["fusion","type=oldest","not_be_attacked","untouchable","metamorphose","cant_evolution","attack_count"],
        ["融合","轮流造成伤害","无法被攻击","方块膜","变形","无法进化","多次攻击/攻击次数修改"]],
        operation: 'generateSkills(card).includes(rand) || (minorCard(card) && generateSkills(minorCard(card)).includes(rand))'
    },
    {
        id: 110,
        title: '具有能力',
        rand: ['key',["evolve","selfDestroy","indestructible","revive","ignore_guard","invocation","obtain_self"],
        ["自动进化","自我破坏","金膜","复活","无视守护","瞬念召唤","衍生自己"]],
        operation: 'generateSkills(card).includes(rand) || (minorCard(card) && generateSkills(minorCard(card)).includes(rand))'
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
        operation: 'generateSkills(card).includes(rand) || (minorCard(card) && generateSkills(minorCard(card)).includes(rand))'
    },
    {
        id: 115,
        title: '具有能力',
        rand: ['key',["burial_rite","necromance","ritual","spell_charge"],
        ["葬送","死灵术","土之秘术","魔力增幅"]],
        operation: 'generateSkills(card).includes(rand) || (minorCard(card) && generateSkills(minorCard(card)).includes(rand))'
    },
    {
        id: 116,
        title: '增加能力值',
        rand: ['str',["+1/+0","+2/+0","+0/+1","+0/+2","+0/+3","+3/+0","+1/+1","+1/+2","+2/+1","+2/+2","+3/+3","+4/+4","+X/+0","+X/+X"]],
        operation: 'getTrueDesc(card).includes(rand)'
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
      id: 203,
      title: '具有同衍生物',
      rand: ['key',[900111010, 900811050, 900012010, 900511020, 900611010, 900011080, 900511010, 900811030, 900211010, 900311020, 900311030, 900511030, 900811010, 900214030, 900312010, 900214020, 900214040, 900312020, 900811040, 900411010, 900811020, 900012020, 900012030, 900014010, 900214010, 900111020, 900411030, 900814010, 900211020, 900511040, 900611020, 900811110, 900012040, 900211030, 900211070, 900314050, 900411020, 900711020, 900741030, 900311110, 900314040, 900422010, 900441040, 115111010, 900311090, 900311100, 900314030, 900811060, 900811090, 900831020, 900831030, 100011010, 900214050, 900311010, 900311040, 900314020, 900611030, 900711010, 900711060],['妖精', '悬丝傀儡', '那塔拉的大树', '怨灵', '丛林蝙蝠', '生产器械', '骷髅士兵', '解析的创造物', '骑士', '泥尘巨像', '守护者巨像', '僵尸', '古老的创造物', '黄金之靴', '土之魔片', '黄金之杯', '黄金首饰', '大地之魔片', '绚烂的创造物', '飞龙', '神秘的创造物', '顺从的骏马', '机动二轮车', '修复模式', '黄金短剑', '妖精萤火', '虎鲸', '典范转移', '重装骑士', '巫妖', '毒蛇', '改良型·悬丝傀儡', '魔导装甲车', '铁甲骑士', '战盾卫士', '马纳历亚防御阵', '风暴巨龙', '圣炎猛虎', '圣骑兵', '奇幻士兵', '马纳历亚魔弹', '龙武装甲', '地狱火魔龙', '密林守卫者', '式神·小纸人', '式神·暴鬼', '真理的术式', '精奥的创造物', '锋锐的创造物', '防御型巨像', '攻击型巨像', '哥布林', '闪耀的金币', '雪人', '废铁巨像', '红莲的法术', '恶魔', '神圣猎鹰', '壮丽大神隼']],
      operation: 'card => (card.skill_option.includes(rand) || card.skill_target.includes(rand)) || (minorCard(card) && (minorCard(card).skill_option.includes(rand) || minorCard(card).skill_target.includes(rand)))'
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
      rand: ['num',10000,10029],
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
      rand: ['key',[/上限为[0-9]+(次|张)/,/（(?:(?!能力|变身)[^)\s])+除外）/],["某能力的触发上限","判别除外某张/些卡片"]],
      operation: 'rand.exec(getTrueDesc(card)) !== null'
  },
  {
      id: 304,
      title: '具有异画',
      rand: ['none'],
      operation: 'hasDiffer(card)'
  },
  {
      id: 305,
      title: '进化后会更换部分语音',
      rand: ['none'],
      operation: 'card.char_type == 1 && hasSPEvolveVoice(card)'
  },
  {
      id: 305,
      title: '不具有独特爆能语音的随从',
      rand: ['none'],
      operation: 'card.char_type == 1 && generateSkills(card).includes("pp_fixeduse") && !hasEHEvolveVoice(card)'
  }
];
