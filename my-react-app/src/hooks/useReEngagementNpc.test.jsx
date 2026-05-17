import { renderHook, act } from '@testing-library/react';
import useReEngagementNpc from './useReEngagementNpc';

describe('useReEngagementNpc', () => {
  let mockStore;
  let mockLocalStorage;

  beforeEach(() => {
    mockStore = {};
    mockLocalStorage = {
      getItem: jest.fn((key) => {
        return key in mockStore ? mockStore[key] : null;
      }),
      setItem: jest.fn((key, value) => { mockStore[key] = String(value); }),
      removeItem: jest.fn((key) => { delete mockStore[key]; }),
      clear: jest.fn(() => {
        Object.keys(mockStore).forEach((key) => delete mockStore[key]);
      }),
    };

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('defaults to null reEngagementData when not triggered', () => {
    const { result } = renderHook(() => useReEngagementNpc());

    expect(result.current.reEngagementData).toBeNull();
  });

  it('returns false from shouldTriggerReEngagement when days < 3', () => {
    const { result } = renderHook(() => useReEngagementNpc());

    expect(result.current.shouldTriggerReEngagement(2)).toBe(false);
  });

  it('returns true from shouldTriggerReEngagement when days >= 3', () => {
    const { result } = renderHook(() => useReEngagementNpc());

    expect(result.current.shouldTriggerReEngagement(3)).toBe(true);
    expect(result.current.shouldTriggerReEngagement(5)).toBe(true);
  });

  it('returns false from shouldTriggerReEngagement after being triggered', () => {
    const { result } = renderHook(() => useReEngagementNpc());

    expect(result.current.shouldTriggerReEngagement(3)).toBe(true);

    act(() => {
      result.current.triggerReEngagement();
    });

    // After trigger, reEngagementData is set, so shouldTrigger returns false
    expect(result.current.shouldTriggerReEngagement(3)).toBe(false);
  });

  it('triggers re-engagement and sets reEngagementData', () => {
    const { result } = renderHook(() => useReEngagementNpc());

    expect(result.current.reEngagementData).toBeNull();

    act(() => {
      result.current.triggerReEngagement();
    });

    expect(result.current.reEngagementData).not.toBeNull();
    expect(result.current.reEngagementData.message).toBeDefined();
    expect(result.current.reEngagementData.reward).toBeDefined();
    expect(result.current.reEngagementData.reward.name).toBeDefined();
  });

  it('persists shown state to localStorage on trigger', () => {
    const { result } = renderHook(() => useReEngagementNpc());

    act(() => {
      result.current.triggerReEngagement();
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'rpg_reengagement_shown',
      'true'
    );
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'rpg_reengagement_date',
      expect.any(String)
    );
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'rpg_reengagement_reward',
      expect.any(String)
    );
  });

  it('clears reEngagementData on dismiss', () => {
    const { result } = renderHook(() => useReEngagementNpc());

    act(() => {
      result.current.triggerReEngagement();
    });

    expect(result.current.reEngagementData).not.toBeNull();

    act(() => {
      result.current.dismissReEngagement();
    });

    expect(result.current.reEngagementData).toBeNull();
  });

  it('resets re-engagement state via resetReEngagement', () => {
    const { result } = renderHook(() => useReEngagementNpc());

    act(() => {
      result.current.triggerReEngagement();
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'rpg_reengagement_shown',
      'true'
    );

    act(() => {
      result.current.resetReEngagement();
    });

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      'rpg_reengagement_shown'
    );
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      'rpg_reengagement_date'
    );
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
      'rpg_reengagement_reward'
    );
  });

  it('returns correct npcName from re-engagement data', () => {
    const { result } = renderHook(() => useReEngagementNpc());

    act(() => {
      result.current.triggerReEngagement();
    });

    expect(['Traveling Merchant', 'Old Sage', 'Tower Spirit']).toContain(
      result.current.reEngagementData.npcName
    );
  });
});
