import {
  FreeToolLanding,
  freeToolMetadata,
} from "@/components/free-tools/free-tool-landing";

export const metadata = freeToolMetadata("how-old");

export default function Page() {
  return <FreeToolLanding id="how-old" />;
}
