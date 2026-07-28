import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RewardChestPresentation } from '../../../src/features/rewards/components/RewardChestPresentation';
import {
  getHighestRewardRarity,
  getRewardChestKind,
  hasRareReward,
} from '../../../src/features/rewards/rewardPresentation';
import type { RewardDropItem } from '../../../src/features/rewards';

const rareDrop: RewardDropItem = {
  itemId: 'word-ring',
  name: 'ことばの ゆびわ',
  kind: 'equipment',
  count: 1,
  rarity: 'rare',
  newToCollection: true,
};

describe('reward presentation', () => {
  it('classifies chest kinds without changing drop data', () => {
    expect(getRewardChestKind('common')).toBe('wood');
    expect(getRewardChestKind('uncommon')).toBe('wood');
    expect(getRewardChestKind('rare')).toBe('silver');
    expect(getRewardChestKind('epic')).toBe('silver');
    expect(getRewardChestKind('legendary')).toBe('gold');
    expect(getHighestRewardRarity([rareDrop])).toBe('rare');
    expect(hasRareReward([rareDrop])).toBe(true);
  });

  it('shows acquired items as reward cards with NEW marks', () => {
    render(<RewardChestPresentation items={[rareDrop]} />);

    expect(screen.getByTestId('reward-chest-presentation')).toBeVisible();
    expect(screen.getByText('ことばの ゆびわ')).toBeVisible();
    expect(screen.getByText('NEW')).toBeVisible();
    expect(screen.getByTestId('reward-rare-particles')).toBeVisible();
  });

  it('shows legendary reward emphasis in debug preview', () => {
    render(<RewardChestPresentation items={[]} previewRarity="legendary" />);

    expect(screen.getByText('金箱')).toBeVisible();
    expect(screen.getAllByText('Legendary').length).toBeGreaterThan(0);
    expect(screen.getByTestId('reward-legend')).toHaveTextContent('LEGEND');
  });
});
