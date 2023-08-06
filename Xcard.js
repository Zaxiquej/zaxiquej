// Xcardinfo.js should be loaded before this script

const loadingScreen = document.getElementById('loading');
const gameScreen = document.getElementById('game');
const startBtn = document.getElementById('start-btn');
const leftCard = document.getElementById('left-card');
const rightCard = document.getElementById('right-card');
const questionText = document.getElementById('question');
const leftBtn = document.getElementById('left-btn');
const equalBtn = document.getElementById('equal-btn');
const rightBtn = document.getElementById('right-btn');
const scoreText = document.getElementById('score');
const timerText = document.getElementById('timer');
const gameOverScreen = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');
const correctAnswerText = document.getElementById('correct-answer');
let randomCard1 = 0;
let randomCard2 = 0;

let score = 0;
let timer = 10;
let currentAttribute = '攻击'; // Start with '攻击' attribute
let isGameOver = false;

const gameContent = document.getElementById('game-content');

// Function to show the loading screen while images are being loaded
function showLoadingScreen() {
    loadingScreen.style.display = 'block';
    gameScreen.style.display = 'none';
}

// Function to hide the loading screen and show the game screen
function hideLoadingScreen() {
    loadingScreen.style.display = 'none';
    gameScreen.style.display = 'block';
}

// 随机选择两张卡片并显示问题
function showNextQuestion() {
  // 随机选择第一张卡片
  let randomIndex1 = Math.floor(Math.random() * Xcardinfo.length);
  randomCard1 = Xcardinfo[randomIndex1];

  // 随机选择第二张卡片，保证两张卡片不同
  let randomIndex2 = Math.floor(Math.random() * Xcardinfo.length);
  while (randomIndex2 === randomIndex1) {
      randomIndex2 = Math.floor(Math.random() * Xcardinfo.length);
  }
  randomCard2 = Xcardinfo[randomIndex2];
    leftCard.src = `Xcardimage/${randomCard1.imgSrc}`;
    rightCard.src = `Xcardimage/${randomCard2.imgSrc}`;

    // 随机选择一个属性进行比较
    const attributes = ['费用', '攻击', '生命'];
    currentAttribute = attributes[Math.floor(Math.random() * attributes.length)];

    questionText.textContent = `哪张卡有更高的${currentAttribute}？`;

    timer = 10;
}

// 处理玩家的选择并检查答案
function chooseCard(e) {
    if (isGameOver) return;

    const playerChoice = e.target.id;

    // 比较两张卡片对应属性的值
    const card1Value = randomCard1[currentAttribute];
    const card2Value = randomCard2[currentAttribute];
    const isCard1Higher = card1Value > card2Value;
    const isCard2Higher = card1Value < card2Value;

    // 检查玩家的选择是否正确并更新分数
    if (
        (playerChoice === 'left-btn' && isCard1Higher) ||
        (playerChoice === 'equal-btn' && card1Value === card2Value) ||
        (playerChoice === 'right-btn' && isCard2Higher)
    ) {
        score++;
        updateScoreText();
    } else {
        // 答案错误，游戏失败
        gameOver();
        return;
    }

    // 显示下一个问题
    showNextQuestion();
}

// 处理游戏结束状态
function gameOver() {
  clearInterval(timer); // 清除计时器
    isGameOver = true;
    leftBtn.style.display = 'none';
    equalBtn.style.display = 'none';
    rightBtn.style.display = 'none';
    gameContent.style.display = 'block';
    gameOverScreen.style.display = 'block';

    // Compare the corresponding attribute of the two cards
    const card1Value = randomCard1[currentAttribute];
    const card2Value = randomCard2[currentAttribute];

    // 如果两张卡片的属性值相同，则答案为 "一样"
    if (card1Value === card2Value) {
        correctAnswerText.textContent = '一样';
    } else {
        // 否则，答案为较大属性值的卡片
        correctAnswerText.textContent = card1Value > card2Value ? '左' : '右';
    }
}

// 更新分数文本
function updateScoreText() {
    scoreText.textContent = `得分: ${score}`;
}

// 更新倒计时文本
function updateTimerText() {
    timerText.textContent = `倒计时: ${timer}`;
}

// 开始游戏
function startGame() {
    score = 0;
    timer = 10;
    currentAttribute = '攻击';
    isGameOver = false;
    updateScoreText();
    updateTimerText();
    startBtn.style.display = 'none';
    gameContent.style.display = 'block';
    gameOverScreen.style.display = 'none';
    startTimer();
    showNextQuestion();
}

// 开始倒计时
function startTimer() {
    const interval = setInterval(() => {
        timer--;
        updateTimerText();
        if (timer <= 0) {
            clearInterval(interval);
            gameOver();
        }
    }, 1000);
}

// 处理重新开始游戏
function restartGame() {
    leftBtn.style.display = 'block';
    equalBtn.style.display = 'block';
    rightBtn.style.display = 'block';
    gameOverScreen.style.display = 'none';
    startGame();
}


// 事件监听器
startBtn.addEventListener('click', startGame);
leftBtn.addEventListener('click', chooseCard);
equalBtn.addEventListener('click', chooseCard);
rightBtn.addEventListener('click', chooseCard);
restartBtn.addEventListener('click', restartGame);

// 初始设置
showLoadingScreen();

// 模拟延迟加载图片，完成后隐藏加载屏幕并显示游戏界面
setTimeout(() => {
    hideLoadingScreen();
}, 1500);
