import {
  FreeToolLanding,
  freeToolMetadata,
} from "@/components/free-tools/free-tool-landing";

export const metadata = freeToolMetadata("face-shape-quiz");

export default function Page() {
  return <FreeToolLanding id="face-shape-quiz" />;
}
