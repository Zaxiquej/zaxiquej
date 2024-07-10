function runSimulation() {
    const numPlayers = parseInt(document.getElementById('numPlayers').value);
    const numRounds = parseInt(document.getElementById('numRounds').value);
    const numQualifiers = parseInt(document.getElementById('numQualifiers').value);
    const gamesPerRound = parseInt(document.getElementById('gamesPerRound').value);
    const numSimulations = parseInt(document.getElementById('numSimulations').value);
    const defaultDeckStrength = parseInt(document.getElementById('defaultDeckStrength').value);

    const specialPlayers = [];
    document.querySelectorAll('.special-player').forEach(playerDiv => {
        const name = playerDiv.querySelector('.name').value;
        const deck1Strength = parseInt(playerDiv.querySelector('.deck1Strength').value);
        const deck2Strength = parseInt(playerDiv.querySelector('.deck2Strength').value);
        const skills = {
            badLuck: playerDiv.querySelector('#skill1').checked,
            oneMoveAhead: playerDiv.querySelector('#skill2').checked
        };
        specialPlayers.push({ name, deck1Strength, deck2Strength, skills });
    });

    const results = simulateSwiss(numPlayers, numRounds, numQualifiers, gamesPerRound, numSimulations, defaultDeckStrength, specialPlayers);
    displayResults(results, numSimulations);
}


function addSpecialPlayer() {
    const specialPlayersDiv = document.getElementById('special-players');
    const playerDiv = document.createElement('div');
    playerDiv.classList.add('special-player');
    playerDiv.innerHTML = `
        <label>名字:</label>
        <input type="text" class="name" required>
        <label>卡组1硬实力:</label>
        <input type="number" class="deck1Strength" value="100" required>
        <label>卡组2硬实力:</label>
        <input type="number" class="deck2Strength" value="100" required>
        <button type="button" onclick="removeSpecialPlayer(this)">移除</button>
        <br>
        <div class="skills">
            <label for="skill1">倒霉蛋-第一轮必定落败</label>
            <input type="checkbox" id="skill1" name="skills" value="badLuck">
            <label for="skill2">棋差一着-最后一轮必定落败</label>
            <input type="checkbox" id="skill2" name="skills" value="oneMoveAhead">
        </div>
    `;
    specialPlayersDiv.appendChild(playerDiv);
}
function removeSpecialPlayer(button) {
    button.parentElement.remove();
}

function simulateSwiss(numPlayers, numRounds, numQualifiers, gamesPerRound, numSimulations, defaultDeckStrength, specialPlayers) {
    const results = {};
    const playerStats = specialPlayers.reduce((acc, player) => {
        acc[player.name] = {};
        return acc;
    }, {});

    for (let sim = 0; sim < numSimulations; sim++) {
        const players = Array.from({ length: numPlayers }, (_, i) => ({
            id: i,
            name: null,
            score: 0,
            opponents: [],
            gameWins: 0,
            gameLosses: 0,
            decks: [defaultDeckStrength, defaultDeckStrength],
            participation: 0  // 新增参与次数统计
        }));

        specialPlayers.forEach((player, index) => {
            players[index].name = player.name;
            players[index].decks = [player.deck1Strength, player.deck2Strength];
        });

        for (let round = 0; round < numRounds; round++) {
            players.sort((a, b) => b.score - a.score);
            const matches = [];

            for (let i = 0; i < numPlayers; i += 2) {
                if (i + 1 < numPlayers) {
                    matches.push([players[i], players[i + 1]]);
                }
            }

            matches.forEach(match => {
                const [player1, player2] = match;
                let player1Wins = 0;
                let player2Wins = 0;
                const player1Decks = [...player1.decks];
                const player2Decks = [...player2.decks];

                while (player1Wins < Math.ceil(gamesPerRound / 2) && player2Wins < Math.ceil(gamesPerRound / 2)) {
                    const player1Deck = player1Decks[Math.floor(Math.random() * player1Decks.length)];
                    const player2Deck = player2Decks[Math.floor(Math.random() * player2Decks.length)];
                    const player1WinChance = player1Deck / (player1Deck + player2Deck);

                    if (Math.random() < player1WinChance) {
                        player1Wins++;
                        player1Decks.splice(player1Decks.indexOf(player1Deck), 1);
                    } else {
                        player2Wins++;
                        player2Decks.splice(player2Decks.indexOf(player2Deck), 1);
                    }

                    // Check if special player has "Bad Luck" skill
                    if (player1.name && specialPlayers.find(sp => sp.name === player1.name && sp.skills.badLuck) && player1Wins === player2Wins) {
                        player2Wins++; // Player 1 loses this round due to "Bad Luck" skill
                    }
                    if (player2.name && specialPlayers.find(sp => sp.name === player2.name && sp.skills.badLuck) && player1Wins === player2Wins) {
                        player1Wins++; // Player 1 loses this round due to "Bad Luck" skill
                    }

                    // Check if special player has "One Move Ahead" skill
                    if (player2.name && specialPlayers.find(sp => sp.name === player2.name && sp.skills.oneMoveAhead) && player1Wins === player2Wins) {
                        player1Wins++; // Player 2 loses this round due to "One Move Ahead" skill
                    }
                    if (player1.name && specialPlayers.find(sp => sp.name === player2.name && sp.skills.oneMoveAhead) && player1Wins === player2Wins) {
                        player2Wins++; // Player 2 loses this round due to "One Move Ahead" skill
                    }
                }

                player1.gameWins += player1Wins;
                player1.gameLosses += player2Wins;
                player2.gameWins += player2Wins;
                player2.gameLosses += player1Wins;

                if (player1Wins > player2Wins) {
                    player1.score += 1;
                } else {
                    player2.score += 1;
                }

                player1.opponents.push(player2);
                player2.opponents.push(player1);

                // Increment participation count for both players
                player1.participation++;
                player2.participation++;
            });
        }

        players.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;

            const bOpponentWinRate = calculateOpponentWinRate(b.opponents);
            const aOpponentWinRate = calculateOpponentWinRate(a.opponents);
            if (bOpponentWinRate !== aOpponentWinRate) return bOpponentWinRate - aOpponentWinRate;

            const bGameWinRate = b.gameWins / (b.gameWins + b.gameLosses);
            const aGameWinRate = a.gameWins / (a.gameWins + a.gameLosses);
            return bGameWinRate - aGameWinRate;
        });

        const qualifiers = players.slice(0, numQualifiers);

        qualifiers.forEach(player => {
            if (player.name) {
                if (!results[player.name]) {
                    results[player.name] = {};
                }
                if (!results[player.name][player.score]) {
                    results[player.name][player.score] = 0;
                }
                results[player.name][player.score]++;
            }
        });

        specialPlayers.forEach(player => {
            const playerObj = players.find(p => p.name === player.name);
            if (!playerStats[player.name][playerObj.score]) {
                playerStats[player.name][playerObj.score] = { total: 0, qualifiers: 0 };
            }
            playerStats[player.name][playerObj.score].total++;
            if (qualifiers.includes(playerObj)) {
                playerStats[player.name][playerObj.score].qualifiers++;
            }
        });
    }

    return { results, playerStats };
}

function calculateOpponentWinRate(opponents) {
    const totalGames = opponents.reduce((acc, opp) => acc + opp.gameWins + opp.gameLosses, 0);
    const totalWins = opponents.reduce((acc, opp) => acc + opp.gameWins, 0);
    return totalGames ? totalWins / totalGames : 0;
}

function displayResults(resultsData, numSimulations) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>模拟结果</h2>';
    const { results, playerStats } = resultsData;

    resultsDiv.innerHTML += '<h3>特殊玩家成绩</h3>';
    for (const [name, stats] of Object.entries(playerStats)) {
        let totalQualifiers = 0;
        let totalParticipations = 0;
        for (const { total, qualifiers } of Object.values(stats)) {
            totalQualifiers += qualifiers;
            totalParticipations += total;
        }
        const overallPercentage = (totalQualifiers / totalParticipations * 100).toFixed(2);

        const detailsId = `details-${name}`;

        resultsDiv.innerHTML += `
            <div class="player-summary" onclick="toggleDetails('${detailsId}')">
                <span>${name} 总成绩: ${totalQualifiers}/${totalParticipations}, 出线率: ${overallPercentage}%</span>
                <button type="button" class="toggle-button">+</button>
            </div>
            <div id="${detailsId}" class="details">
                ${Object.entries(stats).map(([score, { total, qualifiers }]) => {
                    const percentage = (qualifiers / total * 100).toFixed(2);
                    return `<p>· 胜场数: ${score}, 总次数: ${total}, 出线次数: ${qualifiers}, 出线率: ${percentage}%</p>`;
                }).join('')}
            </div>
        `;
    }
}

function toggleDetails(detailsId) {
    const detailsDiv = document.getElementById(detailsId);
    if (detailsDiv.style.display === 'none' || detailsDiv.style.display === '') {
        detailsDiv.style.display = 'block';
    } else {
        detailsDiv.style.display = 'none';
    }
}
