import {
  FreeToolLanding,
  freeToolMetadata,
} from "@/components/free-tools/free-tool-landing";

export const metadata = freeToolMetadata("face-rating");

export default function Page() {
  return <FreeToolLanding id="face-rating" />;
}
