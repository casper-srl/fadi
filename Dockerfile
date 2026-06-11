# syntax=docker/dockerfile:1

FROM public.ecr.aws/docker/library/node:24.16-alpine3.24 AS deps
WORKDIR /app

COPY Fadi/package*.json ./
RUN npm ci

FROM public.ecr.aws/docker/library/node:24.16-alpine3.24 AS build
WORKDIR /app

ENV NODE_ENV=production
ENV BUILD_TARGET=docker

COPY --from=deps /app/node_modules ./node_modules
COPY Fadi/ ./
RUN npm run build

FROM public.ecr.aws/docker/library/node:24.16-alpine3.24 AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
RUN chown -R node:node /app

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/').then((res) => process.exit(res.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "./dist/server/entry.mjs"]
