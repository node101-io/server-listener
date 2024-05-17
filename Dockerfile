FROM node:20

RUN touch txs.json
RUN touch notifications.json
RUN touch log.txt
RUN touch error.txt

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

CMD ["npm", "start"]