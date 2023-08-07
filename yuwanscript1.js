// 新手入门
const basic = [
  { id: 201, image: 'image/creature201.png', sound: 'sound/sound201.mp3' },
  { id: 202, image: 'image/creature202.png', sound: 'sound/sound202.mp3' },
  { id: 203, image: 'image/creature203.png', sound: 'sound/sound203.mp3' },
  { id: 204, image: 'image/creature204.png', sound: 'sound/sound204.mp3' },
  { id: 205, image: 'image/creature205.png', sound: 'sound/sound205.mp3' },
  { id: 206, image: 'image/creature206.png', sound: 'sound/sound206.mp3' },
  { id: 207, image: 'image/creature207.png', sound: 'sound/sound207.mp3' },
  { id: 208, image: 'image/creature208.png', sound: 'sound/sound208.mp3' },
  { id: 209, image: 'image/creature209.png', sound: 'sound/sound209.mp3' },
  { id: 210, image: 'image/creature210.png', sound: 'sound/sound210.mp3' },
  { id: 211, image: 'image/creature211.png', sound: 'sound/sound211.mp3' },
  { id: 212, image: 'image/creature212.png', sound: 'sound/sound212.mp3' },
  { id: 213, image: 'image/creature213.png', sound: 'sound/sound213.mp3' },
  { id: 214, image: 'image/creature214.png', sound: 'sound/sound214.mp3' },
];

// 创造物数据数组（示例数据）
const creatures = [
  { id: 1, image: 'image/creature1.png', sound: 'sound/sound1.mp3' },
  { id: 2, image: 'image/creature2.png', sound: 'sound/sound2.mp3' },
  { id: 3, image: 'image/creature3.png', sound: 'sound/sound3.mp3' },
  { id: 4, image: 'image/creature4.png', sound: 'sound/sound4.mp3' },
  { id: 5, image: 'image/creature5.png', sound: 'sound/sound5.mp3' },
  { id: 6, image: 'image/creature6.png', sound: 'sound/sound6.mp3' },
  { id: 7, image: 'image/creature7.png', sound: 'sound/sound7.mp3' },
  { id: 8, image: 'image/creature8.png', sound: 'sound/sound8.mp3' },
  { id: 9, image: 'image/creature9.png', sound: 'sound/sound9.mp3' },
  { id: 10, image: 'image/creature10.png', sound: 'sound/sound10.mp3' },
  { id: 11, image: 'image/creature11.png', sound: 'sound/sound11.mp3' },
  { id: 12, image: 'image/creature12.png', sound: 'sound/sound12.mp3' },
  { id: 13, image: 'image/creature13.png', sound: 'sound/sound13.mp3' },
  { id: 14, image: 'image/creature14.png', sound: 'sound/sound14.mp3' },
  { id: 15, image: 'image/creature15.png', sound: 'sound/sound15.mp3' },
  { id: 16, image: 'image/creature16.png', sound: 'sound/sound16.mp3' },
  { id: 17, image: 'image/creature17.png', sound: 'sound/sound17.mp3' },
  { id: 18, image: 'image/creature18.png', sound: 'sound/sound18.mp3' },
  { id: 19, image: 'image/creature19.png', sound: 'sound/sound19.mp3' },
];

// 创造物进化后的数据（示例数据）
const evolvedCreatures = [
  { id: 101, image: 'image/creature101.png', sound: 'sound/sound101.mp3' },
  { id: 102, image: 'image/creature102.png', sound: 'sound/sound102.mp3' },
  { id: 103, image: 'image/creature103.png', sound: 'sound/sound103.mp3' },
  { id: 104, image: 'image/creature104.png', sound: 'sound/sound104.mp3' },
  { id: 105, image: 'image/creature105.png', sound: 'sound/sound105.mp3' },
  { id: 106, image: 'image/creature106.png', sound: 'sound/sound106.mp3' },
  { id: 107, image: 'image/creature107.png', sound: 'sound/sound107.mp3' },
  { id: 108, image: 'image/creature108.png', sound: 'sound/sound108.mp3' },
  { id: 109, image: 'image/creature109.png', sound: 'sound/sound109.mp3' },
  { id: 110, image: 'image/creature110.png', sound: 'sound/sound110.mp3' },
  { id: 111, image: 'image/creature111.png', sound: 'sound/sound111.mp3' },
  { id: 112, image: 'image/creature112.png', sound: 'sound/sound112.mp3' },
  { id: 113, image: 'image/creature113.png', sound: 'sound/sound113.mp3' },
  { id: 114, image: 'image/creature114.png', sound: 'sound/sound114.mp3' },
  { id: 115, image: 'image/creature115.png', sound: 'sound/sound115.mp3' },
  { id: 116, image: 'image/creature116.png', sound: 'sound/sound116.mp3' },
  { id: 117, image: 'image/creature117.png', sound: 'sound/sound117.mp3' },
  { id: 118, image: 'image/creature118.png', sound: 'sound/sound118.mp3' },
  { id: 119, image: 'image/creature119.png', sound: 'sound/sound119.mp3' },
  // 依次添加其他进化后的创造物数据
];

// 初始化游戏状态
let score = 0;
let timeLimit = 25; // 初始时间限制（秒）
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

  timeLimit = Math.max(6,20 - Math.floor(score / 4)); // 时间减少
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
  timeLimit = 25;
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
