import { DB_NAME } from '../../db/constants';
import {
  closeDbConnectionForTests,
  resetDbConnectionForTests,
} from '../../db/database';
import { initializeAppData } from '../../db/initializeAppData';
import { verifyParentPin } from './pin';

export const RESET_CONFIRM_TEXT = 'リセット';

export async function resetAllData(input: {
  pin: string;
  confirmText: string;
}) {
  const verified = await verifyParentPin(input.pin);
  if (!verified.ok || input.confirmText !== RESET_CONFIRM_TEXT) {
    return { ok: false, message: '確認できませんでした' };
  }
  await closeDbConnectionForTests();
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(new Error('IndexedDB delete was blocked.'));
  });
  resetDbConnectionForTests();
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('moji-bouken:')) {
      localStorage.removeItem(key);
    }
  }
  await initializeAppData();
  return { ok: true, message: '初期データを作りました' };
}
