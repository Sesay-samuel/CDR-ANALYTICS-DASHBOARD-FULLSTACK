# -----------------------------------------------------
# Stage 1: Install production dependencies
# -----------------------------------------------------

FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy dependency manifests first to improve Docker layer caching
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev


# -----------------------------------------------------
# Stage 2: Production runtime
# -----------------------------------------------------

FROM node:20-alpine AS runtime

# Install available Alpine security updates
RUN apk upgrade --no-cache

WORKDIR /app

# Remove npm tooling from the final runtime image.
# npm is not required because the application runs
# directly with Node.js.
RUN rm -rf /usr/local/lib/node_modules/npm \
    /usr/local/bin/npm \
    /usr/local/bin/npx

# Copy production dependencies from the dependency stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy the backend application source
COPY . .

# Run the application in production mode
ENV NODE_ENV=production

# Document the backend application port
EXPOSE 4000

# Start the backend directly with Node.js
CMD ["node", "server.js"]