# API Server Setup Guide

This guide walks you through creating a separate API server project to bridge your homelab dashboard with real hardware services.

## 🎯 Project Overview

You'll create a separate Node.js API server that:
- Provides REST APIs for your React dashboard
- Integrates with homelab services (NAS, Docker, etc.)
- Handles authentication and security
- Manages real-time WebSocket connections

## 🚀 Quick Start

### 1. Create New Project
```bash
# Create new directory (separate from your React app)
mkdir homelab-api-server
cd homelab-api-server

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express cors helmet morgan dotenv
npm install ws socket.io jsonwebtoken bcryptjs
npm install axios node-cron

# Install development dependencies
npm install -D nodemon jest supertest
```

### 2. Project Structure
```
homelab-api-server/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── nasController.js
│   │   └── dockerController.js
│   ├── services/
│   │   ├── nasService.js
│   │   └── dockerService.js
│   ├── integrations/
│   │   ├── synologyClient.js
│   │   └── dockerClient.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── routes/
│   │   ├── api.js
│   │   └── websocket.js
│   └── app.js
├── config/
│   ├── database.js
│   └── services.json
├── docker-compose.yml
├── .env.example
└── package.json
```

## 🔧 Core Implementation

### 1. Main Application (`src/app.js`)
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const { setupWebSocket } = require('./routes/websocket');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000"
}));
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// WebSocket setup
setupWebSocket(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Homelab API Server running on port ${PORT}`);
});

module.exports = app;
```

### 2. API Routes (`src/routes/api.js`)
```javascript
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const nasController = require('../controllers/nasController');
const dockerController = require('../controllers/dockerController');
const { authenticateToken } = require('../middleware/auth');

// Authentication routes
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refresh);

// Protected routes
router.use(authenticateToken);

// NAS routes
router.get('/nas/storage', nasController.getStorage);
router.get('/nas/system', nasController.getSystemInfo);
router.get('/nas/tasks', nasController.getTasks);

// Docker routes
router.get('/docker/containers', dockerController.getContainers);
router.get('/docker/images', dockerController.getImages);
router.post('/docker/containers/:id/start', dockerController.startContainer);
router.post('/docker/containers/:id/stop', dockerController.stopContainer);

// System routes
router.get('/system/metrics', require('../controllers/systemController').getMetrics);

module.exports = router;
```

### 3. NAS Controller (`src/controllers/nasController.js`)
```javascript
const nasService = require('../services/nasService');

class NASController {
  async getStorage(req, res) {
    try {
      const storageData = await nasService.getStorageInfo();
      res.json({
        success: true,
        data: storageData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('NAS Storage Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch storage information',
        message: error.message
      });
    }
  }

  async getSystemInfo(req, res) {
    try {
      const systemInfo = await nasService.getSystemInfo();
      res.json({
        success: true,
        data: systemInfo,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('NAS System Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch system information'
      });
    }
  }

  async getTasks(req, res) {
    try {
      const tasks = await nasService.getBackgroundTasks();
      res.json({
        success: true,
        data: tasks,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('NAS Tasks Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch background tasks'
      });
    }
  }
}

module.exports = new NASController();
```

### 4. NAS Service (`src/services/nasService.js`)
```javascript
const SynologyClient = require('../integrations/synologyClient');

class NASService {
  constructor() {
    this.client = new SynologyClient({
      host: process.env.NAS_HOST,
      port: process.env.NAS_PORT || 5000,
      username: process.env.NAS_USERNAME,
      password: process.env.NAS_PASSWORD
    });
  }

  async getStorageInfo() {
    await this.client.authenticate();
    
    const [volumes, raids] = await Promise.all([
      this.client.getVolumes(),
      this.client.getRaidInfo()
    ]);

    return {
      volumes: volumes.map(vol => ({
        id: vol.id,
        path: vol.path,
        size: vol.size,
        used: vol.used,
        available: vol.available,
        percentage: Math.round((vol.used / vol.size) * 100),
        status: vol.status
      })),
      raids: raids.map(raid => ({
        id: raid.id,
        name: raid.name,
        status: raid.status,
        level: raid.level,
        size: raid.size,
        health: raid.health
      })),
      summary: {
        totalSpace: volumes.reduce((sum, vol) => sum + vol.size, 0),
        usedSpace: volumes.reduce((sum, vol) => sum + vol.used, 0),
        freeSpace: volumes.reduce((sum, vol) => sum + vol.available, 0)
      }
    };
  }

  async getSystemInfo() {
    await this.client.authenticate();
    
    const [info, utilization] = await Promise.all([
      this.client.getSystemInfo(),
      this.client.getSystemUtilization()
    ]);

    return {
      model: info.model,
      version: info.version,
      uptime: info.uptime,
      temperature: info.temperature,
      cpu: {
        usage: utilization.cpu.usage,
        cores: utilization.cpu.cores
      },
      memory: {
        total: utilization.memory.total,
        used: utilization.memory.used,
        percentage: Math.round((utilization.memory.used / utilization.memory.total) * 100)
      },
      network: utilization.network
    };
  }

  async getBackgroundTasks() {
    await this.client.authenticate();
    const tasks = await this.client.getBackgroundTasks();
    
    return tasks.map(task => ({
      id: task.id,
      type: task.type,
      status: task.status,
      progress: task.progress,
      description: task.description,
      startTime: task.start_time,
      estimatedTime: task.estimated_time
    }));
  }
}

module.exports = new NASService();
```

### 5. Synology Client (`src/integrations/synologyClient.js`)
```javascript
const axios = require('axios');

class SynologyClient {
  constructor(config) {
    this.host = config.host;
    this.port = config.port;
    this.username = config.username;
    this.password = config.password;
    this.baseURL = `https://${this.host}:${this.port}`;
    this.sessionId = null;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false // For self-signed certificates
      })
    });
  }

  async authenticate() {
    if (this.sessionId) return;

    try {
      const response = await this.client.get('/webapi/auth.cgi', {
        params: {
          api: 'SYNO.API.Auth',
          version: '3',
          method: 'login',
          account: this.username,
          passwd: this.password,
          session: 'SurveillanceStation'
        }
      });

      if (response.data.success) {
        this.sessionId = response.data.data.sid;
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Synology auth error:', error);
      throw error;
    }
  }

  async apiRequest(api, method, params = {}) {
    await this.authenticate();
    
    const response = await this.client.get('/webapi/entry.cgi', {
      params: {
        api,
        method,
        version: '1',
        _sid: this.sessionId,
        ...params
      }
    });

    if (!response.data.success) {
      throw new Error(`API Error: ${response.data.error?.code}`);
    }

    return response.data.data;
  }

  async getVolumes() {
    return await this.apiRequest('SYNO.Core.Storage.Volume', 'list');
  }

  async getRaidInfo() {
    return await this.apiRequest('SYNO.Core.Storage.Raid', 'list');
  }

  async getSystemInfo() {
    return await this.apiRequest('SYNO.Core.System', 'info');
  }

  async getSystemUtilization() {
    return await this.apiRequest('SYNO.Core.System.Utilization', 'get');
  }

  async getBackgroundTasks() {
    return await this.apiRequest('SYNO.Core.TaskScheduler', 'list');
  }
}

module.exports = SynologyClient;
```

### 6. WebSocket Real-time Updates (`src/routes/websocket.js`)
```javascript
const nasService = require('../services/nasService');
const dockerService = require('../services/dockerService');

function setupWebSocket(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Start real-time updates for this client
    const updateInterval = setInterval(async () => {
      try {
        // Get real-time data
        const [storageData, systemData] = await Promise.all([
          nasService.getStorageInfo(),
          nasService.getSystemInfo()
        ]);

        // Emit updates
        socket.emit('nas-storage-update', storageData);
        socket.emit('nas-system-update', systemData);
      } catch (error) {
        console.error('WebSocket update error:', error);
        socket.emit('error', { message: 'Failed to fetch updates' });
      }
    }, 5000); // Update every 5 seconds

    // Handle client requests
    socket.on('request-docker-update', async () => {
      try {
        const containers = await dockerService.getContainers();
        socket.emit('docker-containers-update', containers);
      } catch (error) {
        socket.emit('error', { message: 'Failed to fetch Docker data' });
      }
    });

    // Cleanup on disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      clearInterval(updateInterval);
    });
  });
}

module.exports = { setupWebSocket };
```

### 7. Environment Configuration (`.env.example`)
```env
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# NAS Configuration
NAS_HOST=192.168.1.100
NAS_PORT=5000
NAS_USERNAME=your-nas-username
NAS_PASSWORD=your-nas-password

# Docker Configuration
DOCKER_HOST=unix:///var/run/docker.sock
# OR for remote Docker
# DOCKER_HOST=tcp://192.168.1.101:2376

# Database Configuration (if using)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=homelab
DB_USER=homelab_user
DB_PASSWORD=homelab_password

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
```

### 8. Docker Compose Setup (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  homelab-api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock # For Docker integration
    restart: unless-stopped
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: homelab
      POSTGRES_USER: homelab_user
      POSTGRES_PASSWORD: homelab_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  postgres_data:
```

## 🔧 Frontend Integration

### Update Your React App's API Configuration
```javascript
// src/utils/homelabApi.js - Update this file
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';

class HomelabAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.wsURL = WS_URL;
    this.token = localStorage.getItem('homelab_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` })
      },
      ...options
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // NAS methods
  async getNASStorage() {
    return this.request('/nas/storage');
  }

  async getNASSystem() {
    return this.request('/nas/system');
  }

  // WebSocket connection
  connectWebSocket() {
    this.ws = new WebSocket(this.wsURL);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleWebSocketMessage(data);
    };

    return this.ws;
  }
}

export default new HomelabAPI();
```

## 🚀 Running the API Server

### Development
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your actual values

# Start development server
npm run dev
```

### Production with Docker
```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f homelab-api
```

## 🔐 Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use different secrets for development/production
- Rotate JWT secrets regularly

### 2. Network Security
- Run API server on internal network
- Use VPN for remote access
- Implement rate limiting

### 3. Authentication
- Implement proper user roles
- Use short-lived JWT tokens
- Add refresh token rotation

## 📊 Monitoring and Logging

### Add Logging Middleware
```javascript
const morgan = require('morgan');
const winston = require('winston');

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Add to Express app
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
```

## 🎯 Next Steps

1. **Start Simple**: Begin with basic NAS integration
2. **Add Authentication**: Implement JWT-based auth
3. **Expand Services**: Add Docker, Proxmox, etc.
4. **Add Monitoring**: Implement health checks and metrics
5. **Scale Up**: Add database, caching, and clustering

## 🔗 Related Documentation

- [NAS Integration Guide](./nas-integration.md)
- [Docker Integration](./service-integrations/docker.md)
- [Security Best Practices](./security/authentication.md)
- [Deployment Guide](./deployment/production.md)
