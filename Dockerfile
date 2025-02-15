FROM node:bullseye
WORKDIR /war_house_back
COPY package.json .
RUN npm install 
COPY . .
EXPOSE 4000
CMD [ "npm", "run", "dev" ]