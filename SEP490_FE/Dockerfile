# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (fix rollup native dependencies issue)
RUN rm -f package-lock.json && \
    npm install --silent && \
    npm install @rollup/rollup-linux-x64-musl --optional --silent || echo "Optional rollup binary install attempted" && \
    npm ls rollup || echo "Rollup check completed"

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 