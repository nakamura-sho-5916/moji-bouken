import { expect, test } from '@playwright/test';

test('トップ画面に仮タイトルが表示される', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'もじぼうけん！' }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'はじめる' }).click();

  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByRole('heading', { name: 'ホーム' })).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: '主な画面' }),
  ).toBeVisible();

  const firstSnapshot = await page.evaluate(async () => {
    const request = indexedDB.open('moji-bouken-db');
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const readAll = <T>(storeName: string) =>
      new Promise<T[]>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const getAllRequest = store.getAll();
        getAllRequest.onsuccess = () => resolve(getAllRequest.result as T[]);
        getAllRequest.onerror = () => reject(getAllRequest.error);
      });

    const players = await readAll<{ id: string }>('players');
    const worldProgress = await readAll<{ areaId: string }>('worldProgress');
    db.close();
    return { players, worldProgress };
  });

  expect(firstSnapshot.players).toHaveLength(1);
  expect(firstSnapshot.players[0]?.id).toBe('default-player');
  expect(firstSnapshot.worldProgress).toHaveLength(1);
  expect(firstSnapshot.worldProgress[0]?.areaId).toBe('starting-village');

  await page.reload();

  const playerCountAfterReload = await page.evaluate(async () => {
    const request = indexedDB.open('moji-bouken-db');
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const count = await new Promise<number>((resolve, reject) => {
      const transaction = db.transaction('players', 'readonly');
      const countRequest = transaction.objectStore('players').count();
      countRequest.onsuccess = () => resolve(countRequest.result);
      countRequest.onerror = () => reject(countRequest.error);
    });
    db.close();
    return count;
  });

  expect(playerCountAfterReload).toBe(1);

  await page.goto('/debug/content');
  await expect(
    page.getByRole('heading', { name: 'Debug Content' }),
  ).toBeVisible();
  await expect(page.getByText('ひらがな件数: 46')).toBeVisible();
  await expect(page.getByText('カタカナ件数: 46')).toBeVisible();
  await expect(page.getByText(/ミッション件数: 22/)).toBeVisible();

  await page.goto('/debug/learning');
  await expect(
    page.getByRole('heading', { name: 'Debug Learning' }),
  ).toBeVisible();
  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'テストデータをリセット' }).click();
  await expect(page.getByText('attempts: 0')).toBeVisible();

  for (let index = 0; index < 3; index += 1) {
    await page.getByRole('button', { name: '回答記録を保存' }).click();
  }

  await expect(page.getByText('weakFlag: true')).toBeVisible();
  await expect(page.getByText('未完了: 3')).toBeVisible();
  await page.reload();
  await expect(page.getByText('weakFlag: true')).toBeVisible();
  await expect(page.getByText('未完了: 3')).toBeVisible();
  await page.getByRole('button', { name: '出題候補10件を生成' }).click();
  await expect(page.getByText('候補数: 10')).toBeVisible();

  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'テストデータをリセット' }).click();
});

test('ミッションを10問進めて結果画面へ移動できる', async ({ page }) => {
  await page.goto('/mission');
  await page.getByRole('button', { name: 'ミッションを はじめる' }).click();

  for (let index = 0; index < 10; index += 1) {
    const session = await page.evaluate(() => {
      const raw = localStorage.getItem('moji-bouken:mission-session');
      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as {
        currentIndex: number;
        missions: { missionType: string; correctAnswer: string }[];
      };
    });
    expect(session).not.toBeNull();
    const mission = session?.missions[session.currentIndex];
    expect(mission).toBeDefined();

    if (
      mission?.missionType === 'letter-introduction' ||
      mission?.missionType === 'boss-mixed'
    ) {
      const completeButton =
        mission.missionType === 'letter-introduction' ? 'おぼえた' : 'つぎへ';
      await page.getByRole('button', { name: completeButton }).click();
      continue;
    }

    await page
      .getByRole('button', { name: mission?.correctAnswer ?? '' })
      .first()
      .click();
    await page.getByRole('button', { name: 'こたえる' }).click();
    await expect(page.getByText('やったね')).toBeVisible();
    await page.getByRole('button', { name: 'つぎへ' }).click();
  }

  await expect(page).toHaveURL(/\/result$/);
  await expect(
    page.getByRole('heading', { name: 'つづけて できたね' }),
  ).toBeVisible();

  await page.reload();
  const missionLogCount = await page.evaluate(async () => {
    const request = indexedDB.open('moji-bouken-db');
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const count = await new Promise<number>((resolve, reject) => {
      const transaction = db.transaction('learningLogs', 'readonly');
      const countRequest = transaction.objectStore('learningLogs').count();
      countRequest.onsuccess = () => resolve(countRequest.result);
      countRequest.onerror = () => reject(countRequest.error);
    });
    db.close();
    return count;
  });
  expect(missionLogCount).toBeGreaterThan(0);
});
