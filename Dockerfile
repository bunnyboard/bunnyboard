FROM node:18

WORKDIR /app

COPY . .

RUN yarn && yarn build
