# backend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package.json and lock file
COPY package*.json ./
# COPY pnpm-lock.yaml ./ # If using pnpm

# Install dependencies
RUN npm install --frozen-lockfile # Or yarn install --frozen-lockfile or pnpm install --frozen-lockfile
# RUN pnpm install --frozen-lockfile # If using pnpm

# Copy the rest of your application source code
# .dockerignore will ensure only necessary files are copied here
COPY . .

# Build TypeScript (if applicable)
RUN npm run build # Assuming you have a "build" script in package.json (e.g., tsc)

# --- Production Stage ---
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy only necessary artifacts from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist 
COPY --from=builder /usr/src/app/package.json ./package.json
# Copy Drizzle config and migrations if they are not part of the 'dist'
COPY --from=builder /usr/src/app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /usr/src/app/drizzle ./drizzle 

# Expose port (if your app listens on one)
EXPOSE 3000 

# Command to run your application
CMD ["node", "dist/server.js"] 
