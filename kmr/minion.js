const minions = [
    {
        name: '空调宅男',
        id: 0,
        image: 'kmr/image/ktzn.png',
        description: '加拿大鹅在人间的化身ktzn',
        baseattack: 7,
        addattack: 6,
        attackSpeed: 2800, // in milliseconds
        basecost: 16,
        enhancecost: 7,
        supEnhancecost: 4,
        skills: [
            { level: 4, name: '素质家族', effect: '10%概率造成 1000% 伤害.' },
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
            { level: 6, name: '冲击冠军', effect: '3%概率攻击时永久提升[该助战等级]点攻击.' },
            { level: 12, name: '永失吾艾', effect: '8%概率在其他助战攻击时，直接攻击.' }
        ]
    },
    {
        name: '梧桐',
        id: 2,
        image: 'kmr/image/amlls.png',
        voice: 'kmr/voice/amlls.mp3',
        description: '只会奶1的amlls🐷🐷',
        baseattack: 6,
        addattack: 3,
        attackSpeed: 1800, // in milliseconds
        basecost: 24,
        enhancecost: 6,
        supEnhancecost: 3.5,
        skills: [
            { level: 3, name: '苦痛', effect: '所有其他助战攻击时，额外造成等同于[该助战攻击力*0.8]的伤害.' },
            { level: 13, name: '奶1', effect: '33%概率在攻击时，额外获得等同于[该助战等级^1.5]的金币.' }
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
            { level: 8, name: '开播！', effect: '该助战攻击时，额外造成等同于[金币^(0.8)*该助战等级/1000]的伤害.' },
            { level: 17, name: '白骨夫人', effect: '所有升级消费金币降低20%.' }
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
            { level: 6, name: '说书', effect: '攻击速度减少0.4s.' },
            { level: 13, name: '运气不如他们', effect: '其他助战成功触发一个概率低于20%的技能后，该助战永久获得[等级/10]攻击力（最低为4）。' }
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
            { level: 5, name: '鲁智深', effect: '增加330攻击.' },
            { level: 15, name: '金牌陪练', effect: '攻击后，12%概率随机使一个其他助战永久获得[该助战攻击力/20]点攻击力。' }
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
        addattack: 5,
        attackSpeed: 2000, // in milliseconds
        basecost: 18,
        enhancecost: 6,
        supEnhancecost: 3.33,
        skills: [
            { level: 4, name: '我吃我吃', effect: '攻击后，有6%概率增加12.5%攻击力，但攻击间隔上升10%。' },
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
            { level: 24, name: 'GN', effect: '其他助战攻击触发其自己的技能时，有10%概率增加等同于[其攻击力1%]的攻击力，随后该助战追加3次攻击。' }
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
            { level: 10, name: '上帝', effect: '其他助战永久增加攻击力时，该助战也会永久获得增加量的15%。（至少1点）' },
            { level: 30, name: '掌控', effect: '每11s，有12.5%的概率使下一次攻击造成的伤害变为8倍。每次触发，使倍率增加4。' }
        ]
    },
    {
        name: '清鱼',
        id: 11,
        image: 'kmr/image/fish.png',
        voice: 'kmr/voice/fish.mp3',
        description: 'szb最后的妖精使',
        baseattack: 9,
        addattack: 1,
        attackSpeed: 1900, // in milliseconds
        basecost: 13,
        enhancecost: 16,
        supEnhancecost: 5,
        skills: [
            { level: 6, name: '虫虫咬他', effect: '升级该角色后，如果等级为奇数，永久提升升级增加的攻击力1点。' },
            { level: 19, name: '无尽连击', effect: '每当任何助战攻击kmr，获得等同于升级提升攻击力50%的临时攻击力。每30s，失去这些临时攻击力，但是有5%概率将其的10%转变为永久攻击力，且每50级提升1%概率（上限25%）。' }
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
        name: '美少女莉莉猪',
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
    }
];
