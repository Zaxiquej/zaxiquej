// 新手入门
const basic = [
  { id: 201, image: 'orchis/image/creature201.png', sound: 'orchis/sound/sound201.mp3' },
  { id: 202, image: 'orchis/image/creature202.png', sound: 'orchis/sound/sound202.mp3' },
  { id: 203, image: 'orchis/image/creature203.png', sound: 'orchis/sound/sound203.mp3' },
  { id: 204, image: 'orchis/image/creature204.png', sound: 'orchis/sound/sound204.mp3' },
  { id: 205, image: 'orchis/image/creature205.png', sound: 'orchis/sound/sound205.mp3' },
  { id: 206, image: 'orchis/image/creature206.png', sound: 'orchis/sound/sound206.mp3' },
  { id: 207, image: 'orchis/image/creature207.png', sound: 'orchis/sound/sound207.mp3' },
  { id: 208, image: 'orchis/image/creature208.png', sound: 'orchis/sound/sound208.mp3' },
  { id: 209, image: 'orchis/image/creature209.png', sound: 'orchis/sound/sound209.mp3' },
  { id: 210, image: 'orchis/image/creature210.png', sound: 'orchis/sound/sound210.mp3' },
  { id: 211, image: 'orchis/image/creature211.png', sound: 'orchis/sound/sound211.mp3' },
  { id: 212, image: 'orchis/image/creature212.png', sound: 'orchis/sound/sound212.mp3' },
  { id: 213, image: 'orchis/image/creature213.png', sound: 'orchis/sound/sound213.mp3' },
  { id: 214, image: 'orchis/image/creature214.png', sound: 'orchis/sound/sound214.mp3' },
];

// 创造物数据数组（示例数据）
const creatures = [
  { id: 1, image: 'orchis/image/creature1.png', sound: 'orchis/sound/sound1.mp3' },
  { id: 2, image: 'orchis/image/creature2.png', sound: 'orchis/sound/sound2.mp3' },
  { id: 3, image: 'orchis/image/creature3.png', sound: 'orchis/sound/sound3.mp3' },
  { id: 4, image: 'orchis/image/creature4.png', sound: 'orchis/sound/sound4.mp3' },
  { id: 5, image: 'orchis/image/creature5.png', sound: 'orchis/sound/sound5.mp3' },
  { id: 6, image: 'orchis/image/creature6.png', sound: 'orchis/sound/sound6.mp3' },
  { id: 7, image: 'orchis/image/creature7.png', sound: 'orchis/sound/sound7.mp3' },
  { id: 8, image: 'orchis/image/creature8.png', sound: 'orchis/sound/sound8.mp3' },
  { id: 9, image: 'orchis/image/creature9.png', sound: 'orchis/sound/sound9.mp3' },
  { id: 10, image: 'orchis/image/creature10.png', sound: 'orchis/sound/sound10.mp3' },
  { id: 11, image: 'orchis/image/creature11.png', sound: 'orchis/sound/sound11.mp3' },
  { id: 12, image: 'orchis/image/creature12.png', sound: 'orchis/sound/sound12.mp3' },
  { id: 13, image: 'orchis/image/creature13.png', sound: 'orchis/sound/sound13.mp3' },
  { id: 14, image: 'orchis/image/creature14.png', sound: 'orchis/sound/sound14.mp3' },
  { id: 15, image: 'orchis/image/creature15.png', sound: 'orchis/sound/sound15.mp3' },
  { id: 16, image: 'orchis/image/creature16.png', sound: 'orchis/sound/sound16.mp3' },
  { id: 17, image: 'orchis/image/creature17.png', sound: 'orchis/sound/sound17.mp3' },
  { id: 18, image: 'orchis/image/creature18.png', sound: 'orchis/sound/sound18.mp3' },
  { id: 19, image: 'orchis/image/creature19.png', sound: 'orchis/sound/sound19.mp3' },
  { id: 20, image: 'orchis/image/creature20.png', sound: 'orchis/sound/sound20.mp3' },
  { id: 21, image: 'orchis/image/creature21.png', sound: 'orchis/sound/sound21.mp3' },
  { id: 22, image: 'orchis/image/creature22.png', sound: 'orchis/sound/sound22.mp3' },
  { id: 23, image: 'orchis/image/creature23.png', sound: 'orchis/sound/sound23.mp3' },
  { id: 24, image: 'orchis/image/creature24.png', sound: 'orchis/sound/sound24.mp3' },
  { id: 25, image: 'orchis/image/creature25.png', sound: 'orchis/sound/sound25.mp3' },
  { id: 26, image: 'orchis/image/creature26.png', sound: 'orchis/sound/sound26.mp3' },
];

// 创造物进化后的数据（示例数据）
const evolvedCreatures = [
  { id: 101, image: 'orchis/image/creature101.png', sound: 'orchis/sound/sound101.mp3' },
  { id: 102, image: 'orchis/image/creature102.png', sound: 'orchis/sound/sound102.mp3' },
  { id: 103, image: 'orchis/image/creature103.png', sound: 'orchis/sound/sound103.mp3' },
  { id: 104, image: 'orchis/image/creature104.png', sound: 'orchis/sound/sound104.mp3' },
  { id: 105, image: 'orchis/image/creature105.png', sound: 'orchis/sound/sound105.mp3' },
  { id: 106, image: 'orchis/image/creature106.png', sound: 'orchis/sound/sound106.mp3' },
  { id: 107, image: 'orchis/image/creature107.png', sound: 'orchis/sound/sound107.mp3' },
  { id: 108, image: 'orchis/image/creature108.png', sound: 'orchis/sound/sound108.mp3' },
  { id: 109, image: 'orchis/image/creature109.png', sound: 'orchis/sound/sound109.mp3' },
  { id: 110, image: 'orchis/image/creature110.png', sound: 'orchis/sound/sound110.mp3' },
  { id: 111, image: 'orchis/image/creature111.png', sound: 'orchis/sound/sound111.mp3' },
  { id: 112, image: 'orchis/image/creature112.png', sound: 'orchis/sound/sound112.mp3' },
  { id: 113, image: 'orchis/image/creature113.png', sound: 'orchis/sound/sound113.mp3' },
  { id: 114, image: 'orchis/image/creature114.png', sound: 'orchis/sound/sound114.mp3' },
  { id: 115, image: 'orchis/image/creature115.png', sound: 'orchis/sound/sound115.mp3' },
  { id: 116, image: 'orchis/image/creature116.png', sound: 'orchis/sound/sound116.mp3' },
  { id: 117, image: 'orchis/image/creature117.png', sound: 'orchis/sound/sound117.mp3' },
  { id: 118, image: 'orchis/image/creature118.png', sound: 'orchis/sound/sound118.mp3' },
  { id: 119, image: 'orchis/image/creature119.png', sound: 'orchis/sound/sound119.mp3' },
  { id: 120, image: 'orchis/image/creature120.png', sound: 'orchis/sound/sound120.mp3' },
  { id: 121, image: 'orchis/image/creature121.png', sound: 'orchis/sound/sound121.mp3' },
  { id: 122, image: 'orchis/image/creature122.png', sound: 'orchis/sound/sound122.mp3' },
  { id: 123, image: 'orchis/image/creature123.png', sound: 'orchis/sound/sound123.mp3' },
  { id: 124, image: 'orchis/image/creature124.png', sound: 'orchis/sound/sound124.mp3' },
  { id: 125, image: 'orchis/image/creature125.png', sound: 'orchis/sound/sound125.mp3' },
  { id: 126, image: 'orchis/image/creature126.png', sound: 'orchis/sound/sound126.mp3' },
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

  timeLimit = Math.max(10,25 - Math.floor(score / 5)); // 时间减少
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
let total

// 初始化游戏
createGameButtons(0, []); // 初始时没有按钮

// 页面加载完成后初始化游戏
window.onload = initGame;
