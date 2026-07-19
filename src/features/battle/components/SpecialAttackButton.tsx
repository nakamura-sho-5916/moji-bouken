type SpecialAttackButtonProps = {
  ready: boolean;
  onUse: () => void;
};

export function SpecialAttackButton({
  ready,
  onUse,
}: SpecialAttackButtonProps) {
  return (
    <button
      className="min-h-12 rounded-[var(--radius-medium)] bg-[var(--color-primary)] px-4 text-lg font-black text-white disabled:opacity-50"
      disabled={!ready}
      onClick={onUse}
      type="button"
    >
      ひっさつわざ
    </button>
  );
}
