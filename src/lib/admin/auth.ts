import { notFound } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { env } from "@/lib/env";

/** Admins are listed by email in ADMIN_EMAILS (verified-or-OAuth accounts). */
export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email) && env.ADMIN_EMAILS.includes(email!.toLowerCase());
}

/**
 * Gate for every admin page and action. Non-admins (and signed-out
 * visitors) get a 404 — the panel's existence isn't advertised.
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session || !isAdminEmail(session.user.email)) notFound();
  return session;
}
