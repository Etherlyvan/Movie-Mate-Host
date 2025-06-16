FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port (sesuai dengan PORT di .env)
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]