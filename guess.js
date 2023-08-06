// guess.js
document.addEventListener("DOMContentLoaded", function () {
    const guessButton = document.getElementById("guessButton");
    const guessInput = document.getElementById("guessInput");
    const suggestionsDiv = document.getElementById("suggestions");
    const historyDiv = document.getElementById("history");
    const playBox = document.getElementById("playBox");
    const guessBox = document.getElementById("guessBox");
    const startBox = document.getElementById("startBox");
    const restartButton = document.getElementById("restartButton");
    const hintButton = document.getElementById("hintButton");
    let puzzleCard = null; // 存储解谜时随机抽取的卡牌
    let previousGuess = null;

    let gameStarted = false;
    let time = 0;
    let highestScore = 0;

    // 排序选项和按钮
    const sortOptions = document.getElementById("sortingOptions");
    const sortOption = document.getElementById("sortOption");
    const sortButton = document.getElementById("sortButton");

    const seedInput = document.getElementById("seedInput");
    const useSeedButton = document.getElementById("useSeedButton");
    const randomSeedButton = document.getElementById("randomSeedButton");

     // ...

     let seed = ""; // 存储随机种子

     // 点击随机种子按钮
  randomSeedButton.addEventListener("click", function () {
    seed = generateCurrentDateSeed(); // 生成随机种子
    seedInput.value = seed; // 将种子显示在输入框中
  });

  // 点击使用种子按钮
  useSeedButton.addEventListener("click", function () {
    seed = seedInput.value.trim();
    if (seed === "") {
      alert("请输入种子或点击随机种子按钮获取随机种子！");
      return;
    }

    startGameWithSeed(seed); // 使用种子开始游戏
  });

  // 生成随机种子
  function generateRandomSeed() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // 使用种子开始游戏
  function startGameWithSeed(seed) {
    // 在这里使用种子初始化随机数生成器
    resetGame();
    Math.seedrandom(seed);

    // 初始化游戏逻辑，例如随机抽取一张卡牌作为解谜目标等
    const randomIndex = Math.floor(Math.random() * cardData.length);
    puzzleCard = cardData[randomIndex];
    // Display similarity of 10th, 100th, and 1000th ranked cards
     const card10 = getCardByRank(10);
     const card100 = getCardByRank(100);
     const card1000 = getCardByRank(1000);

     if (card10) {
       document.getElementById("rank10Similarity").textContent = card10.similarity.toFixed(2);
     }

     if (card100) {
       document.getElementById("rank100Similarity").textContent = card100.similarity.toFixed(2);
     }

     if (card1000) {
       document.getElementById("rank1000Similarity").textContent = card1000.similarity.toFixed(2);
     }

     // Update the "currentSeed" element with the current seed value
     document.getElementById("currentSeed").textContent = `当前种子：${seed}`;

    // 显示解谜开始信息
    const puzzleStartMessage = document.createElement("p");
    puzzleStartMessage.textContent = "解谜开始！系统已抽取一张卡牌，请猜测卡牌名称：";
    historyDiv.appendChild(puzzleStartMessage);

    // 显示游戏界面
    hintButton.style.display = "block";
    startBox.style.display = "none";
    document.getElementById("cSeed").style.display = "block";
    playBox.style.display = "block";
  }

    sortButton.addEventListener("click", sortHistory);
        // 重新开始按钮
    restartButton.addEventListener("click", restartGame);

    function resetGame() {
      gameStarted = false;
      sortOptions.style.display = "none";
      playBox.style.display = "none";
      historyDiv.innerHTML = "";
      restartButton.style.display = "none";
      hintButton.style.display = "none";
    }

    function restartGame() {
        gameStarted = false;
        puzzleCard = null;
        time = 0;
        highestScore = 0;
        resetGame();

        startBox.style.display = "block";
        guessBox.style.display = "block";

        document.getElementById("cSeed").style.display = "none";
    }

    guessButton.addEventListener("click", function () {
        const guess = guessInput.value.trim();
        if (guess === "") {
            alert("请输入猜测的卡牌名称！");
            return;
        }

        guessCardName(guess);
    });

    // 提示按钮

    hintButton.addEventListener("click", function () {
        if (!puzzleCard) {
            alert("请先点击“解谜开始”按钮开始解谜！");
            return;
        }

        const cardOptions = getHintCardOptions(highestScore);
        if (cardOptions.length === 0) {
            alert("系统无法提供提示！");
        } else {
            const hintCard = cardOptions[0];
            const similarity = calculateSimilarityScore(puzzleCard, hintCard);
            const rank = getRank(similarity);

            const hintMessage = document.createElement("p");
            time++;
            hintMessage.textContent = `提示${time}： ${hintCard.card_name}，相似度：${similarity.toFixed(2)}，排名：${rank}`;
            hintMessage.similarity = similarity;
            hintMessage.order = time;

            hintMessage.classList.add("highlight");
            // 如果之前有上一条猜测，移除其高亮样式
            if (previousGuess) {
              previousGuess.classList.remove("highlight");
            }
            // 更新上一条猜测为当前猜测
            previousGuess = hintMessage;

            if (similarity > highestScore){
              highestScore = similarity;
            }
            historyDiv.appendChild(hintMessage);
            sortHistory();
        }
    });

    function guessCardName(guess) {
        if (!puzzleCard) {
            alert("请先点击“解谜开始”按钮开始解谜！");
            return;
        }

        let foundCard = findCardByName(guess);

        if (!foundCard) {
          const correctionSuggestions = getCorrectionSuggestion(guess);
          if (correctionSuggestions) {
            const suggestionHTML = correctionSuggestions.map(suggestion => `<button class="suggestionBtn">${suggestion}</button>`).join("");
            suggestionsDiv.innerHTML = suggestionHTML;

            const suggestionBtns = document.querySelectorAll(".suggestionBtn");
            suggestionBtns.forEach(btn => {
              btn.addEventListener("click", function () {
                guessInput.value = btn.textContent; // 替换输入框的内容为被点击的建议
                suggestionsDiv.innerHTML = ""; // 清空建议
                guessCardName(guessInput.value); // 进行搜索
              });
            });
          } else {
            suggestionsDiv.innerHTML = ""; // 清空建议
          }
          return;
        } else {
          suggestionsDiv.innerHTML = ""; // 清空建议
        }

        const similarity = calculateSimilarityScore(puzzleCard, foundCard);
        const rank = getRank(similarity);

        const resultMessage = document.createElement("p");
        time++;
        resultMessage.textContent = `猜测${time}：${guess}，相似度：${similarity.toFixed(2)}，排名：${rank}`;
        resultMessage.similarity = similarity;
        resultMessage.order = time;

        resultMessage.classList.add("highlight");
        // 如果之前有上一条猜测，移除其高亮样式
        if (previousGuess) {
          previousGuess.classList.remove("highlight");
        }
        // 更新上一条猜测为当前猜测
        previousGuess = resultMessage;

        if (similarity > highestScore){
          highestScore = similarity;
        }
        historyDiv.appendChild(resultMessage);
        sortHistory();

        guessInput.value = "";
        if (similarity === 100) {
            const congratsMessage = document.createElement("p");
            congratsMessage.textContent = "恭喜你猜对了！";
            congratsMessage.classList.add("congrats"); // 添加样式类名
            historyDiv.appendChild(congratsMessage);
            restartButton.style.display = "block"; // 显示重新开始按钮
            hintButton.style.display = "none"; // 显示重新开始按钮
            guessBox.style.display = "none";
            gameStarted = false;
        }
    }

    // 根据玩家选择排序历史记录
    function sortHistory() {
        const sortingOption = sortOption.value;

        if (sortingOption === "index") {
            sortHistoryByIndex();
        } else if (sortingOption === "similarity") {
            sortHistoryBySimilarity();
        }
    }

    // 根据序号排序历史记录
    function sortHistoryByIndex() {
      if (!historyDiv || historyDiv.children.length === 0) {
          return;
      }

        const historyItems = Array.from(historyDiv.children);
        historyItems.sort((a, b) => {
            const aIndex = a.order;
            const bIndex = b.order;
            return aIndex - bIndex;
        });

        historyItems.forEach((item) => historyDiv.appendChild(item));
    }

    // 根据相似度排序历史记录
    function sortHistoryBySimilarity() {
        if (!historyDiv || historyDiv.children.length === 0) {
            return;
        }

        const historyItems = Array.from(historyDiv.children);
        historyItems.sort((a, b) => {
            const aSimilarity = a.similarity;
            const bSimilarity = b.similarity;
            return bSimilarity - aSimilarity;
        });

        historyItems.forEach((item) => historyDiv.appendChild(item));
    }


    // 获取相似度排名
    function getRank(similarity) {
        const sortedCards = cardData
            .map((card) => calculateSimilarityScore(puzzleCard, card))
            .sort((a, b) => b - a);

        const rank = sortedCards.findIndex((score) => score === similarity) + 1;
        return rank;
    }

    function findCardByName(name) {
        return cardData.find((card) => card.card_name === name);
    }

    function getCardByRank(rank) {
      const sortedCards = cardData
        .map((card) => calculateSimilarityScore(puzzleCard, card))
        .sort((a, b) => b - a);

      if (rank <= 0 || rank > sortedCards.length) {
        return null; // Invalid rank, return null
      }

      const similarity = sortedCards[rank - 1];
      const cardIndex = sortedCards.indexOf(similarity);
      const card = cardData[cardIndex];

      return { similarity, card };
    }

    function getHintCardOptions(minScore) {
        const options = cardData.filter((card) => calculateSimilarityScore(puzzleCard, card) > minScore && calculateSimilarityScore(puzzleCard, card) < 100);

        // 将符合条件的卡牌按相似度从高到低排序
        options.sort((a, b) => {
            const similarityA = calculateSimilarityScore(puzzleCard, a);
            const similarityB = calculateSimilarityScore(puzzleCard, b);
            return similarityB - similarityA;
        });

        // 获取尾部的10%内的随机选项
        const startIndex = Math.floor(options.length * 0.9);
        const endIndex = options.length;
        const randomIndex = Math.floor(Math.random() * (endIndex - startIndex)) + startIndex;

        return options.length > 0 ? [options[randomIndex]] : [];
    }


    // 将猜测卡牌名称函数暴露给全局，以便在 HTML 中调用
    window.guessCardName = guessCardName;
});

function getCorrectionSuggestion(guess) {
  const maxSuggestions = 20;
  const suggestions = [];

  // 优先寻找和输入的错误卡名有最多相同字的卡
  for (const card of cardData) {
    if (card.card_name) {
      const numCommonChars = getNumCommonChars(card.card_name, guess);
      suggestions.push({ card_name: card.card_name, numCommonChars: numCommonChars });
    }
  }

  // 按相同字数降序排序
  suggestions.sort((a, b) => b.numCommonChars - a.numCommonChars);

  // 如果找到的卡名和输入的错误卡名有相同字，则将它们作为建议
  const correctionSuggestions = suggestions
    .filter(suggestion => suggestion.numCommonChars > 0)
    .slice(0, maxSuggestions)
    .map(suggestion => suggestion.card_name);

  // 如果建议不足 maxSuggestions 个，则继续使用 Levenshtein 距离来补充
  if (correctionSuggestions.length < maxSuggestions) {
    const remainingSuggestions = maxSuggestions - correctionSuggestions.length;
    for (const card of cardData) {
      if (card.card_name) {
        const distance = calculateLevenshteinDistance(card.card_name, guess);
        correctionSuggestions.push(card.card_name);
        if (correctionSuggestions.length === maxSuggestions) {
          break;
        }
      }
    }
  }

  return correctionSuggestions;
}

function getNumCommonChars(str1, str2) {
  let count = 0;
  for (const char of str1) {
    if (str2.includes(char)) {
      count++;
    }
  }
  return count;
}

function generateCurrentDateSeed() {
  const now = new Date();
  const year = now.getUTCFullYear().toString();
  const month = (now.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = now.getUTCDate().toString().padStart(2, '0');

  // 组合日期
  const dateSeed = year + month + day;

  // 使用 dateSeed 作为种子生成随机数
  Math.seedrandom(dateSeed);

  // 生成8位英文字母种子
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let seed = '';
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * letters.length);
    seed += letters[randomIndex];
  }

  return seed;
}
