import {
  FreeToolLanding,
  freeToolMetadata,
} from "@/components/free-tools/free-tool-landing";

export const metadata = freeToolMetadata("kibbe-test");

export default function Page() {
  return <FreeToolLanding id="kibbe-test" />;
}
