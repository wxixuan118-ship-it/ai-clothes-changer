import {
  FreeToolLanding,
  freeToolMetadata,
} from "@/components/free-tools/free-tool-landing";

export const metadata = freeToolMetadata("nose-shape");

export default function Page() {
  return <FreeToolLanding id="nose-shape" />;
}
