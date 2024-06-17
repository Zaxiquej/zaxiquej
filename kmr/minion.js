const minions = [
    {
        name: '空调宅男',
        id: 0,
        image: 'kmr/image/ktzn.png',
        description: '这里是介绍',
        baseattack: 7,
        addattack: 6,
        attackSpeed: 3000, // in milliseconds
        basecost: 16,
        enhancecost: 7,
        supEnhancecost: 3,
        skills: [
            { level: 5, name: '素质家族', effect: '5%概率造成 1000% 伤害.' },
            { level: 15, name: '构筑带师', effect: '其他助战升级时，额外获得[该助战攻击力/30]点攻击力' }
        ]
    },
    {
        name: '佐伯艾莉丝',
        id: 1,
        image: 'kmr/image/zbals.png',
        description: '介绍懒得写',
        baseattack: 6,
        addattack: 4,
        attackSpeed: 900, // in milliseconds
        basecost: 18,
        enhancecost: 8,
        supEnhancecost: 2,
        skills: [
            { level: 5, name: '冲击冠军', effect: '3%概率攻击时永久提升4攻击.' },
            { level: 15, name: '永失吾艾', effect: '6%概率在其他助战攻击时，直接攻击.' }
        ]
    },
    {
        name: '梧桐',
        id: 2,
        image: 'kmr/image/amlls.png',
        description: '介绍没写',
        baseattack: 6,
        addattack: 3,
        attackSpeed: 1800, // in milliseconds
        basecost: 24,
        enhancecost: 6,
        supEnhancecost: 2.5,
        skills: [
            { level: 5, name: '苦痛', effect: '所有其他助战攻击时，额外造成等同于[该助战攻击力/2]的伤害.' },
            { level: 15, name: '奶1', effect: '33%概率在攻击时，额外获得11金币.' }
        ]
    },
    {
        name: '大栗QAQ',
        id: 3,
        image: 'kmr/image/lz.png',
        description: '介绍还是没写',
        baseattack: 9,
        addattack: 9,
        attackSpeed: 2800, // in milliseconds
        basecost: 30,
        enhancecost: 11,
        supEnhancecost: 2.4,
        skills: [
            { level: 5, name: '开播！', effect: '该助战攻击时，额外造成等同于[金币*该助战等级/1000]的伤害.' },
            { level: 15, name: '白骨夫人', effect: '所有升级消费金币降低20%.' }
        ]
    },
    {
        name: '奈特温',
        id: 4,
        image: 'kmr/image/nv.png',
        description: '介绍依然还是没写',
        baseattack: 7,
        addattack: 4,
        attackSpeed: 1200, // in milliseconds
        basecost: 25,
        enhancecost: 13,
        supEnhancecost: 2.7,
        skills: [
            { level: 5, name: '说书', effect: '攻击速度减少0.4s.' },
            { level: 15, name: '运气不如他们', effect: '其他助战成功触发一个概率低于10%的技能后，该助战永久获得2攻击力。' }
        ]
    },
    {
        name: '昨日之俗',
        id: 5,
        image: 'kmr/image/su.png',
        description: '介绍依然还是没写',
        baseattack: 35,
        addattack: 24,
        attackSpeed: 7000, // in milliseconds
        basecost: 24,
        enhancecost: 10,
        supEnhancecost: 3.2,
        skills: [
            { level: 5, name: '鲁智深', effect: '增加200攻击.' },
            { level: 15, name: '金牌陪练', effect: '攻击后，7%概率随机使一个其他助战永久获得[该助战攻击力/20]点攻击力。' }
        ]
    }
];
