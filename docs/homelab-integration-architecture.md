# Homelab API Integration Architecture

## Overview

This document outlines the architecture for integrating real homelab services (NAS, servers, IoT devices, etc.) with the homelab management frontend. The system uses a separate API server as a bridge between the frontend and actual hardware/services.

## Architecture Components

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Frontend React    │    │   Homelab API       │    │   Hardware/Services │
│   Application       │◄──►│   Server            │◄──►│   (NAS, Servers,    │
│                     │    │   (Node.js/Python)  │    │   IoT, Docker, etc.) │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

### 1. Frontend (Current Project)
- React application with homelab management UI
- Uses context and hooks for state management
- Communicates with API server via HTTP/WebSocket

### 2. API Server (Separate Project)
- Handles authentication and authorization
- Interfaces with various homelab services
- Provides REST API and WebSocket endpoints
- Implements caching and rate limiting

### 3. Hardware/Services
- NAS systems (Synology, QNAP, TrueNAS)
- Docker containers
- IoT devices (Home Assistant, sensors)
- Network equipment (routers, switches)
- Security cameras and systems

## Integration Methods

### Direct API Integration
- Services with existing APIs (Synology DSM, QNAP, Plex, etc.)
- SSH/CLI commands for system metrics
- SNMP for network devices
- REST APIs for modern IoT devices

### Protocol Support
- **HTTP/HTTPS**: REST APIs
- **SSH**: Command execution
- **SNMP**: Network monitoring
- **MQTT**: IoT device communication
- **WebSocket**: Real-time updates

## API Server Structure

The API server should be organized as follows:

```
homelab-api-server/
├── src/
│   ├── controllers/
│   │   ├── nas.js           # NAS management
│   │   ├── docker.js        # Docker containers
│   │   ├── network.js       # Network devices
│   │   ├── system.js        # System metrics
│   │   └── automation.js    # Home automation
│   ├── services/
│   │   ├── synology.js      # Synology NAS service
│   │   ├── qnap.js          # QNAP NAS service
│   │   ├── docker-api.js    # Docker API service
│   │   └── ssh-client.js    # SSH command service
│   ├── models/
│   │   ├── Device.js        # Device data models
│   │   └── Service.js       # Service data models
│   ├── middleware/
│   │   ├── auth.js          # Authentication
│   │   └── rate-limit.js    # Rate limiting
│   └── routes/
│       ├── api.js           # Main API routes
│       └── websocket.js     # WebSocket handlers
├── config/
│   ├── database.js          # Database configuration
│   └── devices.json         # Device configurations
└── docs/
    ├── api-spec.yaml        # OpenAPI specification
    └── integration-guide.md # Integration documentation
```

## Example Integrations

### 1. Synology NAS Integration
```javascript
// API Server - Synology Service
class SynologyNASService {
  constructor(host, username, password) {
    this.host = host;
    this.auth = { username, password };
    this.sessionId = null;
  }

  async login() {
    const response = await fetch(`${this.host}/webapi/auth.cgi`, {
      method: 'POST',
      body: new URLSearchParams({
        api: 'SYNO.API.Auth',
        version: '3',
        method: 'login',
        account: this.auth.username,
        passwd: this.auth.password,
        session: 'DownloadStation',
        format: 'cookie'
      })
    });
    const data = await response.json();
    this.sessionId = data.data.sid;
  }

  async getStorageInfo() {
    return await this.apiCall('SYNO.Storage.CGI.Storage', 'load_info');
  }

  async getSystemInfo() {
    return await this.apiCall('SYNO.Core.System', 'info');
  }
}
```

### 2. Docker Integration
```javascript
// API Server - Docker Service
class DockerService {
  constructor(socketPath = '/var/run/docker.sock') {
    this.docker = new Docker({ socketPath });
  }

  async listContainers() {
    return await this.docker.listContainers({ all: true });
  }

  async getContainerStats(containerId) {
    const container = this.docker.getContainer(containerId);
    return await container.stats({ stream: false });
  }

  async restartContainer(containerId) {
    const container = this.docker.getContainer(containerId);
    return await container.restart();
  }
}
```

### 3. System Metrics via SSH
```javascript
// API Server - System Metrics Service
class SystemMetricsService {
  constructor(host, username, privateKey) {
    this.ssh = new NodeSSH();
    this.config = { host, username, privateKey };
  }

  async getCPUUsage() {
    await this.ssh.connect(this.config);
    const result = await this.ssh.execCommand('top -bn1 | grep "Cpu(s)"');
    return this.parseCPUUsage(result.stdout);
  }

  async getMemoryUsage() {
    const result = await this.ssh.execCommand('free -m');
    return this.parseMemoryUsage(result.stdout);
  }
}
```

## Configuration Examples

### Device Configuration
```json
{
  "devices": {
    "main-nas": {
      "type": "synology",
      "name": "Main NAS",
      "host": "192.168.1.100",
      "credentials": {
        "username": "admin",
        "password": "env:NAS_PASSWORD"
      },
      "polling_interval": 30000
    },
    "media-server": {
      "type": "docker_host",
      "name": "Media Server",
      "host": "192.168.1.101",
      "ssh": {
        "username": "admin",
        "private_key_path": "/path/to/key"
      }
    },
    "router": {
      "type": "snmp",
      "name": "Main Router",
      "host": "192.168.1.1",
      "community": "public",
      "version": "2c"
    }
  }
}
```

### Environment Variables
```env
# API Server Configuration
PORT=3001
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@localhost/homelab

# Security
JWT_SECRET=your-secret-key
API_KEY=your-api-key

# Device Credentials
NAS_PASSWORD=nas-admin-password
ROUTER_SNMP_COMMUNITY=private-community

# External APIs
PLEX_TOKEN=your-plex-token
HOME_ASSISTANT_TOKEN=your-ha-token
```

## Security Considerations

### 1. Authentication & Authorization
- JWT tokens for API access
- Role-based access control
- API key management for external services

### 2. Network Security
- VPN-only access for remote connections
- Certificate-based authentication
- Rate limiting and DDoS protection

### 3. Credential Management
- Environment variables for sensitive data
- Encrypted credential storage
- Regular credential rotation

## Development Setup

### 1. API Server Setup
```bash
# Clone API server template
git clone https://github.com/your-org/homelab-api-server.git
cd homelab-api-server

# Install dependencies
npm install

# Copy configuration
cp config/devices.example.json config/devices.json
cp .env.example .env

# Start development server
npm run dev
```

### 2. Frontend Configuration
```javascript
// Update homelabApi.js
const API_BASE_URL = process.env.REACT_APP_HOMELAB_API_URL || 'http://localhost:3001/api';
const API_KEY = process.env.REACT_APP_HOMELAB_API_KEY;
```

## Testing Strategy

### 1. Mock Mode (Current)
- Frontend works with mock data
- No external dependencies
- Perfect for development and testing

### 2. Development Mode
- API server with simulated responses
- Some real integrations for testing
- Safe environment for experimentation

### 3. Production Mode
- Full API server deployment
- All services integrated
- Monitoring and alerting enabled

## Deployment Options

### 1. Single Server Deployment
- Frontend and API on same server
- Suitable for small homelabs
- Easier to manage and maintain

### 2. Distributed Deployment
- Frontend on web server
- API server on homelab network
- Better security and performance

### 3. Container Deployment
```yaml
# docker-compose.yml for API server
version: '3.8'
services:
  homelab-api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./config:/app/config
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - homelab-network
```

## Migration Path

### Phase 1: Mock to API
1. Set up basic API server
2. Implement health check endpoints
3. Connect frontend to API server
4. Test with mock data through API

### Phase 2: Add Real Services
1. Integrate Docker API
2. Add system metrics collection
3. Implement NAS connectivity
4. Add network device monitoring

### Phase 3: Advanced Features
1. Real-time WebSocket updates
2. Historical data collection
3. Alerting and notifications
4. Automation rule execution

## Next Steps

1. **Review the API specification** in `docs/api-specification.md`
2. **Check integration examples** for your specific hardware
3. **Set up development environment** following the setup guide
4. **Start with basic integrations** and expand gradually

This architecture ensures your homelab frontend can scale from mock data to full hardware integration while maintaining security and performance.
