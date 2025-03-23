FROM node:bullseye

WORKDIR /war_house_back

COPY package.json package-lock.json ./

# Install PM2 globally
RUN npm install -g pm2

# Install app dependencies
RUN npm install

# Copy the rest of the code
COPY . .

ARG ENV
ARG PORT_APP
ENV ENV=$ENV
ENV PORT_APP=$PORT_APP

EXPOSE $PORT_APP

CMD if [ "$ENV" = "prod" ]; then \
    pm2-runtime start server.js --name war_house_back; \
    else \
    npm run dev; \
    fi
