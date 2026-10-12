import {
  FreeToolLanding,
  freeToolMetadata,
} from "@/components/free-tools/free-tool-landing";

export const metadata = freeToolMetadata("body-type");

export default function Page() {
  return <FreeToolLanding id="body-type" />;
}
