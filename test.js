document.addEventListener("DOMContentLoaded", function () {
    const fetchButton = document.getElementById("fetchButton");
    const resultDiv = document.getElementById("result");

    fetchButton.addEventListener("click", function () {
        const cardInfo = extractCardInfo(portal.data.cards);
        displayData(cardInfo);
    });

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
