/**
 * Tower 1 — Floor Definitions
 * Source: Tower 1 Design Spec section 4 (Floor Intro Texts)
 * Each floor has a unique celebration text displayed on completion.
 */

const FLOORS = [
  {
    number: 1,
    name: 'The Mossward',
    sessionsRequired: 2,
    celebrationText:
      'Stone beneath your feet, warm and alive. Moss glows along the walls like a path laid out by patient hands. The air smells of rain and old secrets. You begin to climb.',
  },
  {
    number: 2,
    name: 'The Ember Gallery',
    sessionsRequired: 3,
    celebrationText:
      'The corridor opens, and warmth reaches for you \u2014 not the warmth of fire, but the warmth of something that has been waiting a very long time. Embers pulse in the walls like heartbeats. Your steps grow heavier, but your resolve lightens.',
  },
  {
    number: 3,
    name: 'The Glass Wastes',
    sessionsRequired: 3,
    celebrationText:
      'Light pours through walls that should not be transparent. Crystals rise from the ground like frozen questions \u2014 beautiful, sharp, and full of silence. You can see farther than you ever have.',
  },
  {
    number: 4,
    name: 'The Wind Spire',
    sessionsRequired: 4,
    celebrationText:
      'The floor falls away. What remains is a spiral of stone and sky, and the wind speaks in a language older than words. You reach for the next step, and the tower reaches back.',
  },
  {
    number: 5,
    name: 'The Crown Chamber',
    sessionsRequired: 4,
    celebrationText:
      'Water. The floor is still water, and in it you see the tower reflected from above \u2014 a perfect circle of light, and at its center, something that pulses with the rhythm of the world itself. You have climbed. The tower has been waiting.',
  },
];

export function getFloorRequirements(floorNumber) {
  const floor = FLOORS.find((f) => f.number === floorNumber);
  return floor || FLOORS[FLOORS.length - 1];
}

export function getFloorCelebrationText(floorNumber) {
  const floor = FLOORS.find((f) => f.number === floorNumber);
  return floor ? floor.celebrationText : null;
}

export function getTotalFloors() {
  return FLOORS.length;
}

export { FLOORS };

export default FLOORS;
