import { useEffect, useState } from 'react';
import { LoadingScreen } from '../components/LoadingScreen';
import { loadLearningContent } from '../content/loaders/contentLoader';
import {
  addDebugGold,
  applyCompanionSkill,
  companionData,
  discoverLetterOrWord,
  equipmentData,
  equipItem,
  getCollectionState,
  joinCompanion,
  purchaseEquipment,
  recordAlbumEvent,
  recordEnemyEncounter,
  resetDebugCollectionData,
  selectCompanion,
} from '../features/collection';

export function DebugCollectionPage() {
  const [state, setState] = useState<Awaited<
    ReturnType<typeof getCollectionState>
  > | null>(null);
  const [message, setMessage] = useState('Debug Collection');
  const content = loadLearningContent();

  const reload = async () => {
    setState(await getCollectionState());
  };

  useEffect(() => {
    let active = true;
    void getCollectionState().then((nextState) => {
      if (active) {
        setState(nextState);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (!state) {
    return <LoadingScreen />;
  }

  const firstEquipment = equipmentData[0];
  const firstLetter = content.hiragana[0];
  const firstWord = content.words[0];

  return (
    <section className="grid gap-4">
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <h1 className="text-2xl font-black text-[var(--color-primary-strong)]">
          Debug Collection
        </h1>
        <p className="mt-2 font-bold text-[var(--color-text-muted)]">
          {message}
        </p>
        <p className="mt-2 font-black">gold: {state.inventory?.gold ?? 0}</p>
        <p className="font-black">
          companions: {state.inventory?.companions.length ?? 0}
        </p>
        <p className="font-black">
          equipment: {state.inventory?.equipment.length ?? 0}
        </p>
        <p className="font-black">progress: {state.progress.length}</p>
        <p className="font-black">album: {state.albumEntries.length}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          className="min-h-14 rounded-[var(--radius-medium)] bg-[var(--color-primary)] font-black text-white"
          onClick={() => {
            void addDebugGold(200).then(async () => {
              setMessage('ゴールドを ふやしました');
              await reload();
            });
          }}
          type="button"
        >
          ゴールド追加
        </button>
        <button
          className="min-h-14 rounded-[var(--radius-medium)] bg-[var(--color-secondary)] font-black text-white"
          onClick={() => {
            void joinCompanion('rabbit').then(async (result) => {
              setMessage(result.eventShown ? 'なかまが きたよ' : 'なかま確認');
              await reload();
            });
          }}
          type="button"
        >
          仲間を加入
        </button>
        <button
          className="min-h-14 rounded-[var(--radius-medium)] bg-white font-black"
          onClick={() => {
            void selectCompanion('rabbit').then(async (done) => {
              setMessage(done ? '同行仲間変更' : '未加入です');
              await reload();
            });
          }}
          type="button"
        >
          同行仲間変更
        </button>
        <button
          className="min-h-14 rounded-[var(--radius-medium)] bg-white font-black"
          onClick={() => {
            const result = applyCompanionSkill({
              skillId: 'reduce-choice',
              missionType: 'letter-search',
              choices: ['あ', 'い', 'う'],
              correctAnswer: 'あ',
              usedCount: 0,
              maxUses: 1,
            });
            setMessage(result.message);
          }}
          type="button"
        >
          スキル模擬
        </button>
        <button
          className="min-h-14 rounded-[var(--radius-medium)] bg-white font-black"
          onClick={() => {
            if (!firstEquipment) {
              return;
            }
            void purchaseEquipment(firstEquipment.id).then(async (result) => {
              setMessage(result.message);
              await reload();
            });
          }}
          type="button"
        >
          ショップ購入
        </button>
        <button
          className="min-h-14 rounded-[var(--radius-medium)] bg-white font-black"
          onClick={() => {
            if (!firstEquipment) {
              return;
            }
            void equipItem(firstEquipment.id).then(async (done) => {
              setMessage(done ? '装備しました' : '未所持です');
              await reload();
            });
          }}
          type="button"
        >
          装備変更
        </button>
        <button
          className="min-h-14 rounded-[var(--radius-medium)] bg-white font-black"
          onClick={() => {
            if (!firstLetter || !firstWord) {
              return;
            }
            void Promise.all([
              discoverLetterOrWord({
                category: 'hiragana',
                targetId: firstLetter.id,
                source: 'debug',
              }),
              discoverLetterOrWord({
                category: 'word',
                targetId: firstWord.id,
                source: 'debug',
              }),
            ]).then(async () => {
              setMessage('文字と単語を発見済みにしました');
              await reload();
            });
          }}
          type="button"
        >
          文字・単語発見
        </button>
        <button
          className="min-h-14 rounded-[var(--radius-medium)] bg-white font-black"
          onClick={() => {
            void recordEnemyEncounter({
              enemyId: 'enemy-moji-slime',
              source: 'encounter',
            }).then(async () => {
              setMessage('敵遭遇を記録しました');
              await reload();
            });
          }}
          type="button"
        >
          敵遭遇記録
        </button>
        <button
          className="min-h-14 rounded-[var(--radius-medium)] bg-white font-black"
          onClick={() => {
            void recordAlbumEvent({
              eventId: 'debug-album-event',
              areaId: 'starting-village',
              title: 'はしが なおった！',
              description: 'ことばの森へ いけるようになったよ',
              beforeVisual: '🪵',
              afterVisual: '🌉',
              order: 1,
            }).then(async () => {
              setMessage('アルバムを追加しました');
              await reload();
            });
          }}
          type="button"
        >
          アルバム追加
        </button>
        <button
          className="min-h-14 rounded-[var(--radius-medium)] border border-red-200 bg-red-50 font-black text-red-700"
          onClick={() => {
            if (!window.confirm('テストデータをリセットしますか？')) {
              return;
            }
            void resetDebugCollectionData().then(async () => {
              setMessage('テストデータをリセットしました');
              await reload();
            });
          }}
          type="button"
        >
          テストデータをリセット
        </button>
      </div>
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-4">
        <p className="font-black">仲間一覧: {companionData.length}</p>
        <p className="font-black">装備一覧: {equipmentData.length}</p>
        <p className="font-black">
          重複確認:{' '}
          {new Set(state.progress.map((item) => item.id)).size ===
          state.progress.length
            ? 'OK'
            : 'NG'}
        </p>
      </div>
    </section>
  );
}
