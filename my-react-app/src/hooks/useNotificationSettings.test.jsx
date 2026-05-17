import { renderHook, act } from '@testing-library/react';
import useNotificationSettings from './useNotificationSettings';

describe('useNotificationSettings', () => {
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

  it('defaults to enabled when no localStorage value exists', () => {
    const { result } = renderHook(() => useNotificationSettings());

    expect(result.current.enabled).toBe(true);
  });

  it('reads enabled state from localStorage on init', () => {
    mockLocalStorage.setItem('rpg_notifications_enabled', 'false');
    const { result } = renderHook(() => useNotificationSettings());

    expect(result.current.enabled).toBe(false);
  });

  it('persists enabled state to localStorage on toggle', () => {
    const { result } = renderHook(() => useNotificationSettings());

    act(() => {
      result.current.disableNotifications();
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'rpg_notifications_enabled',
      'false'
    );
  });

  it('returns true from shouldShowNotification when enabled and no notifications today', () => {
    const { result } = renderHook(() => useNotificationSettings());

    expect(result.current.shouldShowNotification()).toBe(true);
  });

  it('returns false from shouldShowNotification when disabled', () => {
    mockLocalStorage.setItem('rpg_notifications_enabled', 'false');
    const { result } = renderHook(() => useNotificationSettings());

    expect(result.current.shouldShowNotification()).toBe(false);
  });

  it('records a notification and increments counter', () => {
    const { result } = renderHook(() => useNotificationSettings());

    act(() => {
      result.current.recordNotification();
    });

    expect(result.current.notificationsToday).toBe(1);
  });

  it('enforces max 1 notification per day', () => {
    const { result } = renderHook(() => useNotificationSettings());

    // First call sets notificationsToday to 1
    act(() => {
      result.current.recordNotification();
    });

    // Second call should cap at 1 (not increment to 2)
    act(() => {
      result.current.recordNotification();
    });

    expect(result.current.notificationsToday).toBe(1);
  });

  it('disables notifications via disableNotifications', () => {
    const { result } = renderHook(() => useNotificationSettings());

    act(() => {
      result.current.disableNotifications();
    });

    expect(result.current.enabled).toBe(false);
    expect(result.current.shouldShowNotification()).toBe(false);
  });

  it('enables notifications via enableNotifications', () => {
    mockLocalStorage.setItem('rpg_notifications_enabled', 'false');
    const { result } = renderHook(() => useNotificationSettings());

    act(() => {
      result.current.enableNotifications();
    });

    expect(result.current.enabled).toBe(true);
  });

  it('toggles notifications via toggleNotifications', () => {
    const { result } = renderHook(() => useNotificationSettings());

    expect(result.current.enabled).toBe(true);

    act(() => {
      result.current.toggleNotifications();
    });

    expect(result.current.enabled).toBe(false);

    act(() => {
      result.current.toggleNotifications();
    });

    expect(result.current.enabled).toBe(true);
  });

  it('resets daily counter via resetDailyCounter', () => {
    const { result } = renderHook(() => useNotificationSettings());

    act(() => {
      result.current.recordNotification();
    });

    expect(result.current.notificationsToday).toBe(1);

    act(() => {
      result.current.resetDailyCounter();
    });

    expect(result.current.notificationsToday).toBe(0);
    expect(result.current.lastNotificationDate).toBeNull();
  });
});
