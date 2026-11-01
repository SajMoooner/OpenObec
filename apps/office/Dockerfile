FROM node:26.3.1-alpine@sha256:a2dc166a387cc6ca1e62d0c8e265e49ca985d6e60abc9fe6e6c3d6ce8e63f606 AS build
WORKDIR /workspace
RUN npm install --global pnpm@11.25.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages packages
COPY apps apps
RUN pnpm install --frozen-lockfile
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @openobec/office build
FROM node:26.3.1-alpine@sha256:a2dc166a387cc6ca1e62d0c8e265e49ca985d6e60abc9fe6e6c3d6ce8e63f606
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3002
COPY --from=build --chown=node:node /workspace/apps/office/.next/standalone ./
COPY --from=build --chown=node:node /workspace/apps/office/.next/static ./apps/office/.next/static
COPY --from=build --chown=node:node /workspace/apps/office/public ./apps/office/public
USER node
EXPOSE 3002
CMD ["node", "apps/office/server.js"]
