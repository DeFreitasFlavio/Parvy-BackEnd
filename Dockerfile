FROM node:18

WORKDIR /home/node/
USER node

COPY --chown=node:node . .
RUN npm i

EXPOSE 3000
ENTRYPOINT [ "npm", "run", "start" ]
