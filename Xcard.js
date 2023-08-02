class Rule {
    constructor(description, conditionFunction, difficulty) {
        this.description = description; // 规则明文描述
        this.conditionFunction = conditionFunction; // 规则代码要求，是一个函数，用于判断是否符合规则
        this.difficulty = difficulty; // 规则的相对难度，可以是一个数字，用于根据分数来生成更复杂的规则
    }
}

const rules = [
    new Rule('职业为妖的卡牌', card => card.职业 === '妖', 1),
    new Rule('稀有度为金的卡牌', card => card.稀有度 === '金', 1),
    new Rule('费用小于等于3的卡牌', card => card.费用 <= 3, 1),
    new Rule('攻击力大于5的卡牌', card => card.攻击力 > 5, 1),
    new Rule('生命值小于4的卡牌', card => card.生命值 < 4, 1),
    new Rule('费用比攻击力高2的卡牌', card => card.费用 > card.攻击力 + 2, 2),
    new Rule('费用+攻击力+生命值是质数的卡牌', card => isPrime(card.费用 + card.攻击力 + card.生命值), 3),
    // 可以添加更多的规则...
];

function isCardMatched(card) {
    if (currentConditions && currentConditions !== '无限制') {
        const rule = currentConditions.split(' ')[0];
        const value = currentConditions.split(' ')[1];

        if (rule === '职业为X' && card.职业 === value) {
            return true;
        } else if (rule === '费用' && card.费用 == value) {
            return true;
        }
        // 可以根据其他条件进一步判断，这里只演示了 "职业为X" 和 "费用" 两种情况
    }

    return false;
}


function isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}


// 读取卡牌信息
const cardInfo = Xcardinfo;

// 游戏状态
let score = 0;
let timer;
let gameInProgress = false;
let currentConditions;

// 页面元素
const startButton = document.getElementById('startButton');
const gameArea = document.getElementById('gameArea');
const resultArea = document.getElementById('resultArea');

// 开始游戏按钮点击事件
startButton.addEventListener('click', startGame);

function startGame() {
    score = 0;
    gameInProgress = true;
    startButton.style.display = 'none';
    gameArea.style.display = 'block';
    resultArea.innerHTML = '';
    showNextCardSet();
    startTimer();
}

function showNextCardSet() {
    resultArea.innerHTML = '';
    const numberOfCards = 5 + Math.floor(score / 5); // 增加卡牌数随着分数增加
    const selectedCardIndices = getRandomCardIndices();
    const selectedCards = selectedCardIndices.map((index) => cardInfo[index]);
    const matchedCards = selectedCards.filter((card) => isCardMatched(card));
    const nonMatchedCards = selectedCards.filter((card) => !isCardMatched(card));

    // 随机选择符合条件的几张卡牌
    const selectedMatchedIndices = getRandomIndices(matchedCards.length, Math.min(2, matchedCards.length));
    const selectedNonMatchedIndices = getRandomIndices(nonMatchedCards.length, numberOfCards - Math.min(2, matchedCards.length));

    // 生成游戏场地中的卡牌
    let cardHtml = '';
    selectedMatchedIndices.forEach((index) => {
        const card = matchedCards[index];
        cardHtml += `
            <div class="card" data-index="${selectedCardIndices[selectedCards.indexOf(card)]}">
                <img src="Xcardimage/${card.imgSrc}" alt="${card.name}" width="108" height="120" />
            </div>
        `;
    });
    selectedNonMatchedIndices.forEach((index) => {
        const card = nonMatchedCards[index];
        cardHtml += `
            <div class="card" data-index="${selectedCardIndices[selectedCards.indexOf(card)]}">
                <img src="Xcardimage/${card.imgSrc}" alt="${card.name}" width="108" height="120" />
            </div>
        `;
    });
    gameArea.innerHTML = cardHtml;

    // 随机生成条件并显示在游戏区域
    generateRandomConditions();

    // 添加确认按钮
    const confirmButton = document.createElement('button');
    confirmButton.textContent = '确认';
    confirmButton.setAttribute('id', 'confirmButton');
    confirmButton.addEventListener('click', () => {
        checkSelectedCards();
    });
    resultArea.appendChild(confirmButton);
}

function generateRandomConditions() {
    // 随机生成条件
    const randomRuleIndex = Math.floor(Math.random() * rules.length);
    const selectedRule = rules[randomRuleIndex];

    // 随机指定 "妖" 和 "3"
    if (selectedRule.description.includes('职业为X')) {
        const professions = ['妖', '皇', '法', '龙', '死', '鬼', '教', '鱼'];
        const randomProfession = professions[Math.floor(Math.random() * professions.length)];
        currentConditions = selectedRule.description.replace('X', randomProfession);
    } else if (selectedRule.description.includes('费用 <= X')) {
        const randomCost = Math.floor(Math.random() * 8) + 1; // 生成1到8之间的随机数
        currentConditions = selectedRule.description.replace('X', randomCost);
    } else {
        currentConditions = selectedRule.description;
    }

    // 将条件显示在游戏区域
    const conditionElement = document.createElement('div');
    conditionElement.textContent = `当前条件：${currentConditions}`;
    resultArea.appendChild(conditionElement);
}

function getRandomIndices(totalCount, countToSelect) {
    const indices = Array.from({ length: totalCount }, (_, i) => i);
    for (let i = 0; i < totalCount - countToSelect; i++) {
        const randomIndex = Math.floor(Math.random() * indices.length);
        indices.splice(randomIndex, 1);
    }
    return indices;
}

function getRandomCardIndices() {
    const totalCardCount = cardInfo.length;
    const selectedIndices = [];
    let hasMatchedCard = false;

    while (selectedIndices.length < 5) {
        const randomIndex = Math.floor(Math.random() * totalCardCount);
        const card = cardInfo[randomIndex];

        if (!selectedIndices.includes(randomIndex)) {
            selectedIndices.push(randomIndex);
        }

        if (currentConditions && currentConditions !== '无限制') {
            const rule = currentConditions.split(' ')[0];
            const value = currentConditions.split(' ')[1];

            if (rule === '职业为X' && card.职业 === value) {
                hasMatchedCard = true;
            } else if (rule === '费用' && card.费用 == value) {
                hasMatchedCard = true;
            }
            // 可以根据其他条件进一步判断，这里只演示了 "职业为X" 和 "费用" 两种情况
        }
    }

    if (!hasMatchedCard) {
        selectedIndices.splice(Math.floor(Math.random() * selectedIndices.length), 1);
        const randomIndex = Math.floor(Math.random() * totalCardCount);
        selectedIndices.push(randomIndex);
    }

    return selectedIndices;
}


function highlightCards(selectedCardIndices) {
    // 根据选定的卡牌索引添加黄色边框
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        if (selectedCardIndices.includes(index)) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

function startTimer() {
    // 设置倒计时定时器，并在时间结束时判负
    let timeLeft = 100; // 设置初始倒计时时间为10秒
    const timerElement = document.createElement('div');
    timer = setInterval(() => {
        timerElement.textContent = `倒计时：${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            gameInProgress = false;
            endGame();
        }
        timeLeft--;
    }, 1000);
    gameArea.appendChild(timerElement);
}

function checkSelectedCards() {
    // 检查玩家选择的卡牌是否符合条件
    const selectedCards = document.querySelectorAll('.card.selected');
    let correctCards = 0;

    selectedCards.forEach((card) => {
        const index = parseInt(card.getAttribute('data-index'));
        const cardData = cardInfo[index];

        if (isCardMatched(cardData)) {
            correctCards++;
            card.classList.add('correct');
        } else {
            card.classList.add('error');
        }
    });

    // 更新分数并显示结果
    score += correctCards;
    resultArea.innerHTML = `<p>本次得分：${correctCards}，总分：${score}</p>`;
    setTimeout(() => {
        showNextCardSet();
    }, 2000); // 2秒后显示下一组卡牌
}

function endGame() {
    // 游戏结束，显示结果，并提供重新开始按钮
    gameInProgress = false;
    gameArea.style.display = 'none';
    resultArea.innerHTML += `<p>游戏结束，您的总分为：${score}</p><button id="restartButton">重新开始</button>`;
    const restartButton = document.getElementById('restartButton');
    restartButton.addEventListener('click', () => {
        resultArea.innerHTML = '';
        startGame();
    });
}

// 页面中选定卡牌的点击事件
gameArea.addEventListener('click', (event) => {
    const clickedCard = event.target.closest('.card');
    if (clickedCard && gameInProgress) {
        clickedCard.classList.toggle('selected');
    }
});

// 启动游戏
startGame();
