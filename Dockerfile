FROM node:20

WORKDIR /app

COPY package.json ./
COPY txs.json ./
COPY notifications.json ./
COPY log.txt ./
COPY error.txt ./

RUN npm ci

COPY . .

CMD ["npm", "start"]