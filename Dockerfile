FROM node:bullseye
WORKDIR /idea_project_back
COPY package.json .
RUN npm install 
COPY . .
EXPOSE 4000
CMD [ "npm", "run", "dev" ]