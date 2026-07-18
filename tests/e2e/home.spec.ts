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
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
});
