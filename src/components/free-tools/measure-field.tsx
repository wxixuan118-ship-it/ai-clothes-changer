// Labeled number input shared by the free calculators.
export function MeasureField({
  id,
  label,
  help,
  unit,
  value,
  onChange,
  min,
  max,
  placeholder,
}: {
  id: string;
  label: string;
  help?: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-semibold">
        {label}
      </label>
      {help ? (
        <p id={`${id}-help`} className="mt-1 text-sm text-[var(--muted-ink)]">
          {help}
        </p>
      ) : null}
      <div className="relative mt-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step="0.1"
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={help ? `${id}-help` : undefined}
          className="w-full rounded-xl border bg-[var(--canvas)] px-4 py-3 pr-12 text-lg outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/25"
          placeholder={placeholder}
        />
        <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm text-[var(--muted-ink)]">
          {unit}
        </span>
      </div>
    </div>
  );
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex w-fit rounded-full border p-1 text-sm">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`rounded-full px-4 py-1.5 transition-colors ${value === option.value ? "bg-[var(--brand)] text-[var(--ink-deep)]" : "text-[var(--muted-ink)] hover:text-[var(--ink)]"}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
