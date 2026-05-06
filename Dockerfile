## Multi-stage Dockerfile to build client and run server
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package manifests first for better caching
COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json ./client/
COPY server/package.json server/package-lock.json ./server/

RUN npm install

# Copy rest of the source
COPY . .

# Build client (and any server build steps)
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built artifacts and server code
COPY --from=builder /app .

# Install production deps
RUN npm install --production

EXPOSE 5000

CMD ["npm", "run", "start"]
