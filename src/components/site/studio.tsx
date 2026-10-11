import { GenerateForm } from "@/components/generate/generate-form";
import { GENERATION_COST_CREDITS, WELCOME_CREDITS } from "@/config/plans";
import type { GeneratorToolId } from "@/config/tools";
import { getSession } from "@/lib/auth/session";
import { env, features } from "@/lib/env";

// The generator embedded on a landing page: visitors upload and pick a look
// right here; signing up happens in a dialog only when they press the
// action button.
export async function Studio({ tool }: { tool: GeneratorToolId }) {
  const session = await getSession();
  return (
    <div
      id="studio"
      className="card mx-auto mt-10 max-w-6xl scroll-mt-6 p-3 text-left shadow-[0_8px_24px_rgba(14,19,24,0.06)] sm:p-6"
    >
      <GenerateForm
        balance={session?.user.creditBalance ?? 0}
        cost={GENERATION_COST_CREDITS}
        mock={env.AI_MOCK}
        signedIn={Boolean(session)}
        showHistoryLink
        tool={tool}
        auth={{
          providers: features.socialProviders,
          requiresVerification: features.email,
          magicLink: features.email,
          welcomeCredits: WELCOME_CREDITS,
        }}
      />
    </div>
  );
}
