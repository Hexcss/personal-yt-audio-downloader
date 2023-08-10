# Use an official Node.js runtime based on Debian
FROM node:19

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install app dependencies
RUN npm install && npm install -g ts-node

# Install ffmpeg on Debian
RUN apt-get update && apt-get install -y ffmpeg

# Copy the rest of the application code into the container
COPY . .

# Specify the command to run when the container starts
CMD [ "ts-node", "src/index.ts" ]

# Expose the port the app will run on
EXPOSE 3000
