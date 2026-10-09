export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-[20px] border bg-[var(--paper-2)] p-5">
      <p className="text-sm text-[var(--muted-ink)]">{label}</p>
      <p className="mt-2 font-heading text-3xl font-semibold tabular-nums">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-[var(--muted-ink)]">{hint}</p>
      ) : null}
    </div>
  );
}

/** Dependency-free bar chart: one or two stacked series per day. */
export function BarChart({
  title,
  data,
  series,
}: {
  title: string;
  data: ({ day: string } & Record<string, number | string>)[];
  series: { key: string; label: string; color: string }[];
}) {
  const totals = data.map((row) =>
    series.reduce((sum, s) => sum + Number(row[s.key] ?? 0), 0),
  );
  const max = Math.max(1, ...totals);
  return (
    <figure className="rounded-[20px] border bg-[var(--paper-2)] p-5">
      <figcaption className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <span className="font-medium">{title}</span>
        <span className="flex gap-3 text-xs text-[var(--muted-ink)]">
          {series.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="size-2.5 rounded-sm"
                style={{ background: s.color }}
              />
              {s.label}
            </span>
          ))}
        </span>
      </figcaption>
      <div
        className="flex h-40 items-end gap-1.5"
        role="img"
        aria-label={title}
      >
        {data.map((row, i) => (
          <div
            key={row.day}
            className="flex h-full flex-1 flex-col justify-end"
            title={`${row.day}: ${series.map((s) => `${s.label} ${row[s.key]}`).join(", ")}`}
          >
            <div
              className="flex flex-col-reverse overflow-hidden rounded-t-sm"
              style={{ height: `${((totals[i] ?? 0) / max) * 100}%` }}
            >
              {series.map((s) => (
                <div
                  key={s.key}
                  style={{
                    background: s.color,
                    flexGrow: Number(row[s.key] ?? 0),
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-[var(--muted-ink)]">
        <span>{data[0]?.day.slice(5)}</span>
        <span>{data.at(-1)?.day.slice(5)}</span>
      </div>
    </figure>
  );
}
