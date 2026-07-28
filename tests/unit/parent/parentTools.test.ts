import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_PLAYER_ID } from '../../../src/db/constants';
import { initializeAppData } from '../../../src/db/initializeAppData';
import {
  getAppSettings,
  updateAppSettings,
} from '../../../src/db/repositories/settingsRepository';
import {
  listSaveSlotSummaries,
  renameSaveSlot,
  startSaveSlot,
} from '../../../src/db/repositories/saveSlotRepository';
import { addLearningLog } from '../../../src/db/repositories/learningLogRepository';
import { saveLetterProgress } from '../../../src/db/repositories/letterProgressRepository';
import { addReviewSchedule } from '../../../src/db/repositories/reviewScheduleRepository';
import {
  calculateLearningOverview,
  changeParentPin,
  clearParentPin,
  configureParentPin,
  createBackup,
  getHistoryPage,
  getSpeedTrend,
  getWeakLetterRows,
  parseBackupJson,
  resetAllData,
  restoreBackup,
  serializeBackup,
  verifyParentPin,
} from '../../../src/features/parent';
import { createMissionSession } from '../../../src/features/missions/MissionSession';
import { getPlayerById } from '../../../src/db/repositories/playerRepository';
import { resetIndexedDb } from '../dbTestUtils';
import { addDebugGold } from '../../../src/features/collection';

async function seedLearningData() {
  await addLearningLog({
    id: 'log-1',
    playerId: DEFAULT_PLAYER_ID,
    missionId: 'mission-1',
    targetLetter: 'hiragana-a',
    correct: false,
    responseTimeMs: 1200,
    answeredAt: '2026-07-18T10:00:00.000Z',
  });
  await addLearningLog({
    id: 'log-2',
    playerId: DEFAULT_PLAYER_ID,
    missionId: 'mission-2',
    targetLetter: 'hiragana-a',
    correct: true,
    responseTimeMs: 900,
    answeredAt: '2026-07-19T10:00:00.000Z',
  });
  await saveLetterProgress({
    id: `${DEFAULT_PLAYER_ID}:hiragana-a`,
    playerId: DEFAULT_PLAYER_ID,
    letterId: 'hiragana-a',
    attempts: 3,
    correctCount: 1,
    incorrectCount: 2,
    accuracy: 1 / 3,
    averageResponseTimeMs: 1050,
    lastResponseTimeMs: 900,
    consecutiveCorrect: 1,
    weakFlag: true,
    masteredFlag: false,
    lastAnsweredAt: '2026-07-19T10:00:00.000Z',
    updatedAt: '2026-07-19T10:00:00.000Z',
  });
  await saveLetterProgress({
    id: `${DEFAULT_PLAYER_ID}:katakana-a`,
    playerId: DEFAULT_PLAYER_ID,
    letterId: 'katakana-a',
    attempts: 5,
    correctCount: 5,
    incorrectCount: 0,
    accuracy: 1,
    averageResponseTimeMs: 800,
    lastResponseTimeMs: 700,
    consecutiveCorrect: 5,
    weakFlag: false,
    masteredFlag: true,
    lastAnsweredAt: '2026-07-19T11:00:00.000Z',
    updatedAt: '2026-07-19T11:00:00.000Z',
  });
  await addReviewSchedule({
    id: `${DEFAULT_PLAYER_ID}:hiragana-a:next-day`,
    playerId: DEFAULT_PLAYER_ID,
    letterId: 'hiragana-a',
    reviewStage: 'next-day',
    scheduledDate: '2026-07-20T00:00:00.000Z',
    completed: false,
    completedAt: null,
    updatedAt: '2026-07-19T10:00:00.000Z',
  });
}

describe('parent tools', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await resetIndexedDb();
    await initializeAppData();
  });

  it('4桁PINの設定、認証、変更、解除を行い平文保存しない', async () => {
    expect(
      (await configureParentPin({ pin: '1234', confirmPin: '0000' })).ok,
    ).toBe(false);
    expect(
      (await configureParentPin({ pin: '1234', confirmPin: '1234' })).ok,
    ).toBe(true);
    const settings = await getAppSettings(DEFAULT_PLAYER_ID);

    expect(settings?.parentPinConfigured).toBe(true);
    expect(settings?.parentPinHash).not.toContain('1234');
    expect(settings?.parentPinSalt).not.toContain('1234');
    expect((await verifyParentPin('0000')).ok).toBe(false);
    expect((await verifyParentPin('1234')).ok).toBe(true);
    expect(
      (
        await changeParentPin({
          currentPin: '1234',
          newPin: '5678',
          confirmPin: '5678',
        })
      ).ok,
    ).toBe(true);
    expect((await verifyParentPin('5678')).ok).toBe(true);
    expect((await clearParentPin('5678')).ok).toBe(true);
    expect((await getAppSettings(DEFAULT_PLAYER_ID))?.parentPinConfigured).toBe(
      false,
    );
  });

  it('5回誤入力で一時ロックし、lockUntilを保存する', async () => {
    await configureParentPin({ pin: '1234', confirmPin: '1234' });
    for (let index = 0; index < 4; index += 1) {
      expect((await verifyParentPin('0000')).locked).toBe(false);
    }
    const fifth = await verifyParentPin('0000');
    const settings = await getAppSettings(DEFAULT_PLAYER_ID);

    expect(fifth.locked).toBe(true);
    expect(settings?.parentPinLockUntil).not.toBeNull();
  });

  it('学習概要、苦手、復習、履歴、回答時間を集計する', async () => {
    await seedLearningData();
    const overview = await calculateLearningOverview();
    const weakRows = await getWeakLetterRows({
      filter: 'weak',
      sort: 'low-accuracy',
    });
    const masteredRows = await getWeakLetterRows({ filter: 'mastered' });
    const reviewRows = await getWeakLetterRows({ filter: 'review-due' });
    const katakanaRows = await getWeakLetterRows({ filter: 'katakana' });
    const history = await getHistoryPage({ limit: 1 });
    const speed = await getSpeedTrend('hiragana-a');

    expect(overview.totalAnswers).toBe(2);
    expect(overview.correctAnswers).toBe(1);
    expect(overview.accuracy).toBe(0.5);
    expect(overview.learningDays).toBe(2);
    expect(overview.learningTimeMs).toBe(2100);
    expect(overview.weakLetterCount).toBe(1);
    expect(overview.masteredLetterCount).toBe(1);
    expect(overview.dueReviewCount).toBe(1);
    expect(weakRows).toHaveLength(1);
    expect(masteredRows).toHaveLength(1);
    expect(reviewRows).toHaveLength(1);
    expect(katakanaRows).toHaveLength(1);
    expect(history.days[0]?.logs).toHaveLength(1);
    expect(history.nextOffset).toBe(1);
    expect(speed.averageResponseTimeMs).toBe(1050);
    expect(speed.improving).toBe(true);
  });

  it('データ0件でも安全に概要を返す', async () => {
    const overview = await calculateLearningOverview();

    expect(overview.totalAnswers).toBe(0);
    expect(overview.accuracy).toBe(0);
    expect(overview.lastLearningAt).toBeNull();
  });

  it('設定保存と標準問題数をミッションへ反映する', async () => {
    await updateAppSettings(DEFAULT_PLAYER_ID, {
      volume: 35,
      reducedMotion: true,
      fontSize: 'extra-large',
      standardQuestionCount: 5,
    });
    const settings = await getAppSettings(DEFAULT_PLAYER_ID);
    const mission = await createMissionSession({
      seed: 100,
      count: settings?.standardQuestionCount,
    });

    expect(settings?.volume).toBe(35);
    expect(settings?.reducedMotion).toBe(true);
    expect(settings?.fontSize).toBe('extra-large');
    expect(mission.missions).toHaveLength(5);
  });

  it('バックアップ出力と復元を安全に行う', async () => {
    await seedLearningData();
    await configureParentPin({ pin: '1234', confirmPin: '1234' });
    const backup = await createBackup();
    const json = serializeBackup(backup);

    expect(backup.format).toBe('moji-bouken-backup');
    expect(backup.version).toBe(1);
    expect(backup.createdAt).toBeTruthy();
    expect(json).not.toContain('1234');
    expect(json).not.toContain('moji-bouken:mission-session');
    await expect(() => parseBackupJson('{bad')).toThrow();
    await expect(() =>
      parseBackupJson(JSON.stringify({ format: 'other' })),
    ).toThrow();
    await restoreBackup(parseBackupJson(json));
    const overview = await calculateLearningOverview();

    expect(overview.totalAnswers).toBe(2);
    expect((await getAppSettings(DEFAULT_PLAYER_ID))?.parentPinConfigured).toBe(
      false,
    );
  });

  it('PINと確認文字がある場合だけデータ初期化する', async () => {
    await configureParentPin({ pin: '1234', confirmPin: '1234' });
    await seedLearningData();
    expect(
      (await resetAllData({ pin: '0000', confirmText: 'リセット' })).ok,
    ).toBe(false);
    expect((await resetAllData({ pin: '1234', confirmText: 'reset' })).ok).toBe(
      false,
    );
    expect(
      (await resetAllData({ pin: '1234', confirmText: 'リセット' })).ok,
    ).toBe(true);
    expect(await getPlayerById(DEFAULT_PLAYER_ID)).not.toBeUndefined();
    expect((await calculateLearningOverview()).totalAnswers).toBe(0);
  });

  it('backs up and restores save slots with scoped localStorage data', async () => {
    await seedLearningData();
    await renameSaveSlot('slot-1', 'slot one');
    await startSaveSlot('slot-2');
    await renameSaveSlot('slot-2', 'slot two');
    await addDebugGold(22);
    localStorage.setItem(
      'moji-bouken:story-progress:save-slot-2',
      JSON.stringify({ entries: [{ eventId: 'test', status: 'seen' }] }),
    );
    await configureParentPin({ pin: '1234', confirmPin: '1234' });

    const backup = await createBackup();
    const json = serializeBackup(backup);

    expect(backup.data.saveSlots).toHaveLength(3);
    expect(
      backup.data.saveSlots.find((slot) => slot.id === 'slot-2')?.name,
    ).toBe('slot two');
    expect(backup.data.localStorage.entries).toHaveProperty(
      'moji-bouken:story-progress:save-slot-2',
    );
    expect(json).not.toContain('1234');
    expect(json).not.toContain('moji-bouken:mission-session');

    await restoreBackup(parseBackupJson(json));

    expect(
      (await listSaveSlotSummaries()).find((slot) => slot.id === 'slot-2')
        ?.name,
    ).toBe('slot two');
    expect((await getPlayerById('save-slot-2'))?.id).toBe('save-slot-2');
    expect((await getAppSettings('save-slot-2'))?.parentPinConfigured).toBe(
      false,
    );
    expect(
      localStorage.getItem('moji-bouken:story-progress:save-slot-2'),
    ).toContain('test');
  });

  it('uses v1.0 default audio volume settings and persists changes', async () => {
    const initialSettings = await getAppSettings(DEFAULT_PLAYER_ID);

    expect(initialSettings?.masterVolume).toBe(70);
    expect(initialSettings?.bgmVolume).toBe(62);
    expect(initialSettings?.soundEffectVolume).toBe(68);
    expect(
      (initialSettings?.bgmVolume ?? 0) <
        (initialSettings?.soundEffectVolume ?? 0),
    ).toBe(true);

    await updateAppSettings(DEFAULT_PLAYER_ID, {
      bgmVolume: 55,
      soundEffectVolume: 66,
      muteAll: true,
    });

    const reloadedSettings = await getAppSettings(DEFAULT_PLAYER_ID);
    expect(reloadedSettings?.bgmVolume).toBe(55);
    expect(reloadedSettings?.soundEffectVolume).toBe(66);
    expect(reloadedSettings?.muteAll).toBe(true);
  });

  it('restores old backups without saveSlots into slot 1', async () => {
    const legacyBackup = parseBackupJson(
      JSON.stringify({
        format: 'moji-bouken-backup',
        version: 1,
        appVersion: '0.6.2',
        createdAt: '2026-07-01T00:00:00.000Z',
        databaseVersion: 4,
        data: {
          players: [
            {
              id: 'default-player',
              name: 'legacy',
              level: 3,
              experience: 70,
              gold: 0,
              createdAt: '2026-07-01T00:00:00.000Z',
              updatedAt: '2026-07-01T00:00:00.000Z',
            },
          ],
          learningLogs: [
            {
              id: 'default-player:legacy-log',
              playerId: 'default-player',
              missionId: 'mission-1',
              targetLetter: 'hiragana-a',
              correct: true,
              responseTimeMs: 800,
              answeredAt: '2026-07-01T00:00:00.000Z',
            },
          ],
          letterProgress: [],
          reviewSchedules: [],
          worldProgress: [],
          inventories: [],
          settings: [],
          collectionProgress: [],
          albumEntries: [],
          localStorage: {
            rewardedBattleIds: '["legacy-battle"]',
          },
        },
      }),
    );

    await restoreBackup(legacyBackup);

    expect((await getPlayerById('save-slot-1'))?.experience).toBe(70);
    expect(await getPlayerById('default-player')).toBeUndefined();
    expect(await listSaveSlotSummaries()).toHaveLength(3);
    expect(localStorage.getItem('moji-bouken:rewarded-battle-ids')).toBe(
      '["legacy-battle"]',
    );
  });
});
