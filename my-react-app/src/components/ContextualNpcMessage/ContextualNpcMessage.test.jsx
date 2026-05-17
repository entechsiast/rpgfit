/**
 * ContextualNpcMessage — Component tests
 *
 * Tests the floating contextual NPC message display component.
 * Verifies message rendering, trigger labels, dismiss behavior,
 * and auto-dismiss timing.
 */

import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import ContextualNpcMessage from './ContextualNpcMessage';

describe('ContextualNpcMessage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const baseMessage = {
    text: 'The tower remembers you.',
    trigger: 'FLOOR_ENTRY',
  };

  it('renders the message text', () => {
    render(<ContextualNpcMessage message={baseMessage} />);
    expect(screen.getByText('The tower remembers you.')).toBeInTheDocument();
  });

  it('displays the correct trigger badge label', () => {
    render(<ContextualNpcMessage message={baseMessage} />);
    expect(screen.getByText('Floor Entry')).toBeInTheDocument();
  });

  it('shows the Combat badge for COMBAT_START trigger', () => {
    render(
      <ContextualNpcMessage
        message={{ text: 'The walls close in.', trigger: 'COMBAT_START' }}
      />
    );
    expect(screen.getByText('Combat')).toBeInTheDocument();
  });

  it('shows the Floor Complete badge for FLOOR_COMPLETE trigger', () => {
    render(
      <ContextualNpcMessage
        message={{ text: 'Another floor conquered.', trigger: 'FLOOR_COMPLETE' }}
      />
    );
    expect(screen.getByText('Floor Complete')).toBeInTheDocument();
  });

  it('shows the Death badge for DEATH trigger', () => {
    render(
      <ContextualNpcMessage
        message={{ text: 'Rest. The tower will be here.', trigger: 'DEATH' }}
      />
    );
    expect(screen.getByText('Death')).toBeInTheDocument();
  });

  it('has the correct data-testid', () => {
    render(<ContextualNpcMessage message={baseMessage} />);
    expect(screen.getByTestId('contextual-npc-message')).toBeInTheDocument();
  });

  it('has the correct data-trigger attribute', () => {
    render(<ContextualNpcMessage message={baseMessage} />);
    expect(screen.getByTestId('contextual-npc-message')).toHaveAttribute(
      'data-trigger',
      'FLOOR_ENTRY'
    );
  });

  it('calls onDismiss when the dismiss button is clicked', () => {
    const onDismiss = jest.fn();
    render(<ContextualNpcMessage message={baseMessage} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByTestId('btn-dismiss-contextual-message'));
    // Component transitions to exit phase then calls onDismiss
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(onDismiss).toHaveBeenCalled();
  });

  it('auto-dismisses after the display duration', () => {
    const onDismiss = jest.fn();
    render(<ContextualNpcMessage message={baseMessage} onDismiss={onDismiss} />);
    // 4000ms display + 400ms exit animation delay
    act(() => {
      jest.advanceTimersByTime(4500);
    });
    // onDismiss is called after 400ms exit animation
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(onDismiss).toHaveBeenCalled();
  });

  it('does not render when phase is exit', () => {
    const onDismiss = jest.fn();
    const { container } = render(
      <ContextualNpcMessage message={baseMessage} onDismiss={onDismiss} />
    );
    // 4000ms display + 400ms exit animation delay
    act(() => {
      jest.advanceTimersByTime(4500);
    });
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(container.querySelector('.contextual-npc-message')).toBeNull();
  });

  it('has aria-live="polite" for screen readers', () => {
    render(<ContextualNpcMessage message={baseMessage} />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });
});
