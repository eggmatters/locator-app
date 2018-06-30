FROM node

MAINTAINER Matthew Eggers

ADD . /app/locator-client

WORKDIR /app/locator-client

EXPOSE 3000

RUN npm install -g nodemon
RUN ["npm", "install"]
CMD ["npm", "run", "start"]
