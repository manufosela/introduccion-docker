FROM node:8
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN ls -l
EXPOSE 3000
CMD [ "node", "index.js" ]
