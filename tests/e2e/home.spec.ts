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
});
