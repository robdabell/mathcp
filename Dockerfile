# Runs the mathcp MCP server over stdio. Used by Glama and any MCP client
# that can launch a container, e.g.:  docker run -i --rm mathcp
FROM node:25-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY tsconfig.json ./
COPY src ./src
RUN npm run build:stdio

FROM node:26-alpine
WORKDIR /app
LABEL org.opencontainers.image.source="https://github.com/robdabell/mathcp"
ENV NODE_ENV=production
COPY --from=build /app/dist/stdio.js ./stdio.js
USER node
ENTRYPOINT ["node", "/app/stdio.js"]
