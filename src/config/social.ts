// Social sign-in providers, in display order. Which ones render is decided
// on the server from env (features.socialProviders) and passed down.
export type SocialProvider = "google" | "facebook" | "github";

export const socialLabels: Record<SocialProvider, string> = {
  google: "Google",
  facebook: "Facebook",
  github: "GitHub",
};
