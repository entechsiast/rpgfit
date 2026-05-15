import { CLASSES, getClassById } from './classes';
import { ALL_SKILLS } from './skills';
import { EQUIPMENT, getStartingEquipment } from './equipment';

describe('data/classes.js', () => {
  describe('CLASSES', () => {
    it('should have 7 classes', () => {
      expect(CLASSES).toHaveLength(7);
    });

    it('should contain all expected class IDs', () => {
      const ids = CLASSES.map(c => c.id);
      expect(ids).toContain('warrior');
      expect(ids).toContain('mage');
      expect(ids).toContain('rogue');
      expect(ids).toContain('cleric');
      expect(ids).toContain('ranger');
      expect(ids).toContain('paladin');
      expect(ids).toContain('wizard');
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

    it('should have valid statBonuses as objects', () => {
      CLASSES.forEach(cls => {
        expect(cls.statBonuses).toBeInstanceOf(Object);
        Object.values(cls.statBonuses).forEach(val => {
          expect(typeof val).toBe('number');
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

  describe('Wizard class specific tests', () => {
    let wizard;

    beforeEach(() => {
      wizard = CLASSES.find(c => c.id === 'wizard');
    });

    it('should have Wizard class in CLASSES array', () => {
      expect(wizard).toBeDefined();
      expect(wizard.id).toBe('wizard');
    });

    it('should have correct name for Wizard', () => {
      expect(wizard.name).toBe('Wizard');
    });

    it('should have correct stat bonuses for Wizard', () => {
      expect(wizard.statBonuses).toEqual({ int: 2, wis: 1, str: -1 });
    });

    it('should have correct primaryStat for Wizard', () => {
      expect(wizard.primaryStat).toBe('int');
    });

    it('should have correct hitDie for Wizard', () => {
      expect(wizard.hitDie).toBe('d6');
    });

    it('should have correct skillProficiencies for Wizard', () => {
      expect(wizard.skillProficiencies).toBe(2);
    });

    it('should have correct startingSkills for Wizard', () => {
      expect(wizard.startingSkills).toEqual(['fireball', 'magic_missile']);
    });

    it('should have weaponProficiencies for Wizard', () => {
      expect(wizard.weaponProficiencies).toEqual(['staff', 'dagger']);
    });

    it('should have armorProficiencies for Wizard', () => {
      expect(wizard.armorProficiencies).toEqual(['cloth']);
    });

    it('should have a non-empty description for Wizard', () => {
      expect(wizard.description).toBeDefined();
      expect(wizard.description.length).toBeGreaterThan(0);
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
      expect(getClassById('wizard')).toEqual(CLASSES[6]);
    });

    it('should return the Wizard class specifically', () => {
      const wizardClass = getClassById('wizard');
      expect(wizardClass).toBeDefined();
      expect(wizardClass.id).toBe('wizard');
      expect(wizardClass.name).toBe('Wizard');
      expect(wizardClass.hitDie).toBe('d6');
    });

    it('should return undefined for unknown ID', () => {
      expect(getClassById('unknown')).toBeUndefined();
    });
  });

  describe('Wizard starting skills validation', () => {
    it('should have starting skills that are valid skill IDs', () => {
      const wizard = CLASSES.find(c => c.id === 'wizard');
      const validSkillIds = ALL_SKILLS.map(s => s.id);
      wizard.startingSkills.forEach(skillId => {
        expect(validSkillIds).toContain(skillId);
      });
    });

    it('should have fireball skill defined in ALL_SKILLS', () => {
      const fireball = ALL_SKILLS.find(s => s.id === 'fireball');
      expect(fireball).toBeDefined();
      expect(fireball.name).toBe('Fireball');
      expect(fireball.category).toBe('combat');
      expect(fireball.stat).toBe('int');
    });

    it('should have magic_missile skill defined in ALL_SKILLS', () => {
      const magicMissile = ALL_SKILLS.find(s => s.id === 'magic_missile');
      expect(magicMissile).toBeDefined();
      expect(magicMissile.name).toBe('Magic Missile');
      expect(magicMissile.category).toBe('combat');
      expect(magicMissile.stat).toBe('int');
    });
  });

  describe('Wizard starting equipment validation', () => {
    it('should have valid starting equipment for Wizard', () => {
      const wizardEquipment = getStartingEquipment('Wizard');
      expect(wizardEquipment).toBeDefined();

      const allItems = Object.values(EQUIPMENT).flat();
      const allItemIds = allItems.map(item => item.id);

      Object.entries(wizardEquipment).forEach(([slot, itemId]) => {
        expect(allItemIds).toContain(itemId);
      });
    });

    it('should have mage_hood as starting head equipment', () => {
      const wizardEquipment = getStartingEquipment('Wizard');
      expect(wizardEquipment.head).toBe('mage_hood');
    });

    it('should have cloth_robe as starting chest equipment', () => {
      const wizardEquipment = getStartingEquipment('Wizard');
      expect(wizardEquipment.chest).toBe('cloth_robe');
    });

    it('should have mage_leggings as starting pants equipment', () => {
      const wizardEquipment = getStartingEquipment('Wizard');
      expect(wizardEquipment.pants).toBe('mage_leggings');
    });

    it('should have mage_sandals as starting boots equipment', () => {
      const wizardEquipment = getStartingEquipment('Wizard');
      expect(wizardEquipment.boots).toBe('mage_sandals');
    });

    it('should have apprentice_staff as starting rightHand equipment', () => {
      const wizardEquipment = getStartingEquipment('Wizard');
      expect(wizardEquipment.rightHand).toBe('apprentice_staff');
    });

    it('should have tome as starting leftHand equipment', () => {
      const wizardEquipment = getStartingEquipment('Wizard');
      expect(wizardEquipment.leftHand).toBe('tome');
    });
  });

  describe('Wizard skills assigned on class selection', () => {
    it('should assign fireball and magic_missile as starting skills when Wizard is selected', () => {
      const wizard = CLASSES.find(c => c.id === 'wizard');
      expect(wizard.startingSkills).toContain('fireball');
      expect(wizard.startingSkills).toContain('magic_missile');
    });

    it('should have exactly 2 starting skills for Wizard', () => {
      const wizard = CLASSES.find(c => c.id === 'wizard');
      expect(wizard.startingSkills.length).toBe(2);
    });

    it('should have starting skills that match the skillProficiencies count', () => {
      const wizard = CLASSES.find(c => c.id === 'wizard');
      expect(wizard.startingSkills.length).toBe(wizard.skillProficiencies);
    });

    it('should not have duplicate starting skills', () => {
      const wizard = CLASSES.find(c => c.id === 'wizard');
      const uniqueSkills = new Set(wizard.startingSkills);
      expect(uniqueSkills.size).toBe(wizard.startingSkills.length);
    });
  });
});
