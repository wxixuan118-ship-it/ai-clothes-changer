import Image from "next/image";

export function BeforeAfter({
  name,
  priority = false,
}: {
  name: "bob" | "pixie" | "curls";
  priority?: boolean;
}) {
  const title = {
    bob: "French bob",
    pixie: "Textured pixie",
    curls: "Defined curls",
  }[name];

  return (
    <div className="grid aspect-[2/1] grid-cols-2 overflow-hidden rounded-[16px] bg-[#e9e9e8]">
      {(["before", "after"] as const).map((stage) => (
        <div key={stage} className="relative min-w-0 overflow-hidden">
          <Image
            src={`/hairstyle-transformations/${name}-${stage}.webp`}
            alt={
              stage === "before"
                ? `Before: shoulder-length hair before trying ${title.toLowerCase()}`
                : `After: the same person with ${title.toLowerCase()}`
            }
            fill
            unoptimized
            priority={priority}
            sizes="(min-width: 1024px) 520px, 50vw"
            className="object-cover object-[center_32%]"
          />
          <span className="absolute bottom-3 left-3 bg-black/55 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white sm:bottom-5 sm:left-5 sm:text-sm">
            {stage}
          </span>
        </div>
      ))}
    </div>
  );
}
