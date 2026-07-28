import type { SoundEffectId } from './audioTypes';

export const CORRECT_ATTACK_DELAY_MS = 110;

export const correctAnswerVariationIds = [
  'correct',
  'correct-rise',
  'correct-spark',
] as const satisfies readonly SoundEffectId[];

export type CorrectAnswerVariationId =
  (typeof correctAnswerVariationIds)[number];

export type CorrectAnswerComboSoundId = Extract<
  SoundEffectId,
  'correct-combo-3' | 'correct-combo-5' | 'correct-combo-10'
>;

export type CorrectAnswerSoundId =
  CorrectAnswerVariationId | CorrectAnswerComboSoundId;

type PlayCorrectAnswerFeedbackInput = {
  comboCount: number;
  feedbackKey: string;
  playSoundEffect: (id: SoundEffectId) => void;
  scheduleAttack?: boolean;
  seed?: string;
  scheduler?: (callback: () => void, delayMs: number) => void;
};

function hashSeed(seed: string) {
  return Array.from(seed).reduce(
    (total, character) => (total * 31 + character.charCodeAt(0)) >>> 0,
    17,
  );
}

export function selectCorrectAnswerSound(input: {
  comboCount: number;
  seed?: string;
  previousSoundId?: CorrectAnswerSoundId | null;
}): CorrectAnswerSoundId {
  if (input.comboCount >= 10) {
    return 'correct-combo-10';
  }
  if (input.comboCount >= 5) {
    return 'correct-combo-5';
  }
  if (input.comboCount >= 3) {
    return 'correct-combo-3';
  }

  const seedValue = input.seed ? hashSeed(input.seed) : Math.random();
  const rawIndex =
    typeof seedValue === 'number' && seedValue < 1
      ? Math.floor(seedValue * correctAnswerVariationIds.length)
      : seedValue % correctAnswerVariationIds.length;
  const selected = correctAnswerVariationIds[rawIndex] ?? 'correct';
  if (
    selected === input.previousSoundId &&
    correctAnswerVariationIds.length > 1
  ) {
    return correctAnswerVariationIds[
      (rawIndex + 1) % correctAnswerVariationIds.length
    ] as CorrectAnswerVariationId;
  }
  return selected;
}

export function createCorrectAnswerFeedbackController() {
  const playedKeys = new Set<string>();
  let previousSoundId: CorrectAnswerSoundId | null = null;

  return {
    play(input: PlayCorrectAnswerFeedbackInput) {
      if (playedKeys.has(input.feedbackKey)) {
        return { played: false, soundId: previousSoundId };
      }
      playedKeys.add(input.feedbackKey);
      const soundId = selectCorrectAnswerSound({
        comboCount: input.comboCount,
        previousSoundId,
        seed: input.seed,
      });
      previousSoundId = soundId;
      input.playSoundEffect(soundId);
      if (input.scheduleAttack ?? true) {
        const scheduler =
          input.scheduler ??
          ((callback, delayMs) => {
            window.setTimeout(callback, delayMs);
          });
        scheduler(
          () => input.playSoundEffect('attack'),
          CORRECT_ATTACK_DELAY_MS,
        );
      }
      return { played: true, soundId };
    },
  };
}
