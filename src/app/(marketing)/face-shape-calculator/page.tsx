import {
  FreeToolLanding,
  freeToolMetadata,
} from "@/components/free-tools/free-tool-landing";

export const metadata = freeToolMetadata("face-shape-calculator");

export default function Page() {
  return <FreeToolLanding id="face-shape-calculator" />;
}
