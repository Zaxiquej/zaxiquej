let score = 0;
let correctClan = 0;
let correctCardN;
let timer;
let clanNames = ["中立","妖精","皇家护卫","巫师","龙族","死灵法师","吸血鬼","主教","复仇者"]
let diceRoll;
// 预加载图片
function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// 预先加载的卡牌数量
const numPreloadCards = 10; // 可根据需求调整

// 初始化预加载数组
let preCards = [];
// 生成系列按钮
const clanBtns = document.getElementById('clanBtns');
for (let i = 0; i <= 8; i++) {
  let btn = document.createElement('button');
  btn.classList.add('clanBtn');
  btn.style.backgroundImage = `url(pics/clan${i}.png)`;
  btn.dataset.clan = i;
  btn.addEventListener('click', () => {
    btn.classList.add('selected');
    checkAnswer(i);
  });
  clanBtns.appendChild(btn);
}

// 开始游戏
const startBtn = document.getElementById('startBtn');
startBtn.addEventListener('click', startGame);

function startGame() {
  // 隐藏介绍，显示游戏界面
  document.getElementById('intro').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  // 预先加载卡牌图片
  for (let i = 0; i < numPreloadCards; i++) {
    const cardIndex = Math.floor(Math.random() * cardData.length);
    const card = cardData[cardIndex];
    const cardId = card.char_type === 1 ? card.card_id * 10 + (Math.random() < 0.5 ? 1 : 0) : card.card_id * 10;
    const imgSrc = `https://svgdb.me/assets/fullart/${cardId}.png`;
    preCards.push({ card, imgSrc });
    preloadImage(imgSrc);
  }
  // 重置分数
  score = 0;
  document.getElementById('scoreDisplay').textContent = score;

  // 随机选取卡牌
  pickCard();
}

// 从数据中随机选取卡牌
function pickCard() {
  if (preCards.length === 0) {
    return; // 没有预先加载的卡牌了
  }

  const { card, imgSrc } = preCards.shift(); // 获取预先加载的卡牌数据和图片链接
  correctClan = card.clan;
  correctCardN = card.card_name;

  // 获取图片元素
  const cardImg = document.getElementById('cardImg');

  // 隐藏图片
  cardImg.classList.remove('gray'); // 移除灰度效果
  cardImg.style.display = 'none';

    // 图片加载完成事件
    cardImg.onload = () => {
      // 显示图片
      cardImg.style.display = 'block';

      // 更新图片源
      cardImg.src = imgSrc;

      // 重新显示按钮
      document.querySelectorAll('.clanBtn').forEach(btn => {
        btn.disabled = false;
      });
    };

  // 设置图片源
  cardImg.src = imgSrc;

  // 禁用按钮
  document.querySelectorAll('.clanBtn').forEach(btn => {
    btn.disabled = true;
  });

  // 移除已用的卡牌并添加新卡牌
  addPre();
}

function addPre(){
  const cardIndex = Math.floor(Math.random() * cardData.length);
  const card = cardData[cardIndex];
  const cardId = card.char_type === 1 ? card.card_id * 10 + (Math.random() < 0.5 ? 1 : 0) : card.card_id * 10;
  const imgSrc = `https://svgdb.me/assets/fullart/${cardId}.png`;
  preCards.push({ card, imgSrc });
  preloadImage(imgSrc);
}

// 加载下一张卡牌
function nextCard() {
  // 隐藏图片
  const cardImg = document.getElementById('cardImg');
  cardImg.style.display = 'none';

  // 隐藏按钮
  document.querySelectorAll('.clanBtn').forEach(btn => {
    btn.disabled = true;
    btn.classList.remove('selected'); // 移除之前选择的按钮样式
  });

  pickCard(); // 重新选取下一张卡牌
}



// 检查猜测是否正确
function checkAnswer(guess) {
  if (guess === correctClan) {
    score++;
    document.getElementById('scoreDisplay').textContent = score;
    // 根据分数添加遮罩效果
    nextCard(); // 加载下一张卡牌

    if (score >= 1) {
      const diceRoll = Math.floor(Math.random() * 4) + 1;
      if (diceRoll === 1) {
        applyGrayScaleEffect(50)
      } else if (diceRoll === 2) {
        applyGrayScaleEffect(80)
      } else if (diceRoll === 3) {
        applyGrayScaleEffect(100)
      }
    }
  } else {
    endGame();
  }
}

// 结束游戏
function endGame() {
  clearInterval(timer);
  document.getElementById('result').textContent = `错误！正确答案是：${clanNames[correctClan]}。该卡牌为${correctCardN}。最终得分：${score}`;

  // 隐藏按钮，显示重新开始
  clanBtns.style.display = 'none';
  document.getElementById('restartBtn').style.display = 'block';
}

// 重新开始游戏
const restartBtn = document.getElementById('restartBtn');
restartBtn.addEventListener('click', () => {
  // 重置
  score = 0;
  preCards = [];
  // 预先加载卡牌图片
  for (let i = 0; i < numPreloadCards; i++) {
    const cardIndex = Math.floor(Math.random() * cardData.length);
    const card = cardData[cardIndex];
    const cardId = card.char_type === 1 ? card.card_id * 10 + (Math.random() < 0.5 ? 1 : 0) : card.card_id * 10;
    const imgSrc = `https://svgdb.me/assets/fullart/${cardId}.png`;
    preCards.push({ card, imgSrc });
    preloadImage(imgSrc);
  }
  // 隐藏结果，显示按钮
  document.getElementById('result').textContent = '';
  clanBtns.style.display = 'flex';
  restartBtn.style.display = 'none';
  startGame();
});

function applyGrayScaleEffect(intensity) {
  document.documentElement.style.setProperty('--grayscale-intensity', intensity+'%')
  const cardImg = document.getElementById('cardImg');
  cardImg.classList.add('gray'); // 添加灰度效果
}
