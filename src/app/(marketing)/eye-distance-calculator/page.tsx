import {
  FreeToolLanding,
  freeToolMetadata,
} from "@/components/free-tools/free-tool-landing";

export const metadata = freeToolMetadata("eye-distance");

export default function Page() {
  return <FreeToolLanding id="eye-distance" />;
}
