FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm config set strict-ssl false
RUN npm install

COPY . .

ENV PORT=8082

EXPOSE 8082

CMD ["npm", "start"]