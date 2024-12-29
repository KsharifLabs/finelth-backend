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
FROM node:16-alpine

# Add dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Switch to non-root user
USER appuser

# Use dumb-init as entrypoint
ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/index.js"]
