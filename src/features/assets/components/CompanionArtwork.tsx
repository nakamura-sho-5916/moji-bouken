import { resolveCompanionAsset } from '../assetResolver';
import { GameAssetImage } from './GameAssetImage';

type CompanionArtworkProps = {
  companionId: string;
  className?: string;
  locked?: boolean;
  selected?: boolean;
};

export function CompanionArtwork({
  companionId,
  className,
  locked = false,
  selected = false,
}: CompanionArtworkProps) {
  const asset = resolveCompanionAsset(companionId);
  return (
    <div
      className={[
        'relative flex aspect-square items-center justify-center rounded-[var(--radius-large)] bg-white/80',
        selected ? 'ring-4 ring-[var(--color-secondary)]' : '',
        locked ? 'grayscale' : '',
        className ?? '',
      ].join(' ')}
    >
      <GameAssetImage
        assetId={asset.assetId}
        className={locked ? 'opacity-40' : ''}
        decorative={locked}
        size="full"
      />
      {locked ? (
        <span className="absolute inset-0 flex items-center justify-center text-4xl font-black text-slate-700">
          ?
        </span>
      ) : null}
    </div>
  );
}
