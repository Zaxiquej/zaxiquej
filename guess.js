// guess.js

document.addEventListener("DOMContentLoaded", function () {
    const puzzleStartButton = document.getElementById("puzzleStartButton");
    const guessButton = document.getElementById("guessButton");
    const guessInput = document.getElementById("guessInput");
    const historyDiv = document.getElementById("history");
    const playBox = document.getElementById("playBox");
    let cardData = portal.data.cards; // 存储所有卡片数据
    let puzzleCard = null; // 存储解谜时随机抽取的卡牌

    let gameStarted = false;

    // 排序选项和按钮
    const sortOptions = document.getElementById("sortingOptions");
    const sortOption = document.getElementById("sortOption");
    const sortButton = document.getElementById("sortButton");

    // 显示/隐藏“解谜开始”按钮
    playBox.style.display = "none";
    sortOptions.style.display = "none";
    sortButton.addEventListener("click", sortHistory);

        // 重新开始按钮
    const restartButton = document.createElement("button");
    restartButton.textContent = "重新开始";
    restartButton.addEventListener("click", restartGame);
    restartButton.style.display = "none";
    historyDiv.appendChild(restartButton);

    function restartGame() {
        gameStarted = false;
        puzzleCard = null;
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
        historyDiv.appendChild(puzzleStartMessage);

    });

    guessButton.addEventListener("click", function () {
        const guess = guessInput.value.trim();
        if (guess === "") {
            alert("请输入猜测的卡牌名称！");
            return;
        }

        guessCardName(guess);
        guessInput.value = "";
    });

    function guessCardName(guess) {
        if (!puzzleCard) {
            alert("请先点击“解谜开始”按钮开始解谜！");
            return;
        }

        let foundCard = findCardByName(guess);

        if (!foundCard) {
            // 如果找不到，尝试使用繁体中文搜索
            const tradChineseGuess = traditionalized(guess);
            const foundTradCard = findCardByName(tradChineseGuess);
            if (foundTradCard) {
                foundCard = foundTradCard;
            } else {
              alert("未找到相应的卡牌，请检查输入的名称是否正确。");
              return;
            }
        }
        if (!foundCard) {

        }

        const similarity = calculateSimilarityScore(puzzleCard, foundCard);
        const rank = getRank(similarity);

        const resultMessage = document.createElement("p");
        resultMessage.textContent = `猜测：${guess}，相似度：${similarity.toFixed(2)}，排名：${rank}`;
        historyDiv.appendChild(resultMessage);

        if (similarity === 100) {
            const congratsMessage = document.createElement("p");
            congratsMessage.textContent = "恭喜你猜对了！";
            historyDiv.appendChild(congratsMessage);
            restartButton.style.display = "block"; // 显示重新开始按钮
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
            const aIndex = parseInt(a.textContent.match(/\d+/)[0]);
            const bIndex = parseInt(b.textContent.match(/\d+/)[0]);
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
            const aSimilarity = parseFloat(a.textContent.match(/\d+\.\d+/)[0]);
            const bSimilarity = parseFloat(b.textContent.match(/\d+\.\d+/)[0]);
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
        return portal.data.cards.find((card) => card.card_name === name);
    }
    // 将猜测卡牌名称函数暴露给全局，以便在 HTML 中调用
    window.guessCardName = guessCardName;
});
