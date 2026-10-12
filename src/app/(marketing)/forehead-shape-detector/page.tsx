import {
  FreeToolLanding,
  freeToolMetadata,
} from "@/components/free-tools/free-tool-landing";

export const metadata = freeToolMetadata("forehead-shape");

export default function Page() {
  return <FreeToolLanding id="forehead-shape" />;
}
