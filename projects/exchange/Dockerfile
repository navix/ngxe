FROM node:20.12.2 as dist
WORKDIR /tmp/
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci --force
COPY projects/exchange/ projects/exchange/
COPY projects/meta/ projects/meta/
RUN npm run exchange:build

FROM node:20.12.2-slim as node_modules
WORKDIR /tmp/
COPY package.json package-lock.json ./
RUN npm install --production --force

FROM node:20.12.2
RUN npm install pm2 -g
RUN mkdir -p /var/app
WORKDIR /var/app
COPY --from=node_modules /tmp/node_modules ./node_modules
COPY --from=dist /tmp/dist/exchange/ ./dist/
COPY projects/exchange/docker-entrypoint.sh ./
EXPOSE 3080
ENTRYPOINT ["./docker-entrypoint.sh"]
