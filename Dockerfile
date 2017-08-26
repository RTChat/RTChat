FROM node:alpine
EXPOSE 9001
ENTRYPOINT [ "node", "server" ]

# Install dependencies
RUN apk update && \
    apk upgrade
RUN apk add git python make g++

# Create app directory
RUN mkdir -p /usr/src/app/dist
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install --only=production

# Bundle app source
COPY app /usr/src/app/app
COPY lib /usr/src/app/lib
COPY server.js /usr/src/app/
COPY index.html /usr/src/app/
COPY webpack.config.js /usr/src/app/

# Build
RUN node_modules/.bin/webpack

