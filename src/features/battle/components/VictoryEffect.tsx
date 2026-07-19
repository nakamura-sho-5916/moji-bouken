type VictoryEffectProps = {
  visible: boolean;
};

export function VictoryEffect({ visible }: VictoryEffectProps) {
  if (!visible) {
    return null;
  }

  return (
    <p className="rounded-[var(--radius-large)] border-2 border-[var(--color-success)] bg-white p-4 text-center text-xl font-black text-[var(--color-success)]">
      やったね
    </p>
  );
}
