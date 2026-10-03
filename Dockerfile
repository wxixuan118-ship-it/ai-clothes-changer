# Production image for AnySites (and any Docker host).
#
# Dependencies come from pnpm-lock.yaml with --frozen-lockfile, so production
# runs exactly the versions the test suites ran against. (A plain
# `npm install` ignores the pnpm lockfile and resolves newer, untested
# versions — that broke the build once.)
#
# No secrets are needed to build: src/lib/env.ts uses placeholders during
# `next build` and validates the real environment when the server starts.

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm install -g pnpm@10.34.6
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# Fonts for the free-plan watermark: sharp renders SVG text through
# fontconfig, and with no font installed the text silently comes out blank.
RUN apk add --no-cache fontconfig font-dejavu
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs
# Standalone server (includes drizzle/ migrations, applied on start).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Local image storage fallback until object storage is configured.
RUN mkdir -p .generated && chown nextjs:nodejs .generated
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
