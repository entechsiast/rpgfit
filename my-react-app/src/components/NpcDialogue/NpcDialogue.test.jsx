/**
 * NpcDialogue component unit tests
 *
 * Tests for:
 *   - Speech bubble rendering
 *   - Typewriter text effect
 *   - Continue button functionality
 *   - Dismiss button functionality
 *   - NEW badge display
 *   - Auto-dismiss countdown (optional)
 *   - NPC highlight when active
 *   - Animation states
 *   - Mobile-responsive behavior
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import NpcDialogue from './NpcDialogue';
import { NPC_ID } from '../../data/npcDialogues';

// ─── Helpers ───────────────────────────────────────────────────────────────

function createMockDialogues() {
  return [
    {
      dialogue: { id: 'merchant_d1', text: 'Hello, climber! Welcome to the tower.', trigger: { type: 'FIRST_VISIT' } },
      met: false,
      available: true,
    },
    {
      dialogue: { id: 'merchant_d2', text: 'The path ahead is treacherous, but you look ready.', trigger: { type: 'FLOOR_COMPLETED', value: 1 } },
      met: false,
      available: true,
    },
    {
      dialogue: { id: 'merchant_d3', text: 'I have survived this tower longer than most. Trust me.', trigger: { type: 'ALWAYS' } },
      met: true,
      available: true,
    },
  ];
}

function renderNpcDialogue(props = {}) {
  const defaultProps = {
    npcId: NPC_ID.MERCHANT,
    dialogues: createMockDialogues(),
    onShowNext: jest.fn(),
    onDismiss: jest.fn(),
    onContinue: jest.fn(),
    activeDialogueId: 'merchant_d1',
    isActive: false,
    hasMoreDialogues: true,
    showAvatar: true,
    typewriter: false,
    autoDismiss: 0,
  };
  return render(<NpcDialogue {...defaultProps} {...props} />);
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('NpcDialogue', () => {
  describe('Speech bubble rendering', () => {
    it('renders the dialogue bubble when activeDialogueId is provided', () => {
      renderNpcDialogue();
      expect(screen.getByRole('button', { name: /Hello, climber/i })).toBeInTheDocument();
    });

    it('does not render the bubble when no activeDialogueId', () => {
      const { container } = renderNpcDialogue({ activeDialogueId: null });
      const bubble = container.querySelector('.npc-dialogue__bubble');
      expect(bubble).not.toBeInTheDocument();
    });

    it('renders the NPC avatar when showAvatar is true', () => {
      renderNpcDialogue();
      const avatarWrapper = document.querySelector('.npc-dialogue__avatar-wrapper');
      expect(avatarWrapper).toBeInTheDocument();
      expect(avatarWrapper.querySelector('svg')).toBeInTheDocument();
    });

    it('does not render the avatar when showAvatar is false', () => {
      const { container } = renderNpcDialogue({ showAvatar: false });
      const avatarWrapper = container.querySelector('.npc-dialogue__avatar-wrapper');
      expect(avatarWrapper).not.toBeInTheDocument();
    });

    it('renders dialogue text', () => {
      renderNpcDialogue();
      expect(screen.getByText('Hello, climber! Welcome to the tower.')).toBeInTheDocument();
    });
  });

  describe('NEW badge display', () => {
    it('shows NEW tag for unmet dialogues', () => {
      renderNpcDialogue();
      expect(screen.getByText('NEW')).toBeInTheDocument();
    });

    it('does not show NEW tag for met dialogues', () => {
      const dialogues = createMockDialogues().map(d => ({ ...d, met: true }));
      renderNpcDialogue({ dialogues, activeDialogueId: 'merchant_d3' });
      expect(screen.queryByText('NEW')).not.toBeInTheDocument();
    });

    it('shows pulse badge on avatar when unmet dialogues available', () => {
      renderNpcDialogue();
      const badge = document.querySelector('.npc-dialogue__new-badge');
      expect(badge).toBeInTheDocument();
      expect(badge.textContent).toBe('!');
    });
  });

  describe('Continue button', () => {
    it('renders Continue button when hasMoreDialogues is true', () => {
      renderNpcDialogue({ hasMoreDialogues: true });
      const continueBtn = screen.getByTestId('npc-dialogue-continue');
      expect(continueBtn).toBeInTheDocument();
      expect(continueBtn.textContent).toContain('Continue');
    });

    it('does not render Continue button when hasMoreDialogues is false', () => {
      renderNpcDialogue({ hasMoreDialogues: false });
      const continueBtn = screen.queryByTestId('npc-dialogue-continue');
      expect(continueBtn).not.toBeInTheDocument();
    });

    it('calls onContinue when Continue button is clicked', () => {
      const onContinue = jest.fn();
      renderNpcDialogue({ hasMoreDialogues: true, onContinue });
      const continueBtn = screen.getByTestId('npc-dialogue-continue');
      fireEvent.click(continueBtn);
      expect(onContinue).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dismiss button', () => {
    it('renders the dismiss button', () => {
      renderNpcDialogue();
      expect(screen.getByTestId('npc-dialogue-dismiss')).toBeInTheDocument();
    });

    it('calls onDismiss after dismiss button is clicked (with animation delay)', async () => {
      const onDismiss = jest.fn();
      renderNpcDialogue({ onDismiss });
      const dismissBtn = screen.getByTestId('npc-dialogue-dismiss');
      await act(async () => {
        fireEvent.click(dismissBtn);
      });
      // onDismiss is called after 300ms animation delay
      await waitFor(() => {
        expect(onDismiss).toHaveBeenCalledTimes(1);
      }, { timeout: 500 });
    });
  });

  describe('NPC highlight when active', () => {
    it('applies focused class when isActive is true', () => {
      renderNpcDialogue({ isActive: true });
      const dialogue = document.querySelector('.npc-dialogue');
      expect(dialogue).toHaveClass('npc-dialogue--focused');
    });

    it('does not apply focused class when isActive is false', () => {
      renderNpcDialogue({ isActive: false });
      const dialogue = document.querySelector('.npc-dialogue');
      expect(dialogue).not.toHaveClass('npc-dialogue--focused');
    });

    it('applies npc-avatar--active class when isActive is true', () => {
      renderNpcDialogue({ isActive: true });
      const avatar = document.querySelector('.npc-avatar--active');
      expect(avatar).toBeInTheDocument();
    });

    it('does not apply npc-avatar--active class when isActive is false', () => {
      renderNpcDialogue({ isActive: false });
      const avatar = document.querySelector('.npc-avatar--active');
      expect(avatar).not.toBeInTheDocument();
    });
  });

  describe('Auto-dismiss countdown', () => {
    it('does not show progress bar when autoDismiss is 0 (disabled)', () => {
      renderNpcDialogue({ autoDismiss: 0 });
      const progress = document.querySelector('.npc-dialogue__progress');
      expect(progress).not.toBeInTheDocument();
    });

    it('shows progress bar when autoDismiss is enabled', () => {
      renderNpcDialogue({ autoDismiss: 8000 });
      const progress = document.querySelector('.npc-dialogue__progress');
      expect(progress).toBeInTheDocument();
    });
  });

  describe('Typewriter effect', () => {
    it('displays full text when typewriter is disabled', () => {
      renderNpcDialogue({ typewriter: false });
      expect(screen.getByText('Hello, climber! Welcome to the tower.')).toBeInTheDocument();
    });

    it('shows cursor while typing (typewriter enabled)', () => {
      renderNpcDialogue({ typewriter: true });
      // The cursor is always shown during typing
      const cursor = document.querySelector('.npc-dialogue__cursor');
      expect(cursor).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has aria-label on the dialogue bubble', () => {
      renderNpcDialogue();
      const bubble = document.querySelector('[aria-label]');
      expect(bubble).toBeInTheDocument();
    });

    it('has data-testid on interactive elements', () => {
      renderNpcDialogue({ hasMoreDialogues: true });
      expect(screen.getByTestId('npc-dialogue-continue')).toBeInTheDocument();
      expect(screen.getByTestId('npc-dialogue-dismiss')).toBeInTheDocument();
    });

    it('is focusable via keyboard', () => {
      renderNpcDialogue();
      const bubble = document.querySelector('.npc-dialogue__bubble');
      expect(bubble).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Inactive state', () => {
    it('shows NPC with pulse when no active dialogue but has unmet', () => {
      const dialogues = createMockDialogues();
      renderNpcDialogue({ activeDialogueId: null, dialogues });
      const badge = document.querySelector('.npc-dialogue__new-badge');
      expect(badge).toBeInTheDocument();
    });

    it('applies inactive class when no active dialogue', () => {
      renderNpcDialogue({ activeDialogueId: null });
      const dialogue = document.querySelector('.npc-dialogue');
      expect(dialogue).toHaveClass('npc-dialogue--inactive');
    });
  });
});
