import { describe, expect, it } from 'vitest';
import { loadLearningContent } from '../../../src/content/loaders/contentLoader';
import {
  validateContentReferences,
  validateMissions,
} from '../../../src/content/loaders/contentValidator';
import type { ContentMission } from '../../../src/types';

function ids(items: { id?: string; missionId?: string }[]) {
  return items.map((item) => item.id ?? item.missionId ?? '');
}

function expectUnique(values: string[]) {
  expect(new Set(values).size).toBe(values.length);
}

describe('content quality', () => {
  const content = loadLearningContent();
  const activeHiragana = content.hiragana.filter((letter) => letter.active);
  const activeKatakana = content.katakana.filter((letter) => letter.active);
  const letterIds = new Set(
    [...content.hiragana, ...content.katakana].map((letter) => letter.id),
  );
  const illustrationIds = new Set(
    content.illustrations.map((illustration) => illustration.id),
  );

  it('ひらがな基本46文字が存在する', () => {
    expect(activeHiragana).toHaveLength(46);
  });

  it('カタカナ基本46文字が存在する', () => {
    expect(activeKatakana).toHaveLength(46);
  });

  it('文字IDが重複しない', () => {
    expectUnique(ids([...content.hiragana, ...content.katakana]));
  });

  it('対応ひらがな・カタカナ参照が成立する', () => {
    for (const letter of [...activeHiragana, ...activeKatakana]) {
      expect(letter.relatedLetterId).toBeTruthy();
      expect(letterIds.has(letter.relatedLetterId ?? '')).toBe(true);
    }
  });

  it('単語が80件以上存在し、IDが重複しない', () => {
    expect(content.words.length).toBeGreaterThanOrEqual(80);
    expectUnique(ids(content.words));
  });

  it('単語のletterIdsとillustrationIdが存在する', () => {
    for (const word of content.words) {
      expect(word.display.trim()).not.toBe('');
      for (const letterId of word.letterIds) {
        expect(letterIds.has(letterId)).toBe(true);
      }
      expect(illustrationIds.has(word.illustrationId)).toBe(true);
    }
  });

  it('似た文字グループのletterIdsが存在し、各グループに2文字以上ある', () => {
    for (const group of content.similarLetters) {
      expect(group.letterIds.length).toBeGreaterThanOrEqual(2);
      for (const letterId of group.letterIds) {
        expect(letterIds.has(letterId)).toBe(true);
      }
    }
  });

  it('サンプルミッションが20件以上存在し、形式ごとに最低2件ある', () => {
    expect(content.missions.length).toBeGreaterThanOrEqual(20);
    const counts = content.missions.reduce<Record<string, number>>(
      (acc, mission) => {
        acc[mission.missionType] = (acc[mission.missionType] ?? 0) + 1;
        return acc;
      },
      {},
    );

    for (const count of Object.values(counts)) {
      expect(count).toBeGreaterThanOrEqual(2);
    }
  });

  it('ミッションIDが重複せず、correctAnswerがchoices内にあり、choicesに重複がない', () => {
    expectUnique(ids(content.missions));
    for (const mission of content.missions) {
      expect(mission.choices).toContain(mission.correctAnswer);
      expectUnique(mission.choices);
    }
  });

  it('全ミッションがSchema検証に成功し、参照検証エラーがない', () => {
    expect(content.validationIssues).toHaveLength(0);
  });

  it('不正なミッションを検出でき、一部不正でも正常データを返せる', () => {
    const validMission = content.missions[0] as ContentMission;
    const invalidMission = {
      ...validMission,
      missionId: 'invalid-mission',
      correctAnswer: 'ない',
    };

    const result = validateMissions(
      [validMission, invalidMission],
      'inline-test.json',
    );

    expect(result.valid).toHaveLength(1);
    expect(result.issues).toHaveLength(1);
  });

  it('縦書きミッションがorientation=verticalである', () => {
    for (const mission of content.missions.filter(
      (item) => item.missionType === 'vertical-reading',
    )) {
      expect(mission.orientation).toBe('vertical');
    }
  });

  it('ボスミッションが複数形式を参照できる', () => {
    const bossMissions = content.missions.filter(
      (mission) => mission.missionType === 'boss-mixed',
    );

    expect(bossMissions).toHaveLength(2);
    for (const mission of bossMissions) {
      expect(mission.targetIds.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('参照不備を検出できる', () => {
    const issues = validateContentReferences({
      ...content,
      words: [
        {
          ...content.words[0],
          id: 'bad-word',
          letterIds: ['missing-letter'],
          illustrationId: 'missing-illustration',
        },
      ],
    });

    expect(issues.length).toBeGreaterThanOrEqual(2);
  });
});
