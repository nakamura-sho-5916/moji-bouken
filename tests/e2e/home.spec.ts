import { expect, test, type Page } from '@playwright/test';

async function answerCurrentMissionCorrectly(page: Page) {
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
    return { answeredChoice: false, hpDecreased: false };
  }

  const beforeBattle = await page.evaluate(() => {
    const raw = localStorage.getItem('moji-bouken:active-battle-session');
    return raw ? (JSON.parse(raw) as { enemyCurrentHp: number }) : null;
  });
  if (mission?.missionType === 'word-ordering') {
    for (const character of Array.from(mission.correctAnswer)) {
      await page.getByRole('button', { name: character }).first().click();
    }
  } else {
    await page
      .getByRole('button', { name: mission?.correctAnswer ?? '' })
      .first()
      .click();
  }
  await page.getByRole('button', { name: 'こたえる' }).click();
  await expect(page.getByText('やったね').first()).toBeVisible();
  const afterBattle = await page.evaluate(() => {
    const raw = localStorage.getItem('moji-bouken:active-battle-session');
    return raw ? (JSON.parse(raw) as { enemyCurrentHp: number }) : null;
  });
  expect(beforeBattle).not.toBeNull();
  expect(afterBattle).not.toBeNull();
  const hpDecreased =
    (beforeBattle?.enemyCurrentHp ?? 0) > 0 &&
    (afterBattle?.enemyCurrentHp ?? 0) < (beforeBattle?.enemyCurrentHp ?? 0);
  await page.getByRole('button', { name: 'つぎへ' }).click();
  return { answeredChoice: true, hpDecreased };
}

async function expectCurrentChoiceMissionHasCorrectAnswer(page: Page) {
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
    mission?.missionType === 'boss-mixed' ||
    mission?.missionType === 'word-ordering'
  ) {
    return false;
  }

  await expect(
    page.getByRole('button', { name: mission?.correctAnswer ?? '' }).first(),
  ).toBeVisible();
  return true;
}

async function getCurrentCorrectChoicePosition(page: Page) {
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
  const mission = session?.missions[session.currentIndex];
  if (
    !mission ||
    mission.missionType === 'letter-introduction' ||
    mission.missionType === 'boss-mixed' ||
    mission.missionType === 'word-ordering'
  ) {
    return -1;
  }

  const labels = await page
    .getByRole('group', { name: '選択肢' })
    .getByRole('button')
    .evaluateAll((buttons) =>
      buttons.map(
        (button) => button.textContent?.normalize('NFC').trim() ?? '',
      ),
    );
  return labels.findIndex(
    (label) => label === mission.correctAnswer.normalize('NFC'),
  );
}

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
  await expect(page.getByText('てきが あらわれた')).toBeVisible();

  let confirmedBattleAnswer = false;
  for (let index = 0; index < 10; index += 1) {
    const result = await answerCurrentMissionCorrectly(page);
    confirmedBattleAnswer ||= result.answeredChoice && result.hpDecreased;
    if (index === 0 && result.answeredChoice) {
      await expect(page.getByText('2 / 10')).toBeVisible();
    }
  }
  expect(confirmedBattleAnswer).toBe(true);

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

test('generated missions expose a visible correct answer choice 20 times', async ({
  browser,
}) => {
  const correctPositions = new Set<number>();
  for (let index = 0; index < 20; index += 1) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/mission');
    await page.locator('button').first().click();
    await page.waitForFunction(() =>
      Boolean(localStorage.getItem('moji-bouken:mission-session')),
    );

    let foundChoiceMission =
      await expectCurrentChoiceMissionHasCorrectAnswer(page);
    for (let step = 0; step < 3 && !foundChoiceMission; step += 1) {
      await answerCurrentMissionCorrectly(page);
      foundChoiceMission =
        await expectCurrentChoiceMissionHasCorrectAnswer(page);
    }

    expect(foundChoiceMission).toBe(true);
    const position = await getCurrentCorrectChoicePosition(page);
    expect(position).toBeGreaterThanOrEqual(0);
    correctPositions.add(position);
    await context.close();
  }
  expect(correctPositions).toEqual(new Set([0, 1, 2, 3]));
});

test('本番バトル画面にデバッグ回答ボタンが表示されない', async ({ page }) => {
  await page.goto('/battle');
  await expect(
    page.getByText('バトルは ミッションと いっしょに すすむよ'),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'せいかい' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'ちがう' })).toHaveCount(0);
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
  await expect(page).toHaveURL(/\/mission\?areaId=starting-village/);

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

test('仲間・装備・図鑑・復興アルバムを確認できる', async ({ page }) => {
  await page.goto('/collection');
  await expect(page.getByRole('heading', { name: 'ずかん' })).toBeVisible();
  await expect(page.getByText('まだ であっていないよ').first()).toBeVisible();

  await page.goto('/mission');
  await page.getByRole('button', { name: 'ミッションを はじめる' }).click();
  await page.waitForFunction(() =>
    Boolean(localStorage.getItem('moji-bouken:mission-session')),
  );
  const session = await page.evaluate(() => {
    const raw = localStorage.getItem('moji-bouken:mission-session');
    return raw
      ? (JSON.parse(raw) as {
          missions: { missionType: string; correctAnswer: string }[];
        })
      : null;
  });
  const mission = session?.missions[0];
  if (
    mission?.missionType === 'letter-introduction' ||
    mission?.missionType === 'boss-mixed'
  ) {
    await page
      .getByRole('button', {
        name:
          mission.missionType === 'letter-introduction' ? 'おぼえた' : 'つぎへ',
      })
      .click();
  } else if (mission?.missionType === 'word-ordering') {
    for (const character of Array.from(mission.correctAnswer)) {
      await page.getByRole('button', { name: character }).first().click();
    }
    await page.getByRole('button', { name: 'こたえる' }).click();
  } else {
    await page
      .getByRole('button', { name: mission?.correctAnswer ?? '' })
      .first()
      .click();
    await page.getByRole('button', { name: 'こたえる' }).click();
  }

  await page.goto('/debug/world');
  for (let index = 0; index < 3; index += 1) {
    await page.getByRole('button', { name: '大きく復興' }).click();
    await expect(page.getByText(/せかいが げんきになりました/)).toBeVisible();
    await page.waitForTimeout(20);
  }

  await page.goto('/debug/collection');
  await expect(
    page.getByRole('heading', { name: 'Debug Collection' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'ゴールド追加' }).click();
  await page.getByRole('button', { name: '仲間を加入' }).click();
  await page.getByRole('button', { name: '同行仲間変更' }).click();
  await page.getByRole('button', { name: '文字・単語発見' }).click();
  await page.getByRole('button', { name: '敵遭遇記録' }).click();
  await page.getByRole('button', { name: 'アルバム追加' }).click();
  await expect(page.getByText('アルバムを追加しました')).toBeVisible();

  await page.goto('/companions');
  await page.getByRole('button', { name: /うさぎ/ }).click();
  await expect(page.getByText('いっしょに いこうね')).toBeVisible();

  await page.goto('/shop');
  await expect(page.getByRole('heading', { name: 'おみせ' })).toBeVisible();
  await page
    .getByRole('button', { name: 'これを てにいれる？' })
    .first()
    .click();
  await page.getByRole('button', { name: 'てにいれる', exact: true }).click();
  await expect(page.getByText(/てにいれたよ|もう もっているよ/)).toBeVisible();

  await page.goto('/equipment');
  await page.getByRole('button', { name: /もじのつえ/ }).click();
  await expect(page.getByText('にあってるね！')).toBeVisible();

  await page.goto('/collection');
  await page.getByRole('button', { name: 'なかま' }).click();
  await expect(page.getByText('うさぎ')).toBeVisible();
  await page.getByRole('button', { name: 'てき' }).click();
  await expect(page.getByText('もじスライム')).toBeVisible();
  await page.getByRole('button', { name: 'アルバム' }).click();
  await expect(page.getByText('はしが なおった！')).toBeVisible();

  await page.goto('/collection/album');
  await expect(page.getByText('はしが なおった！')).toBeVisible();
});

test('保護者PIN・概要・バックアップ画面を確認できる', async ({ page }) => {
  await page.goto('/parent');
  await expect(page.getByRole('heading', { name: '保護者' })).toBeVisible();
  await page.getByPlaceholder('4けた').fill('1234');
  await page.getByPlaceholder('もういちど').fill('1234');
  await page.getByRole('button', { name: 'せっていする' }).click();
  await expect(page.getByText('保護者ダッシュボード')).toBeVisible();
  await expect(page.getByText('総回答数')).toBeVisible();

  await page.getByRole('button', { name: '設定' }).click();
  await page.getByLabel('標準問題数').selectOption('5');
  await expect(page.getByText('バージョン 0.1.3')).toBeVisible();

  await page.getByRole('button', { name: 'バックアップ' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'バックアップ出力' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/moji-bouken-backup/);

  await page.getByRole('button', { name: 'ロック' }).click();
  await expect(page.getByRole('button', { name: 'ひらく' })).toBeVisible();
  await page.getByPlaceholder('4けた').fill('1234');
  await page.getByRole('button', { name: 'ひらく' }).click();
  await expect(page.getByText('保護者ダッシュボード')).toBeVisible();

  await page.goto('/mission');
  await page.getByRole('button', { name: 'ミッションを はじめる' }).click();
  await expect(page.getByText('1 / 5')).toBeVisible();
});
