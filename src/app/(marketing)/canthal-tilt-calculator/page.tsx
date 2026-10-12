import {
  FreeToolLanding,
  freeToolMetadata,
} from "@/components/free-tools/free-tool-landing";

export const metadata = freeToolMetadata("canthal-tilt");

export default function Page() {
  return <FreeToolLanding id="canthal-tilt" />;
}
