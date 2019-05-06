FROM node:carbon

RUN mkdir /code
WORKDIR /code
RUN pwd

ADD public ./public
ADD src ./src
ADD package.json ./
RUN npm install
RUN npm run buildclient

RUN ls

CMD ["npm", "run", "startserver"]
EXPOSE 1337
