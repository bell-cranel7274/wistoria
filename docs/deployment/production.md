# Production Deployment Guide

This guide covers deploying your homelab dashboard and API server to production.

## 🎯 Deployment Architecture

### Recommended Setup
```
Internet → Reverse Proxy → API Server → Internal Services
     ↓         (nginx)      (Docker)      (NAS, Docker, etc.)
Frontend CDN
(Vercel/Netlify)
```

### Alternative Setup
```
Internet → VPN Gateway → Internal Network
                    ↓
              Load Balancer → API Servers
                    ↓            ↓
                Frontend ← → Database
```

## 🚀 Frontend Deployment

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Build and deploy
npm run build
vercel --prod

# Environment variables in Vercel dashboard
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_WS_URL=wss://api.yourdomain.com
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=build

# Configure environment variables in Netlify dashboard
```

### Option 3: Self-Hosted with nginx
```nginx
# /etc/nginx/sites-available/homelab-frontend
server {
    listen 80;
    server_name homelab.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name homelab.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/homelab.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/homelab.yourdomain.com/privkey.pem;
    
    root /var/www/homelab/build;
    index index.html;
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Optimize static assets
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

## 🐳 API Server Deployment

### Docker Production Setup

#### Dockerfile
```dockerfile
# homelab-api-server/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "src/app.js"]
```

#### Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  homelab-api:
    build: .
    restart: unless-stopped
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - homelab-internal
      - homelab-public
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    
  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/certs:ro
    depends_on:
      - homelab-api
    networks:
      - homelab-public

  postgres:
    image: postgres:15
    restart: unless-stopped
    environment:
      POSTGRES_DB: homelab
      POSTGRES_USER: homelab_user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - homelab-internal
    secrets:
      - db_password

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - homelab-internal

volumes:
  postgres_data:
  redis_data:

networks:
  homelab-internal:
    driver: bridge
    internal: true
  homelab-public:
    driver: bridge

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

#### nginx Configuration
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream api {
        server homelab-api:3001;
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;
    
    server {
        listen 80;
        server_name api.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name api.yourdomain.com;
        
        ssl_certificate /etc/ssl/certs/fullchain.pem;
        ssl_certificate_key /etc/ssl/certs/privkey.pem;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-Content-Type-Options "nosniff";
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
        
        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }
        
        # Auth routes (stricter rate limiting)
        location /api/auth/ {
            limit_req zone=auth burst=5 nodelay;
            
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # WebSocket support
        location /socket.io/ {
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Health check
        location /health {
            proxy_pass http://api;
            access_log off;
        }
    }
}
```

## 🔧 Environment Configuration

### Production Environment Variables
```env
# .env.production
NODE_ENV=production
PORT=3001

# Security
JWT_SECRET=your-super-secure-production-jwt-secret-64-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-equally-strong-and-different
BCRYPT_ROUNDS=12

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=homelab
DB_USER=homelab_user
DB_PASSWORD_FILE=/run/secrets/db_password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# Services
NAS_HOST=192.168.1.100
NAS_PORT=5000
NAS_USERNAME=homelab-api
NAS_PASSWORD_FILE=/run/secrets/nas_password

DOCKER_HOST=unix:///var/run/docker.sock

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
METRICS_PORT=9090

# CORS
FRONTEND_URL=https://homelab.yourdomain.com
```

### Health Check Script
```javascript
// healthcheck.js
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', () => {
  process.exit(1);
});

req.on('timeout', () => {
  req.destroy();
  process.exit(1);
});

req.end();
```

## 📊 Monitoring & Logging

### Prometheus Metrics
```javascript
// Add to your API server
const promClient = require('prom-client');

// Create metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Middleware
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  
  next();
};

app.use(metricsMiddleware);

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(promClient.register.metrics());
});
```

### Structured Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'homelab-api' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: '/var/log/homelab/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: '/var/log/homelab/combined.log' 
    })
  ]
});

module.exports = logger;
```

## 🔄 Backup & Recovery

### Database Backup Script
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/homelab_backup_$TIMESTAMP.sql"

# Create backup
docker exec postgres pg_dump -U homelab_user homelab > "$BACKUP_FILE"

# Compress
gzip "$BACKUP_FILE"

# Keep only last 7 days
find "$BACKUP_DIR" -name "homelab_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

### Automated Backup with Cron
```bash
# Add to crontab
0 2 * * * /opt/homelab/backup.sh
```

### Recovery Procedure
```bash
# Restore from backup
gunzip -c homelab_backup_20231201_020000.sql.gz | \
docker exec -i postgres psql -U homelab_user -d homelab
```

## 🔧 Deployment Scripts

### Deployment Script
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting homelab deployment..."

# Pull latest changes
git pull origin main

# Build and deploy API server
echo "📦 Building API server..."
docker-compose -f docker-compose.prod.yml build

echo "🔄 Updating services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for health check
echo "🔍 Waiting for services to be healthy..."
sleep 30

# Check health
if curl -f http://localhost/health; then
    echo "✅ Deployment successful!"
else
    echo "❌ Deployment failed - rolling back..."
    docker-compose -f docker-compose.prod.yml rollback
    exit 1
fi

echo "🎉 Deployment completed successfully!"
```

### Zero-Downtime Deployment
```bash
#!/bin/bash
# blue-green-deploy.sh

CURRENT=$(docker-compose ps -q homelab-api | head -1)
NEW_VERSION=$1

# Start new version
docker-compose -f docker-compose.prod.yml up -d --scale homelab-api=2

# Wait for new instance to be healthy
sleep 30

# Remove old instance
docker stop $CURRENT
docker rm $CURRENT

echo "Deployment completed with zero downtime"
```

## 📋 Production Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] SSL certificates obtained
- [ ] Database initialized
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Log rotation set up
- [ ] Firewall rules configured
- [ ] Health checks working

### Post-Deployment
- [ ] All services healthy
- [ ] Frontend accessible
- [ ] API endpoints responding
- [ ] WebSocket connections working
- [ ] Metrics collecting
- [ ] Logs being written
- [ ] Backups running
- [ ] SSL certificates valid

### Security Validation
- [ ] Default passwords changed
- [ ] HTTPS enforced
- [ ] Rate limiting active
- [ ] Security headers present
- [ ] Audit logging enabled
- [ ] Access controls working

## 🔗 Related Documentation

- [Security Hardening](../security/README.md) - Production security measures
- [Monitoring Setup](./monitoring.md) - Comprehensive monitoring guide
- [Troubleshooting](./troubleshooting.md) - Common deployment issues
