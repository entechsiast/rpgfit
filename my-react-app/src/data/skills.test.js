import { ALL_SKILLS, getSkillsByCategory, getSkillsForClassAndRace } from './skills';

describe('data/skills.js', () => {
  describe('ALL_SKILLS', () => {
    it('should have 34 skills', () => {
      expect(ALL_SKILLS).toHaveLength(34);
    });

    it('should have a valid category for each skill', () => {
      const validCategories = ['combat', 'utility', 'social', 'knowledge', 'survival'];
      ALL_SKILLS.forEach(skill => {
        expect(validCategories).toContain(skill.category);
      });
    });

    it('should have a valid stat for each skill', () => {
      const validStats = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
      ALL_SKILLS.forEach(skill => {
        expect(validStats).toContain(skill.stat);
      });
    });

    it('should have unique IDs', () => {
      const ids = ALL_SKILLS.map(s => s.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });

    it('should have at least 4 skills in each category', () => {
      const categories = getSkillsByCategory();
      Object.entries(categories).forEach(([cat, skills]) => {
        expect(skills.length).toBeGreaterThanOrEqual(4);
      });
    });
  });

  describe('getSkillsByCategory', () => {
    it('should return all 5 categories', () => {
      const categories = getSkillsByCategory();
      expect(Object.keys(categories)).toHaveLength(5);
      expect(categories).toHaveProperty('combat');
      expect(categories).toHaveProperty('utility');
      expect(categories).toHaveProperty('social');
      expect(categories).toHaveProperty('knowledge');
      expect(categories).toHaveProperty('survival');
    });

    it('should return correct number of skills per category', () => {
      const categories = getSkillsByCategory();
      expect(categories.combat.length).toBe(10);
      expect(categories.utility.length).toBe(7);
      expect(categories.social.length).toBe(4);
      expect(categories.knowledge.length).toBe(7);
      expect(categories.survival.length).toBe(6);
    });

    it('should return an object with array values', () => {
      const result = getSkillsByCategory();
      expect(typeof result).toBe('object');
      Object.values(result).forEach(category => {
        expect(category).toBeInstanceOf(Array);
      });
    });
  });

  describe('getSkillsForClassAndRace', () => {
    it('should return class starting skills plus race bonus skills', () => {
      const skills = getSkillsForClassAndRace('warrior', 'human');
      const skillNames = skills.map(s => s.id);
      expect(skillNames).toContain('swordsmanship');
      expect(skillNames).toContain('shield_bash');
      expect(skillNames).toContain('war_cry');
      expect(skillNames).toContain('culture');
      expect(skillNames).toContain('human_language');
    });

    it('should return empty array when class is not found', () => {
      expect(getSkillsForClassAndRace('unknown', 'human')).toHaveLength(0);
    });

    it('should return only class skills when race is not found', () => {
      const skills = getSkillsForClassAndRace('mage', 'unknown');
      const skillNames = skills.map(s => s.id);
      expect(skillNames).toContain('fireball');
      expect(skillNames).toContain('ice_storm');
      expect(skillNames).toContain('arcane_bolt');
    });

    it('should include race bonus skills for elf', () => {
      const skills = getSkillsForClassAndRace('warrior', 'elf');
      const skillNames = skills.map(s => s.id);
      expect(skillNames).toContain('arcana');
      expect(skillNames).toContain('perception');
    });

    it('should include race bonus skills for dwarf', () => {
      const skills = getSkillsForClassAndRace('warrior', 'dwarf');
      const skillNames = skills.map(s => s.id);
      expect(skillNames).toContain('history_mountain');
      expect(skillNames).toContain('stonecraft');
    });

    it('should include race bonus skills for orc', () => {
      const skills = getSkillsForClassAndRace('warrior', 'orc');
      const skillNames = skills.map(s => s.id);
      expect(skillNames).toContain('intimidation');
      expect(skillNames).toContain('survival');
    });

    it('should return unique skills (no duplicates)', () => {
      const skills = getSkillsForClassAndRace('warrior', 'orc');
      const ids = skills.map(s => s.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });
  });
});
