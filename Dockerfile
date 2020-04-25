FROM node:lts

RUN mkdir /code
WORKDIR /code
RUN pwd

ADD config ./config
ADD public ./public
ADD src ./src
ADD package.json ./
ADD tsconfig.json ./
RUN yarn
RUN yarn buildprod

RUN ls

CMD ["yarn", "start"]
EXPOSE 1337
