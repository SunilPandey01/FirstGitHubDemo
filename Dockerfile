#FROM alpine:latest
#FROM alpine:3.15.4
FROM node:20-alpine3.18
RUN apk -U upgrade
RUN sleep 60
RUN whoami
RUN pwd
COPY . /home/node
RUN cd /home/node; \
	npm install

WORKDIR /home/node
CMD node index.js