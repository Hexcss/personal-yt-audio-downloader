# Stage 1: Build
FROM node:21 AS builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:21-slim

# Install ffmpeg on Debian
RUN apt-get update && apt-get install -y ffmpeg && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy only the necessary files from the build stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Set environment variable to disable YTDL update check
ENV YTDL_NO_UPDATE=true

# Specify the command to run when the container starts
CMD [ "node", "dist/index.js" ]

# Expose the port the app will run on
EXPOSE 3000
