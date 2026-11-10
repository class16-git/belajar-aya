# Self-hosting option (ADR-0006). Build: docker build -t atlas .
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile \
 && pnpm --filter @atlas/database generate \
 && NODE_ENV=production pnpm --filter @atlas/web build

FROM base AS run
ENV NODE_ENV=production ATLAS_ENV=production
COPY --from=build /app /app
USER node
EXPOSE 3000
# Run migrations explicitly before starting (see docs/delivery/HANDOVER.md runbook).
CMD ["pnpm", "--filter", "@atlas/web", "start"]
