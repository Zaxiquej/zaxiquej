document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("searchButton");
    const sortButton = document.getElementById("sortButton");
    const resultDiv = document.getElementById("result");

    sortButton.addEventListener("click", function () {
        const searchTerm = searchInput.value.trim();
        if (searchTerm === "") {
            resultDiv.innerHTML = "<p>请输入要搜索的卡名</p>";
            return;
        }

        const foundCard = findCardByName(searchTerm);
        if (!foundCard) {
            // 如果找不到，尝试使用繁体中文搜索
            const tradChineseSearchTerm = searchTerm.replaceAll("·","‧")//traditionalized(searchTerm);
            const foundTradCard = findCardByName(tradChineseSearchTerm);
            if (foundTradCard) {
                sortAndDisplayCards(foundTradCard);
            } else {
                resultDiv.innerHTML = "<p>未找到相应卡片</p>";
            }
        } else {
            sortAndDisplayCards(foundCard);
        }
    });

    function sortAndDisplayCards(baseCard) {
        // 计算相似分，并根据相似分从高到低排序
        const sortedCards = cardData
            .map((card) => {
                const similarity = calculateSimilarityScore(baseCard, card);
                return {
                    card_name: card.card_name,
                    basicScore: calculateSimilarityScore(baseCard, card,1),
                    skillScore: calculateSimilarityScore(baseCard, card,2),
                    descriptionScore: calculateDescriptionScore(baseCard, card),
                    similarity: similarity,
                };
            })
            .sort((a, b) => b.similarity - a.similarity);

        // 显示每张卡得到的基础分和描述分
        const cardListHTML = sortedCards
            .map((card) => `<li>${card.card_name} - 相似度：${card.similarity.toFixed(2)} 基础分: ${card.basicScore.toFixed(2)}, 技能分: ${card.skillScore.toFixed(2)}, 描述分: ${card.descriptionScore.toFixed(2)}</li>`)
            .join("");
        resultDiv.innerHTML = `<ul>${cardListHTML}</ul>`;
    }

    function extractCardInfo(cards) {
        const cardInfo = [];
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const info = {
                card_id: card.card_id,
                card_name: card.card_name,
                char_type: card.char_type,
                clan: card.clan,
                cost: card.cost,
                skill_disc: card.skill_disc,
                evo_skill_disc: card.evo_skill_disc,
                tribe_name: card.tribe_name,
                rarity: card.rarity,
                atk: card.atk,
                life: card.life,
                evo_atk: card.evo_atk,
                evo_life: card.evo_life
            }
            if (info.card_name == "森罗万象的爱"){
              info.skill = "attach_skill,attach_skill,attach_skill";
            }
            if (info.card_name == "异界统领者"){
              info.skill_option = "none,add=-3";
            }

            cardInfo.push(info);
        }

        return cardInfo;
    }

    function displayData(cardInfo) {
        const cardListHTML = cardInfo
            .map((card) => `<li>${JSON.stringify(card)}</li>`)
            .join("");
        resultDiv.innerHTML = `<ul>${cardListHTML}</ul>`;
    }

    function findCardByName(name) {
        return cardData.find((card) => card.card_name === name);
    }
});

function createNewDataBase(allcards, subToken) {
    // 假设 allcards 是一个包含所有卡片数据的变量

    // 要保留的信息字段
    const keepFields = [
        'atk',
        'card_id',
        'card_name',
        'card_set_id',
        'char_type',
        'clan',
        'cost',
        'evo_atk',
        'evo_life',
        'evo_skill_disc',
        'life',
        'rarity',
        'skill',
        'skill_condition',
        'skill_preprocess',
        'skill_disc',
        'skill_option',
        'skill_target',
        'tribe_name'
    ];

    const removal = ["灵魂嚮导‧艾米","黑天月兔妖‧菈米娜","初音未来","暗魔女将‧艾瑟菈","夜空吸血鬼‧卡媞亚","绝望的救赎·贞德"];
    // 用于存储最终的卡片数据
    const uniqueCardsMap = new Map();

    // 遍历所有卡片数据
    allcards.cards.forEach(card => {
        // 如果卡片名称不为空且card_set_id在70000和80000之间
        if (subToken == 1){
          if (card.card_name == null) {
            uniqueCardsMap.set(card.card_id, card);
          }
        } else {
          if (card.card_name !== null && (card.base_card_id == card.card_id || card.base_card_id == 900811050) && (card.card_set_id < 70000 || card.card_set_id > 80000)) {
              if (uniqueCardsMap.has(card.card_name)) {
                  const existingCard = uniqueCardsMap.get(card.card_name);
                  // 保留card_id较小的卡片
                  if (card.card_id < existingCard.card_id) {
                      uniqueCardsMap.set(card.card_name, card);
                  }
              } else {
                  uniqueCardsMap.set(card.card_name, card);
              }
          }
        }

    });

    // 将新的数据库转换为JSON格式
    const newDatabase = Array.from(uniqueCardsMap.values())
        .map(card => {
            const newCard = {};
            keepFields.forEach(field => {
                if (typeof card[field] == 'number'){
                  newCard[field] = card[field];
                } else {
                  if (subToken == 1){
                    let newField = card[field];
                    newCard[field] = newField;
                  } else{
                    let newField = simplized(card[field]);
                    newCard[field] = newField;
                  }

                }
            });
            return newCard;
        });

    // 创建一个Blob对象
    const jsonData = JSON.stringify(newDatabase, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });

    // 创建一个URL对象
    const url = URL.createObjectURL(blob);

    // 创建一个链接并添加到页面
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'new_database.json'; // 下载文件的名称
    downloadLink.textContent = '点击此处下载新的数据库文件';
    document.body.appendChild(downloadLink);
}

function checkKeyNameStats(){
  // 将对象的属性名和值存储为 [key, value] 数组
  const vectorEntries = Object.entries(keyNameStats());

  // 按照属性值的大小进行排序
  vectorEntries.sort((a, b) => a[1] - b[1]);

  // 创建一个<ul>元素来显示排序后的属性
  const ulElement = document.createElement('ul');

  // 循环遍历排序后的属性，创建<li>元素并添加到<ul>中
  for (const entry of vectorEntries) {
    const liElement = document.createElement('li');
    liElement.textContent = `${entry[0]}: ${entry[1]}`;
    ulElement.appendChild(liElement);
  }

  // 将<ul>元素添加到页面
  document.body.appendChild(ulElement);
}
