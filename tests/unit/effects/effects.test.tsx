import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  AnswerEffect,
  EffectBurst,
  SceneEffect,
  TreasureChestEffect,
} from '../../../src/features/effects';

describe('game effects', () => {
  it('renders effect bursts with semantic test hooks', () => {
    render(<EffectBurst label="victory burst" tone="victory" />);

    expect(screen.getByRole('img', { name: 'victory burst' })).toBeVisible();
    expect(screen.getByTestId('effect-burst-victory')).toBeVisible();
  });

  it('renders answer feedback without exposing extra controls', () => {
    render(<AnswerEffect correct />);

    expect(screen.getByTestId('answer-effect-correct')).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders treasure variants for reward moments', () => {
    render(<TreasureChestEffect label="rare reward" rare />);

    expect(screen.getByRole('img', { name: 'rare reward' })).toBeVisible();
    expect(screen.getByTestId('treasure-effect-rare')).toBeVisible();
  });

  it('renders scene effects for joined companions and recovery events', () => {
    render(<SceneEffect title="なかまと いっしょ" tone="companion" />);

    expect(screen.getByText('なかまと いっしょ')).toBeVisible();
    expect(screen.getByTestId('scene-effect-companion')).toBeVisible();
  });
});
