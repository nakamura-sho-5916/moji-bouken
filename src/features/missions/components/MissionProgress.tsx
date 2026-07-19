type MissionProgressProps = {
  currentIndex: number;
  totalCount: number;
};

export function MissionProgress({
  currentIndex,
  totalCount,
}: MissionProgressProps) {
  return (
    <ol aria-label="ミッションのすすみ" className="grid grid-cols-10 gap-1">
      {Array.from({ length: totalCount }, (_, index) => (
        <li key={index}>
          <span
            className={[
              'block h-3 rounded-[var(--radius-pill)]',
              index <= currentIndex
                ? 'bg-[var(--color-primary)]'
                : 'bg-orange-100',
            ].join(' ')}
          />
        </li>
      ))}
    </ol>
  );
}
