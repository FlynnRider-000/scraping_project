FROM node:14.18 as Builder

RUN apt update && apt install -y libnss3-dev libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev libasound2 xvfb

WORKDIR /appreciate-monorepo/services/scraping-service

COPY package.json package-lock.json tsconfig.json ./

RUN npm ci
RUN npm install -g ts-node

COPY src/ ./src

RUN mkdir /root/.aws
CMD ["npm", "run", "run:all"]