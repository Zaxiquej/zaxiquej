function getRealCardName(item) {
  if (item.card_name) {
    return item.card_name;
  } else {
    for (let itemD of cardData){
      var skillArray = itemD.skill.split(",");
      var skillOArray = itemD.skill_option.split(",");

      for (var i = 0; i < skillArray.length; i++) {
        if (skillArray[i] === "transform") {
          if (skillOArray[i].includes(item.card_id)) {
            return itemD.card_name;
          }
        }
      }
    }
    return "???";
  }
}

function getRealCardID(item) {
  if (item.card_name) {
    return item.card_id;
  } else {
    for (let itemD of cardData){
      var skillArray = itemD.skill.split(",");
      var skillOArray = itemD.skill_option.split(",");

      for (var i = 0; i < skillArray.length; i++) {
        if (skillArray[i] === "transform") {
          if (skillOArray[i].includes(item.card_id)) {
            return itemD.card_id;
          }
        }
      }
    }
    return "???";
  }
}

function getCardLink(cardId) {
    return `https://shadowverse-portal.com/card/${cardId}?lang=zh-tw`.replace(",","");
}

function printTokenUsage() {
  var resultDiv = document.getElementById("result");
  resultDiv.innerHTML = ''; // 清除现有内容

  // 合并两个数组中的对象
  var allData = cardData.concat(subCardData);

  // 1. 提取所有的9位数字并记录频率
  var digitPattern = /\b\d{9}\b/g;
  var allDigits = allData.map(item => ([getRealCardName(item),getRealCardID(item),(item.skill_option.match(digitPattern) || []).concat(item.skill_target.match(digitPattern))] || ["",[]]));
  var frequencyMap = {};
  var callerMap = {};
  var callerIDMap = {};

  allDigits.forEach(digit => {
    if (digit[2] && digit[0] != "???"){
      for (let id of digit[2]){
        if (!id){
          continue;
        }
        if (callerMap[id] == undefined){
          callerMap[id] = [];
          callerIDMap[id] = [];
        }
        if (!callerMap[id].includes(digit[0])){
          callerMap[id].push(digit[0]);
          callerIDMap[id].push(digit[1]);
          frequencyMap[id] = (frequencyMap[id] || 0) + 1;
        }
      }
    }

  });

  // 创建一个对象，用于按调用次数分类
  var tokensByFrequency = {};

  for (var token in frequencyMap) {
    var frequency = frequencyMap[token];

    if (!tokensByFrequency[frequency]) {
      tokensByFrequency[frequency] = [];
    }

    tokensByFrequency[frequency].push(token);
  }

  // 2. 根据频率从高到低排序 <summary>
  var sortedFrequencies = Object.keys(tokensByFrequency).sort((a, b) => b - a);

  // 3. 遍历并添加 <summary> 元素
  sortedFrequencies.forEach(frequency => {
    var tokens = tokensByFrequency[frequency];
    var summary = document.createElement("summary");
    summary.textContent = `调用次数：${frequency}，张数：${tokens.length}`;

    var details = document.createElement("details");
    tokens.forEach(token => {
      var matchingCard = cardData.find(item => item.card_id == token && item.card_name !== "" && item.card_name !== undefined);
      var matchingSubCard = subCardData.find(item => item.card_id == token && item.card_name !== "" && item.card_name !== undefined);

      if (matchingCard) {
        let str = `<a href="${getCardLink(matchingCard.card_id)}" target="_blank">${matchingCard.card_name}</a>，调用次数：${frequencyMap[token]}（`
        for (let i = 0; i < callerMap[token].length; i++){
          if (i != 0){
            str += ","
          };
          str += `<a href="${getCardLink(callerIDMap[token][i])}" target="_blank">${callerMap[token][i]}</a>`;
        }
        str += `）<br>`
        details.innerHTML += str;
      } else if (matchingSubCard) {
        let str = `${matchingSubCard.card_name}，调用次数：${frequencyMap[token]}（`
        for (let i = 0; i < callerMap[token].length; i++){
          if (i != 0){
            str += ","
          };
          str += `<a href="${getCardLink(matchingSubCard.card_id)}" target="_blank">${matchingSubCard.card_name}</a>`;
        }
        str += `）<br>`
        details.innerHTML += str;
      }
    });

    details.appendChild(summary);
    resultDiv.appendChild(details);
  });
}

// 在页面加载完毕后运行printTokenUsage()
document.addEventListener("DOMContentLoaded", function () {
  printTokenUsage();
});
