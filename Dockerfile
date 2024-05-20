# AWD Service Dockerfile
FROM node:8.9.3

LABEL maintainer Yogesh Garg <ygarg5@dxc.com>

ENV SECRET = "123456"

## Bundle app source
COPY . /app

# Install app dependencies
RUN cd /app; npm install

# Expose port and run application
EXPOSE  9091
CMD ["node", "/app/src/api.js"]