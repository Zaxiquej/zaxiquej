const minions = [
    {
        name: '空调宅男',
        id: 0,
        image: 'kmr/image/ktzn.png',
        description: '致敬传奇双职业首任霸主ktzn',
        baseattack: 7,
        addattack: 6,
        attackSpeed: 2800, // in milliseconds
        basecost: 16,
        enhancecost: 7,
        supEnhancecost: 4,
        skills: [
            { level: 4, name: '素质家族', effect: '10%概率造成 1000% 伤害。' },
            { level: 16, name: '构筑带师', effect: '其他助战升级时，额外获得[该助战攻击力/30]点攻击力' }
        ]
    },
    {
        name: '佐伯艾莉丝',
        id: 1,
        image: 'kmr/image/zbals.png',
        voice: 'kmr/voice/zbals.mp3',
        description: '群星杯版本答案牢艾',
        baseattack: 6,
        addattack: 4,
        attackSpeed: 1100, // in milliseconds
        basecost: 18,
        enhancecost: 8,
        supEnhancecost: 3,
        skills: [
            { level: 6, name: '冲击冠军', effect: '3%概率攻击时永久提升[该助战等级]点攻击。' },
            { level: 12, name: '永失吾艾', effect: '8%概率在其他助战攻击时，直接攻击。' }
        ]
    },
    {
        name: '梧桐',
        id: 2,
        image: 'kmr/image/amlls.png',
        voice: 'kmr/voice/amlls.mp3',
        description: '只会奶1的amlls梧桐🐷🐷',
        baseattack: 6,
        addattack: 3,
        attackSpeed: 1800, // in milliseconds
        basecost: 24,
        enhancecost: 6,
        supEnhancecost: 3.5,
        skills: [
            { level: 3, name: '奶1', effect: '33%概率在攻击时，额外获得等同于[该助战等级^1.5]的金币。' },
            { level: 13, name: '苦痛', effect: '所有其他助战攻击时，额外造成等同于[该助战攻击力*0.8]的伤害。' }
        ]
    },
    {
        name: '大栗QAQ',
        id: 3,
        image: 'kmr/image/lz.png',
        voice: 'kmr/voice/lz.mp3',
        description: '栗劳斯今天又没有开播',
        baseattack: 9,
        addattack: 9,
        attackSpeed: 2800, // in milliseconds
        basecost: 30,
        enhancecost: 11,
        supEnhancecost: 3.4,
        skills: [
            { level: 8, name: '开播！', effect: '该助战攻击时，额外造成等同于[金币^(0.6)*该助战等级/1000]的伤害。' },
            { level: 17, name: '白骨夫人', effect: '所有升级消费金币降低20%。（每100级额外减少1%，最高30%）' }
        ]
    },
    {
        name: '奈特温',
        id: 4,
        image: 'kmr/image/nv.png',
        voice: 'kmr/voice/nv.mp3',
        description: '本英雄由解析冠名赞助',
        baseattack: 7,
        addattack: 4,
        attackSpeed: 1200, // in milliseconds
        basecost: 25,
        enhancecost: 13,
        supEnhancecost: 3.7,
        skills: [
            { level: 6, name: '说书', effect: '攻击速度减少0.4s。' },
            { level: 13, name: '运气不如他们', effect: '其他助战成功触发一个概率低于20%的技能后，该助战永久获得[等级/12]攻击力（最低为3）。' }
        ]
    },
    {
        name: '昨日之俗',
        id: 5,
        image: 'kmr/image/su.png',
        voice: 'kmr/voice/su.mp3',
        description: '鲁大师在人间的化身',
        baseattack: 35,
        addattack: 24,
        attackSpeed: 5000, // in milliseconds
        basecost: 24,
        enhancecost: 10,
        supEnhancecost: 3.2,
        skills: [
            { level: 5, name: '鲁智深', effect: '增加400攻击。' },
            { level: 15, name: '金牌陪练', effect: '攻击后，18%概率随机使一个其他助战永久获得[该助战攻击力/15]点攻击力。' }
        ]
    },
    {
        name: '星野饼美',
        id: 6,
        image: 'kmr/image/bing.png',
        voice: 'kmr/voice/bing.mp3',
        description: '饼神伟大，无需多言',
        baseattack: 30,
        addattack: 18,
        attackSpeed: 6940, // in milliseconds
        basecost: 20,
        enhancecost: 8,
        supEnhancecost: 5,
        skills: [
            { level: 9, name: '五种打法', effect: '如果你连续20s没有进行任何操作，获得[5*你拥有的助战数]点攻击力。' },
            { level: 21, name: '每日饼之诗', effect: '每60s，使全部其他助战永久获得[该助战攻击力/40]点攻击力。' }
        ]
    },
    {
        name: '竹取玉白',
        id: 7,
        image: 'kmr/image/fox.png',
        voice: 'kmr/voice/fox.mp3',
        description: '狐神伟大，无需多言',
        baseattack: 7,
        addattack: 6,
        attackSpeed: 2250, // in milliseconds
        basecost: 22,
        enhancecost: 8,
        supEnhancecost: 3.4,
        skills: [
            { level: 6, name: '阴阳秘法', effect: '所有助战获得36攻击力。' },
            { level: 22, name: '次元超越', effect: '每30s，使全部其他助战攻击一次。（每100级，减少1s倒数，最多减为20）' }
        ]
    },
    {
        name: '璐缇雅',
        id: 8,
        image: 'kmr/image/lty.png',
        voice: 'kmr/voice/lty.mp3',
        description: '这是我们的超美丽官方牢头，你们的游戏有这种牢头吗',
        baseattack: 9,
        addattack: 7,
        attackSpeed: 2000, // in milliseconds
        basecost: 18,
        enhancecost: 6,
        supEnhancecost: 3.33,
        skills: [
            { level: 4, name: '+1+1', effect: '攻击后，有6%概率增加13%攻击力，但攻击间隔上升10%。' },
            { level: 20, name: '龙之咆哮', effect: '每24s，造成等同于[2*攻击力*攻击间隔]的伤害。' }
        ]
    },
    {
        name: '一只小51',
        id: 9,
        image: 'kmr/image/51.png',
        voice: 'kmr/voice/51.mp3',
        description: '掌握郭楠之力的战士',
        baseattack: 7,
        addattack: 6,
        attackSpeed: 2200, // in milliseconds
        basecost: 24,
        enhancecost: 8,
        supEnhancecost: 3.5,
        skills: [
            { level: 8, name: '罕见', effect: '每50s，直接获得10%金币量的金币。' },
            { level: 24, name: 'GN', effect: '其他助战攻击触发其自己的技能时，有10%概率增加等同于[其攻击力2%]的攻击力，随后该助战追加3次攻击。' }
        ]
    },
    {
        name: 'ZenX',
        id: 10,
        image: 'kmr/image/zenx.png',
        voice: 'kmr/voice/zenx.mp3',
        description: 'szb永远的上帝，兼任亚军',
        baseattack: 22,
        addattack: 16,
        attackSpeed: 3900, // in milliseconds
        basecost: 48,
        enhancecost: 18,
        supEnhancecost: 4.5,
        skills: [
            { level: 10, name: '上帝', effect: '其他助战永久增加攻击力时，该助战也会永久获得增加量的12%。（至少1点）' },
            { level: 30, name: '掌控', effect: '每11s，有12.5%的概率使下一次攻击造成的伤害变为8倍。每次触发，使倍率增加4。' }
        ]
    },
    {
        name: '清鱼',
        id: 11,
        image: 'kmr/image/fish.png',
        voice: 'kmr/voice/fish.mp3',
        description: 'szb最后的妖精使',
        baseattack: 11,
        addattack: 2,
        attackSpeed: 1900, // in milliseconds
        basecost: 9,
        enhancecost: 16,
        supEnhancecost: 5,
        skills: [
            { level: 4, name: '虫虫咬他', effect: '升级该角色后，如果等级为奇数，永久提升升级增加的攻击力1点。' },
            { level: 19, name: '无尽连击', effect: '每当任何助战攻击，该助战获得等同于升级提升攻击力50%的临时攻击力。每30s，失去这些临时攻击力，但是有5%概率将其的10%转变为永久攻击力，且每50级提升1%概率（上限25%）。' }
        ]
    },
    {
        name: '一只小飘飘',
        id: 12,
        image: 'kmr/image/piao.png',
        voice: 'kmr/voice/piao.mp3',
        description: '可恶小票风',
        baseattack: 14,
        addattack: 9,
        attackSpeed: 3000, // in milliseconds
        basecost: 24,
        enhancecost: 9.6,
        supEnhancecost: 4.8,
        skills: [
            { level: 8, name: '一十九米肃清刀', effect: '每19s，造成等同于[攻击力*你拥有的助战数]的伤害。' },
            { level: 22, name: '电表白转', effect: '每当一个倒计时技能触发后，20%概率将其进度转变为50%，而不是从零开始。（每50级提高1%概率，最高40%）' }
        ]
    },
    {
        name: '美少女莉莉子',
        id: 13,
        image: 'kmr/image/lili.png',
        voice: 'kmr/voice/lili.mp3',
        description: '恐怖双🐷之lilipig',
        baseattack: 10,
        addattack: 7,
        attackSpeed: 2800, // in milliseconds
        basecost: 19,
        enhancecost: 6,
        supEnhancecost: 2,
        skills: [
            { level: 7, name: '身外化身', effect: '介绍中含有🐷的助战攻击后，10%概率重新攻击一次。' },
            { level: 24, name: '双猪的羁绊', effect: '每当介绍中含有🐷的助战升级后，如果等级为5的倍数，使其攻击力增加[该助战等级^1.1]的数值。' }
        ]
    },
    {
        name: '5689eg09h',
        id: 14,
        image: 'kmr/image/5689.png',
        voice: 'kmr/voice/5689.mp3',
        description: '前面忘了，妖精的上策，后面忘了',
        baseattack: 33,
        addattack: 22,
        attackSpeed: 5689, // in milliseconds
        basecost: 28,
        enhancecost: 9.6,
        supEnhancecost: 4.8,
        skills: [
            { level: 8, name: '铁犀冲锋', effect: '每8s，4%概率造成[攻击力*(等级^0.6)]的伤害。' },
            { level: 21, name: '重返赛场', effect: '所有其他概率触发的技能如果触发失败，21%概率重新判定一次，不会重复发动。（每25级提升1%概率，最高50%）' }
        ]
    },
    {
        name: '阿万音铃羽',
        id: 15,
        image: 'kmr/image/0.png',
        voice: 'kmr/voice/0.mp3',
        description: '恐怖双🐷之0🐷',
        baseattack: 6,
        addattack: 5,
        attackSpeed: 1800, // in milliseconds
        basecost: 29,
        enhancecost: 8,
        supEnhancecost: 3.6,
        skills: [
            { level: 6, name: '光速上分', effect: '其他助战升级时，10%概率获得本次升级需求金币的30%。（每10级额外返还1%，上限100%）' },
            { level: 18, name: '双猪齐力', effect: '升级后，50%概率免费使一个随机其他介绍中含有🐷的助战升级。' }
        ]
    },
    {
        name: '八云橙汁',
        id: 16,
        image: 'kmr/image/ch.png',
        voice: 'kmr/voice/ch.mp3',
        description: '守关大将关云橙',
        baseattack: 20,
        addattack: 14,
        attackSpeed: 4000, // in milliseconds
        basecost: 24,
        enhancecost: 10,
        supEnhancecost: 4.2,
        skills: [
            { level: 8, name: '巨人', effect: '每40s，造成[全部助战攻击力之和*该助战攻击力位数/2]的伤害。' },
            { level: 21, name: '护国神橙', effect: '所有直接攻击外的伤害增加20%。（每5级，额外提升2%）。' }
        ]
    },
    {
        name: '红白睡不醒',
        id: 17,
        image: 'kmr/image/hb.png',
        voice: 'kmr/voice/hb.mp3',
        description: '本英雄由杜兰朵冠名赞助',
        baseattack: 12,
        addattack: 8,
        attackSpeed: 2200, // in milliseconds
        basecost: 24,
        enhancecost: 10,
        supEnhancecost: 4.2,
        skills: [
            { level: 10, name: '连协之力', effect: '降低25%解锁助战需要的金币。' },
            { level: 24, name: '杀出重围', effect: '当你升级助战后，如果你的助战等级之和变为100的倍数，且是首次达到该数值，使全部助战攻击力增加[等级之和]点攻击力。' }
        ]
    },
    {
        name: '蕾米莉亚',
        id: 18,
        image: 'kmr/image/rem.png',
        voice: 'kmr/voice/rem.mp3',
        description: '蕾咪最终还是抽到了他最爱的大小姐',
        baseattack: 5,
        addattack: 3,
        attackSpeed: 1300, // in milliseconds
        basecost: 24,
        enhancecost: 10,
        supEnhancecost: 4.2,
        skills: [
            { level: 8, name: '复仇', effect: 'kmr的生命值低于一半时，该助战对其造成的伤害增加[50+等级]%。' },
            { level: 24, name: '操纵命运', effect: '每25s，使下2个概率低于20%触发的技能必定触发。（每100级增加1个，上限8个）' }
        ]
    },
    {
        name: 'yokidou',
        id: 19,
        image: 'kmr/image/ykd.png',
        voice: 'kmr/voice/ykd.mp3',
        description: '命运抉择：入厂曲 或 谢幕曲',
        baseattack: 10,
        addattack: 10,
        attackSpeed: 2500, // in milliseconds
        basecost: 12,
        enhancecost: 6,
        supEnhancecost: 2.2,
        skills: [
            { level: 8, name: '下饭', effect: '10%的概率攻击时猪鼻，造成伤害改为回复kmr的生命值，但获得[攻击力位数]倍的金钱。在此基础上，10%概率你接下来[攻击力位数]秒内获得的全部金币增加100%。（不可叠加，上限10秒）' },
            { level: 24, name: '成熟', effect: '每30s，失去1%等级，并使一个随机其他助战失去1%等级（至少1级，不会因此失去攻击力或失去已学会的技能，最多降为1级）。' }
        ]
    }
];
