document.getElementById('simulateButton').addEventListener('click', function() {
  const numTimes = parseInt(document.getElementById('numTimes').value);
  const abilities = {
    '守护': 0,
    '疾走': 0,
    '必杀': 0,
    '打2': 0,
    '奶4': 0,
    '回2': 0,
    '抽2': 0,
    '扫3': 0,
    '破坏1': 0,
    '进化': 0
  };

  const costAbilities = [
    '守护', '疾走', '必杀', '打2', '奶4', '回2', '抽2', '扫3', '破坏1', '进化'
  ];

  const costCounts = {};
  const godList = [];

  for (let i = 0; i < numTimes; i++) {
    const cost = Math.floor(Math.random() * 9) + 2;
    costCounts[cost] = (costCounts[cost] || 0) + 1;

    const availableAbilities = costAbilities.slice();
    const selectedAbilities = [];

    for (let j = 0; j < cost; j++) {
      const randomIndex = Math.floor(Math.random() * availableAbilities.length);
      const ability = availableAbilities.splice(randomIndex, 1)[0];
      abilities[ability]++;
      selectedAbilities.push(ability);
    }

    godList.push({ cost, abilities: selectedAbilities });
  }

  const abilitiesContainer = document.getElementById('abilities');
  const costsContainer = document.getElementById('costs');
  const godListContainer = document.getElementById('godList');

  abilitiesContainer.innerHTML = '<h3>每种能力触发次数：</h3>';
  costsContainer.innerHTML = '<h3>每种费的触发次数：</h3>';
  godListContainer.innerHTML = '<h3>神的信息：</h3>';

  for (let ability in abilities) {
    abilitiesContainer.innerHTML += `<span>${ability}：${abilities[ability]}次</span>`;
  }

  for (let cost in costCounts) {
    costsContainer.innerHTML += `<span>${cost}费：${costCounts[cost]}次</span>`;
  }

  godList.forEach(god => {
    const godItem = document.createElement('li');
    const abilitiesString = god.abilities.map(ability => `<span class="god-ability ${abilityToClass(ability)}">${ability}</span>`).join(' ');
    godItem.innerHTML = `<span>${god.cost}费：</span>${abilitiesString}`;
    godListContainer.appendChild(godItem);
  });
});

function abilityToClass(ability) {
  switch (ability) {
    case '必杀':
      return 'critical';
    case '打2':
      return 'hit-2';
    case '奶4':
      return 'heal-4';
    case '回2':
      return 'recover-2';
    case '抽2':
      return 'draw-2';
    case '扫3':
      return 'sweep-3';
    case '破坏1':
      return 'destroy-1';
    case '进化':
      return 'evolve';
    default:
      return '';
  }
}
