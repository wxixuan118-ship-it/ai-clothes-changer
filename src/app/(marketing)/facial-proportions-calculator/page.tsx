import {
  FreeToolLanding,
  freeToolMetadata,
} from "@/components/free-tools/free-tool-landing";

export const metadata = freeToolMetadata("facial-proportions");

export default function Page() {
  return <FreeToolLanding id="facial-proportions" />;
}
