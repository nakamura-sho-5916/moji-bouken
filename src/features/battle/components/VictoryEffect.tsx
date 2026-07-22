import { SceneEffect } from '../../effects';

type VictoryEffectProps = {
  visible: boolean;
};

export function VictoryEffect({ visible }: VictoryEffectProps) {
  if (!visible) {
    return null;
  }

  return (
    <SceneEffect
      className="border-2 border-[var(--color-success)] text-[var(--color-success)]"
      title="やったね"
      tone="victory"
    />
  );
}
