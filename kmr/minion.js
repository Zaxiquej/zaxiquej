const minions = [
    {
        name: '空调宅男',
        id: 0,
        image: 'kmr/image/ktzn.png',
        description: '这里是介绍',
        baseattack: 7,
        addattack: 6,
        attackSpeed: 2800, // in milliseconds
        basecost: 16,
        enhancecost: 7,
        supEnhancecost: 3,
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
        description: '介绍懒得写',
        baseattack: 6,
        addattack: 4,
        attackSpeed: 1100, // in milliseconds
        basecost: 18,
        enhancecost: 8,
        supEnhancecost: 2,
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
        description: '介绍没写',
        baseattack: 6,
        addattack: 3,
        attackSpeed: 1800, // in milliseconds
        basecost: 24,
        enhancecost: 6,
        supEnhancecost: 2.5,
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
        description: '介绍还是没写',
        baseattack: 9,
        addattack: 9,
        attackSpeed: 2800, // in milliseconds
        basecost: 30,
        enhancecost: 11,
        supEnhancecost: 2.4,
        skills: [
            { level: 8, name: '开播！', effect: '该助战攻击时，额外造成等同于[金币^(0.8)*该助战等级/1000]的伤害.' },
            { level: 14, name: '白骨夫人', effect: '所有升级消费金币降低20%.' }
        ]
    },
    {
        name: '奈特温',
        id: 4,
        image: 'kmr/image/nv.png',
        voice: 'kmr/voice/nv.mp3',
        description: '介绍依然还是没写',
        baseattack: 7,
        addattack: 4,
        attackSpeed: 1200, // in milliseconds
        basecost: 25,
        enhancecost: 13,
        supEnhancecost: 2.7,
        skills: [
            { level: 6, name: '说书', effect: '攻击速度减少0.4s.' },
            { level: 13, name: '运气不如他们', effect: '其他助战成功触发一个概率低于20%的技能后，该助战永久获得4攻击力。' }
        ]
    },
    {
        name: '昨日之俗',
        id: 5,
        image: 'kmr/image/su.png',
        voice: 'kmr/voice/su.mp3',
        description: '介绍依然还是没写',
        baseattack: 35,
        addattack: 24,
        attackSpeed: 5000, // in milliseconds
        basecost: 24,
        enhancecost: 10,
        supEnhancecost: 3.2,
        skills: [
            { level: 5, name: '鲁智深', effect: '增加280攻击.' },
            { level: 15, name: '金牌陪练', effect: '攻击后，12%概率随机使一个其他助战永久获得[该助战攻击力/20]点攻击力。' }
        ]
    },
    {
        name: '星野饼美',
        id: 6,
        image: 'kmr/image/bing.png',
        voice: 'kmr/voice/bing.mp3',
        description: '饼神伟大，无需多言',
        baseattack: 40,
        addattack: 20,
        attackSpeed: 6940, // in milliseconds
        basecost: 20,
        enhancecost: 5,
        supEnhancecost: 2,
        skills: [
            { level: 9, name: '五种打法', effect: '如果你连续20s没有进行任何操作，获得[5*你拥有的助战数]点攻击力。' },
            { level: 19, name: '每日饼之诗', effect: '每60s，使全部其他助战永久获得[该助战攻击力/40]点攻击力。' }
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
        supEnhancecost: 2.4,
        skills: [
            { level: 6, name: '阴阳秘法', effect: '所有助战获得27攻击力。' },
            { level: 22, name: '次元超越', effect: '每30s，使全部其他助战攻击一次。' }
        ]
    },
    {
        name: '美少女莉莉猪',
        id: 8,
        image: 'kmr/image/lili.png',
        voice: 'kmr/voice/lili.mp3',
        description: '恐怖双猪之lilipig',
        baseattack: 9,
        addattack: 5,
        attackSpeed: 2000, // in milliseconds
        basecost: 18,
        enhancecost: 6,
        supEnhancecost: 2.33,
        skills: [
            { level: 4, name: '我吃我吃', effect: '攻击后，有6%概率增加12.5%攻击力，但攻击间隔上升10%。' },
            { level: 20, name: '猪之力', effect: '每24s，造成等同于[攻击力*攻击间隔]的伤害。' }
        ]
    },
];
