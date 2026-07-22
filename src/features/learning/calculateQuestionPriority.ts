import {
  DEFAULT_SESSION_QUESTION_COUNT,
  MAX_NEW_LETTERS_PER_SESSION,
  MIN_EASY_QUESTIONS_PER_SESSION,
} from './constants';
import type { QuestionCandidate, QuestionPriorityInput } from './types';

type PoolKey = 'dueReview' | 'weak' | 'normal' | 'new';

function createSeededRandom(seed = 1) {
  let value = seed % 2147483647;
  if (value <= 0) {
    value += 2147483646;
  }
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function pickNext(
  pool: QuestionCandidate[],
  selected: QuestionCandidate[],
  random: () => number,
) {
  const candidates = pool.filter((candidate) => {
    const last = selected.at(-1);
    const lastTwo = selected.slice(-2);
    const sameLetterCount = selected.filter(
      (item) => item.letterId === candidate.letterId,
    ).length;
    const sameAnswerCount = selected.filter(
      (item) => item.correctAnswer === candidate.correctAnswer,
    ).length;
    if (selected.some((item) => item.id === candidate.id)) {
      return false;
    }
    if (sameLetterCount >= 2) {
      return false;
    }
    if (sameAnswerCount >= 2) {
      return false;
    }
    if (last?.letterId === candidate.letterId) {
      return false;
    }
    if (
      lastTwo.length === 2 &&
      lastTwo.every((item) => item.missionType === candidate.missionType)
    ) {
      return false;
    }
    return true;
  });
  const source = candidates.length > 0 ? candidates : pool;
  return source[Math.floor(random() * source.length)];
}

function limitByLetters(candidates: QuestionCandidate[], maxLetters: number) {
  const acceptedLetters = new Set<string>();
  return candidates.filter((candidate) => {
    if (!acceptedLetters.has(candidate.letterId)) {
      if (acceptedLetters.size >= maxLetters) {
        return false;
      }
      acceptedLetters.add(candidate.letterId);
    }
    return true;
  });
}

export function calculateQuestionPriority(input: QuestionPriorityInput) {
  const count = input.count ?? DEFAULT_SESSION_QUESTION_COUNT;
  const random = createSeededRandom(input.seed);
  const selected: QuestionCandidate[] = [];
  const newCandidates = limitByLetters(input.new, MAX_NEW_LETTERS_PER_SESSION);
  const reusablePools = {
    dueReview: [...input.dueReview],
    weak: [...input.weak],
    normal: [...input.normal],
    new: [...newCandidates],
  };
  const pools = {
    dueReview: [...reusablePools.dueReview],
    weak: [...reusablePools.weak],
    normal: [...reusablePools.normal],
    new: [...reusablePools.new],
  };
  const plan = [
    ...Array.from({ length: 4 }, () => 'dueReview' as const),
    ...Array.from({ length: 3 }, () => 'weak' as const),
    ...Array.from({ length: 2 }, () => 'normal' as const),
    'new' as const,
  ].slice(0, count);

  for (const category of plan) {
    const fallbackOrder: PoolKey[] =
      category === 'dueReview'
        ? ['dueReview', 'weak', 'normal', 'new']
        : category === 'weak'
          ? ['weak', 'normal', 'new', 'dueReview']
          : category === 'normal'
            ? ['normal', 'new', 'weak', 'dueReview']
            : ['new', 'normal', 'weak', 'dueReview'];

    let poolKey = fallbackOrder.find((key) => pools[key].length > 0);
    let pool = poolKey ? pools[poolKey] : [];

    if (!poolKey) {
      poolKey = fallbackOrder.find((key) => reusablePools[key].length > 0);
      pool = poolKey ? reusablePools[poolKey] : [];
    }

    if (!poolKey || pool.length === 0) {
      break;
    }

    const next = pickNext(pool, selected, random);
    if (!next) {
      break;
    }
    selected.push(next);
    if (pools[poolKey].length > 0) {
      pools[poolKey] = pools[poolKey].filter(
        (candidate) => candidate.id !== next.id,
      );
    }
  }

  const easyCount = selected.filter((candidate) => candidate.easy).length;
  if (easyCount < MIN_EASY_QUESTIONS_PER_SESSION) {
    const easyPool = [...input.normal, ...input.new].filter(
      (candidate) => candidate.easy,
    );
    for (const easy of easyPool) {
      if (selected.some((candidate) => candidate.id === easy.id)) {
        continue;
      }
      selected[selected.length - 1] = easy;
      if (
        selected.filter((candidate) => candidate.easy).length >=
        MIN_EASY_QUESTIONS_PER_SESSION
      ) {
        break;
      }
    }
  }

  return selected.slice(0, count);
}
