import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PassiveNotification from './PassiveNotification';

describe('PassiveNotification', () => {
  const baseProps = {
    message: 'The moss seems to grow faster when you watch.',
    onDismiss: jest.fn(),
  };

  it('renders the passive message', () => {
    render(<PassiveNotification {...baseProps} />);
    expect(screen.getByText(baseProps.message)).toBeInTheDocument();
  });

  it('renders the dismiss button', () => {
    render(<PassiveNotification {...baseProps} />);
    expect(screen.getByTestId('btn-dismiss-passive')).toBeInTheDocument();
  });

  it('calls onDismiss when the dismiss button is clicked', () => {
    render(<PassiveNotification {...baseProps} />);
    fireEvent.click(screen.getByTestId('btn-dismiss-passive'));
    expect(baseProps.onDismiss).toHaveBeenCalled();
  });

  it('does not call onDismiss when a different key is pressed', () => {
    render(<PassiveNotification {...baseProps} />);
    // Press 'a' key — should not dismiss
    fireEvent.keyDown(screen.getByTestId('passive-notification'), { key: 'a' });
    expect(baseProps.onDismiss).not.toHaveBeenCalled();
  });

  it('calls onDismiss when Escape is pressed', () => {
    render(<PassiveNotification {...baseProps} />);
    fireEvent.keyDown(screen.getByTestId('passive-notification'), { key: 'Escape' });
    expect(baseProps.onDismiss).toHaveBeenCalled();
  });

  it('has correct ARIA attributes', () => {
    render(<PassiveNotification {...baseProps} />);
    const status = screen.getByRole('status', { name: /tower observation/i });
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('renders the data-testid attribute', () => {
    render(<PassiveNotification {...baseProps} />);
    expect(screen.getByTestId('passive-notification')).toBeInTheDocument();
  });

  it('renders different messages for different floors', () => {
    const floor3Message = 'The crystals hum. They have opinions about you.';
    render(<PassiveNotification message={floor3Message} onDismiss={jest.fn()} />);
    expect(screen.getByText(floor3Message)).toBeInTheDocument();
  });

  it('renders the decorative icon', () => {
    render(<PassiveNotification {...baseProps} />);
    expect(screen.getByText('◈')).toBeInTheDocument();
  });
});
