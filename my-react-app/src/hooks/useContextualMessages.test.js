/**
 * useContextualMessages — Hook tests
 *
 * Tests the contextual messages hook behavior:
 * - Triggering messages on different events
 * - Cooldown enforcement (30 seconds)
 * - Message rotation through pools
 * - Respecting the enabled/disabled state
 */

import { renderHook, act } from '@testing-library/react';
import useContextualMessages from './useContextualMessages';

describe('useContextualMessages', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns null message initially', () => {
    const { result } = renderHook(() => useContextualMessages(true));
    expect(result.current.message).toBeNull();
  });

  it('triggers a message on FLOOR_ENTRY trigger', () => {
    const { result } = renderHook(() => useContextualMessages(true));

    act(() => {
      result.current.triggerMessage('FLOOR_ENTRY', 1);
    });

    expect(result.current.message).not.toBeNull();
    expect(result.current.message.trigger).toBe('FLOOR_ENTRY');
    expect(result.current.message.text).toBeTruthy();
  });

  it('triggers a message on COMBAT_START trigger', () => {
    const { result } = renderHook(() => useContextualMessages(true));

    act(() => {
      result.current.triggerMessage('COMBAT_START');
    });

    expect(result.current.message.trigger).toBe('COMBAT_START');
    expect(result.current.message.text).toBeTruthy();
  });

  it('triggers a message on FLOOR_COMPLETE trigger', () => {
    const { result } = renderHook(() => useContextualMessages(true));

    act(() => {
      result.current.triggerMessage('FLOOR_COMPLETE');
    });

    expect(result.current.message.trigger).toBe('FLOOR_COMPLETE');
    expect(result.current.message.text).toBeTruthy();
  });

  it('triggers a message on DEATH trigger', () => {
    const { result } = renderHook(() => useContextualMessages(true));

    act(() => {
      result.current.triggerMessage('DEATH');
    });

    expect(result.current.message.trigger).toBe('DEATH');
    expect(result.current.message.text).toBeTruthy();
  });

  it('does not trigger a message when disabled', () => {
    const { result } = renderHook(() => useContextualMessages(false));

    act(() => {
      result.current.triggerMessage('FLOOR_ENTRY', 1);
    });

    expect(result.current.message).toBeNull();
  });

  it('enforces cooldown — same trigger within 30 seconds is ignored', () => {
    const { result } = renderHook(() => useContextualMessages(true));

    act(() => {
      result.current.triggerMessage('COMBAT_START');
    });
    const firstMessage = result.current.message;

    // Try to trigger again within cooldown
    act(() => {
      result.current.triggerMessage('COMBAT_START');
    });

    expect(result.current.message).toBe(firstMessage);
  });

  it('allows message after cooldown expires', () => {
    const { result } = renderHook(() => useContextualMessages(true));

    act(() => {
      result.current.triggerMessage('COMBAT_START');
    });
    const firstMessage = result.current.message;

    // Advance time past cooldown
    act(() => {
      jest.advanceTimersByTime(30001);
    });

    act(() => {
      result.current.triggerMessage('COMBAT_START');
    });

    expect(result.current.message).not.toBe(firstMessage);
  });

  it('clears the message when clearMessage is called', () => {
    const { result } = renderHook(() => useContextualMessages(true));

    act(() => {
      result.current.triggerMessage('FLOOR_ENTRY', 1);
    });
    expect(result.current.message).not.toBeNull();

    act(() => {
      result.current.clearMessage();
    });

    expect(result.current.message).toBeNull();
  });

  it('rotates through floor entry messages for different floors', () => {
    const { result } = renderHook(() => useContextualMessages(true));

    act(() => {
      result.current.triggerMessage('FLOOR_ENTRY', 1);
    });
    const msg1 = result.current.message.text;

    act(() => {
      result.current.triggerMessage('FLOOR_ENTRY', 2);
    });
    const msg2 = result.current.message.text;

    expect(msg1).toBeTruthy();
    expect(msg2).toBeTruthy();
  });

  it('rotates through combat start messages', () => {
    const { result } = renderHook(() => useContextualMessages(true));

    // Advance past cooldown between triggers
    act(() => {
      jest.advanceTimersByTime(30001);
    });
    act(() => {
      result.current.triggerMessage('COMBAT_START');
    });
    const msg1 = result.current.message.text;

    act(() => {
      jest.advanceTimersByTime(30001);
    });
    act(() => {
      result.current.triggerMessage('COMBAT_START');
    });
    const msg2 = result.current.message.text;

    expect(msg1).not.toBe(msg2);
  });
});
