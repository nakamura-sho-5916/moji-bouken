import Ajv, { type ErrorObject } from 'ajv';
import missionSchema from '../schemas/mission.schema.json';
import type {
  ContentLetter,
  ContentMission,
  ContentValidationIssue,
  ContentWord,
  IllustrationReference,
  SimilarLetterGroup,
} from '../../types';

const ajv = new Ajv({ allErrors: true });
const validateMissionSchema = ajv.compile<ContentMission>(missionSchema);

function duplicateIds<T>(
  items: T[],
  getId: (item: T) => string,
  fileName: string,
): ContentValidationIssue[] {
  const seen = new Set<string>();
  const issues: ContentValidationIssue[] = [];

  for (const item of items) {
    const id = getId(item);
    if (!id.trim()) {
      issues.push({ fileName, targetId: '(empty)', reason: 'IDが空です。' });
    }
    if (seen.has(id)) {
      issues.push({ fileName, targetId: id, reason: 'IDが重複しています。' });
    }
    seen.add(id);
  }

  return issues;
}

function schemaErrorsToIssues(
  mission: unknown,
  fileName: string,
  errors: ErrorObject[] | null | undefined,
): ContentValidationIssue[] {
  const targetId =
    typeof mission === 'object' &&
    mission !== null &&
    'missionId' in mission &&
    typeof mission.missionId === 'string'
      ? mission.missionId
      : '(unknown)';

  return (errors ?? []).map((error) => ({
    fileName,
    targetId,
    reason: `${error.instancePath || '/'} ${error.message ?? 'schema error'}`,
  }));
}

export function validateMissions(
  rawMissions: unknown[],
  fileName: string,
): { valid: ContentMission[]; issues: ContentValidationIssue[] } {
  const valid: ContentMission[] = [];
  const issues: ContentValidationIssue[] = [];

  for (const mission of rawMissions) {
    if (validateMissionSchema(mission)) {
      const duplicateChoices =
        new Set(mission.choices).size !== mission.choices.length;
      const missingAnswer = !mission.choices.includes(mission.correctAnswer);

      if (duplicateChoices) {
        issues.push({
          fileName,
          targetId: mission.missionId,
          reason: 'choicesに重複があります。',
        });
        continue;
      }
      if (missingAnswer) {
        issues.push({
          fileName,
          targetId: mission.missionId,
          reason: 'correctAnswerがchoices内にありません。',
        });
        continue;
      }
      valid.push(mission);
      continue;
    }

    issues.push(
      ...schemaErrorsToIssues(mission, fileName, validateMissionSchema.errors),
    );
  }

  return { valid, issues };
}

export function validateContentReferences(input: {
  hiragana: ContentLetter[];
  katakana: ContentLetter[];
  words: ContentWord[];
  illustrations: IllustrationReference[];
  similarLetters: SimilarLetterGroup[];
  missions: ContentMission[];
}) {
  const issues: ContentValidationIssue[] = [];
  const letterIds = new Set(
    [...input.hiragana, ...input.katakana].map((letter) => letter.id),
  );
  const wordIds = new Set(input.words.map((word) => word.id));
  const illustrationIds = new Set(
    input.illustrations.map((illustration) => illustration.id),
  );

  issues.push(
    ...duplicateIds(input.hiragana, (letter) => letter.id, 'hiragana.json'),
  );
  issues.push(
    ...duplicateIds(input.katakana, (letter) => letter.id, 'katakana.json'),
  );
  issues.push(...duplicateIds(input.words, (word) => word.id, 'words.json'));
  issues.push(
    ...duplicateIds(
      input.illustrations,
      (illustration) => illustration.id,
      'illustrations.json',
    ),
  );
  issues.push(
    ...duplicateIds(
      input.similarLetters,
      (group) => group.id,
      'similarLetters.json',
    ),
  );
  issues.push(
    ...duplicateIds(
      input.missions,
      (mission) => mission.missionId,
      'missions/*.json',
    ),
  );

  for (const letter of [...input.hiragana, ...input.katakana]) {
    if (!letter.character.trim()) {
      issues.push({
        fileName: `${letter.scriptType}.json`,
        targetId: letter.id,
        reason: '文字が空です。',
      });
    }
    if (letter.relatedLetterId && !letterIds.has(letter.relatedLetterId)) {
      issues.push({
        fileName: `${letter.scriptType}.json`,
        targetId: letter.id,
        reason: '関連文字IDが存在しません。',
      });
    }
  }

  for (const word of input.words) {
    if (!word.display.trim()) {
      issues.push({
        fileName: 'words.json',
        targetId: word.id,
        reason: '単語表示が空です。',
      });
    }
    for (const letterId of word.letterIds) {
      if (!letterIds.has(letterId)) {
        issues.push({
          fileName: 'words.json',
          targetId: word.id,
          reason: `存在しない文字ID: ${letterId}`,
        });
      }
    }
    if (!illustrationIds.has(word.illustrationId)) {
      issues.push({
        fileName: 'words.json',
        targetId: word.id,
        reason: `存在しないイラストID: ${word.illustrationId}`,
      });
    }
  }

  for (const group of input.similarLetters) {
    if (group.letterIds.length < 2) {
      issues.push({
        fileName: 'similarLetters.json',
        targetId: group.id,
        reason: '似た文字グループが2文字未満です。',
      });
    }
    for (const letterId of group.letterIds) {
      if (!letterIds.has(letterId)) {
        issues.push({
          fileName: 'similarLetters.json',
          targetId: group.id,
          reason: `存在しない文字ID: ${letterId}`,
        });
      }
    }
  }

  for (const mission of input.missions) {
    for (const targetId of mission.targetIds) {
      if (!letterIds.has(targetId) && !wordIds.has(targetId)) {
        issues.push({
          fileName: 'missions/*.json',
          targetId: mission.missionId,
          reason: `存在しないtargetId: ${targetId}`,
        });
      }
    }
  }

  return issues;
}
