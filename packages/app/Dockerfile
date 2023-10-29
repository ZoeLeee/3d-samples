FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN pnpm run build:app

FROM nginx
COPY --from=0 /app/dist /usr/share/nginx/html
COPY --from=0 /app/deploy/nginx.conf /etc/nginx/conf.d/default.conf
