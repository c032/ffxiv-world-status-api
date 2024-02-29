FROM node:lts-alpine

RUN apk add dumb-init

USER node

COPY --chown=node:node ./ /home/node/app/

WORKDIR /home/node/app/

RUN \
  --mount=type=cache,target=/home/node/.npm,uid=1000,mode=755 \
  npm install --ignore-scripts

RUN npm run build

CMD ["dumb-init", "npm", "run", "test:e2e:docker"]
