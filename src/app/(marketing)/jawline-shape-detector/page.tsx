import {
  FreeToolLanding,
  freeToolMetadata,
} from "@/components/free-tools/free-tool-landing";

export const metadata = freeToolMetadata("jawline-shape");

export default function Page() {
  return <FreeToolLanding id="jawline-shape" />;
}
