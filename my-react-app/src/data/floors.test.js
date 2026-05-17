import {
  getFloorRequirements,
  getFloorCelebrationText,
  getTotalFloors,
  FLOORS,
} from './floors';

describe('floors', () => {
  describe('FLOORS', () => {
    it('has 5 floors', () => {
      expect(FLOORS.length).toBe(5);
    });

    it('has correct floor names from Tower 1 Design Spec', () => {
      expect(FLOORS[0].name).toBe('The Mossward');
      expect(FLOORS[1].name).toBe('The Ember Gallery');
      expect(FLOORS[2].name).toBe('The Glass Wastes');
      expect(FLOORS[3].name).toBe('The Wind Spire');
      expect(FLOORS[4].name).toBe('The Crown Chamber');
    });

    it('has celebrationText for each floor', () => {
      FLOORS.forEach((floor) => {
        expect(floor.celebrationText).toBeDefined();
        expect(typeof floor.celebrationText).toBe('string');
        expect(floor.celebrationText.length).toBeGreaterThan(0);
      });
    });

    it('has correct sessionsRequired for each floor', () => {
      expect(FLOORS[0].sessionsRequired).toBe(2);
      expect(FLOORS[1].sessionsRequired).toBe(3);
      expect(FLOORS[2].sessionsRequired).toBe(3);
      expect(FLOORS[3].sessionsRequired).toBe(4);
      expect(FLOORS[4].sessionsRequired).toBe(4);
    });
  });

  describe('getFloorRequirements', () => {
    it('returns the correct floor for valid floor numbers', () => {
      expect(getFloorRequirements(1)).toBe(FLOORS[0]);
      expect(getFloorRequirements(2)).toBe(FLOORS[1]);
      expect(getFloorRequirements(3)).toBe(FLOORS[2]);
      expect(getFloorRequirements(4)).toBe(FLOORS[3]);
      expect(getFloorRequirements(5)).toBe(FLOORS[4]);
    });

    it('returns the last floor for out-of-range numbers', () => {
      expect(getFloorRequirements(0)).toBe(FLOORS[FLOORS.length - 1]);
      expect(getFloorRequirements(6)).toBe(FLOORS[FLOORS.length - 1]);
      expect(getFloorRequirements(100)).toBe(FLOORS[FLOORS.length - 1]);
    });
  });

  describe('getFloorCelebrationText', () => {
    it('returns the correct celebration text for Floor 1', () => {
      const text = getFloorCelebrationText(1);
      expect(text).toBe(
        'Stone beneath your feet, warm and alive. Moss glows along the walls like a path laid out by patient hands. The air smells of rain and old secrets. You begin to climb.'
      );
    });

    it('returns the correct celebration text for Floor 2', () => {
      const text = getFloorCelebrationText(2);
      expect(text).toBe(
        'The corridor opens, and warmth reaches for you — not the warmth of fire, but the warmth of something that has been waiting a very long time. Embers pulse in the walls like heartbeats. Your steps grow heavier, but your resolve lightens.'
      );
    });

    it('returns the correct celebration text for Floor 3', () => {
      const text = getFloorCelebrationText(3);
      expect(text).toBe(
        'Light pours through walls that should not be transparent. Crystals rise from the ground like frozen questions — beautiful, sharp, and full of silence. You can see farther than you ever have.'
      );
    });

    it('returns the correct celebration text for Floor 4', () => {
      const text = getFloorCelebrationText(4);
      expect(text).toBe(
        'The floor falls away. What remains is a spiral of stone and sky, and the wind speaks in a language older than words. You reach for the next step, and the tower reaches back.'
      );
    });

    it('returns the correct celebration text for Floor 5', () => {
      const text = getFloorCelebrationText(5);
      expect(text).toBe(
        'Water. The floor is still water, and in it you see the tower reflected from above — a perfect circle of light, and at its center, something that pulses with the rhythm of the world itself. You have climbed. The tower has been waiting.'
      );
    });

    it('returns null for out-of-range floor numbers', () => {
      expect(getFloorCelebrationText(0)).toBeNull();
      expect(getFloorCelebrationText(6)).toBeNull();
    });
  });

  describe('getTotalFloors', () => {
    it('returns the total number of floors', () => {
      expect(getTotalFloors()).toBe(5);
    });
  });
});
