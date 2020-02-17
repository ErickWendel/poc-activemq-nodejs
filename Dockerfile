FROM node:10-alpine

RUN apk add --no-cache tzdata

ENV TZ "GMT"

RUN mkdir -p /src

COPY package.json src/package.json

WORKDIR /src

RUN npm install --silent

COPY . /src

CMD npm run prod
