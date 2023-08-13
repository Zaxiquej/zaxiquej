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
            let info = {
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
            if (info.card_id == 900144120){
              info.skill = "attach_skill,attach_skill,attach_skill";
            }
            if (info.card_id == 111041020){
              info.skill_option = "none,add=-3";
            }
            if (info.card_id == 900534030){
              info.skill_disc = "使1个敌方的从者失去所有能力（攻击力/生命值的效果不受影响）。使该从者的攻击力/生命值分别转变为0/1。<br>随机给予1个自己的布丁幽灵·宫子+3/+3效果。";
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
});

function findCardByName(name) {
    return cardData.find((card) => card.card_name === name);
}

function createNewDataBase(allcards, subToken) {
    // 假设 allcards 是一个包含所有卡片数据的变量

    // 要保留的信息字段
    const keepFields = [
        'atk',
        'base_card_id',
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

    const replaceRules = [
      ["鍊金", "炼金"],
      ["项鍊", "项链"],
      ["葛兰", "古兰"],
      ["壹剑","苇剑"]
      // 可以继续添加更多的规则
    ];

        // 使用替换规则来替换文本
    function replaceTextWithRules(text, rules) {
      let newText = text;

      rules.forEach(rule => {
        const [search, replace] = rule;
        newText = newText.split(search).join(replace);
      });

      return newText;
    }
    // 用于存储最终的卡片数据
    const uniqueCardsMap = new Map();

    // 遍历所有卡片数据
    allcards.cards.forEach(card => {
        // 如果卡片名称不为空且card_set_id在70000和80000之间
        if (subToken == 1){
          if (card.card_name == null || (card.base_card_id != card.card_id && card.base_card_id != 900811050)) {
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
                    if (card[field] != null){
                      newField = japToSimplized(simplized(card[field]));
                      newCard[field] = replaceTextWithRules(newField,replaceRules);
                    }
                  } else{
                    let newField = japToSimplized(simplized(card[field]));
                    newCard[field] = replaceTextWithRules(newField,replaceRules);
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

function combineTiming(aData) {
    // 更新allcards中的数据
    for (const card of aData) {
        const csvEntry = timingData.find(entry => parseInt(entry.id) === card.card_id);
        if (csvEntry) {
            if (!csvEntry.timing.includes(card.skill_condition) && !card.skill_condition.includes(csvEntry)){
              card.timing = csvEntry.timing;
            } else {
              card.timing = csvEntry.timingSub;
            }
        }
    }

    // 创建Blob对象并下载
    const jsonData = JSON.stringify(aData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = 'new_database.json';
    downloadLink.textContent = '点击此处下载新的数据库文件';
    document.body.appendChild(downloadLink);
}

let aEntries;
function checkKeyNameStats(){
  // 将对象的属性名和值存储为 [key, value] 数组
  aEntries = keyNameStats();
  let vectorEntries = Object.entries(keyNameStats());

  // 创建Blob对象并下载
  const jsonData = JSON.stringify(aEntries, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = 'new_database.json';
  downloadLink.textContent = '点击此处下载新的数据库文件';
  document.body.appendChild(downloadLink);

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

function getCardByRank(puzzleCard, rank) {
  const sortedCards = cardData
    .map((card) => ({ similarity: calculateSimilarityScore(puzzleCard, card), card }))
    .sort((a, b) => b.similarity - a.similarity);

  if (rank <= 0 || rank > sortedCards.length) {
    return null; // Invalid rank, return null
  }

  const cardInfo = sortedCards[rank - 1];
  const cardName = cardInfo.card.card_name;

  return { similarity: cardInfo.similarity, card: cardName };
}


function getAllCardsLowRate(){
  let forceStop = 100;
  let p = 0;
  for (let card of cardData){
    forceStop--;
    let cardGet = getCardByRank(card,2);
    let sim = cardGet.similarity;
    let card2 = cardGet.card;
    if (sim < 55){
        if (sim < 45){
          if (sim < 35){
            console.log("Extreme Warning:"+card.card_name, card2, sim);
          } else {
            console.log("Warning:"+card.card_name, card2, sim);
          }
        } else {
          console.log("Notice:"+card.card_name, card2, sim);
        }
    }
    if (forceStop == 0){
      forceStop = 100;
      p++;
      console.log("Process:" + p*100 + " / " + cardData.length);
    }
  }
}
