FROM node:latest

RUN apt-get update -y
RUN apt-get upgrade -y

WORKDIR /app

COPY ./start.js start.js
COPY ./package.json package.json
COPY ./package-lock.json package-lock.json

RUN npm ci

CMD [ "npm", "start" ]