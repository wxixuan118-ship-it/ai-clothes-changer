import {
  FreeToolLanding,
  freeToolMetadata,
} from "@/components/free-tools/free-tool-landing";

export const metadata = freeToolMetadata("skin-tone");

export default function Page() {
  return <FreeToolLanding id="skin-tone" />;
}
