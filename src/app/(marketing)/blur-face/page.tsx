import {
  FreeToolLanding,
  freeToolMetadata,
} from "@/components/free-tools/free-tool-landing";

export const metadata = freeToolMetadata("blur-face");

export default function Page() {
  return <FreeToolLanding id="blur-face" />;
}
