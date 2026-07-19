import type { ContentMission } from '../../../types';
import { normalizeAnswer } from './normalizeAnswer';

export function validateMissionAnswer(mission: ContentMission, answer: string) {
  return normalizeAnswer(answer) === normalizeAnswer(mission.correctAnswer);
}
