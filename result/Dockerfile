FROM node:18-slim

# add curl for healthcheck
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl tini && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/local/app

# have nodemon available for local dev use (file watching)
RUN npm install -g nodemon

COPY package*.json ./

RUN npm ci && \
 npm cache clean --force && \
 mv /usr/local/app/node_modules /node_modules

# Copy HTML/UI files first to a separate location
COPY ./views/index.html /tmp/index.html
# Force a refresh every build by adding a comment with current date
RUN date > /tmp/builddate && cat /tmp/builddate >> /tmp/index.html && mkdir -p /usr/local/app/views/ && cp /tmp/index.html /usr/local/app/views/

# Copy everything else
COPY . .

ENV PORT=80
EXPOSE 80

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]
