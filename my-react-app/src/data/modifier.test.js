describe('Stat modifier formula', () => {
  const BASE_STAT = 8;

  function getModifier(value) {
    return Math.floor((value - BASE_STAT) / 2);
  }

  it('should return 0 for base stat (8)', () => {
    expect(getModifier(8)).toBe(0);
  });

  it('should return 0 for stat 9', () => {
    expect(getModifier(9)).toBe(0);
  });

  it('should return 1 for stat 10', () => {
    expect(getModifier(10)).toBe(1);
  });

  it('should return 1 for stat 11', () => {
    expect(getModifier(11)).toBe(1);
  });

  it('should return 2 for stat 12', () => {
    expect(getModifier(12)).toBe(2);
  });

  it('should return 3 for stat 14', () => {
    expect(getModifier(14)).toBe(3);
  });

  it('should return 3 for stat 15', () => {
    expect(getModifier(15)).toBe(3);
  });

  it('should return -1 for stat 7 (below base)', () => {
    expect(getModifier(7)).toBe(-1);
  });

  it('should return -1 for stat 6 (below base)', () => {
    expect(getModifier(6)).toBe(-1);
  });

  it('should follow the standard D&D modifier formula', () => {
    const expected = {
      8: 0,
      9: 0,
      10: 1,
      11: 1,
      12: 2,
      13: 2,
      14: 3,
      15: 3,
    };
    Object.entries(expected).forEach(([stat, modifier]) => {
      expect(getModifier(parseInt(stat))).toBe(modifier);
    });
  });
});
