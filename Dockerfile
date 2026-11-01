FROM node:20-alpine AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run lint && npm test && npm run build && npm prune --omit=dev

FROM node:20-alpine AS runtime
ENV NODE_ENV=production PORT=3000 MAZAQ_DATA_DIR=/var/lib/mazaq MAZAQ_UPLOADS_DIR=/var/lib/mazaq/uploads
WORKDIR /app
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
RUN mkdir -p /var/lib/mazaq/uploads && chown -R node:node /app /var/lib/mazaq
USER node
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
