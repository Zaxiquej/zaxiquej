// 模拟按钮信息数组
const buttonInfoArray = [
    {
        id: 1,
        title: '同一卡包同职业',
        content: '（仅限非衍生卡）显示与当前卡同一卡包且同职业的卡片',
        bgColor: '#cd7f32',
        operation: '同一卡包同职业'
    },
    {
        id: 2,
        title: '衍生或被衍生',
        content: '显示与当前卡有衍生关系的卡片',
        bgColor: '#c0c0c0',
        operation: '衍生或被衍生'
    },
    {
        id: 3,
        title: '同身材稀有度',
        content: '（仅限随从卡）显示与当前卡费用、进化前攻击生命、及稀有度相同的卡片',
        bgColor: '#ffd700',
        operation: '同身材稀有度'
    },
    {
        id: 4,
        title: '描述相似过75%',
        content: '显示与当前卡描述相似为75%以上的卡片',
        bgColor: '#ff4500',
        operation: '描述相似过75'
    },
    {
        id: 5,
        title: '重印卡',
        content: '显示当前卡的重印卡片',
        bgColor: '#ffd700',
        operation: '重印'
    },
    {
        id: 6,
        title: '语音联动',
        content: '（仅限随从卡）显示与当前卡有语音联动的卡片',
        bgColor: '#0045ff',
        operation: '语音联动'
    },
    {
        id: 7,
        title: '特殊身材',
        content: '（仅限随从卡）显示与当前卡类型、费用、进化前攻击生命相同的卡片，但仅限结果不超过11张时。',
        bgColor: '#ff4500',
        operation: '特殊身材'
    },
    {
        id: 8,
        title: '特殊进化',
        content: '（仅限随从卡）显示与当前卡进化前后能力值相同的卡（费用可以不相同），但仅限进化并不是标准的+2/+2时。',
        bgColor: '#ff4500',
        operation: '特殊进化'
    },
];
