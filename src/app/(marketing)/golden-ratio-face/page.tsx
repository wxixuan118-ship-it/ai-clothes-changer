import {
  FreeToolLanding,
  freeToolMetadata,
} from "@/components/free-tools/free-tool-landing";

export const metadata = freeToolMetadata("golden-ratio");

export default function Page() {
  return <FreeToolLanding id="golden-ratio" />;
}
