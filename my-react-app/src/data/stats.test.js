import { STATS, getStatById, BASE_STAT, MAX_STAT, TOTAL_POINTS } from './stats';

describe('data/stats.js', () => {
  describe('constants', () => {
    it('should have BASE_STAT of 8', () => {
      expect(BASE_STAT).toBe(8);
    });

    it('should have MAX_STAT of 15', () => {
      expect(MAX_STAT).toBe(15);
    });

    it('should have TOTAL_POINTS of 27', () => {
      expect(TOTAL_POINTS).toBe(27);
    });
  });

  describe('STATS', () => {
    it('should have 6 stats', () => {
      expect(STATS).toHaveLength(6);
    });

    it('should contain all expected stat IDs', () => {
      const ids = STATS.map(s => s.id);
      expect(ids).toContain('str');
      expect(ids).toContain('dex');
      expect(ids).toContain('con');
      expect(ids).toContain('int');
      expect(ids).toContain('wis');
      expect(ids).toContain('cha');
    });

    it('should have a name, abbreviation, description, and derived for each stat', () => {
      STATS.forEach(stat => {
        expect(stat).toHaveProperty('id');
        expect(stat).toHaveProperty('name');
        expect(stat).toHaveProperty('abbreviation');
        expect(stat).toHaveProperty('description');
        expect(stat).toHaveProperty('derived');
      });
    });

    it('should have unique abbreviations', () => {
      const abbreviations = STATS.map(s => s.abbreviation);
      const unique = new Set(abbreviations);
      expect(unique.size).toBe(abbreviations.length);
    });

    it('should have derived as arrays', () => {
      STATS.forEach(stat => {
        expect(stat.derived).toBeInstanceOf(Array);
      });
    });
  });

  describe('getStatById', () => {
    it('should return the correct stat by ID', () => {
      expect(getStatById('str')).toEqual(STATS[0]);
      expect(getStatById('dex')).toEqual(STATS[1]);
      expect(getStatById('con')).toEqual(STATS[2]);
      expect(getStatById('int')).toEqual(STATS[3]);
      expect(getStatById('wis')).toEqual(STATS[4]);
      expect(getStatById('cha')).toEqual(STATS[5]);
    });

    it('should return undefined for unknown ID', () => {
      expect(getStatById('unknown')).toBeUndefined();
    });
  });
});
