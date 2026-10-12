import {
  FreeToolLanding,
  freeToolMetadata,
} from "@/components/free-tools/free-tool-landing";

export const metadata = freeToolMetadata("blush");

export default function Page() {
  return <FreeToolLanding id="blush" />;
}
