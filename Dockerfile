FROM node:20

WORKDIR /app

COPY package.json yarn.lock ./

RUN npm install --frozen-lockfile

COPY . .

CMD ["npm", "start"]