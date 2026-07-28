import { useEffect, useMemo } from 'react';
import { EffectBurst } from '../../effects';
import { getWorldArea } from '../areaData';

export const AREA_UNLOCK_CINEMATIC_DURATION_MS = 3600;

const residentComments = [
  '気を付けてね！',
  '新しい敵がいるよ！',
  '宝箱があるかも！',
] as const;

function selectResidentComment(areaId: string) {
  const total = Array.from(areaId).reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );
  return residentComments[total % residentComments.length];
}

export function AreaUnlockCinematic({
  areaIds,
  onComplete,
}: {
  areaIds: string[];
  onComplete: () => void;
}) {
  const area = useMemo(() => {
    const firstAreaId = areaIds[0];
    return firstAreaId ? getWorldArea(firstAreaId) : null;
  }, [areaIds]);
  const residentComment = area ? selectResidentComment(area.id) : null;

  useEffect(() => {
    if (!area) {
      return undefined;
    }

    const timer = window.setTimeout(
      onComplete,
      AREA_UNLOCK_CINEMATIC_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [area, onComplete]);

  if (!area) {
    return null;
  }

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 z-50 grid place-items-center bg-sky-950/85 px-3 py-5 text-center text-white"
      data-testid="area-unlock-cinematic"
    >
      <div className="grid w-full max-w-sm gap-3 rounded-[var(--radius-large)] border-2 border-amber-200 bg-white p-4 text-[var(--color-text)] shadow-xl">
        <div className="rounded-[var(--radius-medium)] bg-amber-50 p-3">
          <p className="text-sm font-black text-amber-700">住人集合</p>
          <div className="mt-2 flex items-end justify-center gap-2">
            {['子ども', '町長', '商人', '犬'].map((resident, index) => (
              <span
                className="rounded-full bg-white px-2 py-1 text-xs font-black text-[var(--color-primary-strong)] motion-safe:animate-[game-area-resident-cheer_.7s_ease-in-out_infinite]"
                key={resident}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {resident}
              </span>
            ))}
          </div>
          <p className="mt-3 whitespace-pre-line text-lg font-black text-[var(--color-primary-strong)]">
            {'ありがとう！\n橋が直った！\n新しい町へ行けるぞ！'}
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[var(--radius-medium)] bg-emerald-50 p-3">
          <p className="text-sm font-black text-emerald-800">橋工事開始</p>
          <div className="relative mx-auto mt-3 h-20 max-w-72">
            <div className="absolute inset-x-3 bottom-3 h-6 rounded-full bg-slate-300/45 motion-safe:animate-[game-area-bridge-build_1.2s_ease-out_1]" />
            <div className="absolute inset-x-6 bottom-5 h-3 rounded-full bg-amber-700/90 motion-safe:animate-[game-area-bridge-color_1.4s_ease-out_1]" />
            <div className="absolute left-6 top-2 text-xl motion-safe:animate-[game-area-dog-run_1.3s_ease-in-out_infinite]">
              犬
            </div>
            <EffectBurst
              className="absolute right-5 top-1"
              size="sm"
              tone="recovery"
            />
          </div>
          <p className="font-black text-emerald-800">橋完成！</p>
        </div>

        <div className="relative overflow-hidden rounded-[var(--radius-medium)] bg-sky-50 p-4">
          <div className="absolute inset-x-0 top-2 flex justify-around text-sky-200 motion-safe:animate-[game-area-cloud-drift_2.2s_ease-out_1]">
            <span>雲</span>
            <span>雲</span>
            <span>雲</span>
          </div>
          <p className="relative text-sm font-black text-sky-700">━━━━━━━━━━</p>
          <p className="relative text-3xl font-black tracking-normal text-sky-700">
            NEW AREA
          </p>
          <h2 className="relative text-2xl font-black text-[var(--color-primary-strong)]">
            {area.name}
          </h2>
          <p className="relative text-2xl font-black text-emerald-700">
            解放！
          </p>
          <p className="relative text-sm font-black text-sky-700">━━━━━━━━━━</p>
        </div>

        <p className="rounded-[var(--radius-medium)] bg-orange-50 p-3 text-lg font-black text-[var(--color-primary-strong)]">
          {residentComment}
        </p>
      </div>
    </div>
  );
}
