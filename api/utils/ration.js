// utils/ration.js
function getRationEntitlement(state, members, cardType) {
  const baseEntitlement = { rice: 5, wheat: 5 };

  const stateExtras = {
    "Tamil Nadu": { sugar: 1, oil: 1 },
    "Kerala": { pulses: 2, flour: 2 },
    "Delhi": { rice: 5, wheat: 5 },
    "West Bengal": { rice: 5 },
    "Maharashtra": { sugar: 1 }
  };

  let rationList = {};
  const multiplier = cardType === "AAY" ? 35 / members : 5;

  for (let item in baseEntitlement) {
    rationList[item] = baseEntitlement[item] * members;
  }

  if (stateExtras[state]) {
    for (let item in stateExtras[state]) {
      rationList[item] = (rationList[item] || 0) + stateExtras[state][item] * members;
    }
  }

  return rationList;
}

module.exports = { getRationEntitlement };
