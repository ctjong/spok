FROM node:carbon

RUN mkdir /code
WORKDIR /code
RUN pwd

ADD public ./public
ADD src ./src
ADD package.json ./
RUN npm install
RUN npm run buildprod

RUN ls

CMD ["npm", "start"]
EXPOSE 1337
