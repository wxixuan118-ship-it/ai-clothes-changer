import {
  FreeToolLanding,
  freeToolMetadata,
} from "@/components/free-tools/free-tool-landing";

export const metadata = freeToolMetadata("age-calculator");

export default function Page() {
  return <FreeToolLanding id="age-calculator" />;
}
