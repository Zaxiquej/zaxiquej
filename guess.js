// guess.js
let cardPool = [];
let lastPacket = 10029;

document.addEventListener("DOMContentLoaded", function () {
    const guessButton = document.getElementById("guessButton");
    const guessInput = document.getElementById("guessInput");
    const suggestionsDiv = document.getElementById("suggestions");
    const historyDiv = document.getElementById("history");
    var historyTable = document.getElementById("historyTable");
    const historyDiv0 = document.getElementById("history0");
    const playBox = document.getElementById("playBox");
    const guessBox = document.getElementById("guessBox");
    const startBox = document.getElementById("startBox");
    const restartButton = document.getElementById("restartButton");
    const hintButton = document.getElementById("hintButton");
    const revealButton = document.getElementById("revealButton");
    const specifiedModeCheckbox = document.getElementById("specifiedModeCheckbox");
    const viewTop100Button = document.getElementById("viewTop100Button");
    const modal = document.getElementById("modal");
    const closeBtn = document.querySelector(".close");
    const top100Results = document.getElementById("top100Results");

    // 点击按钮显示假窗体
    viewTop100Button.addEventListener("click", function () {
      modal.style.display = "block";
      // 假设你有一个叫做 getTop100Results 的函数来获取前100名的结果
      const results = getTop100Results(puzzleCard); // 获取前100名的结果
      top100Results.innerHTML = results; // 显示在假窗体中
    });

    // 点击关闭按钮隐藏假窗体
    closeBtn.addEventListener("click", function () {
      modal.style.display = "none";
    });

    // 点击模态框外部隐藏假窗体
    window.addEventListener("click", function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });

    function getCardLink(cardId) {
        return `https://shadowverse-portal.com/card/${cardId}?lang=zh-tw`;
    }

    function getTop100Results(baseCard) {
      const sortedCards = cardPool
          .map((card) => {
              const similarity = calculateSimilarityScore(baseCard, card);
              return {
                  card_id: card.card_id,
                  card_name: card.card_name,
                  similarity: similarity,
                  basicScore: calculateSimilarityScore(baseCard, card, 1),
                  skillScore: calculateSimilarityScore(baseCard, card, 2),
                  descriptionScore: calculateDescriptionScore(baseCard, card),
              };
          })
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 100); // 只保留前100名
        // 格式化前100名结果
        const top100Results = sortedCards
            .map((card, index) => {
                const cardNameWithLink = `<a href="${getCardLink(card.card_id)}" target = "_blank">${card.card_name}</a>`;

                return `${index + 1}. ${cardNameWithLink} - 相似度：${card.similarity.toFixed(2)},<br><br>`; //- 相似度：${card.similarity.toFixed(2)}，基础分: ${card.basicScore.toFixed(2)}, 技能分: ${card.skillScore.toFixed(2)}, 描述分: ${card.descriptionScore.toFixed(2)}
            })
            .join("");

        return top100Results;
    }

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

  function addCardsFromLastPackets() {
    let cardSetIds = Array.from({ length: 5 }, (_, index) => lastPacket - index)
    cardSetIds.push(10000) //基础包

    cardSetIds.forEach(cardSetId => {
      const matchingCards = cardData.filter(card => card.card_set_id === cardSetId && !cardPool.includes(card));

      matchingCards.forEach(card => {
        if (!cardPool.includes(card)) {
          cardPool.push(card);

          // 查找并加入符合条件的技能卡
          addSkillOptionCards(card.skill_option);
        }
      });
    });
  }

  function addSkillOptionCards(skillOption) {
    const cardIdToFind = skillOption.match(/\d{9}/); // 使用正则表达式从技能选项中提取连续9位数字

    if (!cardIdToFind) {
      return; // 无效的技能选项
    }

    const matchingCard = cardData.find(card => card.card_id === cardIdToFind[0]);

    if (matchingCard && !cardPool.includes(matchingCard)) {
      if (matchingCard.card_id === baseCardId || matchingCard.card_id === "900811050") {
        cardPool.push(matchingCard);
        // 如果需要，可以递归地继续查找并加入新的技能卡
        addSkillOptionCards(matchingCard.skill_option);
      }
    }
  }

  function addSkillOptionCards(skillOption, baseCardId) {
    skillOption.replaceAll("&",",");
    const tokens = skillOption.split(","); // 分割技能选项

    tokens.forEach(token => {
      const matches = token.split("//")[0].split(")")[0].match(/(token_draw|summon_token|card_id)=([^&]+)/); // 从分割的段落中提取 token 信息

      if (matches && matches[2]) {
        const cardIds = matches[2].split(":"); // 分割 card_id

        cardIds.forEach(cardIdToFind => {
          const matchingCard = findCardById(parseInt(cardIdToFind));

          if (matchingCard && (matchingCard.card_id === matchingCard.base_card_id || matchingCard.base_card_id === "900811050")) {
            if (!cardPool.includes(matchingCard)) {
              cardPool.push(matchingCard);
              addSkillOptionCards(matchingCard.skill_option);
            }
          }
        });
      }
    });
  }
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

    if (specifiedModeCheckbox.checked) {
      cardPool = [];
      addCardsFromLastPackets();
    } else {
      cardPool = cardData;
    }

    // 初始化游戏逻辑，例如随机抽取一张卡牌作为解谜目标等
    const randomIndex = Math.floor(Math.random() * cardPool.length);
    puzzleCard = cardPool[randomIndex];
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
     if (specifiedModeCheckbox.checked) {
       document.getElementById("currentSeed").textContent = `当前种子：${seed}`;
       var strongElement = document.createElement("strong");
       strongElement.textContent = "（指定模式）";
       document.getElementById("currentSeed").appendChild(strongElement);
     } else {
       document.getElementById("currentSeed").textContent = `当前种子：${seed}`;
     }

    // 显示解谜开始信息
    const puzzleStartMessage = document.createElement("p");
    puzzleStartMessage.textContent = "解谜开始！系统已抽取一张卡牌，请猜测卡牌名称：";
    historyDiv0.appendChild(puzzleStartMessage);

    // 显示游戏界面
    hintButton.style.display = "block";
    revealButton.style.display = "block";

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

            // 创建表格元素和标题行
      historyTable = document.createElement("table");
      historyTable.id = "historyTable";
      historyTable.classList.add("history-table"); // 添加自定义样式类

      var thead = document.createElement("thead");
      var headerRow = document.createElement("tr");
      var headers = ["#", "卡牌", "相似度", "排名"];

      headers.forEach(function(headerText) {
        var th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
      });

      thead.appendChild(headerRow);

      var tbody = document.createElement("tbody");

      historyTable.appendChild(thead);
      historyTable.appendChild(tbody);

      // 将表格添加到历史记录容器
      historyDiv.appendChild(historyTable);

      historyDiv0.innerHTML = "";
      restartButton.style.display = "none";
      viewTop100Button.style.display = "none";
      hintButton.style.display = "none";
      revealButton.style.display = "none";
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

        guessCardName(guess,true);
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

            time++;

            var hintMessageRow = document.createElement("tr");
            var timeCell = document.createElement("td");
            timeCell.textContent = `提示${time}`;
            var cardCell = document.createElement("td");
            var cardLink = document.createElement("a");
            cardLink.href = `https://shadowverse-portal.com/card/${hintCard.card_id}?lang=zh-tw`;
            cardLink.target = "_blank";
            cardLink.textContent = hintCard.card_name;
            cardCell.appendChild(cardLink);
            var similarityCell = document.createElement("td");
            similarityCell.textContent = similarity.toFixed(2);

            // 计算相似度值在0到100之间的百分比
            var similarityPercentage = (similarity / 100) * 100;

            // 将百分比映射到颜色渐变，从较浅的颜色到红色
            var redValue = Math.round(255);
            var greenValue = Math.round(255 * ((100 - similarityPercentage) / 100));

            // 设置单元格文字颜色
            similarityCell.style.color = `rgb(${redValue}, ${greenValue}, ${greenValue})`;


            var rankCell = document.createElement("td");
            rankCell.textContent = rank;

            hintMessageRow.appendChild(timeCell);
            hintMessageRow.appendChild(cardCell);
            hintMessageRow.appendChild(similarityCell);
            hintMessageRow.appendChild(rankCell);

            hintMessageRow.card_id = hintCard.card_id;
            hintMessageRow.similarity = similarity;
            hintMessageRow.order = time;

            // 添加到表格中
            historyTable.appendChild(hintMessageRow);

            hintMessageRow.classList.add("highlight");
            // 如果之前有上一条猜测，移除其高亮样式
            if (previousGuess) {
              previousGuess.classList.remove("highlight");
            }
            // 更新上一条猜测为当前猜测
            previousGuess = hintMessageRow;

            if (similarity > highestScore){
              highestScore = similarity;
            }
            historyTable.appendChild(hintMessageRow);
            //historyDiv.appendChild(hintMessage);
            sortHistory();

            tipBox.style.display = "block";
            setTimeout(() => {
              tipBox.style.opacity = "0";
            }, 1000);
            setTimeout(() => {
              tipBox.style.display = "none";
              tipBox.style.opacity = "1";
            }, 2000);
        }
    });

    revealButton.addEventListener("click", function () {
        if (!puzzleCard) {
            alert("请先点击“解谜开始”按钮开始解谜！");
            return;
        }
        let confirmResult = window.confirm("你确定要揭露答案吗？");

        if (confirmResult) {
          confirmResult = window.confirm("你真的确定要揭露答案吗？");
          if (confirmResult){
            const hintCard = puzzleCard;
            const similarity = calculateSimilarityScore(puzzleCard, hintCard);
            const rank = getRank(similarity);

            time++;

            var hintMessageRow = document.createElement("tr");
            var timeCell = document.createElement("td");
            timeCell.textContent = `答案：`;
            var cardCell = document.createElement("td");
            var cardLink = document.createElement("a");
            cardLink.href = `https://shadowverse-portal.com/card/${hintCard.card_id}?lang=zh-tw`;
            cardLink.target = "_blank";
            cardLink.textContent = hintCard.card_name;
            cardCell.appendChild(cardLink);
            var similarityCell = document.createElement("td");
            similarityCell.textContent = similarity.toFixed(2);

            // 计算相似度值在0到100之间的百分比
            var similarityPercentage = (similarity / 100) * 100;

            // 将百分比映射到颜色渐变，从较浅的颜色到红色
            var redValue = Math.round(255);
            var greenValue = Math.round(255 * ((100 - similarityPercentage) / 100));

            // 设置单元格文字颜色
            similarityCell.style.color = `rgb(${redValue}, ${greenValue}, ${greenValue})`;


            var rankCell = document.createElement("td");
            rankCell.textContent = rank;

            hintMessageRow.appendChild(timeCell);
            hintMessageRow.appendChild(cardCell);
            hintMessageRow.appendChild(similarityCell);
            hintMessageRow.appendChild(rankCell);

            hintMessageRow.card_id = hintCard.card_id;
            hintMessageRow.similarity = similarity;
            hintMessageRow.order = time;

            // 添加到表格中


            hintMessageRow.classList.add("highlight");
            // 如果之前有上一条猜测，移除其高亮样式
            if (previousGuess) {
              previousGuess.classList.remove("highlight");
            }
            // 更新上一条猜测为当前猜测
            previousGuess = hintMessageRow;

            if (similarity > highestScore){
              highestScore = similarity;
            }
            historyTable.appendChild(hintMessageRow);
            sortHistory();
            gameEnd(false);
          }
        }

    });

    function splitNumber(input) {
      const minLength = 3;
      const maxLength = 6;

      if (typeof input !== 'string' || input.length < minLength || input.length > maxLength) {
        throw new Error('Input must be a string of length 3 to 6.');
      }

      const digits = input.split('').map(Number);
      const result = [];
      for (let i = 1; i < digits.length; i++) {
        const num1 = parseInt(digits.slice(0, i).join(''), 10);
        if (num1 > 0 && num1 <= 30 && digits[i] != 0) {
          for (let j = i + 1; j < digits.length; j++) {
            const num2 = parseInt(digits.slice(i, j).join(''), 10);
            if (num2 > 0 && num2 <= 30 && digits[j] != 0) {
              const num3 = parseInt(digits.slice(j).join(''), 10);
              if (num3 > 0 && num3 <= 30) {
                result.push(num1, num2, num3);
                return result;
              }
            }
          }
        }
      }

      throw new Error('No valid split found.');
    }
    function extractKey(guess) {
      const professionMapping = {
        '中立': 0,
        '妖': 1,
        '皇': 2,
        '法': 3,
        '龙': 4,
        '死': 5,
        '鬼': 6,
        '教': 7,
        '仇': 8
      };

      const fuzzyProfessionMapping = {
        '妖精': '妖', // 可以添加更多类似的映射
      };

      const rarityMapping = {
        '铜': 1,
        '银': 2,
        '金': 3,
        '虹': 4
      };

      // 对输入进行预处理，将匹配词替换为对应的模糊匹配词
       for (const fuzzyKeyword in fuzzyProfessionMapping) {
         guess = guess.replaceAll(fuzzyKeyword, fuzzyProfessionMapping[fuzzyKeyword]);
       }


      const regexWithStats = /^(中立|妖|皇|法|龙|死|鬼|教|仇)?(铜|银|金|虹)?(\d{3,6})$(铜|银|金|虹)?/;
      const regexWithoutStats = /^(中立|妖|皇|法|龙|死|鬼|教|仇)?(铜|银|金|虹)?(?:(\d+)费)?(?:(\d+)攻)?(?:(\d+)血)?(法术|随从|护符)?$(铜|银|金|虹)?/;

      const matchWithStats = guess.match(regexWithStats);
      const matchWithoutStats = guess.match(regexWithoutStats);

      let cardInfo = {};
      if (matchWithStats) {
        const [, profession, rarity, stats] = matchWithStats;

        if (profession) cardInfo.clan = professionMapping[profession];
        if (rarity) cardInfo.rarity = rarityMapping[rarity];
        cardInfo.char_type = '随从';
        if (stats) {
          let numbs = splitNumber(stats);
          cardInfo.cost = parseInt(numbs[0]);
          cardInfo.atk = parseInt(numbs[1]);
          cardInfo.life = parseInt(numbs[2]);
        }

        return cardInfo;
      } else if (matchWithoutStats) {
        const [, profession, rarity, cost, attack, health, type] = matchWithoutStats;

        if (profession) cardInfo.clan = professionMapping[profession];
        if (rarity) cardInfo.rarity = rarityMapping[rarity];
        if (cost) cardInfo.cost = parseInt(cost);
        if (attack) cardInfo.atk = parseInt(attack);
        if (health) cardInfo.life = parseInt(health);
        if (type) cardInfo.char_type = type;

        return cardInfo;
      } else {
        return null; // 输入不符合格式要求
      }
    }


    function guessCardName(guess,defau) {
        if (!puzzleCard) {
            alert("请先点击“解谜开始”按钮开始解谜！");
            return;
        }

        let foundCard = findCardByName(guess);

        if (!foundCard || defau) {
          let extract = extractKey(guess);
          let correctionSuggestions;
          if (extract){
             correctionSuggestions = getCorrectionSuggestion(extract,true);
          } else {
             correctionSuggestions = getCorrectionSuggestion(guess,false);
          }

          if (correctionSuggestions) {
            const suggestionHTML = correctionSuggestions
              .map(suggestion => `<button class="suggestionBtn" data-suggestion="${suggestion}">${suggestion}</button>`)
              .join("");

            suggestionsDiv.innerHTML = suggestionHTML;

            const suggestionBtns = document.querySelectorAll(".suggestionBtn");
            suggestionBtns.forEach(btn => {
              btn.addEventListener("mouseover", async function () {
                const suggestion = btn.getAttribute("data-suggestion");
                const cardData = await findCardByName(suggestion);
                const imageURL = `https://shadowverse-portal.com/image/card/phase2/common/C/C_${cardData.card_id}.png`;

                btn.style.backgroundImage = `url(${imageURL})`;
              });

              btn.addEventListener("mouseout", function () {
                btn.style.backgroundImage = "none"; // 清空背景图
              });

              btn.addEventListener("click", function () {
                guessInput.value = btn.textContent;
                suggestionsDiv.innerHTML = "";
                guessCardName(guessInput.value);
              });
            });

            // 设置按钮组样式
            const rows = Math.ceil(correctionSuggestions.length / 5); // 总共需要的行数
            const cols = Math.min(5, correctionSuggestions.length); // 每行最多按钮数

            const gapBetweenButtons = "2px"; // 根据需要调整此值

            suggestionsDiv.style.display = "grid";
            suggestionsDiv.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            suggestionsDiv.style.gridTemplateRows = `repeat(${rows}, auto)`;
            suggestionsDiv.style.justifyItems = "center"; // 每个按钮水平居中
            suggestionsDiv.style.alignItems = "center"; // 每个按钮垂直居中
            suggestionsDiv.style.gap = "5px"; // 按钮之间的空隙
            // 整体居中
            suggestionsDiv.style.textAlign = "center";
            // 限制最大宽度
            suggestionsDiv.style.maxWidth = "800px";
            suggestionsDiv.style.margin = "0 auto"; // 居中显示
            suggestionsDiv.style.marginTop = "10px";
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

        var resultMessageRow = document.createElement("tr");
        var timeCell = document.createElement("td");
        timeCell.textContent = `猜测${time}`;
        var cardCell = document.createElement("td");
        var cardLink = document.createElement("a");
        cardLink.href = `https://shadowverse-portal.com/card/${foundCard.card_id}?lang=zh-tw`;
        cardLink.target = "_blank";
        cardLink.textContent = foundCard.card_name;
        cardCell.appendChild(cardLink);
        var similarityCell = document.createElement("td");
        similarityCell.textContent = similarity.toFixed(2);

        // 计算相似度值在0到100之间的百分比
        var similarityPercentage = (similarity / 100) * 100;

        // 将百分比映射到颜色渐变，从较浅的颜色到红色
        var redValue = Math.round(255);
        var greenValue = Math.round(255 * ((100 - similarityPercentage) / 100));

        // 设置单元格文字颜色
        similarityCell.style.color = `rgb(${redValue}, ${greenValue}, ${greenValue})`;


        var rankCell = document.createElement("td");
        rankCell.textContent = rank;

        resultMessageRow.appendChild(timeCell);
        resultMessageRow.appendChild(cardCell);
        resultMessageRow.appendChild(similarityCell);
        resultMessageRow.appendChild(rankCell);

        resultMessageRow.card_id = foundCard.card_id;
        resultMessageRow.similarity = similarity;
        resultMessageRow.order = time;

        resultMessageRow.classList.add("highlight");
        // 如果之前有上一条猜测，移除其高亮样式
        if (previousGuess) {
          previousGuess.classList.remove("highlight");
        }
        // 更新上一条猜测为当前猜测
        previousGuess = resultMessageRow;

        if (similarity > highestScore){
          highestScore = similarity;
        }
        historyTable.appendChild(resultMessageRow);
        sortHistory();

        guessInput.value = "";
        if (parseInt(similarity) === 100) {
            gameEnd(true);
        }
    }

    function gameEnd(win){

      if (win){
        const congratsMessage = document.createElement("p");
        congratsMessage.textContent = "恭喜你猜对了！";
        congratsMessage.classList.add("congrats"); // 添加样式类名
        historyDiv.appendChild(congratsMessage);
      } else {
        const congratsMessage = document.createElement("p");
        congratsMessage.textContent = "答案已经揭晓。";
        congratsMessage.classList.add("congrats"); // 添加样式类名
        historyDiv.appendChild(congratsMessage);
      }

      restartButton.style.display = "block"; // 显示重新开始按钮
      viewTop100Button.style.display = "block";
      hintButton.style.display = "none"; // 显示重新开始按钮
      revealButton.style.display = "none"; // 显示重新开始按钮
      guessBox.style.display = "none";
      gameStarted = false;
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
      if (!historyTable || historyTable.children.length === 0) {
          return;
      }

        const historyItems = Array.from(historyTable.children);
        historyItems.sort((a, b) => {
            const aIndex = a.order;
            const bIndex = b.order;
            return aIndex - bIndex;
        });

        historyItems.forEach((item) => historyTable.appendChild(item));
    }

    // 根据相似度排序历史记录
    function sortHistoryBySimilarity() {
        if (!historyTable || historyTable.children.length === 0) {
            return;
        }

        const historyItems = Array.from(historyTable.children);
        historyItems.sort((a, b) => {
            const aSimilarity = a.similarity;
            const bSimilarity = b.similarity;
            return bSimilarity - aSimilarity;
        });

        historyItems.forEach((item) => historyTable.appendChild(item));
    }


    // 获取相似度排名
    function getRank(similarity) {
        const sortedCards = cardPool
            .map((card) => calculateSimilarityScore(puzzleCard, card))
            .sort((a, b) => b - a);

        const rank = sortedCards.findIndex((score) => score === similarity) + 1;
        return rank;
    }

    function findCardByName(name) {
        return cardPool.find((card) => card.card_name === name);
    }

    function getCardByRank(rank) {
      const sortedCards = cardPool
        .map((card) => calculateSimilarityScore(puzzleCard, card))
        .sort((a, b) => b - a);

      if (rank <= 0 || rank > sortedCards.length) {
        return null; // Invalid rank, return null
      }

      const similarity = sortedCards[rank - 1];
      const cardIndex = sortedCards.indexOf(similarity);
      const card = cardPool[cardIndex];

      return { similarity, card };
    }

    function getHintCardOptions(minScore) {
        const options = cardPool.filter((card) => calculateSimilarityScore(puzzleCard, card) > minScore && calculateSimilarityScore(puzzleCard, card) < 100);

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

function getCorrectionSuggestion(guess,isExtract) {
  const maxSuggestions = 20;
  const suggestions = [];

  // 优先寻找和输入的错误卡名有最多相同字的卡
  if (isExtract){
    for (const card of cardPool) {
      let bad = false;
      for (let key of ["clan","rarity","cost","atk","life","char_type"]){
        if (key == "char_type"){
          if (guess[key] == "随从" && card[key] != 1){
            bad = true;
            break;
          }
          if (guess[key] == "法术" && card[key] != 4){
            bad = true;
            break;
          }
          if (guess[key] == "护符" && ![2,3].includes(card[key])){
            bad = true;
            break;
          }
        } else {
          if (guess[key] && card[key] != guess[key]){
            bad = true;
            break;
          }
        }
      }
      if (!bad){
        suggestions.push({ card_name: card.card_name, pack: card.card_set_id })
      }
    }

    // 按相同字数降序排序
    suggestions.sort((a, b) => b.pack - a.pack);
  } else {
    for (const card of cardPool) {
      if (card.card_name) {
        const numCommonChars = getNumCommonChars(card.card_name, guess);
        suggestions.push({ card_name: card.card_name, numCommonChars: numCommonChars });
      }
    }

    // 按相同字数降序排序
    suggestions.sort((a, b) => b.numCommonChars - a.numCommonChars);
  }


  // 如果找到的卡名和输入的错误卡名有相同字，则将它们作为建议
  let correctionSuggestions;

  if (isExtract){
    correctionSuggestions = suggestions
      .slice(0, maxSuggestions)
      .map(suggestion => suggestion.card_name);
  } else {
    correctionSuggestions = suggestions
      .filter(suggestion => suggestion.numCommonChars > 0)
      .slice(0, maxSuggestions)
      .map(suggestion => suggestion.card_name);
  }

  // 如果建议不足 maxSuggestions 个，则继续使用 Levenshtein 距离来补充
  if (correctionSuggestions.length < maxSuggestions && !isExtract) {
    const remainingSuggestions = maxSuggestions - correctionSuggestions.length;
    for (const card of cardPool) {
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

  // 转换为北京时间
  now.setHours(now.getHours() + 8);

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
