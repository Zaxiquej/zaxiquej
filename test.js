document.addEventListener("DOMContentLoaded", function () {
    const fetchButton = document.getElementById("fetchButton");
    const resultDiv = document.getElementById("result");

    fetchButton.addEventListener("click", function () {
        // Using fetch API to read local file
        fetch("portalcraft.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error("读取本地文件失败");
                }
                return response.json();
            })
            .then(data => {
                const cards = data.data.cards;
                const cardInfo = extractCardInfo(cards);
                displayData(cardInfo);
            })
            .catch(error => {
                resultDiv.innerHTML = `<p>${error.message}</p>`;
            });
    });

    function extractCardInfo(cards) {
        const cardInfo = [];
        const limit = Math.min(100, cards.length);
        for (let i = 0; i < limit; i++) {
            const card = cards[i];
            const info = {
                card_id: card.card_id,
                card_name: card.card_name,
                char_type: card.char_type,
                clan: card.clan,
                cost: card.cost,
            };

            if (card.char_type === 1) {
                info.atk = card.atk;
                info.life = card.life;
                info.evo_atk = card.evo_atk;
                info.evo_life = card.evo_life;
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
