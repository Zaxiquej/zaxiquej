let resources = {
  metal: 0,
  wood: 0,
  water: 0,
};

let buildings = {
  building1: {
    count: 0,
    cost: 10,
    consumption: {
      metal: 1,
    },
    production: {
      metal: 1,
    },
  },

  building2: {
    count: 0,
    cost: 15,
    consumption: {
      wood: 1,
    },
    production: {
      wood: 1,
    },
  },

  building3: {
    count: 0,
    cost: 20,
    consumption: {
      metal: 1,
    },
    production: {
      water: 1,
    },
  },
};

function updateResourcesDisplay() {
  document.getElementById('metal').textContent = resources.metal;
  document.getElementById('wood').textContent = resources.wood;
  document.getElementById('water').textContent = resources.water;
}

function updateBuildingDisplay(buildingName) {
  const building = buildings[buildingName];
  document.getElementById(`${buildingName}Count`).textContent = building.count;
  document.getElementById(`${buildingName}Cost`).textContent = building.cost;
  document.getElementById(`${buildingName}Consumption`).textContent = Object.keys(building.consumption).join(', ');
}

function upgradeBuilding(buildingIndex) {
  const buildingName = `building${buildingIndex}`;
  const building = buildings[buildingName];

  let canUpgrade = true;
  for (let consumedResource in building.consumption) {
    if (resources[consumedResource] < building.consumption[consumedResource]) {
      canUpgrade = false;
      break;
    }
  }

  if (canUpgrade) {
    for (let consumedResource in building.consumption) {
      resources[consumedResource] -= building.consumption[consumedResource];
    }

    building.count++;
    building.cost = Math.round(building.cost * (1 + 0.1 * building.count));
    updateBuildingDisplay(buildingName);
    updateResourcesDisplay();
  }
}

function manualResourceGain(resourceType) {
  if (resourceType !== 'water') {
    resources[resourceType] += 1;
    updateResourcesDisplay();
  }
}

function updateProduction() {
  for (let buildingName in buildings) {
    const building = buildings[buildingName];

    let canOperate = true;
    for (let consumedResource in building.consumption) {
      if (resources[consumedResource] < building.consumption[consumedResource] * building.count) {
        canOperate = false;
        break;
      }
    }

    if (canOperate) {
      for (let producedResource in building.production) {
        resources[producedResource] += building.production[producedResource] * building.count;
      }
    }

    updateBuildingDisplay(buildingName);
  }

  updateResourcesDisplay();
}

setInterval(updateProduction, 1000);
