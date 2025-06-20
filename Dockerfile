# Use Node.js LTS Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production --silent

# Copy built application
COPY dist ./dist

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S yapi -u 1001

# Change ownership of app directory
RUN chown -R yapi:nodejs /app
USER yapi

# Expose port (for HTTP mode, optional)
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV YAPI_BASE_URL=""
ENV YAPI_TOKEN=""

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "process.exit(0)" || exit 1

# Default command - stdio mode for MCP
CMD ["node", "dist/index.js"] 