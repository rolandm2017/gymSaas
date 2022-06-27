FROM node:16-alpine
COPY . ./app
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
RUN chown -R node /app/node_modules
RUN npm install -g ts-node nodemon
COPY . ./
ENV PORT 8000
EXPOSE $PORT
CMD ["npm", "run", "dev"]