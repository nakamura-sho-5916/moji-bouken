import { resolveItemAsset } from '../assetResolver';
import { GameAssetImage } from './GameAssetImage';

type ItemArtworkProps = {
  itemId: string;
  className?: string;
  locked?: boolean;
  equipped?: boolean;
};

const rarityRing = {
  common: 'ring-slate-200',
  uncommon: 'ring-emerald-300',
  rare: 'ring-sky-300',
  epic: 'ring-violet-300',
  legendary: 'ring-amber-300',
} as const;

export function ItemArtwork({
  itemId,
  className,
  locked = false,
  equipped = false,
}: ItemArtworkProps) {
  const asset = resolveItemAsset(itemId);
  return (
    <div
      className={[
        'relative flex aspect-square items-center justify-center rounded-[var(--radius-medium)] bg-white p-1 ring-2',
        rarityRing[asset.rarity],
        equipped ? 'ring-4 ring-[var(--color-secondary)]' : '',
        locked ? 'grayscale' : '',
        className ?? '',
      ].join(' ')}
    >
      <GameAssetImage
        assetId={asset.assetId}
        className={locked ? 'opacity-35' : ''}
        decorative={locked}
        size="full"
      />
      {locked ? (
        <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-slate-700">
          鍵
        </span>
      ) : null}
    </div>
  );
}
