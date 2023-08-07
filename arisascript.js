// 新手入门
const basic = [
  { id: 201, image: 'arisa/image/creature201.png', sound: 'arisa/sound/sound201.mp3' },
  { id: 202, image: 'arisa/image/creature202.png', sound: 'arisa/sound/sound202.mp3' },
  { id: 203, image: 'arisa/image/creature203.png', sound: 'arisa/sound/sound203.mp3' },
  { id: 204, image: 'arisa/image/creature204.png', sound: 'arisa/sound/sound204.mp3' },
  { id: 205, image: 'arisa/image/creature205.png', sound: 'arisa/sound/sound205.mp3' },
  { id: 206, image: 'arisa/image/creature206.png', sound: 'arisa/sound/sound206.mp3' },
  { id: 207, image: 'arisa/image/creature207.png', sound: 'arisa/sound/sound207.mp3' },
  { id: 208, image: 'arisa/image/creature208.png', sound: 'arisa/sound/sound208.mp3' },
  { id: 209, image: 'arisa/image/creature209.png', sound: 'arisa/sound/sound209.mp3' },
  { id: 210, image: 'arisa/image/creature210.png', sound: 'arisa/sound/sound210.mp3' },
  { id: 211, image: 'arisa/image/creature211.png', sound: 'arisa/sound/sound211.mp3' },
  { id: 212, image: 'arisa/image/creature212.png', sound: 'arisa/sound/sound212.mp3' },
  { id: 213, image: 'arisa/image/creature213.png', sound: 'arisa/sound/sound213.mp3' },
  { id: 214, image: 'arisa/image/creature214.png', sound: 'arisa/sound/sound214.mp3' },
];

// 创造物数据数组（示例数据）
const creatures = [
  { id: 1, image: 'arisa/image/creature1.png', sound: 'arisa/sound/sound1.mp3' },
  { id: 2, image: 'arisa/image/creature2.png', sound: 'arisa/sound/sound2.mp3' },
  { id: 3, image: 'arisa/image/creature3.png', sound: 'arisa/sound/sound3.mp3' },
  { id: 4, image: 'arisa/image/creature4.png', sound: 'arisa/sound/sound4.mp3' },
  { id: 5, image: 'arisa/image/creature5.png', sound: 'arisa/sound/sound5.mp3' },
  { id: 6, image: 'arisa/image/creature6.png', sound: 'arisa/sound/sound6.mp3' },
  { id: 7, image: 'arisa/image/creature7.png', sound: 'arisa/sound/sound7.mp3' },
  { id: 8, image: 'arisa/image/creature8.png', sound: 'arisa/sound/sound8.mp3' },
  { id: 9, image: 'arisa/image/creature9.png', sound: 'arisa/sound/sound9.mp3' },
  { id: 10, image: 'arisa/image/creature10.png', sound: 'arisa/sound/sound10.mp3' },
  { id: 11, image: 'arisa/image/creature11.png', sound: 'arisa/sound/sound11.mp3' },
  { id: 12, image: 'arisa/image/creature12.png', sound: 'arisa/sound/sound12.mp3' },
  { id: 13, image: 'arisa/image/creature13.png', sound: 'arisa/sound/sound13.mp3' },
  { id: 14, image: 'arisa/image/creature14.png', sound: 'arisa/sound/sound14.mp3' },
  { id: 15, image: 'arisa/image/creature15.png', sound: 'arisa/sound/sound15.mp3' },
  { id: 16, image: 'arisa/image/creature16.png', sound: 'arisa/sound/sound16.mp3' },
  { id: 17, image: 'arisa/image/creature17.png', sound: 'arisa/sound/sound17.mp3' },
  { id: 18, image: 'arisa/image/creature18.png', sound: 'arisa/sound/sound18.mp3' },
  { id: 19, image: 'arisa/image/creature19.png', sound: 'arisa/sound/sound19.mp3' },
];

// 创造物进化后的数据（示例数据）
const evolvedCreatures = [
  { id: 101, image: 'arisa/image/creature101.png', sound: 'arisa/sound/sound101.mp3' },
  { id: 102, image: 'arisa/image/creature102.png', sound: 'arisa/sound/sound102.mp3' },
  { id: 103, image: 'arisa/image/creature103.png', sound: 'arisa/sound/sound103.mp3' },
  { id: 104, image: 'arisa/image/creature104.png', sound: 'arisa/sound/sound104.mp3' },
  { id: 105, image: 'arisa/image/creature105.png', sound: 'arisa/sound/sound105.mp3' },
  { id: 106, image: 'arisa/image/creature106.png', sound: 'arisa/sound/sound106.mp3' },
  { id: 107, image: 'arisa/image/creature107.png', sound: 'arisa/sound/sound107.mp3' },
  { id: 108, image: 'arisa/image/creature108.png', sound: 'arisa/sound/sound108.mp3' },
  { id: 109, image: 'arisa/image/creature109.png', sound: 'arisa/sound/sound109.mp3' },
  { id: 110, image: 'arisa/image/creature110.png', sound: 'arisa/sound/sound110.mp3' },
  { id: 111, image: 'arisa/image/creature111.png', sound: 'arisa/sound/sound111.mp3' },
  { id: 112, image: 'arisa/image/creature112.png', sound: 'arisa/sound/sound112.mp3' },
  { id: 113, image: 'arisa/image/creature113.png', sound: 'arisa/sound/sound113.mp3' },
  { id: 114, image: 'arisa/image/creature114.png', sound: 'arisa/sound/sound114.mp3' },
  { id: 115, image: 'arisa/image/creature115.png', sound: 'arisa/sound/sound115.mp3' },
  { id: 116, image: 'arisa/image/creature116.png', sound: 'arisa/sound/sound116.mp3' },
  { id: 117, image: 'arisa/image/creature117.png', sound: 'arisa/sound/sound117.mp3' },
  { id: 118, image: 'arisa/image/creature118.png', sound: 'arisa/sound/sound118.mp3' },
  { id: 119, image: 'arisa/image/creature119.png', sound: 'arisa/sound/sound119.mp3' },
  // 依次添加其他进化后的创造物数据
];

// 初始化游戏状态
let score = 0;
let timeLimit = 30; // 初始时间限制（秒）
let gameInterval; // 用于存储游戏倒计时的interval ID
let isPlaying = false; // 表示是否正在播放音乐
let isSoundRepeating = false; // 表示是否允许声音重复播放
let randNum = 0;
let currentcreatures;
let randomCreatures;
let numButtons = 2;

let currentAudio; // 用于存储当前正在播放的音频对象

// 增加难度
function increaseDifficulty() {
  if (score <= 11){
    numButtons = Math.min(19, Math.floor(score / 3) + 2);
  } else {
    numButtons = Math.min(19, Math.floor((score-12) / 6) + 6);
  }

  timeLimit = Math.max(12,30 - Math.floor(score / 5)); // 时间减少
  refreshTimeLimit();

  let allCreatures;
  if (score <= 5){
    allCreatures = basic;
  } else {
    if (score >= 18){
      allCreatures = creatures.concat(evolvedCreatures);
    } else {
      allCreatures = creatures;
    }
  }

  createGameButtons(numButtons, allCreatures);
  randNum = getRandomInt(numButtons)

  currentcreatures = randomCreatures[getCurrentCreatureId()];
  playMusic(randomCreatures[randNum].sound)
}

// 重新开始游戏
function restartGame() {
  score = 0;
  timeLimit = 30;
  const initialNumButtons = 2;
  numButtons = 2;

  document.getElementById('score').innerText = '分数: 0';
  document.getElementById('timer').innerText = `剩余时间: ${timeLimit}`;
  gameInterval = setInterval(updateTimeLimit, 1000);
  document.getElementById('startButton').style.display = 'none'; // 隐藏"开始游戏"按钮
  document.getElementById('replayButton').style.display = 'block'; // 隐藏"开始游戏"按钮
  document.getElementById('other').style.display = 'none'; // 隐藏"其他"按钮
  const Buttons = document.getElementById('Buttons');
  Buttons.innerHTML = ``;

  createGameButtons(initialNumButtons, basic);
  randNum = getRandomInt(numButtons)

  currentcreatures = randomCreatures[getCurrentCreatureId()];
  playMusic(randomCreatures[randNum].sound)
}

// 全局变量，用于跟踪已加载的素材数量
let loadedCount = 0;
let total;

// 初始化游戏
createGameButtons(0, []); // 初始时没有按钮

// 页面加载完成后初始化游戏
window.onload = initGame;
