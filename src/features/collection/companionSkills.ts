import type { CompanionSkillInput, CompanionSkillResult } from './types';

const SKILL_MESSAGES = {
  'reduce-choice': 'うさぎが えらぶものを ひとつ へらしたよ',
  'illustration-hint': 'きつねが えのヒントを みつけたよ',
  'damage-up': 'くまが ちからを かしてくれたよ',
  'review-bonus': 'ふくろうが ふくしゅうを みまもるよ',
  'bonus-gold': 'りすが きらりを みつけたよ',
} as const;

export function applyCompanionSkill(
  input: CompanionSkillInput,
): CompanionSkillResult {
  if (input.usedCount >= input.maxUses) {
    return {
      activated: false,
      message: 'きょうは もう たすけてくれたよ',
      choices: input.choices,
      correctAnswer: input.correctAnswer,
      usedCount: input.usedCount,
    };
  }

  if (
    input.skillId === 'reduce-choice' &&
    ['letter-search', 'similar-letter-choice'].includes(input.missionType)
  ) {
    const removable = input.choices.find(
      (choice) => choice !== input.correctAnswer,
    );
    return {
      activated: Boolean(removable),
      message: SKILL_MESSAGES[input.skillId],
      choices: removable
        ? input.choices.filter((choice) => choice !== removable)
        : input.choices,
      correctAnswer: input.correctAnswer,
      usedCount: input.usedCount + 1,
    };
  }

  if (
    input.skillId === 'illustration-hint' &&
    ['illustration-letter-choice', 'illustration-word-choice'].includes(
      input.missionType,
    )
  ) {
    return {
      activated: true,
      message: SKILL_MESSAGES[input.skillId],
      choices: input.choices,
      correctAnswer: input.correctAnswer,
      usedCount: input.usedCount + 1,
    };
  }

  if (
    input.skillId === 'review-bonus' &&
    ['letter-introduction', 'letter-search'].includes(input.missionType)
  ) {
    return {
      activated: true,
      message: SKILL_MESSAGES[input.skillId],
      choices: input.choices,
      correctAnswer: input.correctAnswer,
      usedCount: input.usedCount + 1,
    };
  }

  if (input.skillId === 'damage-up' || input.skillId === 'bonus-gold') {
    return {
      activated: true,
      message: SKILL_MESSAGES[input.skillId],
      choices: input.choices,
      correctAnswer: input.correctAnswer,
      usedCount: input.usedCount + 1,
    };
  }

  return {
    activated: false,
    message: 'いまは みまもっているよ',
    choices: input.choices,
    correctAnswer: input.correctAnswer,
    usedCount: input.usedCount,
  };
}
