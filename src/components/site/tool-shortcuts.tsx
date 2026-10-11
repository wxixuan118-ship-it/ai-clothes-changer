import Link from "next/link";

import { toolOrder, tools, type ToolId } from "@/config/tools";

import { toolIcon, toolTint } from "./tool-style";

const short: Record<ToolId, string> = {
  hair: "Hairstyle",
  clothes: "Outfit",
  "face-shape": "Face shape",
  "hairstyle-face-shape": "Cuts for you",
  foundation: "Foundation",
  "body-shape": "Body · Women",
  "body-shape-men": "Body · Men",
};

/** Canva-style row of round tool shortcuts under a hero. */
export function ToolShortcuts() {
  return (
    <ul
      aria-label="StyleMirror tools"
      className="mt-9 flex flex-wrap justify-center gap-x-5 gap-y-5"
    >
      {toolOrder.map((id) => {
        const Icon = toolIcon[id];
        const [bg, fg] = toolTint[id];
        return (
          <li key={id}>
            <Link
              href={id === "hair" ? "/#studio" : tools[id].landing}
              className="group flex w-[92px] flex-col items-center gap-2.5 text-center text-sm leading-tight font-semibold"
            >
              <span
                className="tile size-[60px] rounded-full transition-transform group-hover:-translate-y-0.5"
                style={{ background: bg, color: fg }}
              >
                <Icon className="size-6" aria-hidden />
              </span>
              {short[id]}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
