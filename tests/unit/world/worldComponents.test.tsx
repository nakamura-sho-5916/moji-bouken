import { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TownProgressPanel } from '../../../src/features/world/components/TownProgressPanel';
import {
  AREA_UNLOCK_CINEMATIC_DURATION_MS,
  AreaUnlockCinematic,
} from '../../../src/features/world/components/AreaUnlockCinematic';
import {
  RECOVERY_EVENT_AUTO_CLOSE_MS,
  RECOVERY_EVENT_FADE_OUT_MS,
  RecoveryEventModal,
} from '../../../src/features/world/components/RecoveryEventModal';
import { LockedArea } from '../../../src/features/world/components/LockedArea';
import { RecoveryScene } from '../../../src/features/world/components/RecoveryScene';
import { worldAreas } from '../../../src/features/world';
import type { AreaViewModel, RecoveryEvent } from '../../../src/features/world';

const recoveryEvent: RecoveryEvent = {
  id: 'town-reconstruction-5',
  areaId: 'starting-village',
  title: 'まちが レベルアップ！',
  message: '宿屋が完成！',
  addedDetail: '宿屋完成！',
};

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

function createLockedArea(): AreaViewModel {
  const area = worldAreas.find((item) => item.id === 'word-forest');
  if (!area) {
    throw new Error('locked world area is missing');
  }
  return {
    area,
    unlocked: false,
    recoveryStage: 0,
    recoveryPoints: 0,
    reconstructionStage: 0,
    reconstructionPercent: 0,
    pointsToNextReconstructionStage: 5,
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
    expect(screen.getByText('木')).toBeVisible();
    expect(screen.getByText('市場')).toBeVisible();
    expect(screen.getByText('兵士')).toBeVisible();
  });

  it('shows a readable locked area overlay without fog or repeated clouds', () => {
    render(<LockedArea area={createLockedArea()} />);

    expect(screen.getByText('未解放')).toBeVisible();
    expect(screen.getByText('まえの ばしょを げんきにしよう')).toBeVisible();
    expect(screen.queryByText('霧')).not.toBeInTheDocument();
    expect(screen.queryByText('雲')).not.toBeInTheDocument();
  });

  it('shows the level up recovery effect and closes automatically after fade out', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(<RecoveryEventModal events={[recoveryEvent]} onClose={onClose} />);

    expect(screen.getByText(/レベルアップ/)).toBeInTheDocument();
    expect(screen.getByText('宿屋完成！')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /つぎへ/ })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(RECOVERY_EVENT_AUTO_CLOSE_MS);
    });
    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(RECOVERY_EVENT_FADE_OUT_MS);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('closes from the next button, overlay tap, and Escape without duplicates', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(<RecoveryEventModal events={[recoveryEvent]} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /つぎへ/ }));
    fireEvent.click(screen.getByTestId('recovery-event-overlay'));
    fireEvent.keyDown(window, { key: 'Escape' });
    act(() => {
      vi.advanceTimersByTime(RECOVERY_EVENT_FADE_OUT_MS);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('locks page scroll while visible and restores controls after closing', () => {
    vi.useFakeTimers();
    const onAction = vi.fn();

    function Harness() {
      const [events, setEvents] = useState<RecoveryEvent[]>([recoveryEvent]);
      return (
        <>
          <RecoveryEventModal events={events} onClose={() => setEvents([])} />
          <button onClick={onAction} type="button">
            after modal action
          </button>
        </>
      );
    }

    render(<Harness />);

    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.click(screen.getByRole('button', { name: /つぎへ/ }));
    act(() => {
      vi.advanceTimersByTime(RECOVERY_EVENT_FADE_OUT_MS);
    });

    expect(
      screen.queryByTestId('recovery-event-modal'),
    ).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
    fireEvent.click(screen.getByRole('button', { name: 'after modal action' }));
    expect(onAction).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('keeps the fade out close timer when the parent rerenders', () => {
    vi.useFakeTimers();

    function Harness() {
      const [events, setEvents] = useState<RecoveryEvent[]>([recoveryEvent]);
      const [renderCount, setRenderCount] = useState(0);
      return (
        <>
          <RecoveryEventModal events={events} onClose={() => setEvents([])} />
          <button
            onClick={() => setRenderCount((count) => count + 1)}
            type="button"
          >
            rerender parent {renderCount}
          </button>
        </>
      );
    }

    render(<Harness />);

    fireEvent.click(screen.getByRole('button', { name: /つぎへ/ }));
    fireEvent.click(screen.getByRole('button', { name: /rerender parent/ }));
    act(() => {
      vi.advanceTimersByTime(RECOVERY_EVENT_FADE_OUT_MS);
    });

    expect(
      screen.queryByTestId('recovery-event-modal'),
    ).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('shows the area unlock cinematic and closes automatically', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();

    render(
      <AreaUnlockCinematic areaIds={['word-forest']} onComplete={onComplete} />,
    );

    expect(screen.getByTestId('area-unlock-cinematic')).toBeVisible();
    expect(screen.getByText('NEW AREA')).toBeVisible();
    expect(screen.getByText('解放！')).toBeVisible();
    expect(screen.getByText('橋完成！')).toBeVisible();
    expect(screen.getByText(/ありがとう/)).toBeVisible();

    act(() => {
      vi.advanceTimersByTime(AREA_UNLOCK_CINEMATIC_DURATION_MS);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
