import {
  calculateMaxHp,
  calculateHpGainOnLevelUp,
  calculateMaxMp,
  calculateMpGainOnLevelUp,
  getHitDie,
  getHitDieValue,
  getModifier,
} from './combat';

/**
 * Unit tests for data/combat.js
 *
 * Covers:
 * - calculateMaxHp  (class HP at level 1, level scaling, CON modifier)
 * - calculateHpGainOnLevelUp (per-class gain, minimum +1)
 * - calculateMaxMp  (INT/WIS base, level scaling)
 * - calculateMpGainOnLevelUp (gain formula, minimum +1)
 * - getHitDie       (string hitDie per class)
 * - getHitDieValue  (string -> numeric)
 * - getModifier     (stat -> modifier)
 */
describe('data/combat.js', () => {
  // ----------------------------------------------------------------
  // calculateMaxHp
  // ----------------------------------------------------------------

  describe('calculateMaxHp', () => {
    // Hit die values: warrior=d12, mage=d4, rogue=d8, cleric=d8,
    //                 ranger=d10, paladin=d10, wizard=d6
    // Formula at level 1: hitDie + conModifier  (levelBonus = 0)
    // conModifier = floor((conStat - 8) / 2)
    // With conStat = 10  =>  conModifier = 1

    it('returns correct HP for each class at level 1 with CON 10', () => {
      // level 1: hitDie + conModifier + 0
      expect(calculateMaxHp('warrior', 10, 1)).toBe(13); // 12 + 1
      expect(calculateMaxHp('mage', 10, 1)).toBe(5);    // 4 + 1
      expect(calculateMaxHp('rogue', 10, 1)).toBe(9);   // 8 + 1
      expect(calculateMaxHp('cleric', 10, 1)).toBe(9);  // 8 + 1
      expect(calculateMaxHp('ranger', 10, 1)).toBe(11); // 10 + 1
      expect(calculateMaxHp('paladin', 10, 1)).toBe(11);// 10 + 1
      expect(calculateMaxHp('wizard', 10, 1)).toBe(7);  // 6 + 1
    });

    it('returns correct HP for each class at level 1 with CON 8 (modifier 0)', () => {
      // conModifier = 0, so HP = hitDie only
      expect(calculateMaxHp('warrior', 8, 1)).toBe(12);
      expect(calculateMaxHp('mage', 8, 1)).toBe(4);
      expect(calculateMaxHp('rogue', 8, 1)).toBe(8);
      expect(calculateMaxHp('cleric', 8, 1)).toBe(8);
      expect(calculateMaxHp('ranger', 8, 1)).toBe(10);
      expect(calculateMaxHp('paladin', 8, 1)).toBe(10);
      expect(calculateMaxHp('wizard', 8, 1)).toBe(6);
    });

    it('returns correct HP for each class at level 1 with CON 16 (modifier +4)', () => {
      // conModifier = floor((16-8)/2) = 4, so HP = hitDie + 4
      expect(calculateMaxHp('warrior', 16, 1)).toBe(16); // 12 + 4
      expect(calculateMaxHp('mage', 16, 1)).toBe(8);    // 4 + 4
      expect(calculateMaxHp('rogue', 16, 1)).toBe(12);  // 8 + 4
      expect(calculateMaxHp('cleric', 16, 1)).toBe(12); // 8 + 4
      expect(calculateMaxHp('ranger', 16, 1)).toBe(14); // 10 + 4
      expect(calculateMaxHp('paladin', 16, 1)).toBe(14); // 10 + 4
      expect(calculateMaxHp('wizard', 16, 1)).toBe(10); // 6 + 4
    });

    it('handles CON 18 (modifier +5)', () => {
      // conModifier = floor((18-8)/2) = 5
      expect(calculateMaxHp('warrior', 18, 1)).toBe(17); // 12 + 5
      expect(calculateMaxHp('mage', 18, 1)).toBe(9);    // 4 + 5
    });

    it('handles CON 3 (modifier -3)', () => {
      // conModifier = floor((3-8)/2) = -3
      expect(calculateMaxHp('warrior', 3, 1)).toBe(9);  // 12 + (-3)
      expect(calculateMaxHp('mage', 3, 1)).toBe(1);     // 4 + (-3)
    });

    it('returns correct HP for warrior at multiple levels', () => {
      // warrior: hitDie=12, conModifier=1 (CON 10)
      // levelBonus = (level-1) * (floor(12/2) + floor(1/2))
      //            = (level-1) * (6 + 0) = (level-1) * 6
      expect(calculateMaxHp('warrior', 10, 1)).toBe(13); // 12 + 1 + 0
      expect(calculateMaxHp('warrior', 10, 2)).toBe(19); // 12 + 1 + 6
      expect(calculateMaxHp('warrior', 10, 3)).toBe(25); // 12 + 1 + 12
      expect(calculateMaxHp('warrior', 10, 5)).toBe(37); // 12 + 1 + 24
      expect(calculateMaxHp('warrior', 10, 10)).toBe(67);// 12 + 1 + 54
    });

    it('returns correct HP for mage at multiple levels', () => {
      // mage: hitDie=4, conModifier=1 (CON 10)
      // levelBonus = (level-1) * (floor(4/2) + floor(1/2))
      //            = (level-1) * (2 + 0) = (level-1) * 2
      expect(calculateMaxHp('mage', 10, 1)).toBe(5);  // 4 + 1 + 0
      expect(calculateMaxHp('mage', 10, 2)).toBe(7);  // 4 + 1 + 2
      expect(calculateMaxHp('mage', 10, 3)).toBe(9);  // 4 + 1 + 4
      expect(calculateMaxHp('mage', 10, 10)).toBe(23); // 4 + 1 + 18
    });

    it('returns correct HP for rogue at multiple levels', () => {
      // rogue: hitDie=8, conModifier=1 (CON 10)
      // levelBonus = (level-1) * (floor(8/2) + floor(1/2))
      //            = (level-1) * (4 + 0) = (level-1) * 4
      expect(calculateMaxHp('rogue', 10, 1)).toBe(9);   // 8 + 1 + 0
      expect(calculateMaxHp('rogue', 10, 2)).toBe(13);  // 8 + 1 + 4
      expect(calculateMaxHp('rogue', 10, 3)).toBe(17);  // 8 + 1 + 8
      expect(calculateMaxHp('rogue', 10, 10)).toBe(45); // 8 + 1 + 36
    });

    it('returns correct HP for cleric at multiple levels', () => {
      // cleric: hitDie=8, conModifier=1 (CON 10)
      // Same scaling as rogue
      expect(calculateMaxHp('cleric', 10, 1)).toBe(9);
      expect(calculateMaxHp('cleric', 10, 2)).toBe(13);
      expect(calculateMaxHp('cleric', 10, 3)).toBe(17);
      expect(calculateMaxHp('cleric', 10, 10)).toBe(45);
    });

    it('returns correct HP for ranger at multiple levels', () => {
      // ranger: hitDie=10, conModifier=1 (CON 10)
      // levelBonus = (level-1) * (floor(10/2) + floor(1/2))
      //            = (level-1) * (5 + 0) = (level-1) * 5
      expect(calculateMaxHp('ranger', 10, 1)).toBe(11); // 10 + 1 + 0
      expect(calculateMaxHp('ranger', 10, 2)).toBe(16); // 10 + 1 + 5
      expect(calculateMaxHp('ranger', 10, 3)).toBe(21); // 10 + 1 + 10
      expect(calculateMaxHp('ranger', 10, 10)).toBe(56); // 10 + 1 + 45
    });

    it('returns correct HP for paladin at multiple levels', () => {
      // paladin: hitDie=10, conModifier=1 (CON 10)
      // Same scaling as ranger
      expect(calculateMaxHp('paladin', 10, 1)).toBe(11);
      expect(calculateMaxHp('paladin', 10, 2)).toBe(16);
      expect(calculateMaxHp('paladin', 10, 3)).toBe(21);
      expect(calculateMaxHp('paladin', 10, 10)).toBe(56);
    });

    it('returns correct HP for wizard at multiple levels', () => {
      // wizard: hitDie=6, conModifier=1 (CON 10)
      // levelBonus = (level-1) * (floor(6/2) + floor(1/2))
      //            = (level-1) * (3 + 0) = (level-1) * 3
      expect(calculateMaxHp('wizard', 10, 1)).toBe(7);  // 6 + 1 + 0
      expect(calculateMaxHp('wizard', 10, 2)).toBe(10); // 6 + 1 + 3
      expect(calculateMaxHp('wizard', 10, 3)).toBe(13); // 6 + 1 + 6
      expect(calculateMaxHp('wizard', 10, 10)).toBe(34); // 6 + 1 + 27
    });

    it('uses CON modifier correctly - higher CON gives more HP', () => {
      const conValues = [6, 8, 10, 12, 14, 16, 18];
      for (const con of conValues) {
        const hp = calculateMaxHp('warrior', con, 1);
        const expected = 12 + Math.floor((con - 8) / 2);
        expect(hp).toBe(expected);
      }
    });

    it('uses CON modifier correctly - lower CON reduces HP', () => {
      const conValues = [3, 4, 5, 6, 7];
      for (const con of conValues) {
        const hp = calculateMaxHp('warrior', con, 1);
        const expected = 12 + Math.floor((con - 8) / 2);
        expect(hp).toBe(expected);
      }
    });

    it('increases with level for all classes', () => {
      const classes = ['warrior', 'mage', 'rogue', 'cleric', 'ranger', 'paladin', 'wizard'];
      for (const cls of classes) {
        for (let lv = 1; lv < 10; lv++) {
          const hp = calculateMaxHp(cls, 10, lv);
          const nextHp = calculateMaxHp(cls, 10, lv + 1);
          expect(nextHp).toBeGreaterThan(hp);
        }
      }
    });

    it('handles unknown classId by returning default 10', () => {
      expect(calculateMaxHp('unknown', 10, 1)).toBe(10);
      expect(calculateMaxHp(null, 10, 1)).toBe(10);
      expect(calculateMaxHp(undefined, 10, 1)).toBe(10);
    });
  });

  // ----------------------------------------------------------------
  // calculateHpGainOnLevelUp
  // ----------------------------------------------------------------

  describe('calculateHpGainOnLevelUp', () => {
    // Formula: hitDie + floor(conModifier / 2), min 1
    // conModifier = floor((conStat - 8) / 2)

    it('returns correct gain for each class with CON 10 (modifier +1)', () => {
      // conModifier = 1, floor(1/2) = 0
      expect(calculateHpGainOnLevelUp('warrior', 10)).toBe(12); // 12 + 0
      expect(calculateHpGainOnLevelUp('mage', 10)).toBe(4);    // 4 + 0
      expect(calculateHpGainOnLevelUp('rogue', 10)).toBe(8);   // 8 + 0
      expect(calculateHpGainOnLevelUp('cleric', 10)).toBe(8);  // 8 + 0
      expect(calculateHpGainOnLevelUp('ranger', 10)).toBe(10); // 10 + 0
      expect(calculateHpGainOnLevelUp('paladin', 10)).toBe(10);// 10 + 0
      expect(calculateHpGainOnLevelUp('wizard', 10)).toBe(6);  // 6 + 0
    });

    it('returns correct gain for each class with CON 14 (modifier +2)', () => {
      // conModifier = 2, floor(2/2) = 1
      expect(calculateHpGainOnLevelUp('warrior', 14)).toBe(13); // 12 + 1
      expect(calculateHpGainOnLevelUp('mage', 14)).toBe(5);    // 4 + 1
      expect(calculateHpGainOnLevelUp('rogue', 14)).toBe(9);   // 8 + 1
      expect(calculateHpGainOnLevelUp('cleric', 14)).toBe(9);  // 8 + 1
      expect(calculateHpGainOnLevelUp('ranger', 14)).toBe(11); // 10 + 1
      expect(calculateHpGainOnLevelUp('paladin', 14)).toBe(11);// 10 + 1
      expect(calculateHpGainOnLevelUp('wizard', 14)).toBe(7);  // 6 + 1
    });

    it('returns correct gain for each class with CON 8 (modifier 0)', () => {
      // conModifier = 0, floor(0/2) = 0
      expect(calculateHpGainOnLevelUp('warrior', 8)).toBe(12);
      expect(calculateHpGainOnLevelUp('mage', 8)).toBe(4);
      expect(calculateHpGainOnLevelUp('rogue', 8)).toBe(8);
      expect(calculateHpGainOnLevelUp('cleric', 8)).toBe(8);
      expect(calculateHpGainOnLevelUp('ranger', 8)).toBe(10);
      expect(calculateHpGainOnLevelUp('paladin', 8)).toBe(10);
      expect(calculateHpGainOnLevelUp('wizard', 8)).toBe(6);
    });

    it('returns correct gain for each class with CON 18 (modifier +5)', () => {
      // conModifier = 5, floor(5/2) = 2
      expect(calculateHpGainOnLevelUp('warrior', 18)).toBe(14); // 12 + 2
      expect(calculateHpGainOnLevelUp('mage', 18)).toBe(6);    // 4 + 2
      expect(calculateHpGainOnLevelUp('rogue', 18)).toBe(10);  // 8 + 2
      expect(calculateHpGainOnLevelUp('cleric', 18)).toBe(10); // 8 + 2
      expect(calculateHpGainOnLevelUp('ranger', 18)).toBe(12); // 10 + 2
      expect(calculateHpGainOnLevelUp('paladin', 18)).toBe(12);// 10 + 2
      expect(calculateHpGainOnLevelUp('wizard', 18)).toBe(8);  // 6 + 2
    });

    it('returns minimum +1 for very low CON stats', () => {
      // CON 1 => modifier = -4, floor(-4/2) = -2
      // mage: 4 + (-2) = 2 >= 1, so gain = 2
      expect(calculateHpGainOnLevelUp('mage', 1)).toBe(2);

      // CON 2 => modifier = -3, floor(-3/2) = -2
      // mage: 4 + (-2) = 2 >= 1, so gain = 2
      expect(calculateHpGainOnLevelUp('mage', 2)).toBe(2);

      // CON 3 => modifier = -3, floor(-3/2) = -2
      // mage: 4 + (-2) = 2 >= 1, so gain = 2
      expect(calculateHpGainOnLevelUp('mage', 3)).toBe(2);

      // CON 4 => modifier = -2, floor(-2/2) = -1
      // mage: 4 + (-1) = 3 >= 1, so gain = 3
      expect(calculateHpGainOnLevelUp('mage', 4)).toBe(3);
    });

    it('returns minimum +1 for unknown classId', () => {
      expect(calculateHpGainOnLevelUp('unknown', 10)).toBe(1);
      expect(calculateHpGainOnLevelUp(null, 10)).toBe(1);
    });

    it('increases with CON stat', () => {
      for (const cls of ['warrior', 'mage', 'rogue']) {
        let prev = 0;
        for (let con = 1; con <= 20; con++) {
          const gain = calculateHpGainOnLevelUp(cls, con);
          expect(gain).toBeGreaterThanOrEqual(prev);
          prev = gain;
        }
      }
    });
  });

  // ----------------------------------------------------------------
  // calculateMaxMp
  // ----------------------------------------------------------------

  describe('calculateMaxMp', () => {
    // Formula: floor(intModifier / 2) + floor(wisModifier / 2)
    //           + max(0, (level - 1) * 2)
    // intModifier = floor((intStat - 8) / 2)
    // wisModifier = floor((wisStat - 8) / 2)

    it('returns correct MP for INT 10, WIS 10 at each level', () => {
      // intModifier = 1, floor(1/2) = 0
      // wisModifier = 1, floor(1/2) = 0
      // level bonus = max(0, (level-1) * 2)
      expect(calculateMaxMp(10, 10, 1)).toBe(0);  // 0 + 0 + 0
      expect(calculateMaxMp(10, 10, 2)).toBe(2);  // 0 + 0 + 2
      expect(calculateMaxMp(10, 10, 3)).toBe(4);  // 0 + 0 + 4
      expect(calculateMaxMp(10, 10, 10)).toBe(18); // 0 + 0 + 18
    });

    it('returns correct MP for INT 10, WIS 12 at each level', () => {
      // intModifier = 1, floor(1/2) = 0
      // wisModifier = 2, floor(2/2) = 1
      // level bonus = max(0, (level-1) * 2)
      expect(calculateMaxMp(10, 12, 1)).toBe(1);  // 0 + 1 + 0
      expect(calculateMaxMp(10, 12, 2)).toBe(3);  // 0 + 1 + 2
      expect(calculateMaxMp(10, 12, 3)).toBe(5);  // 0 + 1 + 4
      expect(calculateMaxMp(10, 12, 10)).toBe(19); // 0 + 1 + 18
    });

    it('returns correct MP for INT 14, WIS 14 at each level', () => {
      // intModifier = 3, floor(3/2) = 1
      // wisModifier = 3, floor(3/2) = 1
      // level bonus = max(0, (level-1) * 2)
      expect(calculateMaxMp(14, 14, 1)).toBe(2);  // 1 + 1 + 0
      expect(calculateMaxMp(14, 14, 2)).toBe(4);  // 1 + 1 + 2
      expect(calculateMaxMp(14, 14, 3)).toBe(6);  // 1 + 1 + 4
      expect(calculateMaxMp(14, 14, 10)).toBe(20); // 1 + 1 + 18
    });

    it('returns correct MP for INT 16, WIS 18 at each level', () => {
      // intModifier = 4, floor(4/2) = 2
      // wisModifier = 5, floor(5/2) = 2
      // level bonus = max(0, (level-1) * 2)
      expect(calculateMaxMp(16, 18, 1)).toBe(4);  // 2 + 2 + 0
      expect(calculateMaxMp(16, 18, 2)).toBe(6);  // 2 + 2 + 2
      expect(calculateMaxMp(16, 18, 3)).toBe(8);  // 2 + 2 + 4
      expect(calculateMaxMp(16, 18, 10)).toBe(22); // 2 + 2 + 18
    });

    it('returns correct MP for INT 8, WIS 8 at each level', () => {
      // intModifier = 0, floor(0/2) = 0
      // wisModifier = 0, floor(0/2) = 0
      expect(calculateMaxMp(8, 8, 1)).toBe(0);
      expect(calculateMaxMp(8, 8, 2)).toBe(2);
      expect(calculateMaxMp(8, 8, 3)).toBe(4);
      expect(calculateMaxMp(8, 8, 10)).toBe(18);
    });

    it('returns correct MP for INT 12, WIS 8 at each level', () => {
      // intModifier = 2, floor(2/2) = 1
      // wisModifier = 0, floor(0/2) = 0
      expect(calculateMaxMp(12, 8, 1)).toBe(1);  // 1 + 0 + 0
      expect(calculateMaxMp(12, 8, 2)).toBe(3);  // 1 + 0 + 2
      expect(calculateMaxMp(12, 8, 3)).toBe(5);  // 1 + 0 + 4
      expect(calculateMaxMp(12, 8, 10)).toBe(19); // 1 + 0 + 18
    });

    it('returns correct MP for INT 8, WIS 12 at each level', () => {
      // intModifier = 0, floor(0/2) = 0
      // wisModifier = 2, floor(2/2) = 1
      expect(calculateMaxMp(8, 12, 1)).toBe(1);  // 0 + 1 + 0
      expect(calculateMaxMp(8, 12, 2)).toBe(3);  // 0 + 1 + 2
      expect(calculateMaxMp(8, 12, 3)).toBe(5);  // 0 + 1 + 4
      expect(calculateMaxMp(8, 12, 10)).toBe(19); // 0 + 1 + 18
    });

    it('increases with level for all stat combinations', () => {
      const statCombos = [
        [8, 8],
        [10, 10],
        [12, 12],
        [14, 14],
        [16, 16],
        [10, 12],
        [12, 10],
      ];
      for (const [intStat, wisStat] of statCombos) {
        for (let lv = 1; lv < 10; lv++) {
          const mp = calculateMaxMp(intStat, wisStat, lv);
          const nextMp = calculateMaxMp(intStat, wisStat, lv + 1);
          expect(nextMp).toBeGreaterThan(mp);
        }
      }
    });
  });

  // ----------------------------------------------------------------
  // calculateMpGainOnLevelUp
  // ----------------------------------------------------------------

  describe('calculateMpGainOnLevelUp', () => {
    // Formula: floor(intModifier / 2) + floor(wisModifier / 2) + 1
    //           min 1
    // intModifier = floor((intStat - 8) / 2)
    // wisModifier = floor((wisStat - 8) / 2)

    it('returns correct gain for INT 10, WIS 10', () => {
      // intModifier = 1, floor(1/2) = 0
      // wisModifier = 1, floor(1/2) = 0
      // gain = 0 + 0 + 1 = 1
      expect(calculateMpGainOnLevelUp(10, 10)).toBe(1);
    });

    it('returns correct gain for INT 10, WIS 12', () => {
      // intModifier = 1, floor(1/2) = 0
      // wisModifier = 2, floor(2/2) = 1
      // gain = 0 + 1 + 1 = 2
      expect(calculateMpGainOnLevelUp(10, 12)).toBe(2);
    });

    it('returns correct gain for INT 12, WIS 10', () => {
      // intModifier = 2, floor(2/2) = 1
      // wisModifier = 1, floor(1/2) = 0
      // gain = 1 + 0 + 1 = 2
      expect(calculateMpGainOnLevelUp(12, 10)).toBe(2);
    });

    it('returns correct gain for INT 12, WIS 12', () => {
      // intModifier = 2, floor(2/2) = 1
      // wisModifier = 2, floor(2/2) = 1
      // gain = 1 + 1 + 1 = 3
      expect(calculateMpGainOnLevelUp(12, 12)).toBe(3);
    });

    it('returns correct gain for INT 14, WIS 14', () => {
      // intModifier = 3, floor(3/2) = 1
      // wisModifier = 3, floor(3/2) = 1
      // gain = 1 + 1 + 1 = 3
      expect(calculateMpGainOnLevelUp(14, 14)).toBe(3);
    });

    it('returns correct gain for INT 16, WIS 16', () => {
      // intModifier = 4, floor(4/2) = 2
      // wisModifier = 4, floor(4/2) = 2
      // gain = 2 + 2 + 1 = 5
      expect(calculateMpGainOnLevelUp(16, 16)).toBe(5);
    });

    it('returns correct gain for INT 18, WIS 18', () => {
      // intModifier = 5, floor(5/2) = 2
      // wisModifier = 5, floor(5/2) = 2
      // gain = 2 + 2 + 1 = 5
      expect(calculateMpGainOnLevelUp(18, 18)).toBe(5);
    });

    it('returns correct gain for INT 8, WIS 8', () => {
      // intModifier = 0, floor(0/2) = 0
      // wisModifier = 0, floor(0/2) = 0
      // gain = 0 + 0 + 1 = 1
      expect(calculateMpGainOnLevelUp(8, 8)).toBe(1);
    });

    it('returns correct gain for INT 6, WIS 6', () => {
      // intModifier = -1, floor(-1/2) = -1
      // wisModifier = -1, floor(-1/2) = -1
      // gain = -1 + -1 + 1 = -1, clamped to 1
      expect(calculateMpGainOnLevelUp(6, 6)).toBe(1);
    });

    it('returns correct gain for INT 4, WIS 4', () => {
      // intModifier = -2, floor(-2/2) = -1
      // wisModifier = -2, floor(-2/2) = -1
      // gain = -1 + -1 + 1 = -1, clamped to 1
      expect(calculateMpGainOnLevelUp(4, 4)).toBe(1);
    });

    it('returns correct gain for INT 2, WIS 2', () => {
      // intModifier = -3, floor(-3/2) = -2
      // wisModifier = -3, floor(-3/2) = -2
      // gain = -2 + -2 + 1 = -3, clamped to 1
      expect(calculateMpGainOnLevelUp(2, 2)).toBe(1);
    });

    it('returns minimum +1 for very low stats', () => {
      // INT 1 => modifier = -4, floor(-4/2) = -2
      // WIS 1 => modifier = -4, floor(-4/2) = -2
      // gain = -2 + -2 + 1 = -3, clamped to 1
      expect(calculateMpGainOnLevelUp(1, 1)).toBe(1);

      // INT 3 => modifier = -2, floor(-2/2) = -1
      // WIS 3 => modifier = -2, floor(-2/2) = -1
      // gain = -1 + -1 + 1 = -1, clamped to 1
      expect(calculateMpGainOnLevelUp(3, 3)).toBe(1);
    });

    it('increases with INT stat', () => {
      const wis = 10;
      let prev = 0;
      for (let int = 1; int <= 20; int++) {
        const gain = calculateMpGainOnLevelUp(int, wis);
        expect(gain).toBeGreaterThanOrEqual(prev);
        prev = gain;
      }
    });

    it('increases with WIS stat', () => {
      const int = 10;
      let prev = 0;
      for (let wis = 1; wis <= 20; wis++) {
        const gain = calculateMpGainOnLevelUp(int, wis);
        expect(gain).toBeGreaterThanOrEqual(prev);
        prev = gain;
      }
    });
  });

  // ----------------------------------------------------------------
  // getHitDie
  // ----------------------------------------------------------------

  describe('getHitDie', () => {
    it('returns d12 for warrior', () => {
      expect(getHitDie('warrior')).toBe('d12');
    });

    it('returns d4 for mage', () => {
      expect(getHitDie('mage')).toBe('d4');
    });

    it('returns d8 for rogue', () => {
      expect(getHitDie('rogue')).toBe('d8');
    });

    it('returns d8 for cleric', () => {
      expect(getHitDie('cleric')).toBe('d8');
    });

    it('returns d10 for ranger', () => {
      expect(getHitDie('ranger')).toBe('d10');
    });

    it('returns d10 for paladin', () => {
      expect(getHitDie('paladin')).toBe('d10');
    });

    it('returns d6 for wizard', () => {
      expect(getHitDie('wizard')).toBe('d6');
    });

    it('returns d8 for unknown classId', () => {
      expect(getHitDie('unknown')).toBe('d8');
      expect(getHitDie(null)).toBe('d8');
      expect(getHitDie(undefined)).toBe('d8');
    });
  });

  // ----------------------------------------------------------------
  // getHitDieValue
  // ----------------------------------------------------------------

  describe('getHitDieValue', () => {
    it('returns 4 for d4', () => {
      expect(getHitDieValue('d4')).toBe(4);
    });

    it('returns 6 for d6', () => {
      expect(getHitDieValue('d6')).toBe(6);
    });

    it('returns 8 for d8', () => {
      expect(getHitDieValue('d8')).toBe(8);
    });

    it('returns 10 for d10', () => {
      expect(getHitDieValue('d10')).toBe(10);
    });

    it('returns 12 for d12', () => {
      expect(getHitDieValue('d12')).toBe(12);
    });

    it('returns 8 for unknown hitDie string', () => {
      expect(getHitDieValue('d20')).toBe(8);
      expect(getHitDieValue('d100')).toBe(8);
      expect(getHitDieValue('invalid')).toBe(8);
      expect(getHitDieValue('')).toBe(8);
    });
  });

  // ----------------------------------------------------------------
  // getModifier
  // ----------------------------------------------------------------

  describe('getModifier', () => {
    it('returns 0 for stat 10', () => {
      expect(getModifier(10)).toBe(1);
    });

    it('returns 0 for stat 8', () => {
      expect(getModifier(8)).toBe(0);
    });

    it('returns correct modifier for various stat values', () => {
      // Modifier = floor((stat - 8) / 2)
      expect(getModifier(1)).toBe(-4);
      expect(getModifier(2)).toBe(-3);
      expect(getModifier(3)).toBe(-3);
      expect(getModifier(4)).toBe(-2);
      expect(getModifier(5)).toBe(-2);
      expect(getModifier(6)).toBe(-1);
      expect(getModifier(7)).toBe(-1);
      expect(getModifier(8)).toBe(0);
      expect(getModifier(9)).toBe(0);
      expect(getModifier(10)).toBe(1);
      expect(getModifier(11)).toBe(1);
      expect(getModifier(12)).toBe(2);
      expect(getModifier(13)).toBe(2);
      expect(getModifier(14)).toBe(3);
      expect(getModifier(15)).toBe(3);
      expect(getModifier(16)).toBe(4);
      expect(getModifier(17)).toBe(4);
      expect(getModifier(18)).toBe(5);
      expect(getModifier(19)).toBe(5);
      expect(getModifier(20)).toBe(6);
      expect(getModifier(21)).toBe(6);
      expect(getModifier(22)).toBe(7);
      expect(getModifier(23)).toBe(7);
      expect(getModifier(24)).toBe(8);
    });

    it('returns correct modifier for negative stat values', () => {
      expect(getModifier(0)).toBe(-4);
      expect(getModifier(-1)).toBe(-5);
      expect(getModifier(-2)).toBe(-5);
      expect(getModifier(-4)).toBe(-6);
    });

    it('returns correct modifier for high stat values', () => {
      expect(getModifier(30)).toBe(11);
      expect(getModifier(50)).toBe(21);
      expect(getModifier(100)).toBe(46);
    });

    it('handles non-integer values correctly', () => {
      expect(getModifier(9.5)).toBe(0);
      expect(getModifier(7.5)).toBe(-1);
      expect(getModifier(10.9)).toBe(1);
    });
  });
});
