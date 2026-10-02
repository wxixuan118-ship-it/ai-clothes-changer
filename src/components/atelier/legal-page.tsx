// Shared shell for the legal pages: readable measure, Atelier type.
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto w-full max-w-[760px] px-4 pt-16 pb-24 sm:px-6">
      <p className="eyebrow">Legal</p>
      <h1 className="text-title mt-3">{title}</h1>
      <p className="mt-3 text-sm text-[var(--muted-ink)]">
        Last updated {updated}
      </p>
      <div className="mt-10 space-y-8 leading-relaxed text-[var(--muted-ink)] [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:text-[var(--ink)] [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-3 [&_ul]:mt-3 [&_ul]:space-y-1.5">
        {children}
      </div>
    </article>
  );
}
