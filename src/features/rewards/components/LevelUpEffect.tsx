import { SceneEffect } from '../../effects';

type LevelUpEffectProps = {
  visible: boolean;
};

export function LevelUpEffect({ visible }: LevelUpEffectProps) {
  if (!visible) {
    return null;
  }

  return (
    <SceneEffect
      className="border-2 border-[var(--color-primary)]"
      title="あたらしい ちからが めざめたよ"
      tone="level"
    />
  );
}
