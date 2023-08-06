document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("searchButton");
    const sortButton = document.getElementById("sortButton");
    const resultDiv = document.getElementById("result");
    let cardData = []; // 存储所有卡片数据

    sortButton.addEventListener("click", function () {
        const searchTerm = searchInput.value.trim();
        if (searchTerm === "") {
            resultDiv.innerHTML = "<p>请输入要搜索的卡名</p>";
            return;
        }

        const foundCard = findCardByName(searchTerm);
        if (!foundCard) {
            // 如果找不到，尝试使用繁体中文搜索
            const tradChineseSearchTerm = traditionalized(searchTerm);
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
        // 获取全部卡牌数据，并移除 cardData 中名称为 null 的卡片
        cardData = extractCardInfo(portal.data.cards).filter((card) => card.card_name !== null);

        // 计算相似分，并根据相似分从高到低排序
        const sortedCards = cardData
            .map((card) => {
                const similarity = calculateSimilarityScore(baseCard, card);
                return {
                    card_name: card.card_name,
                    basicScore: calculateBasicScore(baseCard, card),
                    descriptionScore: calculateDescriptionScore(baseCard, card),
                    similarity: similarity,
                };
            })
            .sort((a, b) => b.similarity - a.similarity);

        // 显示每张卡得到的基础分和描述分
        const cardListHTML = sortedCards
            .map((card) => `<li>${card.card_name} - 相似度：${card.similarity.toFixed(2)} 基础分: ${card.basicScore.toFixed(2)}, 描述分: ${card.descriptionScore.toFixed(2)}</li>`)
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
        return portal.data.cards.find((card) => card.card_name === name);
    }
});
