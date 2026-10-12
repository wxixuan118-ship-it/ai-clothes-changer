import {
  FreeToolLanding,
  freeToolMetadata,
} from "@/components/free-tools/free-tool-landing";

export const metadata = freeToolMetadata("kibbe-types");

export default function Page() {
  return <FreeToolLanding id="kibbe-types" />;
}
