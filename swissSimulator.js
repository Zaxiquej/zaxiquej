function runSimulation() {
    const numPlayers = parseInt(document.getElementById('numPlayers').value);
    const numRounds = parseInt(document.getElementById('numRounds').value);
    const numQualifiers = parseInt(document.getElementById('numQualifiers').value);
    const gamesPerRound = parseInt(document.getElementById('gamesPerRound').value);
    const numSimulations = parseInt(document.getElementById('numSimulations').value);
    const calculateFirstRoundLoss = document.getElementById('calculateFirstRoundLoss').checked;

    const results = simulateSwiss(numPlayers, numRounds, numQualifiers, gamesPerRound, numSimulations, calculateFirstRoundLoss);
    displayResults(results, numSimulations, calculateFirstRoundLoss);
}

function simulateSwiss(numPlayers, numRounds, numQualifiers, gamesPerRound, numSimulations, calculateFirstRoundLoss) {
    const results = {};
    const firstRoundLossResults = {};

    for (let sim = 0; sim < numSimulations; sim++) {
        const players = Array.from({ length: numPlayers }, (_, i) => ({
            id: i,
            score: 0,
            opponentScores: [],
            gameWins: 0,
            gameLosses: 0,
            firstRoundLoss: false
        }));

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

                while (player1Wins < Math.ceil(gamesPerRound / 2) && player2Wins < Math.ceil(gamesPerRound / 2)) {
                    const winner = Math.random() < 0.5 ? player1 : player2;
                    if (winner === player1) {
                        player1Wins++;
                    } else {
                        player2Wins++;
                    }
                }

                player1.gameWins += player1Wins;
                player1.gameLosses += player2Wins;
                player2.gameWins += player2Wins;
                player2.gameLosses += player1Wins;

                if (player1Wins > player2Wins) {
                    player1.score += 1;
                    if (round === 0) player2.firstRoundLoss = true;
                } else {
                    player2.score += 1;
                    if (round === 0) player1.firstRoundLoss = true;
                }

                player1.opponentScores.push(player2.score);
                player2.opponentScores.push(player1.score);
            });
        }

        players.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;

            const bOpponentWinRate = b.opponentScores.reduce((acc, s) => acc + s, 0) / (b.opponentScores.length * numRounds);
            const aOpponentWinRate = a.opponentScores.reduce((acc, s) => acc + s, 0) / (a.opponentScores.length * numRounds);
            if (bOpponentWinRate !== aOpponentWinRate) return bOpponentWinRate - aOpponentWinRate;

            const bGameWinRate = b.gameWins / (b.gameWins + b.gameLosses);
            const aGameWinRate = a.gameWins / (a.gameWins + a.gameLosses);
            return bGameWinRate - aGameWinRate;
        });

        const qualifiers = players.slice(0, numQualifiers);

        qualifiers.forEach(player => {
            if (!results[player.score]) {
                results[player.score] = { total: 0, qualifiers: 0 };
            }
            results[player.score].qualifiers++;

            if (calculateFirstRoundLoss && player.firstRoundLoss) {
                if (!firstRoundLossResults[player.score]) {
                    firstRoundLossResults[player.score] = { total: 0, qualifiers: 0 };
                }
                firstRoundLossResults[player.score].qualifiers++;
            }
        });

        players.forEach(player => {
            if (!results[player.score]) {
                results[player.score] = { total: 0, qualifiers: 0 };
            }
            results[player.score].total++;

            if (calculateFirstRoundLoss && player.firstRoundLoss) {
                if (!firstRoundLossResults[player.score]) {
                    firstRoundLossResults[player.score] = { total: 0, qualifiers: 0 };
                }
                firstRoundLossResults[player.score].total++;
            }
        });
    }

    return { results, firstRoundLossResults };
}

function displayResults(resultsData, numSimulations, calculateFirstRoundLoss) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>模拟结果</h2>';
    const { results, firstRoundLossResults } = resultsData;

    resultsDiv.innerHTML += '<h3>总体结果</h3>';
    for (const [score, data] of Object.entries(results)) {
        const { total, qualifiers } = data;
        const percentage = (qualifiers / total * 100).toFixed(2);
        resultsDiv.innerHTML += `<p>胜场数: ${score}, 总人数: ${total}, 出线人数: ${qualifiers}, 出线率: ${percentage}%</p>`;
    }

    if (calculateFirstRoundLoss) {
        resultsDiv.innerHTML += '<h3>首轮输掉者的出线率</h3>';
        for (const [score, data] of Object.entries(firstRoundLossResults)) {
            const { total, qualifiers } = data;
            const percentage = (qualifiers / total * 100).toFixed(2);
            resultsDiv.innerHTML += `<p>胜场数: ${score}, 总人数: ${total}, 出线人数: ${qualifiers}, 出线率: ${percentage}%</p>`;
        }
    }
}
