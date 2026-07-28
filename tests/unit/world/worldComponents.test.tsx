import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TownProgressPanel } from '../../../src/features/world/components/TownProgressPanel';
import { RecoveryEventModal } from '../../../src/features/world/components/RecoveryEventModal';
import { RecoveryScene } from '../../../src/features/world/components/RecoveryScene';
import { worldAreas } from '../../../src/features/world';
import type { AreaViewModel } from '../../../src/features/world';

function createArea(stage: number): AreaViewModel {
  const area = worldAreas[0];
  if (!area) {
    throw new Error('world area is missing');
  }
  return {
    area,
    unlocked: true,
    recoveryStage: 0,
    recoveryPoints: stage * 5,
    reconstructionStage: stage,
    reconstructionPercent: stage * 10,
    pointsToNextReconstructionStage: stage >= 10 ? 0 : 5,
    unlockedEvents: [],
    availableNpc: [],
  };
}

describe('town reconstruction presentation', () => {
  it('shows recovery rate and next reconstruction target', () => {
    render(<TownProgressPanel area={createArea(4)} />);

    expect(screen.getByText('まちの 復興率')).toBeVisible();
    expect(screen.getByText('40%')).toBeVisible();
    expect(screen.getByText(/宿屋完成/)).toBeVisible();
    expect(screen.getByLabelText('復興率 40%')).toBeVisible();
  });

  it('adds buildings and residents as the town grows', () => {
    render(<RecoveryScene stage={8} />);

    expect(screen.getByText('噴水完成')).toBeVisible();
    expect(screen.getByText('家')).toBeVisible();
    expect(screen.getByText('橋')).toBeVisible();
    expect(screen.getByText('市場')).toBeVisible();
    expect(screen.getByText('兵士')).toBeVisible();
  });

  it('shows the level up recovery effect and closes automatically', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(
      <RecoveryEventModal
        events={[
          {
            id: 'town-reconstruction-5',
            areaId: 'starting-village',
            title: 'まちが レベルアップ！',
            message: '宿屋が完成！',
            addedDetail: '宿屋完成',
          },
        ]}
        onClose={onClose}
      />,
    );

    expect(screen.getAllByText('★★★★★★★★★★★★')).toHaveLength(2);
    expect(screen.getByText(/レベルアップ/)).toBeInTheDocument();
    expect(screen.getByText('宿屋完成')).toBeInTheDocument();

    vi.advanceTimersByTime(1000);
    expect(onClose).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
