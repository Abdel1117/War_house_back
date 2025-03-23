FROM node:bullseye

WORKDIR /war_house_back

# Install PM2 globally
RUN npm install -g pm2

# Install app dependencies
COPY package.json .
RUN npm install

# Copy the rest of the code
COPY . .

# Pass env vars
ARG ENV
ARG PORT_APP
ENV ENV=$ENV
ENV PORT_APP=$PORT_APP

# Expose port
EXPOSE $PORT_APP

# Start logic (dev vs prod)
CMD if [ "$ENV" = "prod" ]; then \
    ./node_modules/.bin/pm2-runtime start server.js --name war_house_back; \
    else \
    npm run dev; \
    fi
