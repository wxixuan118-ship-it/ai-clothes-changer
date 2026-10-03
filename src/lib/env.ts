import { z } from "zod";

/**
 * Environment validation — the only place `process.env` is read.
 *
 * Server-only: importing this from a client component will leak nothing (the
 * parse throws on the server at build/boot), but don't do it. Client code
 * that needs a NEXT_PUBLIC_* var must reference
 * `process.env.NEXT_PUBLIC_...` literally so Next.js can inline it at build.
 *
 * Empty strings are treated as unset, so a copied .env.example with blank
 * values behaves the same as missing vars. Every variable is documented in
 * .env.example.
 */

const STRIPE_VARS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_PRO_MONTHLY",
  "STRIPE_PRICE_ULTRA_MONTHLY",
  "STRIPE_PRICE_TOPUP_100",
] as const;

const S3_VARS = [
  "S3_ENDPOINT",
  "S3_REGION",
  "S3_BUCKET",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
] as const;

const schema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // ── Database ──────────────────────────────────────────────────────────
    DATABASE_URL: z
      .url("DATABASE_URL must be a valid URL")
      .refine((v) => /^postgres(ql)?:\/\//.test(v), {
        message: "DATABASE_URL must be a postgres:// or postgresql:// URL",
      }),

    // ── Better Auth ───────────────────────────────────────────────────────
    BETTER_AUTH_SECRET: z
      .string()
      .min(32, "min 32 chars — generate with `openssl rand -base64 32`"),
    BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
    /** Public canonical origin (sitemap, OG, canonical tags). Defaults to
     *  BETTER_AUTH_URL — set it when the two differ (e.g. www vs apex). */
    SITE_URL: z.url().optional(),

    // ── OAuth (optional — a missing pair hides that login button) ─────────
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    // Facebook Login: https://developers.facebook.com/apps
    //   Valid OAuth Redirect URI: {BETTER_AUTH_URL}/api/auth/callback/facebook
    FACEBOOK_CLIENT_ID: z.string().optional(),
    FACEBOOK_CLIENT_SECRET: z.string().optional(),

    // ── Email via Resend (optional — emails no-op without it) ─────────────
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z
      .string()
      .default("AI Clothes Changer <onboarding@resend.dev>"),

    // ── Stripe ────────────────────────────────────────────────────────────
    // Optional in development so a fresh clone boots without a Stripe
    // account (features.billing turns off). Required in production —
    // enforced in superRefine below.
    STRIPE_SECRET_KEY: z
      .string()
      .startsWith("sk_", "expected a Stripe secret key (sk_...)")
      .optional(),
    STRIPE_WEBHOOK_SECRET: z
      .string()
      .startsWith("whsec_", "expected a webhook signing secret (whsec_...)")
      .optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
      .string()
      .startsWith("pk_", "expected a Stripe publishable key (pk_...)")
      .optional(),
    STRIPE_PRICE_PRO_MONTHLY: priceId(),
    STRIPE_PRICE_ULTRA_MONTHLY: priceId(),
    STRIPE_PRICE_TOPUP_100: priceId(),

    // ── AI generation ─────────────────────────────────────────────────────
    AI_GATEWAY_API_KEY: z.string().optional(),
    AI_IMAGE_MODEL: z
      .string()
      .regex(/^[\w.-]+\/[\w.:-]+$/, 'expected "provider/model" format')
      .default("openai/gpt-image-1"),
    AI_MOCK: stringBool(),
    // Alibaba Cloud Model Studio (DashScope) image editing — the provider for
    // both the hairstyle and clothes changers when the key is set. Keys are
    // per region: a Singapore key needs the international base URL.
    DASHSCOPE_API_KEY: z.string().optional(),
    DASHSCOPE_BASE_URL: z
      .url()
      .default("https://dashscope-intl.aliyuncs.com")
      .transform((url) => url.replace(/\/+$/, "")),
    AI_EDIT_MODEL: z.string().default("qwen-image-edit-plus"),

    // ── Rate limiting via Upstash (optional — in-memory fallback) ─────────
    UPSTASH_REDIS_REST_URL: z.url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

    // ── Storage via Vercel Blob (optional — ./.generated fallback in dev) ─
    BLOB_READ_WRITE_TOKEN: z.string().optional(),

    // ── Storage via S3-compatible object storage (AnySites / DO Spaces) ───
    // Objects are private; /api/images serves them to their owner only.
    S3_ENDPOINT: z.url().optional(),
    S3_REGION: z.string().optional(),
    S3_BUCKET: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    const pairs = [
      ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
      ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
      ["FACEBOOK_CLIENT_ID", "FACEBOOK_CLIENT_SECRET"],
      ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
    ] as const;
    for (const [a, b] of pairs) {
      if (Boolean(env[a]) !== Boolean(env[b])) {
        ctx.addIssue({
          code: "custom",
          path: [env[a] ? b : a],
          message: `set both ${a} and ${b}, or neither`,
        });
      }
    }
    const s3Set = S3_VARS.filter((key) => env[key]);
    if (s3Set.length > 0 && s3Set.length < S3_VARS.length) {
      for (const key of S3_VARS.filter((k) => !env[k])) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: `set all of ${S3_VARS.join(", ")}, or none`,
        });
      }
    }
    if (env.NODE_ENV === "production") {
      for (const key of STRIPE_VARS) {
        if (!env[key]) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: "required in production (optional in development)",
          });
        }
      }
      if (env.AI_MOCK) {
        ctx.addIssue({
          code: "custom",
          path: ["AI_MOCK"],
          message:
            "must not be enabled in production — it returns placeholder images while still charging credits",
        });
      }
    }
  });

function priceId() {
  return z
    .string()
    .startsWith(
      "price_",
      "expected a Stripe Price ID (price_...), not a Product ID (prod_...)",
    )
    .optional();
}

function stringBool() {
  return z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true");
}

export type Env = z.infer<typeof schema>;

/** Exported for tests. App code uses the `env` singleton below. */
export function parseEnv(raw: Record<string, string | undefined>): Env {
  // Blank values in .env behave as unset.
  const cleaned = Object.fromEntries(
    Object.entries(raw).filter(([, v]) => v !== ""),
  );
  const parsed = schema.safeParse(cleaned);
  if (!parsed.success) {
    const lines = parsed.error.issues.map(
      (issue) => `  - ${issue.path.join(".") || "(env)"}: ${issue.message}`,
    );
    throw new Error(
      [
        "Invalid environment variables:",
        ...lines,
        "Fix your .env — every variable is documented in .env.example.",
      ].join("\n"),
    );
  }
  return parsed.data;
}

// `next build` imports server modules to collect page data, but container
// builds (e.g. AnySites' Docker build) don't receive runtime secrets. During
// the build only, fall back to inert placeholders instead of failing. The
// real values are validated strictly when the server starts: production
// boot runs src/instrumentation.ts, which loads this module before the first
// request — a missing variable stops the server with this file's message.
const BUILD_PLACEHOLDERS = {
  DATABASE_URL: "postgres://build:build@127.0.0.1:5432/build",
  BETTER_AUTH_SECRET: "build-time-placeholder-never-used-at-runtime",
} as const;

/** Exported for tests. */
export function parseEnvForBuild(raw: Record<string, string | undefined>): Env {
  try {
    return parseEnv(raw);
  } catch {
    console.warn(
      "[env] building without runtime environment variables — using placeholders; they are validated when the server starts",
    );
    const set = Object.fromEntries(
      Object.entries(raw).filter(([, value]) => value),
    );
    // "test" skips the production-only requirements (Stripe keys) for the
    // build pass; NODE_ENV itself is restored below.
    const parsed = parseEnv({
      ...BUILD_PLACEHOLDERS,
      ...set,
      NODE_ENV: "test",
    });
    return { ...parsed, NODE_ENV: "production" };
  }
}

export const env: Env =
  process.env.NEXT_PHASE === "phase-production-build"
    ? parseEnvForBuild(process.env)
    : parseEnv(process.env);

/** Exported for tests. App code uses the `features` singleton below. */
export function deriveFeatures(e: Env) {
  return {
    /**
     * Checkout, customer portal, and the Stripe webhook are wired. Off (only
     * possible outside production): billing UI renders a setup card and
     * checkout/portal actions throw a clear "Stripe is not configured" error.
     */
    billing: STRIPE_VARS.every((key) => Boolean(e[key])),
    /** Show the "Continue with Google" button. */
    googleOAuth: Boolean(e.GOOGLE_CLIENT_ID),
    /** Show the "Continue with GitHub" button. */
    githubOAuth: Boolean(e.GITHUB_CLIENT_ID),
    /** Show the "Continue with Facebook" button. */
    facebookOAuth: Boolean(e.FACEBOOK_CLIENT_ID),
    /** Configured social sign-in providers, in display order. */
    socialProviders: (
      [
        ["google", e.GOOGLE_CLIENT_ID],
        ["facebook", e.FACEBOOK_CLIENT_ID],
        ["github", e.GITHUB_CLIENT_ID],
      ] as const
    )
      .filter(([, id]) => Boolean(id))
      .map(([provider]) => provider),
    /** Send real emails (magic links require this). */
    email: Boolean(e.RESEND_API_KEY),
    /** Distributed rate limiting; otherwise per-instance in-memory. */
    redisRateLimit: Boolean(e.UPSTASH_REDIS_REST_URL),
    /** Store generated images in Vercel Blob; otherwise ./.generated (dev). */
    blobStorage: Boolean(e.BLOB_READ_WRITE_TOKEN),
    /** Real image editing via DashScope; otherwise AI Gateway (no try-on). */
    dashscope: Boolean(e.DASHSCOPE_API_KEY),
    /** Some provider can actually edit a person photo (mock counts in dev). */
    imageEditing: e.AI_MOCK || Boolean(e.DASHSCOPE_API_KEY),
    /** Private S3-compatible storage; takes precedence over Blob/local. */
    s3Storage: S3_VARS.every((key) => Boolean(e[key])),
  } as const;
}

export const features = deriveFeatures(env);

/** Which Stripe vars are unset — drives the billing setup card in dev. */
export function missingBillingEnv(e: Env = env): string[] {
  return STRIPE_VARS.filter((key) => !e[key]);
}
