export function ShopRecovery({ opened }: { opened: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-[var(--radius-medium)] bg-sky-100 px-3 py-2 text-sm font-black text-sky-900">
      <span aria-hidden="true">{opened ? '🏪' : '🧰'}</span>
      <span>{opened ? 'おみせが あいたよ' : 'おみせを じゅんび中'}</span>
    </div>
  );
}
