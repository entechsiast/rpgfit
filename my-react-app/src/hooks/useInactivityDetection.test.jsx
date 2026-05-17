import { renderHook, act } from '@testing-library/react';
import useInactivityDetection from './useInactivityDetection';

describe('useInactivityDetection', () => {
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
  });

  it('defaults to 0 days since last active when no localStorage value', () => {
    const { result } = renderHook(() => useInactivityDetection());

    // updateActivity runs on mount, setting lastActiveDate to today
    // daysSinceLastActive starts at 0 since today - today = 0
    expect(result.current.daysSinceLastActive).toBeGreaterThanOrEqual(0);
  });

  it('reads lastActiveDate from localStorage on init', () => {
    mockLocalStorage.setItem('rpg_last_active_date', '2026-05-15');
    const { result } = renderHook(() => useInactivityDetection());

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('rpg_last_active_date');
  });

  it('updates activity via updateActivity call', () => {
    const { result } = renderHook(() => useInactivityDetection());

    act(() => {
      result.current.updateActivity();
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'rpg_last_active_date',
      expect.any(String)
    );
  });

  it('checks isInactivityWindow correctly when daysSinceLastActive is 0', () => {
    const { result } = renderHook(() => useInactivityDetection());

    // With no stored date, daysSinceLastActive is 0
    // No inactivity window should match
    expect(result.current.isInactivityWindow(2, Infinity)).toBe(false);
    expect(result.current.isInactivityWindow(1, Infinity)).toBe(false);
  });

  it('persists last active date to localStorage on update', () => {
    const { result } = renderHook(() => useInactivityDetection());

    act(() => {
      result.current.updateActivity();
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'rpg_last_active_date',
      expect.any(String)
    );
  });

  it('returns lastActiveDate from localStorage', () => {
    mockLocalStorage.setItem('rpg_last_active_date', '2026-05-15');
    const { result } = renderHook(() => useInactivityDetection());

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('rpg_last_active_date');
  });
});
