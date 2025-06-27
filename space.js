document.addEventListener('DOMContentLoaded', () => {
    const players = [
        { id: 'player1', name: '玩家1（东）', hand: [], isLeader: false },
        { id: 'player2', name: '玩家2（南）', hand: [], isLeader: false },
        { id: 'player3', name: '玩家3（西）', hand: [], isLeader: false },
        { id: 'player4', name: '玩家4（北）', hand: [], isLeader: false },
    ];
    const cardTypes = ['gold', 'silver', 'bronze', 'iron'];
    const cardValues = Array.from({ length: 10 }, (_, i) => i + 1);
    const rocketValues = [1, 2, 3, 4];
    let deck = [];
    let tasks = [];
    let currentPlayerIndex = 0;
    let gameLog = [];

    const taskListElement = document.getElementById('task-list');
    const gameLogElement = document.getElementById('game-log');
    const startGameButton = document.getElementById('start-game');

    // 初始化卡组
    function initializeDeck() {
        cardTypes.forEach(type => {
            cardValues.forEach(value => {
                deck.push({ type, value });
            });
        });
        rocketValues.forEach(value => {
            deck.push({ type: 'rocket', value });
        });
        deck = deck.sort(() => Math.random() - 0.5);
    }

    // 发牌
    function dealCards() {
        players.forEach(player => {
            player.hand = deck.splice(0, 11); // 每个玩家11张牌
            renderHand(player);
        });
        // 设置领航者
        const leader = players.find(player => player.hand.some(card => card.type === 'rocket' && card.value === 4));
        leader.isLeader = true;
        gameLog.push(`${leader.name} 是领航者，最先出牌`);
        updateGameLog();
    }

    // 分配任务
    function assignTasks() {
        const nonRocketCards = deck.filter(card => card.type !== 'rocket');
        tasks = nonRocketCards.slice(0, 4).map(card => ({ type: card.type, value: card.value }));
        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.textContent = `任务: ${task.type} ${task.value}`;
            taskListElement.appendChild(taskElement);
        });
    }

    // 开始游戏
    startGameButton.addEventListener('click', () => {
        initializeDeck();
        dealCards();
        assignTasks();
        startGameButton.disabled = true;
        gameLog.push('游戏开始！');
        updateGameLog();
    });

    // 更新游戏日志
    function updateGameLog() {
        gameLogElement.innerHTML = gameLog.map(log => `<div>${log}</div>`).join('');
    }

    // 渲染手牌
    function renderHand(player) {
        const handElement = document.querySelector(`#${player.id} .hand`);
        handElement.innerHTML = player.hand.map(card => `
            <div class="card" data-type="${card.type}" data-value="${card.value}">
                ${card.type} ${card.value}
            </div>
        `).join('');
    }

    function assignTasks() {
        const nonRocketCards = deck.filter(card => card.type !== 'rocket');
        tasks = nonRocketCards.slice(0, 4).map(card => ({ type: card.type, value: card.value }));
        tasks.forEach((task, index) => {
            const taskElement = document.createElement('div');
            taskElement.textContent = `任务 ${index + 1}: ${task.type} ${task.value}`;
            taskListElement.appendChild(taskElement);
        });
        selectTasks();
    }

    function selectTasks() {
        let taskIndex = 0;
        function nextTask() {
            if (taskIndex >= tasks.length) return;
            const currentPlayer = players[currentPlayerIndex];
            gameLog.push(`${currentPlayer.name} 请选择一个任务`);
            updateGameLog();
            // 模拟玩家选择任务（这里可以改为点击选择）
            setTimeout(() => {
                const selectedTask = tasks[taskIndex];
                gameLog.push(`${currentPlayer.name} 选择了任务: ${selectedTask.type} ${selectedTask.value}`);
                updateGameLog();
                taskIndex++;
                currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
                nextTask();
            }, 1000);
        }
        nextTask();
    }

    function playRound() {
        const currentPlayer = players[currentPlayerIndex];
        gameLog.push(`轮到 ${currentPlayer.name} 出牌`);
        updateGameLog();
        updatePlayerUI();

        // 模拟出牌（这里可以改为点击选择）
        setTimeout(() => {
            const card = currentPlayer.hand.pop(); // 简单模拟出牌
            gameLog.push(`${currentPlayer.name} 打出了 ${card.type} ${card.value}`);
            updateGameLog();
            renderHand(currentPlayer);

            // 检查是否完成任务
            const completedTask = tasks.find(task => task.type === card.type && task.value === card.value);
            if (completedTask) {
                gameLog.push(`${currentPlayer.name} 完成了任务: ${completedTask.type} ${completedTask.value}`);
                tasks = tasks.filter(task => task !== completedTask);
                updateGameLog();
            }

            // 检查游戏是否结束
            if (tasks.length === 0) {
                gameLog.push('所有任务完成，游戏胜利！');
                updateGameLog();
                return;
            }

            if (currentPlayer.hand.length === 0) {
                gameLog.push(`${currentPlayer.name} 没有牌了，游戏失败！`);
                updateGameLog();
                return;
            }

            // 切换到下一个玩家
            currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
            playRound();
        }, 1000);
    }
});
