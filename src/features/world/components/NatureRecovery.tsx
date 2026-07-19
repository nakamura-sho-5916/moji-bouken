export function NatureRecovery({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-[var(--radius-medium)] bg-emerald-100 px-3 py-2 text-sm font-black text-emerald-900">
      <span aria-hidden="true">{active ? '🌳' : '🌱'}</span>
      <span>{active ? 'みどりが ふえたよ' : 'ちいさな めが でたよ'}</span>
    </div>
  );
}
