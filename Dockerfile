FROM node:18

WORKDIR /war_house_back

# Copie les dépendances
COPY package*.json ./

# Installe TOUT (pm2, dotenv, etc.) en LOCAL
RUN npm install && npm install -g pm2

# Copie le reste
COPY . .

# Env vars
ARG ENV
ARG PORT_APP
ARG MONGO_URL
ARG FRONT_APP_URL
ARG DB_USER
ARG DB_PASS
ARG DB_PORT
ENV ENV=$ENV
ENV PORT_APP=$PORT_APP

EXPOSE $PORT_APP

CMD ["pm2-runtime", "server.js"]