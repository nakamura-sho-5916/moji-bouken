import { useEffect, useMemo, useState } from 'react';
import { LoadingScreen } from '../components/LoadingScreen';
import { loadLearningContent } from '../content/loaders/contentLoader';
import {
  CompanionArtwork,
  EnemyArtwork,
  ItemArtwork,
} from '../features/assets';
import { CollectionCard } from '../features/collection/components/CollectionCard';
import {
  companionData,
  equipmentData,
  getCollectionState,
} from '../features/collection';
import type { CollectionProgress } from '../types';

type CollectionTab = 'words' | 'companions' | 'enemies' | 'items' | 'album';

function hasProgress(
  progress: CollectionProgress[],
  category: CollectionProgress['category'],
  targetId: string,
) {
  return progress.some(
    (item) => item.category === category && item.targetId === targetId,
  );
}

export function CollectionPage({
  initialTab = 'words',
}: {
  initialTab?: CollectionTab;
}) {
  const [tab, setTab] = useState<CollectionTab>(initialTab);
  const [state, setState] = useState<Awaited<
    ReturnType<typeof getCollectionState>
  > | null>(null);

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

  const content = useMemo(() => loadLearningContent(), []);

  if (!state) {
    return <LoadingScreen />;
  }

  const tabs: { id: CollectionTab; label: string }[] = [
    { id: 'words', label: 'ことば' },
    { id: 'companions', label: 'なかま' },
    { id: 'enemies', label: 'てき' },
    { id: 'items', label: 'アイテム' },
    { id: 'album', label: 'アルバム' },
  ];
  const ownedItemIds = new Set([
    ...(state.inventory?.items.map((item) => item.id) ?? []),
    ...(state.inventory?.equipment.map((item) => item.id) ?? []),
  ]);
  const wordTargets = [
    ...content.hiragana.slice(0, 10).map((letter) => ({
      id: letter.id,
      category: 'hiragana' as const,
    })),
    ...content.katakana.slice(0, 6).map((letter) => ({
      id: letter.id,
      category: 'katakana' as const,
    })),
    ...content.words.slice(0, 8).map((word) => ({
      id: word.id,
      category: 'word' as const,
    })),
  ];
  const wordFound = wordTargets.filter((item) =>
    hasProgress(state.progress, item.category, item.id),
  ).length;
  const companionFound = companionData.filter((companion) =>
    hasProgress(state.progress, 'companion', companion.id),
  ).length;
  const enemyFound = state.enemies.filter((enemy) =>
    hasProgress(state.progress, 'enemy', enemy.id),
  ).length;
  const itemFound = equipmentData.filter((item) =>
    ownedItemIds.has(item.id),
  ).length;

  return (
    <section className="grid gap-4">
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <h1 className="text-3xl font-black text-[var(--color-primary-strong)]">
          ずかん
        </h1>
        <p className="mt-2 font-bold text-[var(--color-text-muted)]">
          であったものを みてみよう
        </p>
        <p className="mt-3 rounded-[var(--radius-medium)] bg-orange-50 p-3 text-sm font-black text-[var(--color-primary-strong)]">
          ことば {wordFound}/{wordTargets.length} ・ なかま {companionFound}/
          {companionData.length} ・ てき {enemyFound}/{state.enemies.length} ・
          アイテム {itemFound}/{equipmentData.length}
        </p>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {tabs.map((item) => (
          <button
            className={[
              'min-h-12 rounded-[var(--radius-medium)] font-black',
              tab === item.id
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-[var(--color-text)]',
            ].join(' ')}
            key={item.id}
            onClick={() => setTab(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
      {tab === 'words' ? (
        <div className="grid gap-3">
          {content.hiragana.slice(0, 10).map((letter) => (
            <CollectionCard
              description="ひらがなと であったよ"
              discovered={hasProgress(state.progress, 'hiragana', letter.id)}
              icon={letter.character}
              key={letter.id}
              title={letter.character}
            />
          ))}
          {content.katakana.slice(0, 6).map((letter) => (
            <CollectionCard
              description="カタカナと であったよ"
              discovered={hasProgress(state.progress, 'katakana', letter.id)}
              icon={letter.character}
              key={letter.id}
              title={letter.character}
            />
          ))}
          {content.words.slice(0, 8).map((word) => (
            <CollectionCard
              description="ことばを みつけたよ"
              discovered={hasProgress(state.progress, 'word', word.id)}
              icon={word.display.slice(0, 1)}
              key={word.id}
              title={word.display}
            />
          ))}
        </div>
      ) : null}
      {tab === 'companions' ? (
        <div className="grid gap-3">
          {companionData.map((companion) => (
            <CollectionCard
              description={`${companion.skillName} / ${companion.description}`}
              discovered={hasProgress(
                state.progress,
                'companion',
                companion.id,
              )}
              icon={
                <CompanionArtwork
                  className="size-14"
                  companionId={companion.id}
                />
              }
              key={companion.id}
              title={companion.name}
            />
          ))}
        </div>
      ) : null}
      {tab === 'enemies' ? (
        <div className="grid gap-3">
          {state.enemies.map((enemy) => (
            <CollectionCard
              description={`${enemy.areaId} / ${enemy.rarity} / ${enemy.rewardExperience}EXP`}
              discovered={hasProgress(state.progress, 'enemy', enemy.id)}
              icon={<EnemyArtwork className="size-14" enemyId={enemy.id} />}
              key={enemy.id}
              title={enemy.name}
            />
          ))}
        </div>
      ) : null}
      {tab === 'items' ? (
        <div className="grid gap-3">
          {equipmentData.map((item) => (
            <CollectionCard
              description={`${item.description} / ${item.price}G`}
              discovered={ownedItemIds.has(item.id)}
              icon={<ItemArtwork className="size-14" itemId={item.id} />}
              key={item.id}
              title={item.name}
            />
          ))}
        </div>
      ) : null}
      {tab === 'album' ? (
        <div className="grid gap-3">
          {state.albumEntries.length === 0 ? (
            <CollectionCard
              description="せかいを げんきにすると ふえるよ"
              discovered={false}
              icon="記"
              title="まだ ないよ"
            />
          ) : (
            state.albumEntries.map((entry) => (
              <CollectionCard
                description={`${entry.beforeVisual} -> ${entry.afterVisual} ${entry.description}`}
                discovered
                icon={entry.afterVisual}
                key={entry.eventId}
                title={entry.title}
              />
            ))
          )}
        </div>
      ) : null}
    </section>
  );
}
