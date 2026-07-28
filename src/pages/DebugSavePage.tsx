import { useEffect, useState } from 'react';
import { LoadingScreen } from '../components/LoadingScreen';
import { openMojiBoukenDb } from '../db/database';
import {
  getActivePlayerId,
  getActiveSaveSlotId,
  listSaveSlotSummaries,
  startSaveSlot,
  type SaveSlotSummary,
} from '../db/repositories/saveSlotRepository';
import { worldAreas } from '../features/world/areaData';

type SlotDebugDetails = {
  playerName: string;
  level: number;
  experience: number;
  gold: number;
  currentArea: string;
  recoveryRate: number;
  learningLogCount: number;
  collectionCount: number;
  companionCount: number;
  lastSavedAt: string;
  storeCounts: Record<string, number>;
};

const COUNTED_STORES = [
  'players',
  'learningLogs',
  'letterProgress',
  'reviewSchedules',
  'worldProgress',
  'inventories',
  'settings',
  'collectionProgress',
  'albumEntries',
] as const;

async function loadSlotDebugDetails(playerId: string) {
  const db = await openMojiBoukenDb();
  const [
    player,
    inventory,
    learningLogs,
    letterProgress,
    reviewSchedules,
    worldProgress,
    collectionProgress,
    albumEntries,
    settings,
  ] = await Promise.all([
    db.get('players', playerId),
    db.get('inventories', playerId),
    db.getAllFromIndex('learningLogs', 'by-player', playerId),
    db.getAllFromIndex('letterProgress', 'by-player', playerId),
    db.getAllFromIndex('reviewSchedules', 'by-player', playerId),
    db.getAllFromIndex('worldProgress', 'by-player', playerId),
    db.getAllFromIndex('collectionProgress', 'by-player', playerId),
    db.getAllFromIndex('albumEntries', 'by-player', playerId),
    db.get('settings', playerId),
  ]);
  const unlockedAreas = worldProgress.filter((progress) => progress.unlocked);
  const currentAreaId =
    unlockedAreas
      .sort((a, b) => {
        const areaA =
          worldAreas.find((area) => area.id === a.areaId)?.order ?? 0;
        const areaB =
          worldAreas.find((area) => area.id === b.areaId)?.order ?? 0;
        return areaB - areaA;
      })
      .at(0)?.areaId ?? 'starting-village';
  const storeCounts = {
    players: player ? 1 : 0,
    learningLogs: learningLogs.length,
    letterProgress: letterProgress.length,
    reviewSchedules: reviewSchedules.length,
    worldProgress: worldProgress.length,
    inventories: inventory ? 1 : 0,
    settings: settings ? 1 : 0,
    collectionProgress: collectionProgress.length,
    albumEntries: albumEntries.length,
  } satisfies Record<(typeof COUNTED_STORES)[number], number>;
  const totalRecoveryStages = Math.max(1, worldAreas.length * 10);
  return {
    playerName: player?.name ?? '-',
    level: player?.level ?? 1,
    experience: player?.experience ?? 0,
    gold: inventory?.gold ?? 0,
    currentArea:
      worldAreas.find((area) => area.id === currentAreaId)?.name ??
      currentAreaId,
    recoveryRate: Math.round(
      (worldProgress.reduce(
        (sum, progress) => sum + progress.recoveryStage,
        0,
      ) /
        totalRecoveryStages) *
        100,
    ),
    learningLogCount: learningLogs.length,
    collectionCount: collectionProgress.length,
    companionCount: inventory?.companions.length ?? 0,
    lastSavedAt: player?.updatedAt ?? inventory?.updatedAt ?? '-',
    storeCounts,
  } satisfies SlotDebugDetails;
}

export function DebugSavePage() {
  const [slots, setSlots] = useState<SaveSlotSummary[] | null>(null);
  const [details, setDetails] = useState<Record<string, SlotDebugDetails>>({});

  const reload = async () => {
    const nextSlots = await listSaveSlotSummaries();
    const nextDetails = Object.fromEntries(
      await Promise.all(
        nextSlots.map(async (slot) => [
          slot.id,
          await loadSlotDebugDetails(slot.playerId),
        ]),
      ),
    );
    setSlots(nextSlots);
    setDetails(nextDetails);
  };

  useEffect(() => {
    let active = true;
    void listSaveSlotSummaries().then(async (nextSlots) => {
      const nextDetails = Object.fromEntries(
        await Promise.all(
          nextSlots.map(async (slot) => [
            slot.id,
            await loadSlotDebugDetails(slot.playerId),
          ]),
        ),
      );
      if (active) {
        setSlots(nextSlots);
        setDetails(nextDetails);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (!slots) {
    return <LoadingScreen />;
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
        <h1 className="text-2xl font-black text-[var(--color-primary-strong)]">
          Debug Save
        </h1>
        <p className="mt-2 font-bold">slots: {slots.length}</p>
        <p className="font-bold">activeSlot: {getActiveSaveSlotId()}</p>
        <p className="font-bold">activePlayer: {getActivePlayerId()}</p>
      </div>
      <div className="grid gap-3">
        {slots.map((slot) => {
          const detail = details[slot.id];
          return (
            <button
              className="grid min-h-16 gap-1 rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white p-3 text-left font-bold"
              key={slot.id}
              onClick={() => {
                void startSaveSlot(slot.id).then(reload);
              }}
              type="button"
            >
              <span className="font-black">
                {slot.id} / {slot.name}
              </span>
              <span>
                empty: {String(slot.empty)} / level: {slot.level} / town:{' '}
                {slot.townRecoveryRate}%
              </span>
              {detail ? (
                <>
                  <span>
                    player: {detail.playerName} / exp: {detail.experience} /
                    gold: {detail.gold}
                  </span>
                  <span>
                    area: {detail.currentArea} / recovery: {detail.recoveryRate}
                    %
                  </span>
                  <span>
                    logs: {detail.learningLogCount} / collection:{' '}
                    {detail.collectionCount} / companions:{' '}
                    {detail.companionCount}
                  </span>
                  <span>lastSavedAt: {detail.lastSavedAt}</span>
                  <span>
                    storeCounts:{' '}
                    {COUNTED_STORES.map(
                      (storeName) =>
                        `${storeName}=${detail.storeCounts[storeName]}`,
                    ).join(', ')}
                  </span>
                </>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
