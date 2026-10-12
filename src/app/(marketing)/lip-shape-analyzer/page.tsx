import {
  FreeToolLanding,
  freeToolMetadata,
} from "@/components/free-tools/free-tool-landing";

export const metadata = freeToolMetadata("lip-shape");

export default function Page() {
  return <FreeToolLanding id="lip-shape" />;
}
