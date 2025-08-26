# Step 1: Build the React app with Node 22
FROM node:22-alpine AS build
WORKDIR /app
 
# Copy dependency files and install
COPY package*.json yarn.lock* ./
RUN yarn install --frozen-lockfile
 
# Copy the full source and build
COPY . .
RUN NODE_OPTIONS="--max-old-space-size=4096" yarn build
 
# Step 2: Serve the app with Nginx
FROM nginx:1.23-alpine
 
# Clean default Nginx html folder
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
 
# Copy build artifacts from build stage
COPY --from=build /app/build .
 
# Copy your custom configs
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
 
# Copy prod config as env.js
COPY ./prod-config.js /usr/share/nginx/html/env.js
 
# Expose port
EXPOSE 80
 
# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
