type RewardItemCardProps = {
  label: string;
  value: string;
};

export function RewardItemCard({ label, value }: RewardItemCardProps) {
  return (
    <div className="rounded-[var(--radius-medium)] border border-[var(--color-border)] bg-white p-3 text-center font-black">
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-xl text-[var(--color-text)]">{value}</p>
    </div>
  );
}
