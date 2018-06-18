FROM node

MAINTAINER Matthew Eggers

ADD . /app/locator-client

WORKDIR /app/locator-client

RUN npm install -g nodemon
RUN ["npm", "install"]
CMD ["npm", "run", "start"]
