// guess.js

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

document.addEventListener("DOMContentLoaded", function () {
    const puzzleStartButton = document.getElementById("puzzleStartButton");
    const guessButton = document.getElementById("guessButton");
    const guessInput = document.getElementById("guessInput");
    const suggestionsDiv = document.getElementById("suggestions");
    const historyDiv = document.getElementById("history");
    const playBox = document.getElementById("playBox");
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

    // 显示/隐藏“解谜开始”按钮
    playBox.style.display = "none";
    sortOptions.style.display = "none";
    sortButton.addEventListener("click", sortHistory);

        // 重新开始按钮
    const restartButton = document.createElement("button");
    restartButton.textContent = "重新开始";
    restartButton.addEventListener("click", restartGame);
    restartButton.style.display = "none";
    playBox.appendChild(restartButton);

    function restartGame() {
        gameStarted = false;
        puzzleCard = null;
        time = 0;
        highestScore = 0;
        historyDiv.innerHTML = "";
        puzzleStartButton.style.display = "block";
        sortOptions.style.display = "none";
        playBox.style.display = "none";
    }

    puzzleStartButton.addEventListener("click", function () {
        // 随机抽取一张卡牌作为解谜目标
        const randomIndex = Math.floor(Math.random() * cardData.length);
        puzzleCard = cardData[randomIndex];

        // 清空历史记录
        historyDiv.innerHTML = "";
        puzzleStartButton.style.display = "none";
        sortOptions.style.display = "block";
        playBox.style.display = "block";

        // 显示解谜开始信息
        const puzzleStartMessage = document.createElement("p");
        puzzleStartMessage.textContent = "解谜开始！系统已抽取一张卡牌，请猜测卡牌名称：";
        puzzleStartMessage.similarity = 9999;
        puzzleStartMessage.order = 0;
        historyDiv.appendChild(puzzleStartMessage);

    });

    guessButton.addEventListener("click", function () {
        const guess = guessInput.value.trim();
        if (guess === "") {
            alert("请输入猜测的卡牌名称！");
            return;
        }

        guessCardName(guess);
    });

    // 提示按钮
    const hintButton = document.createElement("button");
    hintButton.textContent = "提示";
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
    playBox.appendChild(hintButton);

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

    function getHintCardOptions(minScore) {
        const options = cardData.filter((card) => calculateSimilarityScore(puzzleCard, card) >= minScore);

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
