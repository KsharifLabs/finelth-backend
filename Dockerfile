# Stage 1: Build
FROM node:18-alpine AS builder

# Add necessary security packages
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

# Add dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/tsconfig.json ./

RUN npm ci

# Install tsconfig-paths to resolve TypeScript path aliases
RUN npm install tsconfig-paths

# Switch to non-root user
USER appuser

# Use dumb-init as entrypoint
ENTRYPOINT ["dumb-init", "--"]

# Use tsconfig-paths to resolve path aliases
CMD ["npm", "run", "dev"]
