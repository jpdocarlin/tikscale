# Use the official Node.js lightweight image
FROM node:20-alpine

# Create and define the working directory
WORKDIR /usr/src/app

# Copy dependency files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose the port (Cloud Run sets the PORT env variable automatically)
EXPOSE 8080

# Start the application
CMD [ "npm", "start" ]
