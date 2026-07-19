import type { CompanionSkillInput, CompanionSkillResult } from './types';

const SKILL_MESSAGES = {
  'reduce-choice': 'うさぎが こうほを すっきりしたよ',
  'illustration-hint': 'きつねが えを よくみせてくれたよ',
  'word-candidate-sort': 'くまが ことばを ならべたよ',
  'gentle-review': 'ふくろうが やさしく はじめたよ',
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
    input.skillId === 'word-candidate-sort' &&
    ['word-completion', 'text-search'].includes(input.missionType)
  ) {
    return {
      activated: true,
      message: SKILL_MESSAGES[input.skillId],
      choices: [...input.choices].sort((a, b) => a.localeCompare(b, 'ja')),
      correctAnswer: input.correctAnswer,
      usedCount: input.usedCount + 1,
    };
  }

  if (
    input.skillId === 'gentle-review' &&
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

  if (input.skillId === 'bonus-gold') {
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
