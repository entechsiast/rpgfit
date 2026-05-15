import { RACES, getRaceById } from './races';

describe('data/races.js', () => {
  describe('RACES', () => {
    it('should have 6 races', () => {
      expect(RACES).toHaveLength(6);
    });

    it('should contain all expected race IDs', () => {
      const ids = RACES.map(r => r.id);
      expect(ids).toContain('human');
      expect(ids).toContain('elf');
      expect(ids).toContain('dwarf');
      expect(ids).toContain('half_elf');
      expect(ids).toContain('halfling');
      expect(ids).toContain('orc');
    });

    it('should have a name, description, statModifiers, bonusSkills, speed, and size for each race', () => {
      RACES.forEach(race => {
        expect(race).toHaveProperty('id');
        expect(race).toHaveProperty('name');
        expect(race).toHaveProperty('description');
        expect(race).toHaveProperty('statModifiers');
        expect(race).toHaveProperty('bonusSkills');
        expect(race).toHaveProperty('speed');
        expect(race).toHaveProperty('size');
      });
    });

    it('should have valid speed values (between 20 and 50)', () => {
      RACES.forEach(race => {
        expect(race.speed).toBeGreaterThanOrEqual(20);
        expect(race.speed).toBeLessThanOrEqual(50);
      });
    });

    it('should have size as either Medium or Small', () => {
      RACES.forEach(race => {
        expect(['Medium', 'Small']).toContain(race.size);
      });
    });

    it('should have bonusSkills as arrays', () => {
      RACES.forEach(race => {
        expect(race.bonusSkills).toBeInstanceOf(Array);
      });
    });
  });

  describe('getRaceById', () => {
    it('should return the correct race by ID', () => {
      expect(getRaceById('human')).toEqual(RACES[0]);
      expect(getRaceById('elf')).toEqual(RACES[1]);
      expect(getRaceById('dwarf')).toEqual(RACES[2]);
      expect(getRaceById('half_elf')).toEqual(RACES[3]);
      expect(getRaceById('halfling')).toEqual(RACES[4]);
      expect(getRaceById('orc')).toEqual(RACES[5]);
    });

    it('should return undefined for unknown ID', () => {
      expect(getRaceById('unknown')).toBeUndefined();
    });
  });
});
