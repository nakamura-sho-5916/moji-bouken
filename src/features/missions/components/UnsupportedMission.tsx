type UnsupportedMissionProps = {
  onComplete: () => void;
};

export function UnsupportedMission({ onComplete }: UnsupportedMissionProps) {
  return (
    <section className="grid gap-5 rounded-[var(--radius-large)] border border-[var(--color-border)] bg-white p-5">
      <p className="text-xl font-black text-[var(--color-text)]">
        この ミッションは じゅんびちゅうだよ。
      </p>
      <button
        className="min-h-14 rounded-[var(--radius-medium)] bg-[var(--color-secondary)] px-5 text-xl font-black text-white"
        onClick={onComplete}
        type="button"
      >
        つぎへ
      </button>
    </section>
  );
}
