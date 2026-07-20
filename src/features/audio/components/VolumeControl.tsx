type VolumeControlProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

export function VolumeControl({ label, value, onChange }: VolumeControlProps) {
  return (
    <label className="grid gap-2 font-black">
      <span className="flex items-center justify-between gap-3">
        {label}
        <span>{value}</span>
      </span>
      <input
        className="w-full accent-[var(--color-primary)]"
        max={100}
        min={0}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        type="range"
        value={value}
      />
    </label>
  );
}
