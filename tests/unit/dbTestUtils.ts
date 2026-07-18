import { DB_NAME } from '../../src/db/constants';
import { closeDbConnectionForTests } from '../../src/db/database';

export async function resetIndexedDb() {
  await closeDbConnectionForTests();
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(new Error('IndexedDB delete was blocked.'));
  });
}
