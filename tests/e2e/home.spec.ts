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
  await page.waitForFunction(() =>
    Boolean(localStorage.getItem('moji-bouken:mission-session')),
  );

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

test('バトルで敵を倒して報酬を確認できる', async ({ page }) => {
  await page.goto('/battle');
  await expect(page.getByText('ことばの ちからで すすもう')).toBeVisible();
  await page.getByRole('button', { name: 'バトルを はじめる' }).click();
  await expect(page.getByText('てきが あらわれた')).toBeVisible();

  for (let index = 0; index < 5; index += 1) {
    await page.getByRole('button', { name: 'せいかい' }).click();
  }

  await expect(
    page.getByRole('button', { name: 'ひっさつわざ' }),
  ).toBeEnabled();
  await page.getByRole('button', { name: 'ひっさつわざ' }).click();

  for (let index = 0; index < 5; index += 1) {
    if (await page.getByRole('button', { name: 'けっかへ' }).isVisible()) {
      break;
    }
    const correctButton = page.getByRole('button', { name: 'せいかい' });
    if (!(await correctButton.isEnabled())) {
      break;
    }
    await correctButton.click();
  }

  await expect(page.getByRole('button', { name: 'けっかへ' })).toBeVisible();
  await page.getByRole('button', { name: 'けっかへ' }).click();
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByText('たからばこ')).toBeVisible();
  await expect(page.getByText('ゴールド')).toBeVisible();

  await page.reload();
  const saved = await page.evaluate(async () => {
    const request = indexedDB.open('moji-bouken-db');
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const readOne = <T>(storeName: string, key: string) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const getRequest = transaction.objectStore(storeName).get(key);
        getRequest.onsuccess = () => resolve(getRequest.result as T);
        getRequest.onerror = () => reject(getRequest.error);
      });
    const player = await readOne<{ experience: number }>(
      'players',
      'default-player',
    );
    const inventory = await readOne<{ gold: number }>(
      'inventories',
      'default-player',
    );
    db.close();
    return { player, inventory };
  });

  expect(saved.player.experience).toBeGreaterThan(0);
  expect(saved.inventory.gold).toBeGreaterThan(0);
});

test('世界マップで復興とエリア解放を確認できる', async ({ page }) => {
  await page.goto('/world');
  await expect(
    page.getByRole('heading', { name: 'もじの せかい' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /はじまりの まち/ }),
  ).toBeVisible();
  await expect(page.getByText('ことばの もり')).toBeVisible();
  await expect(
    page.getByText('まえの ばしょを げんきにしよう').first(),
  ).toBeVisible();

  await page.getByRole('button', { name: 'ここへ いく' }).click();
  await expect(page).toHaveURL(/\/battle\?areaId=starting-village/);

  await page.goto('/debug/world');
  await expect(
    page.getByRole('heading', { name: '世界復興デバッグ' }),
  ).toBeVisible();

  for (let index = 0; index < 2; index += 1) {
    await page.getByRole('button', { name: '大きく復興' }).click();
    await expect(page.getByText(/せかいが げんきになりました/)).toBeVisible();
  }

  await page.goto('/world');
  await expect(page.getByText('はしが なおったよ')).toBeVisible();
  await expect(page.getByText('みどりが ふえたよ')).toBeVisible();
  await expect(page.getByText('おみせが あいたよ')).toBeVisible();
  await expect(
    page.getByRole('button', { name: /ことばの もり/ }),
  ).toBeVisible();

  const worldState = await page.evaluate(async () => {
    const request = indexedDB.open('moji-bouken-db');
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const readAll = <T>(storeName: string) =>
      new Promise<T[]>((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const getAllRequest = transaction.objectStore(storeName).getAll();
        getAllRequest.onsuccess = () => resolve(getAllRequest.result as T[]);
        getAllRequest.onerror = () => reject(getAllRequest.error);
      });

    const progress = await readAll<{
      areaId: string;
      recoveryStage: number;
      unlocked: boolean;
    }>('worldProgress');
    db.close();
    return progress;
  });
  const village = worldState.find((area) => area.areaId === 'starting-village');
  const forest = worldState.find((area) => area.areaId === 'word-forest');

  expect(village?.recoveryStage).toBeGreaterThanOrEqual(3);
  expect(forest?.unlocked).toBe(true);
});
