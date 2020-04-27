FROM node:lts

RUN mkdir /code
WORKDIR /code
RUN pwd

ADD config ./config
ADD public ./public
ADD src ./src
ADD package.json ./
ADD package.server.json ./
ADD tsconfig.json ./
RUN yarn
RUN yarn buildprod
RUN rm -rf node_modules package.json yarn.lock
RUN mv package.server.json package.json
RUN yarn

RUN ls

CMD ["yarn", "start"]
EXPOSE 1337
