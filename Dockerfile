FROM node:22

# Install PM2 and ts-node globally
RUN npm install -g pm2 pm2-runtime ts-node typescript axios

# Create app directory
WORKDIR /app

COPY . /app

# Install dependencies
RUN npm install

# Build TypeScript code
RUN npm run build

# Expose any necessary ports
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV TS_NODE_PROJECT=/app/tsconfig.json
ENV RABBITMQ_URL=amqp://user:password@rabbitmq:5672

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use pm2-runtime to run the application
CMD ["pm2-runtime", "ecosystem.config.js"]

