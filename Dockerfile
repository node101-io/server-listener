FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN touch /app/error.txt /app/log.txt /app/notifications.json /app/txs.json
RUN chmod 666 /app/error.txt /app/log.txt /app/notifications.json /app/txs.json

CMD ["npm", "start"]