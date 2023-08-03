// 获取页面元素
const startBtn = document.getElementById('start-btn');
const gameField = document.getElementById('game-field');
const cardContainer = document.getElementById('card-container');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const scoreContainer = document.getElementById('score-container');
const scoreDisplay = document.getElementById('score');
const restartBtn = document.getElementById('restart-btn');

// 添加点击事件监听器来触发游戏的开始
startBtn.addEventListener('click', startGame);
// 初始化游戏
let score = 0;
let round = 1;
let timer;
let timeLimit = 35;
let cards = Xcardinfo; // 直接导入Xcardinfo.js的内容并赋值给cards数组

// 开始游戏
function startGame() {
    // 隐藏开始按钮和得分容器
    startBtn.style.display = 'none';
    scoreContainer.style.display = 'none';

    // 显示游戏场地和重置游戏数据
    gameField.style.display = 'flex';
    score = 0;
    round = 1;
    timeLimit = 35;
    scoreDisplay.textContent = score;
    updateRound();
    showNextRound();
}

// 更新游戏回合信息
function updateRound() {
    questionText.textContent = `Round ${round}`;
    round++;
}

// 找到缺少的数字
function findMissingNumber(numbers) {
    numbers.sort((a, b) => a - b);
    for (let i = 0; i < numbers.length; i++) {
        if (numbers[i] !== i) {
            return i;
        }
    }
    return numbers.length; // 如果没有缺少数字，则返回数组长度
}


// 显示下一回合的卡牌
function showNextRound() {
    // ...（之前的代码保持不变）

    // 随机选择一种验证方式：费用、攻击力或生命值
    const attributes = ['费用', '攻击力', '生命值'];
    const selectedAttribute = attributes[Math.floor(Math.random() * attributes.length)];

    // 根据验证方式生成问题
    questionText.textContent = `这些卡中，没有哪个${selectedAttribute}？`;

    // 获取选项数组
    const options = selectedCards.map(card => card[selectedAttribute]);

    // 找到缺少的数字，并将其插入到选项数组中
    const missingNumber = findMissingNumber(options);
    options.push(missingNumber);

    // 将选项数组按大小排序
    options.sort((a, b) => a - b);

    // 生成选项并添加点击事件监听器
    options.forEach(option => {
        const optionBtn = document.createElement('button');
        optionBtn.textContent = option;
        optionBtn.classList.add('option-btn');
        optionBtn.addEventListener('click', () => checkAnswer(option, missingNumber));
        optionsContainer.appendChild(optionBtn);
    });
    // 显示倒计时
    clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
}
// 检查答案是否正确
function checkAnswer(chosenValue, correctValue) {
    if (chosenValue === correctValue) {
        score++;
    } else {
        const correctOptionBtn = Array.from(optionsContainer.children).find(btn => btn.textContent == correctValue);
        correctOptionBtn.style.backgroundColor = 'green';
    }

    // 停止倒计时并检查游戏状态
    clearInterval(timer);
    timeLimit = Math.max(5, timeLimit - 2); // 每回合倒计时缩短2秒，最短5秒
    scoreDisplay.textContent = score;
    if (round <= cards.length) {
        setTimeout(() => showNextRound(), 1500);
    } else {
        endGame();
    }
}

// 结束游戏
function endGame() {
    gameField.style.display = 'none';
    scoreContainer.style.display = 'block';
    scoreContainer.querySelector('p').textContent = `得分：${score}`;
    restartBtn.style.display = 'block';
}

// 更新倒计时
function updateTimer() {
    timeLimit--;
    if (timeLimit <= 0) {
        clearInterval(timer);
        endGame();
    }
}

// 创建卡牌元素
function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    cardDiv.innerHTML = `
        <img src="Xcardimage/${card.imgSrc}" alt="卡牌图片">
    `;
    return cardDiv;
}

// 生成随机选项
function getRandomOptions(correctValue, numOptions) {
    const options = [correctValue];
    while (options.length < numOptions) {
        const randomValue = Math.floor(Math.random() * 10); // 生成0-9的随机整数作为选项
        if (!options.includes(randomValue)) {
            options.push(randomValue);
        }
    }
    return options;
}

// 获取不重复的随机索引
function getRandomIndices(numIndices, maxIndex) {
    const indices = [];
    while (indices.length < numIndices) {
        const randomIndex = Math.floor(Math.random() * maxIndex);
        if (!indices.includes(randomIndex)) {
            indices.push(randomIndex);
        }
    }
    return indices;
}

// 数组随机排序
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
