FROM node:lts

RUN mkdir /code
WORKDIR /code
RUN pwd

ADD config ./config
ADD public ./public
ADD src ./src
ADD package.json ./
ADD tsconfig.json ./
RUN npm install
RUN npm run buildprod

RUN ls

CMD ["npm", "start"]
EXPOSE 1337
