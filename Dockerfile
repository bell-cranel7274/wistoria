# Build stage
FROM node:20-slim as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

RUN npm install --production
RUN npm install -g serve

EXPOSE 4300
CMD ["serve", "-s", "dist", "-p", "4300"]
