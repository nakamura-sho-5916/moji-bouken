import { describe, expect, it, vi } from 'vitest';
import {
  CORRECT_ATTACK_DELAY_MS,
  correctAnswerVariationIds,
  createCorrectAnswerFeedbackController,
  selectCorrectAnswerSound,
  sfxPatches,
  soundEffectRegistry,
  type SoundEffectId,
} from '../../../src/features/audio';

const correctSoundIds = [
  'correct',
  'correct-rise',
  'correct-spark',
  'correct-combo-3',
  'correct-combo-5',
  'correct-combo-10',
] as const satisfies readonly SoundEffectId[];

describe('correct answer feedback', () => {
  it('registers bounded correct answer variations', () => {
    expect(correctAnswerVariationIds).toHaveLength(3);

    for (const id of correctSoundIds) {
      const patch = sfxPatches[id];
      const asset = soundEffectRegistry[id];

      expect(patch.durationMs).toBeGreaterThanOrEqual(350);
      expect(patch.durationMs).toBeLessThanOrEqual(650);
      expect(asset.defaultVolume).toBeGreaterThan(0);
      expect(asset.defaultVolume).toBeLessThanOrEqual(1);
      expect(asset.defaultVolume).toBeGreaterThan(
        soundEffectRegistry.retry.defaultVolume,
      );
      for (const voice of patch.voices) {
        expect(voice.gain).toBeGreaterThan(0);
        expect(voice.gain).toBeLessThanOrEqual(0.35);
      }
    }
  });

  it('selects stable variations without repeating the previous standard sound', () => {
    const first = selectCorrectAnswerSound({ comboCount: 1, seed: 'same' });
    const second = selectCorrectAnswerSound({
      comboCount: 1,
      previousSoundId: first,
      seed: 'same',
    });

    expect(correctAnswerVariationIds).toContain(first);
    expect(correctAnswerVariationIds).toContain(second);
    expect(second).not.toBe(first);
  });

  it('selects combo accents that stay short', () => {
    expect(selectCorrectAnswerSound({ comboCount: 3 })).toBe('correct-combo-3');
    expect(selectCorrectAnswerSound({ comboCount: 5 })).toBe('correct-combo-5');
    expect(selectCorrectAnswerSound({ comboCount: 10 })).toBe(
      'correct-combo-10',
    );
    expect(sfxPatches['correct-combo-10'].durationMs).toBeLessThanOrEqual(650);
  });

  it('plays one correct sound and schedules attack after 80-140ms', () => {
    const controller = createCorrectAnswerFeedbackController();
    const played: SoundEffectId[] = [];
    const scheduled: number[] = [];

    controller.play({
      comboCount: 1,
      feedbackKey: 'answer-1',
      playSoundEffect: (id) => played.push(id),
      scheduler: (callback, delayMs) => {
        scheduled.push(delayMs);
        callback();
      },
      seed: 'answer-1',
    });

    expect(played).toHaveLength(2);
    expect(correctAnswerVariationIds).toContain(played[0]);
    expect(played[1]).toBe('attack');
    expect(scheduled).toEqual([CORRECT_ATTACK_DELAY_MS]);
    expect(CORRECT_ATTACK_DELAY_MS).toBeGreaterThanOrEqual(80);
    expect(CORRECT_ATTACK_DELAY_MS).toBeLessThanOrEqual(140);
  });

  it('does not double-play the same correct answer process', () => {
    const controller = createCorrectAnswerFeedbackController();
    const played: SoundEffectId[] = [];
    const scheduler = vi.fn();

    const first = controller.play({
      comboCount: 1,
      feedbackKey: 'same-answer',
      playSoundEffect: (id) => played.push(id),
      scheduler,
      seed: 'same-answer',
    });
    const second = controller.play({
      comboCount: 1,
      feedbackKey: 'same-answer',
      playSoundEffect: (id) => played.push(id),
      scheduler,
      seed: 'same-answer',
    });

    expect(first.played).toBe(true);
    expect(second.played).toBe(false);
    expect(played).toHaveLength(1);
    expect(scheduler).toHaveBeenCalledTimes(1);
  });

  it('does not schedule attack for practice-only correct feedback', () => {
    const controller = createCorrectAnswerFeedbackController();
    const played: SoundEffectId[] = [];
    const scheduler = vi.fn();

    controller.play({
      comboCount: 1,
      feedbackKey: 'practice',
      playSoundEffect: (id) => played.push(id),
      scheduleAttack: false,
      scheduler,
      seed: 'practice',
    });

    expect(played).toHaveLength(1);
    expect(played).not.toContain('attack');
    expect(scheduler).not.toHaveBeenCalled();
  });
});
