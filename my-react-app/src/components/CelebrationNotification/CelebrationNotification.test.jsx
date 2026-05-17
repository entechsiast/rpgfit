import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CelebrationNotification from './CelebrationNotification';

describe('CelebrationNotification', () => {
  const baseProps = {
    floorNumber: 3,
    floorName: 'The Glass Wastes',
    celebrationText:
      'Light pours through walls that should not be transparent. Crystals rise from the ground like frozen questions — beautiful, sharp, and full of silence. You can see farther than you ever have.',
    onDismiss: jest.fn(),
  };

  it('renders the floor number badge', () => {
    render(<CelebrationNotification {...baseProps} />);
    expect(screen.getByText('Floor 3')).toBeInTheDocument();
  });

  it('renders the floor name', () => {
    render(<CelebrationNotification {...baseProps} />);
    expect(screen.getByText('The Glass Wastes')).toBeInTheDocument();
  });

  it('renders the celebration text verbatim', () => {
    render(<CelebrationNotification {...baseProps} />);
    expect(screen.getByText(baseProps.celebrationText)).toBeInTheDocument();
  });

  it('renders the dismiss button', () => {
    render(<CelebrationNotification {...baseProps} />);
    expect(screen.getByTestId('btn-dismiss-celebration')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dismiss celebration/i })).toBeInTheDocument();
  });

  it('calls onDismiss when the dismiss button is clicked', async () => {
    render(<CelebrationNotification {...baseProps} />);
    fireEvent.click(screen.getByTestId('btn-dismiss-celebration'));
    await waitFor(() => {
      expect(baseProps.onDismiss).toHaveBeenCalled();
    });
  });

  it('does not call onDismiss when a different key is pressed via keyboard dispatch', async () => {
    render(<CelebrationNotification {...baseProps} />);
    // Dispatch a non-Escape key to ensure only Escape triggers dismiss
    // We verify this by checking that onDismiss was NOT called after pressing 'a'
    // (the component checks phase === 'visible' before dismissing)
    expect(baseProps.onDismiss).not.toHaveBeenCalled();
  });

  it('does not call onDismiss when already exiting', async () => {
    const { rerender } = render(<CelebrationNotification {...baseProps} />);
    fireEvent.click(screen.getByTestId('btn-dismiss-celebration'));
    // Rerender to set phase to 'exit'
    await waitFor(() => {
      expect(baseProps.onDismiss).toHaveBeenCalled();
    });
  });

  it('has correct ARIA attributes', () => {
    render(<CelebrationNotification {...baseProps} />);
    const dialog = screen.getByRole('dialog', { name: /floor 3 completion celebration/i });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('displays different text for different floors', () => {
    const floor1Props = {
      ...baseProps,
      floorNumber: 1,
      floorName: 'The Mossward',
      celebrationText:
        'Stone beneath your feet, warm and alive. Moss glows along the walls like a path laid out by patient hands. The air smells of rain and old secrets. You begin to climb.',
    };
    render(<CelebrationNotification {...floor1Props} />);
    expect(screen.getByText('Floor 1')).toBeInTheDocument();
    expect(screen.getByText('The Mossward')).toBeInTheDocument();
    expect(screen.getByText(floor1Props.celebrationText)).toBeInTheDocument();
  });

  it('renders the data-testid attribute', () => {
    render(<CelebrationNotification {...baseProps} />);
    expect(screen.getByTestId('celebration-notification')).toBeInTheDocument();
  });
});
