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
                    basicScore: calculateBasicScore(baseCard, card),
                    skillScore: calculateSkillScore(baseCard, card),
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

function createNewDataBase(allcards) {
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
        if (card.card_name !== null && card.card_id == card.base_card_id && (card.card_set_id < 70000 || card.card_set_id > 80000)) {
            // 如果已经存在相同名称的卡片
            if (uniqueCardsMap.has(card.card_name)) {
                const existingCard = uniqueCardsMap.get(card.card_name);
                // 保留card_id较小的卡片
                if (card.card_id < existingCard.card_id) {
                    uniqueCardsMap.set(card.card_name, card);
                }
            } else {
                // 否则将卡片添加到uniqueCardsMap
                uniqueCardsMap.set(card.card_name, card);
            }
        }
    });

    const replaceMap = {
	    葛兰的觉悟: "古兰的觉悟",
      神祕: "神秘",
      库胡林: "库丘林",
      鲜豔: "鲜艳",
      姦淫: "狂欲",
      殭尸: "僵尸",
      勇勐: "勇猛",
      阴鬱: "阴郁",
      治癒: "治愈",
      嚮导: "向导",
      味琳: "米琳",
      吸血鬼公主: "暗夜族公主",
      闇影: "暗影",

      // 添加其他的映射关系
    };

    // 将新的数据库转换为JSON格式
    const newDatabase = Array.from(uniqueCardsMap.values())
        .map(card => {
            const newCard = {};
            keepFields.forEach(field => {
                if (typeof card[field] == 'number'){
                  newCard[field] = card[field];
                } else {
                  let newField = simplized(card[field]);
                  for (const keyword in replaceMap) {
                    newField = newField.replaceAll(keyword, replaceMap[keyword]);
                  }
                  newCard[field] = newField;
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
