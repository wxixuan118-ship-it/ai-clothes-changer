import {
  FreeToolLanding,
  freeToolMetadata,
} from "@/components/free-tools/free-tool-landing";

export const metadata = freeToolMetadata("eye-shape");

export default function Page() {
  return <FreeToolLanding id="eye-shape" />;
}
