import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import DropFeedback from './DropFeedback';

describe('DropFeedback', () => {
  describe('animationEnabled = false (accessibility mode)', () => {
    it('renders a simple text flash for guaranteed rewards', () => {
      render(
        <DropFeedback
          reward={{ type: 'guaranteed', gold: 100, timestamp: Date.now() }}
          animationEnabled={false}
          duration={100}
        />
      );
      expect(screen.getByTestId('drop-feedback-disabled')).toBeInTheDocument();
      expect(screen.getByText('+100 Gold')).toBeInTheDocument();
    });

    it('renders a simple text flash for bonus rewards', () => {
      render(
        <DropFeedback
          reward={{ type: 'bonus', bonusType: 'gold', amount: 250, timestamp: Date.now() }}
          animationEnabled={false}
          duration={100}
        />
      );
      expect(screen.getByTestId('drop-feedback-disabled')).toBeInTheDocument();
      expect(screen.getByText(/Bonus!/)).toBeInTheDocument();
    });

    it('renders a simple text flash for milestone rewards', () => {
      render(
        <DropFeedback
          reward={{ type: 'milestone', gold: 500, itemName: 'Crown', floor: 2, timestamp: Date.now() }}
          animationEnabled={false}
          duration={100}
        />
      );
      expect(screen.getByTestId('drop-feedback-disabled')).toBeInTheDocument();
      expect(screen.getByText(/Floor Complete/)).toBeInTheDocument();
    });
  });

  describe('animationEnabled = true (default)', () => {
    it('renders GuaranteedBurst for guaranteed rewards', () => {
      render(
        <DropFeedback
          reward={{ type: 'guaranteed', gold: 100, timestamp: Date.now() }}
          animationEnabled={true}
          duration={100}
        />
      );
      expect(screen.getByTestId('drop-feedback-guaranteed')).toBeInTheDocument();
      expect(screen.getByTestId('guaranteed-burst')).toBeInTheDocument();
    });

    it('renders BonusGlow for bonus rewards', () => {
      render(
        <DropFeedback
          reward={{ type: 'bonus', bonusType: 'equipment', itemName: 'Iron Helm', timestamp: Date.now() }}
          animationEnabled={true}
          duration={100}
        />
      );
      expect(screen.getByTestId('drop-feedback-bonus')).toBeInTheDocument();
      expect(screen.getByTestId('bonus-glow')).toBeInTheDocument();
    });

    it('renders MilestoneCutscene for milestone rewards', () => {
      render(
        <DropFeedback
          reward={{ type: 'milestone', gold: 500, itemName: 'Crown', floor: 2, timestamp: Date.now() }}
          animationEnabled={true}
          duration={100}
        />
      );
      expect(screen.getByTestId('drop-feedback-milestone')).toBeInTheDocument();
      expect(screen.getByTestId('milestone-cutscene')).toBeInTheDocument();
    });

    it('calls onComplete after animation finishes', async () => {
      const onComplete = jest.fn();
      render(
        <DropFeedback
          reward={{ type: 'guaranteed', gold: 100, timestamp: Date.now() }}
          animationEnabled={true}
          duration={50}
          onComplete={onComplete}
        />
      );
      await waitFor(() => expect(onComplete).toHaveBeenCalled(), { timeout: 500 });
    });

    it('unmounts after animation completes (no DOM leakage)', async () => {
      const { container } = render(
        <DropFeedback
          reward={{ type: 'guaranteed', gold: 100, timestamp: Date.now() }}
          animationEnabled={true}
          duration={50}
        />
      );
      await waitFor(() => {
        expect(container.querySelector('[data-testid="drop-feedback-guaranteed"]')).toBeNull();
      }, { timeout: 500 });
    });
  });

  describe('text display', () => {
    it('displays correct text for guaranteed reward', () => {
      render(
        <DropFeedback
          reward={{ type: 'guaranteed', gold: 1500, timestamp: Date.now() }}
          animationEnabled={false}
          duration={100}
        />
      );
      expect(screen.getByText('+1,500 Gold')).toBeInTheDocument();
    });

    it('displays correct text for bonus equipment', () => {
      render(
        <DropFeedback
          reward={{ type: 'bonus', bonusType: 'equipment', itemName: 'Dragon Helm', timestamp: Date.now() }}
          animationEnabled={false}
          duration={100}
        />
      );
      expect(screen.getByText('Bonus: Dragon Helm!')).toBeInTheDocument();
    });

    it('displays correct text for milestone reward', () => {
      render(
        <DropFeedback
          reward={{ type: 'milestone', gold: 500, itemName: 'Paladin Armor', floor: 3, timestamp: Date.now() }}
          animationEnabled={false}
          duration={100}
        />
      );
      expect(screen.getByText(/Floor Complete/)).toBeInTheDocument();
      expect(screen.getByText(/500 Gold/)).toBeInTheDocument();
    });
  });
});
