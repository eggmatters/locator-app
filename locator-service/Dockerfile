FROM node

MAINTAINER Matthew Eggers

ADD . /app/locator-service

WORKDIR /app/locator-service

RUN ["npm", "install"]
CMD ["node", "index.js"]