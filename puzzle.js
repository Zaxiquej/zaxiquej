let player = {
  health: 100,
  maxHealth: 100,
  attack: 10,
  defense: 5,
  experience: 0,
  maxExperience: 50,
};

let monster = {
  health: 80,
  maxHealth: 80,
  attack: 8,
  defense: 3,
  actionProgress: 0,
  actionThreshold: 100,
};

let questionBank = [
  {
    question: "解微分方程 dy/dx = x^2",
    answer: "y = (x^3)/3 + C",
  },
  {
    question: "求 ∫(2x + 1) dx",
    answer: "x^2 + x + C",
  },
  {
    question: "解微分方程 dy/dx = sin(x)",
    answer: "y = -cos(x) + C",
  },
  // 添加更多题目
];

let currentQuestionIndex = 0;

function updateStats() {
  document.getElementById("player-health").textContent = player.health;
  document.getElementById("player-attack").textContent = player.attack;
  document.getElementById("player-defense").textContent = player.defense;
  document.getElementById("player-exp").textContent = player.experience;

  document.getElementById("monster-health").textContent = monster.health;
  document.getElementById("monster-attack").textContent = monster.attack;
  document.getElementById("monster-defense").textContent = monster.defense;

  document.getElementById("exp-fill").style.width = `${(player.experience / player.maxExperience) * 100}%`;
  document.getElementById("action-fill").style.width = `${(monster.actionProgress / monster.actionThreshold) * 100}%`;
}

function displayQuestion() {
  getRandomQuestion();
  document.getElementById("question-text").textContent = questionBank[currentQuestionIndex].question;
  document.getElementById("answer-input").value = "";
}

function getRandomQuestion() {
  currentQuestionIndex = Math.floor(Math.random() * questionBank.length);
}

function attackMonster() {
  let playerDamage = Math.max(player.attack - monster.defense, 0);
  monster.health -= playerDamage;

  if (monster.health <= 0) {
    player.experience += 20;
    monster.health = monster.maxHealth;
    getRandomQuestion();
    monster.actionProgress = 0;
  } else {
    monsterAction();
  }
}

function healPlayer() {
  let playerHeal = 20; // 固定回血量
  player.health = Math.min(player.health + playerHeal, player.maxHealth);
  getRandomQuestion();
  monsterAction();
}

function answerQuestion() {
  let playerAnswer = document.getElementById("answer-input").value.trim();
  let correctAnswer = questionBank[currentQuestionIndex].answer;

  if (playerAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
    player.experience += 10;

    if (player.experience >= player.maxExperience) {
      player.experience = player.maxExperience;
    }

    getRandomQuestion();
    monsterAction();
  }
}

function monsterAction() {
  if (monster.actionProgress >= monster.actionThreshold) {
    let monsterDamage = Math.max(monster.attack - player.defense, 0);
    player.health -= monsterDamage;
    monster.actionProgress = 0;
  } else {
    monster.actionProgress += 5; // 每次递增，调整递增速度以增加紧迫感
  }
}

function initGame() {
  updateStats();
  getRandomQuestion();
  displayQuestion();

  document.getElementById("attack-btn").addEventListener("click", () => {
    attackMonster();
    updateStats();
  });

  document.getElementById("heal-btn").addEventListener("click", () => {
    healPlayer();
    updateStats();
  });

  document.getElementById("answer-input").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      answerQuestion();
      updateStats();
    }
  });

  setInterval(() => {
    monsterAction();
    updateStats();
  }, 1000); // 每秒调用一次 monsterAction
}

window.onload = function() {
  initGame();
};
