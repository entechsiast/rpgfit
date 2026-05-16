const FLOORS = [
  { number: 1, name: 'Verdant Approach', sessionsRequired: 2 },
  { number: 2, name: 'Ashen Pass', sessionsRequired: 3 },
  { number: 3, name: 'Crystal Depths', sessionsRequired: 3 },
  { number: 4, name: 'Stormspire', sessionsRequired: 4 },
  { number: 5, name: 'The Crucible', sessionsRequired: 4 },
];

export function getFloorRequirements(floorNumber) {
  const floor = FLOORS.find(f => f.number === floorNumber);
  return floor || FLOORS[FLOORS.length - 1];
}

export function getTotalFloors() {
  return FLOORS.length;
}

export default FLOORS;
