FROM node

MAINTAINER Matthew Eggers

ADD . /app/locator-service

WORKDIR /app/locator-service

EXPOSE 8080

RUN ["npm", "install"]
CMD ["npm", "run", "start"]