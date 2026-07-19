export function BridgeRecovery({ repaired }: { repaired: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-[var(--radius-medium)] bg-amber-100 px-3 py-2 text-sm font-black text-amber-900">
      <span aria-hidden="true">{repaired ? '🌉' : '🪵'}</span>
      <span>{repaired ? 'はしが なおったよ' : 'はしを なおしているよ'}</span>
    </div>
  );
}
