FROM node:latest

RUN apt-get update
RUN apt-get upgrade

WORKDIR /app

COPY ./start.js start.js
COPY ./package.json package.json
COPY ./package-lock.json package-lock.json

RUN npm ci

CMD [ "node", 'start.js' ]