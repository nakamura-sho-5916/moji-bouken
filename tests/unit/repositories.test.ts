import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_PLAYER_ID, STARTING_AREA_ID } from '../../src/db/constants';
import { openMojiBoukenDb } from '../../src/db/database';
import { initializeAppData } from '../../src/db/initializeAppData';
import {
  addLearningLog,
  getLearningLogsByLetter,
  getLearningLogsByPlayer,
} from '../../src/db/repositories/learningLogRepository';
import {
  createLetterProgressId,
  getWeakLetterProgress,
  saveLetterProgress,
  updateLetterProgress,
} from '../../src/db/repositories/letterProgressRepository';
import {
  changeGold,
  addCompanion,
  getInventory,
} from '../../src/db/repositories/inventoryRepository';
import {
  getPlayerById,
  updatePlayer,
} from '../../src/db/repositories/playerRepository';
import {
  addReviewSchedule,
  completeReviewSchedule,
  createReviewScheduleId,
  getDueReviewSchedules,
} from '../../src/db/repositories/reviewScheduleRepository';
import {
  getAppSettings,
  updateAppSettings,
} from '../../src/db/repositories/settingsRepository';
import {
  getWorldProgress,
  updateRecoveryStage,
} from '../../src/db/repositories/worldProgressRepository';
import type {
  LearningLog,
  LetterProgress,
  ReviewSchedule,
} from '../../src/types';
import { resetIndexedDb } from './dbTestUtils';

const now = '2026-07-19T00:00:00.000Z';

describe('repositories', () => {
  beforeEach(async () => {
    await resetIndexedDb();
  });

  it('初期Playerが1件だけ作成され、複数回実行しても重複しない', async () => {
    await initializeAppData();
    await initializeAppData();
    const db = await openMojiBoukenDb();

    expect(await db.count('players')).toBe(1);
    expect(await getPlayerById(DEFAULT_PLAYER_ID)).toMatchObject({
      id: DEFAULT_PLAYER_ID,
      name: 'ぼうけんしゃ',
      level: 1,
      experience: 0,
      gold: 0,
    });
  });

  it('Playerを取得・更新できる', async () => {
    await initializeAppData();
    const updated = await updatePlayer(DEFAULT_PLAYER_ID, { level: 2 });

    expect(updated?.level).toBe(2);
    expect(updated?.updatedAt).toBeTruthy();
  });

  it('LearningLogを追加・取得でき、DBエラー時に例外が返る', async () => {
    await initializeAppData();
    const log: LearningLog = {
      id: 'log-1',
      playerId: DEFAULT_PLAYER_ID,
      missionId: 'mission-1',
      targetLetter: 'あ',
      correct: true,
      responseTimeMs: 1200,
      answeredAt: now,
    };

    await addLearningLog(log);

    await expect(addLearningLog(log)).rejects.toBeTruthy();
    expect(await getLearningLogsByPlayer(DEFAULT_PLAYER_ID)).toHaveLength(1);
    expect(await getLearningLogsByLetter('あ')).toHaveLength(1);
  });

  it('LetterProgressを保存・更新し、苦手文字一覧を取得できる', async () => {
    const progress: LetterProgress = {
      id: createLetterProgressId(DEFAULT_PLAYER_ID, 'あ'),
      playerId: DEFAULT_PLAYER_ID,
      letterId: 'あ',
      attempts: 3,
      correctCount: 1,
      incorrectCount: 2,
      accuracy: 1 / 3,
      averageResponseTimeMs: 1800,
      lastResponseTimeMs: 1700,
      consecutiveCorrect: 0,
      weakFlag: true,
      masteredFlag: false,
      lastAnsweredAt: now,
      updatedAt: now,
    };

    await saveLetterProgress(progress);
    const updated = await updateLetterProgress(DEFAULT_PLAYER_ID, 'あ', {
      attempts: 4,
    });

    expect(updated?.attempts).toBe(4);
    expect(await getWeakLetterProgress()).toHaveLength(1);
  });

  it('ReviewScheduleを予定日で取得し、完了へ更新できる', async () => {
    const schedule: ReviewSchedule = {
      id: createReviewScheduleId(DEFAULT_PLAYER_ID, 'あ', 'next-day'),
      playerId: DEFAULT_PLAYER_ID,
      letterId: 'あ',
      reviewStage: 'next-day',
      scheduledDate: '2026-07-20T00:00:00.000Z',
      completed: false,
      completedAt: null,
      updatedAt: now,
    };

    await addReviewSchedule(schedule);
    await addReviewSchedule({ ...schedule, id: 'duplicate' });

    expect(
      await getDueReviewSchedules('2026-07-21T00:00:00.000Z'),
    ).toHaveLength(1);

    const completed = await completeReviewSchedule(schedule.id, now);

    expect(completed?.completed).toBe(true);
  });

  it('WorldProgressの復興段階を更新できる', async () => {
    await initializeAppData();

    const updated = await updateRecoveryStage(
      DEFAULT_PLAYER_ID,
      STARTING_AREA_ID,
      2,
    );

    expect(updated?.recoveryStage).toBe(2);
    expect(
      await getWorldProgress(DEFAULT_PLAYER_ID, STARTING_AREA_ID),
    ).toMatchObject({
      recoveryStage: 2,
    });
  });

  it('Inventoryの所持金を増減し、不足時はマイナスにしない', async () => {
    await initializeAppData();

    expect((await changeGold(DEFAULT_PLAYER_ID, 10))?.gold).toBe(10);
    expect((await changeGold(DEFAULT_PLAYER_ID, -5))?.gold).toBe(5);
    await expect(changeGold(DEFAULT_PLAYER_ID, -10)).rejects.toThrow();
    expect((await getInventory(DEFAULT_PLAYER_ID))?.gold).toBe(5);
  });

  it('仲間を重複追加しない', async () => {
    await initializeAppData();
    const companion = { id: 'friend-1', joinedAt: now };

    await addCompanion(DEFAULT_PLAYER_ID, companion);
    const inventory = await addCompanion(DEFAULT_PLAYER_ID, companion);

    expect(inventory?.companions).toHaveLength(1);
  });

  it('AppSettingsを取得・更新できる', async () => {
    await initializeAppData();
    const updated = await updateAppSettings(DEFAULT_PLAYER_ID, {
      bgmEnabled: false,
    });

    expect(updated?.bgmEnabled).toBe(false);
    expect((await getAppSettings(DEFAULT_PLAYER_ID))?.bgmEnabled).toBe(false);
  });
});
