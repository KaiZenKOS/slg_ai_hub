FROM node:20-alpine

WORKDIR /app

# Install dependencies first (utilize Docker cache)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the project
COPY . .

EXPOSE 5173

# Run Vite dev server (host binding configured in vite.config.ts)
CMD ["npm", "run", "dev"]
