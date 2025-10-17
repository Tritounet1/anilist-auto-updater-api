FROM node:18-slim

RUN apt-get update -y

WORKDIR /api

COPY package*.json ./

RUN npm install

COPY . ./

EXPOSE 3000

CMD ["node", "index.js"]
