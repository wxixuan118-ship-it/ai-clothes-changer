import {
  FreeToolLanding,
  freeToolMetadata,
} from "@/components/free-tools/free-tool-landing";

export const metadata = freeToolMetadata("lipstick");

export default function Page() {
  return <FreeToolLanding id="lipstick" />;
}
