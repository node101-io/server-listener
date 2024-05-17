FROM node:20

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN touch txs.json
RUN touch notifications.json
RUN touch log.txt
RUN touch error.txt

RUN npm ci

COPY . .

CMD ["npm", "start"]