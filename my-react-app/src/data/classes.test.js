import { CLASSES, getClassById } from './classes';

describe('data/classes.js', () => {
  describe('CLASSES', () => {
    it('should have 6 classes', () => {
      expect(CLASSES).toHaveLength(6);
    });

    it('should contain all expected class IDs', () => {
      const ids = CLASSES.map(c => c.id);
      expect(ids).toContain('warrior');
      expect(ids).toContain('mage');
      expect(ids).toContain('rogue');
      expect(ids).toContain('cleric');
      expect(ids).toContain('ranger');
      expect(ids).toContain('paladin');
    });

    it('should have a name, description, statBonuses, primaryStat, skillProficiencies, startingSkills, and hitDie for each class', () => {
      CLASSES.forEach(cls => {
        expect(cls).toHaveProperty('id');
        expect(cls).toHaveProperty('name');
        expect(cls).toHaveProperty('description');
        expect(cls).toHaveProperty('statBonuses');
        expect(cls).toHaveProperty('primaryStat');
        expect(cls).toHaveProperty('skillProficiencies');
        expect(cls).toHaveProperty('startingSkills');
        expect(cls).toHaveProperty('hitDie');
      });
    });

    it('should have valid statBonuses as objects with positive values', () => {
      CLASSES.forEach(cls => {
        Object.values(cls.statBonuses).forEach(val => {
          expect(val).toBeGreaterThanOrEqual(1);
        });
      });
    });

    it('should have startingSkills as arrays with at least 1 skill', () => {
      CLASSES.forEach(cls => {
        expect(cls.startingSkills).toBeInstanceOf(Array);
        expect(cls.startingSkills.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should have valid hitDie values', () => {
      const validHitDice = ['d4', 'd6', 'd8', 'd10', 'd12'];
      CLASSES.forEach(cls => {
        expect(validHitDice).toContain(cls.hitDie);
      });
    });
  });

  describe('getClassById', () => {
    it('should return the correct class by ID', () => {
      expect(getClassById('warrior')).toEqual(CLASSES[0]);
      expect(getClassById('mage')).toEqual(CLASSES[1]);
      expect(getClassById('rogue')).toEqual(CLASSES[2]);
      expect(getClassById('cleric')).toEqual(CLASSES[3]);
      expect(getClassById('ranger')).toEqual(CLASSES[4]);
      expect(getClassById('paladin')).toEqual(CLASSES[5]);
    });

    it('should return undefined for unknown ID', () => {
      expect(getClassById('unknown')).toBeUndefined();
    });
  });
});
