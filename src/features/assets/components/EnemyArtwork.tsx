import { resolveEnemyAsset } from '../assetResolver';
import { GameAssetImage } from './GameAssetImage';

type EnemyArtworkProps = {
  enemyId: string;
  className?: string;
  defeated?: boolean;
  hit?: boolean;
};

export function EnemyArtwork({
  enemyId,
  className,
  defeated = false,
  hit = false,
}: EnemyArtworkProps) {
  const asset = resolveEnemyAsset(enemyId);
  return (
    <div
      className={[
        'relative mx-auto flex aspect-square w-full max-w-56 items-center justify-center',
        hit ? 'motion-safe:animate-[asset-hit_.28s_ease-out_1]' : '',
        defeated ? 'motion-safe:animate-[asset-defeat_.42s_ease-in_1]' : '',
        className ?? '',
      ].join(' ')}
    >
      <GameAssetImage
        assetId={asset.assetId}
        className="h-full w-full"
        loading="eager"
        size="full"
      />
    </div>
  );
}
